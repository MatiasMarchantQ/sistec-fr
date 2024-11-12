import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Instituciones.css';

const Instituciones = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
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
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const goToPage = (page) => setCurrentPage(page);
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
    setTipo(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTipo('');
    setEstadoFiltro('todas');
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaInstitucion(prev => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
    setCurrentPage(1);
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
      receptores: institucion.receptores ? [...institucion.receptores.map(r => ({...r}))] : []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedFields({});
  };

  const handleFieldChange = (institucionId, field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const VolverHome = () => {
    navigate('/home?component=home');
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
  // Asegúrate de que siempre haya al menos un receptor
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

const handleRemoveReceptor = (receptorId) => {
  if (window.confirm('¿Está seguro de eliminar este receptor?')) {
    setEditedFields(prevFields => {
      const newReceptores = prevFields.receptores.map(receptor => 
        receptor.id === receptorId ? {...receptor, _delete: true} : receptor
      );
      // Si todos los receptores están marcados para eliminar, añade uno nuevo
      if (newReceptores.every(r => r._delete)) {
        newReceptores.push({ nombre: '', cargo: '' });
      }
      return {
        ...prevFields,
        receptores: newReceptores
      };
    });
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
          await handleUpdateReceptor(receptor.id, receptor);
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
    alert(error.message); // Muestra el mensaje de error al usuario
  }
};

  return (
    <div className="instituciones">
      <h2 className="instituciones__title text-center mb-4">Gestión de Instituciones</h2>

     {/* Controles de búsqueda y filtrado */}
      <div className="instituciones__controls d-flex justify-content-between mb-3">
        <select
          className="instituciones__select form-select col-2" 
          style={{'width':'11%'}}
          value={tipo}
          onChange={handleTipoChange}
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
          style={{'width':'13%'}}
          value={estadoFiltro}
          onChange={handleEstadoChange}
        >
          <option value="todas">Todos los estados</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>

        <input
          type="text"
          className="form-control col-4"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* Mostrar el botón solo cuando hay algún filtro activo */}
        {(searchTerm || tipo || estadoFiltro !== 'todas') && (
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
      <div className="instituciones__card card">
        <div className="instituciones__card-header card-header">
          <h3 className="instituciones__card-title card-title">Lista de Instituciones</h3>
        </div>
        <div className="instituciones__card-body card-body">
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
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control mb-1"
                            placeholder="Nombre del receptor"
                            value={receptor.nombre || ''}
                            onChange={(e) => handleReceptorChange(index, 'nombre', e.target.value)} // Aquí está el cambio
                            required
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
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveReceptor(receptor.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
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
                        <strong>{receptor.cargo}:</strong> {receptor.nombre}
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
                        className="instituciones__btn instituciones__btn--success instituciones__btn--spacing btn btn-sm"
                        onClick={() => handleSaveChanges(institucion.id)}
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button 
                        className="instituciones__btn instituciones__btn--secondary btn btn-sm"
                        onClick={handleCancelEdit}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="instituciones__btn instituciones__btn--warning instituciones__btn--spacing btn btn-sm"
                        onClick={() => handleEdit(institucion)}
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
     
      {modalOpen && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Nueva Institución</h5>
                <button type="button" className="close" onClick={handleModalClose}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
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
                    <label>Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={nuevaInstitucion.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Receptores</label>
                    {nuevaInstitucion.receptores.map((receptor, index) => (
                      <div key={index} className="mb-2">
                        <select
                          className="form-control"
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
                          placeholder="Nombre del receptor"
                          value={receptor.nombre}
                          onChange={(e) => handleReceptorInputChange(index, 'nombre', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm mt-1"
                          onClick={() => handleRemoveReceptorInput(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddReceptorInput}
                    >
                      <i className="fas fa-plus"></i> Añadir Receptor
                    </button>
                  </div>
                  <button type="submit" className="instituciones__btn instituciones__btn--success mt-3">
                    Registrar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="instituciones__pagination d-flex justify-content-between align-items-center mb-3">
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

export default Instituciones;