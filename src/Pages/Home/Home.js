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

const Home = () => {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('agenda');
  const [selectedFichaId, setSelectedFichaId] = useState(null);

  useEffect(() => {
    // Obtener el componente de los parámetros de la URL
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
      default:
        return <Agenda 
          onFichaSelect={setSelectedFichaId} 
          setActiveComponent={setActiveComponent}
        />;
    }
  };

  return (
    <div className="wrapper">
      <Header />
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="content-wrapper">
        <Content>
          {renderContent()}
        </Content>
      </div>
      <Footer />
    </div>
  );
};

export default Home;