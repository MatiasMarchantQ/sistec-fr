import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaAdulto = ({ onVolver, onIngresar, institucionId, datosIniciales }) => {
  const { user, getToken } = useAuth();
  const initialDatosAdulto = {
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
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState('');
  const [diagnosticoOtro, setDiagnosticoOtro] = useState('');
  const [tiposFamiliaSeleccionados, setTiposFamiliaSeleccionados] = useState('');
  const [tipoFamiliaOtro, setTipoFamiliaOtro] = useState('');
  const [cicloVitalSeleccionado, setCicloVitalSeleccionado] = useState(null);
  const [factoresRiesgo, setFactoresRiesgo] = useState({
    alcoholDrogas: false,
    tabaquismo: false,
    otros: ''
  });
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [errores, setErrores] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Añadir el estado para escolaridad
  const [escolaridadSeleccionada, setEscolaridadSeleccionado] = useState('');

  useEffect(() => {
    console.log('Datos Iniciales Recibidos:', datosIniciales);

    // Cargar datos iniciales si están disponibles
    if (datosIniciales) {
      setDatosAdulto(prev => ({
        ...prev,
        nombres: datosIniciales.nombres || '',
        apellidos: datosIniciales.apellidos || '',
        rut: datosIniciales.rut || '',
        edad: datosIniciales.edad || '',
        ocupacion: datosIniciales.ocupacion || '',
        direccion: datosIniciales.direccion || '',
        conQuienVive: datosIniciales.conQuienVive || '',
        telefonoPrincipal: datosIniciales.telefonoPrincipal || '',
        telefonoSecundario: datosIniciales.telefonoSecundario || '',
        horarioLlamada: datosIniciales.horarioLlamada || '',
        conectividad: datosIniciales.conectividad || '',
        valorHbac1: datosIniciales.valorHbac1 || '',
        
        // Añadir diagnóstico y escolaridad directamente al estado de datosAdulto
        diagnostico: datosIniciales.diagnostico?.id || datosIniciales.diagnostico || '',
        escolaridad: datosIniciales.escolaridad?.id || datosIniciales.escolaridad || ''
      }));

      // Asignar los estados adicionales
      setDiagnosticoSeleccionado(datosIniciales.diagnostico?.id || datosIniciales.diagnostico || '');
      setEscolaridadSeleccionado(datosIniciales.escolaridad?.id || datosIniciales.escolaridad || '');
      setTiposFamiliaSeleccionados(
        datosIniciales.tiposFamilia?.id || 
        datosIniciales.tiposFamilia || 
        ''
      );

      console.log( 'TIPO FAMILIA ADULTO', datosIniciales.tiposFamilia?.id || 
        datosIniciales.tiposFamilia || 
        '')
      setCicloVitalSeleccionado(
        datosIniciales.cicloVitalFamiliar?.id || 
        datosIniciales.cicloVitalFamiliar || 
        ''
      );
      setFactoresRiesgo({
        alcoholDrogas: datosIniciales.alcoholDrogas || 
                       datosIniciales.factoresRiesgo?.alcoholDrogas || 
 false,
        tabaquismo: datosIniciales.tabaquismo || 
                    datosIniciales.factoresRiesgo?.tabaquismo || 
                    false,
        otros: datosIniciales.otrosFactoresRiesgo || 
               datosIniciales.factoresRiesgo?.otros || 
               ''
      });
    }
  }, [datosIniciales]);

  useEffect(() => {
    obtenerNivelesEscolaridad();
    obtenerTiposFamilia();
    obtenerCiclosVitales();
    obtenerDiagnosticos();
  }, []);

  const obtenerDiagnosticos = async () => {
    try {
        const token = getToken();
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/obtener/diagnosticos`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setDiagnosticos(response.data);
    } catch (error) {
        console.error('Error al obtener diagnósticos:', error);
    }
  };

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
    
    if (!datosAdulto.nombres) erroresValidacion.nombres = 'Los nombres son requeridos';
    if (!datosAdulto.apellidos) erroresValidacion.apellidos = 'Los apellidos son requeridos';
    if (!datosAdulto.rut) erroresValidacion.rut = 'El RUT es requerido';
    if (!datosAdulto.edad) erroresValidacion.edad = 'La edad es requerida';
    if (!diagnosticoSeleccionado && !diagnosticoOtro) {
      erroresValidacion.diagnostico = 'Debe seleccionar un diagnóstico o especificar uno personalizado';
    }
    if (!datosAdulto.escolaridad) erroresValidacion.escolaridad = 'La escolaridad es requerida';
    if (!datosAdulto.telefonoPrincipal) erroresValidacion.telefonoPrincipal = 'El teléfono principal es requerido';

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const limpiarFormulario = () => {
    setDatosAdulto(initialDatosAdulto);
    setDiagnosticoSeleccionado('');
    setDiagnosticoOtro('');
    setTiposFamiliaSeleccionados([]);
    setCicloVitalSeleccionado('');
    setFactoresRiesgo({
      alcoholDrogas: false,
      tabaquismo: false,
      otros: ''
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
      diagnostico_id: diagnosticoSeleccionado !== 'otro' ? diagnosticoSeleccionado : null,
      diagnostico_otro: diagnosticoSeleccionado === 'otro' ? diagnosticoOtro : null,
      tiposFamilia: tiposFamiliaSeleccionados.map(id => parseInt(id)),
      tipoFamiliaOtro: tiposFamiliaSeleccionados.includes('Otras') ? tipoFamiliaOtro : null,
      ciclo_vital_familiar_id: cicloVitalSeleccionado,
      factoresRiesgo,
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId,
      isReevaluacion: datosIniciales ? true : false
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
        toast.success('Ficha clínica creada exitosamente');
        onIngresar(response.data.data);
        limpiarFormulario();
        setTimeout(() => {
        }, 3000);
      } else {
        setSubmitError('Error al crear la ficha clínica');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al crear la ficha clínica');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <ToastContainer />
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
    onInput={(e) => {
      const valor = e.target.value;
      
      // Permite escribir libremente
      handleChange(e);
      
      // Validación posterior
      const numero = parseInt(valor);
      if (!isNaN(numero) && (numero < 18 || numero > 120)) {
        // Si está fuera del rango, marca el error
        setErrores(erroresAnteriores => ({
          ...erroresAnteriores,
          edad: 'La edad debe estar entre 18 y 120 años'
        }));
      } else {
        // Limpia el error si está en el rango
        setErrores(erroresAnteriores => ({
          ...erroresAnteriores,
          edad: ''
        }));
      }
    }}
    min="18"
    max="120"
    placeholder="Ingrese edad"
  />
  {errores.edad && <div className="invalid-feedback">{errores.edad}</div>}
</div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Diagnóstico</label>
                <select
                  className={`form-control ${errores.diagnostico ? 'is-invalid' : ''}`}
                  value={diagnosticoSeleccionado}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDiagnosticoSeleccionado(value);
                    // Si no es "Otras", limpiar el campo de diagnóstico personalizado
                    if (value !== 'otro') {
                      setDiagnosticoOtro('');
                    }
                  }}
                >
                <option value="">Seleccione un diagnóstico</option>
                {console.log('Diagnósticos:', diagnosticos)}
                {diagnosticos.map((diagnostico, index) => (
                  <option 
                    key={`${diagnostico.id}-${index}`}
                    value={diagnostico.id}
                  >
                    {diagnostico.nombre}
                  </option>
                ))}
                <option value="otro">Otro diagnóstico</option>
                </select>
                {errores.diagnostico && <div className="invalid-feedback">{errores.diagnostico}</div>}
                {/* Campo para diagnóstico personalizado */}
                {diagnosticoSeleccionado === 'otro' && (
                  <input
                    type="text"
                    className={`form-control mt-2 ${errores.diagnosticoOtro ? 'is-invalid' : ''}`}
                    value={diagnosticoOtro}
                    onChange={(e) => setDiagnosticoOtro(e.target.value)}
                    placeholder="Especifique el diagnóstico"
                  />
                )}
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
                  {nivelesEscolaridad.map((nivel,index) => (
                    <option 
                      key={`${nivel.id}-${index}`}
                      value={nivel.id}
                    >
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
                <select
                    className={`form-control ${errores.tiposFamilia ? 'is-invalid' : ''}`}
                    name="tiposFamilia"
                    value={tiposFamiliaSeleccionados}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'Otras') {
                            setTipoFamiliaOtro('');
                            setTiposFamiliaSeleccionados(['Otras']);
                        } else {
                            setTiposFamiliaSeleccionados([value]);
                        }
                    }}
                >
                    <option value="">Seleccione...</option>
                    {tiposFamilia.map((tipo, index) => (
                      <option 
                        key={`${tipo.id}-${index}`}
                        value={tipo.id}
                      >
                        {tipo.nombre}
                      </option>
                    ))}
                    <option value="Otras">Otras</option>
                </select>
                {tiposFamiliaSeleccionados.includes('Otras') && (
                    <input
                        type="text"
                        className="form-control mt-2"
                        value={tipoFamiliaOtro}
                        onChange={(e) => setTipoFamiliaOtro(e.target.value)}
                        placeholder="Especifique otro tipo de familia"
                    />
                )}

              </div>
            </div>
            <div className="col-md-6">
            <div className="form-group">
              <label>Ciclo vital familiar</label>
              <select
                className={`form-control ${errores.ciclosVitales ? 'is-invalid' : ''}`}
                value={cicloVitalSeleccionado || ''} // Usa el ID directamente
                onChange={(e) => {
                  const value = e.target.value;
                  setCicloVitalSeleccionado(value); // Actualiza el estado con el ciclo seleccionado
                }}
              >
                <option value="">Seleccione...</option>
                {ciclosVitales.map((ciclo, index) => (
                  <option 
                    key={`${ciclo.id}-${index}`}
                    value={ciclo.id}
                  >
                    {ciclo.ciclo}
                  </option>
                ))}
              </select>
              {errores.ciclosVitales && <div className="invalid-feedback">{errores.ciclosVitales}</div>}
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
            <div className="form-group mt-3">
              <label>Especifique</label>
              <input
                  type="text"
                  className="form-control"
                  value={factoresRiesgo.otros}
                  onChange={(e) => setFactoresRiesgo({...factoresRiesgo, otros: e.target.value})}
                  placeholder="Ejemplo: cerveza, marihuana, cigarrillo, etc."
              />
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