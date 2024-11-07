import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaInfantil = ({ onVolver, onIngresar, institucionId }) => {
    const [datosNino, setDatosNino] = useState({
        fechaNacimiento: '',
        nombres: '',
        apellidos: '',
        rut: '',
        edad: '',
        telefonoPrincipal: '',
        telefonoSecundario: ''
    });

    const { user, getToken } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [puntajeDPM, setPuntajeDPM] = useState('');
    const [diagnosticoDSM, setDiagnosticoDSM] = useState('');
    const [padres, setPadres] = useState([{ nombre: '', escolaridad: '', ocupacion: '' }]);
    const [conQuienVive, setConQuienVive] = useState('');
    const [tipoFamilia, setTipoFamilia] = useState('');
    const [cicloVitalFamiliar, setCicloVitalFamiliar] = useState('');
    const [localidad, setLocalidad] = useState('');
    
    // Lista de factores de riesgo disponibles
    const [factoresRiesgoNinoDisponibles, setFactoresRiesgoNinoDisponibles] = useState([]);
    const [factoresRiesgoFamiliaresDisponibles, setFactoresRiesgoFamiliaresDisponibles] = useState([]);
    
    // Estados para las selecciones de factores de riesgo
    const [factoresRiesgoNino, setFactoresRiesgoNino] = useState({});
    const [factoresRiesgoFamiliares, setFactoresRiesgoFamiliares] = useState({
        otras: ''
    });

    const [otraTipoFamilia, setOtraTipoFamilia] = useState('');
    const [otraCicloVital, setOtraCicloVital] = useState('');
    const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
    const [ciclosVitalesFamiliares, setCiclosVitalesFamiliares] = useState([]);
    const [tiposFamilia, setTiposFamilia] = useState([]);
    const [errores, setErrores] = useState({});


    useEffect(() => {
      const cargarDatos = async () => {
          try {
              const token = getToken();
              const [
                  nivelesRes, 
                  ciclosRes, 
                  tiposRes, 
                  factoresNinoRes, 
                  factoresFamiliarRes
              ] = await Promise.all([
                  axios.get(`${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`, {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get(`${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`, {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-familia`, {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get(`${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-nino`, {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get(`${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-familiar`, {
                      headers: { Authorization: `Bearer ${token}` }
                  })
              ]);

              setNivelesEscolaridad(nivelesRes.data);
              setCiclosVitalesFamiliares(ciclosRes.data);
              setTiposFamilia(tiposRes.data);
              
              // Configurar factores de riesgo del niño
              const factoresNino = factoresNinoRes.data;
              setFactoresRiesgoNinoDisponibles(factoresNino);
              const inicialFactoresNino = {};
              factoresNino.forEach(factor => {
                  inicialFactoresNino[factor.nombre] = false;
              });
              setFactoresRiesgoNino(inicialFactoresNino);

              // Configurar factores de riesgo familiares
              const factoresFamiliar = factoresFamiliarRes.data;
              setFactoresRiesgoFamiliaresDisponibles(factoresFamiliar);
              const inicialFactoresFamiliar = { otras: '' };
              factoresFamiliar.forEach(factor => {
                  if (factor.nombre !== 'Otras') {
                      inicialFactoresFamiliar[factor.nombre] = false;
                  }
              });
              setFactoresRiesgoFamiliares(inicialFactoresFamiliar);

          } catch (error) {
              console.error("Error al cargar datos:", error);
              setSubmitError("Error al cargar los datos iniciales");
          }
      };

      cargarDatos();
  }, [getToken]);

  const handleAddPadre = () => {
    setPadres([...padres, { nombre: '', escolaridad: '', ocupacion: '' }]);
  };

  const handleRemovePadre = (index) => {
    const newPadres = padres.filter((_, i) => i !== index);
    setPadres(newPadres);
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    
    if (!datosNino.fechaNacimiento) erroresValidacion.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!datosNino.nombres) erroresValidacion.nombres = 'Los nombres son requeridos';
    if (!datosNino.apellidos) erroresValidacion.apellidos = 'Los apellidos son requeridos';
    if (!datosNino.rut) erroresValidacion.rut = 'El RUT es requerido';
    if (!datosNino.edad) erroresValidacion.edad = 'La edad es requerida';
    if (!datosNino.telefonoPrincipal) erroresValidacion.telefonoPrincipal = 'El teléfono principal es requerido';
  
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
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

  const factoresRiesgoNinoArray = Object.entries(factoresRiesgoNino)
  .filter(([_, value]) => value)
  .map(([key]) => key);

  const factoresRiesgoFamiliaresArray = Object.entries(factoresRiesgoFamiliares)
    .filter(([key, value]) => value && key !== 'otras')
    .map(([key]) => key);

  if (factoresRiesgoFamiliares.otras) {
    factoresRiesgoFamiliaresArray.push({
      tipo: 'otras',
      descripcion: factoresRiesgoFamiliares.otras
    });
  }

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');
  
    const datosParaEnviar = {
      fechaNacimiento: datosNino.fechaNacimiento,
      nombres: datosNino.nombres,
      apellidos: datosNino.apellidos,
      rut: datosNino.rut,
      edad: datosNino.edad,
      telefonoPrincipal: datosNino.telefonoPrincipal,
      telefonoSecundario: datosNino.telefonoSecundario,
      puntajeDPM,
      diagnosticoDSM,
      padres,
      conQuienVive,
      tipoFamilia,
      cicloVitalFamiliar,
      localidad,
      factoresRiesgoNino: Object.keys(factoresRiesgoNino).filter(key => factoresRiesgoNino[key]),
      factoresRiesgoFamiliares: Object.keys(factoresRiesgoFamiliares)
        .filter(key => factoresRiesgoFamiliares[key] && key !== 'otras'),
      otrosFactoresRiesgoFamiliares: factoresRiesgoFamiliares.otras,
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId
    };
  
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/infantil`,
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        setSuccessMessage('Ficha clínica infantil creada exitosamente');
        onIngresar(response.data.data);
        // Limpiar el formulario
        setDatosNino({
          fechaNacimiento: '',
          nombres: '',
          apellidos: '',
          rut: '',
          edad: '',
          telefonoPrincipal: '',
          telefonoSecundario: ''
        });
        
        // Limpiar evaluación psicomotora
        setPuntajeDPM('');
        setDiagnosticoDSM('');
        
        // Limpiar información familiar
        setPadres([{ nombre: '', escolaridad: '', ocupacion: '' }]);
        
        // Limpiar información adicional
        setConQuienVive('');
        setTipoFamilia('');
        setCicloVitalFamiliar('');
        setLocalidad('');
        setOtraTipoFamilia('');
        setOtraCicloVital('');
        
        // Limpiar factores de riesgo del niño
        const resetFactoresNino = {};
        factoresRiesgoNinoDisponibles.forEach(factor => {
          resetFactoresNino[factor.nombre] = false;
        });
        setFactoresRiesgoNino(resetFactoresNino);
        
        // Limpiar factores de riesgo familiares
        const resetFactoresFamiliares = { otras: '' };
        factoresRiesgoFamiliaresDisponibles.forEach(factor => {
            if (factor.nombre !== 'Otras') {
                resetFactoresFamiliares[factor.nombre] = false;
            }
        });
        setFactoresRiesgoFamiliares(resetFactoresFamiliares);
                
        // Limpiar errores y mensajes
        setErrores({});
        
        // Mostrar mensaje de éxito
        setSuccessMessage('Ficha clínica infantil creada exitosamente');
        onIngresar(response.data.data);
      } else {
        setSubmitError('Error al crear la ficha clínica infantil');
      }
    } catch (error) {
      console.error('Error al crear la ficha clínica infantil:', error);
      setSubmitError(error.response?.data?.message || 'Error al crear la ficha clínica infantil');
    } finally {
      setIsSubmitting(false);
    }
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
                <select 
                  className="form-control" 
                  value={puntajeDPM} 
                  onChange={(e) => {
                    setPuntajeDPM(e.target.value);
                    // Actualizar el diagnóstico DSM basado en la selección
                    switch(e.target.value) {
                      case "Menor a 30":
                        setDiagnosticoDSM("Retraso");
                        break;
                      case "Entre 30 y 40":
                        setDiagnosticoDSM("Riesgo");
                        break;
                      case "Mayor a 40":
                        setDiagnosticoDSM("Normal");
                        break;
                      default:
                        setDiagnosticoDSM("");
                    }
                  }}
                >
                  <option value="">Seleccione...</option>
                  <option value="Menor a 30">Menor a 30</option>
                  <option value="Entre 30 y 40">Entre 30 y 40</option>
                  <option value="Mayor a 40">Mayor a 40</option>
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
                  readOnly
                  placeholder={puntajeDPM ? diagnosticoDSM : "Seleccione Puntaje DPM o TEPSI"}
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
                      {nivelesEscolaridad.map(nivel => (
                        <option key={nivel.id} value={nivel.id}>{nivel.nivel}</option>
                      ))}
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
                  {tiposFamilia.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
              {tipoFamilia === 'Otras' && (
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
                  onChange={(e) => setCicloVitalFamiliar(e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  {ciclosVitalesFamiliares.map(ciclo => (
                    <option key={ciclo.id} value={ciclo.id}>{ciclo.ciclo}</option>
                  ))}
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
            {factoresRiesgoNinoDisponibles.map(factor => (
              <div className="col-md-3" key={factor.id}>
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id={`nino-${factor.id}`}
                    checked={factoresRiesgoNino[factor.nombre] || false}
                    onChange={(e) => setFactoresRiesgoNino({...factoresRiesgoNino, [factor.nombre]: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor={`nino-${factor.id}`}>{factor.nombre}</label>
                </div>
              </div>
            ))}
          </div>
          </div>

          <h5>Factores de Riesgo Familiar</h5>
          <div className="row">
            {factoresRiesgoFamiliaresDisponibles.map(factor => (
              factor.nombre !== 'Otras' ? (
                <div className="col-md-3" key={factor.id}>
                  <div className="form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id={`familiar-${factor.id}`}
                      checked={factoresRiesgoFamiliares[factor.nombre] || false}
                      onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, [factor.nombre]: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor={`familiar-${factor.id}`}>{factor.nombre}</label>
                  </div>
                </div>
              ) : null
            ))}
            <div className="col-md-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="otrasRiesgos"
                  checked={factoresRiesgoFamiliares.otras !== ''}
                  onChange={(e) => setFactoresRiesgoFamiliares({...factoresRiesgoFamiliares, otras: e.target.checked ? ' ' : ''})}
                />
                <label className="form-check-label" htmlFor="otrasRiesgos">Otras</label>
              </div>
            </div>
            {factoresRiesgoFamiliares.otras !== '' && (
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

      <div className="d-flex justify-content-center mt-5 mb-5">
        <button 
          className="btn btn-primary px-4 mx-2" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar Ficha Clínica'}
        </button>
        <button className="btn btn-secondary px-4 mx-2" onClick={onVolver}>
          Volver
        </button>
      </div>
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong><i className="icon fas fa-check"></i> ¡Éxito!</strong> {successMessage}
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setSuccessMessage('')}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong><i className="icon fas fa-ban"></i> Error:</strong> {submitError}
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setSubmitError('')}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  );
};

export default FichaClinicaInfantil;