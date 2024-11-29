import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Modal, Form, InputGroup, Row, Col, Pagination } from 'react-bootstrap';
import './Agenda.css';

const Agenda = ({ onFichaSelect, setActiveComponent }) => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date();

  // Estado
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [showAllFichasModal, setShowAllFichasModal] = useState(false);
  const [allFichas, setAllFichas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechasFiltro, setFechasFiltro] = useState({ fechaInicio: '', fechaFin: '' });
  const [filtroReevaluacion, setFiltroReevaluacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    totalPages: 0,
    totalRegistros: 0,
    registrosPorPagina: 10
  });

  // Añadir nuevos estados al inicio del componente
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [modalFechasFiltro, setModalFechasFiltro] = useState({ fechaInicio: '', fechaFin: '' });
    const [modalFiltroReevaluacion, setModalFiltroReevaluacion] = useState('');
    const [modalPaginationInfo, setModalPaginationInfo] = useState({
        page: 1,
        totalPages: 0,
        totalRegistros: 0,
        registrosPorPagina: 5
    });

  // Funciones auxiliares
  const getMonthName = (monthIndex) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthIndex];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const getSemester = () => {
    if (month >= 2 && month <= 6) return '1er Semestre';
    if (month >= 7 && month <= 11) return '2do Semestre';
    return 'Fuera de Semestre';
  };

  const getPrevMonth = () => month === 0 ? getMonthName(11) : getMonthName(month - 1);
  const getNextMonth = () => month === 11 ? getMonthName(0) : getMonthName(month + 1);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

    const agruparAsignacionesPorPeriodo = (asignaciones) => {
        if (!Array.isArray(asignaciones)) {
            console.log('agruparAsignacionesPorPeriodo: asignaciones no es un array');
            return [];
        }

    console.log('Agrupando asignaciones:', asignaciones.length);

    const grupos = {};
    
    asignaciones.forEach(asignacion => {
        if (!asignacion.fecha_inicio || !asignacion.fecha_fin) {
            console.log('Asignación sin fechas:', asignacion);
            return;
        }

        const periodo = `${formatDate(asignacion.fecha_inicio)} al ${formatDate(asignacion.fecha_fin)}`;
        
        if (!grupos[periodo]) {
            grupos[periodo] = {
                periodo,
                instituciones: {}
            };
        }

        const institucionId = asignacion.institucion_id;
        if (!grupos[periodo].instituciones[institucionId]) {
            grupos[periodo].instituciones[institucionId] = {
                id: institucionId,
                nombre: asignacion.Institucion?.nombre || 'Institución sin nombre',
                receptora: asignacion.Receptor ? 
                    `${asignacion.Receptor.cargo} ${asignacion.Receptor.nombre}` : 
                    'Sin receptor',
                estudiantes: []
            };
        }

        if (asignacion.Estudiante) {
            grupos[periodo].instituciones[institucionId].estudiantes.push(
                `${asignacion.Estudiante.nombres} ${asignacion.Estudiante.apellidos}`
            );
        }
    });

    // Convertir el objeto de grupos a un array y las instituciones a array
    const resultado = Object.values(grupos).map(grupo => ({
        ...grupo,
        instituciones: Object.values(grupo.instituciones)
    }));

    return resultado;
};

// Actualiza la función fetchAsignaciones para manejar mejor los datos
const fetchAsignaciones = async () => {
    try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        const params = {
            page: paginationInfo.page,
            limit: paginationInfo.registrosPorPagina,
            search: searchTerm,
            month: month + 1,
            year: year
        };

        console.log('Fetching asignaciones con params:', params);

        const response = await axios.get(`${apiUrl}/asignaciones`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });

        console.log('Respuesta de API:', response.data);

        if (response.data && Array.isArray(response.data.asignaciones)) {
            const asignacionesGrupadas = agruparAsignacionesPorPeriodo(response.data.asignaciones);
            console.log('Asignaciones grupadas:', asignacionesGrupadas);
            setAsignaciones(asignacionesGrupadas);
            setPaginationInfo(prev => ({
                ...prev,
                totalPages: response.data.totalPages || 1,
                totalRegistros: response.data.total || 0
            }));
        } else {
            console.error('Formato de respuesta inesperado:', response.data);
            setError('Formato de respuesta inválido');
        }
    } catch (error) {
        console.error("Error fetching asignaciones:", error);
        setError(error.message || 'Error al cargar las asignaciones');
    } finally {
        setLoading(false);
    }
};

  // Effects
  useEffect(() => {
    if (getToken()) {
      fetchAsignaciones();
    }
  }, [month, year, paginationInfo.page, searchTerm]);


  const fetchFichasClinicas = async (institucionId) => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(
        `${apiUrl}/fichas-clinicas/institucion/${institucionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: paginationInfo.registrosPorPagina,
            page: paginationInfo.page,
            search: searchTerm
          }
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error obteniendo fichas clínicas:", error);
      return [];
    }
  };

  const handleCentroClick = async (periodoId, centroId) => {
    const uniqueId = `${periodoId}-${centroId}`;
    
    if (selectedCentro === uniqueId) {
      setSelectedCentro(null);
    } else {
      setSelectedCentro(uniqueId);
      setLoading(true);
      
      try {
        const fichas = await fetchFichasClinicas(centroId);
        setAsignaciones(prevAsignaciones => 
          prevAsignaciones.map(rotacion => ({
            ...rotacion,
            instituciones: rotacion.instituciones.map(inst => 
              inst.id === centroId 
                ? { ...inst, fichasClinicas: fichas }
                : inst
            )
          }))
        );
      } catch (error) {
        console.error('Error al obtener fichas:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleIngresarFicha = (institucionId) => {
    navigate('/home', {
      state: {
        component: 'ingresar-ficha-clinica',
        usuarioId: user.id,
        estudianteId: user.estudiante_id,
        institucionId: institucionId
      }
    });
};

  // Manejo de fichas
  const handleFichaClick = (fichaId, tipo) => {
    navigate('/home', {
      state: {
        component: 'ficha-clinica',
        fichaId: fichaId,
        tipo: tipo
      }
    });
  };

  const handleVerMasFichas = async (fichas, institucionId) => {
    // Verificar que institucionId existe
    if (!institucionId) {
        console.error('ID de institución no definido');
        return;
    }

    // Guardar el ID de la institución actual para usarlo en las peticiones del modal
    const currentInstitucionId = institucionId;

    // Resetear estados del modal
    setModalSearchTerm('');
    setModalFechasFiltro({ fechaInicio: '', fechaFin: '' });
    setModalFiltroReevaluacion('');
    setModalPaginationInfo(prev => ({
        ...prev,
        page: 1
    }));

    setLoading(true);
    try {
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;

        const response = await axios.get(
            `${apiUrl}/fichas-clinicas/institucion/${currentInstitucionId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: 1, 
                    limit: modalPaginationInfo.registrosPorPagina,
                    search: '', 
                    fechaInicio: '', 
                    fechaFin: '', 
                    isReevaluacion: '' 
                }
            }
        );

        setAllFichas(response.data.data);
        setModalPaginationInfo(prev => ({
            ...prev,
            currentInstitucionId,
            page: response.data.pagination.paginaActual,
            totalPages: response.data.pagination.totalPaginas,
            totalRegistros: response.data.pagination.totalRegistros,
            registrosPorPagina: modalPaginationInfo.registrosPorPagina
        }));
        setShowAllFichasModal(true);
    } catch (error) {
        console.error('Error al cargar fichas:', error);
    } finally {
        setLoading(false);
    }
};

const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPaginationInfo(prev => ({
        ...prev,
        page: 1
    }));

    if (selectedCentro) {
        await fetchFichasClinicas(selectedCentro.split('-')[1]);
    }
};

const handlePaginationClick = (page) => {
    setPaginationInfo(prev => ({ ...prev, page }));
  };

  const handlePagination = async (direction) => {
    if (!selectedCentro) return;
    
    const newPage = direction === 'next' 
      ? paginationInfo.page + 1 
      : paginationInfo.page - 1;

    if (newPage < 1 || newPage > paginationInfo.totalPages) return;

    setLoading(true);
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const institucionId = selectedCentro.split('-')[1];

      const response = await axios.get(
        `${apiUrl}/fichas-clinicas/institucion/${institucionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: newPage,
            limit: paginationInfo.registrosPorPagina,
            search: searchTerm
          }
        }
      );

      setAllFichas(response.data.data);
      setPaginationInfo(prev => ({
        ...prev,
        page: response.data.pagination.paginaActual
      }));
    } catch (error) {
      console.error('Error cargando página:', error);
    } finally {
      setLoading(false);
    }
  };

  //Modal
  const fetchFichasParaModal = async () => {
    setLoading(true);
    try {
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;
        
        // Usar el ID de la institución guardado en el estado
        const institucionId = modalPaginationInfo.currentInstitucionId;
        
        if (!institucionId) {
            console.error('ID de institución no disponible');
            return;
        }

        const response = await axios.get(
            `${apiUrl}/fichas-clinicas/institucion/${institucionId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: modalPaginationInfo.page,
                    limit: modalPaginationInfo.registrosPorPagina,
                    search: modalSearchTerm,
                    fechaInicio: modalFechasFiltro.fechaInicio,
                    fechaFin: modalFechasFiltro.fechaFin,
                    isReevaluacion: modalFiltroReevaluacion
                }
            }
        );

        setAllFichas(response.data.data);
        setModalPaginationInfo(prev => ({
            ...prev,
            page: response.data.pagination.paginaActual,
            totalPages: response.data.pagination.totalPaginas,
            totalRegistros: response.data.pagination.totalRegistros,
            registrosPorPagina: modalPaginationInfo.registrosPorPagina
        }));
    } catch (error) {
        console.error('Error al cargar fichas:', error);
    } finally {
        setLoading(false);
    }
};

  // Renderizado
  return (
    <div className="agenda-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary font-weight-bold">Agenda</h2>
        <div className="badge badge-info">
          {getSemester()}
        </div>
      </div>

      {/* Advertencia */}
      <div className="alert alert-warning mb-4">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <strong>Importante:</strong> No se asisten los fines de semana ni feriados irrenunciables.
      </div>

      {/* Navegación de meses */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={handlePrevMonth}>
          <i className="fas fa-chevron-left mr-2"></i> {getPrevMonth()}
        </button>
        <h3 className="text-primary">{getMonthName(month)} {year}</h3>
        <button className="btn btn-outline-primary" onClick={handleNextMonth}>
          {getNextMonth()} <i className="fas fa-chevron-right ml-2"></i>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="card-tools mb-4">
        <div className="input-group input-group-sm" style={{ width: '250px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por estudiante o RUT..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="input-group-append">
            <button className="btn btn-default">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

    {/* Timeline de asignaciones */}
    {loading ? (
        <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Cargando...</span>
            </div>
        </div>
    ) : error ? (
        <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
        </div>
    ) : asignaciones && asignaciones.length > 0 ? (
        <div className="timeline-view">
            {asignaciones.map((rotacion, index) => (
                <div key={`rotacion-${index}`} className="timeline-item">
                    <div className="timeline-date">
                        <div className="date-marker"></div>
                        <h6 className="mb-0">{rotacion.periodo}</h6>
                    </div>
                    <div className="timeline-content">
                        {rotacion.instituciones.map((institucion, instIndex) => (
                            <div 
                                key={`inst-${institucion.id}-${instIndex}`} 
                                className={`institucion-row shadow-sm ${selectedCentro === `${rotacion.periodo}-${institucion.id}` ? 'selected' : ''}`}
                                onClick={() => handleCentroClick(rotacion.periodo, institucion.id)}
                            >
                                <div className="institucion-info">
                                    <div className="institucion-nombre">
                                        <i className="fas fa-hospital mr-2"></i>
                                        {institucion.nombre}
                                    </div>
                                    <div className="institucion-receptor text-muted">
                                        <i className="fas fa-user-md mr-2"></i>
                                        Receptora: {institucion.receptora}
                                    </div>
                                </div>
                                <div className="estudiantes-chips">
                                    {institucion.estudiantes.map((estudiante, estIndex) => (
                                        <span 
                                            key={`est-${institucion.id}-${estIndex}`} 
                                            className="estudiante-chip"
                                        >
                                            <i className="fas fa-user-graduate mr-2"></i>
                                            {estudiante}
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Botones adicionales cuando se expande una institución */}
                                {selectedCentro === `${rotacion.periodo}-${institucion.id}` && (
                                    <div className="institucion-actions mt-3">
                                        {/* Botón para ingresar nueva ficha */}
                                        <button 
                                            className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleIngresarFicha(institucion.id);
                                            }}
                                        >
                                            <i className="fas fa-plus-circle mr-1"></i>
                                            Ingresar Ficha
                                        </button>

                                        {/* Fichas existentes o botón para ver más */}
                                        {institucion.fichasClinicas && institucion.fichasClinicas.length > 0 ? (
                                            <div className="fichas-preview mt-2">
                                                <h6>Fichas Clínicas:</h6>
                                                {institucion.fichasClinicas.slice(0, 1).map((ficha, fichaIndex) => (
                                                    <div 
                                                        key={`ficha-preview-${ficha.id}`}
                                                        className="ficha-preview-item"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFichaClick(ficha.id, ficha.tipo);
                                                        }}
                                                    >
                                                        {ficha.paciente?.nombres} {ficha.paciente?.apellidos}
                                                    </div>
                                                ))}
                                                {institucion.fichasClinicas.length > 2 && (
                                                    <button 
                                                        className="btn btn-link btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVerMasFichas(institucion.fichasClinicas, institucion.id);
                                                        }}
                                                    >
                                                        Ver más
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-muted mt-2">
                                                No hay fichas clínicas disponibles
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <div className="alert alert-info text-center">
            <i className="fas fa-calendar-times mr-2"></i>
            No hay asignaciones programadas para {getMonthName(month)} {year}
        </div>
    )}

      {/* Paginación */}
      <Pagination>
        <Pagination.Prev 
          onClick={() => handlePagination('prev')} 
          disabled={paginationInfo.page === 1} 
        />
        {[...Array(paginationInfo.totalPages)].map((_, index) => (
          <Pagination.Item 
            key={index} 
            active={index + 1 === paginationInfo.page} 
            onClick={() => handlePaginationClick(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next 
          onClick={() => handlePagination('next')} 
          disabled={paginationInfo.page === paginationInfo.totalPages} 
        />
      </Pagination>

      {/* Modal para mostrar todas las fichas clínicas */}
      <Modal 
        show={showAllFichasModal} 
        onHide={() => {
            setShowAllFichasModal(false);
            setModalSearchTerm('');
            setModalFechasFiltro({ fechaInicio: '', fechaFin: '' });
            setModalFiltroReevaluacion('');
            setModalPaginationInfo({
                page: 1,
                totalPages: 0,
                totalRegistros: 0,
                registrosPorPagina: 5,
                currentInstitucionId: null
            });
            setAllFichas([]);
        }}
        size="lg"
    >
    <Modal.Header closeButton>
        <Modal.Title>
            Todas las Fichas Clínicas 
            <small className="text-muted ml-2">
                ({modalPaginationInfo.totalRegistros} registros)
            </small>
        </Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {/* Filtros */}
        <div className="mb-4">
        <Form>
                <Row>
                    <Col md={12}>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>
                                <i className="fas fa-search"></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por RUT o nombres del paciente..."
                                value={modalSearchTerm}
                                onChange={(e) => {
                                    setModalSearchTerm(e.target.value);
                                    setModalPaginationInfo(prev => ({ ...prev, page: 1 }));
                                    // Usar setTimeout para evitar demasiadas llamadas
                                    setTimeout(() => {
                                        fetchFichasParaModal();
                                    }, 300);
                                }}
                            />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                value={modalFechasFiltro.fechaInicio}
                                onChange={(e) => {
                                    setModalFechasFiltro(prev => ({ ...prev, fechaInicio: e.target.value }));
                                    setModalPaginationInfo(prev => ({ ...prev, page: 1 }));
                                    fetchFichasParaModal(); // Recargar con nuevo filtro
                                }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Fecha Fin</Form.Label>
                            <Form.Control
                                type="date"
                                value={modalFechasFiltro.fechaFin}
                                onChange={(e) => {
                                    setModalFechasFiltro(prev => ({ ...prev, fechaFin: e.target.value }));
                                    setModalPaginationInfo(prev => ({ ...prev, page: 1 }));
                                    fetchFichasParaModal(); // Recargar con nuevo filtro
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </div>

        {loading ? (
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Cargando...</span>
                </div>
            </div>
        ) : (
            <>
                <div className="fichas-list">
                    {allFichas.map((ficha, index) => (
                        <div 
                            key={`ficha-${ficha.id}-${index}`}
                            className="ficha-item p-2 mb-2 border rounded cursor-pointer hover-bg-light"
                            onClick={() => {
                                handleFichaClick(ficha.id, ficha.tipo);
                                setShowAllFichasModal(false);
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <i className="fas fa-clipboard-list mr-2"></i>
                                    <strong>{ficha.paciente?.nombres} {ficha.paciente?.apellidos}</strong>
                                    <span className="ml-2 text-muted">
                                        {ficha.paciente?.rut}
                                    </span>
                                </div>
                                <div>
                                    <span className={`badge ${ficha.is_reevaluacion ? 'bg-warning' : 'bg-primary'} me-2`}></span>
                                    <small className="text-muted">
                                        {new Date(ficha.fecha).toLocaleDateString('es-CL')}
                                    </small>
                                </div>
                            </div>
                            <div className="mt-1 text-muted small">
                                {ficha.diagnostico ? ficha.diagnostico.nombre : ficha.diagnostico_otro || 'Sin diagnóstico'}
                            </div>
                        </div>
                    ))}
                </div>

                {paginationInfo.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${paginationInfo.page === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePagination('prev')}
                                        disabled={paginationInfo.page === 1}
                                    >
                                        Anterior
                                    </button>
                                </li>
                                {[...Array(paginationInfo.totalPages)].map((_, index) => (
                                    <li 
                                        key={index} 
                                        className={`page-item ${index + 1 === paginationInfo.page ? 'active' : ''}`}
                                    >
                                        <button 
                                            className="page-link"
                                            onClick={() => handlePaginationClick(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${paginationInfo.page === paginationInfo.totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => handlePagination('next')}
                                        disabled={paginationInfo.page === paginationInfo.totalPages}
                                    >
                                        Siguiente
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </>
        )}
    </Modal.Body>
</Modal>
    </div>
  );
};

export default Agenda;