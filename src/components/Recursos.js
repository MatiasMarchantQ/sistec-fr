import React, { useState, useMemo } from 'react';
import { Card, Button, Row, Col, Container, Badge, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RECURSOS_TELECUIDADO = {
    documentos: [
      {
        titulo: 'Manual de Telecuidado Infantil',
        descripcion: 'Guía completa para el cuidado y seguimiento de pacientes infantiles',
        tipo: 'pdf',
        url: '/recursos/manual_telecuidado_infantil.pdf',
        tags: ['infantil', 'telecuidado', 'manual', 'guía']
      },
      {
        titulo: 'Manual de Telecuidado Adulto Mayor',
        descripcion: 'Guía integral para el cuidado y seguimiento de adultos mayores',
        tipo: 'pdf',
        url: '/recursos/manual-telecuidado-adulto-mayor.pdf',
        tags: ['adulto mayor', 'telecuidado', 'manual', 'cuidado']
      }
    ],
    enlaces_externos: [
      {
        nombre: 'Noticias UCM - Telecuidado',
        url: 'https://portal.ucm.cl/?s=telecuidado',
        descripcion: 'Últimas noticias y publicaciones sobre el programa de Telecuidado en la UCM',
        tags: ['noticias', 'telecuidado', 'UCM']
      },
      {
        nombre: 'Canal YouTube FACSA UCM',
        url: 'https://www.youtube.com/@facsa_ucm',
        descripcion: 'Canal oficial de la Facultad de Ciencias de la Salud de la UCM',
        tags: ['youtube', 'facultad', 'salud', 'videos']
      },
      {
        nombre: 'Instagram FACSA UCM',
        url: 'https://www.instagram.com/facsa_ucm/',
        descripcion: 'Perfil de la Facultad de Ciencias de la Salud en Instagram',
        tags: ['instagram', 'facultad', 'salud', 'imagenes']
      }
    ]
};

const Recursos = () => {
  const [seccionActiva, setSeccionActiva] = useState('documentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Obtener todos los tags únicos
  const allTags = useMemo(() => {
    const tags = new Set();
    Object.values(RECURSOS_TELECUIDADO).forEach(seccion => {
      seccion.forEach(recurso => {
        recurso.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, []);

  // Filtrar recursos
  const recursosFiltrados = useMemo(() => {
    const recursos = RECURSOS_TELECUIDADO[seccionActiva];
    return recursos.filter(recurso => {
      const matchesSearch = (
        (recurso.titulo?.toLowerCase() || recurso.nombre?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
        recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recurso.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recurso.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [seccionActiva, searchTerm, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const limpiarFiltros = () => {
    setSelectedTags([]);
    setSearchTerm('');
  };

  return (
    <div className="wrapper">
      <style>
        {`
          :root {
            --color-white: #ffffff;
            --color-dark: #00171f;
            --color-primary: #003459;
            --color-secondary: #007ea7;
            --color-accent: #00a8e8;
          }

          .hover-card {
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 52, 89, 0.1);
          }
          
          .hover-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 52, 89, 0.1);
          }

          .tag-badge {
            cursor: pointer;
            transition: all 0.2s ease;
            background-color: var(--color-white);
            color: var(--color-secondary);
            border: 1px solid var(--color-secondary);
          }

          .tag-badge.selected {
            background-color: var(--color-secondary);
            color: var(--color-white);
          }

          .tag-badge:hover {
            background-color: var(--color-accent);
            color: var(--color-white);
            border-color: var(--color-accent);
          }

          .search-input {
            border: 2px solid var(--color-secondary);
            border-radius: 20px;
            padding: 0.75rem 1rem;
            transition: all 0.3s ease;
          }

          .search-input:focus {
            border-color: var(--color-accent);
            box-shadow: 0 0 0 0.2rem rgba(0, 168, 232, 0.25);
          }

          .section-button {
            background-color: transparent;
            color: var(--color-secondary);
            border: 2px solid var(--color-secondary);
            border-radius: 20px;
            padding: 0.5rem 1.5rem;
            transition: all 0.3s ease;
            font-weight: 500;
          }

          .section-button:hover {
            background-color: var(--color-secondary);
            color: var(--color-white);
            transform: translateY(-1px);
          }

          .section-button.active {
            background-color: var(--color-secondary);
            color: var(--color-white);
          }

          .action-button {
            background-color: var(--color-accent);
            border-color: var(--color-accent);
            color: var(--color-white);
            border-radius: 20px;
            padding: 0.5rem 1.5rem;
            transition: all 0.3s ease;
          }

          .action-button:hover {
            background-color: var(--color-secondary);
            border-color: var(--color-secondary);
            transform: translateY(-1px);
          }

          .login-button {
            background-color: rgba(0, 52, 89, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--color-white);
            transition: all 0.3s ease;
          }

          .login-button:hover {
            background-color: var(--color-accent);
            color: var(--color-white);
          }

          .resources-container {
            scrollbar-width: thin;
            scrollbar-color: var(--color-secondary) transparent;
          }

          .resources-container::-webkit-scrollbar {
            width: 6px;
          }

          .resources-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .resources-container::-webkit-scrollbar-thumb {
            background-color: var(--color-secondary);
            border-radius: 20px;
          }

          .main-card {
            background-color: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            border: none;
            border-radius: 15px;
          }

          .resource-icon {
            color: var(--color-secondary);
          }

          @media (max-width: 768px) {
            .section-button {
              width: 100%;
              margin-bottom: 0.5rem;
              margin-right: 0 !important;
            }

            .tag-badge {
              font-size: 0.8rem;
              padding: 0.4rem 0.8rem !important;
            }

            .action-button {
              width: 100%;
              margin-top: 1rem;
            }

            .resource-icon {
              display: none; /* Ocultar icono en móvil para ahorrar espacio */
            }

            .card-body {
              padding: 1rem !important;
            }

            .login-button {
              padding: 0.4rem 1rem;
              font-size: 0.9rem;
            }

            .main-card {
              margin: 0 1rem;
            }
          }

          .clean-button {
            background-color: var(--color-dark);
            color: var(--color-white);
            border: none;
            border-radius: 20px;
            padding: 0.4rem 1rem;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }

          .clean-button:hover {
            background-color: var(--color-primary);
            transform: translateY(-1px);
          }

          .tags-container {
            position: relative;
            padding-right: 100px; /* Espacio para el botón limpiar */
          }

          @media (max-width: 768px) {
            .tags-container {
              padding-right: 0;
            }
            
            .clean-filters {
              position: static;
              width: 100%;
              margin-top: 1rem;
            }
          }
        `}
      </style>

      <Button 
        href="/" 
        className="login-button position-absolute top-0 end-0 m-4 rounded-pill"
        style={{ zIndex: 1000 }}
      >
        <i className="fas fa-sign-in-alt me-2"></i>
        Iniciar sesión
      </Button>

      <div 
        className="min-vh-100 py-5"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 23, 31, 0.8), rgba(0, 52, 89, 0.8)), url(/facsa.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <Container>
          <Row className="justify-content-center mb-4 mb-md-5">
            <Col xs={12} className="text-center">
              <img 
                src="/facsa.png" 
                alt="Logo UCM" 
                style={{ 
                  height: '80px',
                  marginBottom: '1.5rem',
                  '@media (min-width: 768px)': {
                    height: '120px',
                    marginBottom: '2rem'
                  }
                }}
              />
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={12} lg={10} xl={8}>
              <Card className="main-card shadow-lg">
                <Card.Body className="p-3 p-md-4">
                  <h2 className="text-center mb-4" style={{ color: 'var(--color-primary)' }}>
                    <i className="fas fa-book-open me-3"></i>
                    Recursos de Telecuidado
                  </h2>

                  {/* Buscador */}
                  <div className="mb-4">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Buscar recursos..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <InputGroup.Text className="bg-transparent border-0 position-absolute end-0" style={{ zIndex: 10 }}>
                        <i className="fas fa-search text-secondary"></i>
                      </InputGroup.Text>
                    </InputGroup>
                  </div>

                  {/* Tags */}
                  <div className="mb-4 tags-container">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="text-muted mb-0">Filtrar por etiquetas:</p>
                      {(selectedTags.length > 0 || searchTerm) && (
                        <Button 
                          onClick={limpiarFiltros}
                          className="clean-button"
                        >
                          <i className="fas fa-times-circle me-2"></i>
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          className={`tag-badge px-3 py-2 ${selectedTags.includes(tag) ? 'selected' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Botones de sección */}
                  <div className="text-center mb-4 d-flex flex-column flex-md-row justify-content-center">
                    {[
                      { key: 'documentos', icon: 'fa-file-pdf', label: 'Documentos' },
                      { key: 'enlaces_externos', icon: 'fa-link', label: 'Enlaces' }
                    ].map((seccion) => (
                      <Button 
                        key={seccion.key}
                        className={`section-button ${seccionActiva === seccion.key ? 'active' : ''}`}
                        onClick={() => setSeccionActiva(seccion.key)}
                      >
                        <i className={`fas ${seccion.icon} me-2`}></i>
                        {seccion.label}
                      </Button>
                    ))}
                  </div>

                  {/* Recursos */}
                  <div 
                    className="resources-container"
                    style={{ 
                      maxHeight: '500px',
                      overflowY: 'auto',
                      padding: '0.5rem'
                    }}
                  >
                    {recursosFiltrados.length > 0 ? (
                      recursosFiltrados.map((recurso, index) => (
                        <Card 
                          key={index} 
                          className="hover-card mb-4"
                        >
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-start">
                              <div className="resource-icon me-4">
                                <i className={`fas ${
                                  seccionActiva === 'documentos' ? 'fa-file-pdf' : 'fa-link'
                                } fa-2x`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <h5 className="mb-2 fw-bold" style={{ color: 'var(--color-primary)' }}>
                                  {recurso.titulo || recurso.nombre}
                                </h5>
                                <p className="text-muted mb-3">
                                  {recurso.descripcion}
                                </p>
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                  <div className="mb-2 mb-md-0">
                                    {recurso.tags.map((tag, tagIndex) => (
                                      <Badge 
                                        key={tagIndex}
                                        className="me-2 px-3 py-2"
                                        style={{ 
                                          backgroundColor: 'var(--color-secondary)',
                                          color: 'var(--color-white)'
                                        }}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <Button 
                                    className="action-button"
                                    href={recurso.url}
                                    target="_blank"
                                  >
                                    <i className={`fas ${
                                      seccionActiva === 'documentos' ? 'fa-download' : 'fa-external-link-alt'
                                    } me-2`}></i>
                                    {seccionActiva === 'documentos' ? 'Descargar' : 'Visitar'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted py-5">
                        <i className="fas fa-search fa-3x mb-3"></i>
                        <p>No se encontraron recursos que coincidan con tu búsqueda.</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Recursos;