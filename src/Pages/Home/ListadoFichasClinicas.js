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
  const estadoInicialFiltros = {
    tipoInstitucion: '',
    institucion: '',
    textoBusqueda: '',
    tipoFicha: '',
    fechaInicial: '',
    fechaFinal: ''
  };
  
  const [filtros, setFiltros] = useState(estadoInicialFiltros);
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
    if (!filtros.tipoInstitucion) {
      setInstitucionesFiltradas(instituciones);
    } else {
      const filtradas = instituciones.filter(
        inst => inst.tipo_id === parseInt(filtros.tipoInstitucion)
      );
      setInstitucionesFiltradas(filtradas);
    }
  }, [filtros.tipoInstitucion, instituciones]);

  const exportarFichas = async () => {
    setIsLoading(true);
    try {
        const token = getToken();
        
        // Asegurarse de que tipoFicha tenga un valor
        const filtrosParaExportar = { 
            ...filtros,
            tipoFicha: filtros.tipoFicha || '' // Asegúrate de que siempre haya un valor
        };

        // Crear parámetros para la solicitud
        const params = new URLSearchParams();
        
        // Agregar cada filtro que tenga un valor
        Object.keys(filtrosParaExportar).forEach(key => {
            if (filtrosParaExportar[key]) {
                params.append(key, filtrosParaExportar[key]);
            }
        });

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/fichas-clinicas/exportar`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: params,
            responseType: 'blob' // Para manejar la descarga del archivo
        });
    
        // Verificar si la respuesta contiene datos
        if (response.data.size === 0) {
            alert('No hay datos para exportar con los filtros seleccionados.');
            return;
        }
    
        // Crear un enlace para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Generar nombre de archivo con fecha actual
        const fechaActual = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `fichas_clinicas_${fechaActual}.xlsx`);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
    
    } catch (error) {
        console.error('Error al exportar fichas clínicas:', error);
        
        // Manejo de errores más específico
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    alert('Debe seleccionar un tipo de ficha válido (adulto o infantil).');
                    break;
                case 401:
                    alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                    navigate('/');
                    break;
                case 404:
                    alert('No se encontraron fichas clínicas para exportar.');
                    break;
                case 500:
                    alert('Error interno del servidor. Intente nuevamente más tarde.');
                    break;
                default:
                    alert('Ocurrió un error al exportar las fichas clínicas.');
            }
        } else if (error.request) {
            alert('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        } else {
            alert('Ocurrió un error inesperado.');
        }
    } finally {
        setIsLoading(false);
    }
};

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
      setInstitucionesFiltradas(response.data?.instituciones || []);
    } catch (error) {
      console.error('Error al cargar instituciones:', error);
      setInstituciones([]);
      setInstitucionesFiltradas([]);
      if (error.response?.status === 401) {
        navigate('/home');
      }
    }
  };

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
    
        // Add validation for the response data
        if (response.data?.success && Array.isArray(response.data?.fichas)) {
            setFichas(response.data.fichas);
            setTotalPaginas(Math.ceil(response.data.total / response.data.limite));
            setPaginaActual(pagina);
        } else {
            console.error('Invalid response format:', response.data);
            setFichas([]);
            setTotalPaginas(1);
        }
    } catch (error) {
        console.error('Error al buscar fichas:', error);
        setFichas([]);
        setTotalPaginas(1);
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
      
      if (name === 'tipoInstitucion') {
        newFiltros.institucion = '';
      }
      
      return newFiltros;
    });
  };

  const aplicarFiltros = async () => {
    await buscarFichas(1);
  };

  const limpiarFiltros = async () => {
    setIsLoading(true);
    try {
        // Resetear todos los estados a sus valores iniciales
        setFiltros(estadoInicialFiltros);
        setPaginaActual(1);
        setInstitucionesFiltradas(instituciones);

        // Recargar los datos iniciales
        await Promise.all([
            cargarTiposInstituciones(),
            cargarInstituciones()
        ]);
        
        // Buscar fichas sin filtros
        const token = getToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/fichas-clinicas`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { pagina: '1', limite: '10' }
        });

        if (response.data.success) {
            setFichas(response.data.fichas);
            setTotalPaginas(Math.ceil(response.data.total / response.data.limite));
        }
    } catch (error) {
        console.error('Error al limpiar filtros:', error);
        if (error.response?.status === 401) {
            navigate('/');
        }
    } finally {
        setIsLoading(false);
    }
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
        tipo: tipo,
        origen: 'listado-fichas'
      }
    });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = Object.values(filtros).some(value => value !== '');

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Listado de Fichas Clínicas</h1>
      
      {/* Formulario de Filtros */}
      <Form className="mb-4" onSubmit={(e) => { e.preventDefault(); aplicarFiltros(); }}>
        <Row className="mt-3">
            <Col md={3}>
                <Form.Group>
                    <Form.Label> Fecha Inicial</Form.Label>
                    <Form.Control
                        type="date"
                        name="fechaInicial"
                        value={filtros.fechaInicial}
                        onChange={handleChangeFiltro}
                        disabled={isLoading}
                        max={filtros.fechaFinal || new Date().toISOString().split('T')[0]}
                    />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>Fecha Final</Form.Label>
                    <Form.Control
                        type="date"
                        name="fechaFinal"
                        value={filtros.fechaFinal}
                        onChange={handleChangeFiltro}
                        disabled={isLoading}
                        min={filtros.fechaInicial}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </Form.Group>
            </Col>
        </Row>
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
            {hayFiltrosActivos && (
              <Button
                variant="secondary"
                onClick={limpiarFiltros}
                disabled={isLoading}
              >
                Limpiar Filtros
              </Button>
            )}
            <Button 
              variant="success" 
              onClick={exportarFichas} 
              disabled={isLoading}
              className="ms-2"
            >
              {isLoading ? 'Exportando...' : 'Exportar Fichas Clínicas'}
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
                
                // Lógica de diagnósticos para adultos
                let diagnostico = 'No especificado';
                if (!esInfantil) {
                    // Filtrar diagnósticos predefinidos
                    const diagnosticosPredefinidos = ficha.diagnosticos
                        .filter(d => !d.esOtro)
                        .map(d => d.nombre);

                    // Verificar si hay diagnóstico personalizado
                    const tieneOtroDiagnostico = ficha.diagnosticos.some(d => d.esOtro);

                    // Construir string de diagnósticos
                    diagnostico = diagnosticosPredefinidos.length > 0 
                        ? diagnosticosPredefinidos.join(', ') + (tieneOtroDiagnostico ? ' y Otro' : '')
                        : (tieneOtroDiagnostico ? 'Otro' : 'No especificado');
                } else {
                    // Mantener lógica original para fichas infantiles
                    diagnostico = ficha.diagnostico_dsm;
                }

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