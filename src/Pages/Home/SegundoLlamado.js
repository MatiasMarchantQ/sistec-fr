import React, { useMemo } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const sectionStyles = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headingStyles = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px 15px',
  borderRadius: '6px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center'
};

const SegundoLlamado = ({
  seguimiento,
  setSeguimiento,
  onComplete,
  disabled,
  guardarSeguimiento,
  paciente
}) => {
  const { user } = useAuth();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    const validaciones = [
      {
        condicion: seguimiento.nutricion.comidasDia === 0,
        mensaje: 'Debe indicar el número de comidas al día'
      },
      {
        condicion: !seguimiento.nutricion.comidas.desayuno,
        mensaje: 'Debe describir su desayuno'
      },
      {
        condicion: seguimiento.actividadFisica.realiza === undefined,
        mensaje: 'Debe indicar si realiza actividad física'
      },
      {
        condicion: seguimiento.actividadFisica.realiza && !seguimiento.actividadFisica.tipo,
        mensaje: 'Debe especificar el tipo de actividad física'
      },
      {
        condicion: seguimiento.eliminacion.poliuria === undefined,
        mensaje: 'Debe indicar si ha presentado aumento en la frecuencia de micción'
      }
    ];

    const errorValidacion = validaciones.find(val => val.condicion);

    if (errorValidacion) {
      toast.error(errorValidacion.mensaje);
      return;
    }

    // Si pasa validaciones, llamar a la función de completar
    onComplete();
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

    const input = document.getElementById('exportable-content2');
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

      pdf.save(`${paciente.rut}_${getFormattedDate()}_seguimiento_2.pdf`);
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

  const renderContent = () => {
    return (
      <div id="exportable-content2">
        <div data-pdf-section>
          {/* Sección de Nutrición */}
          <div style={sectionStyles}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#28a745' // Verde para nutrición
            }}>
              <i className="fas fa-utensils mr-3"></i>
              III. Necesidad de Nutrición, Agua y Electrolíticos
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>1. ¿Cuántas comidas consume al día?</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={seguimiento.nutricion.comidasDia}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  nutricion: {
                    ...prev.nutricion,
                    comidasDia: parseInt(e.target.value)
                  }
                }))}
              />
            </Form.Group>

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
                2. Habitualmente, ¿Qué consume en cada comida?
              </h6>

              {['Desayuno', 'Almuerzo', 'Once', 'Cena'].map((comida) => (
                <Form.Group key={comida} className="mb-3">
                  <Form.Label>{comida}</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder={`Describa su ${comida.toLowerCase()} habitual`}
                    value={seguimiento.nutricion.comidas[comida.toLowerCase()]}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      nutricion: {
                        ...prev.nutricion,
                        comidas: {
                          ...prev.nutricion.comidas,
                          [comida.toLowerCase()]: e.target.value
                        }
                      }
                    }))}
                  />
                </Form.Group>
              ))}
            </div>

            <Form.Group className="mb-3">
              <Form.Label>3. Frecuencia de consumo de alimentos no recomendados</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Ej: chocolates, pan amasado, bebidas, completos, pizza, papas fritas, etc."
                value={seguimiento.nutricion.alimentosNoRecomendados}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  nutricion: {
                    ...prev.nutricion,
                    alimentosNoRecomendados: e.target.value
                  }
                }))}
              />
            </Form.Group>

            <Alert variant="info" style={{ borderRadius: '8px' }}>
              <h6>Recomendaciones Nutricionales:</h6>
              <ul>
                {[
                  "Limitar alimentos con altos contenidos de azúcar y sal.",
                  "Comer porciones pequeñas a lo largo del día.",
                  "Limitar el consumo de hidratos de carbono.",
                  "Consumir una gran variedad de alimentos integrales, frutas y vegetales.",
                  "Limite el consumo de alimentos ricos en grasa y frituras.",
                  "Intente no consumir alcohol.",
                  "Consuma un plato equilibrado de nutrientes.",
                  "Debe evitar consumir comida 'chatarra' alto en azúcar y grasas saturadas."
                ].map((recomendacion, index) => (
                  <li key={index}>{recomendacion}</li>
                ))}
              </ul>
            </Alert>
          </div>

          {/* Sección de Actividad Física */}
          <div style={sectionStyles}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#17a2b8' // Cyan para actividad física
            }}>
              <i className="fas fa-running mr-3"></i>
              IV. Necesidad de Actividad y Reposo
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>¿Realiza actividad física?</Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="radio"
                  label="Sí"
                  name="actividadFisica"
                  className="mr-3"
                  checked={seguimiento.actividadFisica.realiza === true}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    actividadFisica: {
                      ...prev.actividadFisica,
                      realiza: true
                    }
                  }))}
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="actividadFisica"
                  checked={seguimiento.actividadFisica.realiza === false}
                  onChange={() => setSeguimiento(prev => ({
                    ...prev,
                    actividadFisica: {
                      ...prev.actividadFisica,
                      realiza: false
                    }
                  }))}
                />
              </div>
            </Form.Group>

            {seguimiento.actividadFisica.realiza && (
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <Form.Group className="mb-3">
                  <Form.Label>¿Qué actividad realiza?</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Especifique su actividad física"
                    value={seguimiento.actividadFisica.tipo}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      actividadFisica: {
                        ...prev.actividadFisica,
                        tipo: e.target.value
                      }
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Frecuencia</Form.Label>
                  <Form.Select
                    value={seguimiento.actividadFisica.frecuencia}
                    onChange={(e) => setSeguimiento(prev => ({
                      ...prev,
                      actividadFisica: {
                        ...prev.actividaFisica,
                        frecuencia: e.target.value
                      }
                    }))}
                  >
                    <option value="">Seleccione</option>
                    <option value="1 vez por semana">1 vez por semana</option>
                    <option value="1 vez al mes">1 vez al mes</option>
                    <option value="2-3 veces a la semana">2-3 veces a la semana</option>
                    <option value="1 vez por día">1 vez por día</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </div>
        </div>

        <div data-pdf-section>
          {/* Sección de Eliminación */}
          <div style={sectionStyles}>
            <h5 style={{
              ...headingStyles,
              backgroundColor: '#dc3545' // Rojo para eliminación
            }}>
              <i className="fas fa-toilet-paper mr-3"></i>
              II. Necesidad de Eliminación
            </h5>

            {[
              { label: "¿Ha presentado aumento en el volumen y frecuencia de la micción (Poliuria)?", key: "poliuria" },
              { label: "¿Ha presentado sensación de no poder contener la orina (Urgencia miccional)?", key: "urgenciaMiccional" },
              { label: "¿Ha presentado deseo imperioso de orinar sin lograr conseguirlo (Tenesmo vesical)?", key: "tenesmoVesical" }
            ].map(({ label, key }) => (
              <Form.Group key={key} className="mb-3">
                <Form.Label>{label}</Form.Label>
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    label="Sí"
                    name={key}
                    className="mr-3"
                    checked={seguimiento.eliminacion[key] === true}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      eliminacion: {
                        ...prev.eliminacion,
                        [key]: true
                      }
                    }))}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name={key}
                    checked={seguimiento.eliminacion[key] === false}
                    onChange={() => setSeguimiento(prev => ({
                      ...prev,
                      eliminacion: {
                        ...prev.eliminacion,
                        [key]: false
                      }
                    }))}
                  />
                </div>
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>¿Ha realizado alguna intervención para su mejoría? Si, No ¿Cuál?</Form.Label>
              <Form.Control
                as="textarea"
                value={seguimiento.eliminacion.intervencion}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  eliminacion: {
                    ...prev.eliminacion,
                    intervencion: e.target.value
                  }
                }))}
              />
            </Form.Group>

            <Alert variant="info" style={{ borderRadius: '8px' }}>
              <h6>Recomendaciones de Eliminación:</h6>
              <ul>
                {[
                  "Aumente ingesta de agua de 1 a 2 litros por día (considerar patologías concomitantes).",
                  "Conozca las características propias de su orina como color, olor, frecuencia, cantidad.",
                  "Favorezca la eliminación vesical, no retenga la orina.",
                  "Favorecer la higiene genital con agua corriente, no utilice jabón.",
                  "Consumir alimentos saludables, tome los medicamentos según corresponda.",
                  "Consultar a centro asistencial si persiste las molestias."
                ].map((recomendacion, index) => (
                  <li key={index}>{recomendacion}</li>
                ))}
              </ul>
            </Alert>
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
                value={seguimiento.comentario_segundo_llamado}
                onChange={(e) => setSeguimiento(prev => ({
                  ...prev,
                  comentario_segundo_llamado: e.target.value
                }))}
              />
            </Form.Group>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {renderContent()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button type="submit" disabled={disabled}>Ingresar</Button>
            {seguimiento.id && esEditable && (
              <Button
                variant="success"
                onClick={() => {
                  guardarSeguimiento(2, true);
                }}
              >
                Actualizar
              </Button>
            )}
            {seguimiento.nutricion.comidasDia && (
              <Button variant="primary" onClick={exportarPDF}>Exportar PDF</Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SegundoLlamado;