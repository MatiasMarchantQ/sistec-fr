import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const sectionStyles = {
  backgroundColor: '#f8f9fa', // Color de fondo suave
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headingStyles = {
  backgroundColor: '#007bff', // Color de fondo para los encabezados
  color: 'white',
  padding: '10px 15px',
  borderRadius: '6px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center'
};

const TercerLlamado = ({
  seguimiento,
  setSeguimiento,
  onComplete,
  disabled,
  guardarSeguimiento,
  paciente
}) => {
  const { user } = useAuth();
  const [puntajesDepresion, setPuntajesDepresion] = useState(Array(9).fill(0));
  const [nivelDificultad, setNivelDificultad] = useState(0);

  const preguntasDepresion = [
    "Tener poco interés o placer en hacer las cosas",
    "Sentirse desanimado/a, deprimido/a, o sin esperanza",
    "Con problemas en dormirse o en mantenerse dormido/a, o en dormir demasiado",
    "Sentirse cansado/a o tener poca energía",
    "Tener poco apetito o comer en exceso",
    "Sentir falta de amor propio- o que sea un fracaso que decepcionara a si mismo/a a su familia",
    "Tener dificultad para concentrarse en cosas tales como leer el periódico o mirar televisión",
    "Se mueve o habla tan lentamente que otra gente podría dar cuenta- o se lo contrario, está tan agitado/a o inquieto/a que se mueve mucho más de lo acostumbrado",
    "Se le han ocurrido pensamientos de que sería mejor estar muerto/a o de que haría daño de alguna manera"
  ];

  const opcionesFrecuencia = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Varios días" },
    { value: 2, label: "Más de la mitad de los días" },
    { value: 3, label: "Casi todos los días" }
  ];

  const nivelesDificultad = [
    "Nada en absoluto",
    "Algo difícil",
    "Muy difícil",
    "Extremadamente difícil"
  ];

  const handleCambioPuntajeDepresion = (indice, valor) => {
    const nuevosPuntajes = [...puntajesDepresion];
    nuevosPuntajes[indice] = valor;
    setPuntajesDepresion(nuevosPuntajes);

    const puntajeTotal = nuevosPuntajes.reduce((a, b) => a + b, 0);

    setSeguimiento(prev => ({
      ...prev,
      sintomasDepresivos: {
        puntajes: nuevosPuntajes,
        puntajeTotal: puntajeTotal,
        nivelDificultad: nivelDificultad || prev.sintomasDepresivos?.nivelDificultad
      }
    }));
  };

  const puntajeTotal = puntajesDepresion.reduce((a, b) => a + b, 0);

  const obtenerCategoriaDepresion = (puntaje) => {
    if (puntaje >= 0 && puntaje <= 4) return "Mínimo";
    if (puntaje >= 5 && puntaje <= 9) return "Leve";
    if (puntaje >= 10 && puntaje <= 14) return "Moderado";
    if (puntaje >= 15 && puntaje <= 19) return "Moderado a grave";
    if (puntaje >= 20 && puntaje <= 27) return "Grave";
    return "No clasificado";
  };

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

  useEffect(() => {
    // Actualizar puntajes y nivel de dificultad cuando el seguimiento cambie
    if (seguimiento.sintomasDepresivos) {
      setPuntajesDepresion(seguimiento.sintomasDepresivos.puntajes || Array(9).fill(0));
      setNivelDificultad(seguimiento.sintomasDepresivos.nivelDificultad || 0);
    }
  }, [seguimiento]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    const validaciones = [
      {
        condicion: puntajesDepresion.every(puntaje => puntaje === 0),
        mensaje: 'Debe responder al cuestionario de síntomas depresivos'
      },
      {
        condicion: nivelDificultad === 0,
        mensaje: 'Debe indicar el nivel de dificultad'
      },
      {
        condicion: !seguimiento.otrosSintomas,
        mensaje: 'Debe indicar otros síntomas o molestias (si no tiene, escriba "Ninguno")'
      }
    ];

    const errorValidacion = validaciones.find(val => val.condicion);

    if (errorValidacion) {
      toast.error(errorValidacion.mensaje);
      return;
    }

    // Crear un objeto con todos los datos necesarios
    const datosActualizados = {
      ...seguimiento,
      sintomasDepresivos: {
        puntajes: puntajesDepresion,
        puntajeTotal: puntajesDepresion.reduce((a, b) => a + b, 0),
        nivelDificultad: nivelDificultad
      },
      otrosSintomas: seguimiento.otrosSintomas || '',
      manejoSintomas: seguimiento.manejoSintomas || '',
      comentarios: seguimiento.comentarios || '',
      autoeficacia: {
        comerCada4Horas: seguimiento.autoeficacia.comerCada4Horas || 1,
        continuarDieta: seguimiento.autoeficacia.continuarDieta || 1,
        escogerAlimentos: seguimiento.autoeficacia.escogerAlimentos || 1,
        hacerEjercicio: seguimiento.autoeficacia.hacerEjercicio || 1,
        prevenirBajaAzucar: seguimiento.autoeficacia.prevenirBajaAzucar || 1,
        saberQueHacer: seguimiento.autoeficacia.saberQueHacer || 1,
        evaluarCambios: seguimiento.autoeficacia.evaluarCambios || 1,
        controlarDiabetes: seguimiento.autoeficacia.controlarDiabetes || 1
      }
    };

    // Actualizar el estado con todos los datos
    setSeguimiento(datosActualizados);

    // Llamar a onComplete en el siguiente ciclo de renderizado
    setTimeout(() => {
      onComplete();
    }, 0);
  };

  const esEditable = useMemo(() => {
    if (!user) return false; // Verifica que user no sea null

    // Si es un estudiante
    if (user.rol_id === 3) {
      // Solo puede editar si el seguimiento fue ingresado por él mismo
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

  const renderContent = () => {
    return (
      <div id="exportable-content3">
        <div data-pdf-section>
          <div style={sectionStyles}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#007bff' // Azul para primera sección
            }}>
              <i className="fas fa-brain mr-3"></i>
              V. Necesidad de Estima, Autoestima y Realización
            </h5>

            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h6 style={{
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>
                Detección de Síntomas Depresivos (PHQ-9)
              </h6>

              <p className="text-muted mb-4">
                Durante las dos últimas semanas, ¿con qué frecuencia le han molestado los siguientes problemas?
              </p>

              {preguntasDepresion.map((pregunta, index) => (
                <Form.Group key={index} className="mb-3">
                  <Form.Label>{index + 1}. {pregunta}</Form.Label>
                  <div className="d-flex justify-content-between">
                    {opcionesFrecuencia.map((opcion) => (
                      <Form.Check
                        key={opcion.value}
                        type="radio"
                        name={`depresion-${index}`}
                        label={opcion.label}
                        checked={puntajesDepresion[index] === opcion.value}
                        onChange={() => handleCambioPuntajeDepresion(index, opcion.value)}
                      />
                    ))}
                  </div>
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>Si se identificó con algún problema, ¿cuán difícil se le ha hecho cumplir con su trabajo, atender su casa, o relacionarse con otras personas?</Form.Label>
                <div className="d-flex justify-content-between">
                  {nivelesDificultad.map((nivel, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      name="nivelDificultad"
                      label={nivel}
                      checked={nivelDificultad === index}
                      onChange={() => {
                        setNivelDificultad(index);
                        setSeguimiento(prev => ({
                          ...prev,
                          sintomasDepresivos: {
                            ...prev.sintomasDepresivos,
                            nivelDificultad: index
                          }
                        }));
                      }}
                    />
                  ))}
                </div>
              </Form.Group>

              {/* Alerta de puntuación con estilo mejorado */}
              <Alert
                variant={
                  puntajeTotal >= 10 ? "danger" :
                    puntajeTotal >= 5 ? "warning" : "success"
                }
                style={{
                  marginTop: '20px',
                  borderRadius: '8px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Puntuación Total: {puntajeTotal}</strong>
                    <p className="mb-0">Categoría: {obtenerCategoriaDepresion(puntajeTotal)}</p>
                  </div>
                  {puntajeTotal >= 10 && (
                    <div
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px'
                      }}
                    >
                      Derivar a médico del CESFAM
                    </div>
                  )}
                </div>
              </Alert>


              <h6>Recomendaciones:</h6>
              <ul>
                <li>Expresar los sentimientos a un amigo, familiar, sacerdote, pastor entre otros.</li>
                <li>No guardar las emociones o pensamientos, sólo ocasionará tristeza y soledad.</li>
                <li>Unirse a grupos de apoyo, permitirá encontrarse con otras personas que viven situaciones similares.</li>
                <li>Pedir y aceptar ayuda psicológica si lo considera necesario.</li>
                <li>Realizar actividades recreativas saludables que generen placer.</li>
                <li>Continuar con la vida lo más normal posible, no aislarse.</li>
                <li>No aislarse de amistades y familias.</li>
              </ul>


              {/* Sección de Otros Síntomas */}
              <div style={{
                ...sectionStyles,
                backgroundColor: '#e9ecef',
                marginTop: '20px'
              }}>
                <h6 style={{
                  ...headingStyles,
                  backgroundColor: '#28a745' // Verde para esta sección
                }}>
                  <i className="fas fa-notes-medical mr-3"></i>
                  Información Adicional de Síntomas
                </h6>

                <Form.Group className="mb-3">
                  <Form.Label>¿Qué otro síntoma o molestia ha presentado?</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={seguimiento.otrosSintomas}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      otrosSintomas: e.target.value
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>¿Cómo lo ha manejado o superado?</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={seguimiento.manejoSintomas}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      manejoSintomas: e.target.value
                    }))}
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </div>

        <div data-pdf-section>
          {/* Sección de Autoeficacia */}
          <div style={sectionStyles}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#17a2b8' // Cyan para esta sección
            }}>
              <i className="fas fa-chart-line mr-3"></i>
              Evaluación de Autoeficacia en Diabetes Tipo 2
            </h5>

            <p className="text-muted mb-4">
              En las siguientes preguntas nos gustaría saber qué piensa Ud. de sus habilidades para controlar su enfermedad.
            </p>

            {preguntasAutoeficacia.map((pregunta, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>{pregunta.label}</Form.Label>
                <div className="d-flex align-items-center">
                  <span className="mr-2">Muy inseguro(a)</span>
                  <Form.Control
                    type="range"
                    min="1"
                    max="10"
                    value={seguimiento.autoeficacia[pregunta.key]}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      autoeficacia: {
                        ...prev.autoeficacia,
                        [pregunta.key]: parseInt(e.target.value)
                      }
                    }))}
                  />
                  <span className="ml-2">Seguro(a)</span>
                </div>
                <div className="text-center">{seguimiento.autoeficacia[pregunta.key]}</div>
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
                style={{
                  width: '100%',  // Ocupa todo el ancho disponible
                  resize: 'vertical', // Permite redimensionar verticalmente
                  whiteSpace: 'pre-wrap', // Respeta saltos de línea
                  wordWrap: 'break-word' // Rompe palabras largas si es necesario
                }}
                value={seguimiento.comentario_tercer_llamado}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  comentario_tercer_llamado: e.target.value
                }))}
                rows={4} // Número inicial de filas
              />
            </Form.Group>
          </div>
        </div>
      </div>
    )
  };

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
        { label: 'Fecha de Nacimiento', value: formatFecha(paciente.fecha_nacimiento) },
        { label: 'Edad', value: String(paciente.edad) },
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
        pdf.text(String(item.value), startX + cellWidth + 2, startY + index * cellHeight + lineHeight);
      });
    };

    // Agregar información del paciente
    addInfoTable();
    pdf.addPage();

    const input = document.getElementById('exportable-content3');
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
        const imgWidth = pageWidth - 90;
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

      pdf.save(`${paciente.rut}_${getFormattedDate()}_seguimiento_3.pdf`);
    } catch (error) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button type="submit" disabled={disabled}>Guardar</Button>
            {seguimiento.id && esEditable && (
              <Button
                variant="success"
                onClick={() => {
                  guardarSeguimiento(3, true);
                }}
              >
                Actualizar
              </Button>
            )}
            {puntajesDepresion && (
              <Button variant="primary" onClick={exportarPDF}>Exportar PDF</Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TercerLlamado;