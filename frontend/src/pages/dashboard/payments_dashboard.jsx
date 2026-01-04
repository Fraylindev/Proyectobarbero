/**
 * DASHBOARD DE PAGOS
 * Reportes financieros y estadísticas
 */

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';
import { paymentService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const PaymentsDashboard = () => {
  const [todayEarnings, setTodayEarnings] = useState(null);
  const [monthEarnings, setMonthEarnings] = useState(null);
  const [history, setHistory] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [today, month, hist, top] = await Promise.all([
        paymentService.getTodayEarnings(),
        paymentService.getMonthEarnings(),
        paymentService.getHistory({ limit: 20 }),
        paymentService.getTopServices({ limit: 5 }),
      ]);

      setTodayEarnings(today.data);
      setMonthEarnings(month.data);
      setHistory(hist.data);
      setTopServices(top.data);
    } catch (error) {
      toast.error('Error cargando datos de pagos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">
          Pagos e Ingresos
        </h1>
        <p className="text-dark-600">Resumen financiero de tus servicios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Today */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Ingresos de Hoy</p>
                <p className="text-xs text-green-200">
                  {format(new Date(), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            RD$ {todayEarnings?.totalEarnings?.toLocaleString() || '0'}
          </div>
          <div className="text-green-100 text-sm">
            {todayEarnings?.servicesCount || 0} servicios completados
          </div>
        </div>

        {/* Month */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total del Mes</p>
                <p className="text-xs text-blue-200">
                  {format(new Date(), 'MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            RD$ {monthEarnings?.totalEarnings?.toLocaleString() || '0'}
          </div>
          <div className="text-blue-100 text-sm">
            {monthEarnings?.servicesCount || 0} servicios este mes
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-dark-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-600" />
          Servicios Más Solicitados
        </h2>
        
        {topServices.length > 0 ? (
          <div className="space-y-3">
            {topServices.map((service, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-dark-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark-900">{service.service_name}</p>
                  <p className="text-sm text-dark-600">
                    {service.count} veces • RD$ {parseFloat(service.total_revenue).toLocaleString()} total
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-primary-600 font-bold">
                    RD$ {(parseFloat(service.total_revenue) / parseInt(service.count)).toFixed(0)}
                  </div>
                  <div className="text-xs text-dark-600">promedio</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-dark-600 py-8">
            Aún no tienes servicios completados
          </p>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-dark-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          Historial de Pagos
        </h2>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-dark-200">
                  <th className="text-left py-3 px-4 font-semibold text-dark-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-700">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-700">Servicio</th>
                  <th className="text-right py-3 px-4 font-semibold text-dark-700">Monto</th>
                </tr>
              </thead>
              <tbody>
                {history.map((payment) => (
                  <tr key={payment.id} className="border-b border-dark-100 hover:bg-dark-50">
                    <td className="py-3 px-4 text-dark-600">
                      {format(new Date(payment.payment_date), 'PP', { locale: es })}
                      <br />
                      <span className="text-sm text-dark-500">
                        {payment.payment_time.slice(0, 5)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-dark-900">
                      {payment.client_name}
                    </td>
                    <td className="py-3 px-4 text-dark-600">
                      {payment.service_name || 'Personalizado'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      RD$ {parseFloat(payment.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-dark-600 py-8">
            No hay pagos registrados todavía
          </p>
        )}
      </div>

      {/* Summary Panel */}
      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="font-bold text-primary-900 mb-3">💡 Resumen</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• Los pagos se registran automáticamente al completar una cita</li>
          <li>• Puedes ver estadísticas mensuales y anuales</li>
          <li>• El historial incluye todos los servicios completados</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentsDashboard;