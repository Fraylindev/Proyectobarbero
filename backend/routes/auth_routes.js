/**
 * RUTAS DE AUTENTICACIÓN
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  unifiedLogin,
  refreshAccessToken,
  logout,
  getMe,
  changePassword
} = require('../controllers/auth_controller');

// Rutas públicas
router.post('/login', login);
router.post('/unified-login', unifiedLogin);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;