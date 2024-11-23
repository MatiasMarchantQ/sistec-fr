import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FichaClinica.css';

import SeguimientoInfantil from './SeguimientoInfantil';
import SeguimientoAdulto from './SeguimientoAdulto';
import Reevaluacion from './Reevaluacion';

const FichaClinicaAdulto = ({ fichaClinica }) => {
  const navigate = useNavigate();
  const [valorHbA1c, setValorHbA1c] = useState(fichaClinica.factoresRiesgo?.valorHbac1 || '');

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Datos Personales</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>ID:</strong> {fichaClinica.id}</p>
              <p><strong>RUT:</strong> {fichaClinica.paciente?.rut}</p>
              <p><strong>Nombres:</strong> {fichaClinica.paciente?.nombres}</p>
              <p><strong>Apellidos:</strong> {fichaClinica.paciente?.apellidos}</p>
              <p><strong>Edad:</strong> {fichaClinica.paciente?.edad} Años</p>
            </div>
            <div className="col-md-6">
              <p><strong>Teléfono 1:</strong> {fichaClinica.paciente?.telefonoPrincipal}</p>
              <p><strong>Teléfono 2:</strong> {fichaClinica.paciente?.telefonoSecundario}</p>
              <p><strong>Dirección:</strong> {fichaClinica.direccion}</p>
              <p><strong>Conectividad:</strong> {fichaClinica.conectividad}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Información Médica</h5>
          <div className="row">
            <div className="col-md-6">
            <p><strong>Diagnostico:</strong> {fichaClinica.diagnostico}</p>
              <p>
                <strong>Escolaridad:</strong> {
                  (fichaClinica.escolaridad && 
                    (fichaClinica.escolaridad.nivel || 
                     fichaClinica.escolaridad.nombre || 
                     'No especificado')
                  ) || 
                  (fichaClinica.nivelEscolaridad && 
                    (fichaClinica.nivelEscolaridad.nivel || 
                     fichaClinica.nivelEscolaridad.nombre || 
                     'No especificado')
                  ) || 
                  'No especificado'
                }
              </p>
              <p><strong>Ocupación:</strong> {fichaClinica.ocupacion}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Con quién vive:</strong> {fichaClinica.conQuienVive}</p>
              <p><strong>Horario Llamada:</strong> {fichaClinica.horarioLlamada}</p>
              <p><strong>Fecha Evaluación:</strong> {fichaClinica.fecha ? new Date(fichaClinica.fecha).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Factores de Riesgo y Familia */}
      <div className="row">
        <div className="col-md-4">
          <h5 className="border-bottom pb-2">Factores de Riesgo</h5>
          <ul className="list-unstyled">
          <p><strong>Valor HbA1c: </strong>{valorHbA1c}%</p>
            <li><strong>Alcohol/Drogas:</strong> {fichaClinica.factoresRiesgo?.alcoholDrogas ? 'Sí' : 'No'}</li>
            <li><strong>Tabaquismo:</strong> {fichaClinica.factoresRiesgo?.tabaquismo ? 'Sí' : 'No'}</li>
            <li><strong>Específico:</strong> {fichaClinica.factoresRiesgo?.otros || 'N/A'}</li>
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="border-bottom pb-2">Ciclos Vitales Familiares</h5>
          <ul className="list-unstyled">
            {fichaClinica.ciclosVitalesFamiliares && fichaClinica.ciclosVitalesFamiliares.length > 0 ? (
              fichaClinica.ciclosVitalesFamiliares.map((ciclo, index) => (
                <li key={ciclo.id || index}>{ciclo.ciclo}</li>
              ))
            ) : (
              <li>No hay ciclos vitales registrados</li>
            )}
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="border-bottom pb-2">Tipos de Familia</h5>
          <ul className="list-unstyled">
            {fichaClinica.informacionFamiliar?.tiposFamilia && fichaClinica.informacionFamiliar.tiposFamilia.length > 0 ? (
              fichaClinica.informacionFamiliar.tiposFamilia.map((tipo, index) => (
                <li key={tipo.id || index}>{tipo.nombre}</li>
              ))
            ) : (
              <li>No hay tipos de familia registrados</li>
            )}
          </ul>
        </div>
      </div>

      {/* IDs de Sistema */}
      <div className="row mt-4">
        <div className="col-12">
          <h5 className="border-bottom pb-2">Información</h5>
          <div className="d-flex gap-4">
            {fichaClinica.estudiante && fichaClinica.estudiante.id && (
              <p className="mb-0">
                <strong>Estudiante:</strong> {`${fichaClinica.estudiante.nombres || ''} ${fichaClinica.estudiante.apellidos || ''}`.trim()}
              </p>
            )}
            {fichaClinica.usuario && fichaClinica.usuario.id && (
              <p className="mb-0">
                <strong>Usuario:</strong> {`${fichaClinica.usuario.nombres || ''} ${fichaClinica.usuario.apellidos || ''}`.trim()}
              </p>
            )}
            {fichaClinica.institucion && fichaClinica.institucion.id && (
              <p className="mb-0">
                <strong>Institución:</strong> {fichaClinica.institucion.nombre || ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const FichaClinicaInfantil = ({ fichaClinica }) => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Datos Personales</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>ID:</strong> {fichaClinica.id}</p>
              <p><strong>RUT:</strong> {fichaClinica.paciente?.rut}</p>
              <p><strong>Nombres:</strong> {fichaClinica.paciente?.nombres}</p>
              <p><strong>Apellidos:</strong> {fichaClinica.paciente?.apellidos}</p>
              <p><strong>Edad:</strong> {fichaClinica.paciente?.edad}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Teléfono 1:</strong> {fichaClinica.paciente?.telefonoPrincipal}</p>
              <p><strong>Teléfono 2:</strong> {fichaClinica.paciente?.telefonoSecundario}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Evaluación Psicomotora</h5>
          <div className="row">
            <div className="col-md-6">
            <p><strong>Puntaje DPM:</strong> {fichaClinica.evaluacionPsicomotora?.puntajeDPM}</p>
            <p><strong>Diagnóstico DSM:</strong> {fichaClinica.evaluacionPsicomotora?.diagnosticoDSM}</p> 
            </div>
          </div>
        </div>
      </div>

      <h5 className="border-bottom pb-2">Información Familiar</h5>
      <div className="row">
        <div className="col-md-6">
          <p><strong>Con quién vive:</strong> {fichaClinica.informacionFamiliar?.conQuienVive || 'N/A'}</p>
          <p><strong>Localidad:</strong> {fichaClinica.informacionFamiliar?.localidad || 'N/A'}</p>
          {/* Nuevo bloque para padres */}
          <h6 className="mt-3">Información de Padres/Tutores:</h6>
          {fichaClinica.informacionFamiliar?.padres && fichaClinica.informacionFamiliar.padres.length > 0 ? (
            fichaClinica.informacionFamiliar.padres.map((padre, index) => (
              <div key={padre.id} className="mb-2 p-2 border rounded">
                <p className="mb-1"><strong>Tutor {index + 1}:</strong> {padre.nombre}</p>
                <p className="mb-1">
                  <strong>Ocupación:</strong> {padre.ocupacion || 'No especificada'}
                </p>
                <p className="mb-1">
                  <strong>Escolaridad:</strong> {padre.escolaridad?.nivel || 'No especificada'}
                </p>
              </div>
            ))
          ) : (
            <p>No hay información de padres/tutores</p>
          )}
        </div>
        <div className="col-md-6">
          <h6>Tipo de Familia:</h6>
          {fichaClinica.informacionFamiliar?.tiposFamilia && fichaClinica.informacionFamiliar.tiposFamilia.length > 0 ? (
            fichaClinica.informacionFamiliar.tiposFamilia.map((tipo, index) => (
              <p key={tipo.id || index}>{tipo.nombre}</p>
            ))
          ) : (
            <p>No especificado</p>
          )}
          <h6>Ciclo Vital Familiar:</h6>
          <p>{fichaClinica.informacionFamiliar?.cicloVitalFamiliar?.ciclo || 'No especificado'}</p>
        </div>
      </div>

      <h5 className="border-bottom pb-2">Factores de Riesgo</h5>
      <div className="row">
        <div className="col-md-6">
          <h6>Factores de Riesgo Niño:</h6>
          <ul className="list-unstyled">
          {fichaClinica.factoresRiesgo?.nino?.length > 0 ? (
            fichaClinica.factoresRiesgo.nino.map((factor, index) => (
              <li key={factor.id || index}>{factor.nombre}</li>
            ))
          ) : (
            <li>No hay factores de riesgo registrados</li>
          )}
          </ul>
        </div>
        <div className="col-md-6">
          <h6> Factores de Riesgo Familiares:</h6>
          <ul className="list-unstyled">
          {fichaClinica.factoresRiesgo?.familiares?.length > 0 ? (
            fichaClinica.factoresRiesgo.familiares.map((factor, index) => (
              <li key={factor.id || index}>
                {factor.nombre} {factor.otras ? `(${factor.otras})` : ''}
              </li>
            ))
          ) : (
            <li>No hay factores de riesgo familiares registrados</li>
          )}
          </ul>
        </div>
      </div>

      {/* IDs de Sistema */}
      <div className="row mt-4">
        <div className="col-12">
          <h5 className="border-bottom pb-2">Información</h5>
          <div className="d-flex gap-4">
            {fichaClinica.estudiante && fichaClinica.estudiante.id && (
              <p className="mb-0">
                <strong>Estudiante:</strong> {`${fichaClinica.estudiante.nombres || ''} ${fichaClinica.estudiante.apellidos || ''}`.trim()}
              </p>
            )}
            {fichaClinica.usuario && fichaClinica.usuario.id && (
              <p className="mb-0">
                <strong>Usuario:</strong> {`${fichaClinica.usuario.nombres || ''} ${fichaClinica.usuario.apellidos || ''}`.trim()}
              </p>
            )}
            {fichaClinica.institucion && fichaClinica.institucion.id && (
              <p className="mb-0">
                <strong>Institución:</strong> {fichaClinica.institucion.nombre || ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const formatearFichaAdulto = (fichaClinica) => {
  return {
    id: fichaClinica.id || null,
    fecha: fichaClinica.fecha || null,
    is_reevaluacion: fichaClinica.is_reevaluacion || false,
    fichaOriginalId: fichaClinica.ficha_original_id || null,
    paciente: {
      id: fichaClinica.paciente?.id || null,
      nombres: fichaClinica.paciente?.nombres || 'N/A',
      apellidos: fichaClinica.paciente?.apellidos || 'N/A',
      rut: fichaClinica.paciente?.rut || 'N/A',
      edad: fichaClinica.paciente?.edad || 'N/A',
      telefonoPrincipal: fichaClinica.paciente?.telefonoPrincipal || 'N/A',
      telefonoSecundario: fichaClinica.paciente?.telefonoSecundario || 'N/A'
    },
    diagnostico: fichaClinica.diagnostico?.nombre || 'N/A', // Cambio aquí
    escolaridad: {
      id: fichaClinica.escolaridad?.id || null,
      nivel: fichaClinica.escolaridad?.nivel || 'No especificado'
    },
    ocupacion: fichaClinica.ocupacion || 'N/A',
    direccion: fichaClinica.direccion || 'N/A',
    conQuienVive: fichaClinica.conQuienVive || 'N/A',
    horarioLlamada: fichaClinica.horarioLlamada || 'N/A',
    conectividad: fichaClinica.conectividad || 'N/A',
    factoresRiesgo: {
      valorHbac1: fichaClinica.factoresRiesgo?.valorHbac1 || null,
      alcoholDrogas: fichaClinica.factoresRiesgo?.alcoholDrogas || false,
      tabaquismo: fichaClinica.factoresRiesgo?.tabaquismo || false,
      otros: fichaClinica.factoresRiesgo?.otros || null,
    },
    ciclosVitalesFamiliares: [
      {
        id: fichaClinica.cicloVitalFamiliar?.id || null,
        ciclo: fichaClinica.cicloVitalFamiliar?.ciclo || 'N/A'
      }
    ],
    tiposFamilia: (fichaClinica.tiposFamilia || []).map(t => ({
      id: t.id || null,
      nombre: t.nombre || 'N/A'
    })),
    informacionFamiliar: {
      tiposFamilia: (fichaClinica.tiposFamilia || []).map(t => ({
        id: t.id || null,
        nombre: t.nombre || 'N/A'
      }))
    },
    estudiante: {
      id: fichaClinica.estudiante?.id || null,
      nombres: fichaClinica.estudiante?.nombres || '',
      apellidos: fichaClinica.estudiante?.apellidos || '',
    },
    usuario: {
      id: fichaClinica.usuario?.id || null,
      nombres: fichaClinica.usuario?.nombres || '',
      apellidos: fichaClinica.usuario?.apellidos || '',
    },
    institucion: {
      id: fichaClinica.institucion?.id || null,
      nombre: fichaClinica.institucion?.nombre || '',
    },
    createdAt: fichaClinica.createdAt || null,
    updatedAt: fichaClinica.updatedAt || null
  };
};

const formatearFichaInfantil = (fichaClinica) => {
  return {
    id: fichaClinica.id || null,
    paciente: {
      id: fichaClinica.paciente?.id || null,
      nombres: fichaClinica.paciente?.nombres || 'N/A',
      apellidos: fichaClinica.paciente?.apellidos || 'N/A',
      rut: fichaClinica.paciente?.rut || 'N/A',
      edad: fichaClinica.paciente?.edad || 'N/A',
      telefonoPrincipal: fichaClinica.paciente?.telefonoPrincipal || 'N/A',
      telefonoSecundario: fichaClinica.paciente?.telefonoSecundario || 'N/A'
    },
    evaluacionPsicomotora: {
      puntajeDPM: fichaClinica.evaluacionPsicomotora?.puntajeDPM || 'N/A',
      diagnosticoDSM: fichaClinica.evaluacionPsicomotora?.diagnosticoDSM || 'N/A'
    },
    informacionFamiliar: {
      conQuienVive: fichaClinica.informacionFamiliar?.conQuienVive || 'N/A',
      tiposFamilia: (fichaClinica.informacionFamiliar?.tiposFamilia || []).map(tipo => ({
        id: tipo.id || null,
        nombre: tipo.nombre || 'No especificado'
      })),
      cicloVitalFamiliar: {
        id: fichaClinica.informacionFamiliar?.cicloVitalFamiliar?.id || null,
        ciclo: fichaClinica.informacionFamiliar?.cicloVitalFamiliar?.ciclo || 'No especificado'
      },
      localidad: fichaClinica.informacionFamiliar?.localidad || 'N/A',
      padres: (fichaClinica.informacionFamiliar?.padres || []).map(padre => ({
        id: padre.id || null,
        nombre: padre.nombre || 'N/A',
        escolaridad: {
          id: padre.escolaridad?.id || null,
          nivel: padre.escolaridad?.nivel || 'N/A'
        },
        ocupacion: padre.ocupacion || 'N/A'
      }))
    },
    factoresRiesgo: {
      nino: (fichaClinica.factoresRiesgo?.nino || []).map(factor => ({
        id: factor.id || null,
        nombre: factor.nombre || 'N/A'
      })),
      familiares: (fichaClinica.factoresRiesgo?.familiares || []).map(factor => ({
        id: factor.id || null,
        nombre: factor.nombre || '',
        otras: factor.otras || ''
      }))
    },
    estudiante: {
      id: fichaClinica.estudiante?.id || null,
      nombres: fichaClinica.estudiante?.nombres || '',
      apellidos: fichaClinica.estudiante?.apellidos || '',
    },
    usuario: {
      id: fichaClinica.usuario?.id || null,
      nombres: fichaClinica.usuario?.nombres || '',
      apellidos: fichaClinica.usuario?.apellidos || '',
    },
    institucion: {
      id: fichaClinica.institucion?.id || null,
      nombre: fichaClinica.institucion?.nombre || '',
    },
    createdAt: fichaClinica.createdAt || null,
    updatedAt: fichaClinica.updatedAt || null
  };
};

const FichaClinica = () => {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { fichaId, tipo } = location.state || {};
  const [fichaClinica, setFichaClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('informacion');
  const [reevaluaciones, setReevaluaciones] = useState([]);
  const [expandido, setExpandido] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [totalPaginas, setTotalPaginas] = useState(0);
  const reevaluacionesPorPagina = 5;

  // Definición de fetchFichaClinica como función
  const fetchFichaClinica = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaId}?tipo=${tipo}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const formattedData = tipo === 'adulto' 
        ? formatearFichaAdulto(response.data.data) 
        : formatearFichaInfantil(response.data.data);

      setFichaClinica(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener la ficha clínica:', err);
      setError('Error al cargar los datos de la ficha clínica');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fichaId && tipo) {
      fetchFichaClinica();
    } else {
      setLoading(false);
      setError('No se proporcionó un ID de ficha clínica válido o un tipo');
    }
  }, [fichaId, tipo, getToken]);

  // Función para volver al listado de fichas clínicas
  const handleVolver = () => {
    navigate('?component=listado-fichas-clinicas', { 
      state: { 
        tipo: tipo
      } 
    });
  };
  const fetchReevaluaciones = async (pagina = 1, fechaInicio = '', fechaFin = '') => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/reevaluaciones/${fichaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tipo,
            pagina,
            fechaInicio,
            fechaFin,
            limite: reevaluacionesPorPagina
          }
        }
      );

      setReevaluaciones(response.data.data);
      setTotalPaginas(response.data.totalPaginas);
      setPaginaActual(pagina);
    } catch (error) {
      console.error('Error al obtener reevaluaciones:', error);
      setReevaluaciones([]);
    }
  };
  
  useEffect(() => {
    if (fichaId && tipo) {
      setReevaluaciones([]); // Limpiar reevaluaciones al cambiar de ficha
      fetchFichaClinica();
      fetchReevaluaciones();
    } else {
      setLoading(false);
      setError('No se proporcionó un ID de ficha clínica válido o un tipo');
    }
  }, [fichaId, tipo]);

  const handleFiltrar = () => {
    fetchReevaluaciones(1, fechaInicio, fechaFin);
  };

  const cambiarPagina = (numeroPagina) => {
    fetchReevaluaciones(numeroPagina, fechaInicio, fechaFin);
  };

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <Container fluid className="mt-4">
        <Button 
          variant="" 
          onClick={handleVolver}
          style={{
            border: 'none',
            boxShadow: 'none',
            color: 'black'
          }}
        >
          <i className="fas fa-arrow-left me-8 pr-1"></i>Volver
        </Button>
        <h2 className="text-center mb-0 pb-2">
          Ficha Clínica {tipo === 'adulto' ? 'Adulto' : 'Infantil'} - {fichaClinica.paciente?.nombres} {fichaClinica.paciente?.apellidos}
        </h2>
      
      <Tabs 
        id="ficha-clinica-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="informacion" title="Información del Paciente">
          <div className="card mb-4">
            <div className="card-header text-white bg-primary">
              <i className="fas fa-user-circle me-2"></i>Información del Paciente
            </div>
            <div className="card-body">
              {tipo === 'adulto' ? (
                  <FichaClinicaAdulto fichaClinica={fichaClinica} />
                ) : (
                  <FichaClinicaInfantil fichaClinica={fichaClinica} />
                )}
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="seguimiento" title="Seguimiento">
          {tipo === 'infantil' ? (
            <SeguimientoInfantil 
              pacienteId={fichaClinica.paciente.id} 
              fichaId={fichaId} 
            />
          ) : (
            <SeguimientoAdulto 
              pacienteId={fichaClinica.paciente.id} 
              fichaId={fichaId} 
            />
          )}
        </Tab>

        <Tab eventKey="reevaluacion" title="Reevaluación">
          <div className="card mb-4">
            <div className="card-header text-white bg-primary">
              <i className="fas fa-refresh me-2"></i>Reevaluación del Paciente
            </div>
            <div className="card-body">
              {/* Botón para iniciar reevaluación */}
              <div className="text-center mb-4">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('?component=reevaluacion', { 
                    state: { 
                      fichaId: fichaClinica.id, 
                      tipo: tipo,
                      paciente: fichaClinica.paciente
                    } 
                  })}
                >
                  Iniciar Nueva Reevaluación
                </button>
              </div>

              {/* Sección para mostrar reevaluaciones existentes */}
              {reevaluaciones && reevaluaciones.length > 0 ? (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label>Fecha Inicio</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Fecha Fin</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleFiltrar}
                      >
                        Filtrar
                      </button>
                    </div>
                  </div>

                  <h5 className="border-bottom pb-2">Reevaluaciones Previas</h5>
                  {reevaluaciones.map((reevaluacion, index) => (
                    <div key={reevaluacion.id} className="card mb-3">
                      <div 
                        className="card-header d-flex justify-content-between align-items-center" 
                        onClick={() => setExpandido(index === expandido ? null : index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="me-auto"> {/* Esto se asegura de que el contenido a la izquierda permanezca a la izquierda */}
                          <strong>Reevaluación {index + 1}</strong>
                        </div>
                        <div className="d-flex align-items-center">
                          <span>{new Date(reevaluacion.fecha).toLocaleDateString()}</span>
                          <i className={`fas fa-chevron-${expandido === index ? 'up' : 'down'} ms-2`}></i> {/* Agregar un margen a la izquierda del ícono */}
                        </div>
                      </div>
                      {expandido === index && (
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">Información Personal</h6>
                              <p><strong>Diagnóstico:</strong> {reevaluacion.diagnostico?.nombre || 'N/A'}</p>
                              <p><strong>Ocupación:</strong> {reevaluacion.ocupacion || 'N/A'}</p>
                              <p><strong>Escolaridad:</strong> {reevaluacion.escolaridad?.nivel || 'N/A'}</p>
                              <p><strong>Con quién vive:</strong> {reevaluacion.conQuienVive || 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">Factores de Riesgo</h6>
                              <p><strong>Valor HbA1c:</strong> {reevaluacion.factoresRiesgo?.valorHbac1 || 'N/A'}%</p>
                              <ul>
                                <li>Alcohol/Drogas: {reevaluacion.factoresRiesgo?.alcoholDrogas ? 'Sí' : 'No'}</li>
                                <li>Tabaquismo: {reevaluacion.factoresRiesgo?.tabaquismo ? 'Sí' : 'No'}</li>
                                <li>Otros: {reevaluacion.factoresRiesgo?.otros || 'N/A'}</li>
                              </ul>
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">Información Familiar</h6>
                              <p><strong>Ciclo Vital Familiar:</strong> {reevaluacion.cicloVitalFamiliar?.ciclo || 'N/A'}</p>
                              <p><strong>Tipos de Familia:</strong></p>
                              <ul>
                                {reevaluacion.tiposFamilia && reevaluacion.tiposFamilia.length > 0 ? (
                                  reevaluacion.tiposFamilia.map((tipo, idx) => (
                                    <li key={idx}>{tipo.nombre}</li>
                                  ))
                                ) : (
                                  <li>No hay tipos de familia registrados</li>
                                )}
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">Información Adicional</h6>
                              <p><strong>Dirección:</strong> {reevaluacion.direccion || 'N/A'}</p>
                              <p><strong>Horario de Llamada:</strong> {reevaluacion.horarioLlamada || 'N/A'}</p>
                              <p><strong>Conectividad:</strong> {reevaluacion.conectividad || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-12">
                              <h6 className="border-bottom pb-2">Observaciones</h6>
                              <p>{reevaluacion.observaciones || 'Sin observaciones'}</p>
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">{reevaluacion.estudiante ? 'Estudiante' : 'Usuario'}</h6>
                              <p>
                                <strong>Nombre:</strong> {
                                  reevaluacion.estudiante 
                                    ? `${reevaluacion.estudiante.nombres} ${reevaluacion.estudiante.apellidos}` 
                                    : reevaluacion.usuario 
                                      ? `${reevaluacion.usuario.nombres} ${reevaluacion.usuario.apellidos}` 
                                      : 'N/A'
                                }
                              </p>
                              <p>
                                <strong>{reevaluacion.estudiante ? 'Email' : 'Correo'}:</strong> {
                                  reevaluacion.estudiante?.correo || 
                                  reevaluacion.usuario?.correo || 
                                  'N/A'
                                }
                              </p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="border-bottom pb-2">Institución</h6>
                              <p><strong>Nombre:</strong> {reevaluacion.institucion?.nombre || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Componente de paginación */}
                  <nav>
                    <ul className="pagination justify-content-center">
                      {[...Array(totalPaginas)].map((_, index) => (
                        <li 
                          key={index} 
                          className={`page-item ${paginaActual === index + 1 ? 'active' : ''}`}
                        >
                          <button 
                            className="page-link" 
                            onClick={() => cambiarPagina(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ) : (
                <div className="alert alert-info text-center">
                  No se han realizado reevaluaciones previas
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default FichaClinica;