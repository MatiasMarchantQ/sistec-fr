import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Asegúrate de que la ruta sea correcta
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Components.css';

const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(rut, password, rememberMe);
      console.log('Login exitoso:', response);

      if (response.debe_cambiar_contrasena) {
        navigate('/cambiar-contrasena');
      } else {
        navigate('/home');
      }
      
      // Backup de redirección
      setTimeout(() => {
        const targetPath = response.debe_cambiar_contrasena ? '/cambiar-contrasena' : '/home';
        if (window.location.pathname !== targetPath) {
          window.location.href = targetPath;
        }
      }, 100);

    } catch (error) {
      console.error('Error durante el login:', error);
      // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
    }
  };

  return (
    <div className="wrapper login-page-wrapper">
      <nav className="main-header navbar navbar-expand navbar-light custom-header">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to="#" className="nav-link text-white">
              Ir a recursos
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

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

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
                      <Link to="/recuperar-contrasena">Olvidé mi contraseña</Link>
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