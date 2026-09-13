/**
 * CONTROLADOR DE AUTENTICACIÓN
 * Login, logout, refresh token
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { cleanExpiredTokens } = require('../middleware/auth');

/**
 * Generar Access Token (JWT)
 */
const generateAccessToken = (professionalId) => {
  return jwt.sign(
    { id: professionalId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

/**
 * Generar Refresh Token
 */
const generateRefreshToken = (professionalId) => {
  return jwt.sign(
    { id: professionalId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * LOGIN - Iniciar sesión
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar profesional
    const result = await query(
      'SELECT * FROM professionals WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const professional = result.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, professional.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Limpiar tokens expirados
    await cleanExpiredTokens(professional.id);

    // Generar tokens
    const accessToken = generateAccessToken(professional.id);
    const refreshToken = generateRefreshToken(professional.id);

    // Guardar refresh token en DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (professional_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [professional.id, refreshToken, expiresAt]
    );

    // Respuesta
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          username: professional.username,
          specialty: professional.specialty,
          photo_url: professional.photo_url,
          is_available: professional.is_available
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * LOGIN UNIFICADO - Detecta si es profesional o cliente
 * POST /api/auth/unified-login
 */
const unifiedLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }

    // Buscar en profesionales
    let result = await query(
      'SELECT * FROM professionals WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      const professional = result.rows[0];

      // Verificar que tiene hash
      if (!professional.password_hash) {
        return res.status(401).json({
          success: false,
          message: 'Esta cuenta no tiene contraseña configurada'
        });
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, professional.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Login como profesional
      await cleanExpiredTokens(professional.id);
      
      const accessToken = generateAccessToken(professional.id);
      const refreshToken = generateRefreshToken(professional.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await query(
        `INSERT INTO refresh_tokens (professional_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [professional.id, refreshToken, expiresAt]
      );

      return res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          userType: 'PROFESSIONAL',
          user: {
            id: professional.id,
            name: professional.name,
            email: professional.email,
            username: professional.username,
            role: professional.role
          },
          accessToken,
          refreshToken
        }
      });
    }

    // Buscar en clientes
    result = await query(
      'SELECT * FROM clients WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      const client = result.rows[0];

      if (!client.password_hash) {
        return res.status(401).json({
          success: false,
          message: 'Esta cuenta no tiene contraseña configurada'
        });
      }

      const isMatch = await bcrypt.compare(password, client.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Login como cliente
      const accessToken = jwt.sign(
        { id: client.id, type: 'CLIENT' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
      );

      const refreshToken = jwt.sign(
        { id: client.id, type: 'CLIENT' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await query(
        `INSERT INTO client_refresh_tokens (client_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [client.id, refreshToken, expiresAt]
      );

      return res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          userType: 'CLIENT',
          user: {
            id: client.id,
            name: client.name,
            email: client.email,
            username: client.username
          },
          accessToken,
          refreshToken
        }
      });
    }

    // Usuario no encontrado
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });

  } catch (error) {
    console.error('\n💥 ERROR EN UNIFIED LOGIN:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * REFRESH TOKEN - Renovar access token
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verificar que existe en DB y no está revocado
    const result = await query(
      `SELECT id, professional_id, expires_at, is_revoked 
       FROM refresh_tokens 
       WHERE token = $1`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    const tokenData = result.rows[0];

    if (tokenData.is_revoked) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token revocado'
      });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado'
      });
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken(tokenData.professional_id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }

    console.error('Error en refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * LOGOUT - Cerrar sesión
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revocar refresh token
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
        [refreshToken]
      );
    }

    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * GET ME - Obtener datos del profesional autenticado
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    // req.professional ya está disponible del middleware protect
    res.json({
      success: true,
      data: req.professional
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * CAMBIAR CONTRASEÑA
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const professionalId = req.professional.id;

    // Validar
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener hash actual
    const result = await query(
      'SELECT password_hash FROM professionals WHERE id = $1',
      [professionalId]
    );

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Actualizar
    await query(
      'UPDATE professionals SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, professionalId]
    );

    // Revocar todos los refresh tokens (forzar re-login)
    await query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE professional_id = $1',
      [professionalId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  login,
  unifiedLogin,
  refreshAccessToken,
  logout,
  getMe,
  changePassword
};