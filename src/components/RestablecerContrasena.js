import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RestablecerContrasena = () => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
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

  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (nuevaContrasena !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
  
    if (!isValidPassword(nuevaContrasena)) {
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Restablecer Contraseña</div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
                  <input 
                    type="password"
                    id="nuevaContrasena"
                    className="form-control"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <small className="form-text text-muted">La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.</small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                  <input 
                    type="password"
                    id="confirmarContrasena"
                    className="form-control"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestablecerContrasena;