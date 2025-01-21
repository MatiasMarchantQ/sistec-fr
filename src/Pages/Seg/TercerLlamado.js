import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
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

const responsiveFormGroupStyle = {
  marginBottom: '1.5rem',
  '@media (max-width: 768px)': {
    marginBottom: '1rem'
  }
};

const responsiveOptionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '10px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    gap: '8px'
  }
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
            <h5 style={headingStyles}>
              <i className="fas fa-brain me-2"></i>
              <span style={{ flex: 1, wordBreak: 'break-word' }}>
                V. Necesidad de Estima, Autoestima y Realización
              </span>
            </h5>

            <div className="bg-white p-3 rounded">
              <h6 className="border-bottom border-primary pb-2 mb-4">
                Detección de Síntomas Depresivos (PHQ-9)
              </h6>

              <p className="text-muted mb-4">
                Durante las dos últimas semanas, ¿con qué frecuencia le han molestado los siguientes problemas?
              </p>

              {preguntasDepresion.map((pregunta, index) => (
                <Form.Group key={index} style={responsiveFormGroupStyle}>
                  <Form.Label className="d-block mb-2">{index + 1}. {pregunta}</Form.Label>
                  <div style={responsiveOptionsStyle}>
                    {opcionesFrecuencia.map((opcion) => (
                      <Form.Check
                        key={opcion.value}
                        type="radio"
                        id={`depresion-${index}-${opcion.value}`}
                        name={`depresion-${index}`}
                        label={opcion.label}
                        checked={puntajesDepresion[index] === opcion.value}
                        onChange={() => handleCambioPuntajeDepresion(index, opcion.value)}
                        className="mb-2 mb-md-0"
                      />
                    ))}
                  </div>
                </Form.Group>
              ))}

              <Form.Group style={responsiveFormGroupStyle}>
                <Form.Label className="d-block mb-2">
                  Si se identificó con algún problema, ¿cuán difícil se le ha hecho cumplir con su trabajo, 
                  atender su casa, o relacionarse con otras personas?
                </Form.Label>
                <div style={responsiveOptionsStyle}>
                  {nivelesDificultad.map((nivel, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      id={`dificultad-${index}`}
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
                      className="mb-2 mb-md-0"
                    />
                  ))}
                </div>
              </Form.Group>

              <Alert
                variant={
                  puntajeTotal >= 10 ? "danger" :
                    puntajeTotal >= 5 ? "warning" : "success"
                }
                className="mt-4"
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                  <div>
                    <strong>Puntuación Total: {puntajeTotal}</strong>
                    <p className="mb-0">Categoría: {obtenerCategoriaDepresion(puntajeTotal)}</p>
                  </div>
                  {puntajeTotal >= 10 && (
                    <div className="mt-2 mt-md-0 bg-danger text-white p-2 rounded">
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

                <div className="mt-4 bg-light p-3 rounded">
                <Form.Group className="mb-3">
                  <Form.Label>¿Qué otro síntoma o molestia ha presentado?</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={seguimiento.otrosSintomas}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      otrosSintomas: e.target.value
                    }))}
                    className="w-100"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>¿Cómo lo ha manejado o superado?</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={seguimiento.manejoSintomas}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      manejoSintomas: e.target.value
                    }))}
                    className="w-100"
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </div>

        <div data-pdf-section>
          <div style={sectionStyles}>
            <h5 style={{...headingStyles, backgroundColor: '#17a2b8'}}>
              <i className="fas fa-chart-line me-2"></i>
              <span style={{ flex: 1, wordBreak: 'break-word' }}>
                Evaluación de Autoeficacia en Diabetes Tipo 2
              </span>
            </h5>

            <p className="text-muted mb-4">
              En las siguientes preguntas nos gustaría saber qué piensa Ud. de sus habilidades para controlar su enfermedad.
            </p>

            {preguntasAutoeficacia.map((pregunta, index) => (
              <Form.Group key={index} className="mb-4">
                <Form.Label className="d-block mb-2">{pregunta.label}</Form.Label>
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
                  <span className="text-nowrap">Muy inseguro(a)</span>
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
                    className="mx-2 flex-grow-1"
                  />
                  <span className="text-nowrap">Seguro(a)</span>
                </div>
                <div className="text-center mt-1">
                  {seguimiento.autoeficacia[pregunta.key]}
                </div>
              </Form.Group>
            ))}
          </div>

          <Alert variant="info" className="my-4">
            <p className="mb-0">
              Para finalizar este llamado, recuerde registrar todos los síntomas, dudas y/o comentarios que presente.
              Además, respete las indicaciones de su médico y del equipo de salud.
              Muchas gracias por su colaboración, ¡Hasta pronto!
            </p>
          </Alert>

          <div className="bg-white p-3 rounded shadow-sm">
            <Form.Group className="mb-3">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={seguimiento.comentario_tercer_llamado}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  comentario_tercer_llamado: e.target.value
                }))}
                className="w-100"
              />
            </Form.Group>
          </div>
        </div>
      </div>
      </div>
    );
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
      // Detectar si es móvil
      const isMobile = window.innerWidth <= 768;

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
        const imgWidth = pageWidth - (isMobile ? 180 : 40); // Ajustar el ancho de la imagen según el margen
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
          <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-4">
            <Button 
              type="submit" 
              variant="success"
              disabled={disabled}
              className="w-100 w-md-auto"
            >
              Ingresar
            </Button>
            {seguimiento.id && esEditable && (
              <Button
                variant="primary"
                onClick={() => guardarSeguimiento(3, true)}
                className="w-100 w-md-auto"
              >
                Actualizar
              </Button>
            )}
            {puntajesDepresion && !isMobile && (
              <Button 
                variant="warning" 
                onClick={exportarPDF}
                className="w-100 w-md-auto"
              >
                Exportar PDF
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TercerLlamado;