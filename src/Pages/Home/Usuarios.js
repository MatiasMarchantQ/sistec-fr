import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Usuarios.css';

const Usuarios = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
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

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const goToPage = (page) => setCurrentPage(page);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  useEffect(() => {
    obtenerPersonal();
  }, [currentPage, tipo, searchTerm]);

  useEffect(() => {
    obtenerPersonal();
  }, [currentPage, tipo, searchTerm, estadoFiltro]);

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
        console.log('Sesión expirada o token inválido');
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
          estado: estadoFiltro // Asegúrate de que esto esté presente
        }
      });
      setUsuarios(response.data.usuarios);
      setTotalElements(response.data.total);
    } catch (error) {
      console.error('Error al obtener personal:', error);
    }
  };

  const handleTipoChange = (e) => {
    const selectedTipo = e.target.value;
    setTipo(selectedTipo);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el tipo
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // const handleSearchSubmit = () => {
  //   setCurrentPage(1);
  //   obtenerPersonal();
  // };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTipo('');
    setEstadoFiltro('todos');
    setCurrentPage(1);
    obtenerPersonal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({ ...nuevoUsuario, [name]: value });
  };

  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el filtro
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${process.env.REACT_APP_API_URL}/personal`, nuevoUsuario, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      obtenerPersonal();
      handleModalClose();
    } catch (error) {
      console.error('Error al crear usuario:', error);
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
    }
  };

  const VolverHome = () => {
    navigate('/home?component=home');
  };

  return (
    <div className="usuarios">
      <h2 className="usuarios__title text-center mb-4">Gestión de Usuarios</h2>

      {/* Selector de tipo de usuario */}
      <div className="usuarios__controls d-flex justify-content-between mb-3">
      <select
        className="usuarios__select form-select col-2" style={{ width: '12%' }}
        value={tipo}
        onChange={handleTipoChange}
      >
        <option value="">Todos los tipos</option>
        {roles.map(rol => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
          </option>
        ))}
      </select>

      <select
        className="usuarios__select form-select w-auto"
        value={estadoFiltro}
        onChange={handleEstadoChange}
      >
        <option value="todos">Todos los estados</option>
        <option value="activos">Activos</option>
        <option value="inactivos">Inactivos</option>
      </select>

      <input
          type="text"
          className="form-control w-50 mx-2"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* <button className="usuarios__btn usuarios__btn--primary" onClick={handleSearchSubmit}>
          <i className="fas fa-search"></i> Buscar
        </button> */}

        <button className="usuarios__btn usuarios__btn--secondary" onClick={handleClearSearch}>
          <i className="fas fa-eraser"></i> Limpiar
        </button>

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
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    className="form-control"
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
                    value={nuevoUsuario.apellidos}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>RUT (sin puntos con guión)</label>
                  <input
                    type="text"
                    name="rut"
                    className="form-control"
                    value={nuevoUsuario.rut}
                    onChange={handleInputChange}
                    required
                    pattern="\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}"
                    title="Formato: 12.345.678-9"
                  />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    name="correo"
                    className="form-control"
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
                    {roles.map(rol => (
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
                      onChange={handleInputChange}
                      required
                    />
                    <div className="input-group-append">
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="usuarios__btn usuarios__btn--success mt-3">
                  Registrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Tabla de usuarios */}
      <div className="usuarios__card card">
        <div className="usuarios__card-header card-header">
          <h3 className="usuarios__card-title card-title">Lista de Usuarios</h3>
        </div>
        <div className="usuarios__card-body card-body">
          <table className="usuarios__table table table-bordered table-striped">
            <thead>
              <tr>
                <th>Nombres</th>
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
                      {roles.map(rol => (
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
                    <>
                      <button 
                        className="usuarios__btn usuarios__btn--success usuarios__btn--spacing btn btn-sm"
                        onClick={() => handleSaveChanges(usuario.id)}
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button 
                        className="usuarios__btn usuarios__btn--secondary btn btn-sm"
                        onClick={handleCancelEdit}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="usuarios__btn usuarios__btn--warning usuarios__btn--spacing btn btn-sm"
                        onClick={() => handleEdit(usuario.id)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="usuarios__pagination d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="Page navigation">
          <ul className="pagination pagination-sm">
            {/* Botón de página anterior */}
            <li className={`page-item ${isFirstPage ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => !isFirstPage && goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Botón de página siguiente */}
            <li className={`page-item ${isLastPage ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => !isLastPage && goToPage(currentPage + 1)}
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>

        {/* Botones de guardar y volver
        <div className="usuarios__actions">
          <button className="usuarios__btn usuarios__btn--success btn me-2">Guardar Cambios</button>
          <button className="usuarios__btn usuarios__btn--secondary btn">Cancelar</button>
        </div> */}
      </div>
      {/* Botón de volver al home */}
      <div className="instituciones__back text-center">
        <button className="instituciones__btn instituciones__btn--info btn" onClick={VolverHome}>
        <i className="fas fa-arrow-left"></i> Volver al Home
        </button>
      </div>
    </div>
  );
};

export default Usuarios;
