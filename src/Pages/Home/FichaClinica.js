import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FichaClinica.css';

const FichaClinica = () => {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const { fichaId } = location.state || {};
  const { institucionId } = location.state || {};

  const [fichaClinica, setFichaClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFichaClinica = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setFichaClinica(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener la ficha clínica:', err);
        setError('Error al cargar los datos de la ficha clínica');
        setLoading(false);
      }
    };

    if (fichaId) {
      fetchFichaClinica();
    } else {
      setLoading(false);
      setError('No se proporcionó un ID de ficha clínica válido');
    }
  }, [fichaId, getToken]);

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // ... resto del código igual ...

return (
  <div className="container mt-4">
    {fichaClinica ? (
      <>
        <h2 className="mb-4 text-center">
          Ficha Clínica - {fichaClinica.paciente.nombres} {fichaClinica.paciente.apellidos}
        </h2> 
        <div className="card mb-4">
          <div className="card-header text-white bg-primary">
            <i className="fas fa-user-circle me-2"></i>Información del Paciente
          </div>
          <div className="card-body">
            {/* Información Personal */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h5 className="border-bottom pb-2">Datos Personales</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>ID:</strong> {fichaClinica.id}</p>
                    <p><strong>RUT:</strong> {fichaClinica.paciente.rut}</p>
                    <p><strong>Nombres:</strong> {fichaClinica.paciente.nombres}</p>
                    <p><strong>Apellidos:</strong> {fichaClinica.paciente.apellidos}</p>
                    <p><strong>Edad:</strong> {fichaClinica.paciente.edad}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Teléfono 1:</strong> {fichaClinica.paciente.telefonoPrincipal}</p>
                    <p><strong>Teléfono 2:</strong> {fichaClinica.paciente.telefonoSecundario}</p>
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
                    <p><strong>Escolaridad:</strong> {fichaClinica.escolaridad.nivel}</p>
                    <p><strong>Ocupación:</strong> {fichaClinica.ocupacion}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Con quién vive:</strong> {fichaClinica.conQuienVive}</p>
                    <p><strong>Horario Llamada:</strong> {fichaClinica.horarioLlamada}</p>
                    <p><strong>Fecha Evaluación:</strong> {new Date(fichaClinica.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Factores de Riesgo y Familia */}
            <div className="row">
              <div className="col-md-4">
                <h5 className="border-bottom pb-2">Factores de Riesgo</h5>
                <ul className="list-unstyled">
                  <li><strong>Valor HbA1c:</strong> {fichaClinica.factoresRiesgo.valorHbac1}</li>
                  <li><strong>Alcohol/Drogas:</strong> {fichaClinica.factoresRiesgo.alcoholDrogas ? 'Sí' : 'No'}</li>
                  <li><strong>Tabaquismo:</strong> {fichaClinica.factoresRiesgo.tabaquismo ? 'Sí' : 'No'}</li>
                </ul>
              </div>

              <div className="col-md-4">
                <h5 className="border-bottom pb-2">Ciclos Vitales Familiares</h5>
                <ul className="list-unstyled">
                  {fichaClinica.ciclosVitalesFamiliares.map((ciclo, index) => (
                    <li key={index}>{ciclo.ciclo}</li>
                  ))}
                </ul>
              </div>

              <div className="col-md-4">
                <h5 className="border-bottom pb-2">Tipos de Familia</h5>
                <ul className="list-unstyled">
                  {fichaClinica.tiposFamilia.map((tipo, index) => (
                    <li key={index}>{tipo.nombre}</li>
                  ))}
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