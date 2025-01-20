import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Dropdown, Button, Modal, Form, Spinner, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import '../styles/Usuarios.css';

const Usuarios = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [tipo, setTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    rol_id: '',
    contrasena: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState('activos');
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);
  const [isFiltered, setIsFiltered] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    // Limpiar todos los campos del nuevo usuario
    setNuevoUsuario({
      nombres: '',
      apellidos: '',
      rut: '',
      correo: '',
      rol_id: '',
      contrasena: ''
    });

    // Restablecer otros estados relacionados
    setShowPassword(false);

    // Cerrar el modal
    setModalOpen(false);
  };

  const goToPage = (page) => setCurrentPage(page);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  useEffect(() => {
    obtenerPersonal();
  }, [currentPage, tipo, searchTerm, estadoFiltro]);

  const generarContrasena = (rut) => {
    const symbols = '!#$%&*+?';
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `UCM${rut}${randomSymbol}`;
  };

  const obtenerRoles = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      if (error.response && error.response.status === 401) {
      }
    }
  };

  useEffect(() => {
    obtenerRoles();
  }, []);

  const obtenerPersonal = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: currentPage,
          limit,
          tipo,
          search: searchTerm,
          estado: estadoFiltro
        }
      });
      setUsuarios(response.data.usuarios);
      setTotalElements(response.data.total);
    } catch (error) {
      console.error('Error al obtener personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (e) => {
    const selectedTipo = e.target.value;
    setTipo(selectedTipo);
    setCurrentPage(1);
    setIsFiltered(selectedTipo !== '');
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsFiltered(newSearchTerm !== '');
  };

  const handleEstadoChange = (e) => {
    const newEstadoFiltro = e.target.value;
    setEstadoFiltro(newEstadoFiltro);
    setCurrentPage(1);
    setIsFiltered(newEstadoFiltro !== 'todos');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTipo('');
    setEstadoFiltro('todos');
    setCurrentPage(1);
    setIsFiltered(false);
    obtenerPersonal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validar que los nombres y apellidos no contengan números
    if (name === 'nombres' || name === 'apellidos') {
      // Permitir solo letras y espacios
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setNuevoUsuario(prev => ({ ...prev, [name]: cleanedValue }));
    } else if (name === 'rut') {
      // Permitir solo números y limitar a 8 dígitos
      const cleanedRut = value.replace(/\D/g, '').slice(0, 8);
      setNuevoUsuario(prev => ({ ...prev, rut: cleanedRut }));

      // Generar la contraseña automáticamente
      const contrasenaGenerada = generarContrasena(cleanedRut);
      setNuevoUsuario(prev => ({ ...prev, contrasena: contrasenaGenerada }));
    } else {
      // Para otros campos, simplemente actualizar el estado
      setNuevoUsuario({ ...nuevoUsuario, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si no hay contraseña, generar una automáticamente
      const contrasenaFinal = nuevoUsuario.contrasena ||
        generarContrasena(nuevoUsuario.rut);

      const token = getToken();
      await axios.post(`${process.env.REACT_APP_API_URL}/personal`, {
        ...nuevoUsuario,
        contrasena: contrasenaFinal
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Suponiendo que `contrasenaFinal` es la contraseña que deseas mostrar
      alert(`Usuario creado. RUT: ${nuevoUsuario.rut}, Contraseña: ${contrasenaFinal}`);

      setNuevoUsuario({
        nombres: '',
        apellidos: '',
        rut: '',
        correo: '',
        rol_id: '',
        contrasena: ''
      });

      // Restablecer otros estados relacionados
      setShowPassword(false);

      obtenerPersonal();
      handleModalClose();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      // Mostrar toast de error
      toast.error(
        error.response?.data?.error || 'Error al crear usuario. Por favor, intente nuevamente.',
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };


  const handleEdit = (usuarioId) => {
    setEditingId(usuarioId);
    setEditedFields({}); // Limpiar campos editados anteriormente
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedFields({});
  };

  const handleFieldChange = (usuarioId, field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async (usuarioId) => {
    try {
      const token = getToken();

      // Solo enviar los campos que fueron modificados
      if (Object.keys(editedFields).length === 0) {
        handleCancelEdit();
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/personal/${usuarioId}`,
        editedFields,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Actualizar la lista de usuarios
      obtenerPersonal();
      handleCancelEdit();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);

      // Mostrar toast de error
      toast.error(
        error.response?.data?.error || 'Error al actualizar el usuario. Por favor, intente nuevamente.',
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const VolverHome = () => {
    navigate('/home?component=agenda');
  };

  const enviarCredencialIndividual = async (usuario) => {
    try {
      const token = getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/personal/${usuario.id}/enviar-credencial`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(`Credenciales enviadas a ${usuario.nombres} ${usuario.apellidos}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error al enviar credenciales:', error);
      toast.error('No se pudieron enviar las credenciales', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCambioContrasena = (usuario) => {
    setSelectedUser(usuario);
    setNewPassword('');
    setPasswordError('');
    setPasswordModalOpen(true);
  };

  const validatePassword = (password) => {
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    if (!password) {
      return 'La contraseña es obligatoria';
    }
    if (!regexContrasena.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y tener entre 8 y 20 caracteres.';
    }
    return '';
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseña
    const error = validatePassword(newPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

    try {
      const token = getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/personal/${selectedUser.id}/cambiar-contrasena`,
        { nuevaContrasena: newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Contraseña cambiada exitosamente', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Cerrar modal
      setPasswordModalOpen(false);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);

      // Mostrar mensaje de error
      toast.error(
        error.response?.data?.error || 'No se pudo cambiar la contraseña',
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  return (
    <div className="usuarios">
      {/* Botón de volver al home */}
      <div className="instituciones__back">
        <button className="instituciones__btn--back" onClick={VolverHome}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>
      <h2 className="usuarios__title text-center font-weight-bold mb-4">Personal académico</h2>

      {/* Selector de tipo de usuario */}
      <div className="usuarios__controls d-flex justify-content-between mb-3">
        <select
          className="usuarios__select form-select col-2"
          style={{ width: '12%' }}
          value={tipo}
          onChange={handleTipoChange}
        >
          <option value="">Todos los tipos</option>
          {roles
            .filter(rol => rol.nombre !== 'Estudiante')
            .map(rol => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
        </select>

        <select
          className="usuarios__select form-select col-2" style={{ width: '14%' }}
          value={estadoFiltro}
          onChange={handleEstadoChange}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* Mostrar el botón de limpiar solo si hay filtros aplicados */}
        {isFiltered && (
          <button
            className="usuarios__btn usuarios__btn--secondary"
            onClick={handleClearSearch}
          >
            <i className="fas fa-eraser"></i> Limpiar
          </button>
        )}

        <button className="usuarios__btn usuarios__btn--primary" onClick={handleModalOpen}>
          <i className="fas fa-plus"></i> Añadir Usuario
        </button>
      </div>

      {/* Modal para añadir nuevo usuario */}
      {modalOpen && (
        <div className="usuarios-modal modal show" style={{ display: 'block' }}>
          <div className="usuarios-modal__dialog modal-dialog">
            <div className="usuarios-modal__content modal-content">
              <div className="usuarios-modal__header modal-header">
                <h5 className="usuarios-modal__title modal-title">Registrar Nuevo Usuario</h5>
                <button type="button" className="close" onClick={handleModalClose}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="usuarios-modal__body modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      name="nombres"
                      className="form-control"
                      placeholder="Ingrese nombre"
                      value={nuevoUsuario.nombres}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      className="form-control"
                      placeholder="Ingrese apellidos"
                      value={nuevoUsuario.apellidos}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>RUT (sin puntos, sin guión)</label>
                    <input
                      type="text"
                      name="rut"
                      className="form-control"
                      placeholder="Ingrese RUT sin puntos ni guión (máximo 8 dígitos)"
                      value={nuevoUsuario.rut}
                      onChange={handleInputChange}
                      required
                      pattern="\d{7,8}"
                      title="Ingrese RUT sin puntos ni guión (7-8 dígitos)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo</label>
                    <input
                      type="email"
                      name="correo"
                      className="form-control"
                      placeholder="Ingrese correo electrónico"
                      value={nuevoUsuario.correo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      name="rol_id"
                      className="form-control"
                      value={nuevoUsuario.rol_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione un rol</option>
                      {roles
                        .filter(rol => rol.nombre !== 'Estudiante')
                        .map(rol => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="contrasena"
                        className="form-control"
                        value={nuevoUsuario.contrasena}
                        onChange={(e) => {
                          setNuevoUsuario(prev => ({ ...prev, contrasena: e.target.value }));
                        }}
                        placeholder="Contraseña generada automáticamente o personalizada"
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            // Generar contraseña automáticamente cuando se hace clic
                            const contrasenaGenerada = generarContrasena(nuevoUsuario.rut || '12345');
                            setNuevoUsuario(prev => ({ ...prev, contrasena: contrasenaGenerada }));
                          }}
                        >
                          <i className="fas fa-sync"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Puede generar una contraseña automática o escribir una personalizada
                    </small>
                  </div>
                  <button
                    type="submit"
                    className="usuarios__btn usuarios__btn--success mt-3"
                    disabled={!nuevoUsuario.nombres || !nuevoUsuario.apellidos || !nuevoUsuario.rut || !nuevoUsuario.correo || !nuevoUsuario.rol_id}
                  >
                    <i className="fas fa-save me-2"></i>Registrar Usuario
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="usuarios__card">
          <div>
            <table className="usuarios__table table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>RUT</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      {editingId === usuario.id ? (
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={usuario.nombres}
                          onChange={(e) => handleFieldChange(usuario.id, 'nombres', e.target.value)}
                        />
                      ) : (
                        usuario.nombres
                      )}
                    </td>
                    <td>
                      {editingId === usuario.id ? (
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={usuario.apellidos}
                          onChange={(e) => handleFieldChange(usuario.id, 'apellidos', e.target.value)}
                        />
                      ) : (
                        usuario.apellidos
                      )}
                    </td>
                    <td>{usuario.rut}</td> {/* El RUT no se puede editar */}
                    <td>
                      {editingId === usuario.id ? (
                        <input
                          type="email"
                          className="form-control"
                          defaultValue={usuario.correo}
                          onChange={(e) => handleFieldChange(usuario.id, 'correo', e.target.value)}
                        />
                      ) : (
                        usuario.correo
                      )}
                    </td>
                    <td>
                      {editingId === usuario.id ? (
                        <select
                          className="form-control"
                          defaultValue={usuario.rol_id}
                          onChange={(e) => handleFieldChange(usuario.id, 'rol_id', e.target.value)}
                        >
                          {roles
                            .filter(rol => rol.nombre !== 'Estudiante')
                            .map(rol => (
                              <option key={rol.id} value={rol.id}>
                                {rol.nombre}
                              </option>
                            ))}
                        </select>
                      ) : (
                        roles.find(rol => rol.id === usuario.rol_id)?.nombre
                      )}
                    </td>
                    <td>
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`customSwitch${usuario.id}`}
                          checked={editingId === usuario.id ? editedFields.estado ?? usuario.estado : usuario.estado}
                          onChange={(e) => {
                            if (editingId === usuario.id) {
                              handleFieldChange(usuario.id, 'estado', e.target.checked);
                            }
                          }}
                          disabled={editingId !== usuario.id}
                        />
                        <label className="custom-control-label" htmlFor={`customSwitch${usuario.id}`}>
                          {editingId === usuario.id ? (editedFields.estado ?? usuario.estado ? 'Activo' : 'Inactivo') : (usuario.estado ? 'Activo' : 'Inactivo')}
                        </label>
                      </div>
                    </td>
                    <td>
                      {editingId === usuario.id ? (
                        <div className="d-flex">
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleSaveChanges(usuario.id)}
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
                          <Dropdown.Toggle variant="secondary" id={`dropdown-${usuario.id}`}>
                            Acciones
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleEdit(usuario.id)}
                            >
                              <i className="fas fa-edit me-2"></i>Editar
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleCambioContrasena(usuario)}
                            >
                              <i className="fas fa-key me-2"></i>Cambiar Contraseña
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => enviarCredencialIndividual(usuario)}
                            >
                              <i className="fas fa-envelope me-2"></i>Enviar Credencial
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="usuarios__pagination d-flex justify-content-between align-items-center mb-3">
        <Pagination size="sm" className="m-0 mb-2 mb-md-0">
          <Pagination.Prev
            disabled={isFirstPage}
            onClick={() => !isFirstPage && setCurrentPage(currentPage - 1)}
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
            disabled={isLastPage}
            onClick={() => !isLastPage && setCurrentPage(currentPage + 1)}
          />
        </Pagination>

        {/* Botones de guardar y volver
        <div className="usuarios__actions">
          <button className="usuarios__btn usuarios__btn--success btn me-2">Guardar Cambios</button>
          <button className="usuarios__btn usuarios__btn--secondary btn">Cancelar</button>
        </div> */}
      </div>
      {selectedUser && (
        <Modal show={passwordModalOpen} onHide={() => setPasswordModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cambiar Contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleChangePasswordSubmit}>
              <Form.Group>
                <Form.Label>
                  Nueva Contraseña para {selectedUser.nombres} {selectedUser.apellidos}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Ingrese nueva contraseña"
                />
                {passwordError && (
                  <Form.Text className="text-danger">
                    {passwordError}
                  </Form.Text>
                )}
                <Form.Text className="text-muted">
                  La contraseña debe contener:
                  <ul className="mb-0">
                    <li>Entre 8 y 20 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos un número</li>
                  </ul>
                </Form.Text>
              </Form.Group>
              <div className="text-end mt-3">
                <Button variant="secondary" className="me-2" onClick={() => setPasswordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Cambiar Contraseña
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

    </div>
  );
};

export default Usuarios;
