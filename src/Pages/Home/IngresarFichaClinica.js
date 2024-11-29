import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FichaClinicaInfantil from './FichaClinicaInfantil';
import FichaClinicaAdulto from './FichaClinicaAdulto';
import { useAuth } from '../../contexts/AuthContext';

const IngresarFichaClinica = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getToken } = useAuth();
  
  const isFromAgenda = location.state?.component === 'ingresar-ficha-clinica' && location.state?.institucionId;
  const institucionId = isFromAgenda ? location.state.institucionId : '';

  const [tipoFicha, setTipoFicha] = useState('');
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [tipoInstitucionSeleccionado, setTipoInstitucionSeleccionado] = useState('');
  const [instituciones, setInstituciones] = useState([]);
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState(institucionId);

  // Mapeo de tipos de ficha para mostrar
  const tipoFichaTexto = {
    'infantil': 'Infantil',
    'adulto': 'Adulto'
  };

  useEffect(() => {
    // Si el rol es de estudiante (rol_id === 3), determinar semestre
    if (user?.rol_id === 3) {
      const determinarSemestre = () => {
        const mesActual = new Date().getMonth() + 1;
        if (mesActual >= 3 && mesActual <= 7) {
          setTipoFicha('infantil');
        } else if (mesActual >= 8 && mesActual <= 12) {
          setTipoFicha('adulto');
        }
      };
      determinarSemestre();
    }
  }, [user]);

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
    if (user?.rol_id !== 3 && institucionSeleccionada) {
      const institucioSelec = instituciones.find(inst => inst.id === institucionSeleccionada);
      if (institucioSelec) {
        // Si el tipo de institución es JARDIN, ficha infantil, sino adulto
        setTipoFicha(
          institucioSelec.tipo.toUpperCase() === 'JARDIN' ? 'infantil' : 'adulto'
        );
      }
    }
  }, [institucionSeleccionada, instituciones, user]);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleIngresar = (data) => {
    console.log('Ficha ingresada:', data);
  };

  // Determinar si se puede seleccionar manualmente el tipo de ficha
  const puedeSeleccionarTipoFicha = user?.rol_id !== 3;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4" style={{ color: '#388DE2' }}>Ficha Clínica</h2>

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
                // Resetear el tipo de ficha cuando cambie el tipo de institución
                if (user?.rol_id === 3) {
                  setTipoFicha('');
                }
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
      
      {puedeSeleccionarTipoFicha ? (
        <div className="form-group mb-3">
          <label>Tipo de Ficha</label>
          <select 
            className="form-control" 
            value={tipoFicha} 
            onChange={(e) => setTipoFicha(e.target.value)}
            disabled={!institucionSeleccionada}
          >
            <option value="">Seleccione...</option>
            <option value="adulto">Adulto</option>
            <option value="infantil">Infantil</option>
          </select>
        </div>
      ) : (
        <div className="form-group mb-3">
          <label>Tipo de Ficha</label>
          <input 
            type="text" 
            className="form-control" 
            value={tipoFichaTexto[tipoFicha] || ''} 
            readOnly 
          />
        </div>
      )}

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