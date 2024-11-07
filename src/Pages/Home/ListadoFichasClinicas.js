// src/components/fichas/ListadoFichasClinicas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListadoFichasClinicas = ({ institucionId }) => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchFichas = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/fichas-clinicas/institucion/${institucionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setFichas(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener fichas clínicas:', err);
        setError('Error al cargar las fichas clínicas');
        setLoading(false);
      }
    };

    if (institucionId) {
      fetchFichas();
    }
  }, [institucionId, getToken]);

  const handleVerFicha = (fichaId) => {
    navigate('/ficha-clinica-digital', {
      state: { fichaClinicaId: fichaId, institucionId }
    });
  };

  const fichasFiltradas = fichas.filter(ficha => 
    ficha.paciente?.nombres?.toLowerCase().includes(filtro.toLowerCase()) ||
    ficha.paciente?.apellidos?.toLowerCase().includes(filtro.toLowerCase()) ||
    ficha.paciente?.rut?.includes(filtro)
  );

  if (loading) return <div className="text-center">Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Fichas Clínicas</h2>

      <div className="card mb-4">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Listado de Fichas Clínicas</h5>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o RUT..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {fichasFiltradas.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Paciente</th>
                    <th>RUT</th>
                    <th>Fecha Evaluación</th>
                    <th>Diagnóstico</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fichasFiltradas.map((ficha) => (
                    <tr key={ficha.id}>
                      <td>{ficha.id}</td>
                      <td>{`${ficha.paciente?.nombres} ${ficha.paciente?.apellidos}`}</td>
                      <td>{ficha.paciente?.rut}</td>
                      <td>{new Date(ficha.fecha_evaluacion).toLocaleDateString()}</td>
                      <td>{ficha.diagnostico}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleVerFicha(ficha.id)}
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center">
              <p>No se encontraron fichas clínicas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListadoFichasClinicas;