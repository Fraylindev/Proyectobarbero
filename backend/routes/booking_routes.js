/**
 * RUTAS DE RESERVAS
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createBooking,
  confirmBooking,
  rejectBooking,
  getMyBookings,
  completeBooking,
  cancelBooking
} = require('../controllers/booking_controller');

// Rutas públicas
router.post('/', createBooking);
router.put('/confirm/:token', confirmBooking);
router.put('/reject/:token', rejectBooking);

// Rutas protegidas (profesionales)
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;