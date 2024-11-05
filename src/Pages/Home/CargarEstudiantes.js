import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Alert } from 'react-bootstrap'; 
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './CargarEstudiantes.css';

const CargarEstudiantes = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [failedStudents, setFailedStudents] = useState(new Set()); // Agregamos este estado
  const [newStudent, setNewStudent] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    contrasena: '',
    estado: 'Activo',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);

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
          const formattedRut = student['RUT'] ? student['RUT'].replace(/\D/g, '') : '';          
          const symbols = '!#$%&*+?';
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          
          const contrasena = `UCM${formattedRut}${randomSymbol}`;
  
          return {
            id: index + 1,
            nombres: student['Nombres'] || '',
            apellidos: student['Apellidos'] || '',
            rut: formattedRut,
            correo: student['Correo'] || '',
            contrasena: contrasena,
            debe_cambiar_contrasena: true,
            estado: 'Activo',
            contador_registros: 0,
            anos_cursados: year,
            semestre: semester,
            rol_id: 3,
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
    if (newStudent.nombres && newStudent.apellidos && newStudent.rut && newStudent.correo) {
      // Asegurarse de que el RUT tenga el formato correcto
      const formattedRut = newStudent.rut.replace(/\D/g, '');
      const symbols = '!#$%&*+?';
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const contrasena = `UCM${formattedRut}${randomSymbol}`;
  
      if (newStudent.id) {
        // Edición
        const updatedStudents = students.map(student =>
          student.id === newStudent.id ? 
          { ...newStudent, rut: formattedRut, contrasena } : 
          student
        );
        setStudents(updatedStudents);
        
        // Actualizar failedStudents
        setFailedStudents(prevFailedStudents => {
          const newFailedStudents = new Set(prevFailedStudents);
          newFailedStudents.delete(formattedRut);
          return newFailedStudents;
        });
      } else {
        // Nuevo estudiante
        const updatedNewStudent = {
          ...newStudent,
          id: students.length + 1,
          rut: formattedRut,
          contrasena,
          debe_cambiar_contrasena: true,
          estado: 'Activo',
          contador_registros: 0,
          anos_cursados: year,
          semestre: semester,
          rol_id: 3,
        };
        setStudents([...students, updatedNewStudent]);
      }
  
      setNewStudent({
        nombres: '',
        apellidos: '',
        rut: '',
        correo: '',
        contrasena: '',
        estado: 'Activo',
      });
      setShowModal(false);
      setAlertMessage('Estudiante ' + (newStudent.id ? 'actualizado' : 'agregado') + ' con éxito. Por favor, haga clic en "Ingresar" para volver a intentar la carga.');
    } else {
      setAlertMessage('Por favor, completa todos los campos requeridos.');
    }
  };

  const handleSaveStudents = async () => {
    try {
        // Primero, verificar duplicados internos
        const rutCounts = {};
        students.forEach(student => {
            rutCounts[student.rut] = (rutCounts[student.rut] || 0) + 1;
        });

        const duplicadosInternos = Object.entries(rutCounts)
            .filter(([_, count]) => count > 1)
            .map(([rut]) => rut);

        if (duplicadosInternos.length > 0) {
            const duplicadosInfo = duplicadosInternos.map(rut => {
                const estudiantesConRut = students.filter(s => s.rut === rut);
                return estudiantesConRut.map(e => `${rut} (${e.nombres} ${e.apellidos})`);
            }).flat();

            setAlertMessage(
                <div>
                    <p className="text-danger">Se encontraron RUTs duplicados:</p>
                    <ul>
                        {duplicadosInfo.map((info, index) => (
                            <li key={index}>{info}</li>
                        ))}
                    </ul>
                    <p>Por favor, corrija los RUTs duplicados y luego haga clic en el botón "Ingresar" para volver a intentar la carga.</p>
                </div>
            );

            // Marcar los estudiantes con RUTs duplicados
            setFailedStudents(new Set(duplicadosInternos));
            return;
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/estudiantes/carga-masiva`,
            students,
            {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.errores && response.data.errores.length > 0) {
            let errorMessage = '';
            let existentesEnBD = [];

            response.data.errores.forEach(error => {
                const estudiante = students.find(s => s.rut === error.rut);
                existentesEnBD.push(`${error.rut} (${estudiante?.nombres} ${estudiante?.apellidos})`);
            });

            setAlertMessage(
                <div>
                    <p className="text-danger">No se pudo completar la carga:</p>
                    <p>RUTs que ya existen en la base de datos:</p>
                    <ul>
                        {existentesEnBD.map((info, index) => (
                            <li key={index}>{info}</li>
                        ))}
                    </ul>
                    <p>Por favor, corrija los RUTs existentes y vuelva a intentar.</p>
                </div>
            );

            // Marcar los estudiantes con error
            const failedRuts = new Set(response.data.errores.map(error => error.rut));
            setFailedStudents(failedRuts);

        } else {
            setAlertMessage(
                <div>
                    <p>✅ ¡Estudiantes cargados exitosamente!</p>
                    <p>Total de estudiantes procesados: {response.data.exitosos}</p>
                </div>
            );
            setStudents([]);
            setFailedStudents(new Set());
        }

      } catch (error) {
        console.error('Error al guardar estudiantes:', error);
        setAlertMessage(
            <div className="text-danger">
                <p>❌ Error al guardar los estudiantes:</p>
                <p>{error.response?.data?.error || error.message}</p>
                <p>Por favor, revise los datos y vuelva a intentarlo.</p>
                <Button variant="primary" onClick={handleSaveStudents}>Ingresar</Button>
            </div>
        );
    }
};

const handleEditStudent = (student) => {
  setNewStudent(student);
  setShowModal(true);
};

const handleDeleteStudent = (id) => {
  const updatedStudents = students.filter((student) => student.id !== id);
  setStudents(updatedStudents);
  setAlertMessage('Estudiante eliminado.');
};

const handleCancel = () => {
  setStudents([]);
  setFailedStudents(new Set());
  setAlertMessage('');
  // Resetear el input de archivo
  const fileInput = document.getElementById('excelFile');
  if (fileInput) {
    fileInput.value = '';
  }
};

  return (
    <div className="cargar-estudiantes">
      <div className="container mt-4">
        <h2 className="mb-4">Cargar Estudiantes</h2>        
        <div className="card card-primary mb-4">
          <div className="card-header">
            <h3 className="card-title">Seleccionar Año y Semestre</h3>
          </div>
          <div className="card-body">
            <Form.Group controlId="formYear">
              <Form.Label>Año</Form.Label>
              <Form.Control 
                type="number" 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </Form.Group>
            <Form.Group controlId="formSemester">
              <Form.Label>Semestre</Form.Label>
              <Form.Control 
                as="select"
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </Form.Control>
            </Form.Group>
          </div>
        </div>

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
              <i className="fas fa-exclamation-triangle"></i> <strong>Importante:</strong> La plantilla debe contener: RUT, Nombres, Apellidos y Correo.
            </div>
          </div>
        </div>


        {students.length > 0 ? (
          <>
            <div className="mb-3">
              <Button variant="danger" className="ml-2" onClick={handleClearStudents}>Limpiar</Button>
              <Button variant="primary" onClick={() => setShowModal(true)} className="ml-2">Agregar Manualmente</Button>
            </div>
            {alertMessage && <Alert variant="info">{alertMessage}</Alert>}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RUT</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Contraseña</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const hasError = failedStudents.has(student.rut);
                  return (
                    <tr 
                      key={student.id}
                      className={hasError ? 'table-danger' : 'table-success'}
                    >
                      <td>{student.id}</td>
                      <td>{student.rut}</td>
                      <td>{student.nombres}</td>
                      <td>{student.apellidos}</td>
                      <td>{student.correo}</td>
                      <td>{student.contrasena}</td>
                      <td>
                        {hasError ? 
                          <span className="text-danger">Error</span> : 
                          <span className="text-success">Cargado</span>
                        }
                      </td>
                      <td>
                        <Button 
                          variant="warning" 
                          onClick={() => handleEditStudent(student)}
                          className="mr-2"
                        >
                          <i className="fas fa-edit" style={{ color: 'white' }}></i>
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end mt-2">
              <Button variant="success" onClick={handleSaveStudents}>Ingresar</Button>
              <Button variant="secondary" onClick={handleCancel} className="ml-2">Cancelar</Button>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-center mt-2">
            <Button variant="primary" onClick={() => setShowModal(true)}>Agregar Manualmente</Button>
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Estudiante</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingresa el RUT" 
                  value={newStudent.rut}
                  onChange={(e) => setNewStudent({ ...newStudent, rut: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formNombres">
                <Form.Label>Nombres</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingresa los nombres" 
                  value={newStudent.nombres}
                  onChange={(e) => setNewStudent({ ...newStudent, nombres: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formApellidos">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ingresa los apellidos" 
                  value={newStudent.apellidos}
                  onChange={(e) => setNewStudent({ ...newStudent, apellidos: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formCorreo">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Ingresa el correo electrónico" 
                  value={newStudent.correo}
                  onChange={(e) => setNewStudent({ ...newStudent, correo: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddStudent}>Agregar</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CargarEstudiantes;