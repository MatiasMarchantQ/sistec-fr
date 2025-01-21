import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import _ from 'lodash';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import SeguimientoInfantil from '../Seg/SeguimientoInfantil';
import SeguimientoAdulto from '../Seg/SeguimientoAdulto';
import ModalEditarFichaAdulto from './ModalEditarFichaAdulto';
import ModalEditarFichaInfantil from './ModalEditarFichaInfantil';

const FichaClinicaAdulto = ({ fichaClinica }) => {
  const navigate = useNavigate();
  const [valorHbA1c, setValorHbA1c] = useState(fichaClinica.factoresRiesgo?.valorHbac1 || '');
  if (!fichaClinica) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Datos Personales</h5>
          <div className="row">
            <div className="col-md-6">
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
              <p>
                <strong>Diagnósticos: </strong>
                {Array.isArray(fichaClinica.diagnosticos) && fichaClinica.diagnosticos.length > 0
                  ? fichaClinica.diagnosticos.map((diag, index) => (
                    <span key={index}>
                      {diag.esOtro ? diag.diagnosticoOtro : diag.nombre}
                      {index < fichaClinica.diagnosticos.length - 1 ? ', ' : ''}
                    </span>
                  ))
                  : 'N/A'}
              </p>
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
                <li key={tipo.id || index}>
                  {tipo.tipoFamiliaOtro || tipo.nombre}
                </li>
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
              <p><strong>RUT:</strong> {fichaClinica.paciente?.rut}</p>
              <p><strong>Nombres:</strong> {fichaClinica.paciente?.nombres}</p>
              <p><strong>Apellidos:</strong> {fichaClinica.paciente?.apellidos}</p>
              <p><strong>Fecha de Nacimiento:</strong> {fichaClinica.paciente?.fechaNacimiento}</p>
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
              <p key={tipo.id || index} className="mb-1">
                {tipo.nombre || tipo.tipoFamiliaOtro || 'N/A'}
              </p>
            ))
          ) : (
            <p className="mb-1">No hay tipos de familia registrados</p>
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
    diagnosticos: Array.isArray(fichaClinica.diagnosticos) ? fichaClinica.diagnosticos.map(diag => ({
      id: diag.id,
      nombre: diag.nombre,
      esOtro: diag.es_diagnostico_otro,
      diagnosticoOtro: diag.diagnostico_otro_texto
    })) : [],
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
      nombre: t.nombre || null,
      tipoFamiliaOtro: t.tipoFamiliaOtro || null
    })),
    informacionFamiliar: {
      tiposFamilia: (fichaClinica.tiposFamilia || []).map(t => ({
        id: t.id || null,
        nombre: t.nombre || null,
        tipoFamiliaOtro: t.tipoFamiliaOtro || null
      }))
    },
    estudiante: {
      id: fichaClinica.estudiante?.id || null,
      nombres: fichaClinica.estudiante?.nombres || '',
      apellidos: fichaClinica.estudiante?.apellidos || '',
      correo: fichaClinica.estudiante?.correo || '',
    },
    usuario: {
      id: fichaClinica.usuario?.id || null,
      nombres: fichaClinica.usuario?.nombres || '',
      apellidos: fichaClinica.usuario?.apellidos || '',
      correo: fichaClinica.usuario?.correo || '',
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
    fecha: fichaClinica.fecha_evaluacion || null,
    paciente: {
      id: fichaClinica.paciente?.id || null,
      nombres: fichaClinica.paciente?.nombres || 'N/A',
      apellidos: fichaClinica.paciente?.apellidos || 'N/A',
      rut: fichaClinica.paciente?.rut || 'N/A',
      fechaNacimiento: fichaClinica.paciente?.fechaNacimiento || 'N/A',
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
        nombre: tipo.nombre || null,
        tipoFamiliaOtro: tipo.tipoFamiliaOtro || null
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
      correo: fichaClinica.estudiante?.correo || '',
    },
    usuario: {
      id: fichaClinica.usuario?.id || null,
      nombres: fichaClinica.usuario?.nombres || '',
      apellidos: fichaClinica.usuario?.apellidos || '',
      correo: fichaClinica.usuario?.correo || '',
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
  const { user, getToken, handleSessionExpired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { fichaId, tipo } = location.state || {};
  const [fichaClinica, setFichaClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('informacion');
  const [reevaluaciones, setReevaluaciones] = useState([]);
  const [expandido, setExpandido] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [cambiosDetectados, setCambiosDetectados] = useState({});
  const [cambiosExpandidos, setCambiosExpandidos] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [totalPaginas, setTotalPaginas] = useState(0);
  const reevaluacionesPorPagina = 5;
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltrosAplicados(false);
    fetchReevaluaciones();
  };

  const esEditable = fichaClinica && user && (
    (fichaClinica.estudiante?.id === user.estudiante_id) ||
    (!fichaClinica.estudiante?.id && (user.rol_id === 1 || user.rol_id === 2)) ||
    (fichaClinica.usuario?.id && (user.rol_id === 1 || user.rol_id === 2)) ||
    (fichaClinica.estudiante?.id && (user.rol_id === 1 || user.rol_id === 2))
  );

  const handleActualizarFicha = () => {
    fetchFichaClinica();
  };

  const fetchFichaClinica = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        handleSessionExpired();
        return;
      }
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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleSessionExpired();
      } else {
        setError('Error al cargar los datos de la ficha clínica');
      }
    } finally {
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
    const estadoNavegacion = location.state;

    if (estadoNavegacion && estadoNavegacion.origen) {
      switch (estadoNavegacion.origen) {
        case 'listado-fichas':
          navigate('?component=listado-fichas-clinicas', {
            state: {
              tipo: tipo || 'adulto',
              ...estadoNavegacion
            }
          });
          break;
        case 'dashboard':
          navigate('/home?component=dashboard');
          break;
        default:
          navigate('?component=listado-fichas-clinicas', {
            state: {
              tipo: tipo || 'adulto'
            }
          });
      }
    } else {
      navigate('?component=agenda', {
        state: {
          fichaId: fichaClinica.id,
          tipo: tipo || 'adulto'
        }
      });
    }
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

      if (response.data && response.data.data) {
        // Formatear las reevaluaciones según el tipo
        const reevaluacionesFormateadas = response.data.data.map(reevaluacion =>
          tipo === 'adulto'
            ? formatearFichaAdulto(reevaluacion)
            : formatearFichaInfantil(reevaluacion)
        );
        setReevaluaciones(reevaluacionesFormateadas);
        setTotalRegistros(response.data.totalRegistros);
      } else {
        setReevaluaciones([]);
      }

      setTotalPaginas(response.data.totalPaginas || 0);
      setPaginaActual(pagina);
    } catch (error) {
      console.error('Error detallado al obtener reevaluaciones:', error.response ? error.response.data : error);
      setReevaluaciones([]);
    }
  };

  const compararDatos = (original, reevaluacion) => {
    const cambios = {};

    const camposComparar = tipo === 'adulto' ? [
      'diagnosticos',
      'escolaridad',
      'ocupacion',
      'direccion',
      'factoresRiesgo.valorHbac1',
      'factoresRiesgo.alcoholDrogas',
      'factoresRiesgo.tabaquismo',
      'conQuienVive',
      'horarioLlamada',
      'conectividad'
    ] : [
      'evaluacionPsicomotora.puntajeDPM',
      'evaluacionPsicomotora.diagnosticoDSM',
      'informacionFamiliar.conQuienVive',
      'informacionFamiliar.localidad',
      'informacionFamiliar.tiposFamilia',
      'factoresRiesgo.nino',
      'factoresRiesgo.familiares'
    ];

    camposComparar.forEach(campo => {
      const valorOriginal = _.get(original, campo);
      const valorReevaluacion = _.get(reevaluacion, campo);

      if (!_.isEqual(valorOriginal, valorReevaluacion)) {
        cambios[campo] = {
          original: valorOriginal,
          reevaluacion: valorReevaluacion
        };
      }
    });

    return cambios;
  };

  const renderCambiosDetectados = (cambios) => {
    const traducirCampo = (campo) => {
      const mapaCampos = {
        'diagnostico': 'Diagnóstico',
        'escolaridad': 'Escolaridad',
        'ocupacion': 'Ocupación',
        'direccion': 'Dirección',
        'factoresRiesgo.valorHbac1': 'Valor HbA1c',
        'factoresRiesgo.alcoholDrogas': 'Alcohol/Drogas',
        'factoresRiesgo.tabaquismo': 'Tabaquismo',
        'conQuienVive': 'Con Quién Vive',
        'horarioLlamada': 'Horario de Llamada',
        'conectividad': 'Conectividad',
        'evaluacionPsicomotora.puntajeDPM': 'Puntaje DPM',
        'evaluacionPsicomotora.diagnosticoDSM': 'Diagnóstico DSM',
        'informacionFamiliar.conQuienVive': 'Con Quién Vive',
        'informacionFamiliar.localidad': 'Localidad',
        'informacionFamiliar.tiposFamilia': 'Tipos de Familia',
        'factoresRiesgo.nino': 'Factores de Riesgo del Niño',
        'factoresRiesgo.familiares': 'Factores de Riesgo Familiares'
      };
      return mapaCampos[campo] || campo;
    };

    const formatearValor = (valor) => {
      if (Array.isArray(valor)) {
        return valor.map(diag =>
          diag.esOtro ? diag.diagnosticoOtro : diag.nombre
        ).join(', ');
      }
      if (valor && typeof valor === 'object' && ('nombre' in valor || 'diagnosticoOtro' in valor)) {
        if (valor.diagnosticoOtro) return valor.diagnosticoOtro;
        if (valor.nombre) return valor.nombre;
        return 'N/A';
      }

      // Resto del código anterior
      if (valor === null || valor === undefined) return 'N/A';
      if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
      if (Array.isArray(valor)) return valor.map(v => v.nombre || v).join(', ');
      if (typeof valor === 'object') return valor.nombre || valor.nivel || JSON.stringify(valor);
      return valor.toString();
    };

    return (
      <div className="row g-2">
        {Object.entries(cambios).map(([campo, cambio]) => (
          <div key={campo} className="col-md-6">
            <div
              className="card border-warning"
            >
              <div className="card-body py-2 px-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold me-2">
                    {traducirCampo(campo)}
                  </span>
                  <div>
                    <span className="text-muted me-2">
                      {formatearValor(cambio.original)}
                    </span>
                    <span className="text-primary">
                      <i className="fas fa-arrow-right me-2"></i>
                      {formatearValor(cambio.reevaluacion)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (fichaClinica) {
      // 1. Comparar la ficha original con la primera reevaluación
      if (reevaluaciones.length > 0) {
        const primeraReevaluacion = reevaluaciones[reevaluaciones.length - 1];
        const cambiosConOriginal = compararDatos(fichaClinica, primeraReevaluacion);
        setCambiosDetectados(prev => ({
          ...prev,
          [primeraReevaluacion.id]: {
            tipo: 'original',
            cambios: cambiosConOriginal
          }
        }));
      }

      // 2. Comparar cada reevaluación con la anterior
      for (let i = 0; i < reevaluaciones.length - 1; i++) {
        const reevaluacionActual = reevaluaciones[i];
        const reevaluacionAnterior = reevaluaciones[i + 1];
        const cambiosEntreReevaluaciones = compararDatos(reevaluacionAnterior, reevaluacionActual);

        setCambiosDetectados(prev => ({
          ...prev,
          [reevaluacionActual.id]: {
            tipo: 'reevaluacion',
            cambios: cambiosEntreReevaluaciones
          }
        }));
      }
    }
  }, [reevaluaciones, fichaClinica]);

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

  if (!user) {
    return <div>Verificando...</div>;
  }

  const handleFiltrar = () => {
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser mayor que la fecha fin');
      return;
    }

    setFiltrosAplicados(true);
    fetchReevaluaciones(1, fechaInicio, fechaFin);
  };

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina > 0 && numeroPagina <= totalPaginas) {
      fetchReevaluaciones(numeroPagina, fechaInicio, fechaFin);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <Container fluid className="mt-4">
      <Button
        onClick={handleVolver}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          color: 'black'
        }}
      >
        <i className="fas fa-arrow-left me-8 pr-1"></i>Volver
      </Button>

      {tipo === 'infantil' ? (
        <ModalEditarFichaInfantil
          show={mostrarModalEdicion}
          onHide={() => setMostrarModalEdicion(false)}
          fichaClinica={fichaClinica}
          onActualizar={handleActualizarFicha}
        />
      ) : tipo === 'adulto' ? (
        <ModalEditarFichaAdulto
          show={mostrarModalEdicion}
          onHide={() => setMostrarModalEdicion(false)}
          fichaClinica={fichaClinica}
          onActualizar={handleActualizarFicha}
        />
      ) : null}

      <h2 className="text-center mb-1 pb-2" style={{ 'color': 'var(--color-accent)', 'fontWeight': 'bold' }}>
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
            <div className="card-header custom-card text-light">
              <i className="fas fa-user-circle me-2"></i>Información del Paciente
            </div>
            <div className="card-body">
              {fichaClinica && esEditable && (
                <Button
                  variant="primary"
                  onClick={() => setMostrarModalEdicion(true)}
                  className="mb-3 custom-card text-light"
                >
                  <i className="fas fa-edit me-2"></i>Editar Ficha
                </Button>
              )}
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
              fichaClinica={fichaClinica}
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
            <div className="card-header custom-card text-light">
              <i className="fas fa-refresh me-2"></i>Reevaluación del Paciente
            </div>
            <div className="card-body">
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
                  Nueva Reevaluación
                </button>
              </div>

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
                  {filtrosAplicados && (
                    <button className="btn btn-secondary" onClick={limpiarFiltros}>
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>

              {reevaluaciones && reevaluaciones.length > 0 ? (
                <div>
                  <h5 className="border-bottom pb-2">Reevaluaciones Previas</h5>
                  {reevaluaciones.map((reevaluacion, index) => {
                    // Calcular el número total de reevaluaciones
                    const numeroReevaluacion = (totalRegistros - (paginaActual - 1) * reevaluacionesPorPagina) - index;

                    return (
                      <div key={reevaluacion.id} className="card mb-3">
                        <div
                          className="card-header d-flex justify-content-between align-items-center custom-card text-light"
                          onClick={() => setExpandido(index === expandido ? null : index)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="me-auto">
                            <strong>Reevaluación {numeroReevaluacion}</strong>
                          </div>
                          <div className="d-flex align-items-center">
                            <span>{new Date(reevaluacion.fecha).toLocaleDateString()}</span>
                            <i className={`fas fa-chevron-${expandido === index ? 'up' : 'down'} ms-2`}></i>
                          </div>
                        </div>

                        {expandido === index && (
                          <>
                            {cambiosDetectados[reevaluacion.id] ? (
                              <div className="card-body border-bottom" style={{
                                backgroundColor: '#e3f0fb',
                                borderWidth: '2px'
                              }}>
                                <div
                                  className="d-flex justify-content-between align-items-center"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setCambiosExpandidos(!cambiosExpandidos)}
                                >
                                  <h6 className="text-muted mb-0">
                                    Cambios Detectados
                                    {cambiosDetectados[reevaluacion.id].tipo === 'original'
                                      ? ' (respecto a ficha original)'
                                      : ' (respecto a reevaluación anterior)'}
                                  </h6>
                                  <i className={`fas fa-chevron-${cambiosExpandidos ? 'up' : 'down'}`}></i>
                                </div>

                                {cambiosExpandidos && (
                                  <div className="mt-3">
                                    {renderCambiosDetectados(cambiosDetectados[reevaluacion.id].cambios)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="card-body border-bottom" style={{
                                backgroundColor: '#f8d7da',
                                borderWidth: '2px',
                                color: '#721c24'
                              }}>
                                <h6 className="text-muted mb-0">No hay cambios detectados.</h6>
                              </div>
                            )}
                            {tipo === 'adulto' ? (
                              <div className="card-body">
                                {fichaClinica && (
                                  (user.estudiante_id ?
                                    (reevaluacion.estudiante?.id === user.estudiante_id) :
                                    (user.rol_id === 1 || user.rol_id === 2) ||
                                    (reevaluacion.usuario?.id === user.id)
                                  ) && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        navigate('?component=reevaluacion', {
                                          state: {
                                            fichaId: fichaClinica.id,
                                            tipo: tipo,
                                            reevaluacionId: reevaluacion.id,
                                            modoEdicion: true
                                          }
                                        });
                                      }}
                                    >
                                      <i className="fas fa-edit me-2"></i>Editar
                                    </button>
                                  )
                                )}
                                <div className="row">
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2">Información Personal</h6>
                                    <p><strong>Rut:</strong> {reevaluacion.paciente?.rut || 'N/A'}</p>
                                    <p><strong>Edad:</strong> {reevaluacion.paciente?.edad || 'N/A'}</p>
                                    <p><strong>Teléfono Principal:</strong> {reevaluacion.paciente?.telefonoPrincipal || 'N/A'}</p>
                                    <p>
                                      <strong>Diagnóstico:</strong> {
                                        reevaluacion.diagnosticos && reevaluacion.diagnosticos.length > 0
                                          ? reevaluacion.diagnosticos.map((diag, index) => (
                                            <span key={index}>
                                              {diag.esOtro ? diag.diagnosticoOtro : diag.nombre}
                                              {index < reevaluacion.diagnosticos.length - 1 ? ', ' : ''}
                                            </span>
                                          ))
                                          : 'N/A'
                                      }
                                    </p>
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
                                    <p><strong>Ciclo Vital Familiar:</strong> {reevaluacion.ciclosVitalesFamiliares && reevaluacion.ciclosVitalesFamiliares.length > 0
                                      ? reevaluacion.ciclosVitalesFamiliares[0].ciclo
                                      : 'N/A'}
                                    </p>
                                    <p><strong>Tipos de Familia:</strong></p>
                                    <ul>
                                      {reevaluacion.tiposFamilia && reevaluacion.tiposFamilia.length > 0 ? (
                                        reevaluacion.tiposFamilia.map((tipo, idx) => (
                                          <li key={idx}>{tipo.nombre || tipo.tipoFamiliaOtro}</li>
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
                              </div>
                            ) : (
                              // Contenido para reevaluación infantil
                              <>
                                <div className="row m-1  mt-3">
                                  <div className="col-md-6">
                                    {fichaClinica && (
                                      (user.estudiante_id ?
                                        (reevaluacion.estudiante?.id === user.estudiante_id) :
                                        (user.rol_id === 1 || user.rol_id === 2) ||
                                        (reevaluacion.usuario?.id === user.id)
                                      ) && (
                                        <button
                                          className="btn btn-primary"
                                          onClick={() => {
                                            navigate('?component=reevaluacion', {
                                              state: {
                                                fichaId: fichaClinica.id,
                                                tipo: tipo,
                                                reevaluacionId: reevaluacion.id,
                                                modoEdicion: true
                                              }
                                            });
                                          }}
                                        >
                                          <i className="fas fa-edit me-2"></i>Editar
                                        </button>
                                      )
                                    )}
                                    <h6 className="border-bottom pb-2">Evaluación Psicomotora</h6>
                                    <p><strong>Puntaje DPM:</strong> {reevaluacion.evaluacionPsicomotora?.puntajeDPM || 'N/A'}</p>
                                    <p><strong>Diagnóstico DSM:</strong> {reevaluacion.evaluacionPsicomotora?.diagnosticoDSM || 'N/A'}</p>
                                  </div>
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2 mt-4" style={{ 'paddingTop': '12px' }}>Información Familiar</h6>
                                    <p><strong>Con quién vive:</strong> {reevaluacion.informacionFamiliar?.conQuienVive || 'N/A'}</p>
                                    <p><strong>Localidad:</strong> {reevaluacion.informacionFamiliar?.localidad || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="row m-1">
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2">Tipos de Familia</h6>
                                    {reevaluacion.informacionFamiliar?.tiposFamilia && reevaluacion.informacionFamiliar.tiposFamilia.length > 0 ? (
                                      reevaluacion.informacionFamiliar.tiposFamilia.map((tipo, idx) => (
                                        <p key={idx}>{tipo.nombre || tipo.tipoFamiliaOtro}</p>
                                      ))
                                    ) : (
                                      <p>No hay tipos de familia registrados</p>
                                    )}
                                  </div>
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2">Ciclo Vital Familiar</h6>
                                    <p>{reevaluacion.informacionFamiliar?.cicloVitalFamiliar?.ciclo || 'No especificado'}</p>
                                  </div>
                                </div>
                                <div className="row m-1">
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2">Factores de Riesgo del Niño</h6>
                                    <ul>
                                      {reevaluacion.factoresRiesgo?.nino?.length > 0 ? (
                                        reevaluacion.factoresRiesgo.nino.map((factor, idx) => (
                                          <li key={idx}>{factor.nombre}</li>
                                        ))
                                      ) : (
                                        <li>No hay factores de riesgo registrados</li>
                                      )}
                                    </ul>
                                  </div>
                                  <div className="col-md-6">
                                    <h6 className="border-bottom pb-2">Factores de Riesgo Familiares</h6>
                                    <ul>
                                      {reevaluacion.factoresRiesgo?.familiares?.length > 0 ? (
                                        reevaluacion.factoresRiesgo.familiares.map((factor, idx) => (
                                          <li key={idx}>
                                            {factor.nombre} {factor.otras ? `(${factor.otras})` : ''}
                                          </li>
                                        ))
                                      ) : (
                                        <li>No hay factores de riesgo familiares registrados</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="row m-1">
                              <div className="col-md-6">
                                <h6 className="border-bottom pb-2">
                                  {reevaluacion.estudiante && reevaluacion.estudiante.nombres ? 'Estudiante' : 'Responsable'}
                                </h6>
                                <p>
                                  <strong>Nombre:</strong> {
                                    reevaluacion.estudiante && reevaluacion.estudiante.nombres
                                      ? `${reevaluacion.estudiante.nombres} ${reevaluacion.estudiante.apellidos}`
                                      : reevaluacion.usuario && reevaluacion.usuario.nombres
                                        ? `${reevaluacion.usuario.nombres} ${reevaluacion.usuario.apellidos}`
                                        : 'N/A'
                                  }
                                </p>
                                {(reevaluacion.estudiante || reevaluacion.usuario) && (
                                  <p>
                                    <strong>Correo:</strong> {
                                      reevaluacion.estudiante && reevaluacion.estudiante.correo
                                        ? reevaluacion.estudiante.correo
                                        : reevaluacion.usuario && reevaluacion.usuario.correo
                                          ? reevaluacion.usuario.correo
                                          : 'N/A'
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="col-md-6">
                                <h6 className="border-bottom pb-2">Institución</h6>
                                <p><strong>Nombre:</strong> {reevaluacion.institucion?.nombre || 'N/A'}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

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
                  {filtrosAplicados ? 'No se encontraron reevaluaciones con los filtros aplicados.' : 'No se han realizado reevaluaciones previas.'}
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