import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify'
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [renewCredentials, setRenewCredentials] = useState({
    rut: '',
    contrasena: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Agregar una referencia para controlar si la sesión ya expiró
  const sessionExpiredRef = useRef(false);

  const isRenewingRef = useRef(false);

  const handleSessionExpired = () => {
    // Evitar múltiples activaciones
    if (sessionExpiredRef.current || isRenewingRef.current) {
      return;
    }
    
    sessionExpiredRef.current = true;
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setShowSessionExpiredModal(true);
    
    // Mostrar el toast una sola vez
    toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleForceLogout = () => {
    logout();
    setShowSessionExpiredModal(false);
    // Redirigir a la página de login o home
    window.location.href = '/';
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
      localStorage.clear();
      sessionStorage.clear();
      setToken(null);
      setUser(null);
      setLoading(false);
      // Resetear el estado de expiración de sesión
      sessionExpiredRef.current = false;
    }
  };

  // Configurar el interceptor de Axios
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (isRenewingRef.current || showSessionExpiredModal) {
          return config;
        }
        const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          // Verificar si el token ha expirado y la sesión no ha sido manejada aún
          if (decoded.exp < currentTime && !sessionExpiredRef.current) {
            handleSessionExpired();
            return Promise.reject(new Error('Token expirado'));
          }

          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!isRenewingRef.current && 
          error.response && 
          (error.response.status === 401 || error.response.status === 403) && 
          !sessionExpiredRef.current &&
          error.response.data.code !== "INVALID_PASSWORD") {

          // Manejar el caso de cuenta desactivada
        if (error.response.data.code === "ACCOUNT_DISABLED") {
          return Promise.reject(error); // No llamar a handleSessionExpired
        }
        // Manejar como expiración de sesión
        handleSessionExpired();
      }
      return Promise.reject(error);
    }
  );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Modificar handleRenewSession para manejar mejor los errores
  const handleRenewSession = async (e) => {
    e.preventDefault();

    isRenewingRef.current = true;
    
    try {
      const response = await login(
        renewCredentials.rut,
        renewCredentials.contrasena,
        true
      );

      setShowSessionExpiredModal(false);
      setRenewCredentials({ rut: '', contrasena: '' });
      setError('');
      // Resetear el estado de expiración de sesión después de un login exitoso
      sessionExpiredRef.current = false;
      window.location.reload();
    } catch (error) {
      setError('Credenciales inválidas. No se pudo renovar la sesión.');
      toast.error('Error al renovar la sesión', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      isRenewingRef.current = false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRenewCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          setUser(parsedUserData);
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
        apellidos: response.data.apellidos,
        estudiante_id: response.data.estudiante_id,
        es_estudiante: response.data.rol_id === 3
      };

      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      alert('Error al obtener datos del usuario: ' + error.message);
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

      const { accessToken, nombres, apellidos, estudiante_id, rol_id } = response.data;
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem('accessToken', accessToken);
      setToken(accessToken);

      const decoded = jwtDecode(accessToken);
      const userData = {
        id: rol_id === 3 ? null : (decoded.id || null), // Si es rol de estudiante, id será null
        rol_id: rol_id || decoded.rol_id,
        nombres: nombres || decoded.nombres,
        apellidos: apellidos || decoded.apellidos,
        estudiante_id: estudiante_id || decoded.estudiante_id,
        es_estudiante: rol_id === 3 // Agregar una bandera para identificar estudiantes
      };

      storage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setError('');
      return response.data;
    } catch (error) {
      console.error('Error durante el login:', error);
      if (error.response && error.response.data) {
        // Mostrar el mensaje de error específico del servidor
        toast.error(error.response.data.error || 'Error de autenticación', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError('Error de autenticación');
      }
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
      <Modal
        show={showSessionExpiredModal}
        onHide={() => {
          if (!sessionExpiredRef.current) {
            setShowSessionExpiredModal(false);
          }
        }}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>Sesión Expirada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-4">Tu sesión ha expirado. Puedes renovar la sesión o cerrar sesión:</p>
          <Form onSubmit={handleRenewSession}>
            <Form.Group>
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={renewCredentials.rut}
                onChange={handleInputChange}
                required
                placeholder='Ingrese su RUT (Sin puntos, ni guion, ni dígito verificador)'
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={renewCredentials.contrasena}
                  onChange={handleInputChange}
                  required
                  placeholder='Ingrese su contraseña'
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ?
                    <i className="fas fa-eye-slash"></i> :
                    <i className="fas fa-eye"></i>
                  }
                </Button>
              </InputGroup>
            </Form.Group>
            {error && <p className="text-danger mt-2">{error}</p>}
            <div className="d-grid gap-2 mt-4">
              <Button type="submit" variant="primary">
                Renovar Sesión
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleForceLogout}
                type="button"
              >
                Cerrar Sesión
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
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