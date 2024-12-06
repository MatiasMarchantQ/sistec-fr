import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ModalEditarFichaAdulto = ({ show, onHide, fichaClinica, onActualizar }) => {
  const { user, getToken } = useAuth();

  // Estados para catálogos
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [tiposFamilia, setTiposFamilia] = useState([]);
  const [ciclosVitales, setCiclosVitales] = useState([]);

  // Estados del formulario
  const [datosAdulto, setDatosAdulto] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    edad: '',
    diagnostico_id: '',
    diagnostico_otro: '',
    escolaridad: '',
    ocupacion: '',
    direccion: '',
    conQuienVive: '',
    telefonoPrincipal: '',
    telefonoSecundario: '',
    horarioLlamada: '',
    conectividad: '',
    valorHbac1: ''
  });

  const [tiposFamiliaSeleccionados, setTiposFamiliaSeleccionados] = useState([]);
  const [tipoFamiliaOtro, setTipoFamiliaOtro] = useState('');
  const [cicloVitalSeleccionado, setCicloVitalSeleccionado] = useState('');
  const [factoresRiesgo, setFactoresRiesgo] = useState({
    alcoholDrogas: false,
    tabaquismo: false,
    otros: ''
  });

  // Cargar catálogos
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const token = getToken();
        
        // Cargar diagnósticos
        const diagnosticosRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/diagnosticos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDiagnosticos(diagnosticosRes.data);
  
        // Cargar niveles de escolaridad
        const escolaridadRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNivelesEscolaridad(escolaridadRes.data);
  
        // Cargar tipos de familia
        const tiposFamiliaRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/tipos-familia`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTiposFamilia(tiposFamiliaRes.data);
  
        // Cargar ciclos vitales
        const ciclosVitalesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCiclosVitales(ciclosVitalesRes.data);
  
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        toast.error('No se pudieron cargar los datos iniciales');
      }
    };

    // Cargar catálogos al montar el componente
    cargarCatalogos();

      // Cargar datos de la ficha cuando se muestre el modal y exista la ficha clínica
      if (show && fichaClinica) {
    // Lógica de diagnóstico más robusta
    let diagnosticoId = null;
    let diagnosticoOtro = null;

    // Caso cuando hay un objeto de diagnóstico completo
    if (fichaClinica.diagnostico) {
      // Si tiene un nombre que coincide con algún diagnóstico
      const diagnosticoEncontrado = diagnosticos.find(
        d => d.nombre === fichaClinica.diagnostico.nombre
      );

      if (diagnosticoEncontrado) {
        // Si se encuentra un diagnóstico con ID
        diagnosticoId = diagnosticoEncontrado.id;
      } else if (fichaClinica.diagnostico.diagnosticoOtro) {
        // Si tiene un diagnóstico personalizado
        diagnosticoId = null;
        diagnosticoOtro = fichaClinica.diagnostico.diagnosticoOtro;
      }
    }

      // Datos personales
      setDatosAdulto({
      nombres: fichaClinica.paciente?.nombres || '',
      apellidos: fichaClinica.paciente?.apellidos || '',
      rut: fichaClinica.paciente?.rut || '',
      edad: fichaClinica.paciente?.edad || '',
      diagnostico_id: diagnosticoId,
      diagnostico_otro: diagnosticoOtro,
      escolaridad: fichaClinica.escolaridad?.id || '',
      ocupacion: fichaClinica.ocupacion || '',
      direccion: fichaClinica.direccion || '',
      conQuienVive: fichaClinica.conQuienVive || '',
      telefonoPrincipal: fichaClinica.paciente?.telefonoPrincipal || '',
      telefonoSecundario: fichaClinica.paciente?.telefonoSecundario || '',
      horarioLlamada: fichaClinica.horarioLlamada || '',
      conectividad: fichaClinica.conectividad || '',
      valorHbac1: fichaClinica.factoresRiesgo?.valorHbac1 || ''
      });
  
      // Cargar tipos de familia
      if (fichaClinica.informacionFamiliar?.tiposFamilia && fichaClinica.informacionFamiliar.tiposFamilia.length > 0) {
          const primerTipoFamilia = fichaClinica.informacionFamiliar.tiposFamilia[0];
          
          if (primerTipoFamilia.tipoFamiliaOtro) {
              // Si hay un valor personalizado
              setTiposFamiliaSeleccionados(['Otras']);
              setTipoFamiliaOtro(primerTipoFamilia.tipoFamiliaOtro);
          } else if (primerTipoFamilia.id) {
              // Si hay un ID de tipo de familia predefinido
              setTiposFamiliaSeleccionados([primerTipoFamilia.id]);
          } else {
              // Si no hay información específica
              setTiposFamiliaSeleccionados([]);
          }
      } else if (fichaClinica.informacionFamiliar?.tiposFamilia?.[0]?.tipoFamiliaOtro) {
          // Si hay un tipo de familia personalizado, establecerlo
          setTiposFamiliaSeleccionados(['Otras']);
          setTipoFamiliaOtro(fichaClinica.informacionFamiliar.tiposFamilia[0].tipoFamiliaOtro);
      }
  
      // Ciclo vital familiar
      const cicloVital = fichaClinica.ciclosVitalesFamiliares?.[0]?.id || '';
      setCicloVitalSeleccionado(cicloVital);
  
      // Factores de riesgo
      setFactoresRiesgo({
          alcoholDrogas: fichaClinica.factoresRiesgo?.alcoholDrogas || 
                         fichaClinica.alcohol_drogas || 
                         false,
          tabaquismo: fichaClinica.factoresRiesgo?.tabaquismo || 
                      fichaClinica.tabaquismo || 
                      false,
          otros: fichaClinica.factoresRiesgo?.otros || 
                 fichaClinica.otros_factores || 
                 ''
      });
  }
  }, [show, fichaClinica, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosAdulto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTiposFamiliaChange = (e) => {
    const { value } = e.target;
    
    // Si ya está seleccionado, deseleccionarlo
    if (tiposFamiliaSeleccionados.includes(value)) {
      setTiposFamiliaSeleccionados(prev => 
        prev.filter(item => item !== value)
      );
    } else {
      // Agregar el nuevo valor
      setTiposFamiliaSeleccionados(prev => [...prev, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      
      const datosParaEnviar = {
        ...datosAdulto,
        diagnostico_id: datosAdulto.diagnostico_id,
  diagnostico_otro: 
    datosAdulto.diagnostico_id === null 
      ? datosAdulto.diagnostico_otro 
      : null,
          tiposFamilia: 
          tiposFamiliaSeleccionados[0] === 'Otras' 
            ? ['Otras'] 
            : [tiposFamiliaSeleccionados[0]],
        tipoFamiliaOtro: 
          tiposFamiliaSeleccionados[0] === 'Otras' 
            ? tipoFamiliaOtro 
            : null,
        ciclo_vital_familiar_id: cicloVitalSeleccionado,
        factoresRiesgo,
        usuario_id: user.id,
        isReevaluacion: false
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/fichas-clinicas/adulto/${fichaClinica.id}`, 
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) { toast.success('Ficha clínica actualizada exitosamente');
        onActualizar(response.data.data);
        onHide();
      } else {
        toast.error('Error al actualizar la ficha clínica');
      }
    } catch (error) {
      console.error('Error al actualizar ficha:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la ficha clínica');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ficha Clínica Adulto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombres</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombres"
                  value={datosAdulto.nombres}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control 
                  type="text" 
                  name="apellidos"
                  value={datosAdulto.apellidos}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>RUT</Form.Label>
                <Form.Control 
                  type="text" 
                  name="rut"
                  value={datosAdulto.rut}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Edad</Form.Label>
                <Form.Control 
                  type="number" 
                  name="edad"
                  value={datosAdulto.edad}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Diagnóstico</Form.Label>
              <Form.Control 
  as="select" 
  value={
    datosAdulto.diagnostico_id === null 
      ? 'Otros' 
      : datosAdulto.diagnostico_id
  }
  onChange={(e) => {
    const value = e.target.value;

    if (value === 'Otros') {
      setDatosAdulto(prev => ({
        ...prev,
        diagnostico_id: null,
        diagnostico_otro: ''
      }));
    } else {
      setDatosAdulto(prev => ({
        ...prev,
        diagnostico_id: value,
        diagnostico_otro: ''
      }));
    }
  }}
>
  <option value="">Seleccione un diagnóstico</option>
  {diagnosticos.map(diagnostico => (
    <option 
      key={diagnostico.id} 
      value={diagnostico.id}
    >
      {diagnostico.nombre}
    </option>
  ))}
  <option value="Otros">Otro diagnóstico</option>
</Form.Control>
              
              {datosAdulto.diagnostico_id === null && (
                <Form.Control 
                  type="text" 
                  name="diagnostico_otro"
                  value={datosAdulto.diagnostico_otro}
                  onChange={handleChange}
                  placeholder="Especifique el diagnóstico"
                  className="mt-2"
                  required
                />
              )}
            </Form.Group>
          </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Escolaridad</Form.Label>
                <Form.Control 
                  as="select" 
                  name="escolaridad"
                  value={datosAdulto.escolaridad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {nivelesEscolaridad.map(nivel => (
                    <option key={nivel.id} value={nivel.id}>
                      {nivel.nivel}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ocupación</Form.Label>
                <Form.Control 
                  type="text" 
                  name="ocupacion"
                  value={datosAdulto.ocupacion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control 
                  type="text" 
                  name="direccion"
                  value={datosAdulto.direccion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono Principal</Form.Label>
                <Form.Control 
                  type="tel" 
                  name="telefonoPrincipal"
                  value={datosAdulto.telefonoPrincipal}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono Secundario</Form.Label>
                <Form.Control 
                  type="tel" 
                  name="telefonoSecundario"
                  value={datosAdulto.telefonoSecundario}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Horario de Llamada</Form.Label>
                <Form.Control 
                  type="text" 
                  name="horarioLlamada"
                  value={datosAdulto.horarioLlamada}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Conectividad</Form.Label>
                <Form.Control 
                  type="text" 
                  name="conectividad"
                  value={datosAdulto.conectividad}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Valor HbA1c Previo</Form.Label>
                <Form.Control 
                  type="text" 
                  name="valorHbac1"
                  value={datosAdulto.valorHbac1}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Check 
                type="checkbox"
                label="Consumo de Alcohol/Drogas"
                checked={factoresRiesgo.alcoholDrogas}
                onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, alcoholDrogas: e.target.checked })}
              />
            </Col>
            <Col md={6}>
              <Form.Check 
                type="checkbox"
                label="Tabaquismo"
                checked={factoresRiesgo.tabaquismo}
                onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, tabaquismo: e.target.checked })}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Otros Factores de Riesgo</Form.Label>
                <Form.Control 
                  type="text" 
                  value={factoresRiesgo.otros}
                  onChange={(e) => setFactoresRiesgo({ ...factoresRiesgo, otros: e.target.value })}
                  placeholder="Especifique otros factores de riesgo"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
        <Col md={6}>
        <Form.Group className="mb-3">
            <Form.Label>Ciclo Vital Familiar</Form.Label>
            <Form.Control 
                as="select" 
                value={cicloVitalSeleccionado}
                onChange={(e) => setCicloVitalSeleccionado(e.target.value)}
            >
                <option value="">Seleccione...</option>
                {ciclosVitales.map(ciclo => (
                <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.ciclo}
                </option>
                ))}
            </Form.Control>
            </Form.Group>
        </Col>
        <Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>Tipo de Familia</Form.Label>
    <Form.Control 
      as="select" 
      value={
        tiposFamiliaSeleccionados[0] === 'Otras' 
          ? 'Otras' 
          : tiposFamiliaSeleccionados[0] || ''
      }
      onChange={(e) => {
        const value = e.target.value;
        if (value === 'Otras') {
          setTiposFamiliaSeleccionados(['Otras']);
          setTipoFamiliaOtro('');
        } else {
          setTiposFamiliaSeleccionados([value]);
          setTipoFamiliaOtro('');
        }
      }}
    >
      <option value="">Seleccione...</option>
      {tiposFamilia.map(tipo => (
        <option key={tipo.id} value={tipo.id}>
          {tipo.nombre}
        </option>
      ))}
      <option value="Otras">Otras</option>
    </Form.Control>
    
    {tiposFamiliaSeleccionados.includes('Otras') && (
      <Form.Control 
        type="text" 
        value={tipoFamiliaOtro}
        onChange={(e) => setTipoFamiliaOtro(e.target.value)}
        placeholder="Especifique otro tipo de familia"
        className="mt-2"
        required
      />
    )}
  </Form.Group>
</Col>
      </Row>
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarFichaAdulto;