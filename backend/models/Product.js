const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  
  // Admin-controlled pricing
  adminMinPrice: {
    type: Number,
    required: [true, 'Admin minimum price is required']
  },
  adminMaxPrice: {
    type: Number,
    required: [true, 'Admin maximum price is required']
  },
  bargainingEnabled: {
    type: Boolean,
    default: true
  },
  
  // Seller pricing
  displayPrice: {
    type: Number,
    required: [true, 'Display price is required']
  },
  sellerMinPrice: {
    type: Number,
    required: [true, 'Seller minimum price is required']
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validation middleware
productSchema.pre('save', function(next) {
  // Validate seller pricing against admin limits
  if (this.displayPrice < this.adminMinPrice || this.displayPrice > this.adminMaxPrice) {
    return next(new Error('Display price must be within admin price limits'));
  }
  
  if (this.sellerMinPrice < this.adminMinPrice) {
    return next(new Error('Seller minimum price cannot be less than admin minimum price'));
  }
  
  if (this.sellerMinPrice > this.displayPrice) {
    return next(new Error('Seller minimum price cannot exceed display price'));
  }
  
  if (this.adminMinPrice > this.adminMaxPrice) {
    return next(new Error('Admin minimum price cannot exceed maximum price'));
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
