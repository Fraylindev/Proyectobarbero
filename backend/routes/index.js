const express = require('express');
const router = express.Router();

const authRoutes = require('./auth_routes');
const bookingRoutes = require('./booking_routes');
const professionalRoutes = require('./professional_routes');
const paymentRoutes = require('./payment_routes');
const serviceRoutes = require('./service_routes');
const clientRoutes = require('./clientRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/professionals', professionalRoutes);
router.use('/payments', paymentRoutes);
router.use('/services', serviceRoutes);
router.use('/clients', clientRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
