/**
 * CALENDARIO VISUAL PROFESIONAL
 * Selección de fecha para reservas
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendar = ({ selectedDate, onSelectDate, blockedDates = [], professionalSchedule = {} }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener día de la semana del primer día (0 = Domingo)
  const firstDayOfWeek = monthStart.getDay();
  
  // Días para llenar el calendario (semana completa)
  const daysToShow = [];
  
  // Agregar días vacíos al inicio
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysToShow.push(null);
  }
  
  // Agregar días del mes
  daysToShow.push(...daysInMonth);

  const today = startOfToday();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDayBlocked = (day) => {
    if (!day) return false;
    
    // Verificar si está en la lista de bloqueados
    const dateStr = format(day, 'yyyy-MM-dd');
    if (blockedDates.includes(dateStr)) return true;

    // Verificar si el profesional trabaja ese día
    const dayOfWeek = day.getDay();
    if (professionalSchedule[dayOfWeek] === false) return true;

    return false;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    if (isBefore(day, today)) return;
    if (isDayBlocked(day)) return;
    
    onSelectDate(format(day, 'yyyy-MM-dd'));
  };

  const getDayClassName = (day) => {
    if (!day) return 'invisible';

    const isPast = isBefore(day, today);
    const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
    const isCurrentDay = isToday(day);
    const isBlocked = isDayBlocked(day);

    let classes = 'relative p-3 rounded-lg text-center cursor-pointer transition-all ';

    if (isPast) {
      classes += 'text-dark-300 cursor-not-allowed bg-dark-50';
    } else if (isBlocked) {
      classes += 'text-dark-400 bg-red-50 cursor-not-allowed line-through';
    } else if (isSelected) {
      classes += 'bg-primary-600 text-white font-bold shadow-lg transform scale-105';
    } else if (isCurrentDay) {
      classes += 'bg-blue-100 text-blue-900 font-semibold border-2 border-blue-400 hover:bg-blue-200';
    } else {
      classes += 'hover:bg-primary-50 hover:text-primary-700 font-medium';
    }

    return classes;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-dark-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-dark-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {daysToShow.map((day, idx) => (
          <div
            key={idx}
            onClick={() => handleDayClick(day)}
            className={getDayClassName(day)}
          >
            {day && (
              <>
                <div className="text-lg">
                  {format(day, 'd')}
                </div>
                {isToday(day) && !isBefore(day, today) && (
                  <div className="text-xs mt-1">Hoy</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-dark-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
            <span className="text-dark-600">Hoy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span className="text-dark-600">Seleccionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-50 rounded"></div>
            <span className="text-dark-600">No disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;