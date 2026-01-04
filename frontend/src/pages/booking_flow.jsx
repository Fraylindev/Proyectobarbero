/**
 * FLUJO DE RESERVA - ACTUALIZADO CON FASE 2 Y 3
 * Selector de servicios mejorado + Registro opcional
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, MessageSquare, Phone, Mail } from 'lucide-react';
import { professionalService, serviceService, bookingService } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Calendar from '../components/public/booking/Calendar';
import TimeSelector from '../components/public/booking/TimeSelector';
import ProfessionalCard from '../components/public/booking/ProfessionalCard';
import ProfessionalProfileModal from '../components/public/booking/ProfessionalProfileModal';
import AnyProfessionalCard from '../components/public/booking/AnyProfessionalCard';
import ServiceSelector from '../components/public/booking/ServiceSelector';
import OptionalRegistration from '../components/public/booking/OptionalRegistration';
import toast from 'react-hot-toast';

const STEPS = ['Profesional', 'Fecha y Hora', 'Servicio', 'Datos'];

const BookingFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfessionalForModal, setSelectedProfessionalForModal] = useState(null);
  
  const [formData, setFormData] = useState({
    professionalId: location.state?.professionalId || '',
    serviceId: '',
    serviceCustom: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    bookingDate: '',
    bookingTime: '',
    comments: '',
    // Datos de registro opcional
    registrationData: null
  });

  useEffect(() => {
    loadProfessionals();
    loadServices();
  }, []);

  useEffect(() => {
    if (formData.professionalId && formData.professionalId !== 'ANY' && formData.bookingDate) {
      loadAvailableSlots();
    } else if (formData.professionalId === 'ANY' && formData.bookingDate) {
      loadAvailableSlotsForAny();
    }
  }, [formData.professionalId, formData.bookingDate]);

  const loadProfessionals = async () => {
    try {
      const response = await professionalService.getAll();
      setProfessionals(response.data.filter(p => p.is_available));
    } catch (error) {
      toast.error('Error cargando profesionales');
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceService.getAll();
      setServices(response.data);
    } catch (error) {
      toast.error('Error cargando servicios');
    }
  };

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await professionalService.getAvailableSlots(
        formData.professionalId,
        formData.bookingDate
      );
      
      const slots = response.data.availableSlots || [];
      setAvailableSlots(slots);
      
      const bookingsResponse = await bookingService.getMyBookings?.({ 
        date: formData.bookingDate,
        status: 'CONFIRMED'
      });
      
      if (bookingsResponse?.data) {
        const booked = bookingsResponse.data.map(b => b.booking_time);
        setBookedTimes(booked);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setAvailableSlots([]);
      setBookedTimes([]);
      
      if (error.response?.status !== 404) {
        toast.error('Error cargando horarios disponibles');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlotsForAny = async () => {
    setLoading(true);
    try {
      const allSlots = new Set();
      
      for (const prof of professionals) {
        try {
          const response = await professionalService.getAvailableSlots(
            prof.id,
            formData.bookingDate
          );
          response.data.availableSlots?.forEach(slot => allSlots.add(slot));
        } catch (error) {
          console.error(`Error con profesional ${prof.id}:`, error);
        }
      }
      
      setAvailableSlots(Array.from(allSlots).sort());
      setBookedTimes([]);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.professionalId) {
          toast.error('Selecciona un profesional');
          return false;
        }
        return true;
      case 1:
        if (!formData.bookingDate) {
          toast.error('Selecciona una fecha');
          return false;
        }
        if (!formData.bookingTime) {
          toast.error('Selecciona una hora');
          return false;
        }
        return true;
      case 2:
        if (!formData.serviceId && !formData.serviceCustom) {
          toast.error('Selecciona un servicio o especifica uno');
          return false;
        }
        return true;
      case 3:
        if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
          toast.error('Completa todos los campos obligatorios');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.clientEmail)) {
          toast.error('Email inválido');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Crear reserva
      const bookingData = {
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        serviceCustom: formData.serviceCustom,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
        comments: formData.comments,
        // Incluir datos de registro si optó por registrarse
        registerClient: formData.registrationData ? true : false,
        username: formData.registrationData?.username,
        password: formData.registrationData?.password
      };

      await bookingService.create(bookingData);
      
      if (formData.registrationData) {
        toast.success('¡Reserva creada y cuenta registrada exitosamente!');
      } else {
        toast.success('¡Reserva enviada exitosamente!');
      }
      
      navigate('/booking-success');
    } catch (error) {
      const message = error.response?.data?.message || 'Error creando la reserva';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfessional = formData.professionalId === 'ANY' 
    ? { name: 'Cualquier profesional disponible' }
    : professionals.find(p => p.id === formData.professionalId);
    
  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al inicio</span>
        </button>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                    index <= currentStep 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }`}>
                    {index < currentStep ? <Check className="w-6 h-6" /> : index + 1}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Step 0: Select Professional */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-4xl font-display font-bold mb-3 text-gray-900">
                Selecciona tu barbero
              </h2>
              <p className="text-gray-600 mb-8">
                Elige a tu profesional favorito o selecciona cualquier barbero disponible
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnyProfessionalCard
                  isSelected={formData.professionalId === 'ANY'}
                  onSelect={(id) => setFormData({ ...formData, professionalId: id })}
                  professionalCount={professionals.length}
                />

                {professionals.map((prof) => (
                  <ProfessionalCard
                    key={prof.id}
                    professional={prof}
                    isSelected={formData.professionalId === prof.id}
                    onSelect={(id) => setFormData({ ...formData, professionalId: id })}
                    onViewProfile={(prof) => setSelectedProfessionalForModal(prof)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select Date and Time */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Fecha y hora</h2>
              <p className="text-gray-600 mb-6">
                {formData.professionalId === 'ANY' 
                  ? 'Horarios disponibles con cualquier profesional'
                  : `Con ${selectedProfessional?.name}`
                }
              </p>

              <div className="mb-8">
                <Calendar
                  selectedDate={formData.bookingDate}
                  onSelectDate={(date) => {
                    setFormData({ ...formData, bookingDate: date, bookingTime: '' });
                  }}
                  blockedDates={[]}
                  professionalSchedule={{}}
                />
              </div>

              {formData.bookingDate && (
                <div className="mt-8">
                  <TimeSelector
                    selectedTime={formData.bookingTime}
                    onSelectTime={(time) => setFormData({ ...formData, bookingTime: time })}
                    availableSlots={availableSlots}
                    workingHours={{ start: '09:00', end: '22:00' }}
                    bookedTimes={bookedTimes}
                    date={formData.bookingDate}
                  />
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando horarios disponibles...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Service */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Selecciona el servicio</h2>
              <ServiceSelector
                services={services}
                selectedServiceId={formData.serviceId}
                customService={formData.serviceCustom}
                onSelectService={(id) => setFormData({ ...formData, serviceId: id, serviceCustom: '' })}
                onCustomServiceChange={(value) => setFormData({ ...formData, serviceCustom: value, serviceId: '' })}
              />
            </div>
          )}

          {/* Step 3: Client Data */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Tus datos</h2>
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="809-123-4567"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comentarios (opcional)
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Alguna preferencia o comentario adicional"
                  />
                </div>

                {/* Registro Opcional */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <OptionalRegistration
                    ref={registrationRef}
                    clientEmail={formData.clientEmail}
                    onRegister={(data) => setFormData({ ...formData, registrationData: data })}
                  />
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-6 mt-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary-600" />
                    Resumen de tu reserva
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Profesional:</strong> {selectedProfessional?.name}</p>
                    <p><strong>Fecha:</strong> {formData.bookingDate ? format(new Date(formData.bookingDate + 'T00:00:00'), 'PPP', { locale: es }) : 'No seleccionada'}</p>
                    <p><strong>Hora:</strong> {formData.bookingTime ? formData.bookingTime.slice(0, 5) : 'No seleccionada'}</p>
                    <p><strong>Servicio:</strong> {selectedService?.name || formData.serviceCustom || 'No seleccionado'}</p>
                    {selectedService?.price_estimate && (
                      <p><strong>Precio estimado:</strong> RD$ {selectedService.price_estimate}</p>
                    )}
                    {formData.registrationData && (
                      <p className="pt-2 border-t border-primary-300">
                        <strong className="text-green-700">✓ Se creará tu cuenta de usuario</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Anterior</span>
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg transition-all"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Confirmar Reserva</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal de perfil */}
      <ProfessionalProfileModal
        professional={selectedProfessionalForModal}
        isOpen={!!selectedProfessionalForModal}
        onClose={() => setSelectedProfessionalForModal(null)}
        onSelect={(id) => setFormData({ ...formData, professionalId: id })}
      />
    </div>
  );
};

export default BookingFlow;