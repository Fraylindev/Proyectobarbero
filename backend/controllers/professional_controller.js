/**
 * CONTROLADOR DE PROFESIONALES
 * Gestión de profesionales, disponibilidad y horarios
 */

const { query } = require('../config/database');

/**
 * OBTENER TODOS LOS PROFESIONALES (público)
 * GET /api/professionals
 */
const getAllProfessionals = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, name, specialty, description, photo_url, phone, is_available
       FROM professionals
       ORDER BY name ASC`
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
 * OBTENER UN PROFESIONAL POR ID (público)
 * GET /api/professionals/:id
 */
const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, name, specialty, description, photo_url, phone, is_available, rating, total_reviews, completed_bookings, total_clients, role
       FROM professionals
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    // Obtener galería del profesional
    const galleryResult = await query(
      'SELECT id, image_url, description, created_at FROM gallery WHERE professional_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        gallery: galleryResult.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo profesional'
    });
  }
};

/**
 * CAMBIAR ESTADO DE DISPONIBILIDAD (requiere auth)
 * PUT /api/professionals/availability
 */
const toggleAvailability = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable debe ser true o false'
      });
    }

    await query(
      'UPDATE professionals SET is_available = $1, updated_at = NOW() WHERE id = $2',
      [isAvailable, professionalId]
    );

    res.json({
      success: true,
      message: `Estado actualizado: ${isAvailable ? 'Disponible' : 'No disponible'}`,
      data: { isAvailable }
    });

  } catch (error) {
    console.error('Error actualizando disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando disponibilidad'
    });
  }
};

/**
 * OBTENER HORARIOS DISPONIBLES DE UN PROFESIONAL (público)
 * GET /api/professionals/:id/available-slots
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Fecha requerida (formato: YYYY-MM-DD)'
      });
    }

    // Verificar que el profesional existe y está disponible
    const professionalResult = await query(
      'SELECT id, name, is_available FROM professionals WHERE id = $1',
      [id]
    );

    if (professionalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    if (!professionalResult.rows[0].is_available) {
      return res.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          message: 'Profesional no disponible actualmente'
        }
      });
    }

    // Obtener día de la semana (0=Domingo, 6=Sábado)
    const dayOfWeek = new Date(date).getDay();

    // Obtener horario base del profesional para ese día
    const scheduleResult = await query(
      `SELECT start_time, end_time 
       FROM availability_schedule 
       WHERE professional_id = $1 AND day_of_week = $2 AND is_active = true`,
      [id, dayOfWeek]
    );

    if (scheduleResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          message: 'Sin horario configurado para este día'
        }
      });
    }

    const schedule = scheduleResult.rows[0];

    // Obtener reservas CONFIRMADAS para ese día
    const bookingsResult = await query(
      `SELECT booking_time 
       FROM bookings 
       WHERE professional_id = $1 
       AND booking_date = $2 
       AND status = 'CONFIRMED'`,
      [id, date]
    );

    const bookedTimes = bookingsResult.rows.map(r => r.booking_time);

    // Obtener bloqueos manuales
    const blockedResult = await query(
      `SELECT start_time, end_time 
       FROM blocked_times 
       WHERE professional_id = $1 AND blocked_date = $2`,
      [id, date]
    );

    // Generar slots disponibles (cada 30 minutos)
    const availableSlots = [];
    let currentTime = schedule.start_time;
    const endTime = schedule.end_time;

    while (currentTime < endTime) {
      let isBlocked = false;

      // Verificar si está en una reserva confirmada
      if (bookedTimes.includes(currentTime)) {
        isBlocked = true;
      }

      // Verificar si está en un bloqueo manual
      for (const block of blockedResult.rows) {
        if (currentTime >= block.start_time && currentTime < block.end_time) {
          isBlocked = true;
          break;
        }
      }

      if (!isBlocked) {
        availableSlots.push(currentTime);
      }

      // Incrementar 30 minutos
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + 30;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
    }

    res.json({
      success: true,
      data: {
        date,
        professionalName: professionalResult.rows[0].name,
        availableSlots
      }
    });

  } catch (error) {
    console.error('Error obteniendo slots disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo disponibilidad'
    });
  }
};

/**
 * CREAR HORARIO BASE SEMANAL (requiere auth)
 * POST /api/professionals/schedule
 */
const createSchedule = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { dayOfWeek, startTime, endTime } = req.body;

    // Validar
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'dayOfWeek debe estar entre 0 (Domingo) y 6 (Sábado)'
      });
    }

    // Verificar que no exista ya
    const existingResult = await query(
      `SELECT id FROM availability_schedule 
       WHERE professional_id = $1 AND day_of_week = $2`,
      [professionalId, dayOfWeek]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un horario para este día. Usa PUT para actualizar.'
      });
    }

    // Insertar
    const result = await query(
      `INSERT INTO availability_schedule (professional_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [professionalId, dayOfWeek, startTime, endTime]
    );

    res.status(201).json({
      success: true,
      message: 'Horario creado',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando horario'
    });
  }
};

/**
 * CREAR BLOQUEO ESPECÍFICO (requiere auth)
 * POST /api/professionals/block-time
 */
const blockTime = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { blockedDate, startTime, endTime, reason } = req.body;

    if (!blockedDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Fecha, hora inicio y hora fin son requeridas'
      });
    }

    const result = await query(
      `INSERT INTO blocked_times (professional_id, blocked_date, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [professionalId, blockedDate, startTime, endTime, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Horario bloqueado',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error bloqueando horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error bloqueando horario'
    });
  }
};

/**
 * ELIMINAR BLOQUEO (requiere auth)
 * DELETE /api/professionals/block-time/:id
 */
const removeBlockedTime = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM blocked_times WHERE id = $1 AND professional_id = $2 RETURNING id',
      [id, professionalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bloqueo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Bloqueo eliminado'
    });

  } catch (error) {
    console.error('Error eliminando bloqueo:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando bloqueo'
    });
  }
};

module.exports = {
  getAllProfessionals,
  getProfessionalById,
  toggleAvailability,
  getAvailableSlots,
  createSchedule,
  blockTime,
  removeBlockedTime
};