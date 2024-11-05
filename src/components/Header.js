// src/components/Header.js
import React, { useState } from 'react';
import { Dropdown, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Components.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/';
  const { user, logout } = useAuth();  
  const [showNotification, setShowNotification] = useState(false);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0];
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowNotification(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-light custom-header">
      <h1 className="navbar-brand mb-0">Programa de Telecuidado</h1>

      <ul className="navbar-nav ml-auto">
        {!isLoginPage && user && (
          <Dropdown>
            <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-white d-flex align-items-center">
              <i className="fas fa-user mr-2"></i>
              <span>Hola, {getFirstName(user.nombres)}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#" onClick={() => navigate('/cambiar-contrasena')}>
                Actualizar Datos
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>
                Cerrar Sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </ul>

      {/* Notificación de cierre de sesión */}
      {showNotification && (
        <Alert variant="success" onClose={() => setShowNotification(false)} dismissible>
          Has cerrado sesión exitosamente.
        </Alert>
      )}
    </nav>
  );
};

export default Header;