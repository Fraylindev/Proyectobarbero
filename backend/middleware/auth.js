/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Protección de rutas con JWT
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Verificar token JWT en headers (PROFESIONALES)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar profesional en DB
    const result = await query(
      'SELECT id, name, email, username, is_available, role FROM professionals WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    req.professional = result.rows[0];
    req.userType = 'PROFESSIONAL';
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de autenticación'
    });
  }
};

/**
 * Verificar token JWT para CLIENTES
 */
const protectClient = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const result = await query(
      'SELECT id, name, email, phone, username FROM clients WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    req.client = result.rows[0];
    req.userType = 'CLIENT';
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    console.error('Error en middleware cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de autenticación'
    });
  }
};

/**
 * Verificar que el profesional sea ADMIN
 */
const requireAdmin = async (req, res, next) => {
  if (!req.professional || req.professional.role !== 'PROFESSIONAL_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores.'
    });
  }
  next();
};

/**
 * Verificar refresh token
 */
const verifyRefreshToken = async (refreshToken) => {
  try {
    // Verificar firma del token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verificar que existe en DB y no está revocado
    const result = await query(
      `SELECT id, professional_id, expires_at, is_revoked 
       FROM refresh_tokens 
       WHERE token = $1`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Refresh token no encontrado');
    }

    const tokenData = result.rows[0];

    // Verificar que no esté revocado
    if (tokenData.is_revoked) {
      throw new Error('Refresh token revocado');
    }

    // Verificar expiración
    if (new Date(tokenData.expires_at) < new Date()) {
      throw new Error('Refresh token expirado');
    }

    return {
      valid: true,
      professionalId: tokenData.professional_id
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Revocar refresh token (logout)
 */
const revokeRefreshToken = async (refreshToken) => {
  try {
    await query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
      [refreshToken]
    );
    return true;
  } catch (error) {
    console.error('Error revocando token:', error);
    return false;
  }
};

/**
 * Limpiar tokens expirados de un profesional
 */
const cleanExpiredTokens = async (professionalId) => {
  try {
    await query(
      `DELETE FROM refresh_tokens 
       WHERE professional_id = $1 
       AND (expires_at < NOW() OR is_revoked = true)`,
      [professionalId]
    );
  } catch (error) {
    console.error('Error limpiando tokens:', error);
  }
};

module.exports = {
  protect,
  protectClient,
  requireAdmin,
  verifyRefreshToken,
  revokeRefreshToken,
  cleanExpiredTokens
}; 