const Product = require('../models/Product');
const Bargain = require('../models/Bargain');
const Order = require('../models/Order');
const { validateBuyerOffer, shouldAutoAccept, calculateExpiryDate } = require('../utils/validation');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', stock: { $gt: 0 } })
      .populate('category', 'name')
      .populate('seller', 'name')
      .select('-sellerMinPrice'); // Hide seller's minimum price from buyers

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('seller', 'name')
      .select('-sellerMinPrice');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create bargain
// @route   POST /api/bargains
// @access  Private/Buyer
exports.createBargain = async (req, res) => {
  try {
    const { productId, offerAmount } = req.body;

    // Validate offer
    const validation = await validateBuyerOffer(productId, offerAmount);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }

    const product = validation.product;

    // Check if buyer already has an active bargain for this product
    const existingBargain = await Bargain.findOne({
      product: productId,
      buyer: req.user.id,
      status: { $in: ['pending', 'countered'] }
    });

    if (existingBargain) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active bargain for this product'
      });
    }

    // Check if product has sufficient stock
    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock'
      });
    }

    // Check if should auto-accept
    const autoAccept = await shouldAutoAccept(productId, offerAmount);

    const bargain = await Bargain.create({
      product: productId,
      buyer: req.user.id,
      seller: product.seller,
      currentOffer: offerAmount,
      status: autoAccept ? 'accepted' : 'pending',
      attemptCount: 1,
      maxAttempts: parseInt(process.env.MAX_BARGAIN_ATTEMPTS) || 5,
      expiresAt: calculateExpiryDate(),
      offerHistory: [{
        offeredBy: 'buyer',
        amount: offerAmount
      }]
    });

    await bargain.populate('product', 'name displayPrice');
    await bargain.populate('seller', 'name');

    res.status(201).json({
      success: true,
      data: bargain,
      message: autoAccept ? 'Offer automatically accepted!' : 'Bargain created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get buyer bargains
// @route   GET /api/bargains/my-bargains
// @access  Private/Buyer
exports.getMyBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find({ buyer: req.user.id })
      .populate('product', 'name displayPrice images')
      .populate('seller', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bargains.length,
      data: bargains
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Counter seller offer
// @route   PUT /api/bargains/:id/counter
// @access  Private/Buyer
exports.counterOffer = async (req, res) => {
  try {
    const { counterOffer } = req.body;
    const bargain = await Bargain.findById(req.params.id).populate('product');

    if (!bargain) {
      return res.status(404).json({
        success: false,
        error: 'Bargain not found'
      });
    }

    // Check buyer ownership
    if (bargain.buyer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if bargain is in valid state
    if (bargain.status !== 'countered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot counter this bargain'
      });
    }

    // Check if expired
    if (bargain.isExpired()) {
      bargain.status = 'expired';
      await bargain.save();
      return res.status(400).json({
        success: false,
        error: 'Bargain has expired'
      });
    }

    // Check max attempts
    if (bargain.hasReachedMaxAttempts()) {
      bargain.status = 'expired';
      await bargain.save();
      return res.status(400).json({
        success: false,
        error: 'Maximum bargaining attempts reached'
      });
    }

    // Validate counter offer
    const validation = await validateBuyerOffer(bargain.product._id, counterOffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }

    // Check if should auto-accept
    const autoAccept = await shouldAutoAccept(bargain.product._id, counterOffer);

    // Update bargain
    bargain.currentOffer = counterOffer;
    bargain.status = autoAccept ? 'accepted' : 'pending';
    bargain.attemptCount += 1;
    bargain.offerHistory.push({
      offeredBy: 'buyer',
      amount: counterOffer
    });
    bargain.updatedAt = Date.now();

    await bargain.save();

    res.status(200).json({
      success: true,
      data: bargain,
      message: autoAccept ? 'Offer automatically accepted!' : 'Counter offer submitted'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private/Buyer
exports.createOrder = async (req, res) => {
  try {
    const { bargainId, quantity } = req.body;

    const bargain = await Bargain.findById(bargainId).populate('product');

    if (!bargain) {
      return res.status(404).json({
        success: false,
        error: 'Bargain not found'
      });
    }

    // Check buyer ownership
    if (bargain.buyer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if bargain is accepted
    if (bargain.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Bargain must be accepted before creating an order'
      });
    }

    // Check stock availability
    if (bargain.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user.id,
      seller: bargain.seller,
      product: bargain.product._id,
      bargain: bargainId,
      finalPrice: bargain.currentOffer,
      quantity: quantity || 1
    });

    // Update product stock
    bargain.product.stock -= quantity || 1;
    await bargain.product.save();

    await order.populate('product', 'name images');
    await order.populate('seller', 'name');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
