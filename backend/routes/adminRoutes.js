const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const {
  createProfessional,
  getAllProfessionalsAdmin,
  updateProfessional,
  deleteProfessional,
  resetProfessionalPassword
} = require('../controllers/adminController');

// Todas las rutas requieren ser PROFESSIONAL_ADMIN
router.use(protect, requireAdmin);

router.post('/professionals', createProfessional);
router.get('/professionals', getAllProfessionalsAdmin);
router.put('/professionals/:id', updateProfessional);
router.delete('/professionals/:id', deleteProfessional);
router.post('/professionals/:id/reset-password', resetProfessionalPassword);

module.exports = router;