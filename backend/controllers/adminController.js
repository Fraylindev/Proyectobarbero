/**
 * CONTROLADOR DE ADMINISTRACIÓN
 * Solo para PROFESSIONAL_ADMIN
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/database');
const { sendWelcomeEmailToProfessional } = require('../services/email_service');

/**
 * CREAR PROFESIONAL
 * POST /api/admin/professionals
 */
const createProfessional = async (req, res) => {
  try {
    const {
      name,
      specialty,
      description,
      phone,
      email,
      username,
      role
    } = req.body;

    // Validaciones
    if (!name || !phone || !email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, teléfono, email y usuario son obligatorios'
      });
    }

    if (role && !['PROFESSIONAL', 'PROFESSIONAL_ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    // Verificar duplicados
    const existingUsername = await query(
      'SELECT id FROM professionals WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Este nombre de usuario ya existe'
      });
    }

    const existingEmail = await query(
      'SELECT id FROM professionals WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Generar contraseña temporal segura
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    // Crear profesional
    const result = await query(
      `INSERT INTO professionals (
        name, specialty, description, phone, email, username, password_hash, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, username, role`,
      [
        name,
        specialty,
        description,
        phone,
        email,
        username,
        passwordHash,
        role || 'PROFESSIONAL'
      ]
    );

    const newProfessional = result.rows[0];

    // Enviar email con credenciales
    await sendWelcomeEmailToProfessional({
      email,
      name,
      username,
      password: tempPassword
    });

    res.status(201).json({
      success: true,
      message: 'Profesional creado exitosamente. Credenciales enviadas por email.',
      data: {
        professional: newProfessional
      }
    });

  } catch (error) {
    console.error('Error creando profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando profesional'
    });
  }
};

/**
 * LISTAR TODOS LOS PROFESIONALES (Admin)
 * GET /api/admin/professionals
 */
const getAllProfessionalsAdmin = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, name, specialty, description, phone, email, 
        username, role, is_available, created_at
       FROM professionals
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo profesionales'
    });
  }
};

/**
 * ACTUALIZAR PROFESIONAL
 * PUT /api/admin/professionals/:id
 */
const updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, description, phone, role, is_available } = req.body;

    const result = await query(
      `UPDATE professionals 
       SET name = $1, specialty = $2, description = $3, phone = $4, 
           role = $5, is_available = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, username, role`,
      [name, specialty, description, phone, role, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profesional actualizado',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando profesional'
    });
  }
};

/**
 * ELIMINAR PROFESIONAL
 * DELETE /api/admin/professionals/:id
 */
const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir auto-eliminación
    if (id === req.professional.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      });
    }

    const result = await query(
      'DELETE FROM professionals WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profesional eliminado'
    });

  } catch (error) {
    console.error('Error eliminando profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando profesional'
    });
  }
};

/**
 * RESETEAR CONTRASEÑA DE PROFESIONAL
 * POST /api/admin/professionals/:id/reset-password
 */
const resetProfessionalPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Generar nueva contraseña
    const newPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await query(
      'UPDATE professionals SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING name, email, username',
      [passwordHash, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    const professional = result.rows[0];

    // Enviar email con nueva contraseña
    await sendWelcomeEmailToProfessional({
      email: professional.email,
      name: professional.name,
      username: professional.username,
      password: newPassword,
      isReset: true
    });

    res.json({
      success: true,
      message: 'Contraseña reseteada. Nueva contraseña enviada por email.'
    });

  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error reseteando contraseña'
    });
  }
};

module.exports = {
  createProfessional,
  getAllProfessionalsAdmin,
  updateProfessional,
  deleteProfessional,
  resetProfessionalPassword
};