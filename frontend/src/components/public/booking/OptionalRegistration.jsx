/**
 * OPTIONAL REGISTRATION
 * Componente para registro opcional del cliente al final del flujo
 */

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, Info } from 'lucide-react';

const OptionalRegistration = ({ clientEmail, onRegister }) => {
  const [wantsToRegister, setWantsToRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateRegistration = () => {
    const newErrors = {};

    if (wantsToRegister) {
      // Validar usuario
      if (!registrationData.username) {
        newErrors.username = 'El usuario es requerido';
      } else if (registrationData.username.length < 4) {
        newErrors.username = 'Mínimo 4 caracteres';
      } else if (!/^[a-zA-Z0-9_]+$/.test(registrationData.username)) {
        newErrors.username = 'Solo letras, números y guión bajo';
      }

      // Validar contraseña
      if (!registrationData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (registrationData.password.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      }

      // Validar confirmación
      if (registrationData.password !== registrationData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleRegistration = (value) => {
    setWantsToRegister(value);
    if (!value) {
      // Limpiar datos si decide no registrarse
      setRegistrationData({
        username: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      onRegister(null);
    }
  };

  const handleChange = (field, value) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitRegistration = () => {
    if (wantsToRegister && validateRegistration()) {
      onRegister({
        username: registrationData.username,
        password: registrationData.password
      });
      return true;
    } else if (!wantsToRegister) {
      onRegister(null);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Pregunta principal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Quieres crear una cuenta?
            </h3>
            <p className="text-gray-700 mb-4">
              Registrarte te permitirá reservar más rápido en el futuro y ver tu historial de citas
            </p>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="register"
                  checked={wantsToRegister}
                  onChange={() => handleToggleRegistration(true)}
                  className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  Sí, crear mi cuenta
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="register"
                  checked={!wantsToRegister}
                  onChange={() => handleToggleRegistration(false)}
                  className="w-5 h-5 text-gray-600 focus:ring-2 focus:ring-gray-500"
                />
                <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  No, solo esta vez
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de registro */}
      {wantsToRegister && (
        <div className="bg-white border-2 border-primary-200 rounded-xl p-6 space-y-4 animate-fadeIn">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completa tu registro
          </h4>

          {/* Email (solo lectura) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (ya proporcionado)
            </label>
            <input
              type="email"
              value={clientEmail}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
            />
          </div>

          {/* Usuario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Usuario *
            </label>
            <input
              type="text"
              value={registrationData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="usuario123"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <Info className="w-4 h-4" />
                {errors.username}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Solo letras, números y guión bajo. Mínimo 4 caracteres.
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={registrationData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <Info className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Confirmar contraseña *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={registrationData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <Info className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Beneficios */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">✨ Beneficios de registrarte:</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Reserva más rápido en futuras ocasiones</li>
              <li>• Ve tu historial de citas</li>
              <li>• Recibe notificaciones de tus próximas citas</li>
              <li>• Guarda tus preferencias</li>
            </ul>
          </div>
        </div>
      )}

      {/* Info si no se registra */}
      {!wantsToRegister && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            ℹ️ Podrás crear una cuenta más adelante si cambias de opinión
          </p>
        </div>
      )}

      {/* Validador hidden para el formulario padre */}
      <input
        type="hidden"
        value={wantsToRegister ? 'registration-required' : 'no-registration'}
        onChange={() => {}}
      />
    </div>
  );
};

// Hook para validar desde el padre
OptionalRegistration.validate = (ref) => {
  if (ref.current) {
    return ref.current.handleSubmitRegistration();
  }
  return true;
};

export default OptionalRegistration;