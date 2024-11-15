import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Modal, Form, InputGroup } from 'react-bootstrap';
import './Agenda.css';

const Agenda = ({ onFichaSelect, setActiveComponent }) => {
  const { user, getToken } = useAuth();
  const currentDate = new Date();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());  
  const [showAllFichasModal, setShowAllFichasModal] = useState(false);
  const [allFichas, setAllFichas] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    totalPages: 0,
    totalRegistros: 0,
    registrosPorPagina: 15
  });
  const [asignaciones, setAsignaciones] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Agrupar asignaciones por período
      const asignacionesAgrupadas = agruparAsignacionesPorPeriodo(response.data.asignaciones);
      
      // Filtrar asignaciones si el rol es 3
      if (user.rol_id === 3) {
        const filteredAsignaciones = asignacionesAgrupadas.filter(asignacion => 
          asignacion.estudiante_id === user.estudiante_id // Filtra solo las asignaciones del estudiante autenticado
        );

        setAsignaciones(filteredAsignaciones);
      } else {
        setAsignaciones(asignacionesAgrupadas);
      }
    } catch (error) {
      console.error("Error fetching asignaciones:", error);
    }
  };

  const agruparAsignacionesPorPeriodo = (asignaciones) => {
    const grupos = asignaciones.reduce((acc, asignacion) => {
      const periodo = `${formatDate(asignacion.fecha_inicio)} al ${formatDate(asignacion.fecha_fin)}`;
      
      if (!acc[periodo]) {
        acc[periodo] = {
          periodo,
          instituciones: {}
        };
      }
  
      // Agrupar por institución dentro de cada período
      const institucionId = asignacion.institucion_id;
      if (!acc[periodo].instituciones[institucionId]) {
        acc[periodo].instituciones[institucionId] = {
          id: institucionId,
          nombre: asignacion.Institucion.nombre,
          receptora: (asignacion.Receptor?.cargo + ' ' + asignacion.Receptor?.nombre) || 'Sin receptor',
          estudiantes: [],
          fichasClinicas: []
        };
      }
  
      // Agregar estudiante a la institución
      acc[periodo].instituciones[institucionId].estudiantes.push(
        `${asignacion.Estudiante.nombres} ${asignacion.Estudiante.apellidos}`
      );
  
      return acc;
    }, {});
  
    // Convertir el objeto de grupos a array
    return Object.values(grupos).map(grupo => ({
      ...grupo,
      instituciones: Object.values(grupo.instituciones)
    }));
  };

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
  console.log(institucionId);
  setLoading(true);
  try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      // Agregar el término de búsqueda a los parámetros
      const response = await axios.get(
          `${apiUrl}/fichas-clinicas/institucion/${institucionId}`,
          { 
              headers: { Authorization: `Bearer ${token}` },
              params: { 
                  page: 1, 
                  limit: 15,
                  search: searchTerm // Agregar el término de búsqueda
              }
          }
      );

      setAllFichas(response.data.data);
      setPaginationInfo({
          page: response.data.pagination.paginaActual,
          totalPages: response.data.pagination.totalPaginas,
          totalRegistros: response.data.pagination.totalRegistros,
          registrosPorPagina: 15
      });
      setShowAllFichasModal(true);
  } catch (error) {
      console.error('Error al cargar fichas:', error);
  } finally {
      setLoading(false);
  }
};

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

  const getSemester = () => {
    if (month >= 2 && month <= 6) {
      return '1er Semestre';
    } else if (month >= 7 && month <= 11) {
      return '2do Semestre';
    } else {
      return 'Fuera de Semestre';
    }
  };

  const getPrevMonth = () => {
    return month === 0 ? getMonthName(11) : getMonthName(month - 1);
  };

  const getNextMonth = () => {
    return month === 11 ? getMonthName(0) : getMonthName(month + 1);
  };

  const fetchFichasClinicas = async (institucionId) => {
    try {
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(
            `${apiUrl}/fichas-clinicas/institucion/${institucionId}`,
            { headers: { Authorization: `Bearer ${token}` }}
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
        // Obtener fichas clínicas del centro
        const response = await fetchFichasClinicas(centroId);
        const fichas = response || [];
                
        // Actualizar asignaciones con las fichas
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

  // Función para filtrar fichas basadas en el término de búsqueda
  const filteredFichas = allFichas.filter(ficha => 
    `${ficha.paciente?.nombres} ${ficha.paciente?.apellidos}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filtrarAsignacionesPorMes = (asignaciones) => {
    return asignaciones.filter(rotacion => {
        const [fechaInicioStr, fechaFinStr] = rotacion.periodo.split(' al ');
        const [diaInicio, mesInicio, anioInicio] = fechaInicioStr.split('-');
        const [diaFin, mesFin, anioFin] = fechaFinStr.split('-');
        
        const fechaInicio = new Date(anioInicio, mesInicio - 1, diaInicio);
        const fechaFin = new Date(anioFin, mesFin - 1, diaFin);
        
        // Crear fecha del mes y año seleccionados
        const primerDiaMes = new Date(year, month, 1);
        const ultimoDiaMes = new Date(year, month + 1, 0);

        // Verificar si la asignación se solapa con el mes actual
        return (fechaInicio <= ultimoDiaMes && fechaFin >= primerDiaMes);
    });
  };

  const ordenarAsignacionesPorFecha = (asignaciones) => {
    return asignaciones.sort((a, b) => {
      const fechaA = new Date(a.periodo.split(' al ')[0].split('-').reverse().join('-'));
      const fechaB = new Date(b.periodo.split(' al ')[0].split('-').reverse().join('-'));
      return fechaA - fechaB;
    });
  };

  const handleIngresarFicha = (institucionId) => {
    navigate('/home?component=ingresar-ficha-clinica', { 
      state: { 
        component: 'ingresar-ficha-clinica',
        usuarioId: user.id,
        estudianteId: user.estudiante_id,
        institucionId: institucionId
      }
    });
  };

  return (
    <div className="agenda-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary font-weight-bold">Agenda</h2>
        <div className="badge badge-info">
          {getSemester()}
        </div>
      </div>
  
      <div className="alert alert-warning mb-4">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <strong>Importante:</strong> No se asisten los fines de semana ni feriados irrenunciables.
      </div>
  
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={handlePrevMonth}>
          <i className="fas fa-chevron-left mr-2"></i> {getPrevMonth()}
        </button>
        <h3 className="text-primary">{getMonthName(month)} {year}</h3>
        <button className="btn btn-outline-primary" onClick={handleNextMonth}>
          {getNextMonth()} <i className="fas fa-chevron-right ml-2"></i>
        </button>
      </div>
  
      {filtrarAsignacionesPorMes(asignaciones).length > 0 ? (
        <div className="timeline-view">
          {ordenarAsignacionesPorFecha(filtrarAsignacionesPorMes(asignaciones)).map((rotacion, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-date">
                <div className="date-marker"></div>
                <h6 className="mb-0">{rotacion.periodo}</h6>
              </div>
              
              <div className="timeline-content">
              {rotacion.instituciones.map((institucion, institutionIndex) => {
              const uniqueId = `${index}-${institucion.id}-${institutionIndex}`;
              const isExpanded = selectedCentro === uniqueId;
              
              return (
                <div 
                  key={institucion.id} 
                  className="institucion-row shadow-sm"
                  onClick={() => handleCentroClick(index, institucion.id)}
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
                  {institucion.estudiantes.map((estudiante, idx) => (
                    <span key={`${institucion.id}-estudiante-${idx}`} className="estudiante-chip">
                      <i className="fas fa-user-graduate mr-2"></i>
                      {estudiante}
                    </span>
                  ))}
                  </div>

                  {/* Botones que solo son visibles cuando la card no está expandida */}
                  {!isExpanded && (
                    <div className="acciones mt-2">
                      <button 
                        className="btn btn-info btn-sm mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Pasar explícitamente el ID de la institución
                          handleVerMasFichas(institucion.fichasClinicas || [], institucion.id);
                        }}
                      >
                        Ver fichas clínicas
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIngresarFicha(institucion.id);
                        }}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Ingresar Nueva Ficha Clínica
                      </button>
                    </div>
                  )}
                  
                  {isExpanded && (
                    <div className="acciones">
                      <h6 className="border-bottom pb-2 text-primary">
                        <i className="fas fa-file-medical-alt mr-2"></i>
                        Fichas Clínicas
                      </h6>
                      {loading ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Cargando...</span>
                          </div>
                        </div>
                      ) : institucion.fichasClinicas && institucion.fichasClinicas.length > 0 ? (
                        <div className="fichas-list">
                          {institucion.fichasClinicas.slice(0, 2).map((ficha, fichaIndex) => (
                                <div 
                                  key={`${institucion.id}-ficha-${ficha.id}-${fichaIndex}`}
                                  className="ficha-item p-2 mb-2 border rounded cursor-pointer hover-bg-light"
                                  onClick={() => handleFichaClick(ficha.id, ficha.tipo)}
                                >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className={`fas fa-${ficha.tipo === 'infantil' ? 'baby' : 'user'} mr-2`}></i>
                                        <strong>{ficha.paciente?.nombres} {ficha.paciente?.apellidos}</strong>
                                    </div>
                                    <small className="text-muted">
                                        {new Date(ficha.fecha).toLocaleDateString('es-CL')}
                                    </small>
                                </div>
                                <div className="mt-1">
                                    <span className={`badge badge-${ficha.tipo === 'infantil' ? 'info' : 'primary'} mr-2`}>
                                        {ficha.tipo === 'infantil' ? 'Infantil' : 'Adulto'}
                                    </span>
                                    <span className="text-muted">{ficha.diagnostico.nombre}</span>
                                </div>
                            </div>
                          ))}
                         {institucion.fichasClinicas.length > 2 && (
                          <button 
                            className="btn btn-info btn-sm mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Pasar explícitamente el ID de la institución
                              handleVerMasFichas(institucion.fichasClinicas, institucion.id);
                            }}
                          >
                            Ver más fichas clínicas
                          </button>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-info text-center mt-2">
                          <i className="fas fa-info-circle mr-2"></i>
                          No hay fichas clínicas registradas para este centro
                        </div>
                      )}
                      <button 
                        className="btn btn-primary btn-sm mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIngresarFicha(institucion.id);
                        }}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Ingresar Nueva Ficha Clínica
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Modal para mostrar todas las fichas clínicas */}
      <Modal 
          show={showAllFichasModal} 
          onHide={() => {
            setShowAllFichasModal(false);
            setSearchTerm('');
            setPaginationInfo({
              page: 1,
              totalPages: 0,
              totalRegistros: 0,
              registrosPorPagina: 15
            });
          }}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Todas las Fichas Clínicas 
              <small className="text-muted ml-2">
                ({paginationInfo.totalRegistros} registros)
              </small>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por RUT, nombre o apellidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
      </InputGroup>
    </Form.Group>

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
                setSearchTerm('');
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="fas fa-clipboard-list mr-2"></i>
                  <strong>{ficha.paciente?.nombres} {ficha.paciente?.apellidos}</strong>
                </div>
                <small className="text-muted">
                  {new Date(ficha.fecha).toLocaleDateString('es-CL')}
                </small>
              </div>
              <div className="mt-1 text-muted small">
                  {ficha.diagnostico ? ficha.diagnostico.nombre : ficha.diagnostico_otro || 'Sin diagnóstico'}              </div>
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
                    onClick={async () => {
                      if (paginationInfo.page > 1) {
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
                                page: paginationInfo.page - 1, 
                                limit: 15, 
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
                      }
                    }}
                  >
                    Anterior
                  </button>
                </li>
                <li className={`page-item ${paginationInfo.page === paginationInfo.totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={async () => {
                      if (paginationInfo.page < paginationInfo.totalPages) {
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
                                page: paginationInfo.page + 1, 
                                limit: 15, 
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
                      }
                    }}
                  >
                    Siguiente
                  </button>
                </li> </ul>
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
