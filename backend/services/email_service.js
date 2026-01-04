/**
 * SERVICIO DE EMAIL (RESEND)
 * Envío de notificaciones por correo electrónico
 */

const { Resend } = require('resend');
require('dotenv').config();
console.log('RESEND_API_KEY loaded:', process.env.RESEND_API_KEY ? 'YES' : 'NO');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Función base para enviar emails
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });



    
// Verificar configuración al iniciar
        console.log(`✅ Email enviado a ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};


/**
 * EMAIL: Nueva reserva al profesional
 */
const sendBookingNotificationToProfessional = async (booking, professional, service) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${booking.confirmation_token}`;
  const rejectUrl = `${process.env.FRONTEND_URL}/reject/${booking.confirmation_token}`;
  const whatsappUrl = `https://wa.me/${booking.client_phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(booking.client_name)}%2C%20soy%20${encodeURIComponent(professional.name)}%20de%20Michael%20Barbershop`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .button-group { text-align: center; margin: 30px 0; }
        .btn { 
          display: inline-block; 
          padding: 12px 30px; 
          margin: 10px; 
          text-decoration: none; 
          border-radius: 5px; 
          font-weight: bold;
        }
        .btn-confirm { background: #10b981; color: white; }
        .btn-reject { background: #ef4444; color: white; }
        .btn-whatsapp { background: #25D366; color: white; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Nueva Reserva</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${professional.name},</h2>
          <p>Tienes una nueva solicitud de reserva:</p>
          
          <div class="info-row">
            <span class="label">👤 Cliente:</span>
            <span class="value">${booking.client_name}</span>
          </div>
          
          <div class="info-row">
            <span class="label">📅 Fecha:</span>
            <span class="value">${new Date(booking.booking_date).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          
          <div class="info-row">
            <span class="label">⏰ Hora:</span>
            <span class="value">${booking.booking_time}</span>
          </div>
          
          <div class="info-row">
            <span class="label">✂️ Servicio:</span>
            <span class="value">${service ? service.name : booking.service_custom}</span>
          </div>
          
          ${booking.comments ? `
          <div class="info-row">
            <span class="label">💬 Comentarios:</span>
            <span class="value">${booking.comments}</span>
          </div>
          ` : ''}
          
          <div class="info-row">
            <span class="label">📧 Email:</span>
            <span class="value">${booking.client_email}</span>
          </div>
          
          <div class="info-row">
            <span class="label">📱 Teléfono:</span>
            <span class="value">${booking.client_phone}</span>
          </div>
        </div>
        
        <div class="button-group">
          <a href="${confirmUrl}" class="btn btn-confirm">✅ Confirmar Cita</a>
          <a href="${rejectUrl}" class="btn btn-reject">❌ Rechazar</a>
        </div>
        
        <div class="button-group">
          <a href="${whatsappUrl}" class="btn btn-whatsapp">💬 Contactar por WhatsApp</a>
        </div>
        
        <div class="footer">
          <p>Este link expira en 7 días</p>
          <p>Michael Barbershop - Sistema de Reservas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: professional.email,
      subject: '🔔 Nueva reserva pendiente',
      html: htmlContent
    });
    console.log(`✅ Email enviado a ${professional.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al profesional:', error);
    return false;
  }
};

/**
 * EMAIL: Confirmación de reserva al cliente
 */
const sendBookingConfirmationToClient = async (booking, professional, service) => {
  const whatsappUrl = `https://wa.me/${professional.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(professional.name)}%2C%20soy%20${encodeURIComponent(booking.client_name)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .button-group { text-align: center; margin: 30px 0; }
        .btn-whatsapp { 
          display: inline-block;
          padding: 12px 30px; 
          background: #25D366; 
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Tu cita está confirmada!</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${booking.client_name},</h2>
          <p>Tu cita ha sido confirmada. Estos son los detalles:</p>
          
          <div class="info-row">
            <span class="label">💈 Profesional:</span>
            <span class="value">${professional.name}</span>
          </div>
          
          <div class="info-row">
            <span class="label">📅 Fecha:</span>
            <span class="value">${new Date(booking.booking_date).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          
          <div class="info-row">
            <span class="label">⏰ Hora:</span>
            <span class="value">${booking.booking_time}</span>
          </div>
          
          <div class="info-row">
            <span class="label">✂️ Servicio:</span>
            <span class="value">${service ? service.name : booking.service_custom}</span>
          </div>
          
          ${service && service.price_estimate ? `
          <div class="info-row">
            <span class="label">💰 Precio estimado:</span>
            <span class="value">RD$ ${service.price_estimate}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="button-group">
          <a href="${whatsappUrl}" class="btn-whatsapp">💬 Contactar a ${professional.name}</a>
        </div>
        
        <div class="footer">
          <p>Si necesitas cancelar o reprogramar, contacta directamente al profesional</p>
          <p>Michael Barbershop</p>
          <p>📍 Santo Domingo, República Dominicana</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: booking.client_email,
      subject: '✅ Cita confirmada - Michael Barbershop',
      html: htmlContent
    });
    console.log(`✅ Email de confirmación enviado a ${booking.client_email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error);
    return false;
  }
};

/**
 * EMAIL: Notificación de cancelación al cliente
 */
const sendBookingCancellationToClient = async (booking, professional) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Cita Cancelada</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${booking.client_name},</h2>
          <p>Lamentamos informarte que tu cita ha sido cancelada:</p>
          <p><strong>Fecha:</strong> ${new Date(booking.booking_date).toLocaleDateString('es-DO')}</p>
          <p><strong>Hora:</strong> ${booking.booking_time}</p>
          <p><strong>Profesional:</strong> ${professional.name}</p>
          <p>Si deseas reagendar, contáctanos directamente.</p>
        </div>
        
        <div class="footer">
          <p>Michael Barbershop</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: booking.client_email,
      subject: '❌ Cita cancelada - Michael Barbershop',
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de cancelación:', error);
    return false;
  }
};

/**
 * EMAIL: Bienvenida a profesional con credenciales
 */
const sendWelcomeEmailToProfessional = async ({ email, name, username, password, isReset = false }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .credentials { background: white; border: 2px solid #ef5844; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .credential-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; font-family: monospace; font-size: 16px; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isReset ? '🔐 Contraseña Reseteada' : '👋 Bienvenido al Equipo'}</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>
            ${isReset 
              ? 'Tu contraseña ha sido reseteada. A continuación encontrarás tus nuevas credenciales de acceso.'
              : 'Has sido agregado como profesional en Michael Barbershop. A continuación encontrarás tus credenciales de acceso al sistema.'
            }
          </p>
          
          <div class="credentials">
            <h3 style="margin-top: 0; color: #ef5844;">Credenciales de Acceso</h3>
            
            <div class="credential-row">
              <div class="label">Usuario:</div>
              <div class="value">${username}</div>
            </div>
            
            <div class="credential-row">
              <div class="label">Contraseña Temporal:</div>
              <div class="value">${password}</div>
            </div>
            
            <div style="margin-top: 20px;">
              <strong>URL de acceso:</strong><br>
              <a href="${process.env.FRONTEND_URL}/login" style="color: #ef5844;">
                ${process.env.FRONTEND_URL}/login
              </a>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong><br>
            - Cambia tu contraseña inmediatamente después del primer acceso<br>
            - No compartas estas credenciales con nadie<br>
            - Si no solicitaste este acceso, contacta al administrador
          </div>
          
          <h3>Acceso al Dashboard:</h3>
          <ol>
            <li>Ingresa a ${process.env.FRONTEND_URL}/login</li>
            <li>Usa las credenciales proporcionadas arriba</li>
            <li>Cambia tu contraseña en "Mi Perfil"</li>
            <li>Configura tu disponibilidad y horarios</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Michael Barbershop - Sistema de Gestión</p>
          <p>Si tienes problemas, contacta al administrador</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: isReset ? '🔐 Contraseña reseteada - Michael Barbershop' : '👋 Bienvenido al equipo - Michael Barbershop',
      html: htmlContent
    });
    console.log(`✅ Email de ${isReset ? 'reset' : 'bienvenida'} enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return false;
  }
};

module.exports = {
  sendBookingNotificationToProfessional,
  sendBookingConfirmationToClient,
  sendBookingCancellationToClient,
  sendWelcomeEmailToProfessional
};