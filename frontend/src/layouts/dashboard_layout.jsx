/**
 * LAYOUT DEL DASHBOARD
 * Estructura con sidebar y navegación para profesionales
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, DollarSign, Clock, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/auth_context';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Definimos professional como el usuario actual para mantener tus referencias
  const professional = user;

  // Verificación de seguridad: Redirigir si no es un profesional
  useEffect(() => {
  if (!loading && user) {
    // Normalizamos a mayúsculas solo para la comparación
    const userRole = user.role?.toUpperCase();
    const isProfessional = userRole === 'PROFESSIONAL' || userRole === 'PROFESSIONAL_ADMIN';
    
    if (!isProfessional) {
      navigate('/'); 
    }
  }
}, [user, loading, navigate]);
  // useEffect(() => {
  //   if (!loading && user) {
  //     const isProfessional = user.role === 'PROFESSIONAL' || user.role === 'PROFESSIONAL_ADMIN';
  //     if (!isProfessional) {
  //       navigate('/'); // Redirigir a la página principal si no es profesional
  //     }
  //   }
  // }, [user, loading, navigate]);

  const menuItems = [
    { icon: Calendar, label: 'Reservas', path: '/dashboard' },
    { icon: Clock, label: 'Disponibilidad', path: '/dashboard/availability' },
    { icon: DollarSign, label: 'Pagos', path: '/dashboard/payments' },
    { icon: User, label: 'Mi Perfil', path: '/dashboard/profile' },
  ];

  // Agregar opción de Admin solo si es PROFESSIONAL_ADMIN
  const isAdmin = user?.role?.toUpperCase() === 'PROFESSIONAL_ADMIN';
  //const isAdmin = user?.role === 'PROFESSIONAL_ADMIN';
  if (isAdmin) {
    // Insertar antes de "Mi Perfil"
    const adminItem = {
      icon: () => <span className="text-xl">👑</span>,
      label: 'Administración',
      path: '/dashboard/admin'
    };
    if (!menuItems.find(item => item.path === '/dashboard/admin')) {
      menuItems.splice(3, 0, adminItem);
    }
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mientras carga o si no hay usuario, no renderizamos el dashboard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Por esto (para diagnóstico):
if (!user) {
  console.log("DashboardLayout: No hay usuario, redirigiendo...");
  return <div className="p-10 text-center">Cargando datos de usuario...</div>;
}

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            {professional?.name?.charAt(0)}
          </div>
          <span className="font-semibold text-dark-900">{professional?.name}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b border-dark-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl">
                {professional?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-dark-900 truncate">{professional?.name}</h3>
                <p className="text-sm text-dark-600 truncate">{professional?.specialty || 'Profesional'}</p>
              </div>
            </div>
            {professional?.is_available ? (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>Disponible</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-dark-500 text-sm">
                <div className="w-2 h-2 bg-dark-500 rounded-full"></div>
                <span>No disponible</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-dark-700 hover:bg-dark-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-dark-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;


















