import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PasswordValidationMessage = ({ password }) => {
  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="password-validation-message mb-3">
      <small>
        <span style={{ color: hasMinLength ? 'green' : 'red' }}>
          {hasMinLength ? '✓' : '✗'} Entre 8 y 20 caracteres
        </span>
        <br />
        <span style={{ color: hasUppercase ? 'green' : 'red' }}>
          {hasUppercase ? '✓' : '✗'} Al menos una letra mayúscula
        </span>
        <br />
        <span style={{ color: hasLowercase ? 'green' : 'red' }}>
          {hasLowercase ? '✓' : '✗'} Al menos una letra minúscula
        </span>
        <br />
        <span style={{ color: hasNumber ? 'green' : 'red' }}>
          {hasNumber ? '✓' : '✗'} Al menos un número
        </span>
      </small>
    </div>
  );
};

const RestablecerContrasena = () => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Token de restablecimiento inválido');
      navigate('/');
    }
  }, [location, navigate]);

  // Validación de contraseña: 
  // Al menos una minúscula, una mayúscula, un número y longitud entre 8 y 20
  const isValidPassword = (password) => {
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    return regexContrasena.test(password);
  };

  const togglePasswordVisibility = (type) => {
    if (type === 'nuevaContrasena') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (nuevaContrasena !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
  
    if (!isValidPassword(nuevaContrasena)) {
      toast.error('La contraseña no cumple con los requisitos de seguridad');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/restablecer-contrasena`, 
        { 
          token, 
          nuevaContrasena 
        }
      );
  
      toast.success(response.data.message);
      setNuevaContrasena('');
      setConfirmarContrasena('');
      navigate('/login');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Error al restablecer la contraseña'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper login-page-wrapper">
      <div 
        className="hold-transition login-page" 
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
            url(/facsa.jpg)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          height: '100vh',
          paddingTop: '60px',
        }}
      >
        <div className="login-box">
          <div className="login-logo">
            <p className="brand-link">
              <img src="/Logo UCM - Horizontal.jpg" alt="Logo UCM" style={{height: 100}}/>
            </p>
          </div>

          <div className="card" style={{ boxShadow: 'none', transform: 'none', transition: 'none' }}>
            <div className="card-body login-card-body">
              <p className="login-box-msg">Restablecer Contraseña</p>

              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Nueva Contraseña"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div 
                      className="input-group-text" 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => togglePasswordVisibility('nuevaContrasena')}
                    >
                      {showPassword ? (
                        <span className="fas fa-eye-slash" />
                      ) : (
                        <span className="fas fa-eye" />
                      )}
                    </div>
                  </div>
                </div>

                {nuevaContrasena && (
                  <PasswordValidationMessage password={nuevaContrasena} />
                )}

                <div className="input-group mb-3">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirmar Nueva Contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="input-group-append">
                    <div 
                      className="input-group-text" 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => togglePasswordVisibility('confirmarContrasena')}
                    >
                      {showConfirmPassword ? (
                        <span className="fas fa-eye-slash" />
                      ) : (
                        <span className="fas fa-eye" />
                      )}
                    </div>
                  </div>
                </div>

                {nuevaContrasena && confirmarContrasena && nuevaContrasena !== confirmarContrasena && (
                  <div className="text-danger mb-3">
                    Las contraseñas no coinciden
                  </div>
                )}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={loading}
                  style={{marginBottom: '10px'}}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Restableciendo...
                    </span>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </button>
                <div className="text-center">
                  <Link 
                      to="/" 
                      className="text-muted" 
                      style={{
                          textDecoration: 'none', 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          justifyContent: 'center'
                      }}
                  >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Ya recuerdo mi contraseña
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestablecerContrasena;