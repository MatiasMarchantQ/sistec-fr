import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'admin-lte/dist/js/adminlte.min.js';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Content from '../../components/Content';
import Instituciones from './Instituciones';
import Usuarios from './Usuarios';
import Agenda from './Agenda';
import CargarEstudiantes from './CargarEstudiantes';
import AsignarEstudiantes from './AsignarEstudiantes';
import FichaClinica from './FichaClinica';
import IngresarFichaClinica from './IngresarFichaClinica';
import ListadoEstudiantes from './ListadoEstudiantes';
import ListadoFichasClinicas from './ListadoFichasClinicas';
import Reevaluacion from './Reevaluacion';
import Dashboard from './Dashboard';

const Home = () => {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('agenda');
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const componentFromURL = searchParams.get('component');

    if (componentFromURL) {
      setActiveComponent(componentFromURL);
    } else if (location.state && location.state.component) {
      setActiveComponent(location.state.component);
    }

    if (location.state && location.state.fichaId) {
      setSelectedFichaId(location.state.fichaId);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Efecto para manejar overlay en móviles
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const overlay = document.createElement('div');
      overlay.classList.add('sidebar-overlay');
      overlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(overlay);

      return () => {
        document.body.removeChild(overlay);
      };
    }
  }, [isMobile, isSidebarOpen]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'agenda':
        return <Agenda 
          onFichaSelect={setSelectedFichaId} 
          setActiveComponent={setActiveComponent}
        />;
      case 'ficha-clinica':
        return <FichaClinica id={selectedFichaId} />;
      case 'reevaluacion': 
        return <Reevaluacion />;
      case 'instituciones':
        return <Instituciones />;
      case 'usuarios':
        return <Usuarios />;
      case 'cargar-estudiantes':
        return <CargarEstudiantes />;
      case 'asignar-estudiantes':
        return <AsignarEstudiantes />;
      case 'listado-estudiantes':
        return <ListadoEstudiantes />;
      case 'ingresar-ficha-clinica':
        return <IngresarFichaClinica />;
      case 'listado-fichas-clinicas':
        return <ListadoFichasClinicas />;
        case 'dashboard':
          return <Dashboard />;

      default:
        return <Agenda 
          onFichaSelect={setSelectedFichaId} 
          setActiveComponent={setActiveComponent}
        />;
    }
  };

  return (
    <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-mini'}`}>
      <Header 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        setActiveComponent={setActiveComponent} 
      />
      <div className={`content-wrapper ${isMobile && !isSidebarOpen ? 'ml-0' : ''}`}>
        <Content>
          {renderContent()}
        </Content>
      </div>
      <Footer 
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Home;