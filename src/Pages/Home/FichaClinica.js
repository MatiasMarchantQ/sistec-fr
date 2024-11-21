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

const FichaClinicaAdulto = ({ fichaClinica, onDiagnosticoChange, editable }) => {
  const { getToken } = useAuth();
  const [diagnostico, setDiagnostico] = useState(fichaClinica.diagnostico || '');
  const [valorHbA1c, setValorHbA1c] = useState(fichaClinica.factoresRiesgo?.valorHbac1 || '');
  const [isEditingDiagnostico, setIsEditingDiagnostico] = useState(false);
  const [isEditingHbA1c, setIsEditingHbA1c] = useState(false);
  const [originalDiagnostico, setOriginalDiagnostico] = useState(diagnostico);
  const [originalHbA1c, setOriginalHbA1c] = useState(valorHbA1c);

  const handleDiagnosticoChange = (e) => {
    setDiagnostico(e.target.value);
  };

  const handleSaveDiagnostico = () => {
    if (onDiagnosticoChange) {
      onDiagnosticoChange(diagnostico);
    }
    setIsEditingDiagnostico(false);
  };

  const handleHbA1cChange = (e) => {
    setValorHbA1c(e.target.value);
  };

  const handleCancelDiagnostico = () => {
    setDiagnostico(originalDiagnostico); // Restablece al valor original
    setIsEditingDiagnostico(false);
  };

  const handleCancelHbA1c = () => {
    setValorHbA1c(originalHbA1c); // Restablece al valor original
    setIsEditingHbA1c(false);
  };

  const handleSaveHbA1c = async () => {
    try {
      const token = getToken();
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaClinica.id}`,
        { factoresRiesgo: { valorHbac1: valorHbA1c } },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar el estado local
      setValorHbA1c(valorHbA1c);
      setIsEditingHbA1c(false);
    } catch (error) {
      console.error('Error actualizando valor HbA1c:', error);
      // Manejar el error (mostrar mensaje, etc.)
    }
  };

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
              <p>
                <strong>Diagnóstico:</strong> 
                {editable && isEditingDiagnostico ? (
                  <div className="d-flex align-items-center">
                    <input 
                      type="text" 
                      className="form-control form-control-sm me-2" 
                      value={diagnostico}
                      onChange={handleDiagnosticoChange}
                    />
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={handleSaveDiagnostico}
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button 
                        className="btn btn-sm btn-danger ms-2 me-2" 
                        onClick={handleCancelDiagnostico}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                  </div>
                ) : (
                  <span className="ms-2">
                    {diagnostico}
                    {editable && (
                      <button 
                        className="btn btn-sm btn-link" 
                        onClick={() => setIsEditingDiagnostico(true)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                  </span>
                )}
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
          <p>
                <strong>Valor HbA1c:</strong> 
                {editable && isEditingHbA1c ? (
                  <div className="d-flex align-items-center">
                    <input 
                      type="text" 
                      className="form-control form-control-sm me-2" 
                      value={valorHbA1c}
                      onChange={handleHbA1cChange}
                    />
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={handleSaveHbA1c}
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger ms-2" 
                      onClick={handleCancelHbA1c}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <span className="ms-2">
                    {valorHbA1c || 'N/A'}%
                    {editable && (
                      <button 
                        className="btn btn-sm btn-link" 
                        onClick={() => setIsEditingHbA1c(true)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                  </span>
                )}
              </p>
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
  const [puntajeDPM, setPuntajeDPM] = useState(fichaClinica.evaluacionPsicomotora?.puntajeDPM || '');
  const [diagnosticoDSM, setDiagnosticoDSM] = useState(fichaClinica.evaluacionPsicomotora?.diagnosticoDSM || '');

  const [isEditingPuntajeDPM, setIsEditingPuntajeDPM] = useState(false);
  const [isEditingDiagnosticoDSM, setIsEditingDiagnosticoDSM] = useState(false);

const handleSavePuntajeDPM = () => {
    // Aquí puedes agregar la lógica para guardar el puntaje DPM
    setIsEditingPuntajeDPM(false);
  };

  const handleCancelPuntajeDPM = () => {
    setPuntajeDPM(fichaClinica.evaluacionPsicomotora?.puntajeDPM || '');
    setIsEditingPuntajeDPM(false);
  };

  const handleSaveDiagnosticoDSM = () => {
    // Aquí puedes agregar la lógica para guardar el diagnóstico DSM
    setIsEditingDiagnosticoDSM(false);
  };

  const handleCancelDiagnosticoDSM = () => {
    setDiagnosticoDSM(fichaClinica.evaluacionPsicomotora?.diagnosticoDSM || '');
    setIsEditingDiagnosticoDSM(false);
  };

  const handlePuntajeDPMChange = (e) => {
    const selectedValue = e.target.value;
    setPuntajeDPM(selectedValue);

    // Actualizar el diagnóstico DSM basado en la selección
    switch(selectedValue) {
      case "Menor a 30":
        setDiagnosticoDSM("Retraso");
        break;
      case "Entre 30 y 40":
        setDiagnosticoDSM("Riesgo");
        break;
      case "Mayor a 40":
        setDiagnosticoDSM("Normal");
        break;
      default:
        setDiagnosticoDSM("");
    }
  };

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
            <p>
              <strong>Puntaje DPM:</strong> 
              {isEditingPuntajeDPM ? (
                <div className="d-flex align-items-center">
                  <select 
                    className="form-control" 
                    value={puntajeDPM} 
                    onChange={handlePuntajeDPMChange}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Menor a 30">Menor a 30</option>
                    <option value="Entre 30 y 40">Entre 30 y 40</option>
                    <option value="Mayor a 40">Mayor a 40</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={handleSavePuntajeDPM}
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-danger ms-2" 
                    onClick={handleCancelPuntajeDPM}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <span className="ms-2">
                  {puntajeDPM || 'N/A'}
                  <button 
                    className="btn btn-sm btn-link" 
                    onClick={() => setIsEditingPuntajeDPM(true)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </span>
              )}
            </p>
            <p>
                <div className="form-group">
                  <label>Diagnóstico DSM</label>
                  <input
                    type="text"
                    className="form-control"
                    value={diagnosticoDSM}
                    readOnly
                    placeholder={puntajeDPM ? diagnosticoDSM : "Seleccione Puntaje DPM o TEPSI"}
                  />
              </div>
            </p> 
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

  const handleDiagnosticoChange = async (nuevoDiagnostico) => {
    try {
      const token = getToken();
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaId}`,
        { diagnostico: nuevoDiagnostico },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar el estado local
      setFichaClinica(prev => ({
        ...prev,
        diagnostico: nuevoDiagnostico
      }));
    } catch (error) {
      console.error('Error actualizando diagnóstico:', error);
      // Manejar el error (mostrar mensaje, etc.)
    }
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
      {tipo === 'adulto' ? (
        <FichaClinicaAdulto 
          fichaClinica={fichaClinica} onDiagnosticoChange={handleDiagnosticoChange} 
          editable={true} 
        />
      ) : (
        <FichaClinicaInfantil fichaClinica={fichaClinica} />
      )}
    </div>
  </div>
</Tab>
      </Tabs>
    </Container>
  );
};

export default FichaClinica;