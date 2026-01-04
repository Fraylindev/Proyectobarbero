/**
 * RUTAS DE GALERÍA
 * Endpoints públicos para ver portafolios
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/gallery/:professionalId
 * Obtener galería de un profesional (PÚBLICO)
 */
router.get('/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;

    const result = await query(
      `SELECT id, image_url, description, created_at 
       FROM gallery 
       WHERE professional_id = $1 
       ORDER BY created_at DESC`,
      [professionalId]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo galería:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo galería',
      error: error.message
    });
  }
});

module.exports = router;