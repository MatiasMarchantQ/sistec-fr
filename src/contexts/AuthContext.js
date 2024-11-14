import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            localStorage.clear();
            sessionStorage.clear();
            
            setToken(null);
            setUser(null);
            
            // Usar toast en lugar de setError
            toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            
            // Redirigir automáticamente a la página de inicio de sesión
            window.location.href = '/';
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
            localStorage.clear();
            sessionStorage.clear();
            
            toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            
            window.location.href = '/';
            return;
          }
    
          // Parsear los datos del usuario almacenados
          const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
    
          // Establecer el token y los datos del usuario
          setToken(storedToken);
          
          if (parsedUserData) {
            setUser(parsedUserData);
          } else {
            // Si no hay datos de usuario almacenados, intentar obtenerlos
            fetchUserData(storedToken);
          }
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          
          toast.error('Error de autenticación', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Limpiar datos en caso de error
          localStorage.clear();
          sessionStorage.clear();
        }
      }
      setLoading(false);
    };
    
    // Agregar una función para obtener datos del usuario
    const fetchUserData = async (token) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        const userData = {
          id: response.data.id,
          rol_id: response.data.rol_id,
          nombres: response.data.nombres,
          estudiante_id: response.data.estudiante_id
        };
    
        // Guardar en storage
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
        storage.setItem('userData', JSON.stringify(userData));
    
        setUser(userData);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        // Manejar el error, posiblemente limpiar el token y redirigir
        logout();
      }
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
  
      const { accessToken, refreshToken, nombres, estudiante_id, rol_id } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
  
      setToken(accessToken);
  
      const decoded = jwtDecode(accessToken);
      const userData = {
        id: decoded.id,
        rol_id: rol_id || decoded.rol_id,
        nombres: nombres || decoded.nombres,
        estudiante_id: estudiante_id || decoded.estudiante_id
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
      
      toast.error('Error al cerrar sesión', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      // Limpiar completamente
      localStorage.clear();
      sessionStorage.clear();
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