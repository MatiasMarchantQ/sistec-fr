import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
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
  const { user } = useAuth();
  const [activeComponent, setActiveComponent] = useState('agenda');
  const [selectedFichaId, setSelectedFichaId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [lastValidComponent, setLastValidComponent] = useState('agenda');

  // Define component access permissions
  const componentPermissions = {
    'dashboard': [1, 2],
    'agenda': [1, 2, 3],
    'ficha-clinica': [1, 2, 3],
    'reevaluacion': [1, 2, 3],
    'instituciones': [1, 2],
    'usuarios': [1],
    'cargar-estudiantes': [1, 2],
    'asignar-estudiantes': [1, 2],
    'listado-estudiantes': [1, 2],
    'ingresar-ficha-clinica': [1, 2, 3],
    'listado-fichas-clinicas': [1, 2]
  };

  // Check if user has permission for a component
  const hasPermission = (component) => {
    if (!user || !componentPermissions[component]) return false;
    return componentPermissions[component].includes(user.rol_id);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const componentFromURL = searchParams.get('component');
  
    if (componentFromURL) {
      if (hasPermission(componentFromURL)) {
        setActiveComponent(componentFromURL);
        setLastValidComponent(componentFromURL);
      } else {
        // Si no tiene permiso, mostrar toast y mantener el último componente válido
        toast.error('No tienes autorización para acceder a esta sección');
        setActiveComponent(lastValidComponent);
      }
    } else if (location.state && location.state.component) {
      const { component, fichaId, tipo } = location.state;
  
      if (component === 'ficha-clinica') {
        if (!fichaId || !tipo) {
          setActiveComponent('listado-fichas-clinicas');
        } else if (!hasPermission(component)) {
          toast.error('No tienes autorización para acceder a esta sección');
          setActiveComponent(lastValidComponent);
        } else {
          setActiveComponent(component);
          setLastValidComponent(component);
          setSelectedFichaId(fichaId);
        }
      } else if (hasPermission(component)) {
        setActiveComponent(component);
        setLastValidComponent(component);
      } else {
        toast.error('No tienes autorización para acceder a esta sección');
        setActiveComponent(lastValidComponent);
      }
    }
  }, [location, user]);

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
    // Si el usuario no está autorizado para el componente actual,
    // mostrar el último componente válido
    if (!hasPermission(activeComponent)) {
      switch (lastValidComponent) {
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
    }

    // Renderizar el componente solicitado si tiene permisos
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