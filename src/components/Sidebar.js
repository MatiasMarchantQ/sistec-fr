import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Components.css';

const Sidebar = ({ setActiveComponent, isOpen, isMobile, toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSetActiveComponent = (component) => {
    setActiveComponent(component);
    navigate(`?component=${component}`);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prevState => !prevState);
  };

  const handleLinkClick = () => {
    // Cierra el sidebar al hacer clic en un link
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <aside 
      className={`main-sidebar sidebar-dark-primary elevation-4 ${
        isMobile 
          ? (isOpen ? 'sidebar-mobile-open' : 'd-none') 
          : ''
      }`}
    >
      {/* Botón de cierre para móviles */}
      {isMobile && isOpen && (
        <div className="sidebar-mobile-close-container">
          <button 
            className="sidebar-mobile-close-btn" 
            onClick={toggleSidebar}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      <div className="d-flex justify-content-center align-items-center" style={{marginTop: '5px'}}>
        <Link to="?component=home" className="brand-link">
          <img 
            src="/facsa.png" 
            alt="FACSA" 
            className="brand-image"
            style={{ 
              width: '100px',
              height: '100px',
              objectFit: 'fill'
            }}
          />
        </Link>
      </div>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-sidebar flex-column" role="menu">
            {/* Menú de Agenda */}
            {(user && (user.rol_id === 1 || user.rol_id === 2 || user.rol_id === 3)) && (
              <li className="nav-item">
                <Link 
                  to="?component=agenda"
                  className="nav-link"
                  onClick={() => {
                    handleSetActiveComponent('agenda');
                    handleLinkClick(); // Cierra el sidebar
                  }}
                >
                  <i className="nav-icon fas fa-calendar-days"></i>
                  <p>Agenda</p>
                </Link>
              </li>
            )}
            {/* Menú de Instituciones - Visible para rol_id 1 y 2 */}
            {(user && (user.rol_id === 1 || user.rol_id === 2)) && (
              <li className="nav-item">
                <Link 
                  to="?component=instituciones"
                  className="nav-link"
                  onClick={() => {
                    handleSetActiveComponent('instituciones');
                    handleLinkClick(); // Cierra el sidebar
                  }} 
                >
                  <i className="nav-icon fas fa-university"></i>
                  <p>Instituciones</p>
                </Link>
              </li>
            )}

            {/* Menú de Personal Académico - Visible solo para rol_id 1 */}
            {user && user.rol_id === 1 && (
              <li className="nav-item">
                <Link 
                  to="?component=usuarios"
                  className="nav-link"
                  onClick={() => {
                    handleSetActiveComponent('usuarios');
                    handleLinkClick(); // Cierra el sidebar
                  }}
                >
                  <i className="nav-icon fas fa-user-tie"></i>
                  <p>Personal Académico</p>
                </Link>
              </li>
            )}

            {/* Menú de Usuarios */}
            {(user && (user.rol_id === 1 || user.rol_id === 2)) && (
              <li className={`nav-item ${isUserMenuOpen ? 'menu-open' : ''}`}>
                <Link 
                  to="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleUserMenu();
                  }}
                >
                  <i className="nav-icon fas fa-user-graduate"></i>
                  <p>
                    Estudiantes
                    <i className={`right fas fa-angle-${isUserMenuOpen ? 'left' : 'left'}`}></i>
                  </p>
                </Link>
                {isUserMenuOpen && (
                  <ul className="nav nav-treeview">
                    <li className="nav-item">
                      <Link 
                        to="?component=cargar-estudiantes"
                        className="nav-link"
                        onClick={() => {
                          handleSetActiveComponent('cargar-estudiantes');
                          handleLinkClick(); // Cierra el sidebar
                        }}
                      >
                        <i className="far fa-circle nav-icon"></i>
                        <p>Carga Masiva</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="?component=listado-estudiantes"
                        className="nav-link"
                        onClick={() => {
                          handleSetActiveComponent('listado-estudiantes');
                          handleLinkClick(); // Cierra el sidebar
                        }}
                      >
                        <i className="far fa-circle nav-icon"></i>
                        <p>Gestión de estudiantes</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="?component=asignar-estudiantes"
                        className="nav-link"
                        onClick={() => {
                          handleSetActiveComponent('asignar-estudiantes');
                          handleLinkClick(); // Cierra el sidebar
                        }}
                      >
                        <i className="far fa-circle nav-icon"></i>
                        <p>Asignar Estudiantes</p>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* Menú de Ficha Clínica */}
            {(user && (user.rol_id === 1 || user.rol_id === 2)) && (
              <>
                <li className="nav-item">
                  <Link 
                    to="?component=ingresar-ficha-clinica"
                    className="nav-link"
                    onClick={() => {
                      handleSetActiveComponent('ingresar-ficha-clinica');
                      handleLinkClick(); // Cierra el sidebar
                    }} 
                  >
                    <i className="nav-icon fas fa-file-medical"></i>
                    <p>Ingresar ficha clínica</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="?component=listado-fichas-clinicas"
                    className="nav-link"
                    onClick={() => {
                      handleSetActiveComponent('listado-fichas-clinicas');
                      handleLinkClick(); // Cierra el sidebar
                    }} 
                  >
                    <i className="nav-icon fas fa-notes-medical"></i>
                    <p>Listado Fichas Clínicas</p>
                  </Link>
                </li>
              </>
            )}
            {(user && (user.rol_id ===  1 || user.rol_id === 2)) && (
              <li className="nav-item">
                <Link 
                  to="?component=dashboard"
                  className="nav-link"
                  onClick={() => {
                    handleSetActiveComponent('dashboard');
                    handleLinkClick(); // Cierra el sidebar
                  }} 
                >
                  <i className="nav-icon fas fa-chart-pie"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;