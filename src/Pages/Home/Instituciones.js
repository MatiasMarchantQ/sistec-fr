import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Instituciones.css'; // Asegúrate de tener un archivo CSS para estilos adicionales si es necesario

const Instituciones = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState(''); // Estado para el tipo seleccionado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const limit = 2; // Límite de elementos por página
  const totalElements = 5; // Total de elementos (esto puede venir de tu API)

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevaInstitucion, setNuevaInstitucion] = useState({
    tipo: '',
    nombre: '',
    receptora: ''
  });

  const totalPages = Math.ceil(totalElements / limit); // Calcula el total de páginas

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
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
    setNuevaInstitucion({
      ...nuevaInstitucion,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para agregar la nueva institución
    console.log('Nueva Institución:', nuevaInstitucion);
    // Cerrar el modal
    handleModalClose();
  };

  const VolverHome = () => {
    navigate('/home?component=home');
  };

  return (
    <div className="instituciones">
      <h2 className="instituciones__title text-center mb-4">Gestión de Instituciones</h2>

      {/* Selector de tipo de institución */}
      <div className="instituciones__controls d-flex justify-content-between mb-3">
        <select
          className="instituciones__select form-select w-auto"
          value={tipo}
          onChange={handleTipoChange}
        >
          <option value="">Seleccione un tipo</option>
          <option value="CESFAM">CESFAM</option>
          <option value="POSTA">POSTA</option>
          <option value="JARDÍN">JARDÍN</option>
        </select>

        <button className="instituciones__btn instituciones__btn--primary" onClick={handleModalOpen}>
          <i className="fas fa-plus"></i> Añadir Institución
        </button>
      </div>

      {/* Modal para añadir nueva institución */}
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
                      name="tipo" 
                      className="form-control" 
                      value={nuevaInstitucion.tipo} 
                      onChange={handleInputChange} 
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="CESFAM">CESFAM</option>
                      <option value="POSTA">POSTA</option>
                      <option value="JARDÍN">JARDÍN</option>
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
                    <label>Receptora</label>
                    <input 
                      type="text" 
                      name="receptora" 
                      className="form-control" 
                      value={nuevaInstitucion.receptora} 
                      onChange={handleInputChange} 
                      required 
                    />
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
                <th>Receptora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo de fila de datos, puedes mapear aquí tus datos reales */}
              {Array.from({ length: limit }).map((_, index) => (
                <tr key={index}>
                  <td>{index + 1 === 1 ? "CESFAM" : "POSTA"}</td>
                  <td>{index + 1 === 1 ? "Hospital de Talca" : "Posta de Salud Rural"}</td>
                  <td>{index + 1 === 1 ? "Dra. Pérez" : "Lic. Gómez"}</td>
                  <td>
                    <button className="instituciones__btn instituciones__btn--warning instituciones__btn--spacing btn btn-sm">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="instituciones__btn instituciones__btn--danger btn btn-sm">
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

        {/* Botones de guardar y cancelar */}
        <div>
          <button className="instituciones__btn instituciones__btn--success btn me-2">Guardar</button>
          <button className="instituciones__btn instituciones__btn--secondary btn">Cancelar</button>
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

export default Instituciones;
