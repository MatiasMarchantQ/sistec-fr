import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
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
  const [studentsWithErrors, setStudentsWithErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10); // Cambia este valor según lo que necesites

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
  
    // Guardamos una referencia al input para limpiarlo después
    const fileInput = event.target;
  
    if (!file) {
      toast.warning('Por favor, seleccione un archivo.');
      return;
    }
  
    if (!file.type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel')) {
      toast.warning('Por favor, seleccione un archivo Excel válido (.xlsx o .xls).');
      fileInput.value = ''; // Limpiar el input después de la validación
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
  
        // Limpiar el estado de estudiantes y errores antes de cargar nuevos datos
        setStudents([]);
        setFailedStudents(new Set());
        setStudentsWithErrors([]);
        setAlertMessage(null); // Limpiar mensaje de alerta anterior
  
        // Normalizar los nombres de los campos
        const normalizedFields = jsonData.map(row => {
          return Object.keys(row).reduce((acc, key) => {
            acc[key.trim().toLowerCase()] = row[key];
            return acc;
          }, {});
        });
  
        // Verificar que los campos requeridos existan
        const requiredFields = ['rut', 'nombres', 'apellidos', 'correo'];
        const invalidRows = normalizedFields.filter((row, index) => {
          return requiredFields.some(field => !row[field] || row[field].toString().trim() === '');
        });
  
        if (invalidRows.length > 0) {
          const errorMessage = `Las siguientes filas tienen campos requeridos vacíos: ${invalidRows.map((_, index) => index + 1).join(', ')}`;
          setStudentsWithErrors(invalidRows);
          toast.error(errorMessage);
          fileInput.value = ''; // Limpiar el input después del error
          return;
        }
  
        // Detectar duplicados
        const duplicates = {
          rut: {},
          correo: {}
        };
  
        const processRUT = (rut) => {
          if (rut == null) return '';
          const rutString = String(rut).trim();
          if (!rutString) return '';
          const cleanRut = rutString.replace(/[^\d-]/g, '');
          return cleanRut.includes('-')
            ? cleanRut.split('-')[0].replace(/\D/g, '')
            : cleanRut.replace(/\D/g, '');
        };
  
        // Primer paso: identificar duplicados
        const processedStudents = normalizedFields.map((student, index) => {
          const formattedRut = processRUT(student['rut']);
          const correo = student['correo'] ? student['correo'].toString().trim() : '';
  
          // Rastrear duplicados de RUT
          if (!duplicates.rut[formattedRut]) {
            duplicates.rut[formattedRut] = [];
          }
          duplicates.rut[formattedRut].push({
            index,
            nombres: student['nombres'],
            apellidos: student['apellidos'],
            correo: correo
          });
  
          // Rastrear duplicados de correo
          if (!duplicates.correo[correo]) {
            duplicates.correo[correo] = [];
          }
          duplicates.correo[correo].push({
            index,
            rut: formattedRut,
            nombres: student['nombres'],
            apellidos: student['apellidos']
          });
  
          const symbols = '!#$%&*+?';
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  
          const contrasena = `UCM${formattedRut}${randomSymbol}`;
  
          return {
            id: index + 1,
            nombres: student['nombres'] || '',
            apellidos: student['apellidos'] || '',
            rut: formattedRut,
            correo: correo,
            contrasena: contrasena,
            debe_cambiar_contrasena: true,
            estado: 'Activo',
            contador_registros: 0,
            anos_cursados: year.toString(),
            rol_id: 3,
            hasError: false // Inicialmente sin errores
          };
        });
  
        // Filtrar duplicados
        const rutDuplicates = Object.entries(duplicates.rut)
          .filter(([_, entries]) => entries.length > 1)
          .map(([rut, entries]) => ({ rut, entries }));
  
        const correoDuplicates = Object.entries(duplicates.correo)
          .filter(([correo, entries]) => entries.length > 1 && correo !== '')
          .map(([correo, entries]) => ({ correo, entries }));
  
        // Si hay duplicados, mostrar alerta
        if (rutDuplicates.length > 0 || correoDuplicates.length > 0) {
          const duplicateMessage = (
            <div>
              {rutDuplicates.length > 0 && (
                <>
                  <p className="text-danger">Duplicados de RUT encontrados:</p>
                  <ul>
                    {rutDuplicates.map(({ rut, entries }) => (
                      <li key={rut}>
                        RUT {rut}:
                        <ul>
                          {entries.map((entry, idx) => (
                            <li key={idx}>
                              {entry.nombres} {entry.apellidos} (Correo: {entry.correo})
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              )}
  
              {correoDuplicates.length > 0 && (
                <>
                  <p className="text-danger">Duplicados de Correo encontrados:</p>
                  <ul>
                    {correoDuplicates.map(({ correo, entries }) => (
                      <li key={correo}>
                        Correo {correo}:
                        <ul>
                          {entries.map((entry, idx) => (
                            <li key={idx}>
                              {entry.nombres} {entry.apellidos} (RUT: {entry.rut})
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p>Por favor, revise y corrija los duplicados antes de cargar.</p>
            </div>
          );
  
          setAlertMessage(duplicateMessage);
  
          // Marcar estudiantes con duplicados
          const rutsDuplicados = new Set(rutDuplicates.flatMap(d =>
            d.entries.map(entry => entry.rut)
          ));
          const correosDuplicados = new Set(correoDuplicates.flatMap(d =>
            d.entries.map(entry => entry.correo)
          ));
  
          const studentsWithErrors = processedStudents.map(student => ({
            ...student,
            hasError: rutsDuplicados.has(student.rut) || correosDuplicados.has(student.correo)
          }));
  
          setStudents(studentsWithErrors);
          setFailedStudents(new Set([...rutsDuplicados, ...correosDuplicados]));
          fileInput.value = ''; // Limpiar el input después de procesar duplicados
          return;
        }
  
        // Si no hay duplicados, cargar normalmente
        setStudents(processedStudents);
        setStudentsWithErrors([]);
        toast.success('Estudiantes cargados con éxito!');
        fileInput.value = ''; // Limpiar el input después de cargar exitosamente
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        toast.error('Error al cargar estudiantes: ' + error.message);
        fileInput.value = ''; // Limpiar el input después de un error
      }
    };

    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      setAlertMessage('Error al leer el archivo. Por favor, intente nuevamente.');
      fileInput.value = ''; // Limpiar el input después de un error de lectura
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCloseModal = () => {
    // Resetear el estado del nuevo estudiante
    setNewStudent({
      nombres: '',
      apellidos: '',
      rut: '',
      correo: '',
      contrasena: '',
      estado: 'Activo',
    });

    // Cerrar el modal
    setShowModal(false);
  };

  const handleClearStudents = () => {
    setStudents([]);
    setFailedStudents(new Set());
    setStudentsWithErrors([]);
    setAlertMessage('');
    toast.success('Tabla limpiada');
  };

  const handleAddStudent = () => {
    // Validaciones adicionales
    const rutRegex = /^\d{7,8}$/;
    const nombreApellidoRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!rutRegex.test(newStudent.rut)) {
      toast.error('RUT debe contener solo 7 u 8 dígitos');
      return;
    }

    if (!nombreApellidoRegex.test(newStudent.nombres)) {
      toast.error('Nombres solo pueden contener letras');
      return;
    }

    if (!nombreApellidoRegex.test(newStudent.apellidos)) {
      toast.error('Apellidos solo pueden contener letras');
      return;
    }

    if (!correoRegex.test(newStudent.correo)) {
      toast.error('Correo electrónico no es válido');
      return;
    }

    if (newStudent.nombres && newStudent.apellidos && newStudent.rut && newStudent.correo) {
      const formattedRut = newStudent.rut;

      const symbols = '!#$%&*+?';
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const contrasena = `UCM${formattedRut}${randomSymbol}`;

      if (newStudent.id) {
        // Edición
        const updatedStudents = students.map(student =>
          student.id === newStudent.id ?
            { ...newStudent, rut: formattedRut, contrasena, anos_cursados: year.toString() } :
            student
        );
        setStudents(updatedStudents);

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
          anos_cursados: year.toString(),
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
      toast.success('Estudiante ' + (newStudent.id ? 'actualizado' : 'agregado') + ' con éxito. Por favor, haga clic en "Ingresar" para volver a intentar la carga.');
    } else {
      toast.error('Por favor, completa todos los campos requeridos.');
    }
  };

  const handleSaveStudents = async () => {
    try {
      // Verificar duplicados por RUT y por correo separadamente
      const rutMap = new Map();
      const correoMap = new Map();
      const duplicados = {
        rut: [],
        correo: []
      };
  
      // Buscar duplicados
      students.forEach((student, index) => {
        // Verificar RUT duplicado
        if (rutMap.has(student.rut)) {
          const duplicadoExistente = duplicados.rut.find(d => d.rut === student.rut);
          if (duplicadoExistente) {
            duplicadoExistente.estudiantes.push({ ...student, fila: index + 1 });
          } else {
            duplicados.rut.push({
              rut: student.rut,
              estudiantes: [
                { ...students[rutMap.get(student.rut)], fila: rutMap.get(student.rut) + 1 },
                { ...student, fila: index + 1 }
              ]
            });
          }
        } else {
          rutMap.set(student.rut, index);
        }
  
        // Verificar correo duplicado
        if (correoMap.has(student.correo)) {
          const duplicadoExistente = duplicados.correo.find(d => d.correo === student.correo);
          if (duplicadoExistente) {
            duplicadoExistente.estudiantes.push({ ...student, fila: index + 1 });
          } else {
            duplicados.correo.push({
              correo: student.correo,
              estudiantes: [
                { ...students[correoMap.get(student.correo)], fila: correoMap.get(student.correo) + 1 },
                { ...student, fila: index + 1 }
              ]
            });
          }
        } else {
          correoMap.set(student.correo, index);
        }
      });
  
      // Si hay duplicados, mostrar mensaje y detener el proceso
      if (duplicados.rut.length > 0 || duplicados.correo.length > 0) {
        toast.error('Se encontraron estudiantes duplicados en el archivo');
  
        setAlertMessage(
                <div>
                    <p className="text-danger">Se encontraron estudiantes duplicados:</p>
                    <ul>
                        {duplicados.map((info, index) => (
                            <li key={index}>{info}</li>
                        ))}
                    </ul>
                    <p>Por favor, corrija los estudiantes duplicados y luego haga clic en el botón "Ingresar" para volver a intentar la carga.</p>
                </div>
            );
  
        // Marcar estudiantes duplicados como fallidos
        const rutsFallidos = new Set(duplicados.rut.flatMap(d => 
          d.estudiantes.map(e => e.rut)
        ));
        const correosFallidos = new Set(duplicados.correo.flatMap(d => 
          d.estudiantes.map(e => e.rut)
        ));
        setFailedStudents(new Set([...rutsFallidos, ...correosFallidos]));
        return;
      }
  
      // Si no hay duplicados, proceder con la carga
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
 
      // Aquí utilizamos el resumen que viene en la respuesta
      const resumen = response.data.resumen; // Esto es un string
  
      // Mostrar resumen
      setAlertMessage(
        <div>
          <h4 className="mb-4">Resumen de la carga:</h4>
          {response.data.errores.length === 0 ? (
            <div className ="alert alert-success">
              <p>{resumen}</p><br/>
              Todos los estudiantes fueron cargados exitosamente.
            </div>
          ) : (
            <div className="alert alert-warning">
              Por favor, corrija los errores y vuelva a intentar la carga de los estudiantes que fallaron.
            </div>
          )}
        </div>
      );
  
      // Actualizar estado final
      if (response.data.errores.length === 0) {
        setStudents([]);
        setFailedStudents(new Set());
        toast.success('Carga masiva completada exitosamente');
      } else {
        setFailedStudents(new Set(response.data.errores.map(e => e.rut)));
        toast.error(`${response.data.errores.length} estudiantes no pudieron ser cargados`);
      }
  
    } catch (error) {
      console.error('Error al guardar estudiantes:', error);
      
      toast.error('Error al procesar la carga de estudiantes');
      
      setAlertMessage(
        <div className="alert alert-danger">
          <h5>❌ Error al procesar la carga:</h5>
          <p>{error.response?.data?.error || error.message}</p>
          <p>Por favor, revise los datos y vuelva a intentarlo.</p>
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

  // Paginación
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(students.length / studentsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="cargar-estudiantes">
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
      <div className="container mt-4">
        <h2 className="mb-4">Cargar Estudiantes</h2>
        <div className="card card-primary">
          <div className="card-header">
            <h3 className="card-title">Cargar archivo Excel</h3>
          </div>
          <div className="card-footer">
            <div className="alert alert-warning mt-1 mb-0">
              <i className="fas fa-exclamation-triangle"></i> <strong>Importante:</strong> La plantilla debe contener: RUT, Nombres, Apellidos y Correo.
            </div>
          </div>
          <div className="card-body">
            <Form.Group controlId="formYear">
              <Form.Label>Seleccionar Año</Form.Label>
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </Form.Group>
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
        </div>
        {alertMessage && <Alert variant="info">{alertMessage}</Alert>}
        {students.length > 0 ? (
          <>
            <div className="mb-3">
              <Button variant="danger" className="ml-2" onClick={handleClearStudents}>Limpiar</Button>
              <Button variant="primary" onClick={() => setShowModal(true)} className="ml-2">Agregar Manualmente</Button>
            </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RUT</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Año a cursar</th>
                  <th>Contraseña</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
  {currentStudents.map((student) => {
    const hasError = failedStudents.has(student.rut) || student.hasError;
    return (
      <tr key={student.id} className={hasError ? 'table-danger' : 'table-success'}>
        <td>{student.id}</td>
        <td>{student.rut}</td>
        <td>{student.nombres}</td>
        <td>{student.apellidos}</td>
        <td>{student.correo}</td>
        <td>{student.anos_cursados}</td>
        <td>{student.contrasena}</td>
        <td>{hasError ? <span className="text-danger">Error</span> : <span className="text-success">Cargado</span>}</td>
        <td>
          <Button variant="warning" onClick={() => handleEditStudent(student)} className="mr-2">
            <i className="fas fa-edit" style={{ color: 'white' }}></i>
          </Button>
          <Button variant="danger" onClick={() => handleDeleteStudent(student.id)}>
            <i className="fas fa-trash"></i>
          </Button>
        </td>
      </tr>
    );
  })}
</tbody>
            </Table>
            <nav>
              <ul className="pagination">
                {pageNumbers.map(number => (
                  <li key={number} className="page-item">
                    <button onClick={() => paginate(number)} className="page-link">
                      {number}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
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

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Estudiante</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el RUT sin puntos ni guión"
                  value={newStudent.rut}
                  onChange={(e) => {
                    // Eliminar cualquier punto o guión y solo permitir números
                    const cleanRut = e.target.value.replace(/[.-]/g, '');
                    setNewStudent({ ...newStudent, rut: cleanRut });
                  }}
                  pattern="\d{7,8}"
                  maxLength="8"
                  required
                />
                <Form.Text className="text-muted">
                  Ingrese RUT sin puntos ni guión (ej: 12345678)
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formNombres">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa los nombres"
                  value={newStudent.nombres}
                  onChange={(e) => setNewStudent({ ...newStudent, nombres: e.target.value })}
                  required
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                />
                <Form.Text className="text-muted">
                  Solo se permiten letras y espacios
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formApellidos">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa los apellidos"
                  value={newStudent.apellidos}
                  onChange={(e) => setNewStudent({ ...newStudent, apellidos: e.target.value })}
                  required
                  pattern="[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+"
                />
                <Form.Text className="text-muted">
                  Solo se permiten letras y espacios
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formCorreo">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingresa el correo electrónico"
                  value={newStudent.correo}
                  onChange={(e) => setNewStudent({ ...newStudent, correo: e.target.value.toLowerCase() })}
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <Form.Text className="text-muted">
                  Ingrese un correo electrónico válido
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleAddStudent}
              disabled={
                !newStudent.rut ||
                !newStudent.nombres ||
                !newStudent.apellidos ||
                !newStudent.correo
              }
            >
              Agregar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CargarEstudiantes;