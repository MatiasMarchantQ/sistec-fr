import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Form, Button, Table, Card, 
  Modal, Accordion 
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Importaciones de componentes
import PrimerLlamado from './PrimerLlamado';
import SegundoLlamado from './SegundoLlamado';
import TercerLlamado from './TercerLlamado';

// Función de procesamiento de datos
const procesarSeguimiento = (seguimientoData = {}) => {
  // Función auxiliar para parsear campos JSON
  const parsearCampoJSON = (campo) => {
    if (typeof campo === 'string') {
      try {
        // Eliminar comillas extras y parsear
        const campoLimpio = campo.replace(/^"|"$/g, '');
        return campoLimpio && campoLimpio !== '{}' 
          ? JSON.parse(campoLimpio) 
          : {};
      } catch (error) {
        console.error('Error parseando JSON:', campo, error);
        return {};
      }
    }
    return campo || {};
  };

  // Parsear campos JSON
  const riesgoInfeccion = parsearCampoJSON(seguimientoData.riesgo_infeccion);
  const riesgoGlicemia = parsearCampoJSON(seguimientoData.riesgo_glicemia);
  const riesgoHipertension = parsearCampoJSON(seguimientoData.riesgo_hipertension);
  const adherencia = parsearCampoJSON(seguimientoData.adherencia);
  const adherenciaTratamiento = parsearCampoJSON(seguimientoData.adherencia_tratamiento);
  const efectosSecundarios = parsearCampoJSON(seguimientoData.efectos_secundarios);
  const nutricion = parsearCampoJSON(seguimientoData.nutricion);
  const actividadFisica = parsearCampoJSON(seguimientoData.actividad_fisica);
  const eliminacion = parsearCampoJSON(seguimientoData.eliminacion);
  const autoeficacia = parsearCampoJSON(seguimientoData.autoeficacia);
  const sintomasDepresivos = parsearCampoJSON(seguimientoData.sintomas_depresivos);

  return {
    id: seguimientoData.id,
    fecha: seguimientoData.fecha || new Date().toISOString().split('T')[0],
    pacienteId: seguimientoData.paciente_id || null,
    fichaId: seguimientoData.ficha_id || null,
    usuario: {
      id: seguimientoData.usuario?.id || null,
      nombres: seguimientoData.usuario?.nombres || null,
      apellidos: seguimientoData.usuario?.apellidos || null,
      rut: seguimientoData.usuario?.rut || null,
      correo: seguimientoData.usuario?.correo || null,
    },
    estudiante: {
        id: seguimientoData.estudiante?.id || null,
        nombres: seguimientoData.estudiante?.nombres || null,
        apellidos: seguimientoData.estudiante?.apellidos || null,
        rut: seguimientoData.estudiante?.rut || null,
        correo: seguimientoData.estudiante?.correo || null,
    },
    riesgoInfeccion: {
      herida: riesgoInfeccion.herida ?? null,
      fechaHerida: riesgoInfeccion.fechaHerida || null,
      dolorNeuropatico: riesgoInfeccion.dolorNeuropatico ?? null,
      intensidadDolor: riesgoInfeccion.intensidadDolor || riesgoInfeccion.intensidad_dolor || 0,
      tratamientoHerida: riesgoInfeccion.tratamientoHerida ?? null,
      necesitaDerivacion: riesgoInfeccion.necesitaDerivacion ?? null,
      intervencionDolor: riesgoInfeccion.intervencionDolor ?? null,
      realizoIntervencion: riesgoInfeccion.realizoIntervencion ?? null,
      intervencionMejoria: riesgoInfeccion.intervencionMejoria || null
    },
    
    riesgoGlicemia: {
      hipoglicemia: riesgoGlicemia.hipoglicemia ?? null,
      intervencionHipoglicemia: riesgoGlicemia.intervencionHipoglicemia || null,
      hiperglicemia: riesgoGlicemia.hiperglicemia ?? null,
      realizoIntervencionHipoglicemia: riesgoGlicemia.realizoIntervencionHipoglicemia ?? null
    },
    
    riesgoHipertension: {
      dolorPecho: riesgoHipertension.dolorPecho ?? null,
      dolorCabeza: riesgoHipertension.dolorCabeza ?? null,
      zumbidoOidos: riesgoHipertension.zumbidoOidos ?? null,
      nauseaVomitos: riesgoHipertension.nauseaVomitos ?? null,
      nauseas: riesgoHipertension.nauseas || null
    },
    
    adherencia: {
      olvido: adherencia.olvido ?? null,
      horaIndicada: adherencia.horaIndicada ?? null,
      dejaRemedio: adherencia.dejaRemedio ?? null,
      dejaRemedioMal: adherencia.dejaRemedioMal ?? null
    },
    
    adherenciaTratamiento: {
      moriskyGreen: {
        olvidaMedicamento: adherenciaTratamiento.moriskyGreen?.olvidaMedicamento ?? null,
        tomaHoraIndicada: adherenciaTratamiento.moriskyGreen?.tomaHoraIndicada ?? null,
        dejaMedicamentoBien: adherenciaTratamiento.moriskyGreen?.dejaMedicamentoBien ?? null,
        dejaMedicamentoMal: adherenciaTratamiento.moriskyGreen?.dejaMedicamentoMal ?? null
      },
      adherencia: adherenciaTratamiento.adherencia ?? null
    },
    
    efectosSecundarios: {
      presente: efectosSecundarios.presente ?? null,
      malestar: efectosSecundarios.malestar || null,
      intervencion: efectosSecundarios.intervencion || null,
      realizaIntervencion: efectosSecundarios.realizaIntervencion ?? null
    },
    
    nutricion: {
      comidasDia: nutricion.comidasDia || null,
      comidas: {
        desayuno: nutricion.comidas?.desayuno || null,
        almuerzo: nutricion.comidas?.almuerzo || null,
        once: nutricion.comidas?.once || null,
        cena: nutricion.comidas?.cena || null
      },
      alimentosNoRecomendados: nutricion.alimentosNoRecomendados || null
    },
    
    actividadFisica: {
      realiza: actividadFisica.realiza ?? null,
      tipo: actividadFisica.tipo || null,
      frecuencia: actividadFisica.frecuencia || null
    },
    
    eliminacion: {
      poliuria: eliminacion.poliuria ?? null,
      urgenciaMiccional: eliminacion.urgenciaMiccional ?? null,
      tenesmoVesical: eliminacion.tenesmoVesical ?? null,
      intervencion: eliminacion.intervencion || null
    },
    
    sintomasDepresivos: {
      puntajes: sintomasDepresivos.puntajes || [],
      puntajeTotal: sintomasDepresivos.puntajeTotal || 0,
      nivelDificultad: sintomasDepresivos.nivelDificultad || 0
    },
    
    autoeficacia: {
      comerCada4Horas: autoeficacia.comerCada4Horas || null,
      continuarDieta: autoeficacia.continuarDieta || null,
      escogerAlimentos: autoeficacia.escogerAlimentos || null,
      hacerEjercicio: autoeficacia.hacerEjercicio || null,
      prevenirBajaAzucar: autoeficacia.prevenirBajaAzucar || null,
      saberQueHacer: autoeficacia.saberQueHacer || null,
      evaluarCambios: autoeficacia.evaluarCambios || null,
      controlarDiabetes: autoeficacia.controlarDiabetes || null
    },
    
    otrosSintomas: seguimientoData.otros_sintomas || null,
    manejoSintomas: seguimientoData.manejo_sintomas || null,
    comentarios: seguimientoData.comentarios || null
  };
};

const SeguimientoAdulto = ({ pacienteId, fichaId }) => {
  const { getToken } = useAuth();
  const { user } = useAuth();

  // Crear referencia para el acordeón
  const accordionRef = useRef(null);

  // Estado inicial con función de procesamiento
  const [seguimiento, setSeguimiento] = useState(() => 
    procesarSeguimiento({ 
      pacienteId, 
      fichaId,
      sintomasDepresivos: {
        puntajes: [],
        puntajeTotal: 0,
        nivelDificultad: 0
      },
      autoeficacia: {
        comerCada4Horas: 1,
        continuarDieta: 1,
        escogerAlimentos: 1,
        hacerEjercicio: 1,
        prevenirBajaAzucar: 1,
        saberQueHacer: 1,
        evaluarCambios: 1,
        controlarDiabetes: 1
      },
      otrosSintomas: '',
      manejoSintomas: '',
      comentarios: ''
    })
  );

  // Estados para controlar la expansión de los acordeones
  const [activeStep, setActiveStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({
    primerLlamado: false,
    segundoLlamado: false,
    tercerLlamado: false
  });

  const [seguimientosAnteriores, setSeguimientosAnteriores] = useState([]);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar seguimientos anteriores
  useEffect(() => {
    if (pacienteId) {
      cargarSeguimientosAnteriores();
    }
  }, [pacienteId]);

  const cargarRespuestasAnteriores = async (seguimientoId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/seguimientos/adulto/${seguimientoId}/paciente/${pacienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const seguimientoProcesado = procesarSeguimiento(response.data);
      
      const pacienteData = response.data.paciente_adulto; // Asegúrate de que esta propiedad existe

      // Determinar el índice del acordeón basado en el seguimiento procesado
      const indiceAcordeon = determinarIndiceAcordeon(seguimientoProcesado);
      console.log('Seguimiento procesado:', seguimientoProcesado);
            
      // Actualizar el estado del seguimiento con los datos recuperados
      setSeguimiento(prevSeguimiento => ({
        ...prevSeguimiento,
        ...seguimientoProcesado
      }));

      setPaciente(pacienteData);
      
      // Actualizar los pasos completados
      setCompletedSteps(prev => ({
        ...prev,
        [`${getPrimerLlamadoKey(indiceAcordeon + 1)}`]: true
      }));
      
      // Si el acordeón actual es diferente del que se va a abrir, ciérralo
      if (activeStep !== indiceAcordeon) {
        // Cerrar el acordeón actual
        setActiveStep(indiceAcordeon);
      } else {
        // Si el acordeón que se va a abrir es el mismo, ciérralo
        setActiveStep(null);
        setTimeout(() => {
          setActiveStep(indiceAcordeon);
        }, 100);
      }
  
      // Forzar un re-render y abrir el acordeón
      setTimeout(() => {
        const accordionItem = document.querySelector(`[data-rk="accordion-item-${indiceAcordeon}"]`);
        if (accordionItem) {
          accordionItem.querySelector('.accordion-button').click();
          // Desplazar el acordeón a la vista
          accordionItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
  
      toast.success(`Respuestas del seguimiento cargadas`);
      
    } catch (error) {
      console.error('Error al cargar seguimiento anterior', error);
      toast.error('No se pudieron cargar las respuestas anteriores');
    }
  };
  
  // Función para determinar el índice del acordeón
  const determinarIndiceAcordeon = (seguimiento) => {
    // Prioriza campos específicos de cada sección
    if (seguimiento.riesgoInfeccion?.herida !== null || 
        seguimiento.riesgoGlicemia?.hipoglicemia !== null || 
        seguimiento.riesgoHipertension?.dolorPecho !== null) {
      return 0; // Primer acordeón
    }
  
    if (seguimiento.nutricion?.comidasDia !== null || 
        seguimiento.actividadFisica?.realiza !== null || 
        seguimiento.eliminacion?.poliuria !== null) {
      return 1; // Segundo acordeón
    }
  
    if (seguimiento.sintomasDepresivos?.puntajeTotal !== null || 
        seguimiento.autoeficacia?.comerCada4Horas !== null) {
      return 2; // Tercer acordeón
    }
  
    // Si no se puede determinar, devolver 0 por defecto
    return 0;
  };
  
  // Modificar getPrimerLlamadoKey para ser más flexible
  const getPrimerLlamadoKey = (indice) => {
    switch(indice) {
      case 0: return 'primerLlamado';
      case 1: return 'segundoLlamado';
      case 2: return 'tercerLlamado';
      default: return 'primerLlamado';
    }
  };
  
  
  // Función para cargar seguimientos anteriores
  const cargarSeguimientosAnteriores = async () => {
    try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/seguimientos/adulto/${pacienteId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Procesar los datos recibidos
        const procesados = response.data.map(seguimiento => {
            const procesado = procesarSeguimiento(seguimiento);
            return {
                id: procesado.id,
                numeroLlamado: seguimiento.numero_llamado,
                fecha: procesado.fecha,
                riesgoInfeccion: procesado.riesgoInfeccion,
                riesgoGlicemia: procesado.riesgoGlicemia,
                riesgoHipertension: procesado.riesgoHipertension,
                adherencia: procesado.adherencia,
                adherenciaTratamiento: procesado.adherenciaTratamiento,
                efectosSecundarios: procesado.efectosSecundarios,
                nutricion: procesado.nutricion,
                actividadFisica: procesado.actividadFisica,
                eliminacion: procesado.eliminacion,
                sintomasDepresivos: procesado.sintomasDepresivos,
                autoeficacia: procesado.autoeficacia,
                otrosSintomas: procesado.otrosSintomas,
                manejoSintomas: procesado.manejoSintomas,
                comentarios: procesado.comentarios,
                usuario: procesado.usuario,
                estudiante: procesado.estudiante
            };
        });

        setSeguimientosAnteriores(procesados); // Actualiza el estado con los datos procesados

        // Actualiza el seguimiento combinado como antes
        const seguimientoCombinado = {
            pacienteId,
            fichaId,
            numeroLlamado: Math.max(...procesados.map(s => s.numeroLlamado)) || 1,
            fecha: new Date().toISOString().split('T')[0],
            // Agrega otros campos que necesites de los seguimientos
        };

        // Actualizar el estado del seguimiento con los datos combinados
        setSeguimiento(prevSeguimiento => ({
            ...prevSeguimiento,
            ...seguimientoCombinado
        }));

        // Marcar pasos completados
        const nuevosCompletedSteps = {
            primerLlamado: procesados.some(s => s.numeroLlamado === 1),
            segundoLlamado: procesados.some(s => s.numeroLlamado === 2),
            tercerLlamado: procesados.some(s => s.numeroLlamado === 3)
        };

        setCompletedSteps(nuevosCompletedSteps);

        // Establecer el paso activo al último llamado no completado
        if (!nuevosCompletedSteps.tercerLlamado) {
            setActiveStep(nuevosCompletedSteps.segundoLlamado ? 2 : 
                          nuevosCompletedSteps.primerLlamado ? 1 : 0);
        }

    } catch (error) {
        console.error('Error al cargar seguimientos anteriores', error);
        toast.error('Error al cargar los seguimientos anteriores');
    } finally {
        setLoading(false);
    }
};

  // Función para guardar seguimiento
  const guardarSeguimiento = async (etapa) => {
    try {
      const token = getToken();        
      // Preparar datos para enviar
      const datosParaEnviar = {
        pacienteId,  
        fichaId,     
        fecha: new Date().toISOString().split('T')[0],
        usuario_id: user.id || null,
        estudiante_id: user.estudiante_id || null
      };

  
      // Agregar datos específicos según la etapa
      switch(etapa) {
        case 1:
          // Mapeo explícito para asegurar la estructura correcta
          datosParaEnviar.riesgoInfeccion = {
            herida: seguimiento.riesgoInfeccion.herida,
            fechaHerida: seguimiento.riesgoInfeccion.fechaHerida,
            dolorNeuropatico: seguimiento.riesgoInfeccion.dolorNeuropatico,
            intensidadDolor: seguimiento.riesgoInfeccion.intensidadDolor,
            tratamientoHerida: seguimiento.riesgoInfeccion.tratamientoHerida,
            necesitaDerivacion: seguimiento.riesgoInfeccion.necesitaDerivacion,
            realizoIntervencion: seguimiento.riesgoInfeccion.realizoIntervencion,
            intervencionDolor: seguimiento.riesgoInfeccion.intervencionDolor
          };
  
          datosParaEnviar.riesgoGlicemia = {
            hipoglicemia: seguimiento.riesgoGlicemia.hipoglicemia,
            intervencionHipoglicemia: seguimiento.riesgoGlicemia.intervencionHipoglicemia,
            hiperglicemia: seguimiento.riesgoGlicemia.hiperglicemia,
            realizoIntervencionHipoglicemia: seguimiento.riesgoGlicemia.realizoIntervencionHipoglicemia
          };
  
          datosParaEnviar.riesgoHipertension = {
            dolorPecho: seguimiento.riesgoHipertension.dolorPecho,
            dolorCabeza: seguimiento.riesgoHipertension.dolorCabeza,
            zumbidoOidos: seguimiento.riesgoHipertension.zumbidoOidos,
            nauseaVomitos: seguimiento.riesgoHipertension.nauseaVomitos
          };
  
          datosParaEnviar.adherencia = {
            olvido: seguimiento.adherencia.olvido,
            horaIndicada: seguimiento.adherencia.horaIndicada,
            dejaRemedio: seguimiento.adherencia.dejaRemedio,
            dejaRemedioMal: seguimiento.adherencia.dejaRemedioMal
          };
  
          datosParaEnviar.adherenciaTratamiento = {
            moriskyGreen: {
              olvidaMedicamento: seguimiento.adherenciaTratamiento.moriskyGreen.olvidaMedicamento,
              tomaHoraIndicada: seguimiento.adherenciaTratamiento.moriskyGreen.tomaHoraIndicada,
              dejaMedicamentoBien: seguimiento.adherenciaTratamiento.moriskyGreen.dejaMedicamentoBien,
              dejaMedicamentoMal: seguimiento.adherenciaTratamiento.moriskyGreen.dejaMedicamentoMal
            },
            adherencia: seguimiento.adherenciaTratamiento.adherencia
          };
  
          datosParaEnviar.efectosSecundarios = {
            presente: seguimiento.efectosSecundarios.presente,
            malestar: seguimiento.efectosSecundarios.malestar,
            intervencion: seguimiento.efectosSecundarios.intervencion,
            realizaIntervencion: seguimiento.efectosSecundarios.realizaIntervencion
          };

          // Autoeficacia
          datosParaEnviar.autoeficacia = {
            comerCada4Horas: seguimiento.autoeficacia.comerCada4Horas || 0,
            continuarDieta: seguimiento.autoeficacia.continuarDieta || 0,
            escogerAlimentos: seguimiento.autoeficacia.escogerAlimentos || 0,
            hacerEjercicio: seguimiento.autoeficacia.hacerEjercicio || 0,
            prevenirBajaAzucar: seguimiento.autoeficacia.prevenirBajaAzucar || 0,
            saberQueHacer: seguimiento.autoeficacia.saberQueHacer || 0,
            evaluarCambios: seguimiento.autoeficacia.evaluarCambios || 0,
            controlarDiabetes: seguimiento.autoeficacia.controlarDiabetes || 0
          };
          break;
        
        case 2:
          datosParaEnviar.nutricion = {
            comidasDia: seguimiento.nutricion.comidasDia,
            comidas: {
              desayuno: seguimiento.nutricion.comidas.desayuno,
              almuerzo: seguimiento.nutricion.comidas.almuerzo,
              once: seguimiento.nutricion.comidas.once,
              cena: seguimiento.nutricion.comidas.cena
            },
            alimentosNoRecomendados: seguimiento.nutricion.alimentosNoRecomendados
          };
  
          datosParaEnviar.actividadFisica = {
            realiza: seguimiento.actividadFisica.realiza,
            tipo: seguimiento.actividadFisica.tipo,
            frecuencia: seguimiento.actividadFisica.frecuencia
          };
  
          datosParaEnviar.eliminacion = {
            poliuria: seguimiento.eliminacion.poliuria,
            urgenciaMiccional: seguimiento.eliminacion.urgenciaMiccional,
            tenesmoVesical: seguimiento.eliminacion.tenesmoVesical,
            intervencion: seguimiento.eliminacion.intervencion
          };
          break;
        
          case 3:
            // Síntomas Depresivos
            datosParaEnviar.sintomasDepresivos = {
              puntajes: datosParaEnviar.sintomasDepresivos?.puntajes || [],
              puntajeTotal: datosParaEnviar.sintomasDepresivos?.puntajeTotal || 0,
              nivelDificultad: datosParaEnviar.sintomasDepresivos?.nivelDificultad || 0
            };
            
            // Autoeficacia
            datosParaEnviar.autoeficacia = {
              comerCada4Horas: seguimiento.autoeficacia.comerCada4Horas || 0,
              continuarDieta: seguimiento.autoeficacia.continuarDieta || 0,
              escogerAlimentos: seguimiento.autoeficacia.escogerAlimentos || 0,
              hacerEjercicio: seguimiento.autoeficacia.hacerEjercicio || 0,
              prevenirBajaAzucar: seguimiento.autoeficacia.prevenirBajaAzucar || 0,
              saberQueHacer: seguimiento.autoeficacia.saberQueHacer || 0,
              evaluarCambios: seguimiento.autoeficacia.evaluarCambios || 0,
              controlarDiabetes: seguimiento.autoeficacia.controlarDiabetes || 0
            };
          
            // Otros síntomas
            datosParaEnviar.otrosSintomas = seguimiento.otrosSintomas || '';
            
            // Manejo de síntomas
            datosParaEnviar.manejoSintomas = seguimiento.manejoSintomas || '';
            
            // Comentarios
            datosParaEnviar.comentarios = seguimiento.comentarios || '';
            break;
      }
    
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/seguimientos/adulto`,
        datosParaEnviar,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      await cargarSeguimientosAnteriores();
  
    } catch (error) {
      console.error('ERROR AL GUARDAR SEGUIMIENTO:', error.response ? error.response.data : error);
      
      // Mostrar mensaje de error específico
      if (error.response) {
        toast.error(error.response.data.message || 'Error al guardar el seguimiento');
      } else {
        toast.error('No se pudo guardar el seguimiento. Verifique su conexión.');
      }
    }
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Seguimiento de Adulto - Telecuidado</h2>
      
      {loading ? <p>Cargando...</p> : (
          <Accordion 
            ref={accordionRef}
            activeKey={activeStep !== null ? activeStep.toString() : undefined}
            onSelect={(eventKey) => setActiveStep(eventKey ? parseInt(eventKey) : null)}
          >
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              Primer Llamado 
              {completedSteps.primerLlamado && <span className="text-success"></span>}
            </Accordion.Header>
            <Accordion.Body>
              <PrimerLlamado 
                seguimiento={seguimiento} 
                setSeguimiento={setSeguimiento}
                onComplete={() => guardarSeguimiento(1)}
                paciente={paciente}
              />
            </Accordion.Body>
          </Accordion.Item>
        
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              Segundo Llamado
              {completedSteps.segundoLlamado && <span className="text-success"></span>}
            </Accordion.Header>
            <Accordion.Body>
              <SegundoLlamado 
                seguimiento={seguimiento} 
                setSeguimiento={setSeguimiento}
                onComplete={() => guardarSeguimiento(2)}
                paciente={paciente}
              />
            </Accordion.Body>
          </Accordion.Item>
        
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              Tercer Llamado
              {completedSteps.tercerLlamado && <span className="text-success"></span>}
            </Accordion.Header>
            <Accordion.Body>
              <TercerLlamado 
                seguimiento={seguimiento} 
                setSeguimiento={setSeguimiento}
                onComplete={() => guardarSeguimiento(3)}
                paciente={paciente}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
  
      {/* Resto del código de seguimientos anteriores y modal permanece igual */}
      <Card className="mt-4">
      <Card.Header>Seguimientos Anteriores</Card.Header>
      <Card.Body>
      <Table striped bordered>
        <thead>
          <tr>
            <th>N°</th>
            <th>Número de Llamado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {seguimientosAnteriores.map(seguimiento => {
            // Función para determinar el índice del acordeón
            const determinarIndiceAcordeon = (seguimientoData) => {
              if (seguimientoData.riesgoInfeccion?.herida !== null || 
                  seguimientoData.riesgoGlicemia?.hipoglicemia !== null || 
                  seguimientoData.riesgoHipertension?.dolorPecho !== null) {
                return 0; // Primer acordeón
              }
            
              if (seguimientoData.nutricion?.comidasDia !== null || 
                  seguimientoData.actividadFisica?.realiza !== null || 
                  seguimientoData.eliminacion?.poliuria !== null) {
                return 1; // Segundo acordeón
              }
            
              if (seguimientoData.sintomasDepresivos?.puntajeTotal !== null || 
                  seguimientoData.autoeficacia?.comerCada4Horas !== null) {
                return 2; // Tercer acordeón
              }
            
              // Si no se puede determinar, devolver 0 por defecto
              return 0;
            };

            const indiceAcordeon = determinarIndiceAcordeon(seguimiento);

            return (
              <tr key={seguimiento.id}>
                <td>{seguimiento.numeroLlamado}</td>
                <td>
                  {indiceAcordeon === 0 ? 'Primer Llamado' : 
                  indiceAcordeon === 1 ? 'Segundo Llamado' : 
                  indiceAcordeon === 2 ? 'Tercer Llamado' : 
                  'No identificado'}
                </td>
                <td>{seguimiento.fecha}</td>
                <td>
                  <Button 
                    variant="info" 
                    onClick={() => setSelectedSeguimiento(seguimiento)}
                  >
                    Responsable de la llamada
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => cargarRespuestasAnteriores(seguimiento.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Cargar Respuestas
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      </Card.Body>
    </Card>

      <Modal 
      show={!!selectedSeguimiento}
      onHide={() => setSelectedSeguimiento(null)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Seguimiento - {selectedSeguimiento?.fecha}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedSeguimiento && (
          <div>
            <h4>Número de Llamado: {selectedSeguimiento.numeroLlamado}</h4>
            {console.log('Selected Seguimiento:', selectedSeguimiento)}
            {/* Mostrar información del Usuario o del Estudiante */}
            {selectedSeguimiento.usuario ? (
              <Card className="mb-3">
                <Card.Header>Información del Usuario</Card.Header>
                <Card.Body>
                  <p><strong>Nombres:</strong> {selectedSeguimiento.usuario.nombres}</p>
                  <p><strong>Apellidos:</strong> {selectedSeguimiento.usuario.apellidos}</p>
                  <p><strong>RUT:</strong> {selectedSeguimiento.usuario.rut}</p>
                  <p><strong>Correo:</strong> {selectedSeguimiento.usuario.correo}</p>
                </Card.Body>
              </Card>
            ) : selectedSeguimiento.estudiante ? (
              <Card className="mb-3">
                <Card.Header>Información del Estudiante</Card.Header>
                <Card.Body>
                  <p><strong>Nombres:</strong> {selectedSeguimiento.estudiante.nombres}</p>
                  <p><strong>Apellidos:</strong> {selectedSeguimiento.estudiante.apellidos}</p>
                  <p><strong>RUT:</strong> {selectedSeguimiento.estudiante.rut}</p>
                  <p><strong>Correo:</strong> {selectedSeguimiento.estudiante.correo}</p>
                </Card.Body>
              </Card>
            ) : (
              <p>No se encontró información del usuario ni del estudiante.</p>
            )}

          </div>
        )}
      </Modal.Body>
    </Modal>
    </Container>
  );
};

export default SeguimientoAdulto;