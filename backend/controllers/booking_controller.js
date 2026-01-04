/**
 * CONTROLADOR DE RESERVAS ULTRA ROBUSTO
 * Node.js + Express + PostgreSQL
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query, getClient } = require('../config/database');
const {
  sendBookingNotificationToProfessional,
  sendBookingConfirmationToClient,
  sendBookingCancellationToClient
} = require('../services/email_service');
const { validate: isUUID } = require('uuid');

/**
 * CREAR RESERVA (con registro opcional de cliente)
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  let clientConn;
  try {
    clientConn = await getClient();
    const {
      professionalId,
      serviceId,
      serviceCustom,
      clientName,
      clientEmail,
      clientPhone,
      bookingDate,
      bookingTime,
      comments,
      registerClient,
      username,
      password
    } = req.body;

    // Validaciones básicas
    if (!clientName || !clientEmail || !clientPhone || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    if (!serviceId && !serviceCustom) {
      return res.status(400).json({
        success: false,
        message: 'Debes seleccionar un servicio o especificar uno personalizado'
      });
    }

    // Validación de UUIDs
    const profId = isUUID(professionalId) ? professionalId : null;
    const svcId = isUUID(serviceId) ? serviceId : null;
    if (!profId) {
      return res.status(400).json({
        success: false,
        message: 'ID de profesional inválido'
      });
    }

    // Obtener datos del profesional
    const profResult = await clientConn.query(
      'SELECT id, name, email, phone, is_available FROM professionals WHERE id = $1',
      [profId]
    );

    if (profResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }

    const professional = profResult.rows[0];
    if (!professional.is_available) {
      return res.status(400).json({ success: false, message: 'Profesional no disponible' });
    }

    // Validar fecha y hora
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    if (isNaN(bookingDateTime.getTime()) || bookingDateTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Fecha/hora inválida o en el pasado' });
    }

    // Verificar conflictos
    const conflict = await clientConn.query(
      `SELECT id FROM bookings
       WHERE professional_id = $1 AND booking_date = $2 AND booking_time = $3 AND status = 'CONFIRMED'`,
      [profId, bookingDate, bookingTime]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Horario ya ocupado' });
    }

    let clientId = null;
    // Registro opcional de cliente
    if (registerClient && username && password) {
      const existingUser = await clientConn.query('SELECT id FROM clients WHERE username = $1', [username]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Usuario ya existe' });
      }
      const existingEmail = await clientConn.query('SELECT id FROM clients WHERE email = $1', [clientEmail]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email ya registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const clientInsert = await clientConn.query(
        `INSERT INTO clients (name,email,phone,username,password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [clientName, clientEmail, clientPhone, username, passwordHash]
      );
      clientId = clientInsert.rows[0].id;
    }

    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    await clientConn.query('BEGIN');

    const bookingInsert = await clientConn.query(
      `INSERT INTO bookings (
        professional_id, service_id, service_custom,
        client_name, client_email, client_phone,
        booking_date, booking_time, comments,
        status, confirmation_token, token_expires_at,
        client_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING',$10,$11,$12)
      RETURNING *`,
      [profId, svcId, serviceCustom || null, clientName, clientEmail, clientPhone,
       bookingDate, bookingTime, comments || '', confirmationToken, tokenExpiresAt, clientId]
    );

    const booking = bookingInsert.rows[0];

    let service = null;
    if (svcId) {
      const serviceResult = await clientConn.query(
        'SELECT name, price_estimate FROM services WHERE id = $1',
        [svcId]
      );
      service = serviceResult.rows[0];
    }

    await clientConn.query('COMMIT');

    // Enviar email sin bloquear
    sendBookingNotificationToProfessional(booking, professional, service).catch(console.error);

    res.status(201).json({
      success: true,
      message: registerClient ? 'Reserva creada y cliente registrado' : 'Reserva creada exitosamente',
      booking,
      registered: !!clientId
    });

  } catch (err) {
    if (clientConn) await clientConn.query('ROLLBACK').catch(() => {});
    console.error('Error creando reserva:', err);
    res.status(200).json({
      success: false,
      message: 'No se pudo crear la reserva. Verifica los datos ingresados.',
      error: err.message
    });
  } finally {
    if (clientConn) clientConn.release();
  }
};

/**
 * CONFIRMAR RESERVA
 * PUT /api/bookings/confirm/:token
 */
const confirmBooking = async (req, res) => {
  let clientConn;
  try {
    const { token } = req.params;
    clientConn = await getClient();

    const bookingResult = await clientConn.query(
      `SELECT b.*, p.name AS professional_name, p.phone AS professional_phone, s.name AS service_name, s.price_estimate
       FROM bookings b
       JOIN professionals p ON b.professional_id = p.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.confirmation_token = $1 AND b.token_used = false AND b.status = 'PENDING'`,
      [token]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Token inválido o ya usado' });
    }

    const booking = bookingResult.rows[0];
    if (new Date(booking.token_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Token expirado' });
    }

    await clientConn.query('BEGIN');
    await clientConn.query(
      `UPDATE bookings SET status='CONFIRMED', token_used=true, updated_at=NOW() WHERE id=$1`,
      [booking.id]
    );
    await clientConn.query('COMMIT');

    sendBookingConfirmationToClient(booking, { name: booking.professional_name, phone: booking.professional_phone },
      { name: booking.service_name, price_estimate: booking.price_estimate }).catch(console.error);

    res.json({ success: true, message: 'Reserva confirmada', booking });

  } catch (err) {
    if (clientConn) await clientConn.query('ROLLBACK').catch(() => {});
    console.error('Error confirmando reserva:', err);
    res.status(200).json({ success: false, message: 'No se pudo confirmar la reserva' });
  } finally {
    if (clientConn) clientConn.release();
  }
};

/**
 * RECHAZAR / CANCELAR RESERVA
 * PUT /api/bookings/reject/:token
 */
const rejectBooking = async (req, res) => {
  let clientConn;
  try {
    const { token } = req.params;
    const { reason } = req.body || {};
    clientConn = await getClient();

    const bookingResult = await clientConn.query(
      `SELECT b.*, p.name AS professional_name, p.phone AS professional_phone
       FROM bookings b
       JOIN professionals p ON b.professional_id = p.id
       WHERE b.confirmation_token=$1 AND b.token_used=false`,
      [token]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Token inválido o ya usado' });
    }

    const booking = bookingResult.rows[0];

    await clientConn.query('BEGIN');
    await clientConn.query(
      `UPDATE bookings SET status='CANCELLED', token_used=true, comments=CONCAT(COALESCE(comments,''), '\nMotivo: ', $2), updated_at=NOW() WHERE id=$1`,
      [booking.id, reason || 'Cancelada por el profesional']
    );
    await clientConn.query('COMMIT');

    sendBookingCancellationToClient(booking, { name: booking.professional_name, phone: booking.professional_phone }).catch(console.error);

    res.json({ success: true, message: 'Reserva cancelada' });

  } catch (err) {
    if (clientConn) await clientConn.query('ROLLBACK').catch(() => {});
    console.error('Error cancelando reserva:', err);
    res.status(200).json({ success: false, message: 'No se pudo cancelar la reserva' });
  } finally {
    if (clientConn) clientConn.release();
  }
};

/**
 * GET reservas de un profesional autenticado
 */
const getMyBookings = async (req, res) => {
  try {
    const professionalId = req.professional?.id;
    if (!professionalId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const { status, date, limit = 50 } = req.query;
    let params = [professionalId], paramCount = 1;
    let queryText = `SELECT b.*, s.name as service_name, s.price_estimate FROM bookings b LEFT JOIN services s ON b.service_id=s.id WHERE b.professional_id=$1`;

    if (status) {
      paramCount++;
      queryText += ` AND b.status=$${paramCount}`;
      params.push(status.toUpperCase());
    }
    if (date) {
      paramCount++;
      queryText += ` AND b.booking_date=$${paramCount}`;
      params.push(date);
    }
    queryText += ` ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT $${paramCount+1}`;
    params.push(limit);

    const result = await query(queryText, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Error obteniendo reservas:', err);
    res.status(200).json({ success: false, message: 'No se pudo obtener reservas' });
  }
};

/**
 * COMPLETAR RESERVA
 */
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalId = req.professional?.id;
    if (!professionalId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const result = await query(
      `UPDATE bookings SET status='COMPLETED', updated_at=NOW() WHERE id=$1 AND professional_id=$2 RETURNING *`,
      [id, professionalId]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Reserva no encontrada o no autorizada' });
    res.json({ success: true, message: 'Reserva completada', data: result.rows[0] });
  } catch (err) {
    console.error('Error completando reserva:', err);
    res.status(200).json({ success: false, message: 'No se pudo completar la reserva' });
  }
};

/**
 * CANCELAR RESERVA
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalId = req.professional?.id;
    if (!professionalId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const result = await query(
      `UPDATE bookings SET status='CANCELLED', updated_at=NOW() WHERE id=$1 AND professional_id=$2 RETURNING *`,
      [id, professionalId]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Reserva no encontrada o no autorizada' });
    res.json({ success: true, message: 'Reserva cancelada', data: result.rows[0] });
  } catch (err) {
    console.error('Error cancelando reserva:', err);
    res.status(200).json({ success: false, message: 'No se pudo cancelar la reserva' });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  rejectBooking,
  getMyBookings,
  completeBooking,
  cancelBooking
};
