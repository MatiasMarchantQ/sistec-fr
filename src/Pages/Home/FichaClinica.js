import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaDigital = ({ id, paciente }) => {
  const [edadSeleccionada, setEdadSeleccionada] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [llamadas, setLlamadas] = useState([]); // Array para almacenar el historial de llamadas
  const [nuevaLlamada, setNuevaLlamada] = useState({ 
    fecha: '', 
    protocolo: '', 
    nombreNino: '', 
    respuestasPauta: {} // Nuevo campo para almacenar las respuestas de la pauta 
  });
  

  // Simular datos de la ficha clínica
  const fichaClinica = {
    id: 'FC001',
    paciente: 'Juan Pérez',
    fechaNacimiento: '2022-05-15',
    rut: '12.345.678-9',
    telefono: '+56 9 1234 5678',
    telefonoAlternativo: '+56 9 8765 4321',
    puntajeDPM: 'entre 30 y 40',
    diagnosticoDSM: 'Riesgo',
    padres: [
      { nombre: 'María Pérez', escolaridad: 'universitaria', ocupacion: 'Ingeniera' },
      { nombre: 'Pedro Pérez', escolaridad: 'media', ocupacion: 'Comerciante' }
    ],
    factoresRiesgoNino: ['prematurez'],
    factoresRiesgoFamiliar: ['bajos recursos']
  };

  const edades = [
    '4-5 meses', '6-7 meses', '8-9 meses', '10-11 meses', '12-14 meses',
    '15-17 meses', '18-23 meses', '2 años', '3 años', '4 años'
  ];

  const preguntas = {
    '4-5 meses': [
      { 
        area: 'Motor grueso', 
        pregunta: 'Si coloca a su hijo de güata ¿levanta la cabeza y tronco, apoyándose en antebrazos? ¿Gira de boca abajo a boca arriba? (desde los 4 meses).',
        actividad: 'Poner al niño o a la niña por tiempos equivalentes boca arriba, boca abajo o de lado sobre el suelo para que se mueva libremente, con el sentido de movimiento desarrolla balance y control. Mostrarle al niño o la niña su imagen frente a un espejo.'
      },
      { 
        area: 'Motor fino', 
        pregunta: 'Si le acerca a su hijo un objetos colgante (un juguete o sonajero) ¿ lo quiere tomar? ¿se lleva objetos a la boca (4 meses)?',
        // actividad: 'Mostrarle al niño o la niña objetos que llamen su atención (cascabeles, tazas de plástico sin contenido, cucharas de madera o paños de colores) a una distancia dentro del alcance de la niña o niño y motivarlo para que los tome.'
      },
      { 
        area: 'Cognoscitivo', 
        pregunta: 'Su hijo ¿sigue con su mirada un objeto o persona que se mueven delante de sus ojos?',
        actividad: 'Mostrarle al niño o la niña objetos que llamen su atención (cascabeles, tazas de plástico sin contenido, cucharas de madera o paños de colores) a una distancia dentro del alcance de la niña o niño y motivarlo para que los tome.'
      },
      { 
        area: 'Comunicación', 
        pregunta: 'Cuando hace sonar un sonajero o cascabel, se gira hacia el cascabel y hacia la voz y/o Dice «agú», gorgojeo (4 meses) y hace sonidos con «rrr» (5 meses) de manera más expresiva y variada.',
        actividad: 'Imitar los sonidos que el niño o la niña emite. Fomentar que el adulto se ponga cerca de su hijo/a y haga sonidos con la boca (moviendo lengua, emitiendo sonidos silbantes, guturales, gruñidos, etc), siempre mirándolo a los ojos (cara a cara). Ir describiéndole las actividades que se van realizando con el niño o niña'
      },
      { 
        area: 'Socioemocional', 
        pregunta: '¿Su hijo tiene sonrisa espontánea y se ríe a carcajadas (risa sonora)?',
        actividad: 'Fomentar el uso de música y canto de canciones con movimientos corporales frente al niño o niña. Aprovechar instancias como el baño, alimentación y juego para conversarle y cantarle. '
      }
    ],
    // ... Añadir preguntas y actividades para otras edades
  };

  const handleRespuesta = (pregunta, respuesta) => {
    setRespuestas({ ...respuestas, [pregunta]: respuesta });
    setNuevaLlamada({ 
      ...nuevaLlamada, 
      respuestasPauta: { 
        ...nuevaLlamada.respuestasPauta, 
        [pregunta]: respuesta 
      } 
    });
  };
  

  const handleAgregarLlamada = () => {
    if (llamadas.length < 5) {
      setLlamadas([...llamadas, nuevaLlamada]); // Agregar nueva llamada con respuestas
      setNuevaLlamada({ fecha: '', protocolo: '', nombreNino: '', respuestasPauta: {} }); // Resetear el formulario
      setRespuestas({}); // Limpiar las respuestas
    } else {
      alert('Solo se pueden realizar hasta 5 llamadas de seguimiento.');
    }
  };
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Ficha Clínica Digital - {fichaClinica.paciente}</h2>
      
      {/* Información del paciente */}
      <div className="card mb-4">
        <div className="card-header text-white bg-primary">Información del Paciente</div>
        <div className="card-body">
          <p><strong>ID:</strong> {fichaClinica.id}</p>
          <p><strong>Fecha de nacimiento:</strong> {fichaClinica.fechaNacimiento}</p>
          <p><strong>RUT:</strong> {fichaClinica.rut}</p>
          <p><strong>Teléfono Padre/Madre/Tutor:</strong> {fichaClinica.telefono}</p>
          <p><strong>2do Teléfono Padre/Madre/Tutor:</strong> {fichaClinica.telefonoAlternativo}</p>
          <p><strong>Puntaje DPM o DEPSI:</strong> {fichaClinica.puntajeDPM}</p>
          <p><strong>Diagnóstico DSM:</strong> {fichaClinica.diagnosticoDSM}</p>
        </div>
      </div>

      {/* Selección de edad */}
      <div className="card mb-4">
        <div className="card-header text-white bg-secondary">Evaluación del Desarrollo</div>
        <div className="card-body">
          <div className="form-group">
            <label>Seleccione la edad del niño/a:</label>
            <select
              className="form-control"
              value={edadSeleccionada}
              onChange={(e) => setEdadSeleccionada(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {edades.map(edad => (
                <option key={edad} value={edad}>{edad}</option>
              ))}
            </select>
          </div>

          {edadSeleccionada && (
            <div>
              <h4>Preguntas para {edadSeleccionada}</h4>
              {preguntas[edadSeleccionada]?.map((item, index) => (
                <div key={index} className="mb-3">
                  <p><strong>{item.area}:</strong> {item.pregunta}</p>
                  <p><strong>Actividad:</strong> {item.actividad}</p>
                  <div>
                    <button
                      className={`btn ${respuestas[item.pregunta] === 'Si' ? 'btn-success' : 'btn-outline-success'} mr-2`}
                      onClick={() => handleRespuesta(item.pregunta, 'Si')}
                    >
                      Sí
                    </button>
                    <button
                      className={`btn ${respuestas[item.pregunta] === 'No' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleRespuesta(item.pregunta, 'No')}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulario para nueva llamada */}
      <div className="card mb-4">
        <div className="card-header text-white bg-info">Registrar Nueva Llamada</div>
        <div className="card-body">
          {llamadas.length < 5 ? (
            <>
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  className="form-control"
                  value={nuevaLlamada.fecha}
                  onChange={(e) => setNuevaLlamada({ ...nuevaLlamada, fecha: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nombre del niño/a:</label>
                <input
                  type="text"
                  className="form-control"
                  value={nuevaLlamada.nombreNino}
                  onChange={(e) => setNuevaLlamada({ ...nuevaLlamada, nombreNino: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Protocolo de llamada:</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={nuevaLlamada.protocolo}
                  onChange={(e) => setNuevaLlamada({ ...nuevaLlamada, protocolo: e.target.value })}
                ></textarea>
              </div>
              <button className="btn btn-primary" onClick={handleAgregarLlamada}>Agregar llamada</button>
            </>
          ) : (
            <p className="text-danger">Se ha alcanzado el límite de 5 llamadas.</p>
          )}
        </div>
      </div>

      {/* Historial de llamadas */}
      <div className="card">
        <div className="card-header text-white bg-dark">Historial de Llamadas</div>
        <div className="card-body">
          {llamadas.length > 0 ? (
            <ul className="list-group">
              {llamadas.map((llamada, index) => (
                <li key={index} className="list-group-item">
                  <p><strong>Llamada {index + 1}</strong></p>
                  <p><strong>Fecha:</strong> {llamada.fecha}</p>
                  <p><strong>Nombre del niño/a:</strong> {llamada.nombreNino}</p>
                  <p><strong>Protocolo:</strong> {llamada.protocolo}</p>
                  <div>
                    <h5>Respuestas de la pauta:</h5>
                    <ul>
                      {Object.keys(llamada.respuestasPauta).map((pregunta, idx) => (
                        <li key={idx}>
                          <strong>{pregunta}:</strong> {llamada.respuestasPauta[pregunta]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay llamadas registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FichaClinicaDigital;