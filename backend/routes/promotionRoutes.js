const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/promotionController');

// Público
router.get('/active', getActivePromotions);

// Admin
router.get('/', protect, requireAdmin, getAllPromotions);
router.post('/', protect, requireAdmin, createPromotion);
router.put('/:id', protect, requireAdmin, updatePromotion);
router.delete('/:id', protect, requireAdmin, deletePromotion);

module.exports = router;