/**
 * RUTAS DE PAGOS
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTodayEarnings,
  getMonthEarnings,
  getPaymentHistory,
  getMonthlyStats,
  getTopServices
} = require('../controllers/payment_controller');

// Todas las rutas de pagos requieren autenticación
router.use(protect);

router.get('/today', getTodayEarnings);
router.get('/month', getMonthEarnings);
router.get('/history', getPaymentHistory);
router.get('/monthly-stats', getMonthlyStats);
router.get('/top-services', getTopServices);

module.exports = router;