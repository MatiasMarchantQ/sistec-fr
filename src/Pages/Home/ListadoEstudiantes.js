import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Table, Modal, InputGroup, Pagination } from 'react-bootstrap';
import axios from 'axios';
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
  const [estadoFiltro, setEstadoFiltro] = useState('activos');
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const [editarMasivoModal, setEditarMasivoModal] = useState(false);
  const [edicionMasiva, setEdicionMasiva] = useState({
    semestre: '',
    estado: ''
  });
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const symbols = '!#$%&*+?';

  const limpiarFiltros = () => {
    setAno(getCurrentYear().toString());
    setSemestre('');
    setEstadoFiltro('activos');
    setSearchTerm('');
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
    setNuevoEstudiante(prev => ({ ...prev, [name]: value }));

    if (name === 'rut') {
      // Obtiene solo la parte del RUT antes del guion
      const formattedRut = value.includes('-') ? 
        value.split('-')[0].replace(/\./g, '') : 
        value.replace(/\./g, '');
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      setNuevoEstudiante(prev => ({ ...prev, contrasena: `UCM${formattedRut}${randomSymbol}` }));
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
    try {
      const token = getToken();
      await axios.post(`${process.env.REACT_APP_API_URL}/estudiantes`, nuevoEstudiante, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      obtenerEstudiantes();
      setModalOpen(false);
    } catch (error) {
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
        console.log('Actualización exitosa:', response.data.mensaje);
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
  const hayFiltrosAplicados = () => {
    return (
      ano !== getCurrentYear().toString() || // Verifica si el año es diferente al actual
      semestre !== '' || // Verifica si el semestre no está vacío
      estadoFiltro !== 'activos' || // Verifica si el estado no es "activos"
      searchTerm !== '' // Verifica si hay un término de búsqueda
    );
  };

  return (
  <Container fluid className="estudiantes">
    <Row className="mb-4">
      <Col>
        <h2 className="text-center">Gestión de Estudiantes</h2>
      </Col>
    </Row>

    {/* Controles de búsqueda y filtrado */}
    <Row className="mb-2">
      <Col xs={2} style={{width: '9%'}}>
        <Form.Select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        >
          <option value="">Seleccione un año</option>
          {Array.from({ length: 10 }, (_, index) => getCurrentYear() - index).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </Col>
      <Col xs={3} style={{width: '20%'}}>
        <Form.Select
          value={semestre}
          onChange={(e) => setSemestre(e.target.value)}
        >
          <option value="">Todos los semestres</option>
          <option value="1">Primer semestre</option>
          <option value="2">Segundo semestre</option>
        </Form.Select>
      </Col>
      <Col xs={2} style={{width: '17%'}}>
        <Form.Select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Col>
      {hayFiltrosAplicados() && (
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
              <th>Semestre</th>
              <th>Estado</th>
              <th>Acciones</th>
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
                  {editingId === estudiante.id ? (
                    <Form.Select
                      value={editedFields.semestre || estudiante.semestre}
                      onChange={(e) => handleFieldChange(estudiante.id, 'semestre', e.target.value)}
                    >
                      <option value="">Seleccione semestre</option>
                      <option value="1">Primer semestre</option>
                      <option value="2">Segundo semestre</option>
                    </Form.Select>
                  ) : estudiante.semestre}
                </td>
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
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSaveChanges(estudiante.id)}
                      >
                        <i className="fas fa-save"></i>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(estudiante.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                  )}
                </td>
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

    {/* Botón de edición masiva */}
    <Row className="mt-3 ">
      <Col>
        <Button
          variant="warning"
          onClick={() => setEditarMasivoModal(true)}
          disabled={estudiantesSeleccionados.length === 0}
        >
          <i className="fas fa-edit"></i> Edición Masiva
        </Button>
      </Col>
    </Row>

    {/* Modal de edición masiva */}
    <Modal show={editarMasivoModal} onHide={() => setEditarMasivoModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edición Masiva de Estudiantes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Semestre</Form.Label>
            <Form.Select
              value={edicionMasiva.semestre}
              onChange={(e) => setEdicionMasiva(prev => ({ ...prev, semestre: e.target.value }))}
            >
              <option value="">Sin cambios</option>
              <option value="1">Primer semestre</option>
              <option value="2">Segundo semestre</option>
            </Form.Select>
          </Form.Group>
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
    <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nuevo Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control type="text" name="nombres" value={nuevoEstudiante.nombres} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control type="text" name="apellidos" value={nuevoEstudiante.apellidos} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>RUT (sin puntos, con guión y dígito verificador)</Form.Label>
              <Form.Control 
                type="text" 
                name="rut" 
                value={nuevoEstudiante.rut}
                onChange={handleInputChange} 
                required 
                pattern="\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}"
                placeholder="Ej: 12.345.678-9"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" name="correo" value={nuevoEstudiante.correo} onChange={handleInputChange} required />
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
                />
                <Button variant="outline-secondary" onClick={generarContrasena}>
                  Generar
                </Button>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Año Cursado</Form.Label>
              <Form.Control 
                type="number" 
                name="anos_cursados" 
                value={nuevoEstudiante.anos_cursados}
                onChange={handleInputChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Semestre</Form.Label>
              <Form.Select
                name="semestre"
                value={nuevoEstudiante.semestre}
                onChange={handleInputChange}
                required
              >
                <option value="1">Primer semestre</option>
                <option value="2">Segundo semestre</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">Registrar</Button>
          </Form>
        </Modal.Body>
      </Modal>
  </Container>
);
};

export default Estudiantes;