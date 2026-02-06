const express = require('express');
const {
  getProducts,
  getProduct,
  createBargain,
  getMyBargains,
  counterOffer,
  createOrder
} = require('../controllers/buyerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public product routes
router.get('/products', getProducts);
router.get('/products/:id', getProduct);

// Protected buyer routes
router.post('/bargains', protect, authorize('buyer'), createBargain);
router.get('/bargains/my-bargains', protect, authorize('buyer'), getMyBargains);
router.put('/bargains/:id/counter', protect, authorize('buyer'), counterOffer);
router.post('/orders', protect, authorize('buyer'), createOrder);

module.exports = router;
