/**
 * CONTROLADOR DE SERVICIOS
 * Catálogo de servicios disponibles
 */

const { query } = require('../config/database');

/**
 * OBTENER TODOS LOS SERVICIOS (público)
 * GET /api/services
 */
const getAllServices = async (req, res) => {
  try {
    const { activeOnly = true } = req.query;

    let queryText = 'SELECT * FROM services';
    
    if (activeOnly === 'true' || activeOnly === true) {
      queryText += ' WHERE is_active = true';
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo servicios'
    });
  }
};

/**
 * OBTENER UN SERVICIO POR ID (público)
 * GET /api/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo servicio'
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById
};