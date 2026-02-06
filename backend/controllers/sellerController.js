const Product = require('../models/Product');
const Bargain = require('../models/Bargain');
const { validateSellerCounter, shouldAutoAccept, calculateExpiryDate } = require('../utils/validation');

// @desc    Get seller products
// @route   GET /api/seller/products
// @access  Private/Seller
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate('category', 'name');

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

// @desc    Create product
// @route   POST /api/seller/products
// @access  Private/Seller
exports.createProduct = async (req, res) => {
  try {
    req.body.seller = req.user.id;
    
    const product = await Product.create(req.body);

    res.status(201).json({
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

// @desc    Update product
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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

// @desc    Delete product
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Check for active bargains
    const activeBargains = await Bargain.countDocuments({
      product: req.params.id,
      status: { $in: ['pending', 'countered'] }
    });

    if (activeBargains > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product with active bargains'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get seller bargains
// @route   GET /api/seller/bargains
// @access  Private/Seller
exports.getBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find({ seller: req.user.id })
      .populate('product', 'name displayPrice')
      .populate('buyer', 'name email')
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

// @desc    Accept bargain
// @route   PUT /api/seller/bargains/:id/accept
// @access  Private/Seller
exports.acceptBargain = async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id).populate('product');

    if (!bargain) {
      return res.status(404).json({
        success: false,
        error: 'Bargain not found'
      });
    }

    // Check seller ownership
    if (bargain.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if already processed
    if (bargain.status !== 'pending' && bargain.status !== 'countered') {
      return res.status(400).json({
        success: false,
        error: 'Bargain already processed'
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

    bargain.status = 'accepted';
    bargain.updatedAt = Date.now();
    await bargain.save();

    res.status(200).json({
      success: true,
      data: bargain
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject bargain
// @route   PUT /api/seller/bargains/:id/reject
// @access  Private/Seller
exports.rejectBargain = async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);

    if (!bargain) {
      return res.status(404).json({
        success: false,
        error: 'Bargain not found'
      });
    }

    // Check seller ownership
    if (bargain.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if already processed
    if (bargain.status !== 'pending' && bargain.status !== 'countered') {
      return res.status(400).json({
        success: false,
        error: 'Bargain already processed'
      });
    }

    bargain.status = 'rejected';
    bargain.updatedAt = Date.now();
    await bargain.save();

    res.status(200).json({
      success: true,
      data: bargain
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Counter bargain offer
// @route   PUT /api/seller/bargains/:id/counter
// @access  Private/Seller
exports.counterBargain = async (req, res) => {
  try {
    const { counterOffer } = req.body;
    const bargain = await Bargain.findById(req.params.id).populate('product');

    if (!bargain) {
      return res.status(404).json({
        success: false,
        error: 'Bargain not found'
      });
    }

    // Check seller ownership
    if (bargain.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if already processed
    if (bargain.status !== 'pending' && bargain.status !== 'countered') {
      return res.status(400).json({
        success: false,
        error: 'Bargain already processed'
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
    const validation = await validateSellerCounter(bargain.product._id, counterOffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }

    // Update bargain
    bargain.currentOffer = counterOffer;
    bargain.status = 'countered';
    bargain.attemptCount += 1;
    bargain.offerHistory.push({
      offeredBy: 'seller',
      amount: counterOffer
    });
    bargain.updatedAt = Date.now();

    await bargain.save();

    res.status(200).json({
      success: true,
      data: bargain
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
