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
          asignacion.instituciones.some(inst => 
            inst.estudiantes.includes(`${user.nombres} ${user.apellidos}`) // Cambia esto si el nombre del estudiante no es el mismo que el del usuario
          )
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
          receptora: asignacion.Institucion.receptores[0]?.nombre || 'Sin receptor',
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

  const handleVerMasFichas = (fichas) => {
    setAllFichas(fichas);
    setShowAllFichasModal(true);
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
      const [fechaInicioStr] = rotacion.periodo.split(' al ');
      const [dia, mes, anio] = fechaInicioStr.split('-');
      const fechaInicio = new Date(anio, mes - 1, dia);
      
      // Crear fecha del mes y año seleccionados
      const primerDiaMes = new Date(year, month, 1);
      const ultimoDiaMes = new Date(year, month + 1, 0);
  
      return fechaInicio >= primerDiaMes && fechaInicio <= ultimoDiaMes;
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
              {rotacion.instituciones.map((institucion) => {
              const uniqueId = `${index}-${institucion.id}`;
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
                      <span key={idx} className="estudiante-chip">
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
                          handleVerMasFichas(institucion.fichasClinicas || []);
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
                          {institucion.fichasClinicas.slice(0, 2).map((ficha) => (
                            <div 
                            key={ficha.id}
                            className="ficha-item p-2 mb-2 border rounded cursor-pointer hover-bg-light"
                            onClick={() => handleFichaClick(ficha.id, ficha.tipo)} // Asegúrate de pasar el tipo
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
                                    <span className="text-muted">{ficha.diagnostico}</span>
                                </div>
                            </div>
                          ))}
                          {institucion.fichasClinicas.length > 2 && (
                            <button 
                              className="btn btn-info btn-sm mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerMasFichas(institucion.fichasClinicas);
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
      {/* Modal para mostrar todas las fichas clínicas */}
      <Modal 
        show={showAllFichasModal} 
        onHide={() => {
          setShowAllFichasModal(false);
          setSearchTerm('');
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Todas las Fichas Clínicas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <div className="fichas-list">
            {filteredFichas.map((ficha) => (
              <div 
                key={ficha.id}
                className="ficha-item p-2 mb-2 border rounded cursor-pointer hover-bg-light"
                onClick={() => {
                    handleFichaClick(ficha.id, ficha.tipo); // Asegúrate de pasar el tipo
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
                  {ficha.diagnostico}
                </div>
              </div>
            ))}
            {filteredFichas.length === 0 && (
              <div className="alert alert-info text-center">
                No se encontraron fichas clínicas que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Agenda;
