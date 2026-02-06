const Product = require('../models/Product');

// Validate buyer offer
exports.validateBuyerOffer = async (productId, offerAmount) => {
  const product = await Product.findById(productId);
  
  if (!product) {
    return { valid: false, message: 'Product not found' };
  }
  
  if (!product.bargainingEnabled) {
    return { valid: false, message: 'Bargaining is not enabled for this product' };
  }
  
  if (offerAmount < product.adminMinPrice) {
    return { valid: false, message: `Offer must be at least ${product.adminMinPrice}` };
  }
  
  if (offerAmount > product.displayPrice) {
    return { valid: false, message: `Offer cannot exceed display price of ${product.displayPrice}` };
  }
  
  return { valid: true, product };
};

// Validate seller counter offer
exports.validateSellerCounter = async (productId, counterAmount) => {
  const product = await Product.findById(productId);
  
  if (!product) {
    return { valid: false, message: 'Product not found' };
  }
  
  if (counterAmount < product.sellerMinPrice) {
    return { valid: false, message: `Counter offer must be at least ${product.sellerMinPrice}` };
  }
  
  if (counterAmount > product.displayPrice) {
    return { valid: false, message: `Counter offer cannot exceed display price of ${product.displayPrice}` };
  }
  
  return { valid: true, product };
};

// Check if offer should be auto-accepted
exports.shouldAutoAccept = async (productId, offerAmount) => {
  const product = await Product.findById(productId);
  
  if (!product) {
    return false;
  }
  
  return offerAmount >= product.sellerMinPrice;
};

// Calculate bargain expiry date
exports.calculateExpiryDate = () => {
  const hours = parseInt(process.env.BARGAIN_EXPIRY_HOURS) || 24;
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
};
