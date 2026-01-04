import React from 'react';
import { Users, Star } from 'lucide-react';

/**
 * ANY PROFESSIONAL CARD
 * Opción para seleccionar cualquier profesional disponible
 * MANTENIENDO LA LÓGICA ORIGINAL: props { isSelected, onSelect, professionalCount }
 */
const AnyProfessionalCard = ({ isSelected, onSelect, professionalCount }) => {
  return (
    <div 
      onClick={() => onSelect('ANY')}
      className={`group relative flex items-center justify-between p-4 mb-3 bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:border-blue-400 hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icono circular con fondo suave - Estilo Imagen Referencia */}
        <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
          <Users className="w-7 h-7 text-blue-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            Cualquier profesional
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            para máxima disponibilidad ({professionalCount} disponibles)
          </p>
        </div>
      </div>

      {/* Botón con lógica original de stopPropagation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect('ANY');
        }}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
          isSelected 
            ? 'bg-blue-600 text-white border border-blue-600' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        {isSelected ? 'Seleccionado' : 'Seleccionar'}
      </button>
    </div>
  );
};


export default AnyProfessionalCard;