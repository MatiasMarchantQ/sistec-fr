// src/components/Header.js
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import './Components.css';

const Header = () => {
  return (
    <nav className="main-header navbar navbar-expand navbar-light custom-header">
      <ul className="navbar-nav ml-auto">
        {/* Menú desplegable */}
        <Dropdown>
          <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-white">
            <i className="fas fa-bars"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="#" onClick={() => { /* Lógica para actualizar datos */ }}>
              Actualizar Datos
            </Dropdown.Item>
            <Dropdown.Item href="/" onClick={() => { /* Lógica para cerrar sesión */ }}>
              Cerrar Sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ul>
    </nav>
  );
};

export default Header;
