import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const SegundoLlamado = ({ 
  seguimiento, 
  setSeguimiento, 
  onComplete, 
  disabled 
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

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="mb-4">
        <Card.Header>SEGUNDO LLAMADO TELEFÓNICO - Necesidad de Nutrición y Actividad</Card.Header>
        <Card.Body>
          <h5>III. Necesidad de Nutrición, Agua y Electrolíticos</h5>
          
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
  
          <h6>2. Habitualmente, ¿Qué consume en cada comida?</h6>
          <Form.Group className="mb-3">
            <Form.Label>Desayuno</Form.Label>
            <Form.Control 
              as="textarea"
              placeholder="Describa su desayuno habitual"
              value={seguimiento.nutricion.comidas.desayuno}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                nutricion: {
                  ...prev.nutricion,
                  comidas: {
                    ...prev.nutricion.comidas,
                    desayuno: e.target.value
                  }
                }
              }))}
            />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Almuerzo</Form.Label>
            <Form.Control 
              as="textarea"
              placeholder="Describa su almuerzo habitual"
              value={seguimiento.nutricion.comidas.almuerzo}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                nutricion: {
                  ...prev.nutricion,
                  comidas: {
                    ...prev.nutricion.comidas,
                    almuerzo: e.target.value
                  }
                }
              }))}
            />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Once</Form.Label>
            <Form.Control 
              as="textarea"
              placeholder="Describa su once habitual"
              value={seguimiento.nutricion.comidas.once}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                nutricion: {
                  ...prev.nutricion,
                  comidas: {
                    ...prev.nutricion.comidas,
                    once: e.target.value
                  }
                }
              }))}
            />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>Cena</Form.Label>
            <Form.Control 
              as="textarea"
              placeholder="Describa su cena habitual"
              value={seguimiento.nutricion.comidas.cena}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                nutricion: {
                  ...prev.nutricion,
                  comidas: {
                    ...prev.nutricion.comidas,
                    cena: e.target.value
                  }
                }
              }))}
            />
          </Form.Group>
  
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
  
          <h6>Recomendaciones:</h6>
          <ul>
            <li>Limitar alimentos con altos contenidos de azúcar y sal.</li>
            <li>Comer porciones pequeñas a lo largo del día.</li>
            <li>Limitar el consumo de hidratos de carbono.</li>
            <li>Consumir una gran variedad de alimentos integrales, frutas y vegetales.</li>
            <li>Limite el consumo de alimentos ricos en grasa y frituras.</li>
            <li>Intente no consumir alcohol.</li>
            <li>Consuma un plato equilibrado de nutrientes, donde en el centro se encuentra el agua, 50% debe ser verduras como ensaladas, verduras cocidas y frutas. La otra mitad del plato estaría compuesto por una porción de hidratos de carbono, cereales, pasta, pan, otra porción de carnes y/o legumbres, lácteos y restringido el aceite, el cual debiera usarse idealmente crudo.</li>
            <li>Debe evitar consumir comida "chatarra" alto en azúcar y grasas saturadas, como helados, papas fritas.</li>
          </ul>
  
          <h5>IV. Necesidad de Actividad y Reposo</h5>
          <Form.Group className="mb-3">
            <Form.Label>¿Realiza actividad física?</Form.Label>
            <Form.Check 
              type="radio"
              label="Sí"
              name="actividadFisica"
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
          </Form.Group>
  
          {seguimiento.actividadFisica.realiza && (
            <>
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
                      ...prev.actividadFisica,
                      frecuencia: e.target.value
                    }
                  }))}
                >
                  <option value="">Seleccione</option>
                  <option value="1 vez por semana">1 vez por semana</option>
                  <option value="1 vez al mes">1 vez al mes</option>
                  <option value="2-3 veces a la semana">2-3 veces a la semana</option>
                  <option value="1 vez por día">1 vez por día</ option>
                </Form.Select>
              </Form.Group>
            </>
          )}
  
          <h5>II. Necesidad de Eliminación</h5>
          <Form.Group className="mb-3">
            <Form.Label>1. ¿Ha presentado aumento en el volumen y frecuencia de la micción (Poliuria)?</Form.Label>
            <Form.Check 
              type="radio"
              label="Sí"
              name="poliuria"
              checked={seguimiento.eliminacion.poliuria === true}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  poliuria: true
                }
              }))}
            />
            <Form.Check 
              type="radio"
              label="No"
              name="poliuria"
              checked={seguimiento.eliminacion.poliuria === false}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  poliuria: false
                }
              }))}
            />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>2. ¿Ha presentado sensación de no poder contener la orina (Urgencia miccional)?</Form.Label>
            <Form.Check 
              type="radio"
              label="Sí"
              name="urgenciaMiccional"
              checked={seguimiento.eliminacion.urgenciaMiccional === true}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  urgenciaMiccional: true
                }
              }))}
            />
            <Form.Check 
              type="radio"
              label="No"
              name="urgenciaMiccional"
              checked={seguimiento.eliminacion.urgenciaMiccional === false}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  urgenciaMiccional: false
                }
              }))}
            />
          </Form.Group>
  
          <Form.Group className="mb-3">
            <Form.Label>3. ¿Ha presentado deseo imperioso de orinar sin lograr conseguirlo (Tenesmo vesical)?</Form.Label>
            <Form.Check 
              type="radio"
              label="Sí"
              name="tenesmoVesical"
              checked={seguimiento.eliminacion.tenesmoVesical === true}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  tenesmoVesical: true
                }
              }))}
            />
            <Form.Check 
              type="radio"
              label="No"
              name="tenesmoVesical"
              checked={seguimiento.eliminacion.tenesmoVesical === false}
              onChange={() => setSeguimiento(prev => ({
                ...prev,
                eliminacion: {
                  ...prev.eliminacion,
                  tenesmoVesical: false
                }
              }))}
            />
          </Form.Group>
  
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
  
          <h6>Recomendaciones:</h6>
          <ul>
            <li>Aumente ingesta de agua de 1 a 2 litros por día (considerar patologías concomitantes).</li>
            <li>Conozca las características propias de su orina como color, olor, frecuencia, cantidad. Si presenta alteración de las características, debe consultar a un profesional de la salud.</li>
            <li>Favorezca la eliminación vesical, no retenga la orina.</li>
            <li>Favorecer la higiene genital con agua corriente, no utilice jabón, evite usar toallas húmedas.</li>
            <li>Consumir alimentos saludables, tome los medicamentos según corresponda.</li>
            <li>Consultar a centro asistencial si persiste las molestias.</li>
          </ul>
  
          <p>Para finalizar este llamado, recuerde registrar todos los síntomas, dudas y/o comentarios que presente. Además, respetar las indicaciones de su médico y del equipo de salud. Muchas gracias por su colaboración, ¡Hasta pronto!</p>
        </Card.Body>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={disabled}
          className="mt-3"
        >
          Guardar Segundo Llamado
        </Button>
      </Card>
    </Form>
    );
  };

export default SegundoLlamado;