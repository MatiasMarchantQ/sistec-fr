import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Alert } from 'react-bootstrap'; 
import * as XLSX from 'xlsx';
import './CargarEstudiantes.css';

const CargarEstudiantes = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    firstName: '',
    lastName1: '',
    lastName2: '',
    rut: '',
    password: '',
    status: 'Activo',
  });
  const [alertMessage, setAlertMessage] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setAlertMessage('Por favor, seleccione un archivo.');
      return;
    }
  
    if (!file.type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel')) {
      setAlertMessage('Por favor, seleccione un archivo Excel válido (.xlsx o .xls).');
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
        const formattedData = jsonData.map((student, index) => {
          const formattedRut = student['RUT'] ? student['RUT'].replace(/\D/g, '').slice(0, -1) : '';
          
          const symbols = '!#$%&*+?';
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          
          const password = `UCM${formattedRut}${randomSymbol}`;
  
          return {
            id: index + 1,
            firstName: student['Primer nombre'],
            lastName1: student['Primer apellido'],
            lastName2: student['Segundo apellido'],
            rut: formattedRut,
            password: password,
            status: 'Activo',
          };
        });
  
        setStudents(formattedData);
        setAlertMessage('Estudiantes cargados con éxito.');
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        setAlertMessage('Error al procesar el archivo. Por favor, asegúrese de que es un archivo Excel válido.');
      }
    };
  
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      setAlertMessage('Error al leer el archivo. Por favor, intente nuevamente.');
    };
  
    reader.readAsArrayBuffer(file);
  };

  const handleClearStudents = () => {
    setStudents([]);
    setAlertMessage('Tabla limpiada.');
  };

  const handleAddStudent = () => {
    if (newStudent.firstName && newStudent.lastName1 && newStudent.rut) {
      const formattedRut = newStudent.rut.replace(/\D/g, '').slice(0, -1);
      const symbols = '!#$%&*+?';
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const password = `UCM${formattedRut}${randomSymbol}`;
  
      const updatedNewStudent = {
        ...newStudent,
        id: students.length + 1,
        rut: formattedRut,
        password: password,
        status: 'Activo'
      };
  
      setStudents([...students, updatedNewStudent]);
      setNewStudent({
        id: '',
        firstName: '',
        lastName1: '',
        lastName2: '',
        rut: '',
        password: '',
        status: 'Activo',
      });
      setShowModal(false);
      setAlertMessage('Estudiante agregado con éxito.');
    } else {
      setAlertMessage('Por favor, completa todos los campos requeridos.');
    }
  };

  const handleSaveStudents = () => {
    // Aquí iría la lógica para enviar los datos al servidor
    console.log("Datos a enviar al servidor:", students);
    setAlertMessage("Datos preparados para enviar al servidor. (Simulación)");
    // En el futuro, aquí irá la llamada a la API para guardar los datos
  };

  const handleDeleteStudent = (id) => {
    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);
    setAlertMessage('Estudiante eliminado.');
  };

  return (
    <div className="cargar-estudiantes">
        <div className="container mt-4">
        <h2 className="mb-4">Cargar Estudiantes</h2>
        
        {alertMessage && <Alert variant="info">{alertMessage}</Alert>}
        
        {/* Card para el input de archivo */}
        <div className="card card-primary">
          <div className="card-header">
            <h3 className="card-title">Cargar archivo Excel</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="excelFile">Seleccione un archivo Excel (.xlsx o .xls)</label>
              <div className="input-group">
                <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  id="excelFile"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
                  <label className="custom-file-label" htmlFor="excelFile">Elegir archivo</label>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className="alert alert-warning mt-1 mb-0">
              <i className="fas fa-exclamation-triangle"></i> <strong>Importante:</strong> La plantilla debe contener: Primer nombre, Primer Apellido, Segundo Apellido y RUT.
            </div>
          </div>
        </div>


        {/* Mostrar los botones y la tabla solo si hay datos en 'students' */}
        {students.length > 0 ? (
          <>
            {/* Botones de acción */}
            <div className="mb-3">
              {/* <Button variant="success" className="ml-2">Exportar a Excel</Button> */}
              <Button variant="danger" className="ml-2" onClick={handleClearStudents}>Limpiar</Button>
              <Button variant="primary" onClick={() => setShowModal(true)} className="ml-2">Agregar Manualmente</Button>
            </div>

            {/* Tabla de estudiantes */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Primer Nombre</th>
                  <th>Primer Apellido</th>
                  <th>Segundo Apellido</th>
                  <th>RUT</th>
                  <th>Contraseña</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName1}</td>
                    <td>{student.lastName2}</td>
                    <td>{student.rut}</td>
                    <td>{student.password}</td>
                    <td>{student.status}</td>
                    <td>
                      <Button variant="warning"> <i className="fas fa-edit" style={{ color: 'white' }}></i></Button>
                      <Button variant="danger" onClick={() => handleDeleteStudent(student.id)}><i className="fas fa-trash"></i></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end mt-2">
            <Button variant="success" onClick={handleSaveStudents}>Guardar</Button>
            <button className="instituciones__btn instituciones__btn--secondary btn">Cancelar</button>
            </div>
          </>
        ) : (
          <>
          <div className="d-flex justify-content-center mt-2">
            <Button variant="primary" onClick={() => setShowModal(true)}>Agregar Manualmente</Button>
          </div>
          </>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
            <Modal.Title>Agregar Estudiante</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
                <Form.Group controlId="formFirstName">
                <Form.Label>Primer Nombre</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Ingresa el primer nombre" 
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                />
                </Form.Group>
                <Form.Group controlId="formLastName1">
                <Form.Label>Primer Apellido</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Ingresa el primer apellido" 
                    value={newStudent.lastName1}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName1: e.target.value })}
                />
                </Form.Group>
                <Form.Group controlId="formLastName2">
                <Form.Label>Segundo Apellido</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Ingresa el segundo apellido" 
                    value={newStudent.lastName2}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName2: e.target.value })}
                />
                </Form.Group>
                <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Ingresa el RUT" 
                    value={newStudent.rut}
                    onChange={(e) => setNewStudent({ ...newStudent, rut: e.target.value })}
                />
                </Form.Group>
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddStudent}>Agregar</Button>
            </Modal.Footer>
        </Modal>

        {/* <div className="instituciones__back text-center mt-4">
          <button className="instituciones__btn instituciones__btn--info btn" onClick={VolverHome}>
            <i className="fas fa-arrow-left"></i> Volver al Home
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default CargarEstudiantes;
