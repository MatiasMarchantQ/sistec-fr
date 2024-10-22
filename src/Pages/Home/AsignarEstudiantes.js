import React, { useState } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl, Pagination, Card, Alert } from 'react-bootstrap';
import './AsignarEstudiantes.css';

const AsignarEstudiantes = () => {
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estudianteBuscado, setEstudianteBuscado] = useState(null);
  const [rut, setRut] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');



  const handleAsignar = () => {
    // Lógica para asignar estudiantes
    setShowAsignarModal(false);
  };

  const buscarEstudiantePorRut = () => {
    // Aquí deberías implementar la lógica para buscar al estudiante por RUT
    // Por ahora, simularemos que encontramos un estudiante
    const estudianteEncontrado = {
      id: '1',
      nombre: 'Juan Pérez',
      tipo: 'Sin Asignar',
      institucion: 'Sin Asignar',
      periodo: 'Sin Asignar',
      estado: 'Activo'
    };
    setEstudianteBuscado(estudianteEncontrado);
  };

  const handleAgregar = () => {
    // Lógica para agregar asignación manualmente
    setShowAgregarModal(false);
  };

  const handleEditar = (id) => {
    // Lógica para editar asignación
  };

  const handleEliminar = (id) => {
    // Lógica para eliminar asignación
  };

  const handleGuardar = () => {
    // Lógica para guardar cambios
  };

  const handleCancelar = () => {
    // Lógica para cancelar cambios
  };

  const handleVolverHome = () => {
    // Lógica para volver al home
  };

  return (
    <div className="asignar-estudiantes">
          <h2>Asignar Estudiantes</h2>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button variant="primary" onClick={() => setShowAsignarModal(true)} className="mr-2">
                Asignar
              </Button>
              <InputGroup className="d-inline-flex" style={{width: 'auto'}}>
                <FormControl
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
              </InputGroup>
            </div>
            <Button variant="success" onClick={() => setShowAgregarModal(true)}>
              Agregar Manualmente
            </Button>
          </div>

         <Card>
            <Card.Header>
                <Card.Title>Asignaciones</Card.Title>
            </Card.Header>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Institución</th>
                <th>Periodo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asignacion) => (
                <tr key={asignacion.id}>
                  <td>{asignacion.id}</td>
                  <td>{`${asignacion.primerNombre} ${asignacion.primerApellido} ${asignacion.segundoApellido}`}</td>
                  <td>{asignacion.tipo}</td>
                  <td>{asignacion.institucion}</td>
                  <td>{asignacion.periodo}</td>
                  <td>
                    <Button variant="warning" onClick={() => handleEditar(asignacion.id)} className="mr-2">
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="danger" onClick={() => handleEliminar(asignacion.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
           </Table>
          </Card>

          <div className="d-flex justify-content-between align-items-center">
            <Pagination>
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item active>{1}</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
            <div>
              <Button variant="success" onClick={handleGuardar} className="mr-2">
                Guardar
              </Button>
              <Button variant="danger" onClick={handleCancelar}>
                Cancelar
              </Button>
            </div>
          </div>


      <div className="text-center mt-4">
        <Button variant="primary" onClick={handleVolverHome}>
          Volver al Home
        </Button>
      </div>

      <Modal show={showAsignarModal} onHide={() => setShowAsignarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Estudiantes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNumeroEstudiantes">
              <Form.Label>Número de Estudiantes</Form.Label>
              <Form.Control type="number" />
            </Form.Group>
            <Form.Group controlId="formPeriodoInicio">
              <Form.Label>Periodo Inicio</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group controlId="formPeriodoFin">
              <Form.Label>Periodo Fin</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group controlId="formTipo">
              <Form.Label>Tipo</Form.Label>
              <Form.Control as="select">
                <option value="">Seleccione un tipo</option>
                {/* Opciones de tipo */}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formInstituciones">
              <Form.Label>Instituciones</Form.Label>
              <Form.Control as="select" multiple>
                {/* Opciones de instituciones */}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAsignar}>
            Asignar
          </Button>
          <Button variant="secondary" onClick={() => setShowAsignarModal(false)}>
            Cancelar
          </ Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAgregarModal} onHide={() => setShowAgregarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Asignación Manualmente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formRut">
              <Form.Label>RUT</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  value={rut} 
                  onChange={(e) => setRut(e.target.value)} 
                  placeholder="Ingrese RUT del estudiante"
                />
                <Button variant="outline-secondary" onClick={buscarEstudiantePorRut}>
                  Buscar
                </Button>
              </InputGroup>
            </Form.Group>

            {estudianteBuscado && (
              <Alert variant="warning">
                <Alert.Heading>Datos del Estudiante</Alert.Heading>
                <p><strong>ID:</strong> {estudianteBuscado.id}</p>
                <p><strong>Nombre:</strong> {estudianteBuscado.nombre}</p>
                <p><strong>Tipo:</strong> {estudianteBuscado.tipo}</p>
                <p><strong>Institución:</strong> {estudianteBuscado.institucion}</p>
                <p><strong>Periodo:</strong> {estudianteBuscado.periodo}</p>
                <p><strong>Estado:</strong> {estudianteBuscado.estado}</p>
              </Alert>
            )}

            <Form.Group controlId="formPeriodoInicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control type="date" />
            </Form.Group>

            <Form.Group controlId="formPeriodoFin">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control type="date" />
            </Form.Group>

            <Form.Group controlId="formTipo">
              <Form.Label>Tipo</Form.Label>
              <Form.Control 
                as="select" 
                value={tipoSeleccionado} 
                onChange={(e) => setTipoSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un tipo</option>
                {/* Opciones de tipo */}
              </Form.Control>
            </Form.Group>

            {tipoSeleccionado && (
              <Form.Group controlId="formInstitucion">
                <Form.Label>Institución</Form.Label>
                <Form.Control 
                  as="select" 
                  value={''} 
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="">Seleccione una institución</option>
                  {/* Opciones de instituciones dependiendo del tipo seleccionado */}
                </Form.Control>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAgregar}>
            Agregar
          </Button>
          <Button variant="secondary" onClick={() => setShowAgregarModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AsignarEstudiantes;