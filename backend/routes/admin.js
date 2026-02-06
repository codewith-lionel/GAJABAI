const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  updateProductPricing,
  getBargainAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Category routes
router.route('/categories')
  .get(getCategories)
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Product routes
router.get('/products', getProducts);
router.put('/products/:id/pricing', updateProductPricing);

// Analytics routes
router.get('/bargains/analytics', getBargainAnalytics);

module.exports = router;
