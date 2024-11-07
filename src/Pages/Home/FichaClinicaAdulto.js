import React, { useState, useEffect} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaAdulto = ({ onVolver, onIngresar, institucionId }) => {
  const { user, getToken } = useAuth();
  const initialDatosAdulto = {
    fecha: '',
    nombres: '',
    apellidos: '',
    rut: '',
    edad: '',
    diagnostico: '',
    escolaridad: '',
    ocupacion: '',
    direccion: '',
    conQuienVive: '',
    telefonoPrincipal: '',
    telefonoSecundario: '',
    horarioLlamada: '',
    conectividad: '',
    valorHbac1: ''
  };

  const [datosAdulto, setDatosAdulto] = useState(initialDatosAdulto);

  const [tiposFamilia, setTiposFamilia] = useState([]);
  const [ciclosVitales, setCiclosVitales] = useState([]);
  const [tiposFamiliaSeleccionados, setTiposFamiliaSeleccionados] = useState([]);
  const [ciclosVitalesSeleccionados, setCiclosVitalesSeleccionados] = useState([]);
  const [factoresRiesgo, setFactoresRiesgo] = useState({
    alcoholDrogas: false,
    tabaquismo: false
  });

  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [errores, setErrores] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  useEffect(() => {
    obtenerNivelesEscolaridad();
    obtenerTiposFamilia();
    obtenerCiclosVitales();
  }, []);

  const obtenerNivelesEscolaridad = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNivelesEscolaridad(response.data);
    } catch (error) {
      console.error('Error al obtener niveles de escolaridad:', error);
    }
  };

  const obtenerTiposFamilia = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/obtener/tipos-familia`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTiposFamilia(response.data);
    } catch (error) {
      console.error('Error al obtener tipos de familia:', error);
    }
  };

  const obtenerCiclosVitales = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCiclosVitales(response.data);
    } catch (error) {
      console.error('Error al obtener ciclos vitales:', error);
    }
  };


  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'nombres':
      case 'apellidos':
        return /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/.test(valor) 
          ? '' 
          : `${nombre} debe contener solo letras y tener entre 2 y 50 caracteres`;
      case 'rut':
        // Validación de RUT sin puntos
        return /^\d{7,8}[-][0-9kK]{1}$/.test(valor) 
          ? '' 
          : 'RUT inválido. Formato esperado: 12345678-9';
      case 'telefonoPrincipal':
      case 'telefonoSecundario':
        // Validación de teléfono más flexible
        return /^\d{8,12}$/.test(valor.replace(/\s/g, '')) 
          ? '' 
          : 'Formato de teléfono inválido. Debe contener entre 8 y 12 dígitos';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: error }));
    
    setDatosAdulto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const erroresValidacion = {};
    
    if (!datosAdulto.fecha) erroresValidacion.fecha = 'La fecha es requerida';
    if (!datosAdulto.nombres) erroresValidacion.nombres = 'Los nombres son requeridos';
    if (!datosAdulto.apellidos) erroresValidacion.apellidos = 'Los apellidos son requeridos';
    if (!datosAdulto.rut) erroresValidacion.rut = 'El RUT es requerido';
    if (!datosAdulto.edad) erroresValidacion.edad = 'La edad es requerida';
    if (!datosAdulto.diagnostico) erroresValidacion.diagnostico = 'El diagnóstico es requerido';
    if (!datosAdulto.escolaridad) erroresValidacion.escolaridad = 'La escolaridad es requerida';
    if (!datosAdulto.telefonoPrincipal) erroresValidacion.telefonoPrincipal = 'El teléfono principal es requerido';

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const limpiarFormulario = () => {
    setDatosAdulto(initialDatosAdulto);
    setTiposFamiliaSeleccionados([]);
    setCiclosVitalesSeleccionados([]);
    setFactoresRiesgo({
      alcoholDrogas: false,
      tabaquismo: false
    });
    setErrores({});
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');
  
    // Crear el objeto de datos que se va a enviar
    const datosParaEnviar = {
      ...datosAdulto,
      tiposFamilia: tiposFamiliaSeleccionados.map(id => parseInt(id)),
      ciclosVitalesFamiliares: ciclosVitalesSeleccionados.map(id => parseInt(id)),
      factoresRiesgo,
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId
    };
  
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/adulto`,
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        setSuccessMessage('Ficha clínica creada exitosamente');
        onIngresar(response.data.data);
        limpiarFormulario();
        // Opcional: limpiar el formulario o redirigir después de un tiempo
        setTimeout(() => {
          // Aquí puedes limpiar el formulario o redirigir
        }, 3000);
      } else {
        setSubmitError('Error al crear la ficha clínica');
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        estado: error.response?.status
      });
      setSubmitError(error.response?.data?.message || 'Error al crear la ficha clínica');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="alert alert-info">
        <strong>Ingreso Programa Telecuidado</strong>
        <p>
          Programa de seguimiento y acompañamiento para adultos en el marco del cuidado 
          integral de la salud, enfocado en el monitoreo y apoyo continuo.
        </p>
      </div>

      {/* Datos Personales */}
      <div className="card mb-4">
        <div className="card-header">Datos Personales</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Fecha</label>
                <input 
                  type="date" 
                  className={`form-control ${errores.fecha ? 'is-invalid' : ''}`}
                  name="fecha"
                  value={datosAdulto.fecha}
                  onChange={handleChange}
                />
                {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-4">
              <div className="form-group">
                <label>Nombres</label>
                <input
                  type="text"
                  className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                  name="nombres"
                  value={datosAdulto.nombres}
                  onChange={handleChange}
                  placeholder="Ingrese nombres"
                />
                {errores.nombres && <div className="invalid-feedback">{errores.nombres}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Apellidos</label>
                <input
                  type="text"
                  className={`form-control ${errores.apellidos ? 'is-invalid' : ''}`}
                  name="apellidos"
                  value={datosAdulto.apellidos}
                  onChange={handleChange}
                  placeholder="Ingrese apellidos"
                />
                {errores.apellidos && <div className="invalid-feedback">{errores.apellidos}</div>}
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="form-group">
                <label>RUT</label>
                <input
                  type="text"
                  className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                  name="rut"
                  value={datosAdulto.rut}
                  onChange={handleChange}
                  placeholder="12345678-9"
                />
                {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-4">
              <div className="form-group">
                <label>Edad</label>
                <input
                  type="number"
                  className={`form-control ${errores.edad ? 'is-invalid' : ''}`}
                  name="edad"
                  value={datosAdulto.edad}
                  onChange={handleChange}
                  placeholder="Ingrese edad"
                />
                {errores.edad && <div className="invalid-feedback">{errores.edad}</div>}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Diagnóstico</label>
                <input
                  type="text"
                  className={`form-control ${errores.diagnostico ? 'is-invalid' : ''}`}
                  name="diagnostico"
                  value={datosAdulto.diagnostico}
                  onChange={handleChange}
                  placeholder="Ingrese diagnóstico"
                />
                {errores.diagnostico && <div className="invalid-feedback">{errores.diagnostico}</div>}
              </div>
            </div>
            <div className="col-md-4">
            <div className="form-group">
                <label>Escolaridad</label>
                <select
                  className={`form-control ${errores.escolaridad ? 'is-invalid' : ''}`}
                  name="escolaridad"
                  value={datosAdulto.escolaridad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {nivelesEscolaridad.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>
                      {nivel.nivel}
                    </option>
                  ))}
                </select>
                {errores.escolaridad && <div className="invalid-feedback">{errores.escolaridad}</div>}
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-4">
              <div className="form-group">
                <label>Ocupación</label>
                <input
                  type="text"
                  className="form-control"
                  name="ocupacion"
                  value={datosAdulto.ocupacion}
                  onChange={handleChange}
                  placeholder="Ingrese ocupación"
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={datosAdulto.direccion}
                  onChange={handleChange}
                  placeholder="Ingrese dirección completa"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Familiar */}
      <div className="card mb-4">
        <div className="card-header">Información Familiar</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label>Con quién vive</label>
                  <input
                    type="text"
                    className="form-control"
                    name="conQuienVive"
                    value={datosAdulto.conQuienVive}
                    onChange={handleChange}
                    placeholder="Indique con quién vive"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Tipo de familia</label>
                  <div className="checkbox-group">
                    {tiposFamilia.map((tipo) => (
                      <div key={tipo.id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`tipo-${tipo.id}`}
                          value={tipo.id}
                          checked={tiposFamiliaSeleccionados.includes(tipo.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTiposFamiliaSeleccionados([...tiposFamiliaSeleccionados, tipo.id]);
                            } else {
                              setTiposFamiliaSeleccionados(
                                tiposFamiliaSeleccionados.filter(id => id !== tipo.id)
                              );
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor={`tipo-${tipo.id}`}>
                          {tipo.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Ciclo vital familiar</label>
                <div className="checkbox-group">
                  {ciclosVitales.map((ciclo) => (
                    <div key={ciclo.id} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`ciclo-${ciclo.id}`}
                        value={ciclo.id}
                        checked={ciclosVitalesSeleccionados.includes(ciclo.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCiclosVitalesSeleccionados([...ciclosVitalesSeleccionados, ciclo.id]);
                          } else {
                            setCiclosVitalesSeleccionados(
                              ciclosVitalesSeleccionados.filter(id => id !== ciclo.id)
                            );
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`ciclo-${ciclo.id}`}>
                        {ciclo.ciclo}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Contacto y Seguimiento */}
      <div className="card mb-4">
        <div className="card-header">Información de Contacto y Seguimiento</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Teléfono Principal</label>
                <input
                  type="tel"
                  className={`form-control ${errores.telefonoPrincipal ? 'is-invalid' : ''}`}
                  name="telefonoPrincipal"
                  value={datosAdulto.telefonoPrincipal}
                  onChange={handleChange}
                  placeholder="912345678"
                />
                {errores.telefonoPrincipal && <div className="invalid-feedback">{errores.telefonoPrincipal}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Teléfono Secundario</label>
                <input
                  type="tel"
                  className="form-control"
                  name="telefonoSecundario"
                  value={datosAdulto.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="912345678"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Horario de Llamada</label>
                <input
                  type="text"
                  className="form-control"
                  name="horarioLlamada"
                  value={datosAdulto.horarioLlamada}
                  onChange={handleChange}
                  placeholder="Ej: 10:00 - 12:00"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Conectividad</label>
                <input
                  type="text"
                  className="form-control"
                  name="conectividad"
                  value={datosAdulto.conectividad}
                  onChange={handleChange}
                  placeholder="Ej: Buena, Regular, Mala"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Valor HbA1c Previo</label>
                <input
                  type="text"
                  className="form-control"
                  name="valorHbac1"
                  value={datosAdulto.valorHbac1}
                  onChange={handleChange}
                  placeholder="Ingrese valor HbA1c"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Factores de Riesgo */}
      <div className="card mb-4">
        <div className="card-header">Factores de Riesgo</div>
        <div className="card-body">
          <div className="form-check">
            <input 
              type="checkbox" 
              className="form-check-input" 
              id="alcoholDrogas"
              checked={factoresRiesgo.alcoholDrogas}
              onChange={(e) => setFactoresRiesgo({...factoresRiesgo, alcoholDrogas: e.target.checked})}
            />
            <label className="form-check-label" htmlFor="alcoholDrogas">Consumo de Alcohol/Drogas</label>
          </div>
          <div className="form-check">
            <input 
              type="checkbox" 
              className="form-check-input"
              id="tabaquismo"
              checked={factoresRiesgo.tabaquismo}
              onChange={(e) => setFactoresRiesgo({...factoresRiesgo, tabaquismo: e.target.checked})}
            />
            <label className="form-check-label" htmlFor="tabaquismo">Tabaquismo</label>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="alert alert-danger mt-3">
          {submitError}
        </div>
      )}

      {/* Botones */}
      <div className="d-flex justify-content-center mt-5 mb-5">
        <button 
          className="btn btn-primary px-4 mx-2" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar Ficha Clínica'}
        </button>
        <button 
          className="btn btn-secondary px-4 mx-2" 
          onClick={onVolver}
          disabled={isSubmitting}
        >
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

export default FichaClinicaAdulto;