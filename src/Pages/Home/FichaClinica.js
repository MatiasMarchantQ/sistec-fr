import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FichaClinica.css';

const FichaClinicaAdulto = ({ fichaClinica }) => {
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
              <p><strong>Dirección:</strong> {fichaClinica.direccion}</p>
              <p><strong>Conectividad:</strong> {fichaClinica.conectividad}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <h5 className="border-bottom pb-2">Información Médica</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Diagnóstico:</strong> {fichaClinica.diagnostico}</p>
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
            <li><strong>Valor HbA1c:</strong> {fichaClinica.factoresRiesgo?.valorHbac1 || 'N/A'}</li>
            <li><strong>Alcohol/Drogas:</strong> {fichaClinica.factoresRiesgo?.alcoholDrogas ? 'Sí' : 'No'}</li>
            <li><strong>Tabaquismo:</strong> {fichaClinica.factoresRiesgo?.tabaquismo ? 'Sí' : 'No'}</li>
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="border-bottom pb-2">Ciclos Vitales Familiares</h5>
          <ul className="list-unstyled">
            {fichaClinica.ciclosVitalesFamiliares && fichaClinica.ciclosVitalesFamiliares.length > 0 ? (
              fichaClinica.ciclosVitalesFamiliares.map((ciclo, index) => (
                <li key={index}>{ciclo.ciclo}</li>
              ))
            ) : (
              <li>No hay ciclos vitales registrados</li>
            )}
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="border-bottom pb-2">Tipos de Familia</h5>
          <ul className="list-unstyled">
            {fichaClinica.tiposFamilia && fichaClinica.tiposFamilia.length > 0 ? (
              fichaClinica.tiposFamilia.map((tipo, index) => (
                <li key={index}>{tipo.nombre}</li>
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
            {fichaClinica.estudiante_id && (
              <p className="mb-0"><strong>ID Estudiante:</strong> {fichaClinica.estudiante_id}</p>
            )}
            {fichaClinica.usuario_id && (
              <p className="mb-0"><strong>ID Usuario:</strong> {fichaClinica.usuario_id}</p>
            )}
            <p className="mb-0"><strong>ID Institución:</strong> {fichaClinica.institucion_id}</p>
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
              <p><strong>Puntaje DPM:</strong> {fichaClinica.evaluacionPsicomotora?.puntajeDPM || 'N/A'}</p>
              <p><strong>Diagnóstico DSM:</strong> {fichaClinica.evaluacionPsicomotora?.diagnosticoDSM || 'N/A'}</p>
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
          <p>{fichaClinica.informacionFamiliar?.tipoFamilia?.nombre || 'No especificado'}</p>
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
                <li key={index}>{factor.nombre}</li>
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
                <li key={index}>{factor.nombre} {factor.otras ? `(${factor.otras})` : ''}</li>
              ))
            ) : (
              <li>No hay factores de riesgo familiares registrados</li>
            )}
          </ul>
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
    diagnostico: fichaClinica.diagnostico || 'N/A',
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
      tabaquismo: fichaClinica.factoresRiesgo?.tabaquismo || false
    },
    ciclosVitalesFamiliares: (fichaClinica.ciclosVitalesFamiliares || []).map(c => ({
      id: c.id || null,
      ciclo: c.ciclo || 'N/A'
    })),
    tiposFamilia: (fichaClinica.tiposFamilia || []).map(t => ({
      id: t.id || null,
      nombre: t.nombre || 'N/A'
    })),
    estudiante_id: fichaClinica.estudiante_id || null,
    usuario_id: fichaClinica.usuario_id || null,
    institucion_id: fichaClinica.institucion_id || null,
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
      tipoFamilia: {
        id: fichaClinica.informacionFamiliar?.tipoFamilia?.id || null,
        nombre: fichaClinica.informacionFamiliar?.tipoFamilia?.nombre || 'No especificado'
      },
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
    estudiante_id: fichaClinica.estudiante_id || null,
    usuario_id: fichaClinica.usuario_id || null,
    institucion_id: fichaClinica.institucion_id || null,
    createdAt: fichaClinica.createdAt || null,
    updatedAt: fichaClinica.updatedAt || null
  };
};

const FichaClinica = () => {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const { fichaId, tipo } = location.state || {};
  const [fichaClinica, setFichaClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  
        // Usa response.data.data en lugar de response.data
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
  
    if (fichaId && tipo) {
      fetchFichaClinica();
    } else {
      setLoading(false);
      setError('No se proporcionó un ID de ficha clínica válido o un tipo');
    }
  }, [fichaId, tipo, getToken]);

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      {fichaClinica ? (
        <>
          <h2 className="mb-4 text-center">
          Ficha Clínica - {fichaClinica.paciente?.nombres} {fichaClinica.paciente?.apellidos}
          </h2>
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
        </>
      ) : (
        <div className="alert alert-warning">No se encontró la ficha clínica.</div>
      )}
    </div>
  );
};

export default FichaClinica;