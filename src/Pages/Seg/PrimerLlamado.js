import React, { useEffect, useState, useMemo } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const sectionStyles = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  width: '100%',
  overflowX: 'hidden'
};

const headingStyles = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px 15px',
  borderRadius: '6px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  width: '100%'
};

const PrimerLlamado = ({
  seguimiento,
  setSeguimiento,
  onComplete,
  disabled,
  guardarSeguimiento,
  paciente
}) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
    useEffect(() => {
      const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener('resize', handleResize);
      return () => {
          window.removeEventListener('resize', handleResize);
      };
  }, []);

  const preguntasAutoeficacia = [
    {
      label: "¿Qué tan seguro(a) se siente Ud. de poder comer sus alimentos cada 4 ó 5 horas todos los días?",
      key: "comerCada4Horas"
    },
    {
      label: "¿Qué tan seguro(a) se siente de continuar su dieta cuando tiene que preparar o compartir alimentos con personas que no tienen diabetes?",
      key: "continuarDieta"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder escoger los alimentos apropiados para comer cuando tiene hambre?",
      key: "escogerAlimentos"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder hacer ejercicios de 15 a 30 minutos, unas 4 o 5 veces por semana?",
      key: "hacerEjercicio"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder hacer algo para prevenir que su nivel de azúcar en la sangre disminuya cuando hace ejercicios?",
      key: "prevenirBajaAzucar"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder saber qué hacer cuando su nivel de azúcar en la sangre sube o baja más de lo normal para usted?",
      key: "saberQueHacer"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder evaluar cuando los cambios en su enfermedad significan que usted debe visitar a su médico?",
      key: "evaluarCambios"
    },
    {
      label: "¿Qué tan seguro(a) se siente de poder controlar su diabetes para que no interfiera con las cosas que quiere hacer?",
      key: "controlarDiabetes"
    }
  ];

  // Lógica para determinar si se puede editar el seguimiento
  const esEditable = useMemo(() => {
    if (!user) return false; // Verifica que user no sea null
  
    // Si es un estudiante
    if (user.rol_id === 3) {
      return (
        (seguimiento.estudiante_id === user.estudiante_id) ||
        (seguimiento.estudiante?.id === user.estudiante_id)
      );
    }
  
    // Si es un usuario con rol de Director, Docente o Admin
    if (user.rol_id === 1 || user.rol_id === 2) {
      return true; // Puede editar cualquier seguimiento
    }
  
    // Para usuarios normales, verificar el usuario_id
    return (
      (seguimiento.usuario_id === user.id) ||
      (seguimiento.usuario?.id === user.id)
    );
  }, [seguimiento, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
 
    // Validaciones
    const validaciones = [
      {
        condicion: seguimiento.riesgoInfeccion.herida === undefined,
        mensaje: 'Debe indicar si ha presentado heridas en los pies'
      },
      {
        condicion: seguimiento.riesgoInfeccion.herida && !seguimiento.riesgoInfeccion.fechaHerida,
        mensaje: 'Debe indicar la fecha de la herida'
      },
      {
        condicion: seguimiento.riesgoInfeccion.herida && seguimiento.riesgoInfeccion.necesitaDerivacion === undefined,
        mensaje: 'Debe indicar si necesita derivación a Centro de Salud'
      },
      {
        condicion: seguimiento.riesgoInfeccion.dolorNeuropatico === undefined,
        mensaje: 'Debe indicar si ha presentado dolor neuropático'
      },
      {
        condicion: seguimiento.riesgoInfeccion.dolorNeuropatico && seguimiento.riesgoInfeccion.intensidadDolor === undefined,
        mensaje: 'Debe indicar la intensidad del dolor neuropático'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hipoglicemia === undefined,
        mensaje: 'Debe indicar si ha presentado signos de hipoglicemia'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hipoglicemia && seguimiento.riesgoGlicemia.realizoIntervencionHipoglicemia === undefined,
        mensaje: 'Debe indicar si realizó intervención para hipoglicemia'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hiperglicemia === undefined,
        mensaje: 'Debe indicar si ha presentado signos de hiperglicemia'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hiperglicemia && seguimiento.riesgoGlicemia.realizoIntervencionHiperglicemia === undefined,
        mensaje: 'Debe indicar si realizó intervención para hiperglicemia'
      },
      {
        condicion: !seguimiento.riesgoHipertension.dolorPecho &&
                   !seguimiento.riesgoHipertension.dolorCabeza &&
                   !seguimiento.riesgoHipertension.zumbidoOidos &&
                   !seguimiento.riesgoHipertension.nauseaVomitos,
        mensaje: 'Debe seleccionar al menos un síntoma o marcar que no presenta ninguno'
      },
      {
        condicion: seguimiento.adherencia.olvido === undefined,
        mensaje: 'Debe completar el Test Morisky-Green'
      },
      {
        condicion: seguimiento.adherencia.horaIndicada === undefined,
        mensaje: 'Debe completar el Test Morisky-Green'
      },
      {
        condicion: seguimiento.adherencia.dejaRemedio === undefined,
        mensaje: 'Debe completar el Test Morisky-Green'
      },
      {
        condicion: seguimiento.adherencia.dejaRemedioMal === undefined,
        mensaje: 'Debe completar el Test Morisky-Green'
      },
      {
        condicion: !seguimiento.autoeficacia,
        mensaje: 'Debe completar la evaluación de autoeficacia'
      }
    ];
 
    const errorValidacion = validaciones.find(val => val.condicion);
 
    if (errorValidacion) {
      toast.error(errorValidacion.mensaje);
      return;
    }
 
    const dataToSubmit = {
      ...seguimiento,
      estudiante_id: user.estudiante_id || null,
      usuario_id: user.id || null
    };
 
    onComplete(dataToSubmit);
  };

  const renderContent = () => {
    return (
      <div id="exportable-content">
        <div data-pdf-section>
          <h5 style={{
            ...headingStyles,
            backgroundColor: '#28a745'
          }}>
            <i className="fas fa-shield-alt mr-3"></i>
            I. Necesidad de Seguridad y Protección
          </h5>

          {/* Sección de Riesgo de Infección */}
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '20px',
          }}>
            <h6 style={{
              borderBottom: '2px solid #28a745',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              1. Riesgo de Infección - Examen del Pie Diabético
            </h6>

            <Form.Group className="mb-3">
              <Form.Label>¿Ha presentado alguna herida en los pies?</Form.Label>
              <Form.Check
                type="radio"
                label="Sí"
                name="herida"
                checked={seguimiento.riesgoInfeccion.herida === true}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoInfeccion: {
                    ...prev.riesgoInfeccion,
                    herida: true
                  }
                }))}
              />
              <Form.Check
                type="radio"
                label="No"
                name="herida"
                checked={seguimiento.riesgoInfeccion.herida === false}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoInfeccion: {
                    ...prev.riesgoInfeccion,
                    herida: false
                  }
                }))}
              />
            </Form.Group>

            {seguimiento.riesgoInfeccion.herida && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de la herida o úlcera</Form.Label>
                  <Form.Control
                    type="date"
                    value={seguimiento.riesgoInfeccion.fechaHerida || ''}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        fechaHerida: e.target.value
                      }
                    }))}
                    max={new Date().toISOString().split('T')[0]} // Establece la fecha máxima como hoy
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>¿Se encuentra con tratamiento en la actualidad?</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="tratamientoHerida"
                    checked={seguimiento.riesgoInfeccion.tratamientoHerida === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        tratamientoHerida: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="tratamientoHerida"
                    checked={seguimiento.riesgoInfeccion.tratamientoHerida === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        tratamientoHerida: false
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Necesita derivación a Centro de Salud</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="derivacion"
                    checked={seguimiento.riesgoInfeccion.necesitaDerivacion === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        necesitaDerivacion: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="derivacion"
                    checked={seguimiento.riesgoInfeccion.necesitaDerivacion === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        necesitaDerivacion: false
                      }
                    }))}
                  />
                </Form.Group>
              </>
            )}

            <h6>Dolor Neuropático</h6>
            <Form.Group className="mb-3">
              <Form.Label>¿Ha presentado dolor? (parestesias, pérdida de sensibilidad, calambres, hormigueo)</Form.Label>
              <Form.Check
                type="radio"
                label="Sí"
                name="dolorNeuropatico"
                checked={seguimiento.riesgoInfeccion.dolorNeuropatico === true}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoInfeccion: {
                    ...prev.riesgoInfeccion,
                    dolorNeuropatico: true
                  }
                }))}
              />
              <Form.Check
                type="radio"
                label="No"
                name="dolorNeuropatico"
                checked={seguimiento.riesgoInfeccion.dolorNeuropatico === false}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoInfeccion: {
                    ...prev.riesgoInfeccion,
                    dolorNeuropatico: false
                  }
                }))}
              />
            </Form.Group>

            {seguimiento.riesgoInfeccion.dolorNeuropatico && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Grado de intensidad del dolor (1-10)</Form.Label>
                  <Form.Control
                    type="range"
                    min="1"
                    max="10"
                    value={seguimiento.riesgoInfeccion.intensidadDolor}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        intensidadDolor: parseInt(e.target.value)
                      }
                    }))}
                  />
                  <div className="text-center">{seguimiento.riesgoInfeccion.intensidadDolor}</div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>¿Ha realizado alguna intervención para su mejoría?</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="intervencionDolor"
                    checked={seguimiento.riesgoInfeccion.realizoIntervencion === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        realizoIntervencion: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="intervencionDolor"
                    checked={seguimiento.riesgoInfeccion.realizoIntervencion === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoInfeccion: {
                        ...prev.riesgoInfeccion,
                        realizoIntervencion: false
                      }
                    }))}
                  />
                  {seguimiento.riesgoInfeccion.realizoIntervencion && (
                    <Form.Control
                      as="textarea"
                      placeholder="Describa la intervención"
                      value={seguimiento.riesgoInfeccion.intervencionDolor}
                      onChange={(e) => setSeguimiento(prev => ({
                        ...prev,
                        riesgoInfeccion: {
                          ...prev.riesgoInfeccion,
                          intervencionDolor: e.target.value
                        }
                      }))}
                    />
                  )}
                </Form.Group>
              </>
            )}

            {/* Sección de Riesgo de Glicemia */}
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '20px'
            }}>
              <h6 style={{
                borderBottom: '2px solid #28a745',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>
                2. Riesgo de Glicemia
              </h6>

              <Form.Group className="mb-3">
                <Form.Label>¿Ha presentado signos de hipoglicemia (sudoración, temblor, mareos, taquicardia)?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="hipoglicemia"
                  checked={seguimiento.riesgoGlicemia.hipoglicemia === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    riesgoGlicemia: {
                      ...prev.riesgoGlicemia,
                      hipoglicemia: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="hipoglicemia"
                  checked={seguimiento.riesgoGlicemia.hipoglicemia === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    riesgoGlicemia: {
                      ...prev.riesgoGlicemia,
                      hipoglicemia: false
                    }
                  }))}
                />
              </Form.Group>

              {seguimiento.riesgoGlicemia.hipoglicemia && (
                <Form.Group className="mb-3">
                  <Form.Label>¿Realiza alguna intervención al respecto?</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="intervencionHipoglicemia"
                    checked={seguimiento.riesgoGlicemia.realizoIntervencionHipoglicemia === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoGlicemia: {
                        ...prev.riesgoGlicemia,
                        realizoIntervencionHipoglicemia: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="intervencionHipoglicemia"
                    checked={seguimiento.riesgoGlicemia.realizoIntervencionHipoglicemia === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoGlicemia: {
                        ...prev.riesgoGlicemia,
                        realizoIntervencionHipoglicemia: false
                      }
                    }))}
                  />
                  {seguimiento.riesgoGlicemia.realizoIntervencionHipoglicemia && (
                    <Form.Control
                      as="textarea"
                      placeholder="Describa la intervención"
                      value={seguimiento.riesgoGlicemia.intervencionHipoglicemia}
                      onChange={(e) => setSeguimiento(prev => ({
                        ...prev,
                        riesgoGlicemia: {
                          ...prev.riesgoGlicemia,
                          intervencionHipoglicemia: e.target.value
                        }
                      }))}
                    />
                  )}
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>¿Ha presentado signos de hiperglicemia (sed extrema, visión borrosa, náuseas, vómitos, aliento afrutado, dolor abdominal, boca seca)?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="hiperglicemia"
                  checked={seguimiento.riesgoGlicemia.hiperglicemia === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    riesgoGlicemia: {
                      ...prev.riesgoGlicemia,
                      hiperglicemia: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="hiperglicemia"
                  checked={seguimiento.riesgoGlicemia.hiperglicemia === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    riesgoGlicemia: {
                      ...prev.riesgoGlicemia,
                      hiperglicemia: false
                    }
                  }))}
                />
              </Form.Group>

              {seguimiento.riesgoGlicemia.hiperglicemia && (
                <Form.Group className="mb-3">
                  <Form.Label>¿Realiza alguna intervención al respecto?</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="intervencionHiperglicemia"
                    checked={seguimiento.riesgoGlicemia.realizoIntervencionHiperglicemia === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoGlicemia: {
                        ...prev.riesgoGlicemia,
                        realizoIntervencionHiperglicemia: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="intervencionHiperglicemia"
                    checked={seguimiento.riesgoGlicemia.realizoIntervencionHiperglicemia === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      riesgoGlicemia: {
                        ...prev.riesgoGlicemia,
                        realizoIntervencionHiperglicemia: false
                      }
                    }))}
                  />
                  {seguimiento.riesgoGlicemia.realizoIntervencionHiperglicemia && (
                    <Form.Control
                      as="textarea"
                      placeholder="Describa la intervención"
                      value={seguimiento.riesgoGlicemia.intervencionHiperglicemia}
                      onChange={(e) => setSeguimiento(prev => ({
                        ...prev,
                        riesgoGlicemia: {
                          ...prev.riesgoGlicemia,
                          intervencionHiperglicemia: e.target.value
                        }
                      }))}
                    />
                  )}
                </Form.Group>
              )}
            </div>
          </div>
        </div>



        {/* Sección de Riesgo de Glicemia */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '20px'
        }}>
          <div data-pdf-section>
            <h6 style={{
              borderBottom: '2px solid #28a745',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              3. Riesgo de Crisis Hipertensiva
            </h6>
            <Form.Group className="mb-3">
              <Form.Label>¿Ha presentado los siguientes síntomas?</Form.Label>
              <Form.Check
                type="checkbox"
                label="Dolor de pecho intenso"
                checked={seguimiento.riesgoHipertension.dolorPecho}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoHipertension: {
                    ...prev.riesgoHipertension,
                    dolorPecho: !prev.riesgoHipertension.dolorPecho
                  }
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Dolor de cabeza intenso acompañado de confusión y visión borrosa"
                checked={seguimiento.riesgoHipertension.dolorCabeza}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoHipertension: {
                    ...prev.riesgoHipertension,
                    dolorCabeza: !prev.riesgoHipertension.dolorCabeza
                  }
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Zumbido de oídos"
                checked={seguimiento.riesgoHipertension.zumbidoOidos}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoHipertension: {
                    ...prev.riesgoHipertension,
                    zumbidoOidos: !prev.riesgoHipertension.zumbidoOidos
                  }
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Náuseas y vómitos"
                checked={seguimiento.riesgoHipertension.nauseaVomitos}
                onChange={() => setSeguimiento(prev => ({
                  ...prev,
                  riesgoHipertension: {
                    ...prev.riesgoHipertension,
                    nauseaVomitos: !prev.riesgoHipertension.nauseaVomitos
                  }
                }))}
              />
            </Form.Group>

            <h6>Recomendaciones:</h6>
            <ul>
              <li>Recuerde tomar su medicamento para controlar la presión arterial en la dosis y horarios correctos según la indicación médica.</li>
              <li>Reduzca el consumo de sal.</li>
              <li>Consuma una alimentación saludable, según indicación de nutricionista.</li>
              <li>Evite el consumo de alcohol y tabaco.</li>
              <li>Asista a sus controles regularmente según citación.</li>
            </ul>

            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '20px'
            }}>
              <h6 style={{
                borderBottom: '2px solid #28a745',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>
                4. Adherencia al Tratamiento Farmacológico - Test Morisky-Green
              </h6>
              <Form.Group className="mb-3">
                <Form.Label>1. ¿Se olvida alguna vez de tomar el medicamento?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="olvidoMedicamento"
                  checked={seguimiento.adherencia.olvido === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      olvido: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="olvidoMedicamento"
                  checked={seguimiento.adherencia.olvido === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      olvido: false
                    }
                  }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>2. ¿Toma la medicación a la hora indicada?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="horaIndicada"
                  checked={seguimiento.adherencia.horaIndicada === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      horaIndicada: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="horaIndicada"
                  checked={seguimiento.adherencia.horaIndicada === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      horaIndicada: false
                    }
                  }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>3. Cuando se encuentra bien, ¿deja de tomar el remedio?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="dejaRemedio"
                  checked={seguimiento.adherencia.dejaRemedio === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      dejaRemedio: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="dejaRemedio"
                  checked={seguimiento.adherencia.dejaRemedio === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      dejaRemedio: false
                    }
                  }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>4. Si alguna vez se siente mal, ¿deja de tomar el remedio?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="dejaRemedioMal"
                  checked={seguimiento.adherencia.dejaRemedioMal === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      dejaRemedioMal: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="dejaRemedioMal"
                  checked={seguimiento.adherencia.dejaRemedioMal === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    adherencia: {
                      ...prev.adherencia,
                      dejaRemedioMal: false
                    }
                  }))}
                />
              </Form.Group>

              <Alert
                variant={
                  seguimiento.adherencia.olvido +
                    seguimiento.adherencia.horaIndicada +
                    (seguimiento.adherencia.dejaRemedio ? 0 : 1) +
                    (seguimiento.adherencia.dejaRemedioMal ? 0 : 1) >= 3
                    ? 'success'
                    : 'warning'
                }
              >
                <strong>Adherencia al Tratamiento:</strong> {
                  seguimiento.adherencia.olvido +
                    seguimiento.adherencia.horaIndicada +
                    (seguimiento.adherencia.dejaRemedio ? 0 : 1) +
                    (seguimiento.adherencia.dejaRemedioMal ? 0 : 1) >= 3
                    ? 'Sí'
                    : 'No'
                }
              </Alert>
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                marginBottom: '20px'
              }}>
                <h6 style={{
                  borderBottom: '2px solid #28a745',
                  paddingBottom: '10px',
                  marginBottom: '20px'
                }}>
                  5. Efectos Secundarios a los Medicamentos
                </h6>
                <Form.Group className="mb-3">
                  <Form.Label>¿Alguno de los medicamentos que usted toma le produce algún malestar físico? (mareos, tos, náuseas, diarrea, etc.)</Form.Label>
                  <Form.Control
                    type="text"
                    value={seguimiento.efectosSecundarios.malestar || ''}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      efectosSecundarios: {
                        ...prev.efectosSecundarios,
                        malestar: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>¿Realiza alguna intervención para solucionar?</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name="intervencionEfectos"
                    checked={seguimiento.efectosSecundarios.realizaIntervencion === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      efectosSecundarios: {
                        ...prev.efectosSecundarios,
                        realizaIntervencion: true
                      }
                    }))}
                  />
                  < Form.Check
                    type="radio"
                    label="No"
                    name="intervencionEfectos"
                    checked={seguimiento.efectosSecundarios.realizaIntervencion === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      efectosSecundarios: {
                        ...prev.efectosSecundarios,
                        realizaIntervencion: false
                      }
                    }))}
                  />
                  {seguimiento.efectosSecundarios.realizaIntervencion && (
                    <Form.Control
                      as="textarea"
                      placeholder="Describa la intervención"
                      value={seguimiento.efectosSecundarios.intervencion || ''}
                      onChange={(e) => setSeguimiento(prev => ({
                        ...prev,
                        efectosSecundarios: {
                          ...prev.efectosSecundarios,
                          intervencion: e.target.value
                        }
                      }))}
                    />
                  )}
                </Form.Group>
              </div>
            </div>
          </div>
        </div>

        <div data-pdf-section>
          {/* Sección de Autoeficacia */}
          <div style={{
            ...sectionStyles,
            // Añade algunos ajustes para móviles
            padding: '15px',
            '@media (max-width: 768px)': {
              padding: '10px'
            }
          }}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#17a2b8',
              // Ajustes para texto en móviles
              fontSize: 'calc(1rem + 0.5vw)', // Tamaño de fuente responsivo
              padding: '10px',
              textAlign: 'center'
            }}>
              <i className="fas fa-chart-line mr-3"></i>
              Evaluación de Autoeficacia en Diabetes Tipo 2
            </h5>

            <p className="text-muted mb-4 text-center" style={{
              // Ajustes para párrafo en móviles
              fontSize: 'calc(0.8rem + 0.3vw)'
            }}>
              En las siguientes preguntas nos gustaría saber qué piensa Ud. de sus habilidades para controlar su enfermedad.
            </p>

            {preguntasAutoeficacia.map((pregunta, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label style={{
                  // Tamaño de fuente responsivo para etiquetas
                  fontSize: 'calc(0.9rem + 0.2vw)'
                }}>{pregunta.label}</Form.Label>
                <div className="d-flex flex-column flex-md-row align-items-center">
                  {/* Etiqueta para móviles */}
                  <span className="mb-2 mb-md-0 mr-md-2 text-muted" style={{
                    fontSize: 'calc(0.7rem + 0.2vw)'
                  }}>
                    Muy inseguro(a)
                  </span>
                  <div className="flex-grow-1 mx-2">
                    <Form.Control
                      type="range"
                      min="1"
                      max="10"
                      value={seguimiento.autoeficacia[pregunta.key] || 1}
                      onChange={(e) => setSeguimiento(prev => ({
                        ...prev,
                        autoeficacia: {
                          ...prev.autoeficacia,
                          [pregunta.key]: parseInt(e.target.value)
                        }
                      }))}
                      style={{
                        // Asegurar que el slider sea responsivo
                        width: '100%',
                        height: '10px'
                      }}
                    />
                  </div>
                  {/* Etiqueta para móviles */}
                  <span className="mt-2 mt-md-0 ml-md-2 text-muted" style={{
                    fontSize: 'calc(0.7rem + 0.2vw)'
                  }}>
                    Seguro(a)
                  </span>
                </div>

                {/* Valor actual centrado y con tamaño responsivo */}
                <div className="text-center mt-2" style={{
                  fontSize: 'calc(0.9rem + 0.2vw)',
                  fontWeight: 'bold'
                }}>
                  {seguimiento.autoeficacia[pregunta.key]}
                </div>
              </Form.Group>
            ))}
          </div>

          <Alert variant="info" style={{ borderRadius: '8px', marginTop: '20px' }}>
            <p>
              Para finalizar este llamado, recuerde registrar todos los síntomas, dudas y/o comentarios que presente.
              Además, respete las indicaciones de su médico y del equipo de salud.
              Muchas gracias por su colaboración, ¡Hasta pronto!
            </p>
          </Alert>

          {/* Sección de Comentarios */}
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '20px',
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                as="textarea"
                value={seguimiento.comentario_primer_llamado}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  comentario_primer_llamado: e.target.value
                }))}
              />
            </Form.Group>
          </div>
        </div>
      </div>
    );
  };

  // Funciones de utilidad
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    try {
      // Remover la parte del timestamp si existe
      const fecha = fechaString.split('T')[0];
      const [year, month, day] = fecha.split('-');
      return `${day}-${month}-${year}`;
    } catch {
      return 'Formato inválido';
    }
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const exportarPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'legal'
    });

    // Almacenar los textareas originales
    const originalTextareas = [];
    const tempDivs = [];

    // Estilo para la tabla de información
    const addInfoTable = () => {
      pdf.setFontSize(12);
      pdf.setTextColor(33, 33, 33);

      // Configuración de la tabla
      const startX = 20;
      let startY = 30;
      const cellWidth = 80;
      const cellHeight = 10;
      const lineHeight = 7;

      // Título
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Información del Paciente', startX, 20);
      pdf.setFontSize(12);

      // Datos del paciente
      const pacienteInfo = [
        { label: 'Nombre', value: `${paciente.nombres} ${paciente.apellidos}` },
        { label: 'RUT', value: paciente.rut },
        // { label: 'Fecha de Nacimiento', value: formatFecha(paciente.fecha_nacimiento) },
        { label: 'Edad', value: String(paciente.edad) }, // Asegúrate de que sea un string
        { label: 'Teléfono Principal', value: paciente.telefono_principal || 'No registrado' },
        { label: 'Teléfono Secundario', value: paciente.telefono_secundario || 'No registrado' }
      ];

      // Dibujar tabla
      pacienteInfo.forEach((item, index) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(startX, startY + index * cellHeight, cellWidth, cellHeight, 'F');
        pdf.text(item.label, startX + 2, startY + index * cellHeight + lineHeight);

        pdf.setFillColor(255, 255, 255);
        pdf.rect(startX + cellWidth, startY + index * cellHeight, cellWidth, cellHeight, 'F');
        pdf.text(String(item.value), startX + cellWidth + 2, startY + index * cellHeight + lineHeight); // Asegúrate de que sea un string
      });
    };

    // Agregar información del paciente
    addInfoTable();
    pdf.addPage();

    const input = document.getElementById('exportable-content');
    const sections = input.querySelectorAll('[data-pdf-section]');

    try {
      for (let pageIndex = 0; pageIndex < sections.length; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const section = sections[pageIndex];

        // Modificar textareas antes de capturar
        const textareas = section.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          // Guardar referencia al textarea original
          originalTextareas.push({
            element: textarea,
            parent: textarea.parentNode,
            value: textarea.value
          });

          // Crear un div temporal que reemplace el textarea
          const tempDiv = document.createElement('div');
          tempDiv.style.width = textarea.style.width || '100%';
          tempDiv.style.border = textarea.style.border;
          tempDiv.style.padding = textarea.style.padding;
          tempDiv.style.whiteSpace = 'pre-wrap';
          tempDiv.style.wordBreak = 'break-word';
          tempDiv.textContent = textarea.value;

          // Almacenar referencia al div temporal
          tempDivs.push({
            div: tempDiv,
            parent: textarea.parentNode
          });

          // Reemplazar textarea con div
          textarea.parentNode.replaceChild(tempDiv, textarea);
        });

        const sectionCanvas = await html2canvas(section, {
          scale: window.devicePixelRatio,
          useCORS: true,
          logging: false,
          width: section.scrollWidth,
          height: section.scrollHeight,
          allowTaint: true,
          backgroundColor: '#ffffff',
          imageTimeout: 0
        });

        const sectionImgData = sectionCanvas.toDataURL('image/jpeg', 1.0);

        const pageWidth = pdf.internal.pageSize.width;
        const imgWidth = pageWidth - 80;
        const imgHeight = (sectionCanvas.height * imgWidth) / sectionCanvas.width;

        const xPosition = (pageWidth - imgWidth) / 2;
        const yPosition = 15;

        pdf.addImage(
          sectionImgData,
          'JPEG',
          xPosition,
          yPosition,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save(`${paciente.rut}_${getFormattedDate()}_seguimiento.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('Hubo un problema al exportar el PDF.');
    } finally {
      // Restaurar textareas y eliminar divs temporales
      originalTextareas.forEach(({ element, parent, value }) => {
        // Recrear el textarea original
        const restoredTextarea = document.createElement('textarea');
        restoredTextarea.className = element.className;
        restoredTextarea.style.cssText = element.style.cssText;
        restoredTextarea.value = value;

        // Copiar todos los event listeners y atributos
        for (let attr of element.attributes) {
          restoredTextarea.setAttribute(attr.name, attr.value);
        }

        // Restaurar evento onChange
        restoredTextarea.addEventListener('change', (e) => {
          setSeguimiento(prev => ({
            ...prev,
            [restoredTextarea.name]: e.target.value
          }));
        });

        // Reemplazar el div temporal con el textarea
        parent.replaceChild(restoredTextarea, parent.firstChild);
      });

      // Eliminar cualquier div temporal restante
      tempDivs.forEach(({ div, parent }) => {
        if (parent.contains(div)) {
          parent.removeChild(div);
        }
      });

      // Limpiar los arrays
      originalTextareas.length = 0;
      tempDivs.length = 0;
    }
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {renderContent()}
          <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-4">
            <Button type="submit" variant="success" className="w-100 w-md-auto" disabled={disabled}>Ingresar</Button>
            {/* Botón de Actualizar con lógica de editabilidad */}
            {seguimiento.id && esEditable && (
              <Button
                variant="primary"
                className="w-100 w-md-auto"
                onClick={() => {
                  guardarSeguimiento(1, true);
                }}
              >
                Actualizar
              </Button>
            )}

            {seguimiento.riesgoInfeccion.herida || seguimiento.efectosSecundarios.malestar ? !isMobile && (
              <Button variant="warning" className="w-100 w-md-auto" onClick={exportarPDF}>Exportar PDF</Button>
            ) : null}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PrimerLlamado;