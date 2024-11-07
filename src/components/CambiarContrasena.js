import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CambiarContrasena = () => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
  
      console.log('Respuesta del servidor:', response.data);
  
      // Actualizar el almacenamiento local
      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
      let userData = JSON.parse(storage.getItem('userData') || '{}');
      userData = {
        ...userData,
        debe_cambiar_contrasena: false
      };
      storage.setItem('userData', JSON.stringify(userData));
  
      navigate('/home');
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
                  type="password"
                  className="form-control"
                  placeholder="Contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" />
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" />
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" />
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