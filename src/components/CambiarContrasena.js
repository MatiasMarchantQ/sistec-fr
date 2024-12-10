import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
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
    <div className="hold-transition login-page">
      <div className="login-box">
        <div className="card">
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
                    onClick={() => togglePasswordVisibility(setShowNuevaContrasena)}
                  >
                    <span className={`fas ${showNuevaContrasena ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </div>
                </div>
              </div>

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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CambiarContrasena;