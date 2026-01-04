/**
 * RECHAZO DE RESERVA DESDE EMAIL
 * Página pública para rechazar/cancelar citas mediante token
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const RejectBooking = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirm'); // confirm | loading | success | error | expired | used
  const [message, setMessage] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (token) {
      loadBookingDetails();
    }
  }, [token]);

  const loadBookingDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/token/${token}`
      );
      setBookingDetails(response.data.booking);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setStatus('error');
      setMessage('No se pudieron cargar los detalles de la reserva');
    }
  };

  const handleReject = async () => {
    setStatus('loading');

    try {
      const response = await axios.post(
        `http://localhost:5000/api/bookings/reject/${token}`,
        { reason: reason || 'Cancelada por el profesional' }
      );

      setStatus('success');
      setMessage(response.data.message || 'Cita cancelada exitosamente');

    } catch (error) {
      console.error('Error rechazando reserva:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al cancelar la reserva';
      
      if (errorMessage.includes('expirado')) {
        setStatus('expired');
        setMessage('Este enlace ha expirado');
      } else if (errorMessage.includes('ya fue usado')) {
        setStatus('used');
        setMessage('Esta reserva ya fue procesada anteriormente');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'confirm':
        return (
          <div className="py-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              ¿Cancelar esta cita?
            </h2>
            
            <p className="text-gray-600 mb-8 text-center">
              Estás a punto de cancelar la siguiente reserva:
            </p>

            {bookingDetails && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 max-w-md mx-auto mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cliente</p>
                    <p className="font-bold text-gray-900">{bookingDetails.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(bookingDetails.booking_date).toLocaleDateString('es-DO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Hora</p>
                    <p className="font-semibold text-gray-900">{bookingDetails.booking_time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Servicio</p>
                    <p className="font-semibold text-gray-900">
                      {bookingDetails.service_name || bookingDetails.service_custom}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-md mx-auto mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo de cancelación (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ej: Tengo otra cita programada, emergencia personal, etc."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-sm text-yellow-900">
                ⚠️ Se enviará un email al cliente notificándole la cancelación.
              </p>
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center py-12">
            <Loader className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cancelando cita...
            </h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Cita Cancelada
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-red-900">
                ✅ Se ha enviado un email de notificación al cliente
              </p>
            </div>
          </div>
        );

      case 'used':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ya Procesada
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-900">
                ℹ️ Esta cita ya fue procesada anteriormente
              </p>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Enlace Expirado
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-900">
                ⚠️ Los enlaces expiran después de 7 días.<br />
                Por favor, cancela desde tu dashboard.
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Error
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-red-900">
                ❌ Por favor, intenta desde tu dashboard o contacta al soporte técnico.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al inicio</span>
        </button>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}

          {/* Actions */}
          {(status === 'success' || status === 'error' || status === 'expired' || status === 'used') && (
            <div className="mt-8 text-center space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Ir al Dashboard
              </button>
              <br />
              <button
                onClick={() => navigate('/')}
                className="inline-block px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Michael Barbershop • Sistema de Reservas
          </p>
        </div>
      </div>
    </div>
  );
};

export default RejectBooking;