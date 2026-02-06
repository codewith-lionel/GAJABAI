const Category = require('../models/Category');
const Product = require('../models/Product');
const Bargain = require('../models/Bargain');

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    await category.deleteOne();

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

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name email')
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

// @desc    Update product pricing (admin)
// @route   PUT /api/admin/products/:id/pricing
// @access  Private/Admin
exports.updateProductPricing = async (req, res) => {
  try {
    const { adminMinPrice, adminMaxPrice, bargainingEnabled } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Validate admin price range
    if (adminMinPrice > adminMaxPrice) {
      return res.status(400).json({
        success: false,
        error: 'Admin minimum price cannot exceed maximum price'
      });
    }
    
    product.adminMinPrice = adminMinPrice;
    product.adminMaxPrice = adminMaxPrice;
    product.bargainingEnabled = bargainingEnabled !== undefined ? bargainingEnabled : product.bargainingEnabled;
    
    // Validate seller prices against new admin limits
    if (product.displayPrice < adminMinPrice || product.displayPrice > adminMaxPrice) {
      return res.status(400).json({
        success: false,
        error: 'Current display price is outside new admin limits. Seller must update pricing.'
      });
    }
    
    await product.save();

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

// @desc    Get bargaining analytics
// @route   GET /api/admin/bargains/analytics
// @access  Private/Admin
exports.getBargainAnalytics = async (req, res) => {
  try {
    const totalBargains = await Bargain.countDocuments();
    const acceptedBargains = await Bargain.countDocuments({ status: 'accepted' });
    const rejectedBargains = await Bargain.countDocuments({ status: 'rejected' });
    const pendingBargains = await Bargain.countDocuments({ status: 'pending' });
    const expiredBargains = await Bargain.countDocuments({ status: 'expired' });

    // Get average discount offered
    const bargains = await Bargain.find({ status: 'accepted' }).populate('product');
    let totalDiscount = 0;
    
    bargains.forEach(bargain => {
      if (bargain.product) {
        const discount = ((bargain.product.displayPrice - bargain.currentOffer) / bargain.product.displayPrice) * 100;
        totalDiscount += discount;
      }
    });
    
    const avgDiscount = bargains.length > 0 ? (totalDiscount / bargains.length).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBargains,
        acceptedBargains,
        rejectedBargains,
        pendingBargains,
        expiredBargains,
        avgDiscountPercentage: avgDiscount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
