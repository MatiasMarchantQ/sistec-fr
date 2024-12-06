import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ModalEditarFichaInfantil = ({ show, onHide, fichaClinica, onActualizar }) => {
  const { getToken } = useAuth();
  
  // Estados para catálogos
  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [tiposFamilia, setTiposFamilia] = useState([]);
  const [ciclosVitalesFamiliares, setCiclosVitalesFamiliares] = useState([]);
  const [factoresRiesgoNinoDisponibles, setFactoresRiesgoNinoDisponibles] = useState([]);
  const [factoresRiesgoFamiliaresDisponibles, setFactoresRiesgoFamiliaresDisponibles] = useState([]);

  const [formData, setFormData] = useState({
    // Datos del paciente
    fechaNacimiento: fichaClinica?.paciente?.fechaNacimiento || '',
    nombres: fichaClinica?.paciente?.nombres || '',
    apellidos: fichaClinica?.paciente?.apellidos || '',
    rut: fichaClinica?.paciente?.rut || '',
    edadAnios: (() => {
      const edadTexto = fichaClinica?.paciente?.edad;
      if (edadTexto) {
        const match = edadTexto.match(/(\d+)\s*años/);
        return match ? parseInt(match[1]) : '';
      }
      return '';
    })(),
    edadMeses: (() => {
      const edadTexto = fichaClinica?.paciente?.edad;
      if (edadTexto) {
        const match = edadTexto.match(/(\d+)\s*meses/);
        return match ? parseInt(match[1]) : '';
      }
      return '';
    })(),
    edadDias: (() => {
      const edadTexto = fichaClinica?.paciente?.edad;
      if (edadTexto) {
        const match = edadTexto.match(/(\d+)\s*días/);
        return match ? parseInt(match[1]) : '';
      }
      return '';
    })(),
    telefonoPrincipal: fichaClinica?.paciente?.telefonoPrincipal || '',
    telefonoSecundario: fichaClinica?.paciente?.telefonoSecundario || '',

    // Información Familiar
    conQuienVive: fichaClinica?.informacionFamiliar?.conQuienVive || '',
    localidad: fichaClinica?.informacionFamiliar?.localidad || '',
    
    // Modificar la inicialización de tipos de familia
    tipoFamilia: (() => {
      const tiposFamilia = fichaClinica?.informacionFamiliar?.tiposFamilia;
      if (tiposFamilia && tiposFamilia.length > 0) {
        const primerTipoFamilia = tiposFamilia[0];
        
        // Si hay un tipo de familia personalizado (Otras)
        if (primerTipoFamilia.tipoFamiliaOtro) {
          return 'Otras';
        }
        
        // Si es un tipo de familia predefinido
        return primerTipoFamilia.id || '';
      }
      return ''; // Valor por defecto
    })(),
    tipoFamiliaOtro: (() => {
      const tiposFamilia = fichaClinica?.informacionFamiliar?.tiposFamilia;
      if (tiposFamilia && tiposFamilia.length > 0) {
        const primerTipoFamilia = tiposFamilia[0];
        return primerTipoFamilia.tipoFamiliaOtro || '';
      }
      return ''; // Valor por defecto
    })(),

    // Ciclo Vital Familiar
    cicloVitalFamiliar: fichaClinica?.informacionFamiliar?.cicloVitalFamiliar?.id || '',

    // Padres
    padres: fichaClinica?.informacionFamiliar?.padres?.map(padre => ({
        id: padre.id,
        nombre: padre.nombre || '',
        ocupacion: padre.ocupacion || '',
        escolaridad: padre.escolaridad?.id || ''
      })) || [{ 
        nombre: '', 
        ocupacion: '', 
        escolaridad: '' 
      }],

    // Factores de Riesgo del Niño
    factoresRiesgoNino: {},

    // Factores de Riesgo Familiares
    factoresRiesgoFamiliares: { otras: '' }
  });

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const token = getToken();
        
        // Cargar niveles de escolaridad
        const nivelesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNivelesEscolaridad(nivelesRes.data);

        // Cargar tipos de familia
        const tiposRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/tipos-familia`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTiposFamilia(tiposRes.data);

        // Cargar ciclos vitales familiares
        const ciclosRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCiclosVitalesFamiliares(ciclosRes.data);

        // Cargar factores de riesgo del niño
        const factoresNinoRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-nino`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFactoresRiesgoNinoDisponibles(factoresNinoRes.data);

        // Inicializar factores de riesgo del niño
        const inicialFactoresNino = {};
        factoresNinoRes.data.forEach(factor => {
          inicialFactoresNino[factor.nombre] = fichaClinica?.factoresRiesgo?.nino?.some(
            f => f.id === factor.id || f.nombre === factor.nombre
          ) || false;
        });
        setFormData(prev => ({
          ...prev,
          factoresRiesgoNino: inicialFactoresNino
        }));

        // Cargar factores de riesgo familiar
        const factoresFamiliarRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/factores-riesgo-familiar`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFactoresRiesgoFamiliaresDisponibles(factoresFamiliarRes.data);

        // Inicializar factores de riesgo familiares
        const inicialFactoresFamiliares = { otras: '' };
        factoresFamiliarRes.data.forEach(factor => {
          if (factor.nombre !== 'Otras') {
            inicialFactoresFamiliares[factor.nombre] = fichaClinica?.factoresRiesgo?.familiares?.some(
              f => f.id === factor.id || f.nombre === factor.nombre
            ) || false;
          }
        });

        // Manejar el campo "Otras"
        const otrasFactores = fichaClinica?.factoresRiesgo?.familiares?.find(
          f => f.nombre === 'Otras'
        );
        if (otrasFactores && otrasFactores.otras) {
          inicialFactoresFamiliares.otras = otrasFactores.otras;
        }

        setFormData(prev => ({
          ...prev,
          factoresRiesgoFamiliares: inicialFactoresFamiliares
        }));

      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        toast.error('No se pudieron cargar los datos iniciales');
      }
    };

    if (show) {
      cargarCatalogos();
    }
  }, [show, getToken, fichaClinica]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Manejar checkboxes de factores de riesgo
      if (name.startsWith('factoresRiesgoNino')) {
        setFormData(prev => ({
          ...prev,
          factoresRiesgoNino: {
            ...prev.factoresRiesgoNino,
            [value]: checked
          }
        }));
      } else if (name.startsWith('factoresRiesgoFamiliares')) {
        setFormData(prev => ({
          ...prev,
          factoresRiesgoFamiliares: {
            ...prev.factoresRiesgoFamiliares,
            [value]: checked
          }
        }));
      }
    } else {
      // Validaciones para campos numéricos de edad
      if (name === 'edadAnios') {
        const valorNumerico = Math.min(Math.max(parseInt(value) || 0, 0), 5);
        setFormData(prev => ({
          ...prev,
          [name]: valorNumerico
        }));
      } else if (name === 'edadMeses') {
        const valorNumerico = Math.min(Math.max(parseInt(value) || 0, 0), 12);
        setFormData(prev => ({
          ...prev,
          [name]: valorNumerico
        }));
      } else if (name === 'edadDias') {
        const valorNumerico = Math.min(Math.max(parseInt(value) || 0, 0), 31);
        setFormData(prev => ({
          ...prev,
          [name]: valorNumerico
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handlePadreChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosPadres = [...formData.padres];
    nuevosPadres[index] = {
      ...nuevosPadres[index],
      [name]: value
    };
    setFormData(prevState => ({
      ...prevState,
      padres: nuevosPadres
    }));
  };

  const handleAddPadre = () => {
    setFormData(prev => ({
      ...prev,
      padres: [...prev.padres, { 
        nombre: '', 
        ocupacion: '', 
        escolaridad: '' 
      }]
    }));
  };

  const handleRemovePadre = (index) => {
    setFormData(prev => ({
      ...prev,
      padres: prev.padres.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      
      // Construir la cadena de edad
      let edad = '';
      if (formData.edadAnios) {
        edad += `${formData.edadAnios} años`;
      }
      if (formData.edadMeses) {
        if (edad) edad += ', ';
        edad += `${formData.edadMeses} meses`;
      }
      if (formData.edadDias) {
        if (edad) edad += ', ';
        edad += `${formData.edadDias} días`;
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        ...formData,
        edad, // Añadir la cadena de edad
        
        // Manejar padres con sus IDs
        padres: formData.padres.map(padre => ({
          id: padre.id, // Incluir ID si existe
          nombre: padre.nombre,
          escolaridad: padre.escolaridad || null,
          ocupacion: padre.ocupacion,

          tipoFamilia: formData.tipoFamilia === 'Otras' ? 'Otras' : formData.tipoFamilia,
          tipoFamiliaOtro: formData.tipoFamilia === 'Otras' ? formData.tipoFamiliaOtro : null,

        })),

        // Factores de riesgo del niño
        factoresRiesgoNino: Object.keys(formData.factoresRiesgoNino)
          .filter(key => formData.factoresRiesgoNino[key]),
        
        // Factores de riesgo familiares
        factoresRiesgoFamiliares: Object.keys(formData.factoresRiesgoFamiliares)
          .filter(key => formData.factoresRiesgoFamiliares[key] && key !== 'otras'),
        otrosFactoresRiesgoFamiliares: formData.factoresRiesgoFamiliares.otras || '',
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/infantil/${fichaClinica.id}`,
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Ficha clínica infantil actualizada exitosamente');
        onActualizar(response.data.data);
        onHide(); // Cerrar el modal
      } else {
        toast.error('Error al actualizar la ficha clínica infantil');
      }
    } catch (error) {
      console.error('Error al actualizar ficha clínica infantil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la ficha clínica infantil');
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Ficha Clínica Infantil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formFechaNacimiento">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formNombres">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ingrese el/los nombres"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formApellidos">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ingrese el/los apellidos"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formRut">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  placeholder="Ej: 12345678-9"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group controlId="formEdad">
                <Form.Label>Edad</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="number"
                    name="edadAnios"
                    placeholder="Años"
                    value={formData.edadAnios}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    className="mr-2"
                    style={{ width: '100px' }}
                  />
                  <Form.Control
                    type="number"
                    name="edadMeses"
                    placeholder="Meses"
                    value={formData.edadMeses}
                    onChange={handleChange}
                    min="0"
                    max="12"
                    className="mr-2"
                    style={{ width: '100px' }}
                  />
                  <Form.Control
                    type="number"
                    name="edadDias"
                    placeholder="Días"
                    value={formData.edadDias}
                    onChange={handleChange}
                    min="0"
                    max="31"
                    style={{ width: '100px' }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formTelefonoPrincipal">
                <Form.Label>Teléfono Principal</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefonoPrincipal"
                  value={formData.telefonoPrincipal}
                  onChange={handleChange}
                  placeholder="9 1234 5678"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTelefonoSecundario">
                <Form.Label>Teléfono Secundario</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefonoSecundario"
                  value={formData.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="9 8765 4321"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formConQuienVive">
                <Form.Label>Con quién vive el menor</Form.Label>
                <Form.Control
                  type="text"
                  name="conQuienVive"
                  value={formData.conQuienVive}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="formTipoFamilia">
  <Form.Label>Tipo de Familia</Form.Label>
  <Form.Control
    as="select"
    name="tipoFamilia"
    value={formData.tipoFamilia === 'Otras' ? 'Otras' : formData.tipoFamilia}
    onChange={(e) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        tipoFamilia: value === 'Otras' ? 'Otras' : value,
        // Conservar tipoFamiliaOtro si ya existía o resetear
        tipoFamiliaOtro: value === 'Otras' 
          ? (prev.tipoFamiliaOtro || '') 
          : ''
      }));
    }}
  >
    <option value="">Seleccione...</option>
    {tiposFamilia.map(tipo => (
      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
    ))}
    <option value="Otras">Otras</option>
  </Form.Control>
  {(formData.tipoFamilia === 'Otras' || formData.tipoFamiliaOtro) && (
    <Form.Control
      type="text"
      name="tipoFamiliaOtro"
      value={formData.tipoFamiliaOtro}
      onChange={handleChange}
      placeholder="Especifique el tipo de familia"
      className="mt-2"
    />
  )}
</Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCicloVitalFamiliar">
                <Form.Label>Ciclo Vital Familiar</Form.Label>
                <Form.Control
                  as="select"
                  name="cicloVitalFamiliar"
                  value={formData.cicloVitalFamiliar}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {ciclosVitalesFamiliares.map(ciclo => (
                    <option key={ciclo.id} value={ciclo.id}>{ciclo.ciclo}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLocalidad">
                <Form.Label>Localidad</Form.Label>
                <Form.Control
                  as="select"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="Urbano">Urbano</option>
                  <option value="Rural">Rural</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Label>Padres/Tutores</Form.Label>
              {formData.padres.map((padre, index) => (
                <div key={index} className="mb-3">
                  <Row>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={padre.nombre}
                        onChange={(e) => handlePadreChange(index, e)}
                        placeholder="Nombre"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        as="select"
                        name="escolaridad"
                        value={padre.escolaridad}
                        onChange={(e) => handlePadreChange(index, e)}
                      >
                        <option value="">Seleccione Escolaridad...</option>
                        {nivelesEscolaridad.map(nivel => (
                          <option key={nivel.id} value={nivel.id}>{nivel.nivel}</option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="ocupacion"
                        value={padre.ocupacion}
                        onChange={(e) => handlePadreChange(index, e)}
                        placeholder="Ocupación"
                      />
                    </Col>
                  </Row>
                  {formData.padres.length > 1 && (
                    <Button variant="danger" onClick={() => handleRemovePadre(index)}>-</Button>
                  )}
                </div>
              ))}
              <Button variant="success" onClick={handleAddPadre}>+</Button>
            </Col>
          </Row>
          <Button variant="primary" type="submit">
            Actualizar Ficha Clínica
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarFichaInfantil;