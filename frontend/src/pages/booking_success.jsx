/**
 * PÁGINA DE ÉXITO
 * Confirmación después de crear una reserva
 */

import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
          ¡Reserva Enviada!
        </h1>

        {/* Message */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <p className="text-lg text-dark-700 leading-relaxed mb-4">
            Tu solicitud de reserva ha sido enviada exitosamente y está{' '}
            <span className="font-bold text-blue-700">pendiente de confirmación</span>.
          </p>
          <p className="text-dark-600">
            El profesional recibirá un correo con los detalles de tu reserva y 
            te contactará pronto para confirmarla.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-dark-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-bold text-dark-900 mb-4 text-center">📋 Próximos pasos:</h2>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <span className="text-dark-700">
                Revisa tu correo electrónico para recibir actualizaciones
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <span className="text-dark-700">
                El profesional confirmará o te contactará vía WhatsApp
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <span className="text-dark-700">
                Recibirás una confirmación final cuando sea aprobada
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-8 py-4 bg-dark-900 text-white rounded-xl hover:bg-dark-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Volver al Inicio</span>
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Reservar Otra Cita</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-dark-200">
          <p className="text-dark-600 text-sm">
            ¿Problemas con tu reserva?{' '}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;