/**
 * UTILIDADES PARA EL SISTEMA DE RESERVAS
 * Funciones auxiliares para validación y formateo
 */

import { format } from 'date-fns';

/**
 * Validar si una hora está en formato correcto (HH:MM)
 */
export const isValidTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validar si una hora está dentro del horario laboral
 */
export const isWithinWorkingHours = (time, workingHours) => {
  const [hours, minutes] = time.split(':').map(Number);
  const [startH, startM] = workingHours.start.split(':').map(Number);
  const [endH, endM] = workingHours.end.split(':').map(Number);

  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = startH * 60 + startM;
  const endInMinutes = endH * 60 + endM;

  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};

/**
 * Convertir hora sin segundos a formato completo (HH:MM:SS)
 */
export const normalizeTime = (time) => {
  if (!time) return null;
  if (time.length === 5) return `${time}:00`;
  return time;
};

/**
 * Formatear fecha para display
 */
export const formatBookingDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    // Agregar tiempo para evitar problemas de zona horaria
    return format(new Date(dateStr + 'T00:00:00'), 'PPP', { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateStr;
  }
};

/**
 * Formatear hora para display (quitar segundos)
 */
export const formatBookingTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5);
};

/**
 * Generar horarios sugeridos cada N minutos
 */
export const generateTimeSlots = (workingHours, interval = 30, excludeTimes = []) => {
  const slots = [];
  const [startH, startM] = workingHours.start.split(':').map(Number);
  const [endH, endM] = workingHours.end.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    if (!excludeTimes.includes(timeStr)) {
      slots.push(timeStr);
    }

    currentMinutes += interval;
  }

  return slots;
};

/**
 * Validar datos completos de reserva antes de enviar
 */
export const validateBookingData = (formData) => {
  const errors = [];

  if (!formData.professionalId) {
    errors.push('Debe seleccionar un profesional');
  }

  if (!formData.bookingDate) {
    errors.push('Debe seleccionar una fecha');
  }

  if (!formData.bookingTime) {
    errors.push('Debe seleccionar una hora');
  }

  if (!formData.serviceId && !formData.serviceCustom) {
    errors.push('Debe seleccionar un servicio');
  }

  if (!formData.clientName?.trim()) {
    errors.push('Debe ingresar su nombre');
  }

  if (!formData.clientEmail?.trim()) {
    errors.push('Debe ingresar su email');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clientEmail)) {
      errors.push('El email no es válido');
    }
  }

  if (!formData.clientPhone?.trim()) {
    errors.push('Debe ingresar su teléfono');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  isValidTimeFormat,
  isWithinWorkingHours,
  normalizeTime,
  formatBookingDate,
  formatBookingTime,
  generateTimeSlots,
  validateBookingData
};