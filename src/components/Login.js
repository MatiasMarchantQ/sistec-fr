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
  const [email, setEmail] = useState(''); // Estado para el correo
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loading } = useAuth();

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
      toast.error('Error al iniciar sesión', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingForgotPassword(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/recuperar-contrasena`, 
        { email }
      );

      if (!response.ok) {
        throw new Error('Error al enviar el correo de recuperación');
      }

      toast.success('Se ha enviado un correo para restablecer tu contraseña', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setShowForgotPassword(false); // Cerrar el modal después de enviar el correo
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      toast.error(error.message || 'Error al enviar el correo de recuperación', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="wrapper login-page-wrapper">
      <nav className="main-header navbar navbar-expand navbar-light custom-header">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to="#" className="nav-link text-white" onClick={() => setShowForgotPassword(true)}>
              Olvidé mi contraseña
            </Link>
          </li>
        </ul>
      </nav>

      <div className="hold-transition login-page" style={{ 
        backgroundImage: 'url(/banner_Fac_Salud-UCM-p3fznpdsj07a1jvjynfznq321kfyi5dthrhd9x5mt4.png)', 
        backgroundSize: 'cover', 
        position: 'relative', 
        height: '100vh',
        paddingTop: '60px'
      }}>
        <div className="overlay" />
        <div className="login-box">
          <div className="login-logo">
            <p className="brand-link">
              <img src="/Logo UCM - Horizontal.jpg" alt="Logo UCM" style={{height: 100}}/>
            </p>
          </div>

          <div className="card" style={{ boxShadow: 'none', transform: 'none', transition: 'none' }}>
            <div className="card-body login-card-body">
              <p className="login-box-msg">Iniciar sesión</p>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="RUT sin puntos ni guión (ej: 12345678)"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-envelope" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-lock" />
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

      {/* Modal para restablecer contraseña */}
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

      <footer className="main-footer">
        <div className="float-right d-none d-sm-inline">
          Universidad Católica del Maule
        </div>
        <strong>Copyright © 2024 UCM.</strong> Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Login;