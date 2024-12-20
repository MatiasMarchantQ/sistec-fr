import React, { useState } from 'react';
import { Dropdown, Modal, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import './Components.css';

const PasswordValidationMessage = ({ password }) => {
  const hasMinLength = password.length >= 8 && password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="password-validation-message">
      <small>
        <span style={{ color: hasMinLength ? 'green' : 'red' }}>
          ✓ Entre 8 y 20 caracteres
        </span>
        <br />
        <span style={{ color: hasUppercase ? 'green' : 'red' }}>
          ✓ Al menos una letra mayúscula
        </span>
        <br />
        <span style={{ color: hasLowercase ? 'green' : 'red' }}>
          ✓ Al menos una letra minúscula
        </span>
        <br />
        <span style={{ color: hasNumber ? 'green' : 'red' }}>
          ✓ Al menos un número
        </span>
      </small>
    </div>
  );
};

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPassword = (password) => {
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    return regexContrasena.test(password);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0];
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    // Limpiar todos los estados relacionados con contraseña
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
    
    if (name === 'rut') {
      // Eliminar cualquier punto, guión o letra
      const cleanRut = value.replace(/[.-]/g, '').replace(/[^\d]/g, '');
      setUpdatedUser({ ...updatedUser, [name]: cleanRut });
    } else {
      setUpdatedUser({ ...updatedUser, [name]: value });
    }
  };

  const handleUpdateUser = async () => {
    try {
      // Determinar la URL basada en el rol del usuario
      const endpoint = user.rol_id === 3 
        ? `${process.env.REACT_APP_API_URL}/auth/estudiantes/${user.estudiante_id}`
        : `${process.env.REACT_APP_API_URL}/auth/usuarios/${user.id}`;
    
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
    
      if (!response.ok) {
        // Intenta obtener el mensaje de error del servidor
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar datos');
      }
    
      const updatedData = await response.json();
      setShowUpdateModal(false);
      
      toast.success('Datos actualizados correctamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Actualizar los datos del usuario
      await fetchUserData();
      
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error(error.message || 'No se pudieron actualizar los datos', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
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
    // Validaciones de contraseña
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isValidPassword(newPassword)) {
      toast.error('La contraseña no cumple con los requisitos de seguridad', {
        position: "top-right",
        autoClose: 3000,
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
      setShowChangePasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      handleCloseChangePasswordModal();

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

  const togglePasswordVisibility = (type) => {
    switch(type) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    
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
                value={updatedUser.nombres}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formApellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={updatedUser.apellidos}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCorreo">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={updatedUser.correo}
                onChange={handleUpdateInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formRut">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={updatedUser.rut}
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
      <Modal show={showChangePasswordModal}   onHide={handleCloseChangePasswordModal}>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formCurrentPassword" className="position-relative">
            <Form.Label>Contraseña Actual</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
          </Form.Group>

          <Form.Group controlId="formNewPassword" className="position-relative">
            <Form.Label>Nueva Contraseña</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
            {newPassword && (
              <PasswordValidationMessage password={newPassword} />
            )}
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="position-relative">
            <Form.Label>Confirmar Nueva Contraseña</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-danger">Las contraseñas no coinciden.</div>
            )}
          </Form.Group>
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
    </div>
  );
};

export default Header;