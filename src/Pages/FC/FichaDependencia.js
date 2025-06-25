import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import VisitaDomiciliaria from './VisitaDomiciliaria';

const FichaDependencia = ({ onVolver, onIngresar, institucionId }) => {
    const navigate = useNavigate();
    const { user, getToken } = useAuth();

    const initialDatosDependencia = {
        fecha_ingreso: new Date().toISOString().split('T')[0],
        nombre_paciente: null,
        apellido_paciente: null,
        rut_paciente: null,
        edad_paciente: null,
        fecha_nacimiento_paciente: null,
        diagnostico_ids: [],
        otro_diagnostico: null,
        indice_barthel: null,
        grado_dependencia: null,
        causa_dependencia_tiempo: null,
        escolaridad_id: null,
        estado_civil: null,
        direccion_paciente: null,
        convivencia: null,
        posee_carne_discapacidad: null,
        recibe_pension_subsidio_jubilacion: null,
        tipo_beneficio: null,
        nombre_cuidador: null,
        rut_cuidador: null,
        edad_cuidador: null,
        fecha_nacimiento_cuidador: null,
        direccion_cuidador: null,
        ocupacion_cuidador: null,
        parentesco_cuidador: null,
        cuidador_recibe_estipendio: null,
        puntaje_escala_zarit: null,
        nivel_sobrecarga_zarit: null,
        control_cesfam_dependencia: null,
        consulta_servicio_urgencia: null,
        tipo_familia_id: null,
        otro_tipo_familia: null,
        ciclo_vital_familiar_id: null,
        factores_riesgo_familiar: null,
        telefono_1: null,
        telefono_2: null,
        horario_llamada: null,
        conectividad: null
    };

    const [datosDependencia, setDatosDependencia] = useState(initialDatosDependencia);
    const [otroDiagnosticoChecked, setOtroDiagnosticoChecked] = useState(false); // Estado para el checkbox de "Otro"
    const [diagnosticos, setDiagnosticos] = useState([]);
    const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
    const [tiposFamilia, setTiposFamilia] = useState([]);
    const [ciclosVitales, setCiclosVitales] = useState([]);
    const [errores, setErrores] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Estado para controlar el paso: 1 = ficha paciente, 2 = visita domiciliaria
    const [paso, setPaso] = useState(1);

    // ID del paciente creado recién
    const [pacienteCreadoId, setPacienteCreadoId] = useState(null);

    useEffect(() => {
        obtenerDiagnosticos();
        obtenerNivelesEscolaridad();
        obtenerTiposFamilia();
        obtenerCiclosVitales();
    }, []);

    const obtenerDiagnosticos = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/diagnosticos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiagnosticos(response.data);
        } catch (error) {
            console.error('Error al obtener diagnósticos:', error);
        }
    };

    const obtenerNivelesEscolaridad = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNivelesEscolaridad(response.data);
        } catch (error) {
            console.error('Error al obtener niveles de escolaridad:', error);
        }
    };

    const obtenerTiposFamilia = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-familia`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiposFamilia(response.data);
        } catch (error) {
            console.error('Error al obtener tipos de familia:', error);
        }
    };

    const obtenerCiclosVitales = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCiclosVitales(response.data);
        } catch (error) {
            console.error('Error al obtener ciclos vitales:', error);
        }
    };

    // Función para calcular el grado de dependencia basado en el índice Barthel
    const calcularGradoDependencia = (indiceBarthel) => {
        if (!indiceBarthel && indiceBarthel !== 0) return '';

        const indice = parseInt(indiceBarthel);

        if (indice === 100) return 'Independencia total';
        if (indice >= 60 && indice <= 95) return 'Dependencia leve';
        if (indice >= 40 && indice <= 55) return 'Dependencia moderada';
        if (indice >= 20 && indice <= 35) return 'Dependencia severa';
        if (indice >= 0 && indice <= 15) return 'Dependencia total';

        return ''; // Por si el valor está fuera del rango válido
    };

    // Función para calcular el nivel de sobrecarga basado en la Escala Zarit
    const calcularNivelSobrecarga = (puntajeZarit) => {
        if (!puntajeZarit && puntajeZarit !== 0) return '';

        const puntaje = parseInt(puntajeZarit);

        if (puntaje < 47) return 'Ausencia de sobrecarga';
        if (puntaje >= 47 && puntaje <= 55) return 'Sobrecarga leve';
        if (puntaje > 55) return 'Sobrecarga intensa';

        return ''; // Por si el valor está fuera del rango válido
    };

    // Actualizar el handleChange para calcular automáticamente el grado de dependencia
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'diagnostico_ids') {
            // Manejar checkboxes
            const updatedDiagnosticos = checked
                ? [...datosDependencia.diagnostico_ids, value]
                : datosDependencia.diagnostico_ids.filter(id => id !== value);

            setDatosDependencia(prev => ({
                ...prev,
                diagnostico_ids: updatedDiagnosticos
            }));
        } else if (name === 'otro_diagnostico') {
            setDatosDependencia(prev => ({
                ...prev,
                otro_diagnostico: value
            }));
        } else if (name === 'otro_diagnostico_checkbox') {
            setOtroDiagnosticoChecked(checked);
            if (!checked) {
                setDatosDependencia(prev => ({
                    ...prev,
                    otro_diagnostico: ''
                }));
            }
        } else if (name === 'posee_carne_discapacidad' || name === 'recibe_pension_subsidio_jubilacion' || name === 'cuidador_recibe_estipendio') {
            // Manejar radio buttons de sí/no - convertir string a boolean
            setDatosDependencia(prev => ({
                ...prev,
                [name]: value === 'true'
            }));
        } else if (name === 'indice_barthel') {
            // Calcular automáticamente el grado de dependencia cuando cambie el índice Barthel
            const gradoDependencia = calcularGradoDependencia(value);
            setDatosDependencia(prev => ({
                ...prev,
                indice_barthel: value,
                grado_dependencia: gradoDependencia
            }));
        } else if (name === 'puntaje_escala_zarit') {
            // Calcular automáticamente el nivel de sobrecarga cuando cambie el puntaje Zarit
            const nivelSobrecarga = calcularNivelSobrecarga(value);
            setDatosDependencia(prev => ({
                ...prev,
                puntaje_escala_zarit: value,
                nivel_sobrecarga_zarit: nivelSobrecarga
            }));
        } else if (name !== 'grado_dependencia' && name !== 'nivel_sobrecarga_zarit') {
            // Evitar que se actualicen los campos calculados automáticamente
            setDatosDependencia(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const erroresValidacion = {};

        // Validaciones requeridas
        if (!datosDependencia.nombre_paciente?.trim()) {
            erroresValidacion.nombre_paciente = 'El nombre del paciente es requerido';
        }

        if (!datosDependencia.apellido_paciente?.trim()) {
            erroresValidacion.apellido_paciente = 'El apellido del paciente es requerido';
        }

        if (!datosDependencia.rut_paciente?.trim()) {
            erroresValidacion.rut_paciente = 'El RUT del paciente es requerido';
        }

        if (!datosDependencia.edad_paciente) {
            erroresValidacion.edad_paciente = 'La edad del paciente es requerida';
        } else if (datosDependencia.edad_paciente < 0 || datosDependencia.edad_paciente > 120) {
            erroresValidacion.edad_paciente = 'La edad debe estar entre 0 y 120 años';
        }

        if (!datosDependencia.fecha_nacimiento_paciente) {
            erroresValidacion.fecha_nacimiento_paciente = 'La fecha de nacimiento es requerida';
        }

        if (datosDependencia.diagnostico_ids.length === 0 && !datosDependencia.otro_diagnostico.trim()) {
            erroresValidacion.diagnostico_ids = 'Al menos un diagnóstico es requerido';
        }

        if (!datosDependencia.telefono_1?.trim()) {
            erroresValidacion.telefono_1 = 'El teléfono principal es requerido';
        }

        // Validación de RUT básica (formato chileno)
        if (datosDependencia.rut_paciente && !/^\d{7,8}-[\dkK]$/.test(datosDependencia.rut_paciente.trim())) {
            erroresValidacion.rut_paciente = 'Formato de RUT inválido (ej: 12345678-9)';
        }

        if (datosDependencia.rut_cuidador && !/^\d{7,8}-[\dkK]$/.test(datosDependencia.rut_cuidador.trim())) {
            erroresValidacion.rut_cuidador = 'Formato de RUT inválido (ej: 12345678-9)';
        }

        // Validar fechas
        if (datosDependencia.fecha_nacimiento_paciente) {
            const fechaNacimiento = new Date(datosDependencia.fecha_nacimiento_paciente);
            const hoy = new Date();
            if (fechaNacimiento > hoy) {
                erroresValidacion.fecha_nacimiento_paciente = 'La fecha de nacimiento no puede ser futura';
            }
        }

        setErrores(erroresValidacion);
        return Object.keys(erroresValidacion).length === 0;
    };

    const handleSubmit = async () => {
        if (!validarFormulario()) {
            toast.error('Por favor, corrija los errores en el formulario');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        const datosParaEnviar = {
            institucion_id: institucionId,
            usuario_id: user?.id,
            estudiante_id: user?.estudiante_id || null,

            // Datos del paciente
            fecha_ingreso: datosDependencia.fecha_ingreso?.trim() || null,
            nombre_paciente: datosDependencia.nombre_paciente || '',
            apellido_paciente: datosDependencia.apellido_paciente || '',
            rut_paciente: datosDependencia.rut_paciente || '',
            edad_paciente: datosDependencia.edad_paciente ? parseInt(datosDependencia.edad_paciente) : null,
            fecha_nacimiento_paciente: datosDependencia.fecha_nacimiento_paciente || null,
            diagnostico_ids: datosDependencia.diagnostico_ids,
            otro_diagnostico: datosDependencia.otro_diagnostico || null,
            indice_barthel: datosDependencia.indice_barthel ? parseInt(datosDependencia.indice_barthel) : null,
            grado_dependencia: datosDependencia.grado_dependencia || '',
            causa_dependencia_tiempo: datosDependencia.causa_dependencia_tiempo || '',
            escolaridad_id: datosDependencia.escolaridad_id ? parseInt(datosDependencia.escolaridad_id) : null,
            estado_civil: datosDependencia.estado_civil || '',
            direccion_paciente: datosDependencia.direccion_paciente || '',
            convivencia: datosDependencia.convivencia || '',
            posee_carne_discapacidad: datosDependencia.posee_carne_discapacidad || false,
            recibe_pension_subsidio_jubilacion: datosDependencia.recibe_pension_subsidio_jubilacion || false,
            tipo_beneficio: datosDependencia.tipo_beneficio || '',

            // Datos del cuidador
            nombre_cuidador: datosDependencia.nombre_cuidador || '',
            rut_cuidador: datosDependencia.rut_cuidador || '',
            edad_cuidador: datosDependencia.edad_cuidador ? parseInt(datosDependencia.edad_cuidador) : null,
            fecha_nacimiento_cuidador: datosDependencia.fecha_nacimiento_cuidador || null,
            direccion_cuidador: datosDependencia.direccion_cuidador || '',
            ocupacion_cuidador: datosDependencia.ocupacion_cuidador || '',
            parentesco_cuidador: datosDependencia.parentesco_cuidador || '',
            cuidador_recibe_estipendio: datosDependencia.cuidador_recibe_estipendio || false,

            // Evaluaciones adicionales
            puntaje_escala_zarit: datosDependencia.puntaje_escala_zarit ? parseInt(datosDependencia.puntaje_escala_zarit) : null,
            nivel_sobrecarga_zarit: datosDependencia.nivel_sobrecarga_zarit || null,
            control_cesfam_dependencia: datosDependencia.control_cesfam_dependencia || false,
            consulta_servicio_urgencia: datosDependencia.consulta_servicio_urgencia || false,
            tipo_familia_id: (datosDependencia.tipo_familia_id && datosDependencia.tipo_familia_id !== 'otro')
                ? parseInt(datosDependencia.tipo_familia_id)
                : null,
            otro_tipo_familia: datosDependencia.tipo_familia_id === 'otro'
                ? datosDependencia.otro_tipo_familia
                : '',
            ciclo_vital_familiar_id: datosDependencia.ciclo_vital_familiar_id ? parseInt(datosDependencia.ciclo_vital_familiar_id) : null,
            factores_riesgo_familiar: datosDependencia.factores_riesgo_familiar || null,

            // Contacto
            telefono_1: datosDependencia.telefono_1 || '',
            telefono_2: datosDependencia.telefono_2 || '',
            horario_llamada: datosDependencia.horario_llamada || '',
            conectividad: datosDependencia.conectividad || ''
        };


        try {
            const token = getToken();
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/paciente-dependencia`, datosParaEnviar, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Ficha clínica de dependencia creada exitosamente');
                setPacienteCreadoId(response.data.data.id);

                // Resetear formulario
                setDatosDependencia(initialDatosDependencia);
                setErrores({});

                // Callback para manejar el éxito
                if (onIngresar) {
                    onIngresar(response.data.data);
                }
                setPaso(2);
            } else {
                setSubmitError(response.data.message || 'Error al crear la ficha clínica de dependencia');
                toast.error(response.data.message || 'Error al crear la ficha clínica de dependencia');
            }
        } catch (error) {
            console.error('Error completo:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al crear la ficha clínica de dependencia';
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Si estás en paso 1 mostrar el form de paciente
    if (paso === 1) {
        return (
            <>
                {submitError && (
                    <div className="alert alert-danger mt-3">
                        <strong>Error:</strong> {submitError}
                        <button
                            type="button"
                            className="btn-close float-end"
                            onClick={() => setSubmitError('')}
                            aria-label="Close"
                        ></button>
                    </div>
                )}
                <div className="alert alert-info">
                    <strong>Ingreso Ficha Clínica de Dependencia</strong>
                    <p>Registro de información para pacientes en situación de dependencia.</p>
                </div>

                {/* Información del Paciente */}
                <div className="card mb-4">
                    <div className="card-header custom-card text-light">Información del Paciente</div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Nombre del Paciente</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.nombre_paciente ? 'is-invalid' : ''}`}
                                        id='NombrePaciente'
                                        name="nombre_paciente"
                                        value={datosDependencia.nombre_paciente}
                                        onChange={handleChange}
                                        placeholder="Ingrese el nombre del paciente"
                                    />
                                    {errores.nombre_paciente && <div className="invalid-feedback">{errores.nombre_paciente}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Apellido del Paciente</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.apellido_paciente ? 'is-invalid' : ''}`}
                                        id='ApellidoPaciente'
                                        name="apellido_paciente"
                                        value={datosDependencia.apellido_paciente}
                                        onChange={handleChange}
                                        placeholder="Ingrese el apellido del paciente"
                                    />
                                    {errores.apellido_paciente && <div className="invalid-feedback">{errores.apellido_paciente}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>RUT del Paciente</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.rut_paciente ? 'is-invalid' : ''}`}
                                        id='RutPaciente'
                                        name="rut_paciente"
                                        value={datosDependencia.rut_paciente}
                                        onChange={handleChange}
                                        placeholder="Ej: 12345678-9"
                                    />
                                    {errores.rut_paciente && <div className="invalid-feedback">{errores.rut_paciente}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Edad del Paciente</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errores.edad_paciente ? 'is-invalid' : ''}`}
                                        id='EdadPaciente'
                                        name="edad_paciente"
                                        min={40}
                                        max={120}
                                        value={datosDependencia.edad_paciente}
                                        onChange={handleChange}
                                        placeholder="Ingrese la edad"
                                    />
                                    {errores.edad_paciente && <div className="invalid-feedback">{errores.edad_paciente}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Fecha de nacimiento del Paciente</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errores.fecha_nacimiento_paciente ? 'is-invalid' : ''}`}
                                        id='FechaNacimientoPaciente'
                                        name="fecha_nacimiento_paciente"
                                        value={datosDependencia.fecha_nacimiento_paciente}
                                        onChange={handleChange}
                                    />
                                    {errores.fecha_nacimiento_paciente && <div className="invalid-feedback">{errores.fecha_nacimiento_paciente}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Escolaridad</label>
                                    <select
                                        className="form-control"
                                        name="escolaridad_id"
                                        value={datosDependencia.escolaridad_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {nivelesEscolaridad.map((nivel) => (
                                            <option key={nivel.id} value={nivel.id}>
                                                {nivel.nivel}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Diagnóstico</label>
                                    {diagnosticos.map((diagnostico) => (
                                        <div key={diagnostico.id} className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`diagnostico-${diagnostico.id}`}
                                                name="diagnostico_ids"
                                                value={diagnostico.id}
                                                checked={datosDependencia.diagnostico_ids.includes(diagnostico.id.toString())}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor={`diagnostico-${diagnostico.id}`}>
                                                {diagnostico.nombre}
                                            </label>
                                        </div>
                                    ))}
                                    {errores.diagnostico_ids && <div className="invalid-feedback d-block">{errores.diagnostico_ids}</div>}

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="otroDiagnosticoCheckbox"
                                            name="otro_diagnostico_checkbox"
                                            checked={otroDiagnosticoChecked}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="otroDiagnosticoCheckbox">
                                            Otro
                                        </label>
                                        {otroDiagnosticoChecked && (
                                            <input
                                                type="text"
                                                className="form-control form-control-sm d-inline-block ms-2"
                                                style={{ width: '200px' }}
                                                name="otro_diagnostico"
                                                value={datosDependencia.otro_diagnostico}
                                                onChange={handleChange}
                                                placeholder="Especifique"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Índice Barthel</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errores.indice_barthel ? 'is-invalid' : ''}`}
                                        id='IndiceBarthel'
                                        name="indice_barthel"
                                        min={0}
                                        max={100}
                                        value={datosDependencia.indice_barthel}
                                        onChange={handleChange}
                                        onKeyDown={(e) => {
                                            // Prevenir el signo menos
                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault();
                                            }
                                        }}
                                        placeholder="Ingrese el índice Barthel (0-100)"
                                    />
                                    {errores.indice_barthel && <div className="invalid-feedback">{errores.indice_barthel}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Grado de Dependencia</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id='GradoDependencia'
                                        name="grado_dependencia"
                                        value={datosDependencia.grado_dependencia}
                                        readOnly
                                        placeholder="Se calcula automáticamente"
                                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                    />
                                    <small className="form-text text-muted">
                                        Se calcula automáticamente según el Índice Barthel
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Causa de Dependencia (Tiempo)</label>
                                    <textarea
                                        className="form-control"
                                        name="causa_dependencia_tiempo"
                                        value={datosDependencia.causa_dependencia_tiempo}
                                        onChange={handleChange}
                                        placeholder="Especifique la causa de dependencia"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Estado Civil</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id='EstadoCivil'
                                        name="estado_civil"
                                        value={datosDependencia.estado_civil}
                                        onChange={handleChange}
                                        placeholder="Ingrese el estado civil"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Dirección del Paciente</label>
                                    <textarea
                                        className="form-control"
                                        name="direccion_paciente"
                                        value={datosDependencia.direccion_paciente}
                                        onChange={handleChange}
                                        placeholder="Ingrese la dirección del paciente"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Convivencia</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id='Convivencia'
                                        name="convivencia"
                                        value={datosDependencia.convivencia}
                                        onChange={handleChange}
                                        placeholder="Indique con quién convive"
                                    />
                                </div>
                            </div>
                        </ div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Posee Carné de Discapacidad</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="posee_carne_discapacidad"
                                            value="true"
                                            checked={datosDependencia.posee_carne_discapacidad === true}
                                            onChange={handleChange}
                                            id="poseeCarneDiscapacidadSi"
                                        />
                                        <label className="form-check-label" htmlFor="poseeCarneDiscapacidadSi">
                                            Sí
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="posee_carne_discapacidad"
                                            value="false"
                                            checked={datosDependencia.posee_carne_discapacidad === false}
                                            onChange={handleChange}
                                            id="poseeCarneDiscapacidadNo"
                                        />
                                        <label className="form-check-label" htmlFor="poseeCarneDiscapacidadNo">
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Recibe Pensión/Subsidio/Jubilación</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="recibe_pension_subsidio_jubilacion"
                                            value="true"
                                            checked={datosDependencia.recibe_pension_subsidio_jubilacion === true}
                                            onChange={handleChange}
                                            id="recibePensionSubsidioJubilacionSi"
                                        />
                                        <label className="form-check-label" htmlFor="recibePensionSubsidioJubilacionSi">
                                            Sí
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="recibe_pension_subsidio_jubilacion"
                                            value="false"
                                            checked={datosDependencia.recibe_pension_subsidio_jubilacion === false}
                                            onChange={handleChange}
                                            id="recibePensionSubsidioJubilacionNo"
                                        />
                                        <label className="form-check-label" htmlFor="recibePensionSubsidioJubilacionNo">
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Tipo de Beneficio</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="tipoBeneficio"
                                        name="tipo_beneficio"
                                        value={datosDependencia.tipo_beneficio}
                                        onChange={handleChange}
                                        placeholder="Ingrese el tipo de beneficio"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del Cuidador Principal */}
                <div className="card mb-4">
                    <div className="card-header custom-card text-light">Información del Cuidador Principal</div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Nombre del Cuidador</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombreCuidador"
                                        name="nombre_cuidador"
                                        value={datosDependencia.nombre_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ingrese el nombre del cuidador"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>RUT del Cuidador</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="rutCuidador"
                                        name="rut_cuidador"
                                        value={datosDependencia.rut_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ej: 12345678-9"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Edad del Cuidador</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="edadCuidador"
                                        name="edad_cuidador"
                                        min={18}
                                        max={120}
                                        onKeyDown={(e) => {
                                            // Prevenir el signo menos
                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault();
                                            }
                                        }}
                                        value={datosDependencia.edad_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ingrese la edad del cuidador"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Fecha de Nacimiento del Cuidador</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaNacimientoCuidador"
                                        name="fecha_nacimiento_cuidador"
                                        value={datosDependencia.fecha_nacimiento_cuidador}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Dirección del Cuidador</label>
                                    <textarea
                                        className="form-control"
                                        name="direccion_cuidador"
                                        value={datosDependencia.direccion_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ingrese la dirección del cuidador"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Ocupación del Cuidador</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="ocupacionCuidador"
                                        name="ocupacion_cuidador"
                                        value={datosDependencia.ocupacion_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ingrese la ocupación del cuidador"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label >Parentesco del Cuidador</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="parentescoCuidador"
                                        name="parentesco_cuidador"
                                        value={datosDependencia.parentesco_cuidador}
                                        onChange={handleChange}
                                        placeholder="Ingrese el parentesco con el paciente"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>¿El Cuidador Recibe Estipendio?</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="cuidador_recibe_estipendio"
                                            value="true"
                                            checked={datosDependencia.cuidador_recibe_estipendio === true}
                                            onChange={handleChange}
                                            id="cuidadorRecibeEstipendioSi"
                                        />
                                        <label className="form-check-label" htmlFor="cuidadorRecibeEstipendioSi">
                                            Sí
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="cuidador_recibe_estipendio"
                                            value="false"
                                            checked={datosDependencia.cuidador_recibe_estipendio === false}
                                            onChange={handleChange}
                                            id="cuidadorRecibeEstipendioNo"
                                        />
                                        <label className="form-check-label" htmlFor="cuidadorRecibeEstipendioNo">
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Puntaje en la Escala Zarit</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="puntajeEscalaZarit"
                                        name="puntaje_escala_zarit"
                                        min={0}
                                        max={88}
                                        onKeyDown={(e) => {
                                            // Prevenir el signo menos
                                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault();
                                            }
                                        }}
                                        value={datosDependencia.puntaje_escala_zarit}
                                        onChange={handleChange}
                                        placeholder="Ingrese el puntaje (0-88)"
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Nivel de Sobrecarga</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nivelSobrecargaZarit"
                                        name="nivel_sobrecarga_zarit"
                                        value={datosDependencia.nivel_sobrecarga_zarit}
                                        readOnly
                                        placeholder="Se calcula automáticamente"
                                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                    />
                                    <small className="form-text text-muted">
                                        Se calcula automáticamente según la Escala Zarit
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salud en los Últimos 6 Meses */}
                <div className="card mb-4">
                    <div className="card-header custom-card text-light">Salud en los Últimos 6 Meses</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Control en CESFAM</label>
                            <textarea
                                className="form-control"
                                name="control_cesfam_dependencia"
                                value={datosDependencia.control_cesfam_dependencia}
                                onChange={handleChange}
                                placeholder="Describa el control en CESFAM"
                            />
                        </div>
                        <div className="form-group">
                            <label>Consulta en Servicio de Urgencia</label>
                            <textarea
                                className="form-control"
                                name="consulta_servicio_urgencia"
                                value={datosDependencia.consulta_servicio_urgencia}
                                onChange={handleChange}
                                placeholder="Describa la consulta en servicio de urgencia"
                            />
                        </div>
                    </div>
                </div>

                {/* Antecedentes Familiares */}
                <div className="card mb-4">
                    <div className="card-header custom-card text-light">Antecedentes Familiares</div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Tipo de Familia</label>
                                    <select
                                        className="form-control"
                                        name="tipo_familia_id"
                                        value={datosDependencia.tipo_familia_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {tiposFamilia.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                        <option value="otro">Otro</option>
                                    </select>

                                    {/* Campo de texto que aparece cuando se selecciona "Otro" */}
                                    {datosDependencia.tipo_familia_id === 'otro' && (
                                        <input
                                            type="text"
                                            className="form-control mt-2 form-control-sm"
                                            name="otro_tipo_familia"
                                            value={datosDependencia.otro_tipo_familia}
                                            onChange={handleChange}
                                            placeholder="Especifique otro tipo de familia"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Ciclo Vital Familiar</label>
                                    <select
                                        className="form-control"
                                        name="ciclo_vital_familiar_id"
                                        value={datosDependencia.ciclo_vital_familiar_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {ciclosVitales.map((ciclo) => (
                                            <option key={ciclo.id} value={ciclo.id}>
                                                {ciclo.ciclo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Factores de Riesgo Familiar</label>
                            <textarea
                                className="form-control"
                                id="factoresRiesgoFamiliarD"
                                name="factores_riesgo_familiar"
                                value={datosDependencia.factores_riesgo_familiar}
                                onChange={handleChange}
                                placeholder="Ingrese el puntaje/categoría de factores de riesgo"
                            />
                        </div>
                    </div>
                </div>

                {/* Contacto */}
                <div className="card mb-4">
                    <div className="card-header custom-card text-light">Contacto</div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Teléfono 1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="telefono1D"
                                        name="telefono_1"
                                        value={datosDependencia.telefono_1}
                                        onChange={handleChange}
                                        placeholder="Ingrese el teléfono principal"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Teléfono 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="telefono2D"
                                        name="telefono_2"
                                        value={datosDependencia.telefono_2}
                                        onChange={handleChange}
                                        placeholder="Ingrese el teléfono secundario"
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
                                        id="horarioLlamada"
                                        name="horario_llamada"
                                        value={datosDependencia.horario_llamada}
                                        onChange={handleChange}
                                        placeholder="Ej: 10:00 AM a 12:00 PM"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Conectividad</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="conectividad"
                                        name="conectividad"
                                        value={datosDependencia.conectividad}
                                        onChange={handleChange}
                                        placeholder="Ej: Buena, Regular, Mala"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="d-flex justify-content-center mt-5 mb-5">
                    <button
                        className="btn btn-primary px-4 mx-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Ingresando...' : 'Ingresar Ficha Clínica de Dependencia'}
                    </button>
                    <button className="btn btn-secondary px-4 mx-2" onClick={onVolver}>
                        Volver
                    </button>
                </div>
                {/* <VisitaDomiciliaria institucionId={institucionId} /> */}
            </>
        );
    }

    // Caso paso 2: mostrar el formulario de visita domiciliaria, pasando el pacienteCreadoId
    if (paso === 2) {
        return (
            <>
                <VisitaDomiciliaria pacienteId={pacienteCreadoId} institucionId={institucionId} onVolver={() => setPaso(1)} onFinalizar={onIngresar} />
            </>

        );
    }
    return null; // fallback
};

export default FichaDependencia;