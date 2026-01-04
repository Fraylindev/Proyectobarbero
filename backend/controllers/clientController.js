/**
 * CONTROLADOR DE CLIENTES
 * Registro y autenticación para clientes
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * REGISTRAR CLIENTE
 * POST /api/clients/register
 */
const registerClient = async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;

    // Validaciones
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y teléfono son obligatorios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Usuario y contraseña son opcionales
    let passwordHash = null;
    let finalUsername = username;

    if (username || password) {
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Si proporcionas usuario o contraseña, ambos son obligatorios'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar que username no exista
      const existingUser = await query(
        'SELECT id FROM clients WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Este nombre de usuario ya está en uso'
        });
      }

      // Hash de contraseña
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Verificar que email no exista
    const existingEmail = await query(
      'SELECT id FROM clients WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Crear cliente
    const result = await query(
      `INSERT INTO clients (name, email, phone, username, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, username`,
      [name, email, phone, finalUsername, passwordHash]
    );

    const client = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          username: client.username
        }
      }
    });

  } catch (error) {
    console.error('Error en registro de cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * LOGIN CLIENTE
 * POST /api/clients/login
 */
const loginClient = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }

    // Buscar cliente
    const result = await query(
      'SELECT * FROM clients WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const client = result.rows[0];

    // Verificar que tenga password configurado
    if (!client.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Esta cuenta no tiene contraseña configurada'
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, client.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
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

    // Guardar refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO client_refresh_tokens (client_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [client.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          username: client.username
        },
        accessToken,
        refreshToken,
        userType: 'CLIENT'
      }
    });

  } catch (error) {
    console.error('Error en login de cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * OBTENER PERFIL CLIENTE
 * GET /api/clients/me
 */
const getClientProfile = async (req, res) => {
  try {
    const clientId = req.client.id;

    const result = await query(
      'SELECT id, name, email, phone, username, created_at FROM clients WHERE id = $1',
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * ACTUALIZAR PERFIL CLIENTE
 * PUT /api/clients/profile
 */
const updateClientProfile = async (req, res) => {
  try {
    const clientId = req.client.id;
    const { name, phone } = req.body;

    await query(
      'UPDATE clients SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3',
      [name, phone, clientId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado'
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  registerClient,
  loginClient,
  getClientProfile,
  updateClientProfile
};