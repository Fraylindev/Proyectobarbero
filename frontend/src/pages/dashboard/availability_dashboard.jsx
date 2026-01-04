/**
 * DASHBOARD DE DISPONIBILIDAD
 * Control del estado y horarios del profesional
 */

import { useState } from 'react';
import { Power, Clock } from 'lucide-react';
import { professionalService } from '../../services/api';
import { useAuth } from '../../context/auth_context';
import toast from 'react-hot-toast';

const AvailabilityDashboard = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await professionalService.toggleAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
      toast.success(
        !isAvailable 
          ? '✅ Ahora estás disponible para recibir reservas' 
          : '⏸️ Estado cambiado a no disponible'
      );
    } catch (error) {
      toast.error('Error actualizando disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">
          Disponibilidad
        </h1>
        <p className="text-dark-600">Controla cuándo pueden reservar contigo</p>
      </div>

      {/* Main Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Power className={`w-8 h-8 ${isAvailable ? 'text-green-600' : 'text-dark-400'}`} />
              <h2 className="text-2xl font-bold text-dark-900">
                {isAvailable ? 'Disponible' : 'No Disponible'}
              </h2>
            </div>
            <p className="text-dark-600 text-lg">
              {isAvailable 
                ? 'Los clientes pueden ver tus horarios y reservar citas contigo'
                : 'Los clientes no podrán reservar nuevas citas hasta que actives tu disponibilidad'}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-16 w-32 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isAvailable ? 'bg-green-600' : 'bg-dark-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                isAvailable ? 'translate-x-16' : 'translate-x-2'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className={`rounded-xl p-6 ${
          isAvailable ? 'bg-green-50 border-2 border-green-200' : 'bg-dark-100 border-2 border-dark-200'
        }`}>
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Estado Actual
          </h3>
          <p className={`text-2xl font-bold ${isAvailable ? 'text-green-700' : 'text-dark-600'}`}>
            {isAvailable ? 'Recibiendo Reservas' : 'Pausado'}
          </p>
          <p className="text-sm text-dark-600 mt-2">
            {isAvailable 
              ? 'Tu perfil es visible en la página de reservas'
              : 'Tu perfil está oculto temporalmente'}
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2">💡 Consejo</h3>
          <p className="text-dark-700">
            Desactiva tu disponibilidad cuando:
          </p>
          <ul className="list-disc list-inside text-sm text-dark-600 mt-2 space-y-1">
            <li>Estés de vacaciones</li>
            <li>Tengas tu agenda llena</li>
            <li>No puedas atender nuevas citas</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Acciones Rápidas</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={handleToggle}
            disabled={loading || isAvailable}
            className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-green-600 font-semibold">✅ Activar</div>
            <div className="text-sm text-dark-600">Recibir reservas</div>
          </button>

          <button
            onClick={handleToggle}
            disabled={loading || !isAvailable}
            className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-yellow-600 font-semibold">⏸️ Pausar</div>
            <div className="text-sm text-dark-600">Temporalmente</div>
          </button>

          <button
            className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => toast.info('Función próximamente: Configurar horarios personalizados')}
          >
            <div className="text-blue-600 font-semibold">⚙️ Configurar</div>
            <div className="text-sm text-dark-600">Horarios (próximamente)</div>
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="font-bold text-primary-900 mb-2">ℹ️ Información Importante</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• Este cambio afecta inmediatamente la visibilidad de tu perfil</li>
          <li>• Las citas ya confirmadas no se cancelan automáticamente</li>
          <li>• Los clientes recibirán un mensaje si intentan reservar contigo estando no disponible</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityDashboard;