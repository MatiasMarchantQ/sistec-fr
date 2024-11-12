import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Form, Row, Col, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListadoFichasClinicas = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [fichas, setFichas] = useState([]);
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [institucionesFiltradas, setInstitucionesFiltradas] = useState([]);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipoInstitucion: '',
    institucion: '',
    textoBusqueda: '',
    tipoFicha: '' // todos, adulto o infantil
  });

  // Estados de paginación
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const limite = 10; 

  // Calcular estados de página
  const isFirstPage = pagina === 1;
  const isLastPage = pagina === totalPaginas;


  const goToPage = (numeroPagina) => {
    setPagina(numeroPagina);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        await Promise.all([
          cargarTiposInstituciones(),
          cargarInstituciones(),
          buscarFichas()
        ]);
      } catch (error) {
        console.error('Error al cargar datos iniciales', error);
      }
    };

    cargarDatosIniciales();
  }, [pagina, filtros]);

  // Funciones de carga 
  const cargarTiposInstituciones = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ajusta según la estructura de la respuesta
      const tipos = Array.isArray(response.data) 
        ? response.data 
        : [];
      
      setTiposInstituciones(tipos);
    } catch (error) {
      console.error('Error al cargar tipos de instituciones', error);
      setTiposInstituciones([]);
    }
  };
  
  const cargarInstituciones = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const instits = response.data?.instituciones || response.data || [];
      
      setInstituciones(instits);
    } catch (error) {
      console.error('Error al cargar instituciones', error);
      setInstituciones([]);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };
  
  // Efecto para filtrar instituciones cuando cambia el tipo de institución
  useEffect(() => {
    if (filtros.tipoInstitucion) {
      const filteredInsts = instituciones.filter(
        inst => inst.tipo_id === parseInt(filtros.tipoInstitucion)
      );
      setInstitucionesFiltradas(filteredInsts);
    } else {
      setInstitucionesFiltradas(instituciones);
    }
  }, [filtros.tipoInstitucion, instituciones]);
  
  // Función para buscar fichas clínicas
  const buscarFichas = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/fichas-clinicas`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          ...filtros,
          tipoFicha: filtros.tipoFicha === '' ? null : filtros.tipoFicha,
          pagina,
          limite
        }
      });
  
      const fichasRecibidas = response.data?.fichas || [];
      const totalPaginas = response.data?.totalPaginas || 0;
      const totalElementos = response.data?.total || 0;
  
      setFichas(fichasRecibidas);
    } catch (error) {
      console.error('Error al buscar fichas', error);
      setFichas([]);

      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipoInstitucion: '',
      institucion: '',
      textoBusqueda: '',
      tipoFicha: ''
    });
    setPagina(1);
  };

  // Manejar cambios en los filtros
  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      [name]: value
    }));
  };

  // Ver detalles de una ficha
  const verDetallesFicha = (id, tipo) => {
    navigate('/home', { 
      state: { 
        component: 'ficha-clinica',
        fichaId: id,
        tipo: tipo
      }
    });
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Listado de Fichas Clínicas</h1>
      
      {/* Formulario de Filtros */}
      <Form className="mb-4">
        <Row>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Tipo de Institución</Form.Label>
            <Form.Control 
              as="select" 
              name="tipoInstitucion"
              value={filtros.tipoInstitucion}
              onChange={(e) => {
                handleChangeFiltro(e);
                // Resetear la institución si cambia el tipo
                setFiltros(prev => ({
                  ...prev,
                  institucion: ''
                }));
              }}
            >
              <option value="">Todos los Tipos</option>
              {tiposInstituciones.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Institución</Form.Label>
            <Form.Control 
              as="select" 
              name="institucion"
              value={filtros.institucion}
              onChange={handleChangeFiltro}
              disabled={!filtros.tipoInstitucion}
            >
              <option value="">Todas las Instituciones</option>
              {institucionesFiltradas.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Tipo de Ficha</Form.Label>
              <Form.Control 
                as="select" 
                name="tipoFicha"
                value={filtros.tipoFicha}
                onChange={handleChangeFiltro}
              >
                <option value="">Todos los Tipos de Ficha</option>
                <option value="adulto">Adulto</option>
                <option value="infantil">Infantil</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Buscar</Form.Label>
              <Form.Control 
                type="text"
                name="textoBusqueda"
                placeholder="Buscar por nombre, RUT..."
                value={filtros.textoBusqueda}
                onChange={handleChangeFiltro}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Button 
              variant="primary" 
              onClick={buscarFichas} 
              className="me-2"
            >
              Buscar
            </Button>
            <Button 
              variant="secondary" 
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabla de Fichas Clínicas */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Paciente</th>
            <th>Institución</th>
            <th>Diagnóstico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fichas && fichas.length > 0 ? (
            fichas.map(ficha => {
              const esInfantil = ficha.PacienteInfantil !== undefined;
              
              return (
                <tr key={ficha.id}>
                  <td>{new Date(ficha.createdAt).toLocaleDateString()}</td>
                  <td>{esInfantil ? 'Infantil' : 'Adulto'}</td>
                  <td>
                    {esInfantil 
                      ? `${ficha.PacienteInfantil.nombres} ${ficha.PacienteInfantil.apellidos}` 
                      : `${ficha.PacienteAdulto.nombres} ${ficha.PacienteAdulto.apellidos}`
                    }
                  </td>
                  <td>{ficha.Institucion.nombre}</td>
                  <td>
                    {esInfantil 
                      ? ficha.diagnostico_dsm 
                      : ficha.diagnostico
                    }
                  </td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => verDetallesFicha(
                        ficha.id, 
                        esInfantil ? 'infantil' : 'adulto'
                      )}
                    >
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay fichas clínicas para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Paginación */}
      <Row className="mt-3">
        <Col>
          <div className="d-flex justify-content-start align-items-center">
            <Pagination size="sm me-3">
              <Pagination.First 
                onClick={() => goToPage(1)} 
                disabled={isFirstPage}
              />
              <Pagination.Prev
                disabled={isFirstPage}
                onClick={() => goToPage(pagina - 1)}
              />
              
              {/* Generar números de página */}
              {[...Array(totalPaginas)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={pagina === index + 1}
                  onClick={() => goToPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              
              <Pagination.Next
                disabled={isLastPage}
                onClick={() => goToPage(pagina + 1)}
              />
              <Pagination.Last 
                onClick={() => goToPage(totalPaginas)} 
                disabled={isLastPage}
              />
            </Pagination>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ListadoFichasClinicas;