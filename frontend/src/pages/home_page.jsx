/**
 * PÁGINA PRINCIPAL (HOME)
 * Landing page pública con todas las secciones
 */

import Header from '../components/public/Header';
import Hero from '../components/public/Hero';
import ProfessionalsSection from '../components/public/ProfessionalsSection';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-6">
              Sobre Nosotros
            </h2>
            <p className="text-xl text-dark-600 leading-relaxed mb-8">
              Michael Barbershop es más que una barbería, es un espacio donde el estilo, 
              la tradición y la innovación se encuentran. Con más de 7 años de experiencia, 
              nuestro equipo de profesionales certificados está comprometido con ofrecer 
              los mejores cortes y servicios de barbería.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">7+</div>
                <div className="text-dark-700 font-semibold">Años de Experiencia</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-dark-700 font-semibold">Clientes Satisfechos</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-dark-700 font-semibold">Profesionalismo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Section */}
      <ProfessionalsSection />

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
              Galería
            </h2>
            <p className="text-xl text-dark-600">
              Nuestros trabajos hablan por nosotros
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {i}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.instagram.com/michaelbarbershop15"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-lg"
            >
              <Instagram className="w-6 h-6" />
              <span>Ver más en Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
                Contacto
              </h2>
              <p className="text-xl text-dark-600">
                Estamos aquí para atenderte
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Info */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900 mb-1">Ubicación</h3>
                    <p className="text-dark-600">
                      Bajos de Haina, San Cristobal, República Dominicana
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900 mb-1">Teléfono</h3>
                    <a
                      href="https://wa.me/18091234567"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      +1 809-123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900 mb-1">Email</h3>
                    <a
                      href="mailto:info@michaelbarbershop.com"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      info@michaelbarbershop.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-900 mb-1">Horario</h3>
                    <p className="text-dark-600">
                      Lunes - Domingo: 9:00 AM - 10:00 PM
                      <br />
                      (Abierto todos los días)
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-dark-200 rounded-xl h-80 flex items-center justify-center">
                <div className="text-center text-dark-600">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Mapa de ubicación</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-12 text-center">
              <h3 className="font-bold text-dark-900 mb-4">Síguenos</h3>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://www.instagram.com/michaelbarbershop15"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-dark-400">
            © 2025 Michael Barbershop. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
