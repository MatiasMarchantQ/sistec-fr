import React, { useState } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';

const TercerLlamado = ({ seguimiento, setSeguimiento }) => {
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
          nivelDificultad: nivelDificultad
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
  
    return (
      <Card className="mb-4">
        <Card.Header>TERCER LLAMADO TELEFÓNICO - Necesidad de Estima y Autoestima</Card.Header>
        <Card.Body>
          <h5>V. Necesidad de Estima, Autoestima y Realización</h5>
          
          <h6>Detección de Síntomas Depresivos (PHQ-9)</h6>
          <p>Durante las dos últimas semanas, ¿con qué frecuencia le han molestado los siguientes problemas?</p>
          
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
  
          <Alert variant={
            puntajeTotal >= 10 ? "danger" : 
            puntajeTotal >= 5 ? "warning" : "success"
          }>
            <strong>Puntuación Total: {puntajeTotal}</strong>
            <p>Categoría: {obtenerCategoriaDepresion(puntajeTotal)}</p>
            {puntajeTotal >= 10 && (
              <p>Derivar a médico del CESFAM</p>
            )}
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
  
          <Form.Group className="mb-3">
            <Form.Label>Algún comentario que quisiera mencionar:</Form.Label>
            <Form.Control 
              as="textarea"
              value={seguimiento.comentarios}
              onChange={(e) => setSeguimiento(prev => ({
                ...prev,
                comentarios: e.target.value
              }))}
            />
          </Form.Group>
  
          <h5>Evaluación de Autoeficacia en Diabetes Tipo 2</h5>
          <p>En las siguientes preguntas nos gustaría saber qué piensa Ud. de sus habilidades para controlar su enfermedad. Por favor marque el número que mejor corresponda a su nivel de seguridad de que puede realizar en este momento las siguientes tareas.</p>
  
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
        </Card.Body>
      </Card>
    );
  };

export default TercerLlamado;