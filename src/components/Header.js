import React, { useState } from 'react';
import { Dropdown, Modal, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './Components.css';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/';
  const { token, user, logout } = useAuth();  
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedUser , setUpdatedUser ] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0];
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser ({ ...updatedUser , [name]: value });
  };

  const handleUpdateUser  = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser ),
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar datos');
      }
  
      const updatedData = await response.json();
      console.log('Datos actualizados:', updatedData);
      setShowUpdateModal(false);
      
      toast.success('Datos actualizados correctamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('No se pudieron actualizar los datos', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    await fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await response.json();
      setUpdatedUser ({
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        rut: userData.rut,
      });
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      toast.error('No se pudieron cargar los datos del usuario', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleShowUpdateModal = () => {
    fetchUserData();
    setShowUpdateModal(true);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contrasenaActual: currentPassword,
          nuevaContrasena: newPassword,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar la contraseña');
      }
  
      const result = await response.json();
      console.log('Contraseña cambiada:', result);
      setShowChangePasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      toast.success('Contraseña cambiada exitosamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      toast.error(error.message || 'Error al cambiar la contraseña', {
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
    <nav className="main-header navbar navbar-expand navbar-light custom-header">
        <button 
          className="navbar-toggler d-block" 
          type="button" 
          onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      <h1 className="navbar-brand mb-0">FACSA - Programa de Telecuidado</h1>

      <ul className="navbar-nav ml-auto">
        {!isLoginPage && user && (
          <Dropdown>
            <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-white d-flex align-items-center" style={{ textDecoration: 'none' }}>
              <i className="fas fa-user mr-2"></i>
              <span>Hola, {getFirstName(updatedUser.nombres || user.nombres)}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleShowUpdateModal}>Actualizar Datos</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowChangePasswordModal(true)}>Cambiar Contraseña</Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </ul>

      {/* Modal para actualizar datos */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={updatedUser .nombres}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formApellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={updatedUser .apellidos}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCorreo">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={updatedUser .correo}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formRut">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={updatedUser .rut}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateUser }>
            Actualizar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCurrentPassword">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formNewPassword">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-danger">Las contraseñas no coinciden.</div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default Header;