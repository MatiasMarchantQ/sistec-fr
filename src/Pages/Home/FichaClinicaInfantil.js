import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaInfantil = ({ onVolver, onIngresar }) => {
  const [puntajeDPM, setPuntajeDPM] = useState('');
  const [diagnosticoDSM, setDiagnosticoDSM] = useState('');
  const [padres, setPadres] = useState([{ nombre: '', escolaridad: '', ocupacion: '' }]);

  const handleAddPadre = () => {
    setPadres([...padres, { nombre: '', escolaridad: '', ocupacion: '' }]);
  };

  const handleRemovePadre = (index) => {
    const newPadres = padres.filter((_, i) => i !== index);
    setPadres(newPadres);
  };

  return (
    <>
      <div className="alert alert-info">
        <strong>Acompañamiento en el Desarrollo Infantil Integral</strong>
        <p>
          El Programa de Telecuidado realiza un acompañamiento remoto a los padres y/o tutores
          legales de infantes en una alianza estratégica con jardines infantiles, donde se
          pretende fomentar conductas promotoras de salud en el marco del desarrollo psicomotor de
          estos niños.
        </p>
      </div>

      <div className="card mb-4">
        <div className="card-header">Datos del Niño/a</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" className="form-control" placeholder="dd/mm/yyyy" />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Nombre del niño/a</label>
                <input type="text" className="form-control" placeholder="Ej: Juan Pérez" />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>RUT</label>
                <input type="text" className="form-control" placeholder="Ej: 12.345.678-9" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Edad</label>
                <input type="number" className="form-control" placeholder="Ej: 4" />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" className="form-control" placeholder="+56 9 1234 5678" />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>2do Teléfono (Ideal)</label>
                <input type="tel" className="form-control" placeholder="+56 9 8765 4321" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Evaluación Psicomotora</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Puntaje DPM o TEPSI</label>
                <select className="form-control" value={puntajeDPM} onChange={(e) => setPuntajeDPM(e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="menor30">Menor a 30</option>
                  <option value="entre30y40">Entre 30 y 40</option>
                  <option value="mayor40">Mayor a 40</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Diagnóstico DSM</label>
                <input
                  type="text"
                  className="form-control"
                  value={diagnosticoDSM}
                  onChange={(e) => setDiagnosticoDSM(e.target.value)}
                  placeholder={puntajeDPM ? "Ingrese el diagnóstico DSM" : "Seleccione Puntaje DPM o TEPSI"}
                  disabled={!puntajeDPM}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Información Familiar</div>
        <div className="card-body">
          {padres.map((padre, index) => (
            <div key={index} className="border p-3 mb-3">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Nombre Padre/Madre/Tutor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={padre.nombre}
                      onChange={(e) => {
                        const newPadres = [...padres];
                        newPadres[index].nombre = e.target.value;
                        setPadres(newPadres);
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Escolaridad</label>
                    <select
                      className="form-control"
                      value={padre.escolaridad}
                      onChange={(e) => {
                        const newPadres = [...padres];
                        newPadres[index].escolaridad = e.target.value;
                        setPadres(newPadres);
                      }}
                    >
                      <option value="">Seleccione...</option>
                      <option value="basica">Básica</option>
                      <option value="media">Media</option>
                      <option value="universitaria">Universitaria</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Ocupación</label>
                    <input
                      type="text"
                      className="form-control"
                      value={padre.ocupacion}
                      onChange={(e) => {
                        const newPadres = [...padres];
                        newPadres[index].ocupacion = e.target.value;
                        setPadres(newPadres);
                      }}
                    />
                  </div>
                </div>
              </div>
              {index > 0 && (
                <div className="text-right">
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemovePadre(index)}>
                    Quitar
                  </button>
                </div>
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleAddPadre}>
            Añadir Padre/Tutor
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Factores de Riesgo</div>
        <div className="card-body">
            <h5>Factores de Riesgo del Niño/a</h5>
            <div className="row mb-3">
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="prematurez" />
                <label className="form-check-label" htmlFor="prematurez">Prematurez</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="desnutricion" />
                <label className="form-check-label" htmlFor="desnutricion">Desnutrición</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="enfermedadesCronicas" />
                <label className="form-check-label" htmlFor="enfermedadesCronicas">Enfermedades Crónicas</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="desnutricionSecundaria" />
                <label className="form-check-label" htmlFor="desnutricionSecundaria">Desnutrición Secundaria</label>
                </div>
            </div>
            </div>

            <h5>Factores de Riesgo Familiar</h5>
            <div className="row">
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="migrantes" />
                <label className="form-check-label" htmlFor="migrantes">Migrantes</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="bajosRecursos" />
                <label className="form-check-label" htmlFor="bajosRecursos">Bajos recursos</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="adicciones" />
                <label className="form-check-label" htmlFor="adicciones">Adicciones</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-check">
                <input type="checkbox" className="form-check-input" id="depresionMaterna" />
                <label className="form-check-label" htmlFor="depresionMaterna">Depresión materna</label>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-group">
                <label htmlFor="otrosRiesgosFamiliaresTexto">Otras</label>
                <input type="text" className="form-control" id="otrosRiesgosFamiliaresTexto" placeholder="Especifique otros riesgos familiares" />
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-5 mb-5">
        <button className="btn btn-primary px-4 mx-2" onClick={onIngresar}>
            Ingresar Ficha Clínica
        </button>
        <button className="btn btn-secondary px-4 mx-2" onClick={onVolver}>
            Volver
        </button>
      </div>
    </>
  );
};

export default FichaClinicaInfantil;
