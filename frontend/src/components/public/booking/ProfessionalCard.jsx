import React from 'react';
import { Star, User } from 'lucide-react';

/**
 * PROFESSIONAL CARD
 * Componente para un profesional específico
 * Siguiendo la lógica de props del usuario y el diseño de la imagen
 */
const ProfessionalCard = ({ professional, isSelected, onSelect, onViewProfile }) => {
  // Asumiendo que 'professional' tiene: id, name, role, rating, image
  const { name, role, rating, image } = professional;

  return (
    <div 
      onClick={() => onSelect(professional.id)}
      className={`group relative flex items-center justify-between p-4 mb-3 bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:border-blue-400 hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar con Rating flotante - Estilo Imagen Referencia */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
            {image ? (
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>
          {/* Badge de Rating (5.0) */}
          <div className="absolute -bottom-1 -left-1 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
            <span className="text-[11px] font-bold text-gray-800">{rating || '5.0'}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {name}
          </h3>
          <p className="text-sm text-gray-500">
            {role || 'Peluquero'}
          </p>
          {/* Botón Ver Perfil con stopPropagation para no activar la selección */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile && onViewProfile(professional.id);
            }}
            className="text-xs font-medium text-gray-400 hover:text-blue-600 mt-1 text-left transition-colors"
          >
            Ver perfil
          </button>
        </div>
      </div>

      {/* Botón de acción con lógica original */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(professional.id);
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

export default ProfessionalCard;