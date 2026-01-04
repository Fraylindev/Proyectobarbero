const express = require('express');
const router = express.Router();
const { protectClient } = require('../middleware/auth');
const {
  registerClient,
  loginClient,
  getClientProfile,
  updateClientProfile
} = require('../controllers/clientController');

// Rutas públicas
router.post('/register', registerClient);
router.post('/login', loginClient);

// Rutas protegidas
router.get('/me', protectClient, getClientProfile);
router.put('/profile', protectClient, updateClientProfile);

module.exports = router;