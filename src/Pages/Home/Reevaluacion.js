import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import FichaClinicaAdulto from './FichaClinicaAdulto';
import FichaClinicaInfantil from './FichaClinicaInfantil';
import _ from 'lodash';

const Reevaluacion = () => {
  const { user, getToken, handleSessionExpired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fichaOriginal, setFichaOriginal] = useState(null);
  const [datosIniciales, setDatosIniciales] = useState(null);
  const [ultimaReevaluacion, setUltimaReevaluacion] = useState(null);
  const [tipoFicha, setTipoFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cambiosDetectados, setCambiosDetectados] = useState({});
  const [reevaluaciones, setReevaluaciones] = useState([]);
  const [reevaluacionSeleccionada, setReevaluacionSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleVolver = () => {
    navigate(-1);
  };

  const formatearFichaAdulto = (fichaClinica) => {
    return {
      nombres: fichaClinica.paciente?.nombres || fichaClinica.nombres || '',
      apellidos: fichaClinica.paciente?.apellidos || fichaClinica.apellidos || '',
      rut: fichaClinica.paciente?.rut || fichaClinica.rut || '',
      edad: fichaClinica.paciente?.edad || fichaClinica.edad || '',
      telefonoPrincipal: fichaClinica.paciente?.telefonoPrincipal || fichaClinica.telefonoPrincipal || '',
      telefonoSecundario: fichaClinica.paciente?.telefonoSecundario || fichaClinica.telefonoSecundario || '',

      // Manejar diagnósticos de manera más flexible
      diagnosticos: (fichaClinica.diagnosticos || []).map(diag => ({
        id: diag.id,
        nombre: diag.nombre,
        esOtro: diag.es_diagnostico_otro || diag.esOtro,
        diagnosticoOtro: diag.diagnostico_otro_texto || diag.diagnosticoOtro
      })),

      diagnosticos_id: (fichaClinica.diagnosticos || [])
        .filter(diag => diag.id !== null && !diag.es_diagnostico_otro)
        .map(diag => diag.id.toString()),

      diagnostico_otro: (fichaClinica.diagnosticos || [])
        .find(diag => diag.es_diagnostico_otro)?.nombre || '',

      escolaridad: fichaClinica.escolaridad?.id || fichaClinica.escolaridad || '',
      ocupacion: fichaClinica.ocupacion || '',
      direccion: fichaClinica.direccion || '',
      valorHbac1: fichaClinica.factoresRiesgo?.valorHbac1 || fichaClinica.valorHbac1 || '',
      alcoholDrogas: fichaClinica.factoresRiesgo?.alcoholDrogas || fichaClinica.alcoholDrogas || false,
      tabaquismo: fichaClinica.factoresRiesgo?.tabaquismo || fichaClinica.tabaquismo || false,
      otrosFactoresRiesgo: fichaClinica.factoresRiesgo?.otros || fichaClinica.otrosFactoresRiesgo || '',
      conQuienVive: fichaClinica.conQuienVive || '',
      horarioLlamada: fichaClinica.horarioLlamada || '',
      conectividad: fichaClinica.conectividad || '',
      cicloVitalFamiliar: fichaClinica.cicloVitalFamiliar?.id || fichaClinica.cicloVitalFamiliar || '',

      tiposFamilia: (fichaClinica.tiposFamilia || []).map(tipo =>
        typeof tipo === 'object' ? (tipo.id || tipo) : tipo
      )
    };
  };

  const formatearFichaInfantil = (fichaClinica) => {
    const edadPaciente = fichaClinica.paciente?.edad || fichaClinica.edad || '';
    return {
      nombres: fichaClinica.paciente?.nombres || fichaClinica.nombres || '',
      apellidos: fichaClinica.paciente?.apellidos || fichaClinica.apellidos || '',
      rut: fichaClinica.paciente?.rut || fichaClinica.rut || '',
      telefonoPrincipal: fichaClinica.paciente?.telefonoPrincipal || fichaClinica.telefonoPrincipal || '',
      telefonoSecundario: fichaClinica.paciente?.telefonoSecundario || fichaClinica.telefonoSecundario || '',
      fechaNacimiento: fichaClinica.paciente?.fechaNacimiento || fichaClinica.fechaNacimiento || '',

      // Parsear edad 
      ...parseEdad(
        fichaClinica.paciente?.edad ||
        fichaClinica.edad ||
        ''
      ),


      // Evaluación Psicomotora
      evaluacionPsicomotora: {
        puntajeDPM: fichaClinica.evaluacionPsicomotora?.puntajeDPM ||
          fichaClinica.puntajeDPM || '',
        diagnosticoDSM: fichaClinica.evaluacionPsicomotora?.diagnosticoDSM ||
          fichaClinica.diagnosticoDSM || ''
      },

      // Información Familiar
      informacionFamiliar: {
        conQuienVive: fichaClinica.informacionFamiliar?.conQuienVive ||
          fichaClinica.conQuienVive || '',
        localidad: fichaClinica.informacionFamiliar?.localidad ||
          fichaClinica.localidad || '',

        // Tipos de Familia
        tiposFamilia: (fichaClinica.informacionFamiliar?.tiposFamilia ||
          fichaClinica.tiposFamilia || []).map(tipo => ({
            id: tipo.id || null,
            nombre: tipo.nombre || null,
            tipoFamiliaOtro: tipo.tipoFamiliaOtro || null
          })),

        // Ciclo Vital Familiar
        cicloVitalFamiliar: fichaClinica.informacionFamiliar?.cicloVitalFamiliar ||
          fichaClinica.cicloVitalFamiliar || null,

        // Información de Padres
        padres: (fichaClinica.informacionFamiliar?.padres ||
          fichaClinica.padres || []).map(padre => ({
            nombre: padre.nombre || '',
            ocupacion: padre.ocupacion || '',
            escolaridad: {
              id: padre.escolaridad?.id || null,
              nivel: padre.escolaridad?.nivel || ''
            }
          }))
      },

      // Factores de Riesgo
      factoresRiesgo: {
        // Factores de Riesgo del Niño
        nino: (fichaClinica.factoresRiesgo?.nino ||
          fichaClinica.nino || []).map(factor => ({
            id: factor.id || null,
            nombre: factor.nombre || ''
          })),

        // Factores de Riesgo Familiares
        familiares: (fichaClinica.factoresRiesgo?.familiares ||
          fichaClinica.familiares || []).map(factor => ({
            id: factor.id || null,
            nombre: factor.nombre || '',
            otras: factor.otras || ''
          }))
      }
    };
  };

  // Función para parsear edad (memoizada)
  const parseEdad = useMemo(() => (edadString) => {
    if (!edadString || edadString === 'N/A') {
      return {
        edadAnios: '',
        edadMeses: '',
        edadDias: ''
      };
    }

    // Diferentes patrones de formato de edad
    const patronCompleto = /(\d+)\s*años?(?:,\s*(\d+)\s*meses?)?(?:,\s*(\d+)\s*días?)?/i;
    const patronSoloMeses = /(\d+)\s*meses?(?:,\s*(\d+)\s*días?)?/i;
    const patronSoloDias = /(\d+)\s*días?/i;

    // Intentar primero el patrón completo (años, meses, días)
    let match = edadString.match(patronCompleto);
    if (match) {
      return {
        edadAnios: match[1] || '',
        edadMeses: match[2] || '',
        edadDias: match[3] || ''
      };
    }
    // Intentar patrón de solo meses y días
    match = edadString.match(patronSoloMeses);
    if (match) {
      // Extraer meses y días directamente sin conversión
      const meses = parseInt(match[1]);
      const dias = match[2] || '';

      return {
        edadAnios: '', // No se convierte a años
        edadMeses: meses > 0 ? meses.toString() : '', // Mantener meses como están
        edadDias: dias // Mantener días como están
      };
    }
    // Intentar patrón de solo días
    match = edadString.match(patronSoloDias);
    if (match) {
      return {
        edadAnios: '',
        edadMeses: '',
        edadDias: match[1] || ''
      };
    }

    // Si es solo un número, asumir que son años
    if (/^\d+$/.test(edadString)) {
      return {
        edadAnios: edadString,
        edadMeses: '',
        edadDias: ''
      };
    }

    console.warn('Formato de edad no reconocido:', edadString);
    return {
      edadAnios: '',
      edadMeses: '',
      edadDias: ''
    };
  }, []);

  // Función de comparación de datos
  const compararDatos = useMemo(() => (original, reevaluacion) => {
    const cambios = {};

    const camposAdulto = [
      'diagnostico',
      'escolaridad',
      'ocupacion',
      'direccion',
      'valorHbac1',
      'alcoholDrogas',
      'tabaquismo',
      'otrosFactoresRiesgo',
      'conQuienVive',
      'horarioLlamada',
      'conectividad',
      'cicloVitalFamiliar',
      'tiposFamilia'
    ];

    const camposInfantil = [
      'evaluacionPsicomotora',
      'informacionFamiliar',
      'factoresRiesgo'
    ];

    const camposComparar = tipoFicha === 'adulto' ? camposAdulto : camposInfantil;

    camposComparar.forEach(campo => {
      const valorOriginal = original[campo];
      const valorReevaluacion = reevaluacion[campo];

      if (!_.isEqual(valorOriginal, valorReevaluacion)) {
        cambios[campo] = {
          original: valorOriginal,
          reevaluacion: valorReevaluacion
        };
      }
    });

    return cambios;
  }, [tipoFicha]);

  useEffect(() => {
    // Agregar un return temprano silencioso si no hay state
    if (!location.state) {
      return;
    }

    const { fichaId, tipo, reevaluacionId, modoEdicion } = location.state;

    console.log('location.state:', location.state);
    console.log('Ficha ID:', fichaId);
    console.log('Tipo:', tipo);

    // Solo navegar si realmente necesitamos hacerlo
    if (fichaId && tipo) {
      // Continuar con la lógica normal
      if (reevaluacionId) {
        setModoEdicion(true);
      } else {
        setModoEdicion(false);
      }

      const fetchDatosReevaluacion = async () => {
        try {
          const token = getToken();

          if (!token) {
            handleSessionExpired();
            return;
          }

          // Obtener ficha original
          const responseOriginal = await axios.get(
            `${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaId}?tipo=${tipo}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          // Obtener reevaluaciones previas
          const responseReevaluaciones = await axios.get(
            `${process.env.REACT_APP_API_URL}/fichas-clinicas/reevaluaciones/${fichaId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { tipo }
            }
          );

          if (!responseOriginal.data.data) {
            throw new Error("No se encontraron datos de la ficha original");
          }

          // Establecer la última reevaluación si existe
          const ultimaReevaluacion = responseReevaluaciones.data.data &&
            responseReevaluaciones.data.data.length > 0
            ? responseReevaluaciones.data.data[0]
            : null;

          // Establecer el estado de la última reevaluación
          setUltimaReevaluacion(ultimaReevaluacion);
          setReevaluaciones(responseReevaluaciones.data.data || []); // Guardar todas las reevaluaciones

          // Obtener institucion_id
          const institucionId =
            responseOriginal.data.data.institucion?.id ||
            responseOriginal.data.data.institucionId ||
            (responseOriginal.data.data.paciente && responseOriginal.data.data.paciente.institucion_id) ||
            user.institucion_id;

          if (!institucionId) {
            throw new Error("No se pudo encontrar un institucion_id válido");
          }

          // Preparar datos iniciales
          const prepararDatosIniciales = () => {
            const responseData = responseOriginal.data.data;

            // Si estamos en modo edición y hay un reevaluacionId
            if (modoEdicion && reevaluacionId) {
              // Encontrar la reevaluación específica
              const reevaluacionParaEditar = responseReevaluaciones.data.data.find(
                reevaluacion => reevaluacion.id === reevaluacionId
              );

              if (reevaluacionParaEditar) {
                // Formatear los datos de la reevaluación seleccionada
                const datosFormateados = tipo === 'adulto'
                  ? formatearFichaAdulto(reevaluacionParaEditar)
                  : formatearFichaInfantil(reevaluacionParaEditar);

                // Calcular cambios con la ficha original
                const cambios = compararDatos(responseData, reevaluacionParaEditar);
                setCambiosDetectados(cambios);
                setReevaluacionSeleccionada(reevaluacionParaEditar);

                return datosFormateados;
              }
            }

            // Si no hay reevaluación para editar, seguir con la lógica anterior
            if (responseReevaluaciones.data.data && responseReevaluaciones.data.data.length > 0) {
              const ultimaReevaluacion = responseReevaluaciones.data.data[0];

              // Establecer los datos de la última reevaluación como base
              const datosBase = tipo === 'adulto'
                ? {
                  nombres: ultimaReevaluacion.paciente?.nombres || responseData.paciente?.nombres || '',
                  apellidos: ultimaReevaluacion.paciente?.apellidos || responseData.paciente?.apellidos || '',
                  rut: ultimaReevaluacion.paciente?.rut || responseData.paciente?.rut || '',
                  edad: ultimaReevaluacion.paciente?.edad || responseData.paciente?.edad || '',
                  telefonoPrincipal: ultimaReevaluacion.paciente?.telefonoPrincipal || responseData.paciente?.telefonoPrincipal || '',
                  telefonoSecundario: ultimaReevaluacion.paciente?.telefonoSecundario || responseData.paciente?.telefonoSecundario || '',

                  diagnosticos: (
                    ultimaReevaluacion?.diagnosticos ||
                    responseData.diagnosticos ||
                    []
                  ).map(diag => ({
                    id: diag.id,
                    nombre: diag.nombre,
                    esOtro: diag.es_diagnostico_otro || diag.esOtro,
                    diagnosticoOtro: diag.diagnostico_otro_texto || diag.diagnosticoOtro
                  })),

                  diagnosticos_id: (
                    (ultimaReevaluacion?.diagnosticos || responseData.diagnosticos)
                      ? (ultimaReevaluacion?.diagnosticos || responseData.diagnosticos)
                        .filter(diag => diag.id !== null && !diag.es_diagnostico_otro)
                        .map(diag => diag.id.toString())
                      : []
                  ),

                  diagnostico_otro: (
                    (ultimaReevaluacion?.diagnosticos || responseData.diagnosticos)
                      ? ((ultimaReevaluacion?.diagnosticos || responseData.diagnosticos)
                        .find(diag => diag.es_diagnostico_otro)?.nombre || '')
                      : ''
                  ),

                  escolaridad: ultimaReevaluacion.escolaridad?.id || responseData.escolaridad?.id || '',
                  ocupacion: ultimaReevaluacion.ocupacion || responseData.ocupacion || '',
                  direccion: ultimaReevaluacion.direccion || responseData.direccion || '',
                  valorHbac1: ultimaReevaluacion.factoresRiesgo?.valorHbac1 || responseData.factoresRiesgo?.valorHbac1 || '',
                  alcoholDrogas: ultimaReevaluacion.factoresRiesgo?.alcoholDrogas || responseData.factoresRiesgo?.alcoholDrogas || false,
                  tabaquismo: ultimaReevaluacion.factoresRiesgo?.tabaquismo || responseData.factoresRiesgo?.tabaquismo || false,
                  otrosFactoresRiesgo: ultimaReevaluacion.factoresRiesgo?.otros || responseData.factoresRiesgo?.otros || '',
                  conQuienVive: ultimaReevaluacion.conQuienVive || responseData.conQuienVive || '',
                  horarioLlamada: ultimaReevaluacion.horarioLlamada || responseData.horarioLlamada || '',
                  conectividad: ultimaReevaluacion.conectividad || responseData.conectividad || '',
                  cicloVitalFamiliar: ultimaReevaluacion.cicloVitalFamiliar?.id || responseData.cicloVitalFamiliar?.id || '',

                  tiposFamilia: ultimaReevaluacion.tiposFamilia && ultimaReevaluacion.tiposFamilia.length > 0
                    ? ultimaReevaluacion.tiposFamilia.map(tipo => tipo.id || tipo)
                    : (responseData.tipoFamiliaOtro ? ['Otras'] : [])
                }
                : {
                  nombres: ultimaReevaluacion.paciente?.nombres || responseData.paciente?.nombres || '',
                  apellidos: ultimaReevaluacion.paciente?.apellidos || responseData.paciente?.apellidos || '',
                  rut: ultimaReevaluacion.paciente?.rut || responseData.paciente?.rut || '',
                  telefonoPrincipal: ultimaReevaluacion.paciente?.telefonoPrincipal || responseData.paciente?.telefonoPrincipal || '',
                  telefonoSecundario: ultimaReevaluacion.paciente?.telefonoSecundario || responseData.paciente?.telefonoSecundario || '',
                  fechaNacimiento: ultimaReevaluacion.paciente?.fechaNacimiento || responseData.paciente?.fechaNacimiento || '',

                  // Parsear edad de la última reevaluación o de los datos originales
                  ...parseEdad(
                    ultimaReevaluacion.paciente?.edad ||
                    responseData.paciente?.edad ||
                    ''
                  ),

                  // Evaluación Psicomotora
                  evaluacionPsicomotora: {
                    puntajeDPM: ultimaReevaluacion.evaluacionPsicomotora?.puntajeDPM ||
                      responseData.evaluacionPsicomotora?.puntajeDPM || '',
                    diagnosticoDSM: ultimaReevaluacion.evaluacionPsicomotora?.diagnosticoDSM ||
                      responseData.evaluacionPsicomotora?.diagnosticoDSM || ''
                  },

                  // Información Familiar
                  informacionFamiliar: {
                    conQuienVive: ultimaReevaluacion.informacionFamiliar?.conQuienVive ||
                      responseData.informacionFamiliar?.conQuienVive || '',
                    localidad: ultimaReevaluacion.informacionFamiliar?.localidad ||
                      responseData.informacionFamiliar?.localidad || '',

                    // Tipos de Familia
                    tiposFamilia: (ultimaReevaluacion.informacionFamiliar?.tiposFamilia ||
                      responseData.informacionFamiliar?.tiposFamilia || []).map(tipo => ({
                        id: tipo.id || null,
                        nombre: tipo.nombre || null,
                        tipoFamiliaOtro: tipo.tipoFamiliaOtro || null
                      })),

                    // Ciclo Vital Familiar
                    cicloVitalFamiliar: ultimaReevaluacion.informacionFamiliar?.cicloVitalFamiliar ||
                      responseData.informacionFamiliar?.cicloVitalFamiliar || null,

                    // Información de Padres
                    padres: (ultimaReevaluacion.informacionFamiliar?.padres ||
                      responseData.informacionFamiliar?.padres || []).map(padre => ({
                        nombre: padre.nombre || '',
                        ocupacion: padre.ocupacion || '',
                        escolaridad: {
                          id: padre.escolaridad?.id || null,
                          nivel: padre.escolaridad?.nivel || ''
                        }
                      }))
                  },

                  // Factores de Riesgo
                  factoresRiesgo: {
                    // Factores de Riesgo del Niño
                    nino: (ultimaReevaluacion.factoresRiesgo?.nino ||
                      responseData.factoresRiesgo?.nino || []).map(factor => ({
                        id: factor.id || null,
                        nombre: factor.nombre || ''
                      })),

                    // Factores de Riesgo Familiares
                    familiares: (ultimaReevaluacion.factoresRiesgo?.familiares ||
                      responseData.factoresRiesgo?.familiares || []).map(factor => ({
                        id: factor.id || null,
                        nombre: factor.nombre || '',
                        otras: factor.otras || ''
                      }))
                  }
                };

              // Calcular cambios
              const cambios = compararDatos(responseData, ultimaReevaluacion);
              setCambiosDetectados(cambios);

              return datosBase;
            }
            return tipo === 'adulto'
              ? {
                nombres: responseData.paciente?.nombres || '',
                apellidos: responseData.paciente?.apellidos || '',
                rut: responseData.paciente?.rut || '',
                edad: responseData.paciente?.edad || '',
                telefonoPrincipal: responseData.paciente?.telefonoPrincipal || '',
                telefonoSecundario: responseData.paciente?.telefonoSecundario || '',

                // Manejo específico de diagnóstico
                diagnosticos: responseData.diagnosticos || [],
                diagnosticos_id: (responseData.diagnosticos || [])
                  .filter(diag => diag.id !== null && !diag.es_diagnostico_otro)
                  .map(diag => diag.id.toString()),
                diagnostico_otro: (responseData.diagnosticos || [])
                  .find(diag => diag.es_diagnostico_otro)?.nombre || '',

                escolaridad: responseData.escolaridad?.id || '',
                ocupacion: responseData.ocupacion || '',
                direccion: responseData.direccion || '',
                valorHbac1: responseData.factoresRiesgo?.valorHbac1 || '',
                alcoholDrogas: responseData.factoresRiesgo?.alcoholDrogas || false,
                tabaquismo: responseData.factoresRiesgo?.tabaquismo || false,
                otrosFactoresRiesgo: responseData.factoresRiesgo?.otros || '',
                conQuienVive: responseData.conQuienVive || '',
                horarioLlamada: responseData.horarioLlamada || '',
                conectividad: responseData.conectividad || '',
                cicloVitalFamiliar: responseData.cicloVitalFamiliar?.id || '',

                // Manejo de tipos de familia
                tiposFamilia: responseData.tiposFamilia && responseData.tiposFamilia.length > 0
                  ? responseData.tiposFamilia.map(tipo => tipo.id || tipo)
                  : (responseData.tipoFamiliaOtro ? ['Otras'] : []),

              }
              : {
                // Mantener la lógica existente para infantil
                nombres: responseData.paciente?.nombres || '',
                apellidos: responseData.paciente?.apellidos || '',
                rut: responseData.paciente?.rut || '',
                telefonoPrincipal: responseData.paciente?.telefonoPrincipal || '',
                telefonoSecundario: responseData.paciente?.telefonoSecundario || '',
                fechaNacimiento: responseData.paciente?.fechaNacimiento || '',
                ...parseEdad(responseData.paciente?.edad),
                evaluacionPsicomotora: {
                  puntajeDPM: responseData.evaluacionPsicomotora?.puntajeDPM || '',
                  diagnosticoDSM: responseData.evaluacionPsicomotora?.diagnosticoDSM || ''
                },
                informacionFamiliar: {
                  conQuienVive: responseData.informacionFamiliar?.conQuienVive || '',
                  localidad: responseData.informacionFamiliar?.localidad || '',
                  tiposFamilia: responseData.informacionFamiliar?.tiposFamilia || [],
                  cicloVitalFamiliar: responseData.informacionFamiliar?.cicloVitalFamiliar || null,
                  padres: responseData.informacionFamiliar?.padres || []
                },
                factoresRiesgo: {
                  nino: responseData.factoresRiesgo?.nino || [],
                  familiares: responseData.factoresRiesgo?.familiares || []
                }
              };
          };

          setFichaOriginal({
            ...responseOriginal.data.data,
            institucion_id: institucionId
          });
          setTipoFicha(tipo);
          setDatosIniciales(prepararDatosIniciales());
          setLoading(false);
        } catch (error) {
          console.error('Error al obtener datos de reevaluación:', error);
          handleSessionExpired(); // Manejar la expiración de sesión si es necesario
        } finally {
          setLoading(false);
        }
      };

      fetchDatosReevaluacion();
    }
  }, [location.state, getToken, navigate, compararDatos, parseEdad, handleSessionExpired]);

  const handleReevaluacionExitosa = (nuevaFicha) => {
    toast.success('Reevaluación registrada exitosamente', {
        toastId: 'reevaluacion-success' // Esto evita duplicados
    });
    setUltimaReevaluacion(nuevaFicha); // Actualizar la última reevaluación
    // navigate('?component=listado-fichas-clinicas', {
    //   state: {
    //     tipo: tipoFicha,
    //     nuevaFichaId: nuevaFicha.id
    //   }
    // });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container">
      <div className="d-flex mb-3">
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
      </div>
      <h2 className="text-center mb-4" style={{ 'color': 'var(--color-accent)' }}>
        Reevaluación - {tipoFicha === 'adulto' ? 'Adulto' : 'Infantil'}
      </h2>

      {tipoFicha === 'adulto' ? (
        <FichaClinicaAdulto
          key="reevaluacion-adulto"
          datosIniciales={datosIniciales}
          onVolver={handleVolver}
          onIngresar={handleReevaluacionExitosa}
          esReevaluacion={true}
          institucionId={fichaOriginal?.institucion_id}
          cambiosDetectados={cambiosDetectados}
          ultimaReevaluacion={ultimaReevaluacion}
          reevaluacionSeleccionada={reevaluacionSeleccionada}
          modoEdicion={modoEdicion}
        />
      ) : (
        <FichaClinicaInfantil
          key="reevaluacion-infantil"
          datosIniciales={datosIniciales}
          onVolver={handleVolver}
          onIngresar={handleReevaluacionExitosa}
          esReevaluacion={true}
          institucionId={fichaOriginal?.institucion_id}
          cambiosDetectados={cambiosDetectados}
          ultimaReevaluacion={ultimaReevaluacion}
          reevaluacionSeleccionada={reevaluacionSeleccionada}
          modoEdicion={modoEdicion}
        />
      )}
    </div>
  );
};

export default Reevaluacion;