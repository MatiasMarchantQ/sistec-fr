import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PrimerLlamado = ({ 
  seguimiento, 
  setSeguimiento, 
  onComplete, 
  disabled 
}) => {
  console.log('Seguimiento recibido:', seguimiento);
  
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
        condicion: seguimiento.riesgoInfeccion.dolorNeuropatico === undefined,
        mensaje: 'Debe indicar si ha presentado dolor neuropático'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hipoglicemia === undefined,
        mensaje: 'Debe indicar si ha presentado signos de hipoglicemia'
      },
      {
        condicion: seguimiento.riesgoGlicemia.hiperglicemia === undefined,
        mensaje: 'Debe indicar si ha presentado signos de hiperglicemia'
      },
      {
        condicion: seguimiento.adherencia.olvido === undefined,
        mensaje: 'Debe completar el Test Morisky-Green'
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

  const renderContent = () => {
    return (
      <div id="exportable-content-1">
        <h5>I. Necesidad de Seguridad y Protección</h5>
        
        <h6>1. Riesgo de Infección - Examen del Pie Diabético</h6>
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

        <h6>2. Riesgo de Glicemia</h6>
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
              checked={seguimiento.riesgoGlicemia .realizoIntervencionHiperglicemia === true}
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

        <h6>3. Riesgo de Crisis Hipertensiva</h6>
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
            checked={seguimiento.riesgoHipertension.nauseas}
            onChange={() => setSeguimiento(prev => ({
              ...prev,
              riesgoHipertension: {
                ...prev.riesgoHipertension,
                nauseas: !prev.riesgoHipertension.nauseas
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

        <h6>4. Adherencia al Tratamiento Farmacológico - Test Morisky-Green</h6>
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
        <h6>Adhiere al tratamiento: {seguimiento.adherencia.olvido + seguimiento.adherencia.horaIndicada + (seguimiento.adherencia.dejaRemedio ? 0 : 1) + (seguimiento.adherencia.dejaRemedioMal ? 0 : 1) >= 3 ? 'Sí' : 'No'}</h6>

        <h6>5. Efectos Secundarios a los Medicamentos</h6>
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

        <h6>Para finalizar este llamado, recuerde registrar todos los síntomas, dudas y/o comentarios que presente. Además, respete las indicaciones de su médico y del equipo de salud. Muchas gracias por su colaboración, ¡Hasta pronto!</h6>
      </div>
    );
  };

  const exportarPDF = () => {
    const input = document.getElementById('exportable-content');
    html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 190; // Ajusta según el tamaño del PDF
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantiene la proporción de la imagen
        let heightLeft = imgHeight;

        let position = 0;

        // Agregar la imagen al PDF
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        // Si la imagen es más alta que la página, agregar páginas adicionales
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        // Guardar el PDF
        pdf.save('exported-content.pdf');
    });
};

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {renderContent()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button type="submit" disabled={disabled}>Guardar</Button>
            {seguimiento.riesgoInfeccion.herida && (
              <Button variant="primary" onClick={exportarPDF}>Exportar PDF</Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PrimerLlamado;