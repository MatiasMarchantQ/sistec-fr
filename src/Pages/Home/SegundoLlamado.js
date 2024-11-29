import React from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
  paciente
}) => {
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

  const exportarPDF = () => {
    const input = document.getElementById('exportable-content2');
    html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        // Crear un PDF de tamaño oficio (216 mm x 330 mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'legal',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        // Añadir información del paciente al PDF en la primera página
        pdf.text('Información del Paciente', 10, 10);
        pdf.text(`Nombre: ${paciente.nombres} ${paciente.apellidos}`, 10, 20);
        pdf.text(`RUT: ${paciente.rut}`, 10, 30);
        pdf.text(`Fecha de nacimiento: ${paciente.fecha_nacimiento}`, 10, 40);
        pdf.text(`Edad: ${paciente.edad}`, 10, 50);
        pdf.text(`Teléfono Principal: ${paciente.telefono_principal}`, 10, 60);
        pdf.text(`Teléfono Secundario: ${paciente.telefono_secundario}`, 10, 70);
        
        // Agregar un salto de página
        pdf.addPage();

        // Definir el ancho y la altura de la imagen
        const imgWidth = 105;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Agregar la imagen al PDF en la segunda página
        pdf.addImage(imgData, 'PNG', 5, 0, imgWidth, imgHeight);

        // Guardar el PDF
        pdf.save(`${paciente.rut}_2.pdf`);
    });
  };

  const renderContent = () => {
    return (
      <div id="exportable-content2">
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

        <p style={{ marginTop: '20px' }}>
          Para finalizar este llamado, recuerde registrar todos los síntomas, dudas y/o comentarios que presente. Además, respetar las indicaciones de su médico y del equipo de salud. Muchas gracias por su colaboración, ¡Hasta pronto!
        </p>
      </div>
    );
  };

return (
  <Card>
    <Card.Body>
      <Form onSubmit={handleSubmit}>
        {renderContent()}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button type="submit" disabled={disabled}>Guardar</Button>
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