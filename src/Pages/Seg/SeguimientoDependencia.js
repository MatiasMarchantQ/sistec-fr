import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Collapse } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const SeguimientoDependencia = ({ pacienteId, fichaId, pacienteDependencia }) => {
    const { getToken, user, handleSessionExpired } = useAuth();
    const TOTAL_LLAMADOS = 4; // Configurable - puedes cambiar este número fácilmente

    // Estado unificado para todos los llamados
    const [seguimientos, setSeguimientos] = useState({});
    const [modoEdicion, setModoEdicion] = useState({});
    const [seguimientosIds, setSeguimientosIds] = useState({});
    const [seguimientoPermisos, setSeguimientoPermisos] = useState({});
    const [estudiantesResponsables, setEstudiantesResponsables] = useState({});
    const [llamadosVisibles, setLlamadosVisibles] = useState({});
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [llamadosExpandidos, setLlamadosExpandidos] = useState({});

    // Inicializar datos por defecto para un llamado
    const crearLlamadoVacio = (numeroLlamado) => ({
        nombre: numeroLlamado === 1 ? (pacienteDependencia.nombre || '') : '',
        apellido: numeroLlamado === 1 ? (pacienteDependencia.apellido || '') : '',
        edad: numeroLlamado === 1 ? (pacienteDependencia.edad || '') : '',
        telefonos: numeroLlamado === 1 ? (pacienteDependencia.telefonos || '') : '',
        telefonos2: numeroLlamado === 1 ? (pacienteDependencia.telefonos2 || '') : '',
        diagnostico: pacienteDependencia.diagnosticos || '',
        gradoDependencia: pacienteDependencia.gradoDependencia || '',
        fechaContacto: new Date().toLocaleDateString('sv-SE'), // Formato YYYY-MM-DD en zona horaria local
        areasReforzadas: '',
        indicaciones: '',
        observaciones: ''
    });

    // Función para verificar si un seguimiento es editable
    const esSeguimientoEditable = (seguimiento, user) => {
        if (!seguimiento || !user) return false;
        return (
            (seguimiento.estudiante_id === user.estudiante_id) ||
            (!seguimiento.estudiante_id && (user.rol_id === 1 || user.rol_id === 2)) ||
            (seguimiento.usuario_id && (user.rol_id === 1 || user.rol_id === 2)) ||
            (seguimiento.estudiante_id && (user.rol_id === 1 || user.rol_id === 2))
        );
    };

    // Función para verificar si un llamado puede ser editado
    const puedeEditarLlamado = (numeroLlamado) => {
        // Solo puede editar si el llamado anterior está completo o es el primero
        if (numeroLlamado === 1) return true;
        return seguimientosIds[numeroLlamado - 1] !== null;
    };

    useEffect(() => {
        if (!user) {
            handleSessionExpired();
        }
    }, [user, handleSessionExpired]);

    useEffect(() => {
        if (pacienteId && user) {
            inicializarSeguimientos();
            cargarSeguimientosExistentes();
        }
    }, [pacienteId, user]);

    const llamadosExpandidosIniciales = {};

    const inicializarSeguimientos = () => {
        const seguimientosIniciales = {};
        const modoEdicionInicial = {};
        const seguimientosIdsIniciales = {};
        const seguimientoPermisosIniciales = {};
        const estudiantesResponsablesIniciales = {};
        const llamadosVisiblesIniciales = {};

        for (let i = 1; i <= TOTAL_LLAMADOS; i++) {
            seguimientosIniciales[i] = crearLlamadoVacio(i);
            modoEdicionInicial[i] = false;
            seguimientosIdsIniciales[i] = null;
            seguimientoPermisosIniciales[i] = null;
            estudiantesResponsablesIniciales[i] = null;
            llamadosVisiblesIniciales[i] = i === 1; // Solo el primer llamado visible inicialmente
            llamadosExpandidosIniciales[i] = false;
        }

        setSeguimientos(seguimientosIniciales);
        setModoEdicion(modoEdicionInicial);
        setSeguimientosIds(seguimientosIdsIniciales);
        setSeguimientoPermisos(seguimientoPermisosIniciales);
        setEstudiantesResponsables(estudiantesResponsablesIniciales);
        setLlamadosVisibles(llamadosVisiblesIniciales);
        setLlamadosExpandidos(llamadosExpandidosIniciales);
    };

    const toggleExpandirLlamado = (numeroLlamado) => {
        setLlamadosExpandidos(prev => ({
            ...prev,
            [numeroLlamado]: !prev[numeroLlamado]
        }));
    };

    const cargarSeguimientosExistentes = async () => {
        try {
            setCargandoDatos(true);
            const token = getToken();
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/paciente-dependencia/seguimiento/paciente/${pacienteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data.length > 0) {
                const seguimientosData = response.data.data;

                // Procesar cada seguimiento existente
                seguimientosData.forEach(seguimientoData => {
                    const numeroLlamado = seguimientoData.numero_llamado;

                    // Actualizar IDs
                    setSeguimientosIds(prev => ({
                        ...prev,
                        [numeroLlamado]: seguimientoData.id
                    }));

                    // Actualizar permisos
                    setSeguimientoPermisos(prev => ({
                        ...prev,
                        [numeroLlamado]: {
                            estudiante_id: seguimientoData.estudiante_id,
                            usuario_id: seguimientoData.usuario_id
                        }
                    }));

                    // Actualizar responsable
                    let responsable = '';
                    if (seguimientoData.estudiante) {
                        responsable = `Estudiante responsable: ${seguimientoData.estudiante.nombres || ''} ${seguimientoData.estudiante.apellidos || ''}`;
                    } else if (seguimientoData.usuario) {
                        responsable = `Usuario responsable: ${seguimientoData.usuario.nombres || ''} ${seguimientoData.usuario.apellidos || ''}`;
                    }

                    setEstudiantesResponsables(prev => ({
                        ...prev,
                        [numeroLlamado]: responsable
                    }));

                    // Actualizar datos del seguimiento
                    setSeguimientos(prev => ({
                        ...prev,
                        [numeroLlamado]: {
                            ...prev[numeroLlamado],
                            fechaContacto: seguimientoData.fecha_contacto || prev[numeroLlamado].fechaContacto,
                            diagnostico: seguimientoData.diagnostico || prev[numeroLlamado].diagnostico,
                            gradoDependencia: seguimientoData.grado_dependencia || '',
                            areasReforzadas: seguimientoData.areas_reforzadas || '',
                            indicaciones: seguimientoData.indicaciones_educacion || '',
                            observaciones: seguimientoData.observaciones || ''
                        }
                    }));

                    // Hacer visible el siguiente llamado si existe este
                    if (numeroLlamado < TOTAL_LLAMADOS) {
                        setLlamadosVisibles(prev => ({
                            ...prev,
                            [numeroLlamado + 1]: true
                        }));
                    }

                    // Modo de solo lectura para registros existentes
                    setModoEdicion(prev => ({ ...prev, [numeroLlamado]: false }));
                });

                // Habilitar edición del primer llamado sin seguimiento
                const primerLlamadoSinSeguimiento = Array.from({ length: TOTAL_LLAMADOS }, (_, i) => i + 1)
                    .find(num => !seguimientosData.find(s => s.numero_llamado === num));

                if (primerLlamadoSinSeguimiento) {
                    setModoEdicion(prev => ({
                        ...prev,
                        [primerLlamadoSinSeguimiento]: puedeEditarLlamado(primerLlamadoSinSeguimiento)
                    }));
                }

                const ultimoLlamadoRegistrado = Math.max(...seguimientosData.map(s => s.numero_llamado));
                if (ultimoLlamadoRegistrado > 0) {
                    setLlamadosExpandidos(prev => ({
                        ...prev,
                        [ultimoLlamadoRegistrado]: true
                    }));
                }

                // Encontrar el primer llamado sin registrar y abrirlo también
                const primerLlamadoSinRegistrar = Array.from({ length: TOTAL_LLAMADOS }, (_, i) => i + 1)
                    .find(num => !seguimientosData.find(s => s.numero_llamado === num));

                if (primerLlamadoSinRegistrar) {
                    setLlamadosExpandidos(prev => ({
                        ...prev,
                        [primerLlamadoSinRegistrar]: true
                    }));
                }
            } else {
                // No hay seguimientos, habilitar el primer llamado
                setModoEdicion(prev => ({ ...prev, 1: true }));
                setLlamadosExpandidos(prev => ({ ...prev, 1: true }));
            }
        } catch (error) {
            console.error('Error al cargar seguimientos existentes:', error);
            if (error.response?.status !== 404) {
                toast.error('Error al cargar los datos existentes');
            }
            // Si hay error, habilitar primer llamado
            setModoEdicion(prev => ({ ...prev, 1: true }));
            // Limpiar permisos
            setSeguimientoPermisos({});
        } finally {
            setCargandoDatos(false);
        }
    };

    const toggleModoEdicion = (numeroLlamado) => {
        setModoEdicion(prev => ({
            ...prev,
            [numeroLlamado]: !prev[numeroLlamado]
        }));
    };

    const cancelarEdicion = (numeroLlamado) => {
        setModoEdicion(prev => ({
            ...prev,
            [numeroLlamado]: false
        }));
        // Recargar datos para cancelar cambios
        cargarSeguimientosExistentes();
    };

    const guardarLlamado = async (numeroLlamado) => {
        try {
            const token = getToken();
            const seguimientoActual = seguimientos[numeroLlamado];

            const datosEnvio = {
                paciente_id: pacienteId,
                numero_llamado: numeroLlamado,
                fecha_contacto: seguimientoActual.fechaContacto,
                diagnostico: seguimientoActual.diagnostico,
                grado_dependencia: seguimientoActual.gradoDependencia,
                areas_reforzadas: seguimientoActual.areasReforzadas,
                indicaciones_educacion: seguimientoActual.indicaciones,
                observaciones: seguimientoActual.observaciones,
                estudiante_id: user.estudiante_id || null,
                usuario_id: user.id || null
            };

            let response;
            const seguimientoId = seguimientosIds[numeroLlamado];

            // Si existe ID, actualizar; si no, crear nuevo
            if (seguimientoId) {
                response = await axios.put(
                    `${process.env.REACT_APP_API_URL}/paciente-dependencia/seguimiento/${seguimientoId}`,
                    datosEnvio,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(`Llamado ${numeroLlamado} actualizado correctamente`);
            } else {
                response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/paciente-dependencia/seguimiento`,
                    datosEnvio,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(`Llamado ${numeroLlamado} guardado correctamente`);

                // Guardar el ID del nuevo seguimiento
                if (response.data.success) {
                    setSeguimientosIds(prev => ({
                        ...prev,
                        [numeroLlamado]: response.data.data.id
                    }));
                }
            }

            if (response.data.success) {
                // Actualizar permisos
                setSeguimientoPermisos(prev => ({
                    ...prev,
                    [numeroLlamado]: {
                        estudiante_id: user.estudiante_id || null,
                        usuario_id: user.id || null
                    }
                }));

                // Actualizar responsable
                let responsable = '';
                if (user.estudiante_id) {
                    responsable = `Estudiante responsable: ${user.nombres || ''} ${user.apellidos || ''}`;
                } else {
                    responsable = `Usuario responsable: ${user.nombres || ''} ${user.apellidos || ''}`;
                }

                setEstudiantesResponsables(prev => ({
                    ...prev,
                    [numeroLlamado]: responsable
                }));

                // Desactivar modo edición después de guardar
                setModoEdicion(prev => ({ ...prev, [numeroLlamado]: false }));

                // Habilitar el siguiente llamado si existe
                if (numeroLlamado < TOTAL_LLAMADOS) {
                    setLlamadosVisibles(prev => ({
                        ...prev,
                        [numeroLlamado + 1]: true
                    }));

                    // Habilitar edición del siguiente llamado si no existe
                    if (!seguimientosIds[numeroLlamado + 1]) {
                        setModoEdicion(prev => ({
                            ...prev,
                            [numeroLlamado + 1]: true
                        }));
                    }
                }
            }
        } catch (error) {
            console.error(`Error al guardar el llamado ${numeroLlamado}`, error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(`Hubo un problema al guardar el llamado ${numeroLlamado}.`);
            }
        }
    };

    const toggleVisibilidadLlamado = (numeroLlamado) => {
        setLlamadosVisibles(prev => ({
            ...prev,
            [numeroLlamado]: !prev[numeroLlamado]
        }));
    };

    const actualizarSeguimiento = (numeroLlamado, campo, valor) => {
        setSeguimientos(prev => ({
            ...prev,
            [numeroLlamado]: {
                ...prev[numeroLlamado],
                [campo]: valor
            }
        }));
    };

    const obtenerTituloLlamado = (numeroLlamado) => {
        const nombres = ['Primer', 'Segundo', 'Tercer', 'Cuarto'];
        return `${nombres[numeroLlamado - 1]} Llamado Telefónico`;
    };

    const renderizarLlamado = (numeroLlamado) => {
        const seguimientoActual = seguimientos[numeroLlamado];
        const esPrimerLlamado = numeroLlamado === 1;
        const esVisible = llamadosVisibles[numeroLlamado];
        const esEditable = esSeguimientoEditable(seguimientoPermisos[numeroLlamado], user);
        const puedeEditar = puedeEditarLlamado(numeroLlamado);

        if (!esVisible && numeroLlamado !== 1) return null;

        return (
            <Card key={numeroLlamado} className="mb-4">
                <Card.Header
                    className={`custom-card text-light d-flex justify-content-between align-items-center ${!esPrimerLlamado ? 'cursor-pointer' : ''}`}
                    style={{ cursor: !esPrimerLlamado ? 'pointer' : 'default', position: 'relative' }}
                    onClick={!esPrimerLlamado ? () => toggleExpandirLlamado(numeroLlamado) : undefined}
                >
                    <span>
                        {obtenerTituloLlamado(numeroLlamado)}
                        {seguimientosIds[numeroLlamado] ? (
                            <span className="ms-2 badge bg-success">Registrado</span>
                        ) : (
                            <span className="ms-2 badge bg-danger">Sin registrar</span>
                        )}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {seguimientosIds[numeroLlamado] && esEditable && (
                            <div onClick={(e) => e.stopPropagation()}>
                                {!modoEdicion[numeroLlamado] ? (
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        style={{
                                            textDecoration: 'none',
                                            position: 'absolute',
                                            right: '35px',
                                            bottom: '12px'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModoEdicion(numeroLlamado);
                                            // Si el colapsable está cerrado, abrirlo
                                            if (!llamadosExpandidos[numeroLlamado]) {
                                                setLlamadosExpandidos(prev => ({
                                                    ...prev,
                                                    [numeroLlamado]: true
                                                }));
                                            }
                                        }}
                                    >
                                        Editar
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        style={{
                                            textDecoration: 'none',
                                            position: 'absolute',
                                            right: '35px',
                                            bottom: '12px'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelarEdicion(numeroLlamado);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        )}
                        {!esPrimerLlamado && (
                            <Button
                                variant="link"
                                className="text-light p-0"
                                style={{
                                    textDecoration: 'none',
                                    position: 'absolute',
                                    right: '15px'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVisibilidadLlamado(numeroLlamado);
                                }}
                            >
                                {llamadosExpandidos[numeroLlamado] ? '▲' : '▼'}
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Collapse in={esPrimerLlamado || llamadosExpandidos[numeroLlamado]}>
                    <Card.Body>
                        {/* Información del Paciente - Solo en el primer llamado */}
                        {esPrimerLlamado && (
                            <div className="mb-4 p-3 bg-light rounded">
                                <h6 className="mb-3 text-muted">Información del Paciente</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nombre del paciente</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={`${seguimientoActual.nombre || ''} ${seguimientoActual.apellido || ''}`}
                                                readOnly
                                                className="bg-white"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Edad</Form.Label>
                                            <Form.Control
                                                type="number"
                                                id='edadPac'
                                                name='edadPac'
                                                value={seguimientoActual.edad || ''}
                                                readOnly
                                                className="bg-white"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Teléfonos de contacto</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={seguimientoActual.telefonos || ''}
                                                readOnly
                                                className="bg-white"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Teléfono de contacto 2</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={seguimientoActual.telefonos2 || ''}
                                                readOnly
                                                className="bg-white"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Diagnóstico</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={seguimientoActual.diagnostico || ''}
                                        readOnly
                                        className="bg-white"
                                    />
                                </Form.Group>
                            </div>
                        )}

                        {/* Campos editables */}
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de contacto</Form.Label>
                            <Form.Control
                                type="date"
                                value={seguimientoActual.fechaContacto || ''}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => actualizarSeguimiento(numeroLlamado, 'fechaContacto', e.target.value)}
                                disabled={!modoEdicion[numeroLlamado]}
                                className={!modoEdicion[numeroLlamado] ? "bg-light" : ""}
                            />
                        </Form.Group>

                        {/* Diagnóstico - Solo editable en el primer llamado */}
                        {!esPrimerLlamado && (
                            <Form.Group className="mb-3">
                                <Form.Label>Diagnóstico</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={seguimientoActual.diagnostico || ''}
                                    readOnly
                                    className="bg-light"
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Grado de dependencia</Form.Label>
                            <Form.Select
                                value={seguimientoActual.gradoDependencia || ''}
                                onChange={(e) => actualizarSeguimiento(numeroLlamado, 'gradoDependencia', e.target.value)}
                                disabled={!modoEdicion[numeroLlamado]}
                                className={!modoEdicion[numeroLlamado] ? "bg-light" : ""}
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="Independencia total">Independencia total</option>
                                <option value="Dependencia leve">Dependencia leve</option>
                                <option value="Dependencia moderada">Dependencia moderada</option>
                                <option value="Dependencia severa">Dependencia severa</option>
                                <option value="Dependencia total">Dependencia total</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Áreas reforzadas</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                value={seguimientoActual.areasReforzadas || ''}
                                onChange={(e) => actualizarSeguimiento(numeroLlamado, 'areasReforzadas', e.target.value)}
                                disabled={!modoEdicion[numeroLlamado]}
                                className={!modoEdicion[numeroLlamado] ? "bg-light" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Indicaciones - Educación de enfermería</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                value={seguimientoActual.indicaciones || ''}
                                onChange={(e) => actualizarSeguimiento(numeroLlamado, 'indicaciones', e.target.value)}
                                disabled={!modoEdicion[numeroLlamado]}
                                className={!modoEdicion[numeroLlamado] ? "bg-light" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                value={seguimientoActual.observaciones || ''}
                                onChange={(e) => actualizarSeguimiento(numeroLlamado, 'observaciones', e.target.value)}
                                disabled={!modoEdicion[numeroLlamado]}
                                className={!modoEdicion[numeroLlamado] ? "bg-light" : ""}
                            />
                        </Form.Group>

                        {/* Estudiante responsable */}
                        {estudiantesResponsables[numeroLlamado] && (
                            <Alert variant="info" className="mt-3">
                                {estudiantesResponsables[numeroLlamado]}
                            </Alert>
                        )}

                        {/* Botón de guardar */}
                        {modoEdicion[numeroLlamado] && (
                            <Button
                                className="mt-3"
                                variant="primary"
                                onClick={() => guardarLlamado(numeroLlamado)}
                                disabled={!puedeEditar}
                            >
                                {seguimientosIds[numeroLlamado] ?
                                    `Actualizar ${obtenerTituloLlamado(numeroLlamado)}` :
                                    `Enviar ${obtenerTituloLlamado(numeroLlamado)}`
                                }
                            </Button>
                        )}

                        {/* Mensaje de advertencia */}
                        {!puedeEditar && modoEdicion[numeroLlamado] && (
                            <Alert variant="warning" className="mt-3">
                                Debe completar el llamado anterior antes de poder editar este llamado.
                            </Alert>
                        )}
                    </Card.Body>
                </Collapse>
            </Card>
        );
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Seguimiento de Dependencia</h2>

            {cargandoDatos ? (
                <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando datos existentes...</p>
                </div>
            ) : (
                <>
                    {/* Renderizar todos los llamados */}
                    {Array.from({ length: TOTAL_LLAMADOS }, (_, i) => i + 1).map(numeroLlamado =>
                        renderizarLlamado(numeroLlamado)
                    )}
                </>
            )}
        </Container>
    );
};

export default SeguimientoDependencia;