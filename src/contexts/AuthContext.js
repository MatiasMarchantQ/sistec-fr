import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser ] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

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
      if (!isUnauthorized) {
        setIsUnauthorized(true);
        toast.error('Error al cerrar sesión', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            setIsUnauthorized(false);
          }
        });
      }
    } finally {
      // Limpiar completamente
      localStorage.clear();
      sessionStorage.clear();
      setToken(null);
      setUser (null);
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser (null);
    alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.'); // Usar alert en lugar de toast
    window.location.href = '/'; // Redirigir a la página de inicio de sesión
  };

  // Configurar el interceptor de Axios
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          // Verificar si el token ha expirado
          if (decoded.exp < currentTime) {
            handleSessionExpired();
            return Promise.reject(new Error('Token expirado'));
          }

          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Verificar token existente
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        // Verificar si el token ha expirado
        if (decoded.exp < currentTime) {
          handleSessionExpired();
          return;
        }

        const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
        setToken(storedToken);
        if (parsedUserData) {
          setUser (parsedUserData);
        } else {
          fetchUserData(storedToken);
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        handleSessionExpired();
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
        estudiante_id: response.data.estudiante_id,
        es_estudiante: response.data.rol_id === 3 // Agregar una bandera para identificar estudiantes
      };

      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(userData));
      setUser (userData);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      alert('Error al obtener datos del usuario: ' + error.message); // Usar alert
      logout();
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (rut, contrasena, rememberMe) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login2`, {
        rut,
        contrasena,
        rememberMe
      });
  
      const { accessToken, nombres, estudiante_id, rol_id } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
  
      storage.setItem('accessToken', accessToken);
      setToken(accessToken);
  
      const decoded = jwtDecode(accessToken);
      const userData = {
        id: rol_id === 3 ? null : (decoded.id || null), // Si es rol de estudiante, id será null
        rol_id: rol_id || decoded.rol_id,
        nombres: nombres || decoded.nombres,
        estudiante_id: estudiante_id || decoded.estudiante_id,
        es_estudiante: rol_id === 3 // Agregar una bandera para identificar estudiantes
      };
  
      storage.setItem('userData', JSON.stringify(userData));
      setUser (userData);
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

  // const loginDirector = async (rut, contrasena, rememberMe) => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login/directores`, {
  //       rut,
  //       contrasena,
  //       rememberMe
  //     });

  //     const { accessToken, nombres, rol_id } = response.data;
  //     const storage = rememberMe ? localStorage : sessionStorage;

  //     storage.setItem('accessToken', accessToken);
  //     setToken(accessToken);

  //     const decoded = jwtDecode(accessToken);
  //     const userData = {
  //       id: decoded.id,
  //       rol_id: rol_id || decoded.rol_id,
  //       nombres: nombres || decoded.nombres
  //     };

  //     storage.setItem('userData', JSON.stringify(userData));
  //     setUser (userData);
  //     setError('');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error durante el login de director:', error);
  //     setError('Error de autenticación');
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getToken = () => token;

  const value = {
    user,
    token,
    loading,
    error,
    login,
    // loginDirector,
    logout,
    getToken,
    setError,
    handleSessionExpired
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