const mongoose = require('mongoose');

const bargainSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  offerHistory: [{
    offeredBy: {
      type: String,
      enum: ['buyer', 'seller'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  currentOffer: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'countered'],
    default: 'pending'
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  expiresAt: {
    type: Date,
    required: true
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

// Check if bargain is expired
bargainSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if max attempts reached
bargainSchema.methods.hasReachedMaxAttempts = function() {
  return this.attemptCount >= this.maxAttempts;
};

module.exports = mongoose.model('Bargain', bargainSchema);
