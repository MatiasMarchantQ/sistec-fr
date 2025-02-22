import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import FichaClinicaInfantil from '../FC/FichaClinicaInfantil';
import FichaClinicaAdulto from '../FC/FichaClinicaAdulto';
import { useAuth } from '../../contexts/AuthContext';

const IngresarFichaClinica = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getToken } = useAuth();

  const isFromAgenda = location.state?.component === 'ingresar-ficha-clinica' && location.state?.institucionId;
  const institucionId = isFromAgenda ? location.state.institucionId : '';
  const tipoInstitucionFromAgenda = location.state?.tipoInstitucion;

  const [tipoFicha, setTipoFicha] = useState('');
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [tipoInstitucionSeleccionado, setTipoInstitucionSeleccionado] = useState('');
  const [instituciones, setInstituciones] = useState([]);
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState(institucionId);

  useEffect(() => {
    if (!isFromAgenda) {
      const obtenerTiposInstituciones = async () => {
        try {
          const token = getToken();
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-instituciones`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setTiposInstituciones(response.data);
        } catch (error) {
          console.error('Error al obtener tipos de instituciones:', error);
        }
      };
      obtenerTiposInstituciones();
    }
  }, [getToken, isFromAgenda]);

  useEffect(() => {
    if (!isFromAgenda && tipoInstitucionSeleccionado) {
      const obtenerInstituciones = async () => {
        try {
          const token = getToken();
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/instituciones`, {
            params: { tipoId: tipoInstitucionSeleccionado },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setInstituciones(response.data);
        } catch (error) {
          console.error('Error al obtener instituciones:', error);
        }
      };
      obtenerInstituciones();
    }
  }, [tipoInstitucionSeleccionado, getToken, isFromAgenda]);

  // Efecto para determinar tipo de ficha basado en tipo de institución
  useEffect(() => {
    if (isFromAgenda && tipoInstitucionFromAgenda) {
      // Si viene de agenda, establecer directamente el tipo de ficha basado en el tipoInstitucion
      const tipoFichaInicial = Number(tipoInstitucionFromAgenda) === 1 ? 'infantil' : 'adulto';
      setTipoFicha(tipoFichaInicial);
      setTipoInstitucionSeleccionado(tipoInstitucionFromAgenda.toString());
    }
  }, [isFromAgenda, tipoInstitucionFromAgenda]);

  // Y modificar el useEffect que maneja el cambio de tipo de institución
  useEffect(() => {
    if (tipoInstitucionSeleccionado) {
      // Para el caso de selección manual o cuando viene de agenda
      const tipoInstitucion = tiposInstituciones.find(tipo => tipo.id === Number(tipoInstitucionSeleccionado));

      if (tipoInstitucion) {
        if (tipoInstitucion.tipo.toUpperCase() === 'JARDÍN') {
          setTipoFicha('infantil');
        } else {
          setTipoFicha('adulto');
        }
      }
    }
  }, [tipoInstitucionSeleccionado, tiposInstituciones]);

  const handleVolver = () => {
    // Obtener el estado de navegación original
    const estadoNavegacion = location.state;

    if (estadoNavegacion) {
      if (estadoNavegacion.origen) {
        switch (estadoNavegacion.origen) {
          case 'listado-fichas':
            navigate('?component=listado-fichas-clinicas', {
              state: {
                ...estadoNavegacion,
                tipo: estadoNavegacion.tipo || tipoFicha || 'adulto'
              }
            });
            break;
          case 'agenda':
            navigate('?component=agenda', {
              state: {
                ...estadoNavegacion,
                tipo: estadoNavegacion.tipo || tipoFicha || 'adulto'
              }
            });
            break;
          case 'dashboard':
            navigate('/home?component=dashboard');
            break;
          default:
            navigate('?component=listado-fichas-clinicas', {
              state: {
                tipo: tipoFicha || 'adulto'
              }
            });
        }
      }
      // Si no hay origen pero hay un componente, intentar navegar basado en el componente
      else if (estadoNavegacion.component) {
        switch (estadoNavegacion.component) {
          case 'agenda':
            navigate('?component=agenda', {
              state: {
                ...estadoNavegacion,
                tipo: tipoFicha || 'adulto'
              }
            });
            break;
          case 'listado-fichas-clinicas':
            navigate('?component=listado-fichas-clinicas', {
              state: {
                ...estadoNavegacion,
                tipo: tipoFicha || 'adulto'
              }
            });
            break;
          default:
            navigate('?component=agenda', {
              state: {
                tipo: tipoFicha || 'adulto'
              }
            });
        }
      }
      // Si no hay origen ni componente específico
      else {
        navigate('?component=listado-fichas-clinicas', {
          state: {
            tipo: tipoFicha || 'adulto'
          }
        });
      }
    }
    else {
      navigate('?component=listado-fichas-clinicas', {
        state: {
          tipo: tipoFicha || 'adulto'
        }
      });
    }
  };

  const handleIngresar = (data) => {
    console.log('Ficha ingresada');
  };

  return (
    <div className="container mt-3 p-4">
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
      <h2 className="text-center font-weight-bold mb-4" style={{ color: 'var(--color-accent)' }}>Ingreso de Ficha Clínica</h2>

      {!isFromAgenda && (
        <>
          <div className="form-group mb-3">
            <label>Tipo de Institución</label>
            <select
              className="form-control"
              value={tipoInstitucionSeleccionado}
              onChange={(e) => {
                setTipoInstitucionSeleccionado(e.target.value);
                setInstitucionSeleccionada('');
              }}
            >
              <option value="">Seleccione un tipo de institución...</option>
              {tiposInstituciones.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label>Institución</label>
            <select
              className="form-control"
              value={institucionSeleccionada}
              onChange={(e) => {
                setInstitucionSeleccionada(e.target.value);
                // Resetear el tipo de ficha cuando cambie la institución
                if (user?.rol_id === 3) {
                  setTipoFicha('');
                }
              }}
              disabled={!tipoInstitucionSeleccionado}
            >
              <option value="">Seleccione una institución...</option>
              {instituciones.map(institucion => (
                <option key={institucion.id} value={institucion.id}>{institucion.nombre}</option>
              ))}
            </select>
          </div>
        </>
      )}


      <div className="form-group mb-3">
        <label>Tipo de Ficha</label>
        <select
          className="form-control"
          value={tipoFicha}
          disabled={true}
        >
          <option value="">Seleccione...</option>
          <option value="adulto">Adulto</option>
          <option value="infantil">Infantil</option>
        </select>
      </div>


      {tipoFicha === 'infantil' && (
        <FichaClinicaInfantil
          onVolver={handleVolver}
          onIngresar={handleIngresar}
          institucionId={institucionSeleccionada}
        />
      )}
      {tipoFicha === 'adulto' && (
        <FichaClinicaAdulto
          onVolver={handleVolver}
          onIngresar={handleIngresar}
          institucionId={institucionSeleccionada}
        />
      )}
    </div>
  );
};

export default IngresarFichaClinica;