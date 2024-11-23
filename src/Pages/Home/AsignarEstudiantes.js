import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl, Card, Alert, Col, Row } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify'; // Importa toast
import 'react-toastify/dist/ReactToastify.css';
import './AsignarEstudiantes.css';

const AsignarEstudiantes = () => {
  const { getToken } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [receptores, setReceptores] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('activos');
  const [isSelecting, setIsSelecting] = useState(null);
  const [startEstudiante, setStartEstudiante] = useState(null);
  const [tipoInstitucionSeleccionado, setTipoInstitucionSeleccionado] = useState(null);
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState(null);
  const [receptorSeleccionado, setReceptorSeleccionado] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [asignacionParaEditar, setAsignacionParaEditar] = useState(null);
  const [totalAsignaciones, setTotalAsignaciones] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [anoSeleccionado, setAnoSeleccionado] = useState('2024');
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);

  const getAniosOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -9; i <= 0; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const aniosOptions = getAniosOptions();

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, searchTerm, anoSeleccionado, asignaciones.length]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses en JS son 0-11
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchData = async (page = currentPage) => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
  
      const estudiantesRes = await axios.get(`${apiUrl}/estudiantes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          limit: limit,
          search: searchTerm,
          ano: anoSeleccionado,
          estado: estadoFiltro
        }
      });
      const estudiantes = estudiantesRes.data.estudiantes || [];
      setEstudiantes(estudiantes);
      setTotalElements(estudiantesRes.data.total);
      setCurrentPage(page);
  
      // Obtener asignaciones solo para los estudiantes en la página actual
      const estudianteIds = estudiantes.map(est => est.id);
      const asignacionesRes = await axios.get(`${apiUrl}/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          estudiante_id: estudianteIds.join(','), // Pasar múltiples IDs si es necesario
          page: 1, // O la página que deseas para las asignaciones
          limit: 100 // O un número que consideres adecuado para obtener todas las asignaciones
        }
      });
      setAsignaciones(asignacionesRes.data.asignaciones || []);
      setTotalAsignaciones(asignacionesRes.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Error al cargar los datos. Por favor, intente de nuevo.");
    }
  };

  const handleTipoInstitucionChange = async (event) => {
    const tipoId = event.target.value;
    setTipoInstitucionSeleccionado(tipoId);
    setInstitucionSeleccionada(null);
    setReceptorSeleccionado(null);
  
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/instituciones?tipoId=${tipoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filtrar las instituciones por el tipo seleccionado
      const institucionesFiltradas = response.data.instituciones.filter(
        institucion => institucion.tipo_id === parseInt(tipoId)
      );
      
      setInstituciones(institucionesFiltradas);
    } catch (error) {
      console.error("Error al obtener instituciones:", error);
      setErrorMessage("Error al obtener instituciones.");
      toast.error("Error al obtener instituciones.");
    }
  };

  const handleInstitucionChange = async (event) => {
    const institucionId = event.target.value;
    setInstitucionSeleccionada(institucionId);
    setReceptorSeleccionado(null);

    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/obtener/receptores?institucionId=${institucionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceptores(response.data || []);
    } catch (error) {
      console.error("Error al obtener receptores:", error);
      setErrorMessage("Error al obtener receptores.");
      toast.error("Error al obtener receptores.");
    }
  };

  const handleAsignarCentro = async () => {
    if (!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin) {
      setErrorMessage('Por favor, completa todos los campos.');
      toast.error('Por favor, completa todos los campos.');
      return;
    }
  
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      
      // Primero, verificar si hay asignaciones existentes para este período
      const asignacionesExistentes = asignaciones.filter(asig => 
        asig.receptor_id === parseInt(receptorSeleccionado) &&
        ((new Date(asig.fecha_inicio) <= new Date(fechaFin) && 
          new Date(asig.fecha_fin) >= new Date(fechaInicio)))
      );
  
      if (asignacionesExistentes.length > 0) {
        const detallesAsignaciones = asignacionesExistentes.map(asig => {
          const estudiante = estudiantes.find(e => e.id === asig.estudiante_id);
          return `- ${estudiante?.nombres} ${estudiante?.apellidos}: ${formatDate(asig.fecha_inicio)} a ${formatDate(asig.fecha_fin)}`;
        }).join('\n');
  
        setErrorMessage(
          `Ya existen asignaciones para este receptor en este periodo:\n\n${detallesAsignaciones}\n\nPor favor, seleccione un periodo diferente.`
        );
        return;
      }
  
      // Si no hay conflictos, proceder con la creación de asignaciones
      await Promise.all(selectedEstudiantes.map(async (estudiante) => {
        await axios.post(`${apiUrl}/asignaciones`, {
          estudiante_id: estudiante.id,
          institucion_id: parseInt(institucionSeleccionada),
          receptor_id: parseInt(receptorSeleccionado),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }));
  
      await fetchData(currentPage);
      setShowAsignarModal(false);
      resetearFormulario();
      setSelectedEstudiantes([]);
      toast.success('Asignaciones creadas exitosamente!');
    } catch (error) {
      console.error("Error al crear asignaciones:", error);
      const errorMsg = error.response?.data?.error || "Error al crear las asignaciones. Por favor, intente de nuevo.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleEditarAsignacion = (asignacion) => {
  setAsignacionParaEditar(asignacion);
  setInstitucionSeleccionada(asignacion.institucion_id);
  setReceptorSeleccionado(asignacion.receptor_id);
  setFechaInicio(asignacion.fecha_inicio.split('T')[0]);
  setFechaFin(asignacion.fecha_fin.split('T')[0]);
  setShowEditarModal(true);
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
    const response = await axios.put(`${apiUrl}/asignaciones/${asignacionParaEditar.id}`, {
      institucion_id: parseInt(institucionSeleccionada),
      receptor_id: parseInt(receptorSeleccionado),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Actualizar el estado local inmediatamente con los datos del servidor
    setAsignaciones(prevAsignaciones => 
      prevAsignaciones.map(a => 
        a.id === asignacionParaEditar.id ? response.data : a
      )
    );

    // Cerrar el modal y limpiar el formulario
    await fetchData(currentPage);
    setShowEditarModal(false);
    resetearFormulario();
    toast.success('Asignación actualizada exitosamente!');
  } catch (error) {
    console.error("Error al actualizar asignación:", error);
    setErrorMessage("Error al actualizar la asignación. Por favor, intente de nuevo.");
    toast.error("Error al actualizar la asignación. Por favor, intente de nuevo.");
  }
};

const handleEliminarAsignacion = async (asignacionId) => {
  try {
    const token = getToken();
    const apiUrl = process.env.REACT_APP_API_URL;
    await axios.delete(`${apiUrl}/asignaciones/${asignacionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchData(currentPage); // Agregar esta línea después de eliminar
    toast.success("Asignación eliminada exitosamente!");
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    setErrorMessage("Error al eliminar la asignación. Por favor, intente de nuevo.");
    toast.error("Error al eliminar la asignación. Por favor, intente de nuevo.");
  }
};


  const toggleEstudianteSelection = (estudiante) => {
    if (selectedEstudiantes.includes(estudiante)) {
      setSelectedEstudiantes(selectedEstudiantes.filter(e => e !== estudiante));
    } else {
      setSelectedEstudiantes([...selectedEstudiantes, estudiante]);
    }
  };

  const handleMouseDown = (estudiante) => {
    setIsSelecting(true);
    setStartEstudiante(estudiante);
    const isInitiallySelected = selectedEstudiantes.includes(estudiante);
    if (isInitiallySelected) {
      setSelectedEstudiantes(prev => prev.filter(e => e.correo !== estudiante.correo));
    } else {
      setSelectedEstudiantes(prev => [...prev, estudiante]);
    }
    setIsSelecting(isInitiallySelected ? 'deselecting' : 'selecting');
  };
  
  const handleMouseEnter = (estudiante) => {
    if (isSelecting && startEstudiante) {
      const startIndex = estudiantes.findIndex(e => e.correo === startEstudiante.correo);
      const currentIndex = estudiantes.findIndex(e => e.correo === estudiante.correo);
      const start = Math.min(startIndex, currentIndex);
      const end = Math.max(startIndex, currentIndex);
      const rangeSelection = estudiantes.slice(start, end + 1);
      
      if (isSelecting === 'deselecting') {
        setSelectedEstudiantes(prev => 
          prev.filter(e => !rangeSelection.some(rs => rs.correo === e.correo))
        );
      } else {
        setSelectedEstudiantes(prev => {
          const currentSelection = prev.filter(e => 
            !rangeSelection.some(rs => rs.correo === e.correo)
          );
          return [...currentSelection, ...rangeSelection];
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(null);
    setStartEstudiante(null);
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

  return (
    <div className="asignar-estudiantes" onMouseUp={handleMouseUp}>
    <ToastContainer />
      <h2>Asignación de Estudiantes</h2>
      <Row className="mb-3 align-items-end">
        <Col xs={4} md={3}>
          <Form.Group>
            <Form.Label>Año Cursado</Form.Label>
            <Form.Select onChange={(e) => setAnoSeleccionado(e.target.value)} value={anoSeleccionado}>
              <option value="">Seleccione un año</option>
              {aniosOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={8} md={9}>
          <InputGroup>
            <FormControl
              placeholder="Buscar estudiante"
              aria-label="Buscar estudiante"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title>Estudiantes y sus Asignaciones</Card.Title>
        </Card.Header>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Correo</th>
              <th>Asignaciones</th>
              <th>Cursado(s)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.filter(est => 
              est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
              est.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((estudiante, index) => (
              <tr key={index}
                  onMouseDown={() => handleMouseDown(estudiante)}
                  onMouseEnter={() => handleMouseEnter(estudiante)}
                  className={selectedEstudiantes.includes(estudiante) ? 'selected' : ''}
              >
                <td>
                  <Form.Check 
                    type="checkbox"
                    checked={selectedEstudiantes.includes(estudiante)}
                    onChange={() => toggleEstudianteSelection(estudiante)}
                  />
                </td>
                <td>{estudiante.nombres}</td>
                <td>{estudiante.apellidos}</td>
                <td>{estudiante.correo}</td>
                <td>
  {asignaciones.filter(asig => asig.estudiante_id === estudiante.id).map((asignacion, idx) => (
    <div key={idx} className="asignacion-item">
      <div>
        {asignacion.Institucion?.nombre || 'Institución no especificada'} - 
        {asignacion.Receptor?.nombre || 'Receptor no especificado'} <br/>
        {formatDate(asignacion.fecha_inicio)} a {formatDate(asignacion.fecha_fin)}
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
  ))}
</td>
                  <td>{estudiante.anos_cursados}</td>
                <td>
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => setShowAsignarModal(true)}
                  >
                    Agregar Asignación
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Button 
        variant="primary" 
        onClick={() => setShowAsignarModal(true)}
        disabled={selectedEstudiantes.length === 0}
      >
        Asignar Institución y Receptor a Seleccionados ({selectedEstudiantes.length})
      </Button>

      {/* Paginación */}
      <div className="asignar-estudiantes__pagination d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="Page navigation">
          <ul className="pagination pagination-sm">
            {/* Botón de página anterior */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>
            </li>

            {/* Páginas */}
            {[...Array(totalPages)].map((_, index) => (
              <li 
                key={index} 
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Botón de página siguiente */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Modal show={showAsignarModal} onHide={() => setShowAsignarModal(false)} size="lg">
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
          <Button variant="secondary" onClick={() => setShowAsignarModal(false)}>
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
      <Modal show={showEditarModal} onHide={() => setShowEditarModal(false)}>
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
    </div>
  );
};

export default AsignarEstudiantes;