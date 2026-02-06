const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getBargains,
  acceptBargain,
  rejectBargain,
  counterBargain
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize only sellers
router.use(protect);
router.use(authorize('seller'));

// Product routes
router.route('/products')
  .get(getProducts)
  .post(createProduct);

router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Bargain routes
router.get('/bargains', getBargains);
router.put('/bargains/:id/accept', acceptBargain);
router.put('/bargains/:id/reject', rejectBargain);
router.put('/bargains/:id/counter', counterBargain);

module.exports = router;
