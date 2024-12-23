import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Table, Modal, InputGroup, Pagination, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import './Estudiantes.css';

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const Estudiantes = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [cambioContrasenaModal, setCambioContrasenaModal] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    contrasena: '',
    anos_cursados: getCurrentYear().toString(),
    semestre: '1'
  });
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [ano, setAno] = useState(getCurrentYear().toString());  const [semestre, setSemestre] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const [editarMasivoModal, setEditarMasivoModal] = useState(false);
  const [edicionMasiva, setEdicionMasiva] = useState({
    semestre: '',
    estado: ''
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const symbols = '!#$%&*+?';

  const PasswordValidationMessage = ({ password }) => {
    const hasMinLength = password.length >= 8 && password.length <= 20;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
  
    return (
      <div className="password-validation-message mt-2">
        <small>
          <div className="d-flex align-items-center">
            <span 
              style={{ 
                color: hasMinLength ? 'green' : 'red', 
                marginRight: '10px' 
              }}
            >
              {hasMinLength ? '✓' : '✗'}
            </span>
            <span style={{ color: hasMinLength ? 'green' : 'red' }}>
              Entre 8 y 20 caracteres
            </span>
          </div>
          <div className="d-flex align-items-center">
            <span 
              style={{ 
                color: hasUppercase ? 'green' : 'red', 
                marginRight: '10px' 
              }}
            >
              {hasUppercase ? '✓' : '✗'}
            </span>
            <span style={{ color: hasUppercase ? 'green' : 'red' }}>
              Al menos una letra mayúscula
            </span>
          </div>
          <div className="d-flex align-items-center">
            <span 
              style={{ 
                color: hasLowercase ? 'green' : 'red', 
                marginRight: '10px' 
              }}
            >
              {hasLowercase ? '✓' : '✗'}
            </span>
            <span style={{ color: hasLowercase ? 'green' : 'red' }}>
              Al menos una letra minúscula
            </span>
          </div>
          <div className="d-flex align-items-center">
            <span 
              style={{ 
                color: hasNumber ? 'green' : 'red', 
                marginRight: '10px' 
              }}
            >
              {hasNumber ? '✓' : '✗'}
            </span>
            <span style={{ color: hasNumber ? 'green' : 'red' }}>
              Al menos un número
            </span>
          </div>
        </small>
      </div>
    );
  };

  // Función centralizada para manejar cambios de filtros
  const handleFilterChange = (filterName, value) => {
    switch(filterName) {
      case 'ano':
        setAno(value);
        setIsFiltered(value !== getCurrentYear().toString());
        break;
      case 'semestre':
        setSemestre(value);
        setIsFiltered(value !== '');
        break;
      case 'estadoFiltro':
        setEstadoFiltro(value);
        setIsFiltered(value !== 'activos');
        break;
      case 'searchTerm':
        setSearchTerm(value);
        setIsFiltered(value !== '');
        break;
    }
    setCurrentPage(1);
  };
  
  // Función de limpieza de filtros
  const limpiarFiltros = () => {
    setAno(getCurrentYear().toString());
    setSemestre('');
    setEstadoFiltro('activos');
    setSearchTerm('');
    setIsFiltered(false);
    setCurrentPage(1);
    obtenerEstudiantes();
  };

const handleCloseNuevoEstudianteModal = () => {
  setModalOpen(false);
  // Resetear el formulario de nuevo estudiante
  setNuevoEstudiante({
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    contrasena: '',
    anos_cursados: getCurrentYear().toString(),
    semestre: '1'
  });
};

const handleCloseCambioContrasenaModal = () => {
  setCambioContrasenaModal(false);
  setNuevaContrasena('');
  setSelectedEstudiante(null);
};

const handleCloseEditarMasivoModal = () => {
  setEditarMasivoModal(false);
  setEdicionMasiva({ semestre: '', estado: '' });
};



  useEffect(() => {
    obtenerEstudiantes();
  }, [currentPage, ano, semestre, searchTerm, estadoFiltro]);

  const obtenerEstudiantes = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        estado: estadoFiltro
      });
  
      if (ano) params.append('ano', ano);
      if (semestre) params.append('semestre', semestre);
      if (searchTerm) params.append('search', searchTerm);
  
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/estudiantes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });
  
      setEstudiantes(response.data.estudiantes);
      setTotalElements(response.data.total);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas según el campo
    switch(name) {
      case 'rut':
        // Eliminar puntos y guiones mientras se escribe
        const cleanRut = value.replace(/[.-]/g, '');
        
        // Solo permitir números
        const numericRut = cleanRut.replace(/[^\d]/g, '');
        
        // Generar contraseña basada en RUT
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const contrasena = `UCM${numericRut}${randomSymbol}`;
        
        setNuevoEstudiante(prev => ({ 
          ...prev, 
          [name]: value,
          contrasena 
        }));
        break;
      
      case 'nombres':
      case 'apellidos':
        // Solo letras y espacios, sin mostrar toast
        const sanitizedValue = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
        setNuevoEstudiante(prev => ({ 
          ...prev, 
          [name]: sanitizedValue 
        }));
        break;
      
      case 'correo':
        setNuevoEstudiante(prev => ({ 
          ...prev, 
          [name]: value.toLowerCase() 
        }));
        break;
      
      default:
        setNuevoEstudiante(prev => ({ ...prev, [name]: value }));
    }
  };

  const generarContrasena = () => {
    const formattedRut = nuevoEstudiante.rut.includes('-') ? 
      nuevoEstudiante.rut.split('-')[0].replace(/\./g, '') : 
      nuevoEstudiante.rut.replace(/\./g, '');
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    setNuevoEstudiante(prev => ({ ...prev, contrasena: `UCM${formattedRut}${randomSymbol}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones exhaustivas
    const rutRegex = /^\d{7,8}$/;
    const nombreRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Limpiar RUT: eliminar puntos y guión
    const cleanRut = nuevoEstudiante.rut.replace(/[.-]/g, '');
    
    // Validaciones con mensajes específicos
    const errors = [];
  
    // Validar RUT
    if (!rutRegex.test(cleanRut)) {
      errors.push('RUT debe contener entre 7 y 8 dígitos sin puntos ni guión');
    }
  
    // Validar nombres
    if (!nombreRegex.test(nuevoEstudiante.nombres.trim())) {
      errors.push('Nombres solo pueden contener letras');
    }
  
    // Validar apellidos
    if (!nombreRegex.test(nuevoEstudiante.apellidos.trim())) {
      errors.push('Apellidos solo pueden contener letras');
    }
  
    // Validar correo
    if (!correoRegex.test(nuevoEstudiante.correo)) {
      errors.push('Correo electrónico no es válido');
    }
  
    // Si hay errores, mostrar el primero y detener el proceso
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
  
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/estudiantes`, 
        {
          ...nuevoEstudiante,
          rut: cleanRut // Enviar RUT sin puntos ni guión
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      // Éxito al crear estudiante
      toast.success(`Estudiante ${nuevoEstudiante.nombres} ${nuevoEstudiante.apellidos} creado exitosamente`);
      
      // Actualizar lista de estudiantes
      obtenerEstudiantes();
      
      // Cerrar modal y resetear formulario
      handleCloseNuevoEstudianteModal();
  
    } catch (error) {
      // Manejar errores específicos
      if (error.response) {
        // El servidor respondió con un error
        const errorMessage = error.response.data.error || 'Error al crear estudiante';
        toast.error(errorMessage);
        console.error('Error detallado:', error.response.data);
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        toast.error('No se recibió respuesta del servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        toast.error('Error al procesar la solicitud');
      }
      console.error('Error al crear estudiante:', error);
    }
  };

  const handleEdit = (estudianteId) => {
    setEditingId(estudianteId);
    setEditedFields({});
  };

  const handleFieldChange = (estudianteId, field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async (estudianteId) => {
    try {
      const token = getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/estudiantes/${estudianteId}`,
        editedFields,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      obtenerEstudiantes();
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const handleSeleccionarTodos = (e) => {
    setSeleccionarTodos(e.target.checked);
    if (e.target.checked) {
      setEstudiantesSeleccionados(estudiantes.map(est => est.id));
    } else {
      setEstudiantesSeleccionados([]);
    }
  };
  
  // Función para manejar la selección individual
  const handleSeleccionEstudiante = (estudianteId) => {
    setEstudiantesSeleccionados(prev => {
      if (prev.includes(estudianteId)) {
        return prev.filter(id => id !== estudianteId);
      } else {
        return [...prev, estudianteId];
      }
    });
  };

  const enviarCredencialesMasivoPorAno = async () => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/estudiantes/enviar-credenciales-masivo`,
        { ano_cursado: ano }, // Usar el año del filtro actual
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
  
      // Mostrar resumen de envío
      const { total_procesados, exitosos, fallidos, resultados, errores } = response.data;
  
      // Usar toast para notificaciones
      toast.success(`Envío de credenciales completado. 
        Total procesados: ${total_procesados}, 
        Exitosos: ${exitosos}, 
        Fallidos: ${fallidos}`);
  
      // Si hay errores, mostrar en consola o en un modal
      if (errores && errores.length > 0) {
        console.error('Errores en envío masivo:', errores);
        toast.warn('Algunos correos no pudieron ser enviados');
      }
  
    } catch (error) {
      console.error('Error al enviar credenciales masivamente:', error);
      toast.error('No se pudieron enviar las credenciales masivamente');
    }
  };
  
  const aplicarEdicionMasiva = async () => {
    try {
      const token = getToken();
      const cambios = {};
      
      // Manejo específico para el semestre
      if (edicionMasiva.semestre !== '') {  // Cambiado de if (edicionMasiva.semestre) a if (edicionMasiva.semestre !== '')
        cambios.semestre = parseInt(edicionMasiva.semestre);
      }
  
      // Manejo específico para el estado
      if (edicionMasiva.estado !== '') {
        cambios.estado = edicionMasiva.estado === 'true';  // Esto convertirá el string 'true'/'false' a boolean
      }
  
      // Verificar que hay cambios para aplicar
      if (Object.keys(cambios).length === 0) {
        console.error('No hay cambios para aplicar');
        return;
      }
  
      // Realizar la actualización masiva
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/estudiantes/edicion-masiva`,
        {
          id: estudiantesSeleccionados,
          cambios: cambios
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data.mensaje) {
        // Aquí podrías mostrar un mensaje de éxito
      }
  
      obtenerEstudiantes();
      setEditarMasivoModal(false);
      setEdicionMasiva({ semestre: '', estado: '' });
      setEstudiantesSeleccionados([]);
      setSeleccionarTodos(false);
  
    } catch (error) {
      console.error('Error en la edición masiva:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  // Función para determinar si hay filtros aplicados
  // Función para determinar si hay filtros aplicados
const hayFiltrosAplicados = () => {
  return (
    ano !== getCurrentYear().toString() || // Verifica si el año es diferente al actual
    (semestre !== '') || // Verifica si el semestre no está vacío
    (estadoFiltro !== 'activos') || // Verifica si el estado no es "activos"
    (searchTerm !== '') // Verifica si hay un término de búsqueda
  );
};

  // Nueva función para manejar el envío individual de credenciales
  const enviarCredencialIndividual = async (estudiante) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/estudiantes/${estudiante.id}/enviar-credencial`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );

      toast.success(`Credenciales enviadas a ${estudiante.nombres} ${estudiante.apellidos}`);
    } catch (error) {
      console.error('Error al enviar credenciales:', error);
      toast.error('No se pudieron enviar las credenciales');
    }
  };

  // Función para cambiar contraseña
  const handleCambioContrasena = async () => {
    // Validar contraseña antes de enviar
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
  
    // Validaciones
    if (!nuevaContrasena) {
      toast.error('Debe ingresar una nueva contraseña');
      return;
    }
  
    if (!passwordRegex.test(nuevaContrasena)) {
      toast.error('La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y tener entre 8 y 20 caracteres');
      return;
    }
  
    try {
      const token = getToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/estudiantes/${selectedEstudiante.id}/cambiar-contrasena`,
        { nuevaContrasena },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
  
      toast.success('Contraseña cambiada exitosamente');
      setCambioContrasenaModal(false);
      setNuevaContrasena('');
      setShowPassword(false);
  
    } catch (error) {
      // Manejar errores específicos
      if (error.response) {
        // El servidor respondió con un error
        const errorMessage = error.response.data.error || 'Error al cambiar contraseña';
        toast.error(errorMessage);
        console.error('Error detallado:', error.response.data);
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        toast.error('No se recibió respuesta del servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        toast.error('Error al procesar la solicitud');
      }
      console.error('Error al cambiar contraseña:', error);
    }
  };

  return (
  <Container fluid className="estudiantes">
    <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    <Row className="mb-4">
      <Col>
        <h2 className="text-center mb-4" style={{ color: 'color: #388DE2'}}>Gestión de Estudiantes</h2>
      </Col>
    </Row>

    {/* Controles de búsqueda y filtrado */}
    <Row className="mb-2">
      <Col xs={2} style={{width: '9%'}}>
        <Form.Select
          value={ano}
          onChange={(e) => handleFilterChange('ano', e.target.value)}
        >
          <option value="">Seleccione un año</option>
          <option value="2025">2025</option>
          {Array.from({ length: 10 }, (_, index) => getCurrentYear() - index).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </Col>
      <Col xs={2} style={{width: '17%'}}>
        <Form.Select
          value={estadoFiltro}
          onChange={(e) => handleFilterChange('estadoFiltro', e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </Form.Select>
      </Col>
      <Col xs={4}>
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o RUT..."
          value={searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
        />
      </Col>
      {isFiltered && (
        <Col xs={2}>
          <Button variant="secondary" onClick={limpiarFiltros}>
            <i className="fas fa-eraser"></i> Limpiar Filtros
          </Button>
        </Col>
      )}
      <Col xs={2}>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <i className="fas fa-plus"></i> Añadir Estudiante
        </Button>
      </Col>
    </Row>

    {/* Tabla de estudiantes */}
    <Card>
      <Card.Header>
        <Card.Title>Lista de Estudiantes</Card.Title>
      </Card.Header>
      <Card.Body>
        <Table responsive>
          <thead>
            <tr>
              <th style={{textAlign: 'center' }}>
                <input
                    type="checkbox"
                    id="selectAll"
                    checked={seleccionarTodos}
                    onChange={handleSeleccionarTodos}
                  />
              </th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>RUT</th>
              <th>Correo</th>
              <th>Años Cursados</th>
              <th>Estado</th>
              <th>Editar</th>
              {/* <th>Enviar credencial</th> */}
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => (
              <tr key={estudiante.id}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    id={`checkbox-${estudiante.id}`}
                    checked={estudiantesSeleccionados.includes(estudiante.id)}
                    onChange={() => handleSeleccionEstudiante(estudiante.id)}
                  />
                </td>
                <td>
                  {editingId === estudiante.id ? (
                    <Form.Control
                      type="text"
                      value={editedFields.nombres || estudiante.nombres}
                      onChange={(e) => handleFieldChange(estudiante.id, 'nombres', e.target.value)}
                    />
                  ) : estudiante.nombres}
                </td>
                <td>
                  {editingId === estudiante.id ? (
                    <Form.Control
                      type="text"
                      value={editedFields.apellidos || estudiante.apellidos}
                      onChange={(e) => handleFieldChange(estudiante.id, 'apellidos', e.target.value)}
                    />
                  ) : estudiante.apellidos}
                </td>
                <td>{estudiante.rut}</td>
                <td>
                  {editingId === estudiante.id ? (
                    <Form.Control
                      type="email"
                      value={editedFields.correo || estudiante.correo}
                      onChange={(e) => handleFieldChange(estudiante.id, 'correo', e.target.value)}
                    />
                  ) : estudiante.correo}
                </td>
                <td>{estudiante.anos_cursados}</td>
                <td>
                  <Form.Check
                    type="switch"
                    id={`estadoSwitch${estudiante.id}`}
                    checked={editingId === estudiante.id ? editedFields.estado ?? estudiante.estado : estudiante.estado}
                    onChange={(e) => {
                      if (editingId === estudiante.id) {
                        handleFieldChange(estudiante.id, 'estado', e.target.checked);
                      }
                    }}
                    disabled={editingId !== estudiante.id}
                    label={editingId === estudiante.id ? (editedFields.estado ?? estudiante.estado ? 'Activo' : 'Inactivo') : (estudiante.estado ? 'Activo' : 'Inactivo')}
                  />
                </td>
                <td>
                  {editingId === estudiante.id ? (
                    <div className="d-flex">
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleSaveChanges(estudiante.id)}
                      >
                        <i className="fas fa-save me-1"></i>Guardar
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditedFields({});
                        }}
                      >
                        <i className="fas fa-times me-1"></i>Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" id={`dropdown-${estudiante.id}`}>
                        Acciones
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item 
                          onClick={() => handleEdit(estudiante.id)}
                        >
                          <i className="fas fa-edit me-2"></i>Editar
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => {
                            setSelectedEstudiante(estudiante);
                            setCambioContrasenaModal(true);
                          }}
                        >
                          <i className="fas fa-key me-2"></i>Cambiar Contraseña
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => {
                            const confirmar = window.confirm(`¿Está seguro de enviar credenciales a ${estudiante.nombres} ${estudiante.apellidos}?`);
                            if (confirmar) {
                              enviarCredencialIndividual(estudiante);
                            }
                          }}
                        >
                          <i className="fas fa-envelope me-2"></i>Enviar Credencial
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </td>
                {/* <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    onClick={() => enviarCredencialesPorCorreo(estudiante)}
                  >
                    <i className="fas fa-envelope"></i>
                  </Button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>

    {/* Paginación */}
    <Row className="mt-3">
      <Col>
        <Pagination size="sm">
          <Pagination.Prev
            disabled={isFirstPage}
            onClick={() => !isFirstPage && goToPage(currentPage - 1)}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={currentPage === index + 1}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={isLastPage}
            onClick={() => !isLastPage && goToPage(currentPage + 1)}
          />
        </Pagination>
      </Col>
    </Row>

    <Row className="mt-3">
      <Col>
        <Button
          variant="warning"
          onClick={() => setEditarMasivoModal(true)}
          disabled={estudiantesSeleccionados.length === 0}
        >
          <i className="fas fa-edit"></i> Edición Masiva
        </Button>
        <Button
          variant="info"
          className="ms-2"
          onClick={() => {
            // Modal o confirmación para envío masivo de credenciales
            const confirmar = window.confirm(`¿Está seguro de enviar credenciales a todos los estudiantes del año ${ano}?`);
            if (confirmar) {
              enviarCredencialesMasivoPorAno();
            }
          }}
        >
          <i className="fas fa-envelope"></i> Enviar Credenciales por Año
        </Button>
      </Col>
    </Row>
  
    {/* Modal de edición masiva */}
    <Modal show={editarMasivoModal} onHide={handleCloseNuevoEstudianteModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edición Masiva de Estudiantes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* <Form.Group>
            <Form.Label>Semestre</Form.Label>
            <Form.Select
              value={edicionMasiva.semestre}
              onChange={(e) => setEdicionMasiva(prev => ({ ...prev, semestre: e.target.value }))}
            >
              <option value="">Sin cambios</option>
              <option value="1">Primer semestre</option>
              <option value="2">Segundo semestre</option>
            </Form.Select>
          </Form.Group> */}
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={edicionMasiva.estado}
              onChange={(e) => setEdicionMasiva(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Sin cambios</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={aplicarEdicionMasiva} className="mt-3">
            Aplicar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>

    {/* Modal para añadir nuevo estudiante */}
    <Modal show={modalOpen} onHide={handleCloseNuevoEstudianteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nuevo Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control 
                type="text" 
                name="nombres" 
                value={nuevoEstudiante.nombres} 
                onChange={handleInputChange} 
                required 
                pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                placeholder="Ingrese nombres"
              />
              <Form.Text className="text-muted">
                Solo se permiten letras y espacios
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control 
                type="text" 
                name="apellidos" 
                value={nuevoEstudiante.apellidos} 
                onChange={handleInputChange} 
                required 
                pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                placeholder="Ingrese apellidos"
              />
              <Form.Text className="text-muted">
                Solo se permiten letras y espacios
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control 
                type="text" 
                name="rut" 
                value={nuevoEstudiante.rut}
                onChange={handleInputChange} 
                required 
                placeholder="Ej: 12.345.678-9"
                pattern="\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}"
              />
              <Form.Text className="text-muted">
                Ingrese RUT con formato: 12.345.678-9
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                name="correo" 
                value={nuevoEstudiante.correo} 
                onChange={handleInputChange} 
                required 
                placeholder="Ingrese correo electrónico"
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              />
              <Form.Text className="text-muted">
                Ingrese un correo electrónico válido
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  name="contrasena" 
                  value={nuevoEstudiante.contrasena}
                  onChange={handleInputChange} 
                  required 
                  readOnly
                />
                <Button variant="outline-secondary" onClick={generarContrasena}>
                  Generar
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                La contraseña se genera automáticamente basada en el RUT
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Año Cursado</Form.Label>
              <Form.Control 
                type="number" 
                name="anos_cursados" 
                value={nuevoEstudiante.anos_cursados}
                onChange={handleInputChange} 
                required 
                min={getCurrentYear() - 10}
                max={getCurrentYear()}
              />
              <Form.Text className="text-muted">
                Ingrese un año entre {getCurrentYear() - 10} y {getCurrentYear()}
              </Form.Text>
            </Form.Group>
            
            <Button 
              type="submit" 
              variant="primary" 
              className="mt-3 w-100"
            >
              Registrar Estudiante
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={cambioContrasenaModal} onHide={handleCloseNuevoEstudianteModal}>
  <Modal.Header closeButton>
    <Modal.Title>Cambiar Contraseña</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedEstudiante && (
      <div>
        <p>Cambiando contraseña para: {selectedEstudiante.nombres} {selectedEstudiante.apellidos}</p>
        <Form.Group>
          <Form.Label>Nueva Contraseña</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="Ingrese nueva contraseña"
              required
            />
            <InputGroup.Text 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ cursor: 'pointer' }}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </InputGroup.Text>
          </InputGroup>
          {nuevaContrasena && (
            <PasswordValidationMessage password={nuevaContrasena} />
          )}
        </Form.Group>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => {
      setCambioContrasenaModal(false);
      setShowPassword(false);
    }}>
      Cancelar
    </Button>
    <Button 
      variant="primary" 
      onClick={handleCambioContrasena}
      disabled={!nuevaContrasena}
    >
      Cambiar Contraseña
    </Button>
  </Modal.Footer>
</Modal>
  </Container>
);
};

export default Estudiantes;