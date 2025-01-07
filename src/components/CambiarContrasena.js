import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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

const CambiarContrasena = () => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showContrasenaActual, setShowContrasenaActual] = useState(false);
  const [showNuevaContrasena, setShowNuevaContrasena] = useState(false);
  const [showConfirmarContrasena, setShowConfirmarContrasena] = useState(false);

  const navigate = useNavigate();

  // Validación de contraseña: 
  // Al menos una minúscula, una mayúscula, un número y longitud entre 8 y 20
  const validarContrasena = (contrasena) => {
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    return regexContrasena.test(contrasena);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar nueva contraseña
    if (!validarContrasena(nuevaContrasena)) {
      setError('La nueva contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y tener entre 8 y 20 caracteres.');
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');          
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/cambiar-contrasena`,
        {
          contrasenaActual,
          nuevaContrasena
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // Actualizar el almacenamiento local
      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
      let userData = JSON.parse(storage.getItem('userData') || '{}');
      userData = {
        ...userData,
        debe_cambiar_contrasena: false
      };
      storage.setItem('userData', JSON.stringify(userData));

      // Limpiar localStorage y sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      navigate('/');
    } catch (error) {
      console.error('Error completo:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.details ||
        'Error al cambiar la contraseña. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (setter) => {
    setter((prev) => !prev);
  };

  return (
    <div 
      className="hold-transition login-page" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 23, 31, 0.8), rgba(0, 52, 89, 0.8)), url(/facsa.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
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
            <p className="login-box-msg">Cambiar Contraseña</p>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type={showContrasenaActual ? "text" : "password"}
                  className="form-control"
                  placeholder="Contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div 
                    className="input-group-text cursor-pointer" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility(setShowContrasenaActual)}
                  >
                    <span className={`fas ${showContrasenaActual ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type={showNuevaContrasena ? "text" : "password"}
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div 
                    className="input-group-text cursor-pointer" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility(setShowNuevaContrasena)}
                  >
                    <span className={`fas ${showNuevaContrasena ? 'fa -eye-slash' : 'fa-eye'}`} />
                  </div>
                </div>
              </div>

              {nuevaContrasena && (
                <PasswordValidationMessage password={nuevaContrasena} />
              )}

              <div className="input-group mb-3">
                <input
                  type={showConfirmarContrasena ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div 
                    className="input-group-text cursor-pointer" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility(setShowConfirmarContrasena)}
                  >
                    <span className={`fas ${showConfirmarContrasena ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i> Cambiando...
                  </span>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
              {/* <div className="text-center">
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
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CambiarContrasena;