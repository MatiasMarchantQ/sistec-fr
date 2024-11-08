// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Configurar el interceptor de Axios
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Si no estamos en la página de cambiar contraseña
          if (!window.location.pathname.includes('/cambiar-contrasena') && window.location.pathname !== '/') {
            sessionStorage.removeItem('userData');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            
            setToken(null);
            setUser(null);
                        
            setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          }
        }
        return Promise.reject(error);
      }
    );

    // Verificar token existente
      const initializeAuth = () => {
      const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');

      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          // Verificar si el token ha expirado
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token expirado
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            window.location.href = '/';
            setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
            return;
          }

          let userData = {
            id: decoded.id,
            rol: decoded.rol,
            estudiante_id: decoded.estudiante_id // Añadir estudiante_id desde el token
          };

          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            userData = {
              ...userData,
              nombres: parsedUserData.nombres,
              estudiante_id: parsedUserData.estudiante_id // También lo guardamos aquí por si acaso
            };
          }

          setToken(storedToken);
          setUser(userData);
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          setError('Error de autenticación');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  const login = async (rut, contrasena, rememberMe) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        rut,
        contrasena,
        rememberMe
      });
  
      const { accessToken, refreshToken, nombres, estudiante_id } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
  
      setToken(accessToken);
  
      const decoded = jwtDecode(accessToken);
      const userData = {
        id: decoded.id,
        rol: decoded.rol,
        nombres: nombres || decoded.nombres,
        estudiante_id: estudiante_id || decoded.estudiante_id // Añadir estudiante_id
      };
  
      // Guardar userData en storage
      storage.setItem('userData', JSON.stringify(userData));
  
      setUser(userData);
      setError('');
      return response.data;
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Error de autenticación');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      setLoading(true);
      if (token) {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const getToken = () => token;

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    getToken,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};