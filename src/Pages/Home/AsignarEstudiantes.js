import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './AsignarEstudiantes.css';

const AsignarEstudiantes = () => {
  const { getToken } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [receptores, setReceptores] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiantes, setSelectedEstudiantes] = useState([]);
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
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;

      const estudiantesRes = await axios.get(`${apiUrl}/estudiantes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstudiantes(estudiantesRes.data.estudiantes || []);

      const tiposInstitucionesRes = await axios.get(`${apiUrl}/obtener/tipos-instituciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposInstituciones(tiposInstitucionesRes.data || []);

      const asignacionesRes = await axios.get(`${apiUrl}/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAsignaciones(asignacionesRes.data.asignaciones || []);
      setTotalAsignaciones(asignacionesRes.data.total);
      setTotalPages(asignacionesRes.data.totalPages);
      setCurrentPage(asignacionesRes.data.currentPage);
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
    }
  };

  const handleAsignarCentro = async () => {
    if (!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      const token = getToken();
      const apiUrl = process.env.REACT_APP_API_URL;
      const nuevasAsignaciones = await Promise.all(selectedEstudiantes.map(async (estudiante) => {
        const response = await axios.post(`${apiUrl}/asignaciones`, {
          estudiante_id: estudiante.id, // Asegúrate de que esto sea un número
          institucion_id: parseInt(institucionSeleccionada), // Asegúrate de convertir a número
          receptorId: parseInt(receptorSeleccionado), // Asegúrate de convertir a número
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      }));

      setAsignaciones([...asignaciones, ...nuevasAsignaciones]);
      setShowAsignarModal(false);
      resetearFormulario();
    } catch (error) {
      console.error("Error al crear asignaciones:", error);
      setErrorMessage("Error al crear las asignaciones. Por favor, intente de nuevo.");
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

const handleEliminarAsignacion = async (asignacionId) => {
  try {
    const token = getToken();
    const apiUrl = process.env.REACT_APP_API_URL;
    await axios.delete(`${apiUrl}/asignaciones/${asignacionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const asignacionesActualizadas = asignaciones.filter(a => a.id !== asignacionId);
    setAsignaciones(asignacionesActualizadas);
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    setErrorMessage("Error al eliminar la asignación. Por favor, intente de nuevo.");
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
      <h2>Asignación de Estudiantes</h2>
      
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Buscar</InputGroup.Text>
        <FormControl
          placeholder="Nombre o apellido del estudiante"
          aria-label="Buscar estudiante"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

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
        {asignacion.Institucion?.receptores?.map(receptor => receptor.nombre).join(', ') || 'Receptor no especificado'} <br/>
        {new Date(asignacion.fecha_inicio).toLocaleDateString()} a {new Date(asignacion.fecha_fin).toLocaleDateString()}
      </div>
      <div>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={() => handleEditarAsignacion(asignacion)}
        >
          Editar
        </Button>
        {' '}
        <Button 
          variant="outline-danger" 
          size="sm" 
          onClick={() => handleEliminarAsignacion(asignacion.id)}
        >
          Eliminar
        </Button>
      </div>
    </div>
  ))}
</td>
                <td>
                  <Button 
                    variant="outline-success" 
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

      <Modal show={showAsignarModal} onHide={() => setShowAsignarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Institución y Receptor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb ```javascript
            -3">
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

            <Form.Group className="mb-3">
              <Form.Label>Fecha Inicio</Form.Label>
              <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </Form.Group>

            {errorMessage && (
              <Alert variant="danger">{errorMessage}</Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAsignarModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAsignarCentro}
            disabled={!institucionSeleccionada || !receptorSeleccionado || !fechaInicio || !fechaFin}
          >
            Asignar
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