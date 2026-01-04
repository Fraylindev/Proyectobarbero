/**
 * SECCIÓN DE PROFESIONALES
 * Muestra el equipo de barberos con opción de reservar
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, Award } from 'lucide-react';
import { professionalService } from '../../services/api';
import toast from 'react-hot-toast';

const ProfessionalsSection = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await professionalService.getAll();
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error cargando profesionales:', error);
      toast.error('Error cargando profesionales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="professionals" className="py-20 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="professionals" className="py-20 bg-dark-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <span className="text-primary-700 font-semibold">Nuestro Equipo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
            Profesionales Expertos
          </h2>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Barberos certificados con años de experiencia listos para transformar tu look
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-80 bg-gradient-to-br from-primary-400 to-primary-600">
                {professional.photo_url ? (
                  <img
                    src={professional.photo_url}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-6xl font-bold">
                      {professional.name.charAt(0)}
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                {professional.is_available && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Disponible</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold text-dark-900 mb-2">
                  {professional.name}
                </h3>
                
                {professional.specialty && (
                  <div className="flex items-center space-x-2 text-primary-600 mb-3">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{professional.specialty}</span>
                  </div>
                )}

                <p className="text-dark-600 mb-6 line-clamp-3">
                  {professional.description || 'Profesional experimentado con pasión por el estilo y la perfección.'}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => navigate('/booking', { state: { professionalId: professional.id } })}
                  disabled={!professional.is_available}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    professional.is_available
                      ? 'bg-primary-600 text-white hover:bg-primary-700 transform hover:scale-105'
                      : 'bg-dark-200 text-dark-500 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>
                    {professional.is_available ? 'Reservar con ' + professional.name.split(' ')[0] : 'No disponible'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info: Debería haber 5 profesionales */}
        {professionals.length < 5 && professionals.length > 0 && (
          <div className="text-center mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800">
              ⚠️ Solo hay {professionals.length} profesional(es) disponible(s).
              Contacta al administrador para agregar más.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfessionalsSection;