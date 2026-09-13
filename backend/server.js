/**
 * SERVIDOR PRINCIPAL
 * Backend API para sistema de reservas de barbería
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rutas
const apiRoutes = require('./routes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet - Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:3000"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Configuración
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - Protección contra ataques
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Aplicar rate limiting solo a rutas de API (no a archivos estáticos)
app.use('/api/', limiter);

// ============================================
// MIDDLEWARES GENERALES
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger simple en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  });
}

// ============================================
// RUTAS
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Barbershop API v1.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      bookings: '/api/bookings',
      professionals: '/api/professionals',
      services: '/api/services',
      payments: '/api/payments'
    }
  });
});

// Montar rutas del API
app.use('/api', apiRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   BARBERSHOP API - SERVIDOR ACTIVO    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-DO')}`);
  console.log('');
  console.log('📌 Endpoints disponibles:');
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/auth/login`);
  console.log(`   - http://localhost:${PORT}/api/bookings`);
  console.log(`   - http://localhost:${PORT}/api/professionals`);
  console.log(`   - http://localhost:${PORT}/api/services`);
  console.log('');
  console.log('✅ Servidor listo para recibir peticiones');
  console.log('═══════════════════════════════════════════');
});

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

module.exports = app;