/**
 * RUTAS DE PROFESIONALES
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProfessionals,
  getProfessionalById,
  toggleAvailability,
  getAvailableSlots,
  createSchedule,
  blockTime,
  removeBlockedTime
} = require('../controllers/professional_controller');

// Rutas públicas
router.get('/', getAllProfessionals);
router.get('/:id', getProfessionalById);
router.get('/:id/available-slots', getAvailableSlots);

// Rutas protegidas
router.put('/availability', protect, toggleAvailability);
router.post('/schedule', protect, createSchedule);
router.post('/block-time', protect, blockTime);
router.delete('/block-time/:id', protect, removeBlockedTime);

module.exports = router;