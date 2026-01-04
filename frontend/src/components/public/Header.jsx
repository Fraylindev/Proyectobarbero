/**
 * HEADER - NAVEGACIÓN PRINCIPAL
 * Barra de navegación responsive con enlaces
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, Calendar, LogIn } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Profesionales', href: '#professionals' },
    { name: 'Galería', href: '#gallery' },
    { name: 'Contacto', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Scissors className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-display font-bold text-dark-900">
              Michael Barbershop
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-dark-700 hover:text-primary-600 transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/booking')}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Cita</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 border-2 border-dark-300 text-dark-700 px-6 py-2 rounded-lg hover:bg-dark-50 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Acceso Pro</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-dark-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block text-dark-700 hover:text-primary-600 transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                navigate('/booking');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Cita</span>
            </button>
            <button
              onClick={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 border-2 border-dark-300 text-dark-700 px-6 py-3 rounded-lg hover:bg-dark-50 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Acceso Profesionales</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;