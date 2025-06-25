import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Instituciones.css';

const Instituciones = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [instituciones, setInstituciones] = useState([]);
  const [tipo, setTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevaInstitucion, setNuevaInstitucion] = useState({
    nombre: '',
    tipo_id: '',
    receptores: [{ nombre: '', cargo: '' }]
  });
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({
    receptores: []
  });
  const [tipos, setTipos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('activas');
  const limit = 15;
  const totalPages = Math.ceil(totalElements / limit);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    // Limpiar campos del modal
    setNuevaInstitucion({
      nombre: '',
      tipo_id: '',
      receptores: [{ nombre: '', cargo: '' }]
    });
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  useEffect(() => {
    obtenerInstituciones();
    obtenerTipos();
  }, [currentPage, tipo, searchTerm, estadoFiltro]);

  const obtenerInstituciones = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/instituciones`, {
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
      setInstituciones(response.data.instituciones);
      setTotalElements(response.data.total);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerTipos = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-instituciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTipos(response.data);
    } catch (error) {
      console.error('Error al obtener tipos de instituciones:', error);
    }
  };

  const handleTipoChange = (e) => {
    const newTipo = e.target.value;
    setTipo(newTipo);
    setCurrentPage(1);
    setIsFiltered(newTipo !== '');
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
    setIsFiltered(newEstadoFiltro !== 'todas');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTipo('');
    setEstadoFiltro('todas');
    setCurrentPage(1);
    setIsFiltered(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaInstitucion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();

      const institucionData = {
        nombre: nuevaInstitucion.nombre,
        tipo_id: nuevaInstitucion.tipo_id,
        receptores: nuevaInstitucion.receptores.filter(r => r.nombre && r.cargo)
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/instituciones`,
        institucionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      obtenerInstituciones();
      handleModalClose();
      setNuevaInstitucion({
        nombre: '',
        tipo_id: '',
        receptores: [{ nombre: '', cargo: '' }]
      });
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        estado: error.response?.status
      });
      alert('Error al crear la institución: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (institucion) => {
    setEditingId(institucion.id);
    // Hacer una copia profunda de los datos de la institución
    setEditedFields({
      nombre: institucion.nombre,
      tipo_id: institucion.tipo_id,
      estado: institucion.estado,
      receptores: institucion.receptores ? [...institucion.receptores.map(r => ({ ...r }))] : []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedFields({
      receptores: []
    });
  };

  const handleFieldChange = (institucionId, field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const VolverHome = () => {
    navigate('/home?component=agenda');
  };

  const handleReceptorInputChange = (index, field, value) => {
    const newReceptores = [...nuevaInstitucion.receptores];
    newReceptores[index] = { ...newReceptores[index], [field]: value };
    setNuevaInstitucion(prev => ({ ...prev, receptores: newReceptores }));
  };

  // Agregar estas funciones al componente Instituciones

  const handleReceptorChange = (index, field, value) => {
    const newReceptores = editedFields.receptores ? [...editedFields.receptores] : [];
    newReceptores[index] = {
      ...newReceptores[index],
      [field]: value
    };
    setEditedFields({
      ...editedFields,
      receptores: newReceptores
    });
  };

  const handleAddReceptor = () => {
    const newReceptores = editedFields.receptores ? [...editedFields.receptores] : [];
    newReceptores.push({ nombre: '', cargo: '' });
    setEditedFields({
      ...editedFields,
      receptores: newReceptores
    });
  };

  const handleRemoveReceptorInput = (index) => {
    const newReceptores = nuevaInstitucion.receptores.filter((_, i) => i !== index);
    if (newReceptores.length === 0) {
      newReceptores.push({ nombre: '', cargo: '' });
    }
    setNuevaInstitucion({
      ...nuevaInstitucion,
      receptores: newReceptores
    });
  };

  const handleAddReceptorInput = () => {
    setNuevaInstitucion({
      ...nuevaInstitucion,
      receptores: [...nuevaInstitucion.receptores, { nombre: '', cargo: '' }]
    });
  };

  // Función para agregar un receptor a una institución
  const handleAddReceptorToInstitucion = async (institucionId, receptor) => {
    try {
      const token = getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/instituciones/${institucionId}/receptores`,
        receptor,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      obtenerInstituciones();
    } catch (error) {
      console.error('Error al agregar receptor:', error);
    }
  };

  // Función para actualizar un receptor
  const handleUpdateReceptor = async (receptorId, data) => {
    try {
      const token = getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/instituciones/receptores/${receptorId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      obtenerInstituciones(); // Actualizar la lista después de modificar
    } catch (error) {
      console.error('Error al actualizar receptor:', error);
    }
  };

  // Función para eliminar un receptor
  const handleDeleteReceptor = async (receptorId) => {
    try {
      const token = getToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/instituciones/receptores/${receptorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      obtenerInstituciones(); // Actualizar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar receptor:', error);
    }
  };

  const handleSaveChanges = async (institucionId) => {
    try {
      const token = getToken();

      if (Object.keys(editedFields).length === 0) {
        handleCancelEdit();
        return;
      }

      // Actualizar la institución
      await axios.put(
        `${process.env.REACT_APP_API_URL}/instituciones/${institucionId}`,
        {
          nombre: editedFields.nombre,
          tipo_id: editedFields.tipo_id,
          estado: editedFields.estado
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Manejar receptores
      if (editedFields.receptores) {
        const receptoresActivos = editedFields.receptores.filter(r => !r._delete);

        if (receptoresActivos.length === 0) {
          throw new Error('Debe haber al menos un receptor activo');
        }

        for (const receptor of editedFields.receptores) {
          if (receptor._delete) {
            // Eliminar receptor
            await handleDeleteReceptor(receptor.id);
          } else if (receptor.id) {
            // Actualizar receptor existente
            await handleUpdateReceptor(receptor.id, {
              nombre: receptor.nombre,
              cargo: receptor.cargo,
              estado: receptor.estado
            });
          } else {
            // Agregar nuevo receptor
            await handleAddReceptorToInstitucion(institucionId, receptor);
          }
        }
      }

      obtenerInstituciones();
      handleCancelEdit();
    } catch (error) {
      console.error('Error al actualizar institución:', error);
      toast.error(error.message); // Muestra el mensaje de error al usuario
    }
  };

  return (
    <div className="instituciones">
      <div className="instituciones__back">
        <button className="instituciones__btn--back" onClick={VolverHome}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>
      <h2 className="instituciones__title font-weight-bold text-center mb-4">Gestión de Instituciones</h2>

      {/* Controles de búsqueda y filtrado */}
      <div className="instituciones__controls d-flex justify-content-between mb-3">
        <select
          className="instituciones__select form-select col-2"
          style={{ 'width': '11%' }}
          value={tipo}
          onChange={handleTipoChange}
          id="tipo-institucion"
          name="tipo"
        >
          <option value="">Todos los tipos</option>
          {tipos.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.tipo}
            </option>
          ))}
        </select>

        <select
          className="instituciones__select form-select col-2"
          style={{ 'width': '13%' }}
          value={estadoFiltro}
          onChange={handleEstadoChange}
        >
          <option value="todas">Todos los estados</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
          id="search-input"
          name="search"
        />

        {/* Mostrar el botón solo cuando hay algún filtro activo */}
        {isFiltered && (
          <button
            className="instituciones__btn instituciones__btn--secondary"
            onClick={handleClearSearch}
          >
            <i className="fas fa-eraser"></i> Limpiar
          </button>
        )}

        <button
          className="instituciones__btn instituciones__btn--primary"
          onClick={handleModalOpen}
        >
          <i className="fas fa-plus"></i> Añadir Institución
        </button>
      </div>

      {/* Tabla de instituciones */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="instituciones__card">
          <div>
            <table className="instituciones__table table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Receptores</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instituciones.map(institucion => (
                  <tr key={institucion.id}>
                    <td>
                      {editingId === institucion.id ? (
                        <select
                          className="form-control"
                          defaultValue={institucion.tipo_id}
                          onChange={(e) => handleFieldChange(institucion.id, 'tipo_id', e.target.value)}
                        >
                          {tipos.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.tipo}
                            </option>
                          ))}
                        </select>
                      ) : (
                        tipos.find(tipo => tipo.id === institucion.tipo_id)?.tipo
                      )}
                    </td>
                    <td>
                      {editingId === institucion.id ? (
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={institucion.nombre}
                          onChange={(e) => handleFieldChange(institucion.id, 'nombre', e.target.value)}
                          id={`nombre-input-${institucion.id}`}
                          name={`nombre-${institucion.id}`}
                        />
                      ) : (
                        institucion.nombre
                      )}
                    </td>
                    <td>
                      {editingId === institucion.id ? (
                        <div>
                          {editedFields.receptores?.filter(receptor => !receptor._delete).map((receptor, index) => (
                            <div key={index} className="mb-2 row">
                              <div className="col-4">
                                <input
                                  type="text"
                                  className="form-control mb-1"
                                  placeholder="Nombre del receptor"
                                  value={receptor.nombre || ''}
                                  onChange={(e) => handleReceptorChange(index, 'nombre', e.target.value)} // Aquí está el cambio
                                  required
                                  id={`receptor-nombre-${index}`}
                                  name={`receptor-nombre-${index}`}
                                />
                              </div>
                              <div className="col-4">
                                <select
                                  className="form-control"
                                  value={receptor.cargo || ''}
                                  onChange={(e) => handleReceptorChange(index, 'cargo', e.target.value)} // Aquí está el cambio
                                  required
                                >
                                  <option value="">Seleccione cargo</option>
                                  <option value="Encargada de la RAD">Encargada de la RAD</option>
                                  <option value="ENF">ENF</option>
                                </select>
                              </div>
                              <div className="col-1">
                                <div className="custom-control custom-switch">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id={`receptorSwitch${receptor.id}`}
                                    name={`receptorSwitch${receptor.id}`}
                                    checked={receptor.estado}
                                    onChange={() => {
                                      receptor.estado = !receptor.estado;
                                      handleReceptorChange(index, 'estado', receptor.estado);
                                    }}
                                  />
                                  <label className="custom-control-label" htmlFor={`receptorSwitch${receptor.id}`}>
                                    {receptor.estado ? 'Activo' : 'Inactivo'}
                                  </label>
                                </div>
                              </div>
                              {/* <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveReceptor(receptor.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button> */}
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleAddReceptor}
                          >
                            <i className="fas fa-plus"></i> Añadir Receptor
                          </button>
                        </div>
                      ) : (
                        <div>
                          {institucion.receptores?.map((receptor, index) => (
                            <div key={index}>
                              <strong>{receptor.cargo}:</strong> {receptor.nombre} ({receptor.estado ? 'Activo' : 'Inactivo'})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`customSwitch${institucion.id}`}
                          name={`customSwitch${institucion.id}`}
                          checked={editingId === institucion.id ? editedFields.estado ?? institucion.estado : institucion.estado}
                          onChange={(e) => {
                            if (editingId === institucion.id) {
                              handleFieldChange(institucion.id, 'estado', e.target.checked);
                            }
                          }}
                          disabled={editingId !== institucion.id}
                        />
                        <label className="custom-control-label" htmlFor={`customSwitch${institucion.id}`}>
                          {editingId === institucion.id ? (editedFields.estado ?? institucion.estado ? 'Activa' : 'Inactiva') : (institucion.estado ? 'Activa' : 'Inactiva')}
                        </label>
                      </div>
                    </td>
                    <td>
                      {editingId === institucion.id ? (
                        <>
                          <button
                            className="instituciones__btn instituciones__btn--success btn btn-xs mr-1"
                            onClick={() => handleSaveChanges(institucion.id)}
                          >
                            <i className="fas fa-save"></i><br />Guardar
                          </button>
                          <button
                            className="instituciones__btn instituciones__btn--secondary btn btn-sm"
                            onClick={handleCancelEdit}
                          >
                            <i className="fas fa-times"></i><br />Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="instituciones__btn instituciones__btn--warning instituciones__btn--spacing btn btn-sm text-dark"
                            onClick={() => handleEdit(institucion)}
                          >
                            <i className="fas fa-edit"></i> Editar
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
      )}

      {modalOpen && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Nueva Institución</h5>
                <button type="button" className="close" onClick={handleModalClose} aria-label="Cerrar">
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="tipo_id">Tipo de institución</label>
                    <select
                      id="tipo_id"
                      name="tipo_id"
                      className="form-control"
                      value={nuevaInstitucion.tipo_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      {tipos.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre de institución</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className="form-control"
                      value={nuevaInstitucion.nombre}
                      onChange={handleInputChange}
                      placeholder='Nombre de la institución'
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Receptor(es)</label>
                    {nuevaInstitucion.receptores.map((receptor, index) => (
                      <div key={index} className="mb-2">
                        <select
                          className="form-control mb-1"
                          value={receptor.cargo}
                          onChange={(e) => handleReceptorInputChange(index, 'cargo', e.target.value)}
                          required
                        >
                          <option value="">Seleccione cargo</option>
                          <option value="Encargada de la RAD">Encargada de la RAD</option>
                          <option value="ENF">ENF</option>
                        </select>
                        <input
                          type="text"
                          className="form-control mb-1"
                          placeholder="Nombre y Apellido del/la receptor(a)"
                          value={receptor.nombre}
                          onChange={(e) => handleReceptorInputChange(index, 'nombre', e.target.value)}
                          required
                          id={`receptor-nombre-${index}`}
                          name={`receptor-nombre-${index}`}
                        />
                        {nuevaInstitucion.receptores.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm mt-1"
                            onClick={() => handleRemoveReceptorInput(index)}
                            aria-label={`Eliminar receptor ${index + 1}`}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddReceptorInput}
                      aria-label="Añadir receptor"
                    >
                      <i className="fas fa-plus"></i> Añadir Receptor
                    </button>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3 w-100">
                    Registrar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="asignar-estudiantes__pagination d-flex justify-content-between align-items-center mb-3">
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
      </div>
    </div>
  );
};

export default Instituciones;