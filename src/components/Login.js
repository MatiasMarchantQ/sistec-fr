import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Components.css';

const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);

  // Nuevos estados para el modal
  const [modalRut, setModalRut] = useState('');
  const [modalPassword, setModalPassword] = useState('');

  const navigate = useNavigate();
  const { login, loginDirector } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(rut, password, rememberMe);
      if (response.debe_cambiar_contrasena) {
        navigate('/cambiar-contrasena');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  };

  // const handleDirectorLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await login(modalRut, modalPassword, rememberMe);

  //     // Verificar si el director debe cambiar la contraseña
  //     if (response.debe_cambiar_contrasena) {
  //       navigate('/cambiar-contrasena');
  //     } else {
  //       navigate('/home');
  //     }
  //   } catch (error) {
  //     console.error('Error durante el login de director:', error);

  //     toast.error('Error al iniciar sesión', {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDirectorLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await loginDirector(modalRut, modalPassword, rememberMe);

  //     // Verificar si el director debe cambiar la contraseña
  //     if (response.debe_cambiar_contrasena) {
  //       navigate('/cambiar-contrasena');
  //     } else {
  //       navigate('/home');
  //     }
  //   } catch (error) {
  //     console.error('Error durante el login de director:', error);

  //     toast.error('Error al iniciar sesión', {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingForgotPassword(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/recuperar-contrasena`,
        { email }
      );

      if (response.status === 200) {
        toast.success('Si el correo está registrado, se ha enviado un correo para restablecer la contraseña', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setShowForgotPassword(false);
      } else {
        throw new Error('Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        'Error al enviar el correo de recuperación';

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoadingForgotPassword(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="wrapper login-page-wrapper">
      {/* <nav className="main-header navbar navbar-expand navbar-light custom-header">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to="/recursos" className="nav-link text-white" onClick={() => setShowForgotPassword(true)}>
              Ir a recursos
            </Link>
          </li>
        </ul>
      </nav> */}
      <a
        href="/recursos"
        className="login-button position-absolute top-0 end-0 m-4 rounded-pill"
        style={{
          zIndex: 1000,
          position: 'fixed',
          borderRadius: '20px',
          padding: '8px 15px',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-external-link-alt mr-2"></i>
        Ir a Recursos
      </a>

      <div className="hold-transition login-page" style={{ 
          backgroundImage: `linear-gradient(rgba(0, 23, 31, 0.8), rgba(0, 52, 89, 0.8)), url(/facsa.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
        <div className="overlay" />
        <div className="login-box">
          <div className="login-logo">
            <p className="brand-link">
              <img src="/Logo UCM - Horizontal.jpg" alt="Logo UCM" style={{ height: 100 }} />
            </p>
          </div>

          <div className="card" style={{ boxShadow: 'none', transform: 'none', transition: 'none' }}>
            <div className="card-body login-card-body">
              {/* <p>¿Eres un Director/Docente? <a href="#" onClick={() => setShowDirectorModal(true)}>Inicia sesión aquí</a></p> */}
              <p className='text-center'>Iniciar sesión</p>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="RUT sin puntos ni guión"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-user" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div
                      className="input-group-text"
                      style={{ cursor: 'pointer' }}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <span className="fas fa-eye-slash" />
                      ) : (
                        <span className="fas fa-eye" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <div className="icheck-primary">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label htmlFor="remember">Recuérdame</label>
                    </div>
                  </div>
                  <div className="col-4">
                    <p className="mb-1">
                      <Link to="#" onClick={() => setShowForgotPassword(true)}>Olvidé mi contraseña</Link>
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{ marginBottom: '10px' }}
                  >
                    {loading ? (
                      <span>
                        <i className="fas fa-spinner fa-spin"></i> Cargando...
                      </span>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* {showDirectorModal && (
  <div 
    className="modal fade show modal-responsive" 
    style={{ 
      display: 'block', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      paddingTop: '0',
      zIndex: 1050 
    }} 
    tabIndex="-1" 
    role="dialog"
  >
    <div className="modal-dialog modal-dialog-responsive" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <button 
            type="button" 
            className="close" 
            onClick={() => setShowDirectorModal(false)}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="login-logo">
            <p className="brand-link">
              <img 
                src="/Logo UCM - Horizontal.jpg" 
                alt="Logo UCM" 
                className="img-fluid"
                style={{maxHeight: '100px'}}
              />
            </p>
          </div>
          <p className="login-box-msg">Iniciar sesión como Director/Docente</p>

          <form onSubmit={handleDirectorLogin}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                id="modalRut"
                placeholder="RUT sin puntos ni guión"
                value={modalRut}
                onChange={(e) => setModalRut(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="modalPassword"
                  placeholder="Contraseña"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <i className="fas fa-eye-slash" />
                    ) : (
                      <i className="fas fa-eye" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="custom-control custom-checkbox">
                <input 
                  type="checkbox" 
                  className="custom-control-input" 
                  id="directorRememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label 
                  className="custom-control-label" 
                  htmlFor="directorRememberMe"
                >
                  Recuérdame
                </label>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> Cargando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
)} */}

      {showForgotPassword && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Restablecer Contraseña</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={loadingForgotPassword}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Ingresa tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loadingForgotPassword}
                      />
                      <div className="input-group-append">
                        <div className="input-group-text">
                          <span className="fas fa-envelope" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loadingForgotPassword}
                  >
                    {loadingForgotPassword ? (
                      <span>
                        <i className="fas fa-spinner fa-spin"></i> Enviando...
                      </span>
                    ) : (
                      'Enviar Correo de Recuperación'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <footer className="main-footer">
        <div className="float-right d-none d-sm-inline">
          Universidad Católica del Maule
        </div>
        <strong>Copyright © 2024 UCM.</strong> Todos los derechos reservados.
      </footer> */}
    </div>
  );
};

export default Login;