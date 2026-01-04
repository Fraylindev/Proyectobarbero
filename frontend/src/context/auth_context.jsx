/**
 * CONTEXTO DE AUTENTICACIÓN
 * Gestión global del estado de autenticación
 */

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const storedUserType = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUserType || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      // Verificar token con el backend
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.data.user || response.data.data);
      //setUser(response.data.data);
      setUserType(storedUserType);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // Si falla, limpiar todo
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      setUser(null);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  // Reemplaza tu función login en auth_context.jsx por esta:
const login = (userData, type, tokens) => {
  // 1. Validamos que tengamos los datos necesarios
  if (!userData || !tokens) {
    console.error("Error: Datos de login incompletos", { userData, type, tokens });
    return;
  }
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userType', type);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setUserType(type);

    // 4. Forzamos que loading sea false para que el Dashboard sepa que ya puede renderizar
   setLoading(false); 
   };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await axios.post('http://localhost:5000/api/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      setUser(null);
      setUserType(null);
    }
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isProfessional: userType?.toUpperCase() === 'PROFESSIONAL',
    isClient: userType === 'CLIENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};