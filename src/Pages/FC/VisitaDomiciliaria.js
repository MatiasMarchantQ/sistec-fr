import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const getPregunta = (index) => {
    const preguntas = [
        "Tener poco interés o placer en hacer las cosas",
        "Sentirse desanimado/a, deprimido/a, o sin esperanza",
        "Con problemas en dormirse o en mantenerse dormido/a, o en dormir demasiado",
        "Sentirse cansado/a o tener poca energía",
        "Tener poco apetito o comer en exceso",
        "Sentir falta de amor propio o que sea un fracaso que decepcionara a sí mismo/a a su familia",
        "Tener dificultad para concentrarse en cosas tales como leer el periódico o mirar televisión",
        "Se mueve o habla tan lentamente que otra gente se podría dar cuenta, o se lo contrario, está tan agitado/a o inquieto/a que se mueve mucho más de lo acostumbrado",
        "Se le han ocurrido pensamientos de que sería mejor estar muerto/a o de que haría daño de alguna manera"
    ];
    return preguntas[index];
};

const VisitaDomiciliaria = ({ pacienteId, institucionId }) => {
    const navigate = useNavigate();
    const { user, getToken } = useAuth();
    const initialDatosVisita = {
        fecha: new Date().toISOString().split('T')[0],
        caida: null,
        relatoCaida: null,
        dolorCuerpo: null,
        lugarDolor: null,
        intensidadDolor: null,
        intervencionDolor: null,
        lesionPresion: null,
        ubicacionLPP: null,
        clasificacionLPP: null,
        personalCuraciones: null,
        frecuenciaCuraciones: null,
        puntajeNorton: null,
        nortonDetalle: { // Nuevo objeto para Norton
            estadoFisico: '',
            estadoMental: '',
            actividad: '',
            movilidad: '',
            incontinencia: ''
        },
        hipoglicemia: null,
        intervencionHipoglicemia: null,
        hiperglicemia: null,
        intervencionHiperglicemia: null,
        crisisHipertensiva: null,
        sintomasCrisis: {
            dolorPecho: null,
            dolorCabeza: null,
            zumbidoOidos: null,
            nauseas: null,
        },
        esDiabetico: null,
        esHipertenso: null,
        edad: null, // Para manejar la edad
        adherencia: {
            olvidaMedicamento: null,
            tomaHora: null,
            dejaRemedio: null,
            seSienteMal: null,
        },
        puntajeAdherencia: null, // Estado para el puntaje de adherencia
        efectosSecundarios: null,
        intervencionEfectosSecundarios: null, // Para manejar la respuesta de intervención
        descripcionIntervencionEfectosSecundarios: null, // Para manejar la descripción de la intervención
        cantidadComidas: null,
        consumoHabitual: null,
        asistenciaAlimentacion: null,
        movilidad: null,
        tipoCama: null,
        alturaCama: null,
        colchonAntiescara: null,
        ejerciciosKinesiologo: null,
        ejercicioEspecifico: null,
        frecuenciaEjercicio: null,
        dificultadDormir: null,
        explicacionDificultadDormir: null,
        miccion: null,
        miccionCual: null,
        orinaOscura: null,
        estreñimiento: null,
        diasEstreñimiento: null,
        intervencion: null,
        intervencionCual: null,
        phq9: Array(9).fill(null), // Para almacenar las respuestas del PHQ-9
        dificultad: null, // Para almacenar la dificultad en cumplir con el trabajo, casa, etc.
        puntajePHQ9: null, // Para almacenar el puntaje total del PHQ-9
        yesavage: Array(22).fill(null), // Para almacenar las respuestas de la escala de Yesavage
        puntajeYesavage: null,
        otrosSintomas: null, // Para almacenar otros síntomas o molestias
        manejoSintomas: null, // Para almacenar cómo se han manejado o superado
        comentarios: null
    };

    const [datosVisita, setDatosVisita] = useState(initialDatosVisita);
    const [tipoPaciente, setTipoPaciente] = useState(''); // 'adulto' o 'adulto mayor'
    const [currentSection, setCurrentSection] = useState(0); // Controla la sección actual

    const sections = [
        { title: "", key: "seguridad" },
        { title: "", key: "lesion" },
        { title: "", key: "diabetico" },
        { title: "", key: "nutricion" },
        { title: "", key: "eliminacion" },
        { title: "", key: "tipoPaciente" },
        { title: "", key: "otrasConsultas" }
    ];

    const handleNextSection = (e) => {
        e.preventDefault(); // Previene cualquier comportamiento de envío
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
        }
    };

    const handlePreviousSection = (e) => {
        e.preventDefault(); // Previene cualquier comportamiento de envío
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    // Opciones para la Escala de Norton
    const nortonOpciones = {
        estadoFisico: [
            { value: '', label: 'Seleccionar...' },
            { value: '4', label: 'Bueno (4)' },
            { value: '3', label: 'Mediano (3)' },
            { value: '2', label: 'Regular (2)' },
            { value: '1', label: 'Muy malo (1)' }
        ],
        estadoMental: [
            { value: '', label: 'Seleccionar...' },
            { value: '4', label: 'Alerta (4)' },
            { value: '3', label: 'Apático (3)' },
            { value: '2', label: 'Confuso (2)' },
            { value: '1', label: 'Estuporoso o Comatoso (1)' }
        ],
        actividad: [
            { value: '', label: 'Seleccionar...' },
            { value: '4', label: 'Ambulante (4)' },
            { value: '3', label: 'Camina con Ayuda (3)' },
            { value: '2', label: 'Disminuida (2)' },
            { value: '1', label: 'Inmóvil (1)' }
        ],
        movilidad: [
            { value: '', label: 'Seleccionar...' },
            { value: '4', label: 'Total (4)' },
            { value: '3', label: 'Ocasional (3)' },
            { value: '2', label: 'Limitada (2)' },
            { value: '1', label: 'Encamado (1)' }
        ],
        incontinencia: [
            { value: '', label: 'Seleccionar...' },
            { value: '4', label: 'Ninguna (4)' },
            { value: '3', label: 'Urinaria o fecal (3)' },
            { value: '2', label: 'Urinaria y fecal (2)' },
            { value: '1', label: 'Total (1)' }
        ]
    };

    const preguntas = [
        {
            id: 'olvidaMedicamento',
            texto: '¿Se olvida alguna vez de tomar el medicamento?',
            puntaje: { si: 0, no: 1 }
        },
        {
            id: 'tomaHora',
            texto: '¿Toma la medicación a la hora indicada?',
            puntaje: { si: 1, no: 0 }
        },
        {
            id: 'dejaRemedio',
            texto: 'Cuando se encuentra bien ¿deja de tomar el remedio?',
            puntaje: { si: 0, no: 1 }
        },
        {
            id: 'seSienteMal',
            texto: 'Si alguna vez se siente mal ¿deja de tomar el remedio?',
            puntaje: { si: 0, no: 1 }
        }
    ];

    // UseEffect para calcular puntaje Norton automáticamente
    useEffect(() => {
        const { estadoFisico, estadoMental, actividad, movilidad, incontinencia } = datosVisita.nortonDetalle;

        let total = 0;
        if (estadoFisico) total += parseInt(estadoFisico);
        if (estadoMental) total += parseInt(estadoMental);
        if (actividad) total += parseInt(actividad);
        if (movilidad) total += parseInt(movilidad);
        if (incontinencia) total += parseInt(incontinencia);

        setDatosVisita(prev => ({
            ...prev,
            puntajeNorton: total > 0 ? total : null
        }));
    }, [datosVisita.nortonDetalle]);

    useEffect(() => {
        setDatosVisita(prev => {
            const updated = { ...prev };

            if (tipoPaciente === 'adulto') {
                updated.yesavage = Array(30).fill(''); // Limpiar respuestas de Yesavage
                updated.puntajeYesavage = 0;
            } else if (tipoPaciente === 'adulto mayor') {
                updated.phq9 = Array(9).fill('');
                updated.puntajePHQ9 = 0;
                updated.dificultad = '';
            }

            return updated;
        });
    }, [tipoPaciente]);


    // Función para manejar cambios en Norton
    const handleNortonChange = (categoria, valor) => {
        setDatosVisita(prev => ({
            ...prev,
            nortonDetalle: {
                ...prev.nortonDetalle,
                [categoria]: valor
            }
        }));
    };

    // Función para obtener clasificación de riesgo Norton
    const obtenerClasificacionNorton = (puntaje) => {
        if (!puntaje || puntaje === 0) return { texto: 'Completar evaluación', clase: 'alert-secondary' };
        if (puntaje >= 5 && puntaje <= 9) return { texto: 'RIESGO MUY ALTO', clase: 'alert-danger' };
        if (puntaje >= 10 && puntaje <= 12) return { texto: 'RIESGO ALTO', clase: 'alert-warning' };
        if (puntaje >= 13 && puntaje <= 14) return { texto: 'RIESGO MEDIO', clase: 'alert-info' };
        if (puntaje > 14) return { texto: 'RIESGO MÍNIMO/NO RIESGO', clase: 'alert-success' };
        return { texto: 'Puntaje inválido', clase: 'alert-secondary' };
    };

    const calcularPuntajeYesavage = (yesavage) => {
        let total = 0;
        yesavage.forEach((respuesta) => {
            if (respuesta === 'SI') {
                total += 1; // Sumar 1 por cada respuesta "SI"
            }
        });
        setDatosVisita(prev => ({ ...prev, puntajeYesavage: total }));
    };

    const calcularPuntajeAdherencia = (adherencia) => {
        let totalAdherencia = 0;
        preguntas.forEach(({ id, puntaje }) => {
            const respuesta = adherencia[id];
            if (respuesta === 'si') {
                totalAdherencia += puntaje.si;
            } else if (respuesta === 'no') {
                totalAdherencia += puntaje.no;
            }
        });
        setDatosVisita(prev => ({ ...prev, puntajeAdherencia: totalAdherencia }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'radio') {
            if (name === 'intervencionEfectosSecundarios') {
                setDatosVisita(prev => ({
                    ...prev,
                    intervencionEfectosSecundarios: value,
                    descripcionIntervencionEfectosSecundarios: value === 'no' ? null : prev.descripcionIntervencionEfectosSecundarios
                }));
                return;
            }

            // Actualizamos las respuestas y calculamos puntaje con el nuevo estado
            const nuevaAdherencia = { ...datosVisita.adherencia, [name]: value };
            setDatosVisita(prev => ({
                ...prev,
                adherencia: nuevaAdherencia
            }));

            calcularPuntajeAdherencia(nuevaAdherencia);
        } else if (type === 'checkbox') {
            // Manejo de checkboxes
            setDatosVisita(prev => {
                const newDatosVisita = {
                    ...prev,
                    [name]: checked
                };

                // Limpiar campos si se desmarca
                if (!checked) {
                    if (name === 'caida') {
                        newDatosVisita.relatoCaida = null; // Limpiar relatoCaida
                    }
                    if (name === 'dolorCuerpo') {
                        newDatosVisita.lugarDolor = null; // Limpiar lugarDolor
                        newDatosVisita.intensidadDolor = null; // Limpiar intensidadDolor
                        newDatosVisita.intervencionDolor = null; // Limpiar intervenciónDolor
                    }
                    if (name === 'lesionPresion') {
                        newDatosVisita.ubicacionLPP = null; // Limpiar ubicación
                        newDatosVisita.clasificacionLPP = null; // Limpiar clasificación
                        newDatosVisita.personalCuraciones = null; // Limpiar personal que realiza curaciones
                        newDatosVisita.frecuenciaCuraciones = null; // Limpiar frecuencia de curaciones
                        newDatosVisita.nortonDetalle = { // Limpiar detalles de Norton
                            estadoFisico: null,
                            estadoMental: null,
                            actividad: null,
                            movilidad: null,
                            incontinencia: null
                        };
                    }

                    if (name === 'esDiabetico') {
                        newDatosVisita.hipoglicemia = null; // Limpiar intervención de hipoglicemia
                        newDatosVisita.hiperglicemia = null;
                    }

                    if (name === 'hipoglicemia') {
                        newDatosVisita.intervencionHipoglicemia = null; // Limpiar intervención de hipoglicemia
                    }
                    if (name === 'hiperglicemia') {
                        newDatosVisita.intervencionHiperglicemia = null; // Limpiar intervención de hiperglicemia
                    }

                    if (name === 'esHipertenso') {
                        newDatosVisita.hipoglicemia = null; // Limpiar intervención de hipoglicemia
                        newDatosVisita.hiperglicemia = null;
                        newDatosVisita.sintomasCrisis.dolorPecho = null;
                        newDatosVisita.sintomasCrisis.dolorCabeza = null;
                        newDatosVisita.sintomasCrisis.zumbidoOidos = null;
                        newDatosVisita.sintomasCrisis.nauseas = null;
                        newDatosVisita.adherencia = {
                            olvidaMedicamento: null,
                            tomaHora: null,
                            dejaRemedio: null,
                            seSienteMal: null
                        };
                        newDatosVisita.puntajeAdherencia = null;
                        newDatosVisita.efectosSecundarios = null; // Limpiar descripción de efectos secundarios
                        newDatosVisita.intervencionEfectosSecundarios = null; // Limpiar si/no de intervención
                        newDatosVisita.descripcionIntervencionEfectosSecundarios = null;
                    }
                }

                return newDatosVisita;
            });
        } else {
            // Manejo de otros inputs
            setDatosVisita(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const calcularPuntajePHQ9 = (phq9) => {
        let total = 0;
        phq9.forEach((respuesta) => {
            if (respuesta) {
                total += parseInt(respuesta);
            }
        });
        setDatosVisita(prev => ({ ...prev, puntajePHQ9: total }));
    };

    const clasificarResultado = (puntaje) => {
        if (puntaje >= 0 && puntaje <= 4) return "Mínimo";
        if (puntaje >= 5 && puntaje <= 9) return "Leve";
        if (puntaje >= 10 && puntaje <= 14) return "Moderado";
        if (puntaje >= 15 && puntaje <= 19) return "Moderado a grave";
        if (puntaje >= 20 && puntaje <= 27) return "Grave";
        return "Sin clasificación";
    };

    const isDatosVisitaEmpty = (datos) => {
        // Verifica que datos y sus propiedades estén definidos
        if (!datos || !datos.otrosSintomas) {
            return true; // Si no hay datos, consideramos que está vacío
        }

        // Definir los campos relevantes que deben ser verificados
        const camposRelevantes = [
            datos.fecha,
            datos.comentarios
        ];

        // Verifica si todos los campos relevantes están en null o vacíos
        return camposRelevantes.every(value => value === null || value === '' || (Array.isArray(value) && value.every(v => v === null)));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validar si todos los campos están vacíos
        if (isDatosVisitaEmpty(datosVisita)) {
            toast.error('Por favor, complete al menos un campo antes de enviar.');
            return; // Detener el envío si todos los campos están vacíos
        }

        // Confirmación antes de enviar
        const confirmacion = window.confirm("¿Está seguro de que desea enviar esta visita domiciliaria? Revise bien los datos, ya que el formulario es extenso.");
        if (!confirmacion) {
            return; // Si el usuario cancela, no continúa
        }

        const sanitizeNumber = (value) => {
            if (value === '' || value === null || value === undefined) return null;
            const num = parseInt(value);
            return isNaN(num) ? null : num;
        };

        try {
            const token = getToken();

            // Reestructurar los datos según lo que espera el backend
            const visitaTransformada = {
                paciente_dependencia_id: pacienteId,
                institucion_id: institucionId,
                usuario_id: user?.id || null,
                estudiante_id: user?.estudiante_id || null,
                fecha: datosVisita.fecha,
                tipo_paciente: tipoPaciente,
                sintomas: {
                    caida: datosVisita.caida,
                    relato_caida: datosVisita.relatoCaida,
                    dolor_cuerpo: datosVisita.dolorCuerpo,
                    lugar_dolor: datosVisita.lugarDolor,
                    intensidad_dolor: datosVisita.intensidadDolor,
                    intervencion_dolor: datosVisita.intervencionDolor,
                    lesion_presion: datosVisita.lesionPresion,
                    ubicacion_lpp: datosVisita.ubicacionLPP,
                    clasificacion_lpp: datosVisita.clasificacionLPP,
                    personal_curaciones: datosVisita.personalCuraciones,
                    frecuencia_curaciones: datosVisita.frecuenciaCuraciones,
                    puntaje_norton: datosVisita.puntajeNorton,
                    norton_detalle: datosVisita.nortonDetalle,
                    hipoglicemia: datosVisita.hipoglicemia,
                    intervencion_hipoglicemia: datosVisita.intervencionHipoglicemia,
                    hiperglicemia: datosVisita.hiperglicemia,
                    intervencion_hiperglicemia: datosVisita.intervencionHiperglicemia,
                    crisis_hipertensiva: datosVisita.crisisHipertensiva,
                    sintomas_crisis_dolor_pecho: datosVisita.sintomasCrisis.dolorPecho,
                    sintomas_crisis_dolor_cabeza: datosVisita.sintomasCrisis.dolorCabeza,
                    sintomas_crisis_zumbido_oidos: datosVisita.sintomasCrisis.zumbidoOidos,
                    sintomas_crisis_nauseas: datosVisita.sintomasCrisis.nauseas,
                    es_diabetico: datosVisita.esDiabetico,
                    es_hipertenso: datosVisita.esHipertenso,
                    edad: datosVisita.edad,
                    efectos_secundarios: datosVisita.efectosSecundarios,
                    intervencion_efectos_secundarios: datosVisita.intervencionEfectosSecundarios === 'si' ? true : false,
                    descripcion_intervencion_efectos_secundarios: datosVisita.descripcionIntervencionEfectosSecundarios,
                },
                nutricion: {
                    cantidad_comidas: datosVisita.cantidadComidas,
                    consumo_habitual: datosVisita.consumoHabitual,
                    asistencia_alimentacion: datosVisita.asistenciaAlimentacion === 'si' ? true : false,
                },
                actividad: {
                    movilidad: datosVisita.movilidad,
                    tipo_cama: datosVisita.tipoCama,
                    altura_cama: datosVisita.alturaCama,
                    colchon_antiescara: datosVisita.colchonAntiescara,
                    ejercicios_kinesiologo: datosVisita.ejerciciosKinesiologo,
                    ejercicio_especifico: datosVisita.ejercicioEspecifico,
                    frecuencia_ejercicio: datosVisita.frecuenciaEjercicio,
                    dificultad_dormir: datosVisita.dificultadDormir,
                    explicacion_dificultad_dormir: datosVisita.explicacionDificultadDormir,
                },
                eliminacion: {
                    miccion: datosVisita.miccion,
                    miccion_cual: datosVisita.miccionCual,
                    orina_oscura: datosVisita.orinaOscura,
                    estreñimiento: datosVisita.estreñimiento,
                    dias_estreñimiento: sanitizeNumber(datosVisita.diasEstreñimiento),
                    intervencion: datosVisita.intervencion,
                    intervencion_cual: datosVisita.intervencionCual,
                },
                phq9: {
                    respuestas: datosVisita.phq9,
                    dificultad: datosVisita.dificultad,
                    puntaje_phq9: datosVisita.puntajePHQ9,
                },
                yesavage: {
                    respuestas: datosVisita.yesavage,
                    puntaje_yesavage: datosVisita.puntajeYesavage,
                },
                otrosSintomas: {
                    otros_sintomas: datosVisita.otrosSintomas,
                    manejo_sintomas: datosVisita.manejoSintomas,
                    comentarios: datosVisita.comentarios,
                },
                adherencia: {
                    olvida_medicamento: datosVisita.adherencia.olvidaMedicamento,
                    toma_hora: datosVisita.adherencia.tomaHora,
                    deja_remedio: datosVisita.adherencia.dejaRemedio,
                    se_siente_mal: datosVisita.adherencia.seSienteMal,
                    puntaje_adherencia: datosVisita.puntajeAdherencia
                }
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/paciente-dependencia/visitas`, visitaTransformada, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Visita domiciliaria creada exitosamente');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(response.data.message || 'Error al crear la visita domiciliaria');
            }
            window.location.reload();
        } catch (error) {
            console.error('Error completo:', error);
            toast.error(error.response?.data?.message || 'Error al crear la visita domiciliaria');
        }

        // Solo enviar si estamos en la última sección
        if (currentSection === sections.length - 1) {
        } else {
            console.log('No se puede enviar, no estás en la última sección');
        }
    };

    const clasificacionNorton = obtenerClasificacionNorton(datosVisita.puntajeNorton);

    return (
        <div className="card mb-5">
            {/* Formulario de la visita domiciliaria */}
            <form onSubmit={handleSubmit}>
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Visita Domiciliaria</h4>
                </div>
                <div className="card-body">
                    <h5>{sections[currentSection].title}</h5>
                    {/* Aquí iría el contenido de cada sección según el valor de currentSection */}
                    {sections[currentSection]?.key === 'seguridad' && (
                        <div>
                            <div className="form-group mb-4">
                                <label className='text-primary'>Fecha de la visita</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="fecha"
                                    value={datosVisita.fecha}
                                    onChange={handleChange} // Usa la función handleChange existente
                                    style={{ backgroundColor: '#f8f9fa' }}
                                />
                            </div>

                            <h5 className="mb-4">Usted ha presentado durante las últimas 2 semanas, los siguientes síntomas o condiciones:</h5>

                            {/* Riesgo de caída */}
                            <section className="mb-5">
                                <h6 className="text-primary">I. Necesidad de Seguridad y Protección:</h6>

                                <div className="form-group mb-1">
                                    <label>1. Riesgo de caída</label>
                                </div>

                                <div className="form-group mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="caida"
                                        name="caida"
                                        checked={datosVisita.caida}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="caida">Ud. ha presentado alguna caída o desequilibrio al movilizarse?</label>
                                </div>

                                {datosVisita.caida && (
                                    <div className="form-group mb-3">
                                        <label>Si refiere Sí, relate que ocurrió:</label>
                                        <textarea
                                            className="form-control"
                                            name="relatoCaida"
                                            value={datosVisita.relatoCaida}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Describa lo ocurrido"
                                        />
                                    </div>
                                )}

                                <div>
                                    <h6 className='mt-4'>Dolor neuropático, visceral o somático. </h6>
                                </div>

                                <div className="form-group mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="dolorCuerpo"
                                        name="dolorCuerpo"
                                        checked={datosVisita.dolorCuerpo}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="dolorCuerpo">Ud. ha presentado dolor en alguna parte de su cuerpo?</label>
                                </div>

                                {datosVisita.dolorCuerpo && (
                                    <>
                                        <div className="form-group mb-3">
                                            <label>¿En qué lugar de su cuerpo?</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="lugarDolor"
                                                value={datosVisita.lugarDolor}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group mb-3">
                                            <label>¿Con qué grado de intensidad? (1 a 10)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="intensidadDolor"
                                                min="1"
                                                max="10"
                                                value={datosVisita.intensidadDolor}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group mb-3">
                                            <label>¿Ha realizado alguna intervención para su mejoría? Si, No ¿Cuál?</label>
                                            <textarea
                                                className="form-control"
                                                name="intervencionDolor"
                                                value={datosVisita.intervencionDolor}
                                                onChange={handleChange}
                                                rows="2"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="card bg-light p-3 mb-4">
                                    <h6>Recomendaciones para caída:</h6>
                                    <ul>
                                        <li>Iluminación: Asegúrese de que la casa esté bien iluminada, especialmente en pasillos, escaleras y baños, donde se suele caminar con mayor frecuencia.</li>
                                        <li>Pisos: Utilice alfombras antideslizantes o evite las alfombras móviles. Limpie inmediatamente cualquier derrame o humedad.</li>
                                        <li>Muebles: Mueva o coloque muebles y objetos de manera que no obstaculicen el paso.</li>
                                        <li>Barandillas: Instale barandillas en pasillos, escaleras y baños.</li>
                                        <li>Cama y sillas: La cama y las sillas deben tener una altura adecuada para facilitar el acceso y la salida.</li>
                                        <li>Calzado: Use calzado con suelas antideslizantes y evite las sandalias o chanclas.</li>
                                        <li>Ducha y bañera: Instale agarraderas en el baño y duchas.</li>
                                        <li>Iluminación nocturna: Use luces nocturnas en pasillos y dormitorios para facilitar la movilización a la noche.</li>
                                    </ul>
                                    <h6>Recomendaciones en caso de dolor:</h6>
                                    <ul>
                                        <li>Mantener una rutina de actividad física regular.</li>
                                        <li>Mantenga una alimentación saludable y acorde a su patología.</li>
                                        <li>Realice ejercicios físicos según recomendación del equipo de salud.</li>
                                        <li>Tome medidas para prevenir caídas.</li>
                                        <li>Tome su analgésico para el dolor si está indicado por su médico en la dosis y horario indicado.</li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    )}
                    {sections[currentSection]?.key === 'lesion' && (
                        <div>
                            {/* Lesión por presión */}
                            <section className="mb-5">
                                <h6 className="text-primary">2. Lesión por presión (LPP)</h6>

                                <div className="form-group mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="lesionPresion"
                                        name="lesionPresion"
                                        checked={datosVisita.lesionPresion}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="lesionPresion">¿Usted presenta Lesión por presión (LPP)?</label>
                                </div>

                                {datosVisita.lesionPresion && (
                                    <>
                                        <div className="form-row mb-3">
                                            <div className="col-md-6">
                                                <label>Ubicación</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="ubicacionLPP"
                                                    value={datosVisita.ubicacionLPP}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label>Clasificación LPP</label>
                                                <select
                                                    className="form-control"
                                                    name="clasificacionLPP"
                                                    value={datosVisita.clasificacionLPP}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccione...</option>
                                                    <option value="I">I</option>
                                                    <option value="II">II</option>
                                                    <option value="III">III</option>
                                                    <option value="IV">IV</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row mb-3">
                                            <div className="col-md-6">
                                                <label>Personal que realiza curaciones</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="personalCuraciones"
                                                    value={datosVisita.personalCuraciones}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label>Frecuencia</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="frecuenciaCuraciones"
                                                    value={datosVisita.frecuenciaCuraciones}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Escala de Norton con Selects */}
                                        <div className="form-group mb-3">
                                            <label>
                                                Riesgo de presentar LPP según Escala de Norton (Puntaje)
                                                <small className="text-muted ml-2 d-block d-md-inline">
                                                    [Punt. 5-9: Muy alto, 10-12: Alto, 13-14: Medio, Mayor de 14: Bajo/No riesgo]
                                                </small>
                                            </label>

                                            <div className="row">
                                                {/* Estado Físico General */}
                                                <div className="col-md-6 col-lg-4 mb-3">
                                                    <label className="form-label">
                                                        <strong>Estado Físico General</strong>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={datosVisita.nortonDetalle.estadoFisico}
                                                        onChange={(e) => handleNortonChange('estadoFisico', e.target.value)}
                                                    >
                                                        {nortonOpciones.estadoFisico.map((opcion) => (
                                                            <option key={opcion.value} value={opcion.value}>
                                                                {opcion.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Estado Mental */}
                                                <div className="col-md-6 col-lg-4 mb-3">
                                                    <label className="form-label">
                                                        <strong>Estado Mental</strong>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={datosVisita.nortonDetalle.estadoMental}
                                                        onChange={(e) => handleNortonChange('estadoMental', e.target.value)}
                                                    >
                                                        {nortonOpciones.estadoMental.map((opcion) => (
                                                            <option key={opcion.value} value={opcion.value} disabled={opcion.disabled}>
                                                                {opcion.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Actividad */}
                                                <div className="col-md-6 col-lg-4 mb-3">
                                                    <label className="form-label">
                                                        <strong>Actividad</strong>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={datosVisita.nortonDetalle.actividad}
                                                        onChange={(e) => handleNortonChange('actividad', e.target.value)}
                                                    >
                                                        {nortonOpciones.actividad.map((opcion) => (
                                                            <option key={opcion.value} value={opcion.value} disabled={opcion.disabled}>
                                                                {opcion.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Movilidad */}
                                                <div className="col-md-6 col-lg-4 mb-3">
                                                    <label className="form-label">
                                                        <strong>Movilidad</strong>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={datosVisita.nortonDetalle.movilidad}
                                                        onChange={(e) => handleNortonChange('movilidad', e.target.value)}
                                                    >
                                                        {nortonOpciones.movilidad.map((opcion) => (
                                                            <option key={opcion.value} value={opcion.value} disabled={opcion.disabled}>
                                                                {opcion.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Incontinencia */}
                                                <div className="col-md-6 col-lg-4 mb-3">
                                                    <label className="form-label">
                                                        <strong>Incontinencia</strong>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={datosVisita.nortonDetalle.incontinencia}
                                                        onChange={(e) => handleNortonChange('incontinencia', e.target.value)}
                                                    >
                                                        {nortonOpciones.incontinencia.map((opcion) => (
                                                            <option key={opcion.value} value={opcion.value} disabled={opcion.disabled}>
                                                                {opcion.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Resultado Norton */}
                                            <div className="mt-4">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <h6>Puntaje Total:
                                                            <span className="badge bg-primary fs-6 ms-2">
                                                                {datosVisita.puntajeNorton || 0}
                                                            </span>
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="row">
                                                    <div>
                                                        <h6>Clasificación de Riesgo:</h6>
                                                        <div className={`alert ${clasificacionNorton.clase} mb-0`}>
                                                            <strong>{clasificacionNorton.texto}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card bg-light p-3">
                                            <h6>Recomendaciones para prevenir LPP</h6>
                                            <ul className="mb-0">
                                                <li>Utilizar jabón neutro y agua tibia para la higiene.</li>
                                                <li>Mantener la piel limpia y seca especialmente de la zona perianal en caso de incontinencia.</li>
                                                <li>Usar colectores o dispositivos que favorezcan la transpiración y eviten la humedad en la zona. Limitar el uso de pañales si no es estrictamente necesario. En caso de necesitarlos, cambiarlos de forma frecuente.</li>
                                                <li>Mantener la piel limpia y seca, teniendo especial cuidado en ingles, mamas y pliegues.</li>
                                                <li>No abusar de la colonia. Reseca la piel.</li>
                                                <li>Mantener la piel hidratada, use cremas humectantes o hidratantes.</li>
                                                <li>Aplicar de forma suave, soluciones especiales para la prevención de úlceras: ácidos grasos hiperoxigenados, aloe vera en las zonas de riesgo de presión.</li>
                                                <li>No hacer masajes en las zonas de riesgo.</li>
                                                <li>La ropa de la cama debe estar seca, sin arrugas.</li>
                                                <li>Usar calcetines de algodón sin costuras para evitar lesiones por roce en talones y tobillos.</li>
                                                <li>Levantar de la cama, si su estado lo permite, de forma diaria.</li>
                                                <li>Si el paciente presenta una úlcera evitar el apoyo sobre la herida.</li>
                                                <li>Utilizar almohadas para evitar apoyar las zonas de riesgo o ya lesionadas.</li>
                                                <li>No utilizar cojines en forma de rueda de ningún tipo de material (picarones). Su uso favorece la aparición de UPP en las zonas de apoyo ya que concentra la presión en dicha zona.</li>
                                                <li>Es recomendable el uso de colchones antiescaras para el alivio de presión (su uso no excluye la necesidad de realizar cambios de posición de forma frecuente).</li>
                                                <li>En cama, cambiar de posición cada dos-tres horas haciendo rotación por las siguientes tres posiciones: boca arriba, lateral derecho y lateral izquierdo.</li>
                                                <li>No arrastrar a la persona para moverla, se puede ayudar de una sábana o hacerla rodar.</li>
                                                <li>Si el usuario está sentado en silla de ruedas, sillón, sofá… cambiar de posición cada hora, recolocando al individuo sin arrastrar.</li>
                                                <li>Evitar estar sentado durante un período de tiempo prolongado en pacientes de alto riesgo.</li>
                                                <li>Mantener un régimen rico en proteínas y consumir agua al menos 8 vasos al día.</li>
                                                <li>Consulte de inmediato al equipo de salud si aparece enrojecimiento en zonas de presión que no palidece a la presión.</li>
                                                <li>Si observa algún signo de infección como inflamación, dolor, supuración, mal olor.</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </section>
                        </div>
                    )}

                    {sections[currentSection]?.key === 'diabetico' && (
                        <div>

                            {/* Formulario para diabéticos */}
                            <section className="mb-5">
                                <div className="form-group form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="esDiabetico"
                                        name="esDiabetico"
                                        checked={datosVisita.esDiabetico}
                                        onChange={handleChange}
                                    />
                                    <h6 className="text-primary">Si el usuario es diabético</h6>
                                </div>

                                {datosVisita.esDiabetico && (
                                    <>
                                        <div className="form-group mb-1">
                                            <label>2. Riesgo de Hipo-Hiperglicemia</label>
                                        </div>
                                        <div className="form-group form-check mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="hipoglicemia"
                                                name="hipoglicemia"
                                                checked={datosVisita.hipoglicemia}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="hipoglicemia">Ud. ha presentado signos de hipoglicemia? (sudoración, temblor, mareos, taquicardia)</label>
                                        </div>
                                        {datosVisita.hipoglicemia && (
                                            <div className="form-group mb-3">
                                                <label>¿Realiza alguna intervención al respecto? Sí / No ¿Cuál?</label>
                                                <textarea
                                                    className="form-control"
                                                    name="intervencionHipoglicemia"
                                                    value={datosVisita.intervencionHipoglicemia}
                                                    onChange={handleChange}
                                                    rows="2"
                                                />
                                            </div>
                                        )}

                                        <div className="form-group form-check mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="hiperglicemia"
                                                name="hiperglicemia"
                                                checked={datosVisita.hiperglicemia}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="hiperglicemia">Ud. ha presentado signos de hiperglicemia? (sed extrema, visión borrosa, náuseas, vómitos, aliento afrutado, dolor abdominal, boca seca)</label>
                                        </div>
                                        {datosVisita.hiperglicemia && (
                                            <div className="form-group mb-3">
                                                <label>¿Realiza alguna intervención al respecto? Sí / No ¿Cuál?</label>
                                                <textarea
                                                    className="form-control"
                                                    name="intervencionHiperglicemia"
                                                    value={datosVisita.intervencionHiperglicemia}
                                                    onChange={handleChange}
                                                    rows="2"
                                                />
                                            </div>
                                        )}

                                        <div className="card bg-light p-3 mt-3">
                                            <h6>Recomendaciones en caso de hipoglicemia:</h6>
                                            <ul>
                                                <li>Deje de realizar lo que esté haciendo (almuerzo, aseo, etc.)</li>
                                                <li>Solicite ayuda a personas cercanas.</li>
                                                <li>Mida su glicemia si es posible con glucómetro.</li>
                                                <li>Tome 2 raciones de hidratos de carbono de absorción rápida.</li>
                                                <li>Espere 15 minutos y repita la medición, si persiste alterada vaya a un centro asistencial.</li>
                                                <li>Recuerde no automedicarse.</li>
                                                <li>En caso de pérdida de conciencia no dar alimentos ni líquidos por boca.</li>
                                            </ul>

                                            <h6>Recomendaciones en caso de hiperglicemia:</h6>
                                            <ul>
                                                <li>Deje de realizar lo que esté haciendo.</li>
                                                <li>Solicite ayuda a personas cercanas.</li>
                                                <li>Mida su glicemia si es posible con glucómetro.</li>
                                                <li>Si tiene indicado insulina cristalina (rápida), administre según esquema.</li>
                                                <li>Acuda de inmediato al centro asistencial más cercano.</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </section>

                            {/* Formulario para hipertensos */}
                            <section className="mb-5">
                                <div className="form-group form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="esHipertenso"
                                        name="esHipertenso"
                                        checked={datosVisita.esHipertenso}
                                        onChange={handleChange}
                                    />
                                    <h6 className="text-primary">Si el usuario es hipertenso</h6>
                                </div>

                                {datosVisita.esHipertenso && (
                                    <>
                                        <div className="form-group mb-1">
                                            <label>3. Riesgo de crisis hipertensiva</label>
                                        </div>
                                        <h6>Ud. ha presentado los siguientes síntomas:</h6>
                                        <div className="form-group form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="dolorPecho"
                                                name="dolorPecho"
                                                checked={datosVisita.sintomasCrisis.dolorPecho}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setDatosVisita((prev) => ({
                                                        ...prev,
                                                        sintomasCrisis: { ...prev.sintomasCrisis, dolorPecho: checked },
                                                    }));
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="dolorPecho">
                                                Dolor de pecho intenso
                                            </label>
                                        </div>

                                        <div className="form-group form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="dolorCabeza"
                                                name="dolorCabeza"
                                                checked={datosVisita.sintomasCrisis.dolorCabeza}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setDatosVisita((prev) => ({
                                                        ...prev,
                                                        sintomasCrisis: { ...prev.sintomasCrisis, dolorCabeza: checked },
                                                    }));
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="dolorCabeza">
                                                Dolor de cabeza intenso acompañado de confusión y visión borrosa
                                            </label>
                                        </div>

                                        <div className="form-group form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="zumbidoOidos"
                                                name="zumbidoOidos"
                                                checked={datosVisita.sintomasCrisis.zumbidoOidos}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setDatosVisita((prev) => ({
                                                        ...prev,
                                                        sintomasCrisis: { ...prev.sintomasCrisis, zumbidoOidos: checked },
                                                    }));
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="zumbidoOidos">
                                                Zumbido de oídos
                                            </label>
                                        </div>

                                        <div className="form-group form-check mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="nauseas"
                                                name="nauseas"
                                                checked={datosVisita.sintomasCrisis.nauseas}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setDatosVisita((prev) => ({
                                                        ...prev,
                                                        sintomasCrisis: { ...prev.sintomasCrisis, nauseas: checked },
                                                    }));
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="nauseas">
                                                Náuseas y vómitos
                                            </label>
                                        </div>

                                        <div className="card bg-light p-3 mb-3">
                                            <h6>Recomendaciones</h6>
                                            <ul className="mb-0">
                                                <li>Recuerde tomar su medicamento para controlar la presión arterial en dosis y horarios correctos.</li>
                                                <li>Reduzca el consumo de sal.</li>
                                                <li>Consuma una alimentación saludable según indicación de nutricionista.</li>
                                                <li>Evite el consumo de alcohol y tabaco.</li>
                                                <li>Asista a sus controles regularmente según citación.</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h6>Adherencia al tratamiento farmacológico</h6>
                                            <h6>Test Morisky-Green</h6>

                                            {preguntas.map(pregunta => (
                                                <div className="form-group mb-3" key={pregunta.id}>
                                                    <label className="form-check-label">{pregunta.texto}</label>
                                                    <div className="d-flex">
                                                        <div className="form-check mr-3">
                                                            <input type="radio" id={`${pregunta.id}Si`} className="form-check-input"
                                                                name={pregunta.id}
                                                                value="si"
                                                                checked={datosVisita.adherencia[pregunta.id] === 'si'}
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor={`${pregunta.id}Si`} className="form-check-label">Si ({pregunta.puntaje.si})</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input type="radio" id={`${pregunta.id}No`} className="form-check-input"
                                                                name={pregunta.id}
                                                                value="no"
                                                                checked={datosVisita.adherencia[pregunta.id] === 'no'}
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor={`${pregunta.id}No`} className="form-check-label">No ({pregunta.puntaje.no})</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <h6>Adhiere al tratamiento</h6>
                                            <div className="form-group mb-3">
                                                <label className="form-check-label">Puntaje total de adherencia: {datosVisita.puntajeAdherencia}</label>
                                                <div>
                                                    <div className={`alert ${datosVisita.puntajeAdherencia >= 4 ? 'alert-success' : 'alert-danger'}`}>
                                                        {datosVisita.puntajeAdherencia >= 4 ? 'Adhiere al tratamiento' : 'No adhiere al tratamiento'}
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="card bg-light p-3 mb-3">
                                                <h6>Recomendaciones</h6>
                                                <ul className="mb-0">
                                                    <li>Intentar llevar una vida con un horario estable, con el menor cambio posible en horas de comida
                                                        y descanso que permita tener una rutina diaria, que favorezca la toma de medicamentos.</li>
                                                    <li>Solicitar un esquema por escrito de los medicamentos con dosis y horarios para evitar olvidos.</li>
                                                    <li>Mantener un diario o registro donde se anoten las tomas.</li>
                                                    <li>Usar la alarma del teléfono móvil o reloj para recordar los horarios de toma de medicamentos.</li>
                                                    <li>Informar al equipo de salud, efectos secundarios que le afecten durante el tratamiento.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <h6>5. Efectos secundarios a los medicamentos</h6>
                                        <div className="form-group mb-3">
                                            <label>Algún o algunos de los medicamentos que usted toma le produce algún malestar físico?, como: mareos, tos, náuseas, diarrea, etc.</label>
                                            <input
                                                type="text"
                                                className="form-control mb-3"
                                                placeholder="Algún malestar físico, p.ej: mareos, tos, náuseas..."
                                                name="efectosSecundarios"
                                                value={datosVisita.efectosSecundarios || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>¿Realiza alguna intervención para solucionar?</label>
                                            <div className="d-flex">
                                                < div className="form-check mr-3">
                                                    <input
                                                        type="radio"
                                                        id="intervencionSi"
                                                        className="form-check-input"
                                                        name="intervencionEfectosSecundarios"
                                                        value="si"
                                                        checked={datosVisita.intervencionEfectosSecundarios === 'si'}
                                                        onChange={handleChange}
                                                    />
                                                    <label htmlFor="intervencionSi" className="form-check-label">Sí</label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        id="intervencionNo"
                                                        className="form-check-input"
                                                        name="intervencionEfectosSecundarios"
                                                        value="no"
                                                        checked={datosVisita.intervencionEfectosSecundarios === 'no'}
                                                        onChange={handleChange}
                                                    />
                                                    <label htmlFor="intervencionNo" className="form-check-label">No</label>
                                                </div>
                                            </div>
                                        </div>
                                        {datosVisita.intervencionEfectosSecundarios === 'si' && (
                                            <div className="form-group mb-3">
                                                <label>¿Qué intervención realiza?</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    name="descripcionIntervencionEfectosSecundarios"
                                                    value={datosVisita.descripcionIntervencionEfectosSecundarios || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </section>
                        </div>
                    )}

                    {sections[currentSection]?.key === 'nutricion' && (
                        <div>
                            <section className="mb-5">
                                <h6 className="text-primary">III. Necesidad de nutrición, necesidad de agua y electrolíticos</h6>

                                <div className="form-group mb-3">
                                    <label>1. ¿Cuántas comidas consume al día? ¿Con qué consistencia? (Entero, picado, molido, etc.)</label>
                                    <input
                                        type="text"
                                        id="cantidadComidas"
                                        className="form-control"
                                        name="cantidadComidas"
                                        placeholder="Ejemplo: 3 comidas, picado"
                                        value={datosVisita.cantidadComidas || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>2. Habitualmente, ¿Qué consume en el día?</label>
                                    <textarea
                                        className="form-control"
                                        id="consumoHabitual"
                                        rows="3"
                                        name="consumoHabitual"
                                        placeholder="Describa lo que consume habitualmente"
                                        value={datosVisita.consumoHabitual || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>3. ¿Necesita asistencia o ayuda para alimentarse?</label>
                                    <div className="d-flex">
                                        <div className="form-check mr-3">
                                            <input
                                                type="radio"
                                                id="asistenciaSi"
                                                className="form-check-input"
                                                name="asistenciaAlimentacion"
                                                value="si"
                                                checked={datosVisita.asistenciaAlimentacion === 'si'}
                                                onChange={(e) => setDatosVisita(prev => ({ ...prev, asistenciaAlimentacion: e.target.value }))}
                                            />
                                            <label htmlFor="asistenciaSi" className="form-check-label">Sí</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="asistenciaNo"
                                                className="form-check-input"
                                                name="asistenciaAlimentacion"
                                                value="no"
                                                checked={datosVisita.asistenciaAlimentacion === 'no'}
                                                onChange={(e) => setDatosVisita(prev => ({ ...prev, asistenciaAlimentacion: e.target.value }))}
                                            />
                                            <label htmlFor="asistenciaNo" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                </div>

                                <h6>Recomendaciones:</h6>
                                <ul>
                                    <li>Limitar alimentos con altos contenidos de azúcar y sal.</li>
                                    <li>Comer porciones pequeñas a lo largo del día.</li>
                                    <li>Limitar el consumo de hidratos de carbono.</li>
                                    <li>Consumir una gran variedad de alimentos integrales, frutas y vegetales.</li>
                                    <li>Limitar el consumo de alimentos ricos en grasa y frituras.</li>
                                    <li>Intentar no consumir alcohol.</li>
                                    <li>Consumir un plato equilibrado de nutrientes, donde en el centro se encuentra el agua, 50% debe ser verduras como ensaladas, verduras cocidas y frutas. La otra mitad del plato estaría compuesto por una porción de hidratos de carbono, cereales, pasta, pan, otra porción de carnes y/o legumbres, lácteos y restringido el aceite, el cual debiera usarse idealmente crudo.</li>
                                    <li>Evitar consumir comida “chatarra” alta en azúcar y grasas saturadas, como helados, papas fritas.</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h6 className="text-primary">IV. Necesidad de actividad y reposo</h6>

                                <div className="form-group mb-3">
                                    <label>Usted se moviliza:</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="movilizaSolo"
                                            className="form-check-input"
                                            name="movilidad"
                                            value="solo"
                                            checked={datosVisita.movilidad === 'solo'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, movilidad: e.target.value }))}
                                        />
                                        <label htmlFor="movilizaSolo" className="form-check-label">Por sí solo</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="movilizaConAyuda"
                                            className="form-check-input"
                                            name="movilidad"
                                            value="conAyuda"
                                            checked={datosVisita.movilidad === 'conAyuda'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, movilidad: e.target.value }))}
                                        />
                                        <label htmlFor="movilizaConAyuda" className="form-check-label">Con ayuda de otra persona</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="movilizaConAyudasTecnicas"
                                            className="form-check-input"
                                            name="movilidad"
                                            value="conAyudasTecnicas"
                                            checked={datosVisita.movilidad === 'conAyudasTecnicas'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, movilidad: e.target.value }))}
                                        />
                                        <label htmlFor="movilizaConAyudasTecnicas" className="form-check-label">Con ayudas técnicas (andador, bastón, silla de ruedas)</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="movilizaEnCama"
                                            className="form-check-input"
                                            name="movilidad"
                                            value="enCama"
                                            checked={datosVisita.movilidad === 'enCama'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, movilidad: e.target.value }))}
                                        />
                                        <label htmlFor="movilizaEnCama" className="form-check-label">Sólo se moviliza en cama</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="noMoviliza"
                                            className="form-check-input"
                                            name="movilidad"
                                            value="noMoviliza"
                                            checked={datosVisita.movilidad === 'noMoviliza'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, movilidad: e.target.value }))}
                                        />
                                        <label htmlFor="noMoviliza" className="form-check-label">No puede movilizarse por sí solo</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Tipo de cama:</label>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            id="tipoCamaComun"
                                            className="form-check-input"
                                            name="tipoCama"
                                            value="comun"
                                            checked={datosVisita.tipoCama === 'comun'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, tipoCama: e.target.checked ? 'comun' : '' }))}
                                        />
                                        <label htmlFor="tipoCamaComun" className="form-check-label">Común</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            id="tipoCamaCatreClinico"
                                            className="form-check-input"
                                            name="tipoCama"
                                            value="catreClinico"
                                            checked={datosVisita.tipoCama === 'catreClinico'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, tipoCama: e.target.checked ? 'catreClinico' : '' }))}
                                        />
                                        <label htmlFor="tipoCamaCatreClinico" className="form-check-label">Catre clínico</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Altura de la cama:</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="alturaAdecuada"
                                            className="form-check-input"
                                            name="alturaCama"
                                            value="adecuada"
                                            checked={datosVisita.alturaCama === 'adecuada'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, alturaCama: e.target.value }))}
                                        />
                                        <label htmlFor="alturaAdecuada" className="form-check-label">Adecuada</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="alturaNoAdecuada"
                                            className="form-check-input"
                                            name="alturaCama"
                                            value="noAdecuada"
                                            checked={datosVisita.alturaCama === 'noAdecuada'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, alturaCama: e.target.value }))}
                                        />
                                        <label htmlFor="alturaNoAdecuada" className="form-check-label">No adecuada</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Uso de colchón antiescara?: </label>
                                    <input
                                        type="checkbox"
                                        id="colchonAntiescara"
                                        className="form-check-input ml-1"
                                        name="colchonAntiescara"
                                        checked={datosVisita.colchonAntiescara}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, colchonAntiescara: e.target.checked }))}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Ud. realiza ejercicios indicados por el kinesiólogo?</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="ejerciciosSi"
                                            className="form-check-input"
                                            name="ejerciciosKinesiologo"
                                            value="si"
                                            checked={datosVisita.ejerciciosKinesiologo === 'si'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, ejerciciosKinesiologo: e.target.value }))}
                                        />
                                        <label htmlFor="ejerciciosSi" className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="ejerciciosNo"
                                            className="form-check-input"
                                            name="ejerciciosKinesiologo"
                                            value="no"
                                            checked={datosVisita.ejerciciosKinesiologo === 'no'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, ejerciciosKinesiologo: e.target.value }))}
                                        />
                                        <label htmlFor="ejerciciosNo" className="form-check-label">No</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Qué ejercicio realiza?, especifique:</label>
                                    <input
                                        type="text"
                                        id="ejercicioRealizado"
                                        className="form-control"
                                        name="ejercicioEspecifico"
                                        value={datosVisita.ejercicioEspecifico}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, ejercicioEspecifico: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Con qué frecuencia?</label>
                                    <input
                                        type="text"
                                        id="frecuenciaEjercicio"
                                        className="form-control"
                                        name="frecuenciaEjercicio"
                                        value={datosVisita.frecuenciaEjercicio}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, frecuenciaEjercicio: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Presenta dificultad para dormir en la noche?</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="dificultadDormirSi"
                                            className="form-check-input"
                                            name="dificultadDormir"
                                            value="si"
                                            checked={datosVisita.dificultadDormir === 'si'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, dificultadDormir: e.target.value }))}
                                        />
                                        <label htmlFor="dificultadDormir Si" className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="dificultadDormirNo"
                                            className="form-check-input"
                                            name="dificultadDormir"
                                            value="no"
                                            checked={datosVisita.dificultadDormir === 'no'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, dificultadDormir: e.target.value }))}
                                        />
                                        <label htmlFor="dificultadDormirNo" className="form-check-label">No</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Explique:</label>
                                    <textarea
                                        className="form-control"
                                        id="dificultadDormirExplicacion"
                                        name="explicacionDificultadDormir"
                                        value={datosVisita.explicacionDificultadDormir}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, explicacionDificultadDormir: e.target.value }))}
                                    />
                                </div>

                                <h6 className="text-primary">Recomendaciones:</h6>
                                <ul>
                                    <li>Actividad física regular como: caminata, ejercicio de fuerza y equilibrio según grado de dependencia.</li>
                                </ul>

                                <h6 className="text-primary">Para personas de 65 años y más:</h6>
                                <ul>
                                    <li>Las personas con problemas de movilidad deben practicar actividad física para mejorar su equilibrio y prevenir caídas por lo menos 3 días a la semana.</li>
                                    <li>La intensidad con que se practican distintas formas de actividad física varía según las personas.</li>
                                    <li>Para que beneficie a la salud cardiorrespiratoria, toda actividad debe realizarse en periodos de al menos 10 minutos de duración.</li>
                                </ul>

                                <h6 className="text-primary">Por qué es importante practicar actividad física:</h6>
                                <ul>
                                    <li>Mejora el estado muscular y cardiorrespiratorio, la salud ósea y funcional.</li>
                                    <li>Reduce el riesgo de hipertensión, cardiopatía coronaria, accidente cerebrovascular, diabetes, diferentes tipos de cáncer (como el cáncer de mama y el de colon) y depresión.</li>
                                    <li>Reduce el riesgo de caídas y de fracturas vertebrales o de cadera.</li>
                                </ul>
                            </section>
                        </div>
                    )}

                    {sections[currentSection]?.key === 'eliminacion' && (
                        <div>
                            <section className="mb-5">
                                <h6 className="text-primary">II. Necesidad de eliminación</h6>

                                <div className="form-group mb-3">
                                    <label>1. Ud. ha presentado aumento o disminución en el volumen y frecuencia de la micción:</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="miccionSi"
                                            className="form-check-input"
                                            name="miccion"
                                            value="si"
                                            checked={datosVisita.miccion === 'si'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, miccion: e.target.value }))}
                                        />
                                        <label htmlFor="miccionSi" className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="miccionNo"
                                            className="form-check-input"
                                            name="miccion"
                                            value="no"
                                            checked={datosVisita.miccion === 'no'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, miccion: e.target.value }))}
                                        />
                                        <label htmlFor="miccionNo" className="form-check-label">No</label>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control mt-2"
                                        name="miccionCual"
                                        placeholder="¿Cuál?"
                                        value={datosVisita.miccionCual || ''}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, miccionCual: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>2. Ud. ha presentado orinas oscuras, concentradas y de mal olor:</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="orinaOscuraSi"
                                            className="form-check-input"
                                            name="orinaOscura"
                                            value="si"
                                            checked={datosVisita.orinaOscura === 'si'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, orinaOscura: e.target.value }))}
                                        />
                                        <label htmlFor="orinaOscuraSi" className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="orinaOscuraNo"
                                            className="form-check-input"
                                            name="orinaOscura"
                                            value="no"
                                            checked={datosVisita.orinaOscura === 'no'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, orinaOscura: e.target.value }))}
                                        />
                                        <label htmlFor="orinaOscuraNo" className="form-check-label">No</label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>3. Ud. ha presentado estreñimiento o dificultad para eliminar deposiciones:</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="estrecimientoSi"
                                            className="form-check-input"
                                            name="estreñimiento"
                                            value="si"
                                            checked={datosVisita.estreñimiento === 'si'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, estreñimiento: e.target.value }))}
                                        />
                                        <label htmlFor="estrecimientoSi" className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="estreñimientoNo"
                                            className="form-check-input"
                                            name="estreñimiento"
                                            value="no"
                                            checked={datosVisita.estreñimiento === 'no'}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, estreñimiento: e.target.value }))}
                                        />
                                        <label htmlFor="estreñimientoNo" className="form-check-label">No</label>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-control mt-2"
                                        name="diasEstreñimiento"
                                        placeholder="¿Hace cuántos días?"
                                        value={datosVisita.diasEstreñimiento || ''}
                                        onChange={(e) => setDatosVisita(prev => ({ ...prev, diasEstreñimiento: e.target.value }))}
                                    />
                                    <div className="form-group mt-2">
                                        <label>¿Ha realizado alguna intervención para su mejoría?</label>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="intervencionSi"
                                                className="form-check-input"
                                                name="intervencion"
                                                value="si"
                                                checked={datosVisita.intervencion === 'si'}
                                                onChange={(e) => setDatosVisita(prev => ({ ...prev, intervencion: e.target.value }))}
                                            />
                                            <label htmlFor="intervencionSi" className="form-check-label">Sí</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="intervencionNo"
                                                className="form-check-input"
                                                name="intervencion"
                                                value="no"
                                                checked={datosVisita.intervencion === 'no'}
                                                onChange={(e) => setDatosVisita(prev => ({ ...prev, intervencion: e.target.value }))}
                                            />
                                            <label htmlFor="intervencionNo" className="form-check-label">No</label>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control mt-2"
                                            name="intervencionCual"
                                            placeholder="¿Cuál?"
                                            value={datosVisita.intervencionCual || ''}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, intervencionCual: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <h6 className="text-primary mt-4">Recomendaciones:</h6>
                                <ul>
                                    <li>Aumente ingesta de agua de 1 a 2 litros por día (considerar patologías concomitantes).</li>
                                    <li>Conozca las características propias de su orina como color, olor, frecuencia, cantidad. Si presenta alteración de las características, debe consultar a un profesional de la salud.</li>
                                    <li>Favorezca la eliminación vesical, no retenga la orina.</li>
                                    <li>Favorecer la higiene genital con agua corriente, no utilice jabón, evite usar toallas húmedas.</li>
                                    <li>Consumir alimentos saludables, tome los medicamentos según corresponda.</li>
                                    <li>Consultar a centro asistencial si persiste las molestias.</li>
                                    <li>Realizar ejercicios pasivos o movilizarse dentro de lo posible para permitir la eliminación de las deposiciones.</li>
                                    <li>En caso de indicación médica, tomar laxantes en dosis y horarios establecidos.</li>
                                </ul>
                            </section>
                        </div>
                    )}

                    {sections[currentSection]?.key === 'tipoPaciente' && (
                        <div>
                            <div className="form-group mb-4">
                                <label className='text-primary'>Tipo de Paciente</label>
                                <select
                                    className="form-control"
                                    value={tipoPaciente}
                                    onChange={(e) => setTipoPaciente(e.target.value)}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="adulto">Adulto</option>
                                    <option value="adulto mayor">Adulto Mayor</option>
                                </select>
                            </div>

                            {tipoPaciente === 'adulto' && (
                                <section className="mb-5">
                                    <h6 className="text-primary">III. Necesidad de estima, autoestima y realización (PARA ADULTOS)</h6>
                                    <p>El PHQ-9 es una medida de autoinforme de nueve ítems que evalúa la presencia de síntomas depresivos basados en los criterios del DSM-IV para el episodio depresivo mayor, siendo los puntajes de corte recomendados entre 8 y 11 para un probable caso de depresión mayor.</p>

                                    <h6>Durante las dos últimas semanas, ¿con qué frecuencia le han molestado los siguientes problemas?</h6>
                                    {Array.from({ length: 9 }, (_, index) => (
                                        <div className="form-group mb-3" key={index}>
                                            <label>{index + 1}. {getPregunta(index)}</label>
                                            <select
                                                className="form-control"
                                                name={`phq9_${index}`}
                                                value={datosVisita.phq9[index] || ''}
                                                onChange={(e) => {
                                                    const newPhq9 = [...datosVisita.phq9];
                                                    newPhq9[index] = e.target.value;
                                                    setDatosVisita(prev => ({ ...prev, phq9: newPhq9 }));
                                                    calcularPuntajePHQ9(newPhq9); // Recalcular puntaje al cambiar respuesta
                                                }}
                                            >
                                                <option value="">Seleccione</option>
                                                <option value="0">Nunca</option>
                                                <option value="1">Varios días</option>
                                                <option value="2">Más de la mitad de los días</option>
                                                <option value="3">Casi todos los días</option>
                                            </select>
                                        </div>
                                    ))}

                                    <div className="form-group mb-3">
                                        <label>¿Cuán difícil se le ha hecho cumplir con su trabajo, atender su casa, o relacionarse con otras personas debido a estos problemas?</label>
                                        <select
                                            className="form-control"
                                            name="dificultad"
                                            value={datosVisita.dificultad || ''}
                                            onChange={(e) => setDatosVisita(prev => ({ ...prev, dificultad: e.target.value }))}
                                        >
                                            <option value="">Seleccione</option>
                                            <option value="0">Nada en absoluto</option>
                                            <option value="1">Algo difícil</option>
                                            <option value="2">Muy difícil</option>
                                            <option value="3">Extremadamente difícil</option>
                                        </select>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>Puntaje Total: {datosVisita.puntajePHQ9}</label>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>Resultado Categoría:</label>
                                        <p>{clasificarResultado(datosVisita.puntajePHQ9)}</p>
                                    </div>

                                    {datosVisita.puntajePHQ9 >= 10 && (
                                        <div className="alert alert-warning">
                                            Desde los 10 puntos (clasificación moderado, moderado a grave y grave) se debe derivar a médico del CESFAM.
                                        </div>
                                    )}
                                </section>
                            )}

                            {tipoPaciente === 'adulto mayor' && (
                                <section className="mb-5">
                                    <h6 className="text-primary">Escala de depresión geriátrica de Yesavage (PARA ADULTO MAYOR)</h6>
                                    <p>Por favor, responda las siguientes preguntas:</p>
                                    {[
                                        "¿Está básicamente satisfecho con su vida?",
                                        "¿Ha renunciado a muchas de sus actividades e intereses?",
                                        "¿Siente que su vida está vacía?",
                                        "¿Se encuentra a menudo aburrido?",
                                        "¿Tiene esperanza en el futuro?",
                                        "¿Sufre molestias por pensamientos que no pueda sacarse de la cabeza?",
                                        "¿Tiene a menudo buen ánimo?",
                                        "¿Tiene miedo de que algo le esté pasando?",
                                        "¿Se siente feliz muchas veces?",
                                        "¿Se siente a menudo abandonado?",
                                        "¿Está a menudo intranquilo e inquieto?",
                                        "¿Prefiere quedarse en casa que acaso salir y hacer cosas nuevas?",
                                        "¿Frecuentemente está preocupado por el futuro?",
                                        "¿Encuentra que tiene más problemas de memoria que la mayoría de la gente?",
                                        "¿Piensa que es maravilloso vivir?",
                                        "¿Se siente a menudo desanimado y melancólico?",
                                        "¿Se siente bastante inútil en el medio en que está?",
                                        "¿Está muy preocupado por el pasado?",
                                        "¿Encuentra la vida muy estimulante?",
                                        "¿Es difícil para usted poner en marcha nuevos proyectos?",
                                        "¿Se siente lleno de energía?",
                                        "¿Siente que su situación es desesperada?",
                                        "¿Cree que mucha gente está mejor que usted?",
                                        "¿Frecuentemente está preocupado por pequeñas cosas?",
                                        "¿Frecuentemente siente ganas de llorar?",
                                        "¿Tiene problemas para concentrarse?",
                                        "¿Se siente mejor por la mañana al levantarse?",
                                        "¿Prefiere evitar reuniones sociales?",
                                        "¿Es fácil para usted tomar decisiones?",
                                        "¿Su mente está tan clara como lo acostumbraba a estar?"
                                    ].map((pregunta, index) => (
                                        <div className="form-group mb-3" key={index}>
                                            <label>{index + 1}. {pregunta}</label>
                                            <select
                                                className="form-control"
                                                name={`yesavage_${index}`}
                                                value={datosVisita.yesavage[index] || ''}
                                                onChange={(e) => {
                                                    const newYesavage = [...datosVisita.yesavage];
                                                    newYesavage[index] = e.target.value;
                                                    setDatosVisita(prev => ({ ...prev, yesavage: newYesavage }));

                                                    // Calcular el puntaje inmediatamente después de actualizar el estado
                                                    calcularPuntajeYesavage(newYesavage);
                                                }}
                                            >
                                                <option value="">Seleccione</option>
                                                <option value="SI">Sí</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                    ))}

                                    <div className="form-group mb-3">
                                        <label>Puntaje Total: {datosVisita.puntajeYesavage}</label>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>Resultado Categoría:</label>
                                        <p>
                                            {datosVisita.puntajeYesavage <= 10 ? "Normal" :
                                                datosVisita.puntajeYesavage <= 14 ? "Depresión (sensibilidad 84%; especificidad 95%)" :
                                                    "Depresión (sensibilidad 80%; especificidad 100%)"}
                                        </p>
                                    </div>

                                    <div className="alert alert-info">
                                        <h6>Recomendaciones:</h6>
                                        <ul>
                                            <li>Expresar los sentimientos a un amigo, familiar, sacerdote, pastor entre otros.</li>
                                            <li>No guardar las emociones o pensamientos, solo ocasionará tristeza y soledad.</li>
                                            <li>Unirse a grupos de apoyo, permitirá encontrarse con otras personas que viven situaciones similares.</li>
                                            <li>Pedir y aceptar ayuda psicológica si lo considera necesario.</li>
                                            <li>Realizar actividades recreativas saludables que generen placer.</li>
                                            <li>Continuar con la vida lo más normal posible, no aislarse.</li>
                                            <li>No aislarse de las amistades y familias.</li>
                                        </ul>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {sections[currentSection]?.key === 'otrasConsultas' && (
                        <div>
                            <section className="mb-5">
                                <h6 className="text-primary">Otras Consultas</h6>

                                <div className="form-group mb-3">
                                    <label>¿Qué otro síntoma o molestia ha presentado?</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="otrosSintomas"
                                        value={datosVisita.otrosSintomas}
                                        onChange={handleChange}
                                        placeholder="Describa otros síntomas o molestias..."
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>¿Cómo lo ha manejado o superado?</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="manejoSintomas"
                                        value={datosVisita.manejoSintomas}
                                        onChange={handleChange}
                                        placeholder="Describa cómo ha manejado o superado los síntomas..."
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Algún comentario que quisiera mencionar:</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="comentarios"
                                        value={datosVisita.comentarios}
                                        onChange={handleChange}
                                        placeholder="Escriba cualquier comentario adicional..."
                                    />
                                </div>
                            </section>
                        </div>
                    )}
                </div >
                <div className="d-flex justify-content-between mt-1">
                    {currentSection > 0 && (
                        <button
                            type="button"
                            className="btn btn-secondary ml-3 mb-3"
                            onClick={handlePreviousSection}
                        >
                            Anterior
                        </button>
                    )}
                    {currentSection < sections.length - 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary ml-3 mr-3 mb-3"
                            onClick={handleNextSection}
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-primary mr-3 mb-3"
                        >
                            Enviar
                        </button>
                    )}
                </div>
            </form>
        </div >
    );
}


export default VisitaDomiciliaria;
