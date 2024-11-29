import React from 'react';
import './Components.css';

const Footer = ({ isSidebarOpen, isMobile }) => {
  return (
    <footer 
      className={`main-footer ${
        !isMobile && isSidebarOpen ? 'sidebar-open-footer' : ''
      }`}
    >
      <strong>
        &copy; 2024 Programa "Telecuidado" - Universidad Católica del Maule
      </strong>
    </footer>
  );
};

export default Footer;