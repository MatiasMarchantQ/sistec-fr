import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Components.css';

const Sidebar = ({ setActiveComponent }) => {
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
  
  return (
    <aside className="main-sidebar elevation-1">
      <div className="d-flex justify-content-center align-items-center">
        <Link to="?component=home" className="brand-link">
          <img src="/logo_ucm_white.png" alt="Logo UCM" className="brand-image" style={{ height: '40px', width: 'auto' }} />
        </Link>
      </div>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-sidebar flex-column" role="menu">
            {/* Menú de Agenda */}
            <li className="nav-item">
              <Link 
                to="?component=home"
                className="nav-link"
                onClick={() => handleSetActiveComponent('home')}
              >
                <i className="nav-icon fas fa-calendar-days"></i>
                <p>Agenda</p>
              </Link>
            </li>

            {/* Menú de Instituciones - Visible para rol_id 1 y 2 */}
            {(user && (user.rol_id === 1 || user.rol_id === 2)) && (
              <li className="nav-item">
                <Link 
                  to="?component=instituciones"
                  className="nav-link"
                  onClick={() => handleSetActiveComponent('instituciones')} 
                >
                  <i className="nav-icon fas fa-university"></i>
                  <p>Instituciones</p>
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
                  <i className="nav-icon fas fa-user"></i>
                  <p>
                    Usuarios
                    <i className={`right fas fa-angle-${isUserMenuOpen ? 'left' : 'left'}`}></i>
                  </p>
                </Link>
                {isUserMenuOpen && (
                  <ul className="nav nav-treeview">
                    {user.rol_id === 1 && (
                      <li className="nav-item">
                        <Link 
                          to="?component=usuarios"
                          className="nav-link"
                          onClick={() => handleSetActiveComponent('usuarios')}
                        >
                          <i className="far fa-circle nav-icon"></i>
                          <p>Personal Académico</p>
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <Link 
                        to="?component=cargar-estudiantes"
                        className="nav-link"
                        onClick={() => handleSetActiveComponent('cargar-estudiantes')}
                      >
                        <i className="far fa-circle nav-icon"></i>
                        <p>Cargar Estudiantes</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="?component=listado-estudiantes"
                        className="nav-link"
                        onClick={() => handleSetActiveComponent('listado-estudiantes')}
                      >
                        <i className="far fa-circle nav-icon"></i>
                        <p>Listado de Estudiantes</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="?component=asignar-estudiantes"
                        className="nav-link"
                        onClick={() => handleSetActiveComponent('asignar-estudiantes')}
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
                    onClick={() => handleSetActiveComponent('ingresar-ficha-clinica')} 
                  >
                    <i className="nav-icon fas fa-file-medical"></i>
                    <p>Ingresar ficha clínica</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="?component=listado-fichas-clinicas"
                    className="nav-link"
                    onClick={() => handleSetActiveComponent('listado-fichas-clinicas')} 
                  >
                    <i className="nav-icon fas fa-notes-medical"></i>
                    <p>Listado Fichas Clínicas</p>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;