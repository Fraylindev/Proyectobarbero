/**
 * DASHBOARD DE RESERVAS - ACTUALIZADO
 * Gestión de citas con lógica de botones mejorada
 */

import { useState, useEffect } from 'react';
import { Clock, Check, X, Phone, Mail, MessageCircle, DollarSign } from 'lucide-react';
import { bookingService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const BookingsDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings({ status: filter });
      setBookings(response.data);
    } catch (error) {
      toast.error('Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!confirm('¿Confirmar esta cita?')) return;

    setProcessingId(id);
    try {
      await bookingService.confirm(id);
      toast.success('Cita confirmada. Email enviado al cliente.');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error confirmando cita');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;

    setProcessingId(id);
    try {
      await bookingService.cancel(id);
      toast.success('Cita cancelada');
      loadBookings();
    } catch (error) {
      toast.error('Error cancelando cita');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async () => {
    if (!completeModal || !paymentAmount) {
      toast.error('Ingresa el monto cobrado');
      return;
    }

    setProcessingId(completeModal.id);
    try {
      await bookingService.complete(completeModal.id, parseFloat(paymentAmount), '');
      toast.success('Cita completada y pago registrado');
      setCompleteModal(null);
      setPaymentAmount('');
      loadBookings();
    } catch (error) {
      toast.error('Error completando cita');
    } finally {
      setProcessingId(null);
    }
  };

  const getWhatsAppLink = (booking) => {
    const message = `Hola ${booking.client_name}, soy tu barbero. Te confirmo tu cita para el ${format(new Date(booking.booking_date), 'PPP', { locale: es })} a las ${booking.booking_time.slice(0, 5)}`;
    return `https://wa.me/${booking.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const filters = [
    { value: 'PENDING', label: 'Pendientes', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Confirmadas', color: 'blue' },
    { value: 'COMPLETED', label: 'Completadas', color: 'green' },
    { value: 'CANCELLED', label: 'Canceladas', color: 'red' },
  ];

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.booking_date === today && b.status === 'CONFIRMED');

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-900 mb-2">
          Mis Reservas
        </h1>
        <p className="text-dark-600">Gestiona tus citas y horarios</p>
      </div>

      {/* Today's Appointments */}
      {todayBookings.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-md">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Citas de hoy ({todayBookings.length})
          </h2>
          <div className="space-y-3">
            {todayBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600">{booking.booking_time.slice(0, 5)}</span>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.client_name}</p>
                      <p className="text-sm text-gray-600">{booking.service_name || booking.service_custom}</p>
                    </div>
                  </div>
                </div>
                <a
                  href={getWhatsAppLink(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Contactar por WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f.value
                ? `bg-${f.color}-100 text-${f.color}-700 ring-2 ring-${f.color}-500 shadow-md`
                : 'bg-white text-dark-600 hover:bg-dark-50 border border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando reservas...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-600 text-lg">No hay reservas en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'PENDING' ? '⏳ Pendiente' :
                       booking.status === 'CONFIRMED' ? '✅ Confirmada' :
                       booking.status === 'COMPLETED' ? '✔️ Completada' :
                       '❌ Cancelada'}
                    </span>
                    <span className="text-dark-600 font-medium">
                      {format(new Date(booking.booking_date), 'PPP', { locale: es })}
                    </span>
                    <span className="font-bold text-lg text-primary-600">
                      {booking.booking_time.slice(0, 5)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-dark-900 mb-3">{booking.client_name}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-dark-600">
                      <Phone className="w-4 h-4 text-primary-600" />
                      <span>{booking.client_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-600">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <span>{booking.client_email}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                    <p className="font-semibold text-dark-900">
                      📋 {booking.service_name || booking.service_custom}
                    </p>
                    {booking.price_estimate && (
                      <p className="text-primary-600 font-bold mt-1">
                        💵 Precio estimado: RD$ {booking.price_estimate}
                      </p>
                    )}
                  </div>

                  {booking.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-dark-700">
                        <strong>Comentarios:</strong> {booking.comments}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {/* WhatsApp - Siempre visible */}
                  <a
                    href={getWhatsAppLink(booking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Confirmar - Solo si está PENDING */}
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar</span>
                    </button>
                  )}

                  {/* Completar - Solo si está CONFIRMED */}
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setCompleteModal(booking)}
                      disabled={processingId === booking.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Completar</span>
                    </button>
                  )}

                  {/* Cancelar - Solo si está PENDING o CONFIRMED */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium shadow-md"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Completar Cita</h2>
            <p className="text-gray-600 mb-2">
              Cliente: <strong className="text-gray-900">{completeModal.client_name}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Servicio: <strong className="text-gray-900">{completeModal.service_name || completeModal.service_custom}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Monto cobrado (RD$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={completeModal.price_estimate || "0.00"}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCompleteModal(null);
                  setPaymentAmount('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={!paymentAmount || processingId}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium shadow-md transition-colors"
              >
                {processingId ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsDashboard;