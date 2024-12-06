import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Form, Row, Col, Button } from 'react-bootstrap';
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de filtros y paginación
  const [filtros, setFiltros] = useState({
    tipoInstitucion: '',
    institucion: '',
    textoBusqueda: '',
    tipoFicha: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          cargarTiposInstituciones(),
          cargarInstituciones()
        ]);
        await buscarFichas(1);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Efecto para filtrar instituciones cuando cambia el tipo
  useEffect(() => {
    if (filtros.tipoInstitucion) {
      const filtradas = instituciones.filter(
        inst => inst.tipo_id === parseInt(filtros.tipoInstitucion)
      );
      setInstitucionesFiltradas(filtradas);
      // Limpiar la institución seleccionada si no está en las filtradas
      if (filtros.institucion && !filtradas.some(inst => inst.id === parseInt(filtros.institucion))) {
        setFiltros(prev => ({ ...prev, institucion: '' }));
      }
    } else {
      setInstitucionesFiltradas(instituciones);
    }
  }, [filtros.tipoInstitucion, instituciones]);

  const cargarTiposInstituciones = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTiposInstituciones(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar tipos de instituciones:', error);
      setTiposInstituciones([]);
    }
  };
  
  const cargarInstituciones = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInstituciones(response.data?.instituciones || []);
    } catch (error) {
      console.error('Error al cargar instituciones:', error);
      setInstituciones([]);
      if (error.response?.status === 401) {
        navigate('/home');
      }
    }
  };

  // Función para cambiar de página
  const cambiarPagina = async (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas && !isLoading) {
      await buscarFichas(nuevaPagina);
    }
  };


  const buscarFichas = async (pagina = paginaActual) => {
    setIsLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        ...filtros,
        pagina: pagina.toString(),
        limite: '10'
      });

      // Remover parámetros vacíos
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key);
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/fichas-clinicas`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: params
      });

      if (response.data.success) {
        setFichas(response.data.fichas);
        setTotalPaginas(Math.ceil(response.data.total / response.data.limite));
        setPaginaActual(pagina);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error al buscar fichas:', error);
      setFichas([]);
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => {
      const newFiltros = { ...prev, [name]: value };
      
      // Si cambia el tipo de institución, resetear la institución
      if (name === 'tipoInstitucion') {
        newFiltros.institucion = '';
      }
      
      return newFiltros;
    });
  };

  const aplicarFiltros = async () => {
    await buscarFichas(1); // Resetear a primera página al aplicar filtros
  };

  const limpiarFiltros = async () => {
    setFiltros({
      tipoInstitucion: '',
      institucion: '',
      textoBusqueda: '',
      tipoFicha: ''
    });
    await buscarFichas(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aplicarFiltros();
    }
  };

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
      <Form className="mb-4" onSubmit={(e) => { e.preventDefault(); aplicarFiltros(); }}>
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Tipo de Institución</Form.Label>
              <Form.Control
                as="select"
                name="tipoInstitucion"
                value={filtros.tipoInstitucion}
                onChange={handleChangeFiltro}
                disabled={isLoading}
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
                disabled={!filtros.tipoInstitucion || isLoading}
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
                disabled={isLoading}
              >
                <option value="">Todos los Tipos</option>
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
                placeholder="Buscar por nombre o RUT..."
                value={filtros.textoBusqueda}
                onChange={handleChangeFiltro}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Button
              type="submit"
              variant="primary"
              className="me-2"
              disabled={isLoading}
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button
              variant="secondary"
              onClick={limpiarFiltros}
              disabled={isLoading}
            >
              Limpiar Filtros
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
                  <th>Reevaluaciones</th>
                  <th>Acciones</th>
              </tr>
          </thead>
          <tbody>
              {fichas.map(ficha => {
                  const esInfantil = ficha.PacienteInfantil !== undefined;
                  const paciente = esInfantil ? ficha.PacienteInfantil : ficha.PacienteAdulto;
                  const fecha = new Date(ficha.createdAt).toLocaleDateString('es-CL');
                  const diagnostico = esInfantil 
                  ? ficha.diagnostico_dsm 
                  : (
                      ficha.diagnostico?.nombre || 
                      ficha.diagnostico_otro || 
                      'No especificado'
                    );
                  const cantidadReevaluaciones = ficha.reevaluaciones || 'No aplicado';

                  return (
                      <tr key={ficha.id}>
                          <td>{fecha}</td>
                          <td>{esInfantil ? 'Infantil' : 'Adulto'}</td>
                          <td>{`${paciente.nombres} ${paciente.apellidos}`}</td>
                          <td>{ficha.Institucion.nombre}</td>
                          <td>{diagnostico}</td>
                          <td>{cantidadReevaluaciones}</td>
                          <td>
                              <Button variant="info" size="sm" onClick={() => verDetallesFicha(ficha.id, esInfantil ? 'infantil' : 'adulto')}>
                                  Ver Detalles
                              </Button>
                          </td>
                      </tr>
                  );
              })}
          </tbody>
      </Table>

      {/* Paginación */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-between align-items-center">
          <Button
            variant="secondary"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1 || isLoading}
          >
            Anterior
          </Button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button
            variant="secondary"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas || isLoading}
          >
            Siguiente
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ListadoFichasClinicas;