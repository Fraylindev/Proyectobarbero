/**
 * PROFESSIONAL PROFILE MODAL
 * Modal con perfil completo del profesional (tabs: Acerca de | Portafolio)
 */

import { useState, useEffect } from 'react';
import { X, Star, Briefcase, Users, Phone, Mail, Award } from 'lucide-react';
import axios from 'axios';

const ProfessionalProfileModal = ({ professional, isOpen, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'portfolio') {
      loadGallery();
    }
  }, [isOpen, activeTab, professional?.id]);

  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/gallery/${professional.id}`);
      setGallery(response.data.data || []);
    } catch (error) {
      console.error('Error cargando galería:', error);
      setGallery([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  if (!isOpen || !professional) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const renderPhoto = () => {
    if (professional.photo_url) {
      return (
        <img 
          src={professional.photo_url} 
          alt={professional.name}
          className="w-full h-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-5xl font-bold">
        {professional.name.charAt(0)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-6">
            {/* Foto */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white/30 flex-shrink-0">
              {renderPhoto()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{professional.name}</h2>
                {professional.role === 'PROFESSIONAL_ADMIN' && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    👑 Admin
                  </span>
                )}
              </div>

              {professional.specialty && (
                <p className="text-primary-100 text-lg mb-3">{professional.specialty}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {renderStars(professional.rating || 5.0)}
                </div>
                <span className="text-xl font-bold">
                  {(professional.rating || 5.0).toFixed(1)}
                </span>
                <span className="text-primary-100">
                  ({professional.total_reviews || 0} {professional.total_reviews === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>

              {/* Métricas */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-200" />
                  <div>
                    <p className="text-primary-200 text-xs">Citas completadas</p>
                    <p className="text-xl font-bold">{professional.completed_bookings || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-200" />
                  <div>
                    <p className="text-primary-200 text-xs">Clientes atendidos</p>
                    <p className="text-xl font-bold">{professional.total_clients || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'about'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Acerca de
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'portfolio'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Portafolio
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Descripción */}
              {professional.description && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-600" />
                    Sobre mí
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{professional.description}</p>
                </div>
              )}

              {/* Contacto */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-gray-600">Teléfono / WhatsApp</p>
                      <p className="font-semibold text-gray-900">{professional.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{professional.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Disponibilidad</h3>
                <div className={`p-4 rounded-lg border-2 ${
                  professional.is_available
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      professional.is_available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span className={`font-semibold ${
                      professional.is_available ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {professional.is_available ? 'Disponible para reservas' : 'No disponible actualmente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mis trabajos</h3>
              
              {loadingGallery ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Cargando portafolio...</p>
                </div>
              ) : gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div 
                      key={item.id} 
                      className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <img 
                        src={item.image_url} 
                        alt={item.description || 'Trabajo'}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 mb-2">No hay trabajos en el portafolio aún</p>
                  <p className="text-sm text-gray-500">Pronto habrá ejemplos de mis trabajos</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con botón de selección */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl font-semibold hover:bg-white transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onSelect(professional.id);
                onClose();
              }}
              className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md"
            >
              Seleccionar a {professional.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileModal;