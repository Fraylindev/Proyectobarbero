/**
 * RUTAS DE SERVICIOS
 */

const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById
} = require('../controllers/service_controller');

// Rutas públicas
router.get('/', getAllServices);
router.get('/:id', getServiceById);

module.exports = router;