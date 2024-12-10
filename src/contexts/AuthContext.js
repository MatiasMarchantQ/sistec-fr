import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  
  // Referencia para el temporizador de expiración
  const expirationTimerRef = useRef(null);

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
      setUser(null);
      
      // Limpiar temporizador de expiración
      clearExpirationTimer();
      
      setLoading(false);
    }
  };

  // Función para limpiar temporizadores
  const clearExpirationTimer = useCallback(() => {
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
  }, []);

  // Configurar temporizador de expiración
  const setupTokenExpirationTimer = useCallback((storedToken) => {
    // Limpiar cualquier temporizador existente
    clearExpirationTimer();

    try {
      const decoded = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiration = (decoded.exp - currentTime) * 1000;

      // Solo configurar si hay tiempo hasta la expiración
      if (timeUntilExpiration > 0) {
        expirationTimerRef.current = setTimeout(() => {
          handleSessionExpired();
        }, timeUntilExpiration);
      } else {
        // Token ya expirado
        handleSessionExpired();
      }
    } catch (error) {
      console.error('Error al configurar temporizador de token:', error);
      handleSessionExpired();
    }
  }, []);

  // Manejar expiración de sesión
  const handleSessionExpired = useCallback(() => {
    // Limpiar temporizador
    clearExpirationTimer();

    // Solo mostrar modal si no estamos en página de inicio de sesión o cambio de contraseña
    if (!window.location.pathname.includes('/') && !window.location.pathname.includes('/cambiar-contrasena')) {
      setShowSessionExpiredModal(true);
    }
  }, [clearExpirationTimer]);

  // Modal de sesión expirada
  const SessionExpiredModal = () => (
    <Modal show={showSessionExpiredModal} onHide={() => {}} centered>
      <Modal.Header>
        <Modal.Title>Sesión Expirada</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Su sesión ha expirado. Por favor, inicie sesión nuevamente.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => {
          setShowSessionExpiredModal(false);
          logout();
          window.location.href = '/';
        }}>
          Iniciar Sesión
        </Button>
      </Modal.Footer>
    </Modal>
  );

  useEffect(() => {
    // Configurar el interceptor de Axios
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !isUnauthorized) {
          // Si no estamos en la página de cambiar contraseña
          if (!window.location.pathname.includes('/cambiar-contrasena') && window.location.pathname !== '/') {
            setIsUnauthorized(true);

            localStorage.clear();
            sessionStorage.clear();
            
            setToken(null);
            setUser(null);
            
            toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', {
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
            if (!isUnauthorized) {
              setIsUnauthorized(true);
              
              logout();
              localStorage.clear();
              sessionStorage.clear();
              
              toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', {
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
              
              window.location.href = '/';
            }
            return;
          }
    
          // Parsear los datos del usuario almacenados
          const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
    
          // Establecer el token y los datos del usuario
          setToken(storedToken);
          
          // Configurar temporizador de expiración
          setupTokenExpirationTimer(storedToken);
          
          if (parsedUserData) {
            setUser(parsedUserData);
          } else {
            // Si no hay datos de usuario almacenados, intentar obtenerlos
            fetchUserData(storedToken);
          }
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          
          if (!isUnauthorized) {
            setIsUnauthorized(true);
            
            toast.error('Error de autenticación', {
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
            
            // Limpiar datos en caso de error
            localStorage.clear();
            sessionStorage.clear();
          }
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
    
        const decoded = jwtDecode(token);
        
        const userData = {
          id: decoded.rol_id === 3 ? null : response.data.id,  // Si es rol de estudiante, id será null
          rol_id: response.data.rol_id,
          nombres: response.data.nombres,
          estudiante_id: response.data.estudiante_id,
          es_estudiante: decoded.rol_id === 3  // Agregar una bandera para identificar estudiantes
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
      clearExpirationTimer();
    };
  }, [setupTokenExpirationTimer, logout, clearExpirationTimer]);
  
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
  
      // Configurar temporizador de expiración
      setupTokenExpirationTimer(accessToken);
  
      const decoded = jwtDecode(accessToken);
      const userData = {
        id: rol_id === 3 ? null : (decoded.id || null),  // Si es rol de estudiante, id será null
        rol_id: rol_id || decoded.rol_id,
        nombres: nombres || decoded.nombres,
        estudiante_id: estudiante_id || decoded.estudiante_id,
        es_estudiante: rol_id === 3  // Agregar una bandera para identificar estudiantes
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

  const loginDirector = async (rut, contrasena, rememberMe) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login/directores`, {
        rut,
        contrasena,
        rememberMe
      });
  
      const { accessToken, refreshToken, nombres, rol_id } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
  
      setToken(accessToken);
  
      // Configurar temporizador de expiración
      setupTokenExpirationTimer(accessToken);
  
      const decoded = jwtDecode(accessToken);
      const userData = {
        id: decoded.id,
        rol_id: rol_id || decoded.rol_id,
        nombres: nombres || decoded.nombres
      };
  
      // Guardar userData en storage
      storage.setItem('userData', JSON.stringify(userData));
  
      setUser(userData);
      setError('');      
      return response.data;
    } catch (error) {
      console.error('Error durante el login de director:', error);      
      setError('Error de autenticación');
      throw error;
    } finally {
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
    loginDirector,
    logout,
    getToken,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal />
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