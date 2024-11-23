import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import FichaClinicaAdulto from './FichaClinicaAdulto';
import FichaClinicaInfantil from './FichaClinicaInfantil';

const Reevaluacion = () => {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fichaOriginal, setFichaOriginal] = useState(null);
  const [datosIniciales, setDatosIniciales] = useState(null);
  const [tipoFicha, setTipoFicha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { fichaId, tipo, paciente } = location.state || {};
    console.log('Datos recibidos en Reevaluación:', {
      fichaId, 
      tipo, 
      paciente
    });
    
    if (!fichaId || !tipo) {
      toast.error('No se proporcionó un ID de ficha válido');
      navigate(-1);
      return;
    }
  
    const fetchFichaOriginal = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaId}?tipo=${tipo}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
    
        // Añade un log para ver la estructura completa de los datos
        console.log('Datos de la ficha original:', response.data);
    
        // Verificación más detallada
        if (!response.data.data) {
          throw new Error("No se encontraron datos de la ficha");
        }
    
        // Intenta obtener institucion_id de diferentes formas
        const institucionId = 
          response.data.data.institucion?.id || // Accede al ID de la institución
          response.data.data.institucionId || 
          (response.data.data.paciente && response.data.data.paciente.institucion_id) ||
          user.institucion_id; // Fallback al ID de institución del usuario actual
    
        if (!institucionId) {
          throw new Error("No se pudo encontrar un institucion_id válido");
        }
    
        setFichaOriginal({
          ...response.data.data,
          institucion_id: institucionId
        });
        setTipoFicha(tipo);
    
        // Preparar datos iniciales basados en el tipo de ficha
        const prepararDatosIniciales = () => {
          if (tipo === 'adulto') {
            return {
              // Datos personales básicos
              nombres: response.data.data.paciente?.nombres || '',
              apellidos: response.data.data.paciente?.apellidos || '',
              rut: response.data.data.paciente?.rut || '',
              edad: response.data.data.paciente?.edad || '',
              telefonoPrincipal: response.data.data.paciente?.telefonoPrincipal || '',
              telefonoSecundario: response.data.data.paciente?.telefonoSecundario || '',
        
              // Información adicional
              diagnostico: response.data.data.diagnostico?.id || '',
              escolaridad: response.data.data.escolaridad?.id || '',
              ocupacion: response.data.data.ocupacion || '',
              direccion: response.data.data.direccion || '',
              
              // Factores de riesgo
              valorHbac1: response.data.data.factoresRiesgo?.valorHbac1 || '',
              alcoholDrogas: response.data.data.factoresRiesgo?.alcoholDrogas || false,
              tabaquismo: response.data.data.factoresRiesgo?.tabaquismo || false,
              otrosFactoresRiesgo: response.data.data.factoresRiesgo?.otros || '',
        
              // Contexto familiar
              conQuienVive: response.data.data.conQuienVive || '',
              horarioLlamada: response.data.data.horarioLlamada || '',
              conectividad: response.data.data.conectividad || '',
              cicloVitalFamiliar: response.data.data.cicloVitalFamiliar?.id || '',
              tiposFamilia: response.data.data.tiposFamilia?.map(tipo => tipo.id) || [],
            };
          } else if (tipo === 'infantil') {
            return {
              // Datos personales del niño
              nombres: response.data.data.paciente?.nombres || '',
              apellidos: response.data.data.paciente?.apellidos || '',
              rut: response.data.data.paciente?.rut || '',
              telefonoPrincipal: response.data.data.paciente?.telefonoPrincipal || '',
              telefonoSecundario: response.data.data.paciente?.telefonoSecundario || '',
              fechaNacimiento: response.data.data.fechaNacimiento || '',
        
              // Evaluación psicomotora
              evaluacionPsicomotora: {
                puntajeDPM: response.data.data.evaluacionPsicomotora?.puntajeDPM || '',
                diagnosticoDSM: response.data.data.evaluacionPsicomotora?.diagnosticoDSM || ''
              },
        
              // Información familiar
              informacionFamiliar: {
                conQuienVive: response.data.data.informacionFamiliar?.conQuienVive || '',
                localidad: response.data.data.informacionFamiliar?.localidad || '',
                tiposFamilia: response.data.data.informacionFamiliar?.tiposFamilia || [],
                cicloVitalFamiliar: response.data.data.informacionFamiliar?.cicloVitalFamiliar || null,
                padres: response.data.data.informacionFamiliar?.padres || []
              },
        
              // Factores de riesgo
              factoresRiesgo: {
                nino: response.data.data.factoresRiesgo?.nino || [],
                familiares: response.data.data.factoresRiesgo?.familiares || []
              }
            };
          }
        };
        
        setDatosIniciales(prepararDatosIniciales());

        setLoading(false);
      } catch (err) {
        console.error('Error al obtener la ficha original:', err);
        toast.error('No se pudo cargar la ficha original: ' + err.message);
        setLoading(false);
        navigate(-1);
      }
    };
  
    fetchFichaOriginal();
  }, [location.state, getToken, navigate, user.institucion_id]);

  const handleReevaluacionExitosa = (nuevaFicha) => {
    toast.success('Reevaluación registrada exitosamente');
    navigate('?component=listado-fichas-clinicas', { 
      state: { 
        tipo: tipoFicha,
        nuevaFichaId: nuevaFicha.id 
      } 
    });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="container">
      <ToastContainer />
      <h2 className="text-center mb-4">
        Reevaluación - {tipoFicha === 'adulto' ? 'Adulto' : 'Infantil'}
      </h2>
  
      {tipoFicha === 'adulto' ? (
        <FichaClinicaAdulto
          key="reevaluacion-adulto"
          datosIniciales={datosIniciales}
          onVolver={() => navigate(-1)}
          onIngresar={handleReevaluacionExitosa}
          esReevaluacion={true}
        
          institucionId={fichaOriginal.institucion_id}
        />
      ) : (
        <FichaClinicaInfantil
          key="reevaluacion-infantil"
          datosIniciales={datosIniciales}
          onVolver={() => navigate(-1)}
          onIngresar={handleReevaluacionExitosa}
          esReevaluacion={true}
          
          institucionId={fichaOriginal.institucion_id}
        />
      )}
    </div>
  );
  };
  
  export default Reevaluacion;