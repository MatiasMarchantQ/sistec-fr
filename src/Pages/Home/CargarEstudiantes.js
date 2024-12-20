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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      toast.warning('Por favor, seleccione un archivo.');
      return;
    }
  
    if (!file.type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel')) {
      toast.warning('Por favor, seleccione un archivo Excel válido (.xlsx o .xls).');
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
        const processedStudents = jsonData.map((student, index) => {
          const formattedRut = processRUT(student['RUT']);
          const correo = student['Correo'] || '';
  
          // Rastrear duplicados de RUT
          if (!duplicates.rut[formattedRut]) {
            duplicates.rut[formattedRut] = [];
          }
          duplicates.rut[formattedRut].push({
            index,
            nombres: student['Nombres'],
            apellidos: student['Apellidos'],
            correo: correo
          });
  
          // Rastrear duplicados de correo
          if (!duplicates.correo[correo]) {
            duplicates.correo[correo] = [];
          }
          duplicates.correo[correo].push({
            index,
            rut: formattedRut,
            nombres: student['Nombres'],
            apellidos: student['Apellidos']
          });
  
          const symbols = '!#$%&*+?';
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          
          const contrasena = `UCM${formattedRut}${randomSymbol}`;
  
          return {
            id: index + 1,
            nombres: student['Nombres'] || '',
            apellidos: student['Apellidos'] || '',
            rut: formattedRut,
            correo: correo,
            contrasena: contrasena,
            debe_cambiar_contrasena: true,
            estado: 'Activo',
            contador_registros: 0,
            anos_cursados: year.toString(),
            rol_id: 3,
          };
        });
  
        // Filtrar duplicados reales
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
          return;
        }
  
        // Si no hay duplicados, cargar normalmente
        setStudents(processedStudents);
        toast.success('Estudiantes cargados con éxito!');
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        toast.error('Error al cargar estudiantes: ' + error.message);
      }
    };
  
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      setAlertMessage('Error al leer el archivo. Por favor, intente nuevamente.');
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
        // Verificar duplicados considerando RUT y correo
        const rutCorreoCombinations = {};
        students.forEach(student => {
            const key = `${student.rut}-${student.correo}`;
            rutCorreoCombinations[key] = (rutCorreoCombinations[key] || 0) + 1;
        });

        const duplicadosInternos = Object.entries(rutCorreoCombinations)
            .filter(([_, count]) => count > 1)
            .map(([key]) => key);

        if (duplicadosInternos.length > 0) {
            const duplicadosInfo = duplicadosInternos.map(key => {
                const [rut, correo] = key.split('-');
                const estudiantesConRutCorreo = students.filter(
                    s => s.rut === rut && s.correo === correo
                );
                return estudiantesConRutCorreo.map(
                    e => `RUT: ${rut}, Correo: ${correo} (${e.nombres} ${e.apellidos})`
                );
            }).flat();

            toast.error('Se encontraron estudiantes duplicados');
            setAlertMessage(
                <div>
                    <p className="text-danger">Se encontraron estudiantes duplicados:</p>
                    <ul>
                        {duplicadosInfo.map((info, index) => (
                            <li key={index}>{info}</li>
                        ))}
                    </ul>
                    <p>Por favor, corrija los estudiantes duplicados y luego haga clic en el botón "Ingresar" para volver a intentar la carga.</p>
                </div>
            );

            const rutsDuplicados = duplicadosInternos.map(key => key.split('-')[0]);
            setFailedStudents(new Set(rutsDuplicados));
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

        // Crear resumen de resultados
        const resumen = {
            nuevos: [],
            actualizados: [],
            errores: []
        };

        response.data.resultados?.forEach(resultado => {
            const estudiante = students.find(s => s.rut === resultado.rut);
            if (resultado.mensaje.includes('creado')) {
                resumen.nuevos.push(`${resultado.rut} (${estudiante?.nombres} ${estudiante?.apellidos})`);
            } else if (resultado.mensaje.includes('actualizado')) {
                resumen.actualizados.push(`${resultado.rut} (${estudiante?.nombres} ${estudiante?.apellidos})`);
            }
        });

        response.data.errores?.forEach(error => {
            const estudiante = students.find(s => s.rut === error.rut);
            resumen.errores.push(`${error.rut} (${estudiante?.nombres} ${estudiante?.apellidos})`);
        });

        // Mostrar toasts de resumen
        if (resumen.nuevos.length > 0) {
            toast.success(`Estudiantes nuevos (${resumen.nuevos.length}):
                ${resumen.nuevos.join(', ')}`, 
                { autoClose: false }
            );
        }

        if (resumen.errores.length > 0) {
            toast.error(`Errores al cargar estudiantes (${resumen.errores.length}):
                ${resumen.errores.join(', ')}`, 
                { autoClose: false }
            );
        }

        // Configurar el mensaje de alerta
        setAlertMessage(
            <div>
                <h4>Resumen de la carga:</h4>
                {resumen.nuevos.length > 0 && (
                    <div>
                        <p>Estudiantes nuevos ({resumen.nuevos.length}):</p>
                        <ul>
                            {resumen.nuevos.map((estudiante, index) => (
                                <li key={index}>{estudiante}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {resumen.actualizados.length > 0 && (
                    <div>
                        <p>Estudiantes actualizados ({resumen.actualizados.length}):</p>
                        <ul>
                            {resumen.actualizados.map((estudiante, index) => (
                                <li key={index}>{estudiante}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {resumen.errores.length > 0 && (
                    <div className="text-danger">
                        <p>Errores al cargar ({resumen.errores.length}):</p>
                        <ul>
                            {resumen.errores.map((estudiante, index) => (
                                <li key={index}>{estudiante}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );

        // Limpiar o manejar estudiantes con errores
        if (resumen.errores.length === 0) {
            toast.success('Todos los estudiantes fueron cargados exitosamente');
            setStudents([]);
            setFailedStudents(new Set());
        } else {
            setFailedStudents(new Set(response.data.errores.map(error => error.rut)));
        }

    } catch (error) {
        console.error('Error al guardar estudiantes:', error);
        
        // Toast de error genérico
        toast.error('Error al guardar los estudiantes');

        // Mensaje de alerta detallado
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
        <div className="card card-primary mb-4">
          <div className="card-header">
            <h3 className="card-title">Seleccionar Año</h3>
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
                  <th>Año a cursar</th>
                  <th>Contraseña</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {students.map((student) => {
                    const hasError = failedStudents.has(student.rut) || student.hasError;
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
                      <td>{student.anos_cursados}</td>
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

        <Modal show={showModal}     onHide={handleCloseModal}>
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