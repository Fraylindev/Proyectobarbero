/**
 * RUTAS DE CONFIRMACIÓN/RECHAZO DE RESERVAS
 * Endpoints públicos para procesar tokens desde email
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { 
  sendBookingConfirmationToClient, 
  sendBookingCancellationToClient 
} = require('../services/email.service');

/**
 * GET /api/bookings/token/:token
 * Obtener detalles de una reserva por token (sin confirmar/rechazar)
 */
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar reserva por token
    const result = await query(
      `SELECT 
        b.id, b.client_name, b.client_email, b.client_phone,
        b.booking_date, b.booking_time, b.status,
        b.service_custom, b.comments,
        b.token_used, b.token_expires_at,
        s.name as service_name,
        p.name as professional_name, p.email as professional_email
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN professionals p ON b.professional_id = p.id
       WHERE b.confirmation_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    const booking = result.rows[0];

    // Verificar expiración
    if (new Date(booking.token_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Este enlace ha expirado'
      });
    }

    // Verificar si ya fue usado
    if (booking.token_used) {
      return res.status(400).json({
        success: false,
        message: 'Este enlace ya fue usado'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error obteniendo reserva por token:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalles de la reserva'
    });
  }
});

/**
 * POST /api/bookings/confirm/:token
 * Confirmar una reserva mediante token (desde email)
 */
router.post('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar reserva por token
    const result = await query(
      `SELECT 
        b.id, b.professional_id, b.service_id, b.client_name, b.client_email, 
        b.client_phone, b.booking_date, b.booking_time, b.status,
        b.service_custom, b.comments, b.token_used, b.token_expires_at,
        s.name as service_name, s.price_estimate,
        p.name as professional_name, p.email as professional_email, p.phone as professional_phone
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN professionals p ON b.professional_id = p.id
       WHERE b.confirmation_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    const booking = result.rows[0];

    // Verificar expiración
    if (new Date(booking.token_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Este enlace de confirmación ha expirado'
      });
    }

    // Verificar si ya fue usado
    if (booking.token_used) {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya fue confirmada anteriormente'
      });
    }

    // Verificar si ya está confirmada
    if (booking.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya está confirmada'
      });
    }

    // Actualizar estado a CONFIRMED y marcar token como usado
    await query(
      `UPDATE bookings 
       SET status = 'CONFIRMED', 
           token_used = true,
           updated_at = NOW()
       WHERE id = $1`,
      [booking.id]
    );

    // Enviar email de confirmación al cliente
    const professional = {
      name: booking.professional_name,
      email: booking.professional_email,
      phone: booking.professional_phone
    };

    const service = booking.service_id ? {
      name: booking.service_name,
      price_estimate: booking.price_estimate
    } : null;

    const confirmedBooking = {
      ...booking,
      status: 'CONFIRMED'
    };

    await sendBookingConfirmationToClient(confirmedBooking, professional, service);

    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      booking: confirmedBooking
    });

  } catch (error) {
    console.error('Error confirmando reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la reserva',
      error: error.message
    });
  }
});

/**
 * POST /api/bookings/reject/:token
 * Rechazar/cancelar una reserva mediante token (desde email)
 */
router.post('/reject/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    // Buscar reserva por token
    const result = await query(
      `SELECT 
        b.id, b.professional_id, b.client_name, b.client_email, 
        b.booking_date, b.booking_time, b.status,
        b.token_used, b.token_expires_at,
        p.name as professional_name, p.email as professional_email
       FROM bookings b
       LEFT JOIN professionals p ON b.professional_id = p.id
       WHERE b.confirmation_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    const booking = result.rows[0];

    // Verificar expiración
    if (new Date(booking.token_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Este enlace ha expirado'
      });
    }

    // Verificar si ya fue usado
    if (booking.token_used) {
      return res.status(400).json({
        success: false,
        message: 'Este enlace ya fue usado anteriormente'
      });
    }

    // Verificar si ya está cancelada
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya está cancelada'
      });
    }

    // Actualizar estado a CANCELLED y marcar token como usado
    await query(
      `UPDATE bookings 
       SET status = 'CANCELLED', 
           token_used = true,
           comments = CONCAT(COALESCE(comments, ''), '\nMotivo de cancelación: ', $2),
           updated_at = NOW()
       WHERE id = $1`,
      [booking.id, reason || 'Cancelada por el profesional']
    );

    // Enviar email de cancelación al cliente
    const professional = {
      name: booking.professional_name,
      email: booking.professional_email
    };

    await sendBookingCancellationToClient(booking, professional);

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error rechazando reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la reserva',
      error: error.message
    });
  }
});



module.exports = router;