import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Usuarios.css'; // Asegúrate de tener un archivo CSS para estilos adicionales si es necesario

const Usuarios = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState(''); // Estado para el tipo seleccionado
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la barra de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const limit = 2; // Límite de elementos por página
  const totalElements = 5; // Total de elementos (esto puede venir de tu API)

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    primerNombre: '',
    primerApellido: '',
    segundoApellido: '',
    rut: '',
    correo: '',
    estado: ''
  });

  const totalPages = Math.ceil(totalElements / limit); // Calcula el total de páginas

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para agregar el nuevo usuario
    console.log('Nuevo Usuario:', nuevoUsuario);
    // Cerrar el modal
    handleModalClose();
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
          className="usuarios__select form-select w-auto"
          value={tipo}
          onChange={handleTipoChange}
        >
          <option value="">Seleccione un tipo</option>
          <option value="DIRECTOR">Director</option>
          <option value="DOCENTE">Docente</option>
        </select>

        <input
          type="text"
          className="form-control w-50 mx-2"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

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
                <label>Primer Nombre</label>
                <input
                    type="text"
                    name="primerNombre"
                    className="form-control"
                    value={nuevoUsuario.primerNombre}
                    onChange={handleInputChange}
                    required
                />
                </div>
                <div className="form-group">
                <label>Primer Apellido</label>
                <input
                    type="text"
                    name="primerApellido"
                    className="form-control"
                    value={nuevoUsuario.primerApellido}
                    onChange={handleInputChange}
                    required
                />
                </div>
                <div className="form-group">
                <label>Segundo Apellido</label>
                <input
                    type="text"
                    name="segundoApellido"
                    className="form-control"
                    value={nuevoUsuario.segundoApellido}
                    onChange={handleInputChange}
                />
                </div>
                <div className="form-group">
                <label>RUT</label>
                <input
                    type="text"
                    name="rut"
                    className="form-control"
                    value={nuevoUsuario.rut}
                    onChange={handleInputChange}
                    required
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
                <th>Primer Nombre</th>
                <th>Primer Apellido</th>
                <th>Segundo Apellido</th>
                <th>RUT</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo de fila de datos, puedes mapear aquí tus datos reales */}
              {Array.from({ length: limit }).map((_, index) => (
                <tr key={index}>
                  <td>{`Nombre ${index + 1}`}</td>
                  <td>{`Apellido ${index + 1}`}</td>
                  <td>{`Segundo Apellido ${index + 1}`}</td>
                  <td>{`RUT ${index + 1}`}</td>
                  <td>{`correo${index + 1}@ejemplo.com`}</td>
                  <td>{index % 2 === 0 ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button className="usuarios__btn usuarios__btn--warning usuarios__btn--spacing btn btn-sm">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="usuarios__btn usuarios__btn--danger btn btn-sm">
                      <i className="fas fa-trash"></i>
                    </button>
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

        {/* Botones de guardar y volver */}
        <div className="usuarios__actions">
          <button className="usuarios__btn usuarios__btn--success btn me-2">Guardar Cambios</button>
          <button className="usuarios__btn usuarios__btn--secondary btn">Cancelar</button>
        </div>
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
