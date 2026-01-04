/**
 * SERVICE SELECTOR
 * Selector de servicios con búsqueda y diseño limpio
 */

import { useState } from 'react';
import { Search, ChevronDown, Scissors, DollarSign, Clock } from 'lucide-react';

const ServiceSelector = ({ 
  services, 
  selectedServiceId, 
  customService,
  onSelectService,
  onCustomServiceChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar servicios según búsqueda
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Servicio seleccionado
  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleSelectService = (service) => {
    onSelectService(service.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomServiceSelect = () => {
    onSelectService('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Selector principal */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecciona el servicio *
        </label>
        
        {/* Dropdown button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-4 border-2 rounded-xl text-left flex items-center justify-between transition-all ${
            selectedServiceId || customService
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-300 hover:border-primary-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <Scissors className={`w-5 h-5 ${selectedServiceId || customService ? 'text-primary-600' : 'text-gray-400'}`} />
            <div className="flex-1 min-w-0">
              {selectedService ? (
                <div>
                  <p className="font-semibold text-gray-900 truncate">{selectedService.name}</p>
                  <p className="text-sm text-gray-600 truncate">{selectedService.description}</p>
                </div>
              ) : customService ? (
                <div>
                  <p className="font-semibold text-gray-900">Otro servicio</p>
                  <p className="text-sm text-gray-600 truncate">{customService}</p>
                </div>
              ) : (
                <p className="text-gray-500">Seleccionar servicio...</p>
              )}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
            {/* Búsqueda */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de servicios */}
            <div className="max-h-80 overflow-y-auto">
              {filteredServices.length > 0 ? (
                <div className="p-2">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className={`w-full p-4 rounded-lg text-left hover:bg-primary-50 transition-colors mb-2 ${
                        selectedServiceId === service.id ? 'bg-primary-100 ring-2 ring-primary-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {service.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration_minutes} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {service.price_estimate && (
                          <div className="flex items-center gap-1 text-primary-600 font-bold whitespace-nowrap">
                            <DollarSign className="w-4 h-4" />
                            <span>{service.price_estimate}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron servicios</p>
                  <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                </div>
              )}

              {/* Opción: Otro servicio */}
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={handleCustomServiceSelect}
                  className={`w-full p-4 rounded-lg text-left hover:bg-blue-50 transition-colors ${
                    customService ? 'bg-blue-100 ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Otro servicio</p>
                      <p className="text-sm text-gray-600">Especificar manualmente</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input para servicio personalizado */}
      {!selectedServiceId && (
        <div className={`p-4 border-2 rounded-xl transition-all ${
          customService ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Describe el servicio que necesitas
          </label>
          <input
            type="text"
            value={customService}
            onChange={(e) => onCustomServiceChange(e.target.value)}
            placeholder="Ej: Corte con diseño especial, coloración, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-2">
            💡 Describe lo que necesitas y el profesional te atenderá según tus indicaciones
          </p>
        </div>
      )}

      {/* Preview del servicio seleccionado */}
      {selectedService && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary-600" />
                {selectedService.name}
              </h4>
              {selectedService.description && (
                <p className="text-sm text-gray-700 mb-3">{selectedService.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                {selectedService.duration_minutes && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{selectedService.duration_minutes} minutos</span>
                  </div>
                )}
                {selectedService.price_estimate && (
                  <div className="flex items-center gap-1 text-primary-700 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>RD$ {selectedService.price_estimate}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;