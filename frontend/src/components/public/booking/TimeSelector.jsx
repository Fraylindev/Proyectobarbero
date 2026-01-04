/**
 * SELECTOR DE HORA
 * Lista de sugerencias + Input manual
 */

import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const TimeSelector = ({ 
  selectedTime, 
  onSelectTime, 
  availableSlots = [],
  workingHours = { start: '09:00', end: '22:00' },
  bookedTimes = [],
  date 
}) => {
  const [manualTime, setManualTime] = useState('');
  const [validationMessage, setValidationMessage] = useState(null);

  const validateTime = (time) => {
    if (!time) return null;

    // Formato HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return { type: 'error', message: 'Formato inválido. Usa HH:MM (ejemplo: 14:30)' };
    }

    // Verificar horario laboral
    const [hours, minutes] = time.split(':').map(Number);
    const [startH, startM] = workingHours.start.split(':').map(Number);
    const [endH, endM] = workingHours.end.split(':').map(Number);

    const timeInMinutes = hours * 60 + minutes;
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;

    if (timeInMinutes < startInMinutes || timeInMinutes > endInMinutes) {
      return { 
        type: 'error', 
        message: `⏰ Fuera del horario laboral (${workingHours.start} - ${workingHours.end})` 
      };
    }

    // Verificar si está ocupado
    const timeWithSeconds = `${time}:00`;
    if (bookedTimes.includes(timeWithSeconds)) {
      // Buscar alternativas cercanas
      const alternatives = availableSlots
        .filter(slot => {
          const slotMinutes = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);
          return Math.abs(slotMinutes - timeInMinutes) <= 60; // Dentro de 1 hora
        })
        .slice(0, 3);

      return {
        type: 'warning',
        message: `⚠️ Esta hora está ocupada. Prueba: ${alternatives.join(', ') || 'Ver otras opciones'}`
      };
    }

    return { type: 'success', message: '✅ Hora disponible' };
  };

  const handleManualTimeChange = (e) => {
    const time = e.target.value;
    setManualTime(time);
    
    if (time.length === 5) {
      const validation = validateTime(time);
      setValidationMessage(validation);
      
      if (validation?.type === 'success') {
        onSelectTime(`${time}:00`);
      }
    } else {
      setValidationMessage(null);
    }
  };

  const handleSlotClick = (slot) => {
    onSelectTime(slot);
    setManualTime('');
    setValidationMessage(null);
  };

  // Generar slots sugeridos si no hay disponibles
  const generateDefaultSlots = () => {
    const slots = [];
    const [startH] = workingHours.start.split(':').map(Number);
    const [endH] = workingHours.end.split(':').map(Number);

    for (let h = startH; h <= endH; h++) {
      ['00', '30'].forEach(m => {
        if (h === endH && m === '30') return;
        const time = `${String(h).padStart(2, '0')}:${m}:00`;
        if (!bookedTimes.includes(time)) {
          slots.push(time);
        }
      });
    }
    return slots;
  };

  const displaySlots = availableSlots.length > 0 ? availableSlots : generateDefaultSlots();

  return (
    <div className="space-y-6">
      {/* Input Manual */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-dark-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Escribe tu hora preferida
        </h3>
        
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={manualTime}
              onChange={handleManualTimeChange}
              placeholder="14:30"
              maxLength="5"
              className="w-full px-4 py-3 text-lg font-mono border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-dark-600 mt-2">
              Formato: HH:MM (ejemplo: 14:30)
            </p>
          </div>

          {validationMessage && (
            <div className={`flex-1 p-4 rounded-lg flex items-start space-x-3 ${
              validationMessage.type === 'success' ? 'bg-green-50 border border-green-200' :
              validationMessage.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              {validationMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                validationMessage.type === 'success' ? 'text-green-800' :
                validationMessage.type === 'warning' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {validationMessage.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Horarios Sugeridos */}
      <div>
        <h3 className="font-bold text-dark-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          O selecciona de las opciones disponibles
        </h3>

        {displaySlots.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displaySlots.map((slot) => {
              const timeDisplay = slot.slice(0, 5);
              const isSelected = selectedTime === slot;

              return (
                <button
                  key={slot}
                  onClick={() => handleSlotClick(slot)}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                      : 'border-dark-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {timeDisplay}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium mb-2">
              No hay horarios predefinidos disponibles
            </p>
            <p className="text-yellow-700 text-sm">
              Usa el campo de arriba para escribir tu hora preferida<br />
              (entre {workingHours.start} y {workingHours.end})
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-dark-50 border border-dark-200 rounded-lg p-4">
        <p className="text-sm text-dark-700">
          <strong>Horario laboral:</strong> {workingHours.start} - {workingHours.end}
        </p>
        <p className="text-sm text-dark-600 mt-1">
          💡 Si tu hora preferida no aparece, escríbela manualmente arriba
        </p>
      </div>
    </div>
  );
};

export default TimeSelector;