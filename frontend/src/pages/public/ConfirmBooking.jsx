/**
 * CONFIRMACIÓN DE RESERVA DESDE EMAIL
 * Página pública para confirmar citas mediante token
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ConfirmBooking = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error | expired | used
  const [message, setMessage] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (token) {
      confirmBooking();
    }
  }, [token]);

  const confirmBooking = async () => {
    try {
      const response = await api.put(
  `/bookings/confirm/${token}`
);

      setStatus('success');
      setMessage(response.data.message || '¡Cita confirmada exitosamente!');
      setBookingDetails(response.data.booking);

    } catch (error) {
      console.error('Error confirmando reserva:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al confirmar la reserva';
      
      if (errorMessage.includes('expirado')) {
        setStatus('expired');
        setMessage('Este enlace de confirmación ha expirado');
      } else if (errorMessage.includes('ya fue usado') || errorMessage.includes('ya está confirmada')) {
        setStatus('used');
        setMessage('Esta reserva ya fue confirmada anteriormente');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <Loader className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmando tu cita...
            </h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              ¡Cita Confirmada! 🎉
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>

            {bookingDetails && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto mb-6">
                <h3 className="font-bold text-lg mb-4">Detalles de la cita</h3>
                <div className="space-y-2 text-left">
                  <p className="text-sm">
                    <strong>Cliente:</strong> {bookingDetails.client_name}
                  </p>
                  <p className="text-sm">
                    <strong>Fecha:</strong> {new Date(bookingDetails.booking_date).toLocaleDateString('es-DO', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm">
                    <strong>Hora:</strong> {bookingDetails.booking_time}
                  </p>
                  <p className="text-sm">
                    <strong>Servicio:</strong> {bookingDetails.service_name || bookingDetails.service_custom}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-900">
                ✅ Se ha enviado un email de confirmación al cliente
              </p>
            </div>
          </div>
        );

      case 'used':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ya Confirmada
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-900">
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
                ⚠️ Los enlaces de confirmación expiran después de 7 días.<br />
                Por favor, confirma desde tu dashboard o contacta al cliente directamente.
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
              Error al Confirmar
            </h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-red-900">
                ❌ Por favor, intenta confirmar desde tu dashboard o contacta al soporte técnico.
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
          {status !== 'loading' && (
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

export default ConfirmBooking;