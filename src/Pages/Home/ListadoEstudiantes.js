import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Estudiantes.css';

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const Estudiantes = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    contrasena: '',
    anos_cursados: '',
    semestre: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [ano, setAno] = useState(getCurrentYear().toString());  const [semestre, setSemestre] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('activos');
  const limit = 10;
  const totalPages = Math.ceil(totalElements / limit);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  useEffect(() => {
    obtenerEstudiantes();
  }, [currentPage, ano, semestre, searchTerm, estadoFiltro]);

  const obtenerEstudiantes = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        estado: estadoFiltro
      });
  
      if (ano) params.append('ano', ano);
      if (semestre) params.append('semestre', semestre);
      if (searchTerm) params.append('search', searchTerm);
  
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/estudiantes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });
  
      setEstudiantes(response.data.estudiantes);
      setTotalElements(response.data.total);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEstudiante({ ...nuevoEstudiante, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${process.env.REACT_APP_API_URL}/estudiantes`, nuevoEstudiante, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      obtenerEstudiantes();
      setModalOpen(false);
    } catch (error) {
      console.error('Error al crear estudiante:', error);
    }
  };

  const handleEdit = (estudianteId) => {
    setEditingId(estudianteId);
    setEditedFields({});
  };

  const handleFieldChange = (estudianteId, field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async (estudianteId) => {
    try {
      const token = getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/estudiantes/${estudianteId}`,
        editedFields,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      obtenerEstudiantes();
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="estudiantes">
      <h2 className="estudiantes__title text-center mb-4">Gestión de Estudiantes</h2>
  
      {/* Controles de búsqueda y filtrado */}
      <div className="estudiantes__controls d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control col-2"
          style={{'width':'12%'}}
          placeholder="Año cursado"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        />
        <select
          className="form-control col-2"
          value={semestre}
          onChange={(e) => setSemestre(e.target.value)}
        >
          <option value="">Todos los semestres</option>
          <option value="1">Primer semestre</option>
          <option value="2">Segundo semestre</option>
        </select>
        <select
          className="form-control col-2" style={{'width':'12%'}}
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
        <input
          type="text"
          className="form-control col-4"
          placeholder="Buscar por nombre o RUT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="estudiantes__btn estudiantes__btn--primary" onClick={() => setModalOpen(true)}>
          <i className="fas fa-plus"></i> Añadir Estudiante
        </button>
      </div>
  
      {/* Tabla de estudiantes */}
      <div className="estudiantes__card card">
        <div className="estudiantes__card-header card-header">
          <h3 className="estudiantes__card-title card-title">Lista de Estudiantes</h3>
        </div>
        <div className="estudiantes__card-body card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>RUT</th>
                <th>Correo</th>
                <th>Años Cursados</th>
                <th>Semestre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id}>
                  <td>{editingId === estudiante.id ? 
                    <input 
                      type="text" 
                      value={editedFields.nombres || estudiante.nombres}
                      onChange={(e) => handleFieldChange(estudiante.id, 'nombres', e.target.value)}
                    /> : estudiante.nombres}
                  </td>
                  <td>{editingId === estudiante.id ? 
                    <input 
                      type="text" 
                      value={editedFields.apellidos || estudiante.apellidos}
                      onChange={(e) => handleFieldChange(estudiante.id, 'apellidos', e.target.value)}
                    /> : estudiante.apellidos}
                  </td>
                  <td>{estudiante.rut}</td>
                  <td>{editingId === estudiante.id ? 
                    <input 
                      type="email" 
                      value={editedFields.correo || estudiante.correo} onChange={(e) => handleFieldChange(estudiante.id, 'correo', e.target.value)}
                    /> : estudiante.correo}
                  </td>
                  <td>{editingId === estudiante.id ? 
                    <input 
                      type="text" 
                      value={editedFields.anos_cursados || estudiante.anos_cursados}
                      onChange={(e) => handleFieldChange(estudiante.id, 'anos_cursados', e.target.value)}
                    /> : estudiante.anos_cursados}
                  </td>
                  <td>{editingId === estudiante.id ? 
                    <input 
                      type="text" 
                      value={editedFields.semestre || estudiante.semestre}
                      onChange={(e) => handleFieldChange(estudiante.id, 'semestre', e.target.value)}
                    /> : estudiante.semestre}
                  </td>
                  <td>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id={`estadoSwitch${estudiante.id}`}
                        checked={editingId === estudiante.id ? editedFields.estado ?? estudiante.estado : estudiante.estado}
                        onChange={(e) => {
                          if (editingId === estudiante.id) {
                            handleFieldChange(estudiante.id, 'estado', e.target.checked);
                          }
                        }}
                        disabled={editingId !== estudiante.id}
                      />
                      <label className="custom-control-label" htmlFor={`estadoSwitch${estudiante.id}`}>
                        {editingId === estudiante.id ? (editedFields.estado ?? estudiante.estado ? 'Activo' : 'Inactivo') : (estudiante.estado ? 'Activo' : 'Inactivo')}
                      </label>
                    </div>
                  </td>
                  <td>
                    {editingId === estudiante.id ? (
                      <>
                        <button 
                          className="estudiantes__btn estudiantes__btn--success estudiantes__btn--spacing btn btn-sm"
                          onClick={() => handleSaveChanges(estudiante.id)}
                        >
                          <i className="fas fa-save"></i>
                        </button>
                        <button 
                          className="estudiantes__btn estudiantes__btn--secondary btn btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="estudiantes__btn estudiantes__btn--warning estudiantes__btn--spacing btn btn-sm"
                          onClick={() => handleEdit(estudiante.id)}
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
  
      {/* Modal para añadir nuevo estudiante */}
      {modalOpen && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Nuevo Estudiante</h5>
                <button type="button" className="close" onClick={() => setModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Campos del formulario */}
                  <input type="text" name="nombres" placeholder="Nombres" onChange={handleInputChange} required />
                  <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleInputChange} required />
                  <input type="text" name="rut" placeholder="RUT" onChange={handleInputChange} required />
                  <input type="email" name="correo" placeholder="Correo" onChange={handleInputChange} required />
                  <input type="text" name="anos_cursados" placeholder="Años Cursados" onChange={handleInputChange} required />
                  <input type="text" name="semestre" placeholder="Semestre" onChange={handleInputChange} required />
                  <button type="submit" className="btn btn-primary mt-3">Registrar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="estudiantes__pagination d-flex justify-content-between align-items-center mb-3">
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
    </div>
  );
};

export default Estudiantes;