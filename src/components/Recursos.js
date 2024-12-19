import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, ButtonGroup, Container, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Components.css';

const RECURSOS_TELECUIDADO = {
    documentos: [
      {
        titulo: 'Manual de Telecuidado Infantil',
        descripcion: 'Guía completa para el cuidado y seguimiento de pacientes infantiles',
        tipo: 'pdf',
        url: '/recursos/manual-telecuidado-infantil.pdf',
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
        descripcion: 'Últimas noticias y publicaciones sobre el programa de Telecuidado en la Universidad Católica de Maule',
        tags: ['noticias', 'telecuidado', 'UCM']
      },
      {
        nombre: 'Canal YouTube FACSA UCM',
        url: 'https://www.youtube.com/@facsa_ucm',
        descripcion: 'Canal oficial de la Facultad de Ciencias de la Salud de la UCM',
        tags: ['youtube', 'facultad', 'salud', 'videos']
      }
    ],
    videos_destacados: [
      {
        titulo: 'Presentación Programa Telecuidado',
        plataforma: 'youtube',
        url: 'https://www.youtube.com/embed/[ID_VIDEO]', // Reemplazar con ID específico
        descripcion: 'Introducción al programa de Telecuidado de la UCM',
        tags: ['presentación', 'telecuidado', 'programa']
      }
    ]
  };

  const Recursos = () => {
    const [seccionActiva, setSeccionActiva] = useState('documentos');

    const renderizarRecursos = () => {
        const recursos = RECURSOS_TELECUIDADO[seccionActiva];
      
        return recursos.map((recurso, index) => (
            <Card 
                key={index} 
                className="recurso-card mb-3 shadow-sm hover-elevate"
            >
                <Card.Body className="d-flex align-items-center">
                    <div className="recurso-icono mr-3">
                        <i className={`fas ${
                            seccionActiva === 'documentos' ? 'fa-file-pdf' :
                            seccionActiva === 'enlaces_externos' ? 'fa-link' :
                            'fa-video'
                        } fa-3x text-primary`}></i>
                    </div>
                    <div className="recurso-contenido flex-grow-1">
                        <Card.Title className="mb-2">{recurso.titulo || recurso.nombre}</Card.Title>
                        <Card.Text className="text-muted mb-2">
                            {recurso.descripcion}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="tags">
                                {recurso.tags.map((tag, tagIndex) => (
                                    <Badge 
                                        key={tagIndex} 
                                        variant="light" 
                                        className="mr-1 badge-custom"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            {seccionActiva === 'documentos' ? (
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    href={recurso.url} 
                                    target="_blank"
                                    download
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    Descargar
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    href={recurso.url} 
                                    target="_blank"
                                >
                                    <i className="fas fa-external-link-alt mr-2"></i>
                                    Ir al Sitio
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        ));
    };

    return (
        <div className="wrapper login-page-wrapper">
            <a 
                href="/" 
                className="btn btn-outline-light position-absolute top-0 end-0 m-3 d-flex align-items-center" 
                style={{ 
                    zIndex: 1000, 
                    position: 'fixed',
                    borderRadius: '20px',
                    padding: '8px 15px'
                }}
            >
                <i className="fas fa-external-link-alt mr-2"></i>
                Iniciar sesión
            </a>

            {/* Contenido Principal */}
            <div 
                className="hold-transition login-page" 
                style={{ 
                    backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                    url(/facsa.jpg)
                `,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    minHeight: 'calc(100vh - 114px)', // Ajusta para dejar espacio para header y footer
                    paddingTop: '60px',
                    overflowY: 'auto'
                }}
            >
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <div className="login-logo">
                                <p className="brand-link">
                                    <img src="/facsa.png" alt="Logo UCM" style={{height: 100}}/>
                                </p>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="text-center mb-4">
                                        <i className="fas fa-book-open mr-3"></i>
                                        Recursos de Telecuidado
                                    </h2>
                                    <ButtonGroup className="w-100 mb-4">
                                        {[
                                            { key: 'documentos', icon: 'fa-file-pdf', label: 'Documentos' },
                                            { key: 'enlaces_externos', icon: 'fa-link', label: 'Enlaces' },
                                            // { key: 'videos_destacados', icon: 'fa-video', label: 'Videos' }
                                        ].map((seccion) => (
                                            <Button 
                                                key={seccion.key}
                                                variant={seccionActiva === seccion.key ? 'primary' : 'outline-primary'}
                                                onClick={() => setSeccionActiva(seccion.key)}
                                                className="d-flex align-items-center"
                                            >
                                                <i className={`fas ${seccion.icon} mr-2`}></i>
                                                {seccion.label}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                        
                                    <div 
                                        className="recursos-container" 
                                        style={{ 
                                            maxHeight: '400px', 
                                            overflowY: 'auto' 
                                        }}
                                    >
                                        {renderizarRecursos()}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Footer */}
            {/* <footer className="main-footer">
        <div className="float-right d-none d-sm-inline">
          Universidad Católica del Maule
        </div>
        <strong>Copyright © 2024 UCM.</strong> Todos los derechos reservados.
      </footer> */}
    </div>
  );
};

export default Recursos;