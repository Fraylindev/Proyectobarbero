/**
 * PÁGINA DE REGISTRO
 * Registro público SOLO para clientes
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, User, Mail, Phone, Lock, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [withAccount, setWithAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Nombre, email y teléfono son obligatorios');
      return;
    }

    if (withAccount) {
      if (!formData.username || !formData.password) {
        toast.error('Usuario y contraseña son obligatorios si deseas crear cuenta');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setLoading(true);
    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(withAccount && {
          username: formData.username,
          password: formData.password
        })
      };

      await axios.post('http://localhost:5000/api/clients/register', dataToSend);
      
      toast.success(
        withAccount 
          ? '¡Registro exitoso! Ya puedes iniciar sesión' 
          : '¡Perfil guardado! Tus datos se usarán en futuras reservas'
      );

      if (withAccount) {
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setTimeout(() => navigate('/booking'), 1500);
      }

    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </button>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">
              Registro de Cliente
            </h1>
            <p className="text-dark-600">
              Guarda tus datos para futuras reservas más rápidas
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">✨ ¿Por qué registrarte?</p>
                <ul className="space-y-1">
                  <li>• <strong>No es obligatorio</strong> - Puedes reservar sin registrarte</li>
                  <li>• Reservas más rápidas - Tus datos se guardan</li>
                  <li>• Historial de citas - Ve todas tus reservas</li>
                  <li>• Notificaciones - Recibe recordatorios</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos Básicos (Obligatorios) */}
            <div className="space-y-4">
              <h3 className="font-bold text-dark-900 flex items-center">
                <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                Datos Básicos (Obligatorios)
              </h3>

              <div>
                <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="809-123-4567"
                  required
                />
              </div>
            </div>

            {/* Crear Cuenta (Opcional) */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark-900 flex items-center">
                  <span className="bg-dark-300 text-dark-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Crear Cuenta (Opcional)
                </h3>
                <button
                  type="button"
                  onClick={() => setWithAccount(!withAccount)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    withAccount ? 'bg-primary-600' : 'bg-dark-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      withAccount ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {withAccount ? (
                <div className="space-y-4 bg-primary-50 p-4 rounded-lg">
                  <p className="text-sm text-primary-900 mb-3">
                    Crea usuario y contraseña para acceder a tu historial de reservas
                  </p>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Nombre de usuario *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="juanperez"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                      <Lock className="w-4 h-4 mr-2" />
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-dark-700 mb-2">
                      <Lock className="w-4 h-4 mr-2" />
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-dark-600 bg-dark-50 p-4 rounded-lg">
                  Si no creas una cuenta, solo guardaremos tus datos para esta reserva.
                  Puedes crear una cuenta más adelante.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{withAccount ? 'Crear Cuenta' : 'Guardar Datos'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-dark-200 text-center">
            <p className="text-sm text-dark-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
            <p className="text-sm text-dark-600 mt-2">
              ¿Prefieres reservar sin registro?{' '}
              <Link to="/booking" className="text-primary-600 hover:text-primary-700 font-semibold">
                Ir a reservas
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;