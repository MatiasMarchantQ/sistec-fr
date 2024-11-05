import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaInfantil = ({ onVolver, onIngresar }) => {
  const [datosNino, setDatosNino] = useState({
    fechaNacimiento: '',
    nombres: '',
    apellidos: '',
    rut: '',
    edad: '',
    telefonoPrincipal: '',
    telefonoSecundario: ''
  });
  
  const [puntajeDPM, setPuntajeDPM] = useState('');
  const [diagnosticoDSM, setDiagnosticoDSM] = useState('');
  const [padres, setPadres] = useState([{ nombre: '', escolaridad: '', ocupacion: '' }]);
  const [conQuienVive, setConQuienVive] = useState('');
  const [tipoFamilia, setTipoFamilia] = useState('');
  const [cicloVitalFamiliar, setCicloVitalFamiliar] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [factoresRiesgoNino, setFactoresRiesgoNino] = useState({
    prematurez: false,
    desnutricion: false,
    enfermedadesCronicas: false,
    neurodivergencia: false
  });
  const [factoresRiesgoFamiliares, setFactoresRiesgoFamiliares] = useState({
    migrantes: false,
    bajosRecursos: false,
    adicciones: false,
    depresionMaterna: false,
    otras: ''
  });

  const [otraTipoFamilia, setOtraTipoFamilia] = useState('');
  const [otraCicloVital, setOtraCicloVital] = useState('');
  const [errores, setErrores] = useState({});

  const handleAddPadre = () => {
    setPadres([...padres, { nombre: '', escolaridad: '', ocupacion: '' }]);
  };

  const handleRemovePadre = (index) => {
    const newPadres = padres.filter((_, i) => i !== index);
    setPadres(newPadres);
  };

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'nombres':
      case 'apellidos':
        return /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/.test(valor) ? '' : `${nombre} debe contener solo letras y tener entre 2 y 50 caracteres`;
      case 'rut':
        return /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/.test(valor) ? '' : 'RUT inválido';
      case 'telefonoPrincipal':
      case 'telefonoSecundario':
        return /^\+56\s?9\s?\d{4}\s?\d{4}$/.test(valor) ? '' : 'Formato de teléfono inválido';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: error }));
    
    setDatosNino(prev => ({
      ...prev,
      [name]: value
    }));
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
                <input 
                  type="date" 
                  className="form-control" 
                  name="fechaNacimiento"
                  value={datosNino .fechaNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Nombres</label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                  value={datosNino.nombres}
                  onChange={handleChange}
                  placeholder="Ingrese el/los nombres"
                />
                {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  className={`form-control ${errores.apellidos ? 'is-invalid' : ''}`}
                  value={datosNino.apellidos}
                  onChange={handleChange}
                  placeholder="Ingrese el/los apellidos"
                />
                {errores.apellidos && <div className="invalid-feedback">{errores.apellidos}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>RUT</label>
                <input 
                  type="text" 
                  name="rut"
                  className="form-control" 
                  value={datosNino.rut}
                  onChange={handleChange}
                  placeholder="Ej: 12.345.678-9" 
                />
              </div>
            </div>
          </div>

          <div className="row">
          <div className="col-md-4">
              <div className="form-group">
                <label>Edad</label>
                <select 
                  name="edad"
                  className="form-control"
                  value={datosNino.edad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="4 - 5 meses">4 - 5 meses</option>
                  <option value="6 - 7 meses">6 - 7 meses</option>
                  <option value="8 - 9 meses">8 - 9 meses</option>
                  <option value="10 - 11 meses">10 - 11 meses</option>
                  <option value="12 a 14 meses">12 a 14 meses</option>
                  <option value="15 a 17 meses">15 a 17 meses</option>
                  <option value="18 a 23 meses">18 a 23 meses</option>
                  <option value="2 años">2 años</option>
                  <option value="3 años">3 años</option>
                  <option value="4 años">4 años</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  name="telefonoPrincipal"
                  className="form-control" 
                  value={datosNino.telefonoPrincipal}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678" 
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>2do Teléfono (Ideal)</label>
                <input 
                  type="tel" 
                  name="telefonoSecundario"
                  className="form-control" 
                  value={datosNino.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="+56 9 8765 4321" 
                />
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
        <div className="card-header">Información Adicional</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Con quién vive el menor</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={conQuienVive}
                  onChange={(e) => setConQuienVive(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
              <label>Tipo de familia</label>
                <select 
                  className="form-control"
                  value={tipoFamilia}
                  onChange={(e) => {
                    setTipoFamilia(e.target.value);
                    if (e.target.value !== 'Otra') {
                      setOtraTipoFamilia('');
                    }
                  }}
                >
                  <option value="">Seleccione...</option>
                  <option value="Nuclear">Nuclear</option>
                  <option value="Extensa">Extensa</option>
                  <option value="Unipersonal">Unipersonal</option>
                  <option value="Nuclear reconstituida">Nuclear reconstituida</option>
                  <option value="Monoparental">Monoparental</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              {tipoFamilia === 'Otra' && (
                <div className="form-group">
                  <label>Especifique</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={otraTipoFamilia}
                    onChange={(e) => setOtraTipoFamilia(e.target.value)}
                    placeholder="Especifique el tipo de familia"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
              <label>Ciclo vital familiar</label>
                <select 
                  className="form-control"
                  value={cicloVitalFamiliar}
                  onChange={(e) => {
                    setCicloVitalFamiliar(e.target.value);
                    if (e.target.value !== 'Otra') {
                      setOtraCicloVital('');
                    }
                  }}
                >
                  <option value="">Seleccione...</option>
                  <option value="Formación de pareja">Formación de pareja</option>
                  <option value="Cambio de diada a tríada">Cambio de diada a tríada</option>
                  <option value="Con hijos preescolares">Con hijos preescolares</option>
                  <option value="Con hijos escolares">Con hijos escolares</option>
                  <option value="Con hijos adolescentes">Con hijos adolescentes</option>
                  <option value="Plataforma de lanzamiento">Plataforma de lanzamiento</option>
                  <option value="En edad madura">En edad madura</option>
                  <option value="Familia Anciana">Familia Anciana</option>
                  {/* <option value="Otra">Otra</option> */}
                </select>
              </div>
              {/* {cicloVitalFamiliar === 'Otra' && (
                <div className="form-group">
                  <label>Especifique</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={otraCicloVital}
                    onChange={(e) => setOtraCicloVital(e.target.value)}
                    placeholder="Especifique el ciclo vital familiar"
                  />
                </div>
              )} */}
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Localidad</label>
                <select 
                  className="form-control"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  <option value="Urbano">Urbano</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Factores de Riesgo</div>
        <div className="card-body">
          <h5>Factores de Riesgo del Niño/a</h5>
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="prematurez"
                  checked={factoresRiesgoNino.prematurez}
                  onChange={(e) => setFactoresRiesgoNino({...factoresRiesgoNino, prematurez: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="prematurez">Prematurez</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="desnutricion"
                  checked={factoresRiesgoNino.desnutricion}
                  onChange={(e) => setFactoresRiesgoNino({...factoresRiesgoNino, desnutricion: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="desnutricion">Desnutrición</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="enfermedadesCronicas"
                  checked={factoresRiesgoNino.enfermedadesCronicas}
                  onChange={(e) => setFactoresRiesgoNino({...factoresRiesgoNino, enfermedadesCronicas: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="enfermedadesCronicas">Enfermedades Crónicas</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="neurodivergencia"
                  checked={factoresRiesgoNino.neurodivergencia}
                  onChange={(e) => setFactoresRiesgoNino({...factoresRiesgoNino, neurodivergencia: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="neurodivergencia">Neurodivergencia (CEA)</label>
              </div>
            </div>
          </div>

          <h5>Factores de Riesgo Familiar</h5>
          <div className="row">
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="migrantes"
                  checked={factoresRiesgoFamiliares.migrantes}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, migrantes: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="migrantes">Migrantes</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="bajosRecursos"
                  checked={factoresRiesgoFamiliares.bajosRecursos}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, bajosRecursos: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="bajosRecursos">Bajos recursos</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="adicciones"
                  checked={factoresRiesgoFamiliares.adicciones}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, adicciones: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="adicciones">Adicciones</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="depresionMaterna"
                  checked={factoresRiesgoFamiliares.depresionMaterna}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, depresionMaterna: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="depresionMaterna">Depresión materna</label>
              </div>
            </div>
            <div className="col-md-3">
            <div className="form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="otrasRiesgos"
                checked={factoresRiesgoFamiliares.otrasRiesgos}
                onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, otrasRiesgos: e.target.checked, otras: e.target.checked ? factoresRiesgoFamiliares.otras : ''})}
              />
              <label className="form-check-label" htmlFor="otrasRiesgos">Otras</label>
            </div>
          </div>
          {factoresRiesgoFamiliares.otrasRiesgos && (
            <div className="col-md-12 mt-3">
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-control" 
                  id="otrosRiesgosFamiliaresTexto" 
                  placeholder="Especifique otros riesgos familiares"
                  value={factoresRiesgoFamiliares.otras}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, otras: e.target.value})}
                />
              </div>
            </div>
          )}
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