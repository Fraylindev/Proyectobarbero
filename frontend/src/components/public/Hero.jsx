/**
 * HERO SECTION
 * Sección principal de bienvenida con CTA
 */

import { useNavigate } from 'react-router-dom';
import { Calendar, Award, Clock } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-600/20 border border-primary-500/30 px-4 py-2 rounded-full mb-8">
            <Award className="w-5 h-5 text-primary-400" />
            <span className="text-primary-300 font-medium">Barbería Premium en Bajos de Haina</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Tu Estilo,
            <br />
            <span className="text-primary-500">Nuestra Pasión</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-dark-300 mb-12 max-w-2xl mx-auto">
            Cortes modernos, servicios premium y atención personalizada. 
            Reserva tu cita en segundos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/booking')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-primary-500/50"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-lg font-semibold">Reservar Ahora</span>
            </button>
            <a
              href="#professionals"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
            >
              <span className="text-lg font-semibold">Ver Profesionales</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
              <div className="text-4xl font-bold text-primary-500 mb-2">7+</div>
              <div className="text-dark-300">Años de Experiencia</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
              <div className="text-4xl font-bold text-primary-500 mb-2">1000+</div>
              <div className="text-dark-300">Clientes Satisfechos</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
              <Clock className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <div className="text-dark-300">Lun - Dom: 9AM - 10PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;