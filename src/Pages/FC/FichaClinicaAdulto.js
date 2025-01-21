import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const FichaClinicaAdulto = ({ onVolver, onIngresar, institucionId, datosIniciales, ultimaReevaluacion = null, reevaluacionSeleccionada = null, modoEdicion }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [diagnosticoOtro, setDiagnosticoOtro] = useState('');

  const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState([]);

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

  useEffect(() => {
    // Determinar la fuente de datos principal
    const datosBase = reevaluacionSeleccionada || ultimaReevaluacion || datosIniciales;

    if (datosBase) {
      // Lógica de carga de datos existente
      setDatosAdulto(prev => ({
        ...prev,
        nombres: datosBase.nombres || datosBase.paciente?.nombres || '',
        apellidos: datosBase.apellidos || datosBase.paciente?.apellidos || '',
        rut: datosBase.rut || datosBase.paciente?.rut || '',
        edad: datosBase.edad || datosBase.paciente?.edad || '',
        ocupacion: datosBase.ocupacion || '',
        direccion: datosBase.direccion || '',
        conQuienVive: datosBase.conQuienVive || '',
        telefonoPrincipal: datosBase.telefonoPrincipal || datosBase.paciente?.telefonoPrincipal || '',
        telefonoSecundario: datosBase.telefonoSecundario || datosBase.paciente?.telefonoSecundario || '',
        horarioLlamada: datosBase.horarioLlamada || '',
        conectividad: datosBase.conectividad || '',
        valorHbac1: datosBase.valorHbac1 || datosBase.factoresRiesgo?.valorHbac1 || '',
        escolaridad: datosBase.escolaridad?.id || datosBase.escolaridad || ''
      }));

      // Manejar diagnósticos
      const diagnosticosAMostrar = datosBase.diagnosticos || [];

      // Extraer diagnósticos con ID
      const diagnosticosConId = diagnosticosAMostrar
        .filter(diag => diag.id !== null && !diag.esOtro)
        .map(diag => diag.id.toString());

      // Extraer diagnóstico otro (si existe)
      const diagnosticoOtroObj = diagnosticosAMostrar.find(diag => diag.esOtro);

      // Preparar los diagnósticos seleccionados
      const diagnosticosSeleccionadosFinales = [...diagnosticosConId];

      // Agregar 'otro' si existe un diagnóstico personalizado
      if (diagnosticoOtroObj || datosBase.diagnostico_otro) {
        diagnosticosSeleccionadosFinales.push('otro');
      }

      // Establecer estados
      setDiagnosticosSeleccionados(diagnosticosSeleccionadosFinales);

      // Establecer diagnóstico otro
      setDiagnosticoOtro(
        diagnosticoOtroObj?.nombre ||
        datosBase.diagnostico_otro ||
        ''
      );

      // Manejo de tipos de familia
      let tiposFamiliaPreseleccionados = [];
      const tiposFamiliaBase = datosBase.tiposFamilia ||
        datosBase.informacionFamiliar?.tiposFamilia ||
        [];

      if (tiposFamiliaBase.length > 0) {
        tiposFamiliaPreseleccionados = tiposFamiliaBase.map(tipo =>
          typeof tipo === 'object' ? (tipo.id || tipo) : tipo
        );

        // Verificar si incluye "Otras"
        if (tiposFamiliaBase.some(tipo =>
          (typeof tipo === 'object' && tipo.tipoFamiliaOtro) ||
          tipo === 'Otras'
        )) {
          tiposFamiliaPreseleccionados = ['Otras'];
          const tipoOtro = tiposFamiliaBase.find(tipo =>
            typeof tipo === 'object' && tipo.tipoFamiliaOtro
          );
          setTipoFamiliaOtro(tipoOtro?.tipoFamiliaOtro || '');
        }
      }

      setTiposFamiliaSeleccionados(tiposFamiliaPreseleccionados);

      // Ciclo Vital Familiar
      setCicloVitalSeleccionado(
        datosBase.cicloVitalFamiliar?.id ||
        datosBase.ciclo_vital_familiar_id ||
        datosBase.cicloVitalFamiliar ||
        ''
      );

      // Factores de Riesgo
      setFactoresRiesgo({
        alcoholDrogas: datosBase.alcoholDrogas ||
          datosBase.factoresRiesgo?.alcoholDrogas ||
          false,
        tabaquismo: datosBase.tabaquismo ||
          datosBase.factoresRiesgo?.tabaquismo ||
          false,
        otros: datosBase.otrosFactoresRiesgo ||
          datosBase.factoresRiesgo?.otros ||
          ''
      });
    }
  }, [datosIniciales, ultimaReevaluacion, reevaluacionSeleccionada]);

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
    // Validación de diagnósticos
    if (diagnosticosSeleccionados.length === 0) {
      erroresValidacion.diagnostico = 'Debe seleccionar al menos un diagnóstico';
    }

    // Si se selecciona "Otro", requiere especificar
    if (diagnosticosSeleccionados.includes('otro') && !diagnosticoOtro.trim()) {
      erroresValidacion.diagnosticoOtro = 'Debe especificar el diagnóstico personalizado';
    }
    if (!datosAdulto.escolaridad) erroresValidacion.escolaridad = 'La escolaridad es requerida';
    if (!datosAdulto.telefonoPrincipal) erroresValidacion.telefonoPrincipal = 'El teléfono principal es requerido';

    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  const limpiarFormulario = () => {
    setDatosAdulto(initialDatosAdulto);
    setDiagnosticosSeleccionados('');
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

  const handleUpdate = async () => {
    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    const datosParaEnviar = {
      tipo: 'adulto',
      ...datosAdulto,
      diagnosticos_id: diagnosticosSeleccionados
        .filter(diag => diag !== 'otro')
        .map(id => parseInt(id)),

      // Manejar diagnóstico otro solo si está seleccionado y tiene valor
      diagnostico_otro: diagnosticosSeleccionados.includes('otro') && diagnosticoOtro.trim()
        ? diagnosticoOtro
        : null,
      tiposFamilia: tiposFamiliaSeleccionados.includes('Otras')
        ? []
        : tiposFamiliaSeleccionados.map(id => parseInt(id)),
      tipoFamiliaOtro: tiposFamiliaSeleccionados.includes('Otras') ? tipoFamiliaOtro : null,
      ciclo_vital_familiar_id: cicloVitalSeleccionado,
      factoresRiesgo,
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId,
      isReevaluacion: true
    };

    try {
      const token = getToken();

      // Determinar el ID correcto de la reevaluación
      const reevaluacionId = reevaluacionSeleccionada?.id ||
        ultimaReevaluacion?.id ||
        datosIniciales?.id;

      if (!reevaluacionId) {
        throw new Error('No se encontró un ID de reevaluación válido');
      }

      const url = `${process.env.REACT_APP_API_URL}/fichas-clinicas/reevaluaciones/${reevaluacionId}`;

      const response = await axios.put(url, datosParaEnviar, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Reevaluación actualizada exitosamente');
        onIngresar(response.data.data);
      } else {
        setSubmitError('Error al actualizar la reevaluación');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la reevaluación');
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
      diagnosticos_id: diagnosticosSeleccionados
        .filter(diag => diag !== 'otro')
        .map(id => parseInt(id)), 
      diagnostico_otro: diagnosticosSeleccionados.includes('otro')
        ? diagnosticoOtro
        : null,
      tiposFamilia: tiposFamiliaSeleccionados.map(id => parseInt(id)),
      tipoFamiliaOtro: tiposFamiliaSeleccionados.includes('Otras') ? tipoFamiliaOtro : null,
      ciclo_vital_familiar_id: cicloVitalSeleccionado,
      factoresRiesgo,
      estudiante_id: user.estudiante_id,
      usuario_id: user.id,
      institucion_id: institucionId,
      isReevaluacion: !!datosIniciales // Convertir a booleano
    };

    try {
      const token = getToken();
      const url = datosIniciales?.id
        ? `${process.env.REACT_APP_API_URL}/fichas-clinicas/adulto/${datosIniciales.id}`
        : `${process.env.REACT_APP_API_URL}/fichas-clinicas/adulto`;

      const method = datosIniciales?.id ? 'put' : 'post';

      const response = await axios[method](url, datosParaEnviar, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (method === 'post') {
          toast.success('Ficha clínica creada exitosamente');
        } else {
          toast.success('Ficha clínica actualizada exitosamente');
        }
        onIngresar(response.data.data);
        limpiarFormulario();
      } else {
        setSubmitError('Error al actualizar la ficha clínica');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la ficha clínica');
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {submitError && (
        <div className="alert alert-danger mt-3">
          {submitError}
        </div>
      )}
      <div className="alert alert-info">
        <strong>Ingreso Programa Telecuidado</strong>
        <p>
          Programa de seguimiento y acompañamiento para adultos en el marco del cuidado
          integral de la salud, enfocado en el monitoreo y apoyo continuo.
        </p>
      </div>

      {/* Datos Personales */}
      <div className="card mb-4">
        <div className="card-header custom-card text-light">Datos Personales</div>
        <div className="card-body">
          <div className="row mt-3">
            <div className="col-md-4">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  className={`form-control ${errores.nombres ? 'is-invalid' : ''}`}
                  name="nombres"
                  value={datosAdulto.nombres}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
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
                  className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                  name="rut"
                  value={datosAdulto.rut}
                  onChange={handleChange}
                  placeholder="Ej: 12345678-9"
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
                    handleChange(e);
                    const numero = parseInt(valor);
                    if (!isNaN(numero) && (numero < 18 || numero > 120)) {
                      setErrores(erroresAnteriores => ({
                        ...erroresAnteriores,
                        edad: 'La edad debe estar entre 18 y 120 años'
                      }));
                    } else {
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
            <div className="form-group">
              <label>Diagnósticos</label>
              <div className="border p-2">
                {diagnosticos.map((diagnostico) => (
                  <div key={diagnostico.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`diagnostico-${diagnostico.id}`}
                      value={diagnostico.id}
                      checked={diagnosticosSeleccionados.includes(diagnostico.id.toString())}
                      onChange={(e) => {
                        const id = diagnostico.id.toString();
                        setDiagnosticosSeleccionados(prev =>
                          e.target.checked
                            ? [...prev, id]
                            : prev.filter(selectedId => selectedId !== id)
                        );
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`diagnostico-${diagnostico.id}`}
                    >
                      {diagnostico.nombre}
                    </label>
                  </div>
                ))}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="diagnostico-otro"
                    checked={diagnosticosSeleccionados.includes('otro')}
                    onChange={(e) => {
                      setDiagnosticosSeleccionados(prev =>
                        e.target.checked
                          ? [...prev, 'otro']
                          : prev.filter(item => item !== 'otro')
                      );
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="diagnostico-otro"
                  >
                    Otro diagnóstico
                  </label>
                </div>
              </div>

              {diagnosticosSeleccionados.includes('otro') && (
                <input
                  type="text"
                  className={`form-control mt-2 ${errores.diagnosticoOtro ? 'is-invalid' : ''}`}
                  value={diagnosticoOtro}
                  name="diagnosticoOtro"
                  onChange={(e) => setDiagnosticoOtro(e.target.value)}
                  placeholder="Especifique el diagnóstico"
                />
              )}
              {errores.diagnostico && <div className="invalid-feedback">{errores.diagnostico}</div>}
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
                  {nivelesEscolaridad.map((nivel, index) => (
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
                  placeholder="Ingrese la ocupación"
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
                  placeholder="Ingrese la dirección completa"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Familiar */}
      <div className="card mb-4">
        <div className="card-header custom-card text-light">Información Familiar</div>
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
                    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);

                    if (selectedValues.includes('Otras')) {
                      setTiposFamiliaSeleccionados(['Otras']);
                      setTipoFamiliaOtro('');
                    } else {
                      const filteredValues = selectedValues.filter(val => val !== 'Otras');
                      setTiposFamiliaSeleccionados(filteredValues);
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
                    name="tipoFamiliaOtro"
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
                  value={cicloVitalSeleccionado || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCicloVitalSeleccionado(value);
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
        <div className="card-header custom-card text-light">Información de Contacto y Seguimiento</div>
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
                  placeholder="Ej: 912345678"
                />
                {errores.telefonoPrincipal && <div className="invalid-feedback">{errores.telefonoPrincipal}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Teléfono Secundario</label>
                <input
                  type="tel"
                  className={`form-control ${errores.telefonoSecundario ? 'is-invalid' : ''}`}
                  name="telefonoSecundario"
                  value={datosAdulto.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="Ej: 912345678"
                />
                {errores.telefonoSecundario && <div className="invalid-feedback">{errores.telefonoSecundario}</div>}
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
                  placeholder="Ej: 10:00 AM a 12:00 AM"
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
                  placeholder="Ej: Buena, Regular, Mala, etc..."
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Valor HbA1c Previo</label>
                <input
                  type="number"
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
        <div className="card-header custom-card text-light">Factores de Riesgo</div>
        <div className="card-body">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="alcoholDrogas"
              name="alcoholDrogas"
              checked={factoresRiesgo.alcoholDrogas}
              onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, alcoholDrogas: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="alcoholDrogas">Consumo de Alcohol/Drogas</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="tabaquismo"
              name="tabaquismo"
              checked={factoresRiesgo.tabaquismo}
              onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, tabaquismo: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="tabaquismo">Tabaquismo</label>
          </div>
          <div className="form-group mt-3">
            <label>Especifique</label>
            <input
              type="text"
              className="form-control"
              value={factoresRiesgo.otros}
              name="Especifique"
              onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, otros: e.target.value })}
              placeholder="Ej: cerveza, marihuana, cigarrillo, etc."
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
        {!modoEdicion && (
          <button
            className="btn btn-primary px-4 mx-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar Ficha Clínica'}
          </button>
        )}
        <button className="btn btn-secondary px-4 mx-2" onClick={onVolver}>
          Volver
        </button>
        {modoEdicion && (
          <button
            className="btn btn-warning px-4 mx-2"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Ficha Clínica'}
          </button>
        )}
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