import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Tooltip, InputGroup, FormControl, Card, Alert, Col, Row, OverlayTrigger, Popover, Badge, Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AsignarEstudiantes.css';

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const AsignarEstudiantes = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [receptores, setReceptores] = useState([]);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // Definir filtroEstado
  const [isSelecting, setIsSelecting] = useState(false);
  const [startEstudiante, setStartEstudiante] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null);
  const [tipoInstitucionSeleccionado, setTipoInstitucionSeleccionado] = useState(null);
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState(null);
  const [receptorSeleccionado, setReceptorSeleccionado] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [asignacionParaEditar, setAsignacionParaEditar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [anoSeleccionado, setAnoSeleccionado] = useState(getCurrentYear().toString());
  const [filtroJustificacion, setFiltroJustificacion] = useState(false);
  const limit = 15;
  const [totalPages, setTotalPages] = useState(0);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [showJustificacionModal, setShowJustificacionModal] = useState(false);
  const [justificaciones, setJustificaciones] = useState({});
  const [conflictoAsignaciones, setConflictoAsignaciones] = useState(null);
  const [tempAsignacionData, setTempAsignacionData] = useState(null);
  const [justificacionEditable, setJustificacionEditable] = useState('');

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filtrar estudiantes basado en el estado y término de búsqueda
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(estudiante => {
      const matchesSearch =
        estudiante.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.apellidos.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' && estudiante.estado === true) ||
        (filtroEstado === 'inactivos' && estudiante.estado === false);

      return matchesSearch && matchesEstado;
    });
  }, [estudiantes, searchTerm, filtroEstado]);

  const getAniosOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 5; i++) { // Cambia el rango según sea necesario
      years.push(currentYear - i);
    }
    return years;
  };

  const aniosOptions = getAniosOptions();

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, searchTerm, anoSeleccionado, estadoFiltro, filtroJustificacion]); // Agregar filtroJustificacion

  useEffect(() => {
    // Cargar tipos de instituciones
    const fetchTiposInstituciones = async () => {
      try {
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/obtener/tipos-instituciones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTiposInstituciones(response.data);
      } catch (error) {
        console.error("Error al obtener tipos de instituciones:", error);
        toast.error("Error al cargar tipos de instituciones");
      }
    };

    fetchTiposInstituciones();
  }, []); // Solo se ejecuta al montar el componente

  useEffect(() => {
    // Cargar todas las instituciones cuando se selecciona un tipo
    const fetchInstituciones = async () => {
      if (tipoInstitucionSeleccionado) {
        try {
          const token = getToken();
          const apiUrl = process.env.REACT_APP_API_URL;
          const response = await axios.get(`${apiUrl}/obtener/instituciones`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { tipoId: tipoInstitucionSeleccionado }
          });
          setInstituciones(response.data);
        } catch (error) {
          console.error("Error al obtener instituciones:", error);
          toast.error("Error al cargar instituciones");
        }
      }
    };

    fetchInstituciones();
  }, [tipoInstitucionSeleccionado]);

  useEffect(() => {
    // Cargar receptores cuando se selecciona una institución
    const fetchReceptores = async () => {
      if (institucionSeleccionada) {
        try {
          const token = getToken();
          const apiUrl = process.env.REACT_APP_API_URL;
          const response = await axios.get(`${apiUrl}/obtener/receptores`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { institucionId: institucionSeleccionada }
          });
          setReceptores(response.data || []);
        } catch (error) {
          console.error("Error al obtener receptores:", error);
          toast.error("Error al cargar receptores");
        }
      }
    };

    fetchReceptores();
  }, [institucionSeleccionada]);

  const fetchData = async (page = currentPage) => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.get(`${apiUrl}/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          year: anoSeleccionado, // Asegúrate de que esto esté aquí
          estado: estadoFiltro,
          tieneJustificacion: filtroJustificacion.toString() // Convertir a string
        }
      });

      setEstudiantes(response.data.estudiantes || []);
      setTotalElements(response.data.total || 0);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(page);

    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Error al cargar los datos. Por favor, intente de nuevo.");
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoInstitucionChange = async (event) => {
    const tipoId = event.target.value;
    setTipoInstitucionSeleccionado(tipoId);
    setInstitucionSeleccionada(null);
    setReceptorSeleccionado(null);
    setInstituciones([]); // Limpiar instituciones anteriores
    setReceptores([]); // Limpiar receptores anteriores

    if (!tipoId) return;

    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/obtener/instituciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tipoId: tipoId }
      });

      // Verificar si response.data existe y no está vacío
      if (response.data && response.data.length > 0) {
        setInstituciones(response.data);
      } else {
        toast.info('No se encontraron instituciones para este tipo');
        setInstituciones([]);
      }
    } catch (error) {
      console.error("Error al obtener instituciones:", error);
      setErrorMessage("Error al obtener instituciones.");
      toast.error("Error al obtener instituciones.");
      setInstituciones([]);
    }
  };

  const handleInstitucionChange = async (event) => {
    const institucionId = event.target.value;
    setInstitucionSeleccionada(institucionId);
    setReceptorSeleccionado(null);
    setReceptores([]); // Limpiar receptores anteriores

    if (!institucionId) return;

    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/obtener/receptores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { institucionId: institucionId }
      });

      // Verificar si response.data existe y no está vacío
      if (response.data && response.data.length > 0) {
        setReceptores(response.data);
      } else {
        toast.info('No se encontraron receptores para esta institución');
        setReceptores([]);
      }
    } catch (error) {
      console.error("Error al obtener receptores:", error);
      setErrorMessage("Error al obtener receptores.");
      toast.error("Error al obtener receptores.");
      setReceptores([]);
    }
  };

  const handleCloseAsignarModal = () => {
    setShowAsignarModal(false);
    setSelectedEstudiantes([]);
    resetAsignarModal();
  };

  const resetAsignarModal = () => {
    setTipoInstitucionSeleccionado(null);
    setInstitucionSeleccionada(null);
    setReceptorSeleccionado(null);
    setFechaInicio('');
    setFechaFin('');
    setErrorMessage('');
    setInstituciones([]);
    setReceptores([]);
  };

  const handleCloseEditarModal = () => {
    setShowEditarModal(false);
    setSelectedEstudiantes([]);
    resetEditarModal();
  };

  const resetEditarModal = () => {
    setTipoInstitucionSeleccionado(null);
    setInstitucionSeleccionada(null);
    setReceptorSeleccionado(null);
    setFechaInicio('');
    setFechaFin('');
    setErrorMessage('');
    setInstituciones([]);
    setReceptores([]);
    setJustificacionEditable('');
    setAsignacionParaEditar(null);
  };

  const handleAsignarCentro = async () => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      // Verificar que todos los campos necesarios estén completos
      if (!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin) {
        toast.error('Por favor complete todos los campos');
        return;
      }

      // Convertir a enteros para evitar problemas de tipo
      const institucionId = parseInt(institucionSeleccionada);
      const receptorId = parseInt(receptorSeleccionado);

      try {
        // Intentar crear las asignaciones
        await Promise.all(selectedEstudiantes.map(async (estudiante) => {
          await axios.post(`${apiUrl}/asignaciones`, {
            estudiante_id: estudiante.id,
            institucion_id: institucionId,
            receptor_id: receptorId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }));

        // Si tiene éxito, proceder normalmente
        await fetchData(currentPage);
        setShowAsignarModal(false);
        resetearFormulario();
        setSelectedEstudiantes([]);
        toast.success('Asignaciones creadas exitosamente!');

      } catch (error) {
        // Destructurar error y respuesta
        const { response } = error;

        // Priorizar mensajes del servidor
        if (response && response.data) {
          // Mensajes específicos de diferentes escenarios
          if (response.data.message) {
            toast.error(response.data.message);
          } else if (response.data.error) {
            toast.error(response.data.error);
          }

          // Manejar caso de asignaciones existentes
          if (response.data.asignaciones && response.data.permitirExcepcional) {
            // Agrupar asignaciones por periodo
            const asignacionesPorPeriodo = response.data.asignaciones.reduce((grupos, asig) => {
              const key = `${formatDate(asig.fecha_inicio)} - ${formatDate(asig.fecha_fin)}`;
              if (!grupos[key]) {
                grupos[key] = [];
              }

              const estudianteExistente = estudiantes.find(
                est => est.id === (asig.estudiante || asig.estudiante_id)
              );

              grupos[key].push(
                estudianteExistente
                  ? `${estudianteExistente.nombres} ${estudianteExistente.apellidos}`
                  : `Estudiante ID: ${asig.estudiante || asig.estudiante_id}`
              );

              return grupos;
            }, {});

            // Construir mensaje detallado
            const mensaje = Object.entries(asignacionesPorPeriodo)
              .map(([periodo, estudiantes]) =>
                `Periodo: ${periodo}\nEstudiantes: ${estudiantes.join(', ')}`
              )
              .join('\n\n');

            // Guardar datos temporales para la asignación
            setTempAsignacionData({
              institucionId,
              receptorId,
              fechaInicio,
              fechaFin
            });

            // Guardar detalles del conflicto
            setConflictoAsignaciones({
              mensaje,
              asignaciones: response.data.asignaciones,
              permitirExcepcional: true
            });

            // Inicializar justificaciones
            const justificacionesIniciales = {};
            selectedEstudiantes.forEach(estudiante => {
              justificacionesIniciales[estudiante.id] = '';
            });
            setJustificaciones(justificacionesIniciales);

            // Mostrar modal de justificaciones
            setShowJustificacionModal(true);
          }

        } else {
          // Mensaje de error genérico si no hay respuesta específica
          toast.error('Error al crear las asignaciones');
        }
      }
    } catch (error) {
      console.error("Error al crear asignaciones:", error);

      // Última línea de defensa para mostrar mensaje de error
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error al crear las asignaciones";

      toast.error(errorMessage);
    }
  };

  // Componente Modal de Justificaciones
  const JustificacionModal = () => {
    // Crear un estado local para manejar las justificaciones
    const [localJustificaciones, setLocalJustificaciones] = useState(() => {
      // Inicializar con las justificaciones existentes o crear un objeto vacío
      const inicial = {};
      selectedEstudiantes.forEach(estudiante => {
        inicial[estudiante.id] = '';
      });
      return inicial;
    });

    const handleJustificacionChange = (estudianteId, value) => {
      // Usar setState con función de callback para evitar problemas de asincronía
      setLocalJustificaciones(prev => ({
        ...prev,
        [estudianteId]: value
      }));
    };

    const handleConfirmar = async () => {
      // Validar que todas las justificaciones estén completas
      const todasJustificaciones = selectedEstudiantes.map(est =>
        localJustificaciones[est.id]?.trim()
      );

      if (todasJustificaciones.some(j => !j)) {
        toast.error('Debe proporcionar justificación para todos los estudiantes');
        return;
      }

      try {
        const token = getToken();
        const apiUrl = process.env.REACT_APP_API_URL;
        const { institucionId, receptorId, fechaInicio, fechaFin } = tempAsignacionData;

        // Intentar crear asignaciones con justificación excepcional
        await Promise.all(selectedEstudiantes.map(async (estudiante) => {
          await axios.post(`${apiUrl}/asignaciones`, {
            estudiante_id: estudiante.id,
            institucion_id: institucionId,
            receptor_id: receptorId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            es_asignacion_excepcional: true,
            justificacion_excepcional: localJustificaciones[estudiante.id]
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }));

        // Actualizar datos y limpiar
        await fetchData(currentPage);
        setShowJustificacionModal(false);
        setShowAsignarModal(false);
        resetearFormulario();
        setSelectedEstudiantes([]);

        // Limpiar estados de conflicto
        setConflictoAsignaciones(null);
        setTempAsignacionData(null);

        toast.success('Asignaciones excepcionales creadas exitosamente!');

      } catch (error) {
        console.error("Error al crear asignaciones:", error);
        const errorMsg = error.response?.data?.error || "Error al crear las asignaciones. Por favor, intente de nuevo.";
        toast.error(errorMsg);
      }
    };

    return (
      <Modal
        show={showJustificacionModal}
        onHide={() => {
          setShowJustificacionModal(false);
          setConflictoAsignaciones(null);
          setTempAsignacionData(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Asignaciones Existentes
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">
            <Alert.Heading>
              <i className="icon fas fa-info-circle"></i> Conflicto de Asignaciones
            </Alert.Heading>
            <p>Ya existen asignaciones para este receptor en el periodo:</p>
            <pre>{conflictoAsignaciones?.mensaje || 'Sin detalles de conflicto'}</pre>
          </Alert>

          <Form>
            {selectedEstudiantes.map((estudiante) => (
              <Form.Group key={estudiante.id} className="mb-3">
                <Form.Label>
                  Justificación para {estudiante.nombres} {estudiante.apellidos}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={localJustificaciones[estudiante.id] || ''}
                  onChange={(e) => handleJustificacionChange(estudiante.id, e.target.value)}
                  placeholder="Ingrese la justificación para la asignación excepcional"
                  required
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowJustificacionModal(false);
            setConflictoAsignaciones(null);
            setTempAsignacionData(null);
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmar}>
            Confirmar Asignaciones
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleEditarAsignacion = async (asignacion) => {
    try {
      // Establecer explícitamente el estado de asignación excepcional
      const esAsignacionExcepcional = !!(asignacion.justificacion_excepcional);

      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      // Verificar y obtener el ID de la institución
      const institucionId = asignacion.institucion_id ||
        (asignacion.institucion && asignacion.institucion.id) ||
        null;

      // Verificar y obtener el ID del receptor
      const receptorId = asignacion.receptor_id ||
        (asignacion.receptor && asignacion.receptor.id) ||
        null;

      if (!institucionId) {
        toast.error("No se pudo identificar la institución");
        return;
      }

      // Agregar verificación para receptor
      if (!receptorId) {
        toast.error("No se pudo identificar el receptor");
        return;
      }

      // Cargar tipos de instituciones
      const tiposInstitucionesResponse = await axios.get(`${apiUrl}/obtener/tipos-instituciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Intentar obtener el tipo de institución de manera más robusta
      let tipoInstitucionId = null;

      // Primero intentar desde la institución directamente
      if (asignacion.institucion && asignacion.institucion.tipo_id) {
        tipoInstitucionId = asignacion.institucion.tipo_id;
      }
      // Si no, buscar en la lista de tipos de instituciones
      else {
        // Buscar en la lista de tipos de instituciones basado en el ID de la institución
        const institucionResponse = await axios.get(`${apiUrl}/instituciones/${institucionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        tipoInstitucionId = institucionResponse.data.tipo_id;
      }

      // Si aún no se encuentra el tipo de institución, mostrar error
      if (!tipoInstitucionId) {
        toast.error("No se pudo determinar el tipo de institución");
        return;
      }

      // Cargar instituciones de ese tipo
      const institucionesResponse = await axios.get(`${apiUrl}/obtener/instituciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tipoId: tipoInstitucionId }
      });

      // Cargar receptores de la institución
      const receptoresResponse = await axios.get(`${apiUrl}/obtener/receptores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { institucionId: institucionId }
      });

      // Cargar detalles del receptor específico
      const receptorResponse = await axios.get(`${apiUrl}/instituciones/receptor/${receptorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Establecer los estados
      setTipoInstitucionSeleccionado(tipoInstitucionId);
      setInstituciones(institucionesResponse.data);

      // Agregar el receptor a la lista si no existe
      setReceptores(prevReceptores => {
        const receptorExiste = prevReceptores.some(r => r.id === receptorResponse.data.id);
        return receptorExiste
          ? prevReceptores
          : [...prevReceptores, receptorResponse.data];
      });

      // Establecer los valores seleccionados
      setAsignacionParaEditar(asignacion);
      setInstitucionSeleccionada(institucionId);
      setReceptorSeleccionado(receptorId);

      // Formatear fechas de manera segura
      setFechaInicio(asignacion.fecha_inicio ? asignacion.fecha_inicio.split('T')[0] : '');
      setFechaFin(asignacion.fecha_fin ? asignacion.fecha_fin.split('T')[0] : '');

      // Establecer la justificación si existe
      const justificacion = asignacion.justificacion_excepcional || '';

      setJustificacionEditable(justificacion);

      // Mostrar modal de edición
      setShowEditarModal(true);

    } catch (error) {
      console.error("Error al cargar datos para edición:", error);

      // Manejo de errores más específico
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        toast.error(error.response.data.error || "Error al cargar los datos de la asignación");
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error("No se pudo conectar con el servidor");
      } else {
        // Algo sucedió al configurar la solicitud
        toast.error("Error inesperado al cargar los datos");
      }
    }
  };

  const handleGuardarEdicion = async () => {
    if (!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin) {
      setErrorMessage('Por favor, completa todos los campos.');
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      // Preparar datos para actualizar
      const datosActualizacion = {
        institucion_id: parseInt(institucionSeleccionada),
        receptor_id: parseInt(receptorSeleccionado),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        // Establecer explícitamente el estado de asignación excepcional
        es_asignacion_excepcional: justificacionEditable ? true : false
      };

      // Manejar la justificación de manera más robusta
      if (justificacionEditable) {
        datosActualizacion.justificacion_excepcional = justificacionEditable;
      } else {
        // Si no hay justificación, establecer como null
        datosActualizacion.justificacion_excepcional = null;
      }

      const response = await axios.put(`${apiUrl}/asignaciones/${asignacionParaEditar.id}`,
        datosActualizacion,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar la lista de asignaciones
      await fetchData(currentPage);

      setShowEditarModal(false);
      resetearFormulario();
      toast.success('Asignación actualizada exitosamente!');
    } catch (error) {
      console.error("Error al actualizar asignación:", error);

      // Mostrar detalles específicos del error
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
        setErrorMessage(error.response.data.error || "Error al actualizar la asignación");
        toast.error(error.response.data.error || "Error al actualizar la asignación");
      } else {
        setErrorMessage("Error al actualizar la asignación. Por favor, intente de nuevo.");
        toast.error("Error al actualizar la asignación. Por favor, intente de nuevo.");
      }
    }
  };

  const handleEliminarAsignacion = async (asignacionId) => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.delete(`${apiUrl}/asignaciones/${asignacionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(currentPage);
      toast.success("Asignación eliminada exitosamente!");
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      setErrorMessage("Error al eliminar la asignación. Por favor, intente de nuevo.");
      toast.error("Error al eliminar la asignación. Por favor, intente de nuevo.");
    }
  };

  const toggleEstudianteSelection = (estudiante, event) => {
    // Prevenir la selección de texto y propagación
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setSelectedEstudiantes(prev => {
      const isCurrentlySelected = prev.some(e => e.correo === estudiante.correo);

      if (isCurrentlySelected) {
        // Deseleccionar
        return prev.filter(e => e.correo !== estudiante.correo);
      } else {
        // Seleccionar
        return [...prev, estudiante];
      }
    });
  };

  const handleRowClick = (estudiante, event) => {
    // Verificar que el click no sea en elementos interactivos
    const isInteractiveElement =
      event.target.closest('button') ||
      event.target.closest('.popover') ||
      event.target.closest('.badge') ||
      event.target.closest('.form-check');

    if (isInteractiveElement) {
      return;
    }

    // Prevenir la selección de texto
    event.preventDefault();
    event.stopPropagation();

    setSelectedEstudiantes(prev => {
      const isCurrentlySelected = prev.some(e => e.correo === estudiante.correo);

      if (isCurrentlySelected) {
        // Deseleccionar
        return prev.filter(e => e.correo !== estudiante.correo);
      } else {
        // Seleccionar
        return [...prev, estudiante];
      }
    });
  };

  const handleMouseDown = (estudiante, event) => {
    // Prevenir selección en elementos interactivos
    if (event && (
      event.target.closest('button') ||
      event.target.closest('.popover') ||
      event.target.closest('.badge') ||
      event.target.closest('.form-check')
    )) {
      return;
    }

    setIsSelecting(true);
    setStartEstudiante(estudiante);

    const isSelected = selectedEstudiantes.some(e => e.correo === estudiante.correo);

    // Determinar el modo de selección
    setSelectionMode(isSelected ? 'deselect' : 'select');

    if (isSelected) {
      setSelectedEstudiantes(prev =>
        prev.filter(e => e.correo !== estudiante.correo)
      );
    } else {
      setSelectedEstudiantes(prev => [...prev, estudiante]);
    }
  };

  // Modificar handleMouseEnter similarmente
  const handleMouseEnter = (estudiante, event) => {
    // Prevenir selección en elementos interactivos
    if (event && (
      event.target.closest('button') ||
      event.target.closest('.popover') ||
      event.target.closest('.badge') ||
      event.target.closest('.form-check')
    )) {
      return;
    }

    // Lógica de selección múltiple
    if (isSelecting && startEstudiante) {
      const startIndex = estudiantes.findIndex(e => e.correo === startEstudiante.correo);
      const currentIndex = estudiantes.findIndex(e => e.correo === estudiante.correo);
      const start = Math.min(startIndex, currentIndex);
      const end = Math.max(startIndex, currentIndex);
      const rangeSelection = estudiantes.slice(start, end + 1);

      setSelectedEstudiantes(prev => {
        // Filtrar estudiantes que no están en el rango actual
        const filteredPrev = prev.filter(e =>
          !rangeSelection.some(rs => rs.correo === e.correo)
        );

        // Si estamos deseleccionando, devolver los estudiantes filtrados
        if (selectionMode === 'deselect') {
          return filteredPrev;
        }

        // Si estamos seleccionando, agregar los nuevos estudiantes
        return [...filteredPrev, ...rangeSelection];
      });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setStartEstudiante(null);
    setSelectionMode(null);
  };

  const resetearFormulario = () => {
    setTipoInstitucionSeleccionado(null);
    setInstitucionSeleccionada(null);
    setReceptorSeleccionado(null);
    setFechaInicio('');
    setFechaFin('');
    setErrorMessage('');
    setAsignacionParaEditar(null);
  };

  const VolverHome = () => {
    navigate('/home?component=agenda');
  };


  return (
    <div className="asignar-estudiantes" onMouseUp={handleMouseUp}>
      <div className="instituciones__back">
        <button className="instituciones__btn--back" onClick={VolverHome}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>
      <h2 className='mb-4'>Asignación de Estudiantes</h2>
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={1}>
          <Form.Group>
            <Form.Select
              onChange={(e) => setAnoSeleccionado(e.target.value)}
              value={anoSeleccionado}
              className="w-100"
            >
              <option value="">Seleccione un año</option>
              {aniosOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} md={2}>
          <Form.Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-100"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={2}>
          <Form.Check
            type="checkbox"
            label="Con Justificación"
            checked={filtroJustificacion}
            onChange={(e) => setFiltroJustificacion(e.target.checked)}
            className="w-100"
          />
        </Col>

        <Col xs={12} md={5}>
          <InputGroup>
            <FormControl
              placeholder="Buscar estudiante por nombre o apellido"
              aria-label="Buscar estudiante"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Card>
          <Card.Header className="position-relative custom-header text-light">
            <Card.Title className="mb-0">Lista de Estudiantes</Card.Title>
            <Button
              variant="light"
              className="position-absolute top-50 end-0 translate-middle-y"
              onClick={() => setShowAsignarModal(true)}
              disabled={selectedEstudiantes.length === 0}
              style={{ 'width': 150 }}
            >
              Asignar ({selectedEstudiantes.length})
            </Button>
          </Card.Header>
          <div className="table-responsive">
            <Table striped bordered hover onMouseUp={handleMouseUp} style={{ userSelect: 'none' }}>
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <Form.Check
                      type="checkbox"
                      checked={selectedEstudiantes.length === estudiantesFiltrados.length}
                      onChange={() => {
                        setSelectedEstudiantes(prev =>
                          prev.length === estudiantesFiltrados.length
                            ? []
                            : [...estudiantesFiltrados]
                        );
                      }}
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Asignaciones</th>
                  <th>Cursado(s)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((estudiante, index) => (
                  <tr
                    key={index}
                    onMouseDown={(e) => handleMouseDown(estudiante, e)}
                    onMouseEnter={(e) => handleMouseEnter(estudiante, e)}
                    onMouseUp={handleMouseUp}
                    className={`
                ${selectedEstudiantes.some(e => e.correo === estudiante.correo) ? 'selected' : ''}
                ${filtroEstado === 'todos' && !estudiante.estado ? 'text-muted' : ''}
              `}
                    style={{
                      userSelect: 'none',
                      cursor: 'pointer',
                      backgroundColor: selectedEstudiantes.some(e => e.correo === estudiante.correo)
                        ? 'rgba(0, 123, 255, 0.1)'
                        : 'transparent'
                    }}
                  >
                    <td className="checkbox-column" onClick={(e) => {
                      const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                      if (checkbox && e.target !== checkbox) {
                        checkbox.click();
                      }
                    }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedEstudiantes.some(e => e.correo === estudiante.correo)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleEstudianteSelection(estudiante, e);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {filtroEstado === 'todos' && !estudiante.estado && (
                          <OverlayTrigger
                            placement="right"
                            overlay={
                              <Tooltip>
                                Estudiante Inactivo
                              </Tooltip>
                            }
                          >
                            <span
                              className="mr-2"
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'red',
                                display: 'inline-block',
                                marginRight: '8px'
                              }}
                            ></span>
                          </OverlayTrigger>
                        )}
                        {estudiante.nombres} {estudiante.apellidos}
                      </div>
                    </td>
                    <td>{estudiante.correo}</td>
                    <td>
                      {estudiante.asignaciones && estudiante.asignaciones.length > 0 ? (
                        estudiante.asignaciones.map((asignacion, idx) => (
                          <div key={idx} className="asignacion-item">
                            <div>
                              {asignacion.institucion?.nombre || 'Institución no especificada'} -
                              {asignacion.receptor?.nombre || 'Receptor no especificado'} <br />
                              {formatDate(asignacion.fecha_inicio)} a {formatDate(asignacion.fecha_fin)}<br />
                              {asignacion.justificacion_excepcional && (
                                <OverlayTrigger
                                  trigger="click"
                                  placement="bottom"
                                  overlay={
                                    <Popover>
                                      <Popover.Header as="h3">Justificación Excepcional</Popover.Header>
                                      <Popover.Body>
                                        {asignacion.justificacion_excepcional}
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <Badge bg="warning" role="button">
                                    Justificado
                                  </Badge>
                                </OverlayTrigger>
                              )}
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditarAsignacion(asignacion)}
                                className="me-2"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleEliminarAsignacion(asignacion.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>Sin asignaciones</div>
                      )}
                    </td>
                    <td>{estudiante.anos_cursados}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedEstudiantes([]);
                          setSelectedEstudiantes([estudiante]);
                          setShowAsignarModal(true);
                        }}
                      >
                        Agregar Asignación
                      </Button>
                    </td>
                  </tr>
                ))}
                <style jsx>{`
              .text-muted {
                color: #6c757d !important;
              }
              
              .asignacion-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .asignacion-item:last-child {
                margin-bottom: 0;
              }
            `}</style>
              </tbody>
            </Table>
          </div>
        </Card>
      )}


      {/* Paginación */}
      <div className="asignar-estudiantes__pagination d-flex justify-content-between align-items-center mb-3">
        <Pagination size="sm" className="m-0">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          />

          {/* Lógica para mostrar los números de página */}
          {totalPages > 5 ? (
            <>
              {currentPage > 2 && <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>}
              {currentPage > 3 && <Pagination.Ellipsis />}

              {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                const page = Math.max(2, currentPage - 1) + index; // Muestra las páginas alrededor de la página actual
                if (page <= totalPages) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 2 && <Pagination.Ellipsis />}
              {currentPage < totalPages - 1 && (
                <Pagination.Item onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item>
              )}
            </>
          ) : (
            Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))
          )}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      </div>

      <JustificacionModal />

      <Modal show={showAsignarModal} onHide={handleCloseAsignarModal} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-user-plus mr-2"></i>
            Asignar Institución y Receptor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Institución</Form.Label>
                  <Form.Select onChange={handleTipoInstitucionChange} required>
                    <option value="">Seleccione un tipo de institución</option>
                    {tiposInstituciones.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Institución</Form.Label>
                  <Form.Select onChange={handleInstitucionChange} required>
                    <option value="">Seleccione una institución</option>
                    {instituciones.map(institucion => (
                      <option key={institucion.id} value={institucion.id}>{institucion.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Receptor</Form.Label>
                  <Form.Select onChange={(e) => setReceptorSeleccionado(e.target.value)} required>
                    <option value="">Seleccione un receptor</option>
                    {receptores.map(receptor => (
                      <option key={receptor.id} value={receptor.id}>{receptor.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Inicio</Form.Label>
                      <Form.Control
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha Fin</Form.Label>
                      <Form.Control
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                          const newFechaFin = e.target.value;
                          if (!fechaInicio || newFechaFin >= fechaInicio) {
                            setFechaFin(newFechaFin);
                          } else {
                            toast.error('La fecha fin debe ser posterior o igual a la fecha de inicio');
                          }
                        }}
                        min={fechaInicio || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Col>

            <Col md={4}>
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-users mr-2"></i>
                    Estudiantes Seleccionados
                  </h3>
                </div>
                <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <ul className="list-group list-group-flush">
                    {selectedEstudiantes.map((estudiante, index) => (
                      <li key={index} className="list-group-item">
                        <i className="fas fa-user mr-2"></i>
                        {estudiante.nombres} {estudiante.apellidos}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-footer bg-light">
                  <small>Total: {selectedEstudiantes.length} estudiante(s)</small>
                </div>
              </div>
            </Col>
          </Row>

          {errorMessage && (
            <Alert variant="danger" className="mt-3">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{errorMessage}</pre>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAsignarModal(false);
            setSelectedEstudiantes([]); // Limpiar estudiantes seleccionados
          }}>
            <i className="fas fa-times mr-2"></i>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAsignarCentro}
            disabled={!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin}
          >
            <i className="fas fa-save mr-2"></i>
            Asignar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edición */}
      <Modal show={showEditarModal} onHide={handleCloseEditarModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Asignación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Institución</Form.Label>
              <Form.Select
                onChange={handleTipoInstitucionChange}
                value={tipoInstitucionSeleccionado || ''}
              >
                <option value="">Seleccione un tipo de institución</option>
                {tiposInstituciones.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Institución</Form.Label>
              <Form.Select
                onChange={handleInstitucionChange}
                value={institucionSeleccionada || ''}
              >
                <option value="">Seleccione una institución</option>
                {instituciones.map(institucion => (
                  <option key={institucion.id} value={institucion.id}>{institucion.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Receptor</Form.Label>
              <Form.Select
                onChange={(e) => setReceptorSeleccionado(e.target.value)}
                value={receptorSeleccionado || ''}
              >
                <option value="">Seleccione un receptor</option>
                {receptores.map(receptor => (
                  <option key={receptor.id} value={receptor.id}>{receptor.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha Inicio</Form.Label>
              <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Form.Group>
            {(asignacionParaEditar?.es_asignacion_excepcional ||
              asignacionParaEditar?.justificacion_excepcional) && (
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="justificacionExcepcional">Justificación Excepcional</Form.Label>
                  <Form.Control
                    id="justificacionExcepcional"
                    as="textarea"
                    rows={3}
                    value={justificacionEditable}
                    onChange={(e) => setJustificacionEditable(e.target.value)}
                    placeholder="Ingrese la justificación para la asignación excepcional"
                  />
                </Form.Group>
              )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditarModal(false)}>
            <i className="fas fa-times"></i> Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => handleGuardarEdicion()}
          >
            <i className="fas fa-save"></i> Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
            .asignacion-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .asignacion-item:last-child {
                margin-bottom: 0;
            }
        `}</style>
      {/* Renderizar el modal solo si hay conflicto de asignaciones */}
      {showJustificacionModal && <JustificacionModal />}
    </div>
  );
};

export default AsignarEstudiantes;