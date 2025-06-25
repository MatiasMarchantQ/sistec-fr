import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "../styles/FC.css";

const ModalEditarFichaDependencia = ({
  show,
  onHide,
  fichaClinica,
  onActualizar,
}) => {
  const { user, getToken } = useAuth();
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [nivelesEscolaridad, setNivelesEscolaridad] = useState([]);
  const [tiposFamilia, setTiposFamilia] = useState([]);
  const [ciclosVitales, setCiclosVitales] = useState([]);
  const [mostrarOtroDiagnostico, setMostrarOtroDiagnostico] = useState(false);
  const [datosDependencia, setDatosDependencia] = useState({
    fecha_ingreso: null,
    nombre_paciente: null,
    apellido_paciente: null,
    rut_paciente: null,
    edad_paciente: null,
    fecha_nacimiento_paciente: null,
    indice_barthel: null,
    grado_dependencia: null,
    causa_dependencia_tiempo: null,
    escolaridad_id: null,
    estado_civil: null,
    direccion_paciente: null,
    convivencia: null,
    posee_carne_discapacidad: false,
    recibe_pension_subsidio_jubilacion: false,
    tipo_beneficio: null,
    nombre_cuidador: null,
    rut_cuidador: null,
    edad_cuidador: null,
    fecha_nacimiento_cuidador: null,
    direccion_cuidador: null,
    ocupacion_cuidador: null,
    parentesco_cuidador: null,
    cuidador_recibe_estipendio: false,
    puntaje_escala_zarit: null,
    nivel_sobrecarga_zarit: null,
    control_cesfam_dependencia: null,
    consulta_servicio_urgencia: null,
    tipo_familia_id: null,
    otro_tipo_familia: null,
    ciclo_vital_familiar_id: null,
    factores_riesgo_familiar: null,
    telefono_1: null,
    telefono_2: null,
    horario_llamada: null,
    conectividad: null,
    estudiante_id: null,
    usuario_id: user.id,
    institucion_id: null,
    diagnosticosSeleccionados: [],
    otroDiagnostico: "",
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const token = getToken();

        const escolaridadRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/niveles-escolaridad`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNivelesEscolaridad(escolaridadRes.data);

        const tiposFamiliaRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/tipos-familia`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTiposFamilia(tiposFamiliaRes.data);

        const ciclosVitalesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/ciclos-vitales-familiares`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCiclosVitales(ciclosVitalesRes.data);

        // Cargar diagnósticos
        const diagnosticosRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/obtener/diagnosticos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDiagnosticos(diagnosticosRes.data);
      } catch (error) {
        toast.error("Error al cargar los catálogos");
      }
    };

    cargarCatalogos();
  }, [getToken]);

  useEffect(() => {
    if (show && fichaClinica) {
      const otroDiagnosticoExistente = fichaClinica.otroDiagnostico || "";
      setMostrarOtroDiagnostico(otroDiagnosticoExistente.trim() !== "");

      setDatosDependencia({
        fecha_ingreso: fichaClinica.fechaIngreso || '',
        nombre_paciente: fichaClinica.paciente?.nombre || '',
        apellido_paciente: fichaClinica.paciente?.apellido || '',
        rut_paciente: fichaClinica.paciente?.rut || '',
        edad_paciente: fichaClinica.paciente?.edad || '',
        fecha_nacimiento_paciente:
          fichaClinica.paciente?.fechaNacimiento || '',
        indice_barthel: fichaClinica.indiceBarthel || '',
        grado_dependencia: fichaClinica.gradoDependencia || '',
        causa_dependencia_tiempo: fichaClinica.causaDependenciaTiempo || '',
        escolaridad_id: fichaClinica.escolaridad?.id || '',
        estado_civil: fichaClinica.estadoCivil || '',
        direccion_paciente: fichaClinica.direccionPaciente || '',
        convivencia: fichaClinica.convivencia || '',
        posee_carne_discapacidad: fichaClinica.poseeCarneDiscapacidad || false,
        recibe_pension_subsidio_jubilacion:
          fichaClinica.recibePensionSubsidioJubilacion || false,
        tipo_beneficio: fichaClinica.tipoBeneficio || '',
        nombre_cuidador: fichaClinica.nombreCuidador || '',
        rut_cuidador: fichaClinica.rutCuidador || '',
        edad_cuidador: fichaClinica.edadCuidador || '',
        fecha_nacimiento_cuidador: fichaClinica.fechaNacimientoCuidador || '',
        direccion_cuidador: fichaClinica.direccionCuidador || '',
        ocupacion_cuidador: fichaClinica.ocupacionCuidador || '',
        parentesco_cuidador: fichaClinica.parentescoCuidador || '',
        cuidador_recibe_estipendio:
          fichaClinica.cuidadorRecibeEstipendio || false,
        puntaje_escala_zarit: fichaClinica.puntajeEscalaZarit || '',
        nivel_sobrecarga_zarit: fichaClinica.nivelSobrecargaZarit || '',
        control_cesfam_dependencia:
          fichaClinica.controlCesfamDependencia || '',
        consulta_servicio_urgencia:
          fichaClinica.consultaServicioUrgencia || '',
        tipo_familia_id:
          fichaClinica.tipoFamilia?.id ||
          (fichaClinica.otroTipoFamilia ? "otro" : ''),
        otro_tipo_familia: fichaClinica.otroTipoFamilia || '',
        ciclo_vital_familiar_id: fichaClinica.cicloVitalFamiliar?.id || '',
        factores_riesgo_familiar: fichaClinica.factoresRiesgo || '',
        telefono_1: fichaClinica.telefono1 || '',
        telefono_2: fichaClinica.telefono2 || '',
        horario_llamada: fichaClinica.horarioLlamada || '',
        conectividad: fichaClinica.conectividad || '',
        estudiante_id: fichaClinica.estudiante?.id || '',
        usuario_id: user.id || '',
        institucion_id: fichaClinica.institucion?.id || '',
        diagnosticosSeleccionados: fichaClinica.diagnosticos.map((d) => d.id),
        otroDiagnostico: otroDiagnosticoExistente,
      });
    } else if (!show) {
      setMostrarOtroDiagnostico(false);
      setDatosDependencia({
        fecha_ingreso: '',
        nombre_paciente: '',
        apellido_paciente: '',
        rut_paciente: '',
        edad_paciente: '',
        fecha_nacimiento_paciente: '',
        indice_barthel: '',
        grado_dependencia: '',
        causa_dependencia_tiempo: '',
        escolaridad_id: '',
        estado_civil: '',
        direccion_paciente: '',
        convivencia: '',
        posee_carne_discapacidad: false,
        recibe_pension_subsidio_jubilacion: false,
        tipo_beneficio: '',
        nombre_cuidador: '',
        rut_cuidador: '',
        edad_cuidador: '',
        fecha_nacimiento_cuidador: '',
        direccion_cuidador: '',
        ocupacion_cuidador: '',
        parentesco_cuidador: '',
        cuidador_recibe_estipendio: false,
        puntaje_escala_zarit: '',
        nivel_sobrecarga_zarit: '',
        control_cesfam_dependencia: '',
        consulta_servicio_urgencia: '',
        tipo_familia_id: '',
        otro_tipo_familia: '',
        ciclo_vital_familiar_id: '',
        factores_riesgo_familiar: '',
        telefono_1: '',
        telefono_2: '',
        horario_llamada: '',
        conectividad: '',
        estudiante_id: '',
        usuario_id: user.id,
        institucion_id: '',
        diagnosticosSeleccionados: [],
        otroDiagnostico: ''
      });
    }
  }, [show, fichaClinica, user.id]);

  // Función para calcular el grado de dependencia basado en el índice Barthel
  const calcularGradoDependencia = (indiceBarthel) => {
    if (!indiceBarthel && indiceBarthel !== 0) return "";

    const indice = parseInt(indiceBarthel);

    if (indice === 100) return "Independencia total";
    if (indice >= 60 && indice <= 95) return "Dependencia leve";
    if (indice >= 40 && indice <= 55) return "Dependencia moderada";
    if (indice >= 20 && indice <= 35) return "Dependencia severa";
    if (indice >= 0 && indice <= 15) return "Dependencia total";

    return "";
  };

  // Función para calcular el nivel de sobrecarga basado en la Escala Zarit
  const calcularNivelSobrecarga = (puntajeZarit) => {
    if (!puntajeZarit && puntajeZarit !== 0) return "";

    const puntaje = parseInt(puntajeZarit);

    if (puntaje < 47) return "Ausencia de sobrecarga";
    if (puntaje >= 47 && puntaje <= 55) return "Sobrecarga leve";
    if (puntaje > 55) return "Sobrecarga intensa";

    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "diagnosticosSeleccionados") {
      const diagnosticoId = parseInt(value);
      setDatosDependencia((prev) => {
        const seleccionados = checked
          ? [...prev.diagnosticosSeleccionados, diagnosticoId]
          : prev.diagnosticosSeleccionados.filter((id) => id !== diagnosticoId);
        return { ...prev, diagnosticosSeleccionados: seleccionados };
      });
    } else if (name === "otroDiagnosticoCheckbox") {
      setMostrarOtroDiagnostico(checked);
      if (!checked) {
        setDatosDependencia((prev) => ({
          ...prev,
          otroDiagnostico: "",
        }));
      }
    } else if (name === "indice_barthel") {
      // Calcular automáticamente el grado de dependencia
      const gradoDependencia = calcularGradoDependencia(value);
      setDatosDependencia((prev) => ({
        ...prev,
        indice_barthel: value,
        grado_dependencia: gradoDependencia,
      }));
    } else if (name === "puntaje_escala_zarit") {
      // Calcular automáticamente el nivel de sobrecarga
      const nivelSobrecarga = calcularNivelSobrecarga(value);
      setDatosDependencia((prev) => ({
        ...prev,
        puntaje_escala_zarit: value,
        nivel_sobrecarga_zarit: nivelSobrecarga,
      }));
    } else if (
      name !== "grado_dependencia" &&
      name !== "nivel_sobrecarga_zarit"
    ) {
      // Evitar que se actualicen los campos calculados automáticamente
      setDatosDependencia((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const { tipo_familia_id, otro_tipo_familia } = datosDependencia;

      await axios.put(
        `${process.env.REACT_APP_API_URL}/paciente-dependencia/${fichaClinica.id}`,
        {
          ...datosDependencia,
          diagnosticos: datosDependencia.diagnosticosSeleccionados,
          otroDiagnostico: datosDependencia.otroDiagnostico,
          tipo_familia_id: tipo_familia_id === "otro" ? null : tipo_familia_id,
          otro_tipo_familia:
            tipo_familia_id === "otro" ? otro_tipo_familia : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ficha de dependencia actualizada con éxito");
      onActualizar();
      onHide();
    } catch (error) {
      toast.error("Error al actualizar la ficha de dependencia");
    }
  };

  // Función para determinar si el checkbox "Otro" debe estar marcado
  const isOtroDiagnosticoChecked = () => {
    return (
      datosDependencia.otroDiagnostico &&
      datosDependencia.otroDiagnostico.trim() !== ""
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable dialogClassName="modal-extra-wide">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ficha Clínica Dependencia</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="fechaIngreso">
                <Form.Label>Fecha de Ingreso</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_ingreso"
                  value={datosDependencia.fecha_ingreso}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="nombrePaciente">
                <Form.Label>Nombre Paciente</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_paciente"
                  value={datosDependencia.nombre_paciente}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="apellidoPaciente">
                <Form.Label>Apellido Paciente</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido_paciente"
                  value={datosDependencia.apellido_paciente}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="rutPaciente">
                <Form.Label>RUT Paciente</Form.Label>
                <Form.Control
                  type="text"
                  name="rut_paciente"
                  value={datosDependencia.rut_paciente}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="edadPaciente">
                <Form.Label>Edad Paciente</Form.Label>
                <Form.Control
                  type="number"
                  name="edad_paciente"
                  value={datosDependencia.edad_paciente}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="fechaNacimientoPaciente">
                <Form.Label>Fecha Nacimiento Paciente</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento_paciente"
                  value={datosDependencia.fecha_nacimiento_paciente}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Label>Diagnósticos</Form.Label>
              {diagnosticos.map((diagnostico) => (
                <Form.Check
                  key={diagnostico.id}
                  type="checkbox"
                  label={diagnostico.nombre}
                  name="diagnosticosSeleccionados"
                  value={diagnostico.id}
                  checked={datosDependencia.diagnosticosSeleccionados.includes(
                    diagnostico.id
                  )}
                  onChange={handleChange}
                />
              ))}
              <Form.Check
                type="checkbox"
                label="Otro"
                name="otroDiagnosticoCheckbox"
                checked={mostrarOtroDiagnostico}
                onChange={handleChange}
              />

              {mostrarOtroDiagnostico && (
                <Form.Group className="mb-3">
                  <Form.Label>Especificar otro diagnóstico</Form.Label>
                  <Form.Control
                    type="text"
                    name="otroDiagnostico"
                    value={datosDependencia.otroDiagnostico}
                    onChange={handleChange}
                    placeholder="Ingrese el diagnóstico específico"
                  />
                </Form.Group>
              )}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="indiceBarthel">
                <Form.Label>Índice Barthel</Form.Label>
                <Form.Control
                  type="number"
                  name="indice_barthel"
                  value={datosDependencia.indice_barthel}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Ingrese el índice Barthel (0-100)"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="gradoDependencia">
                <Form.Label>Grado de Dependencia</Form.Label>
                <Form.Control
                  type="text"
                  name="grado_dependencia"
                  value={datosDependencia.grado_dependencia}
                  readOnly
                  placeholder="Se calcula automáticamente"
                  style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                />
                <Form.Text className="text-muted">
                  Se calcula automáticamente según el Índice Barthel
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="causaDependencia">
                <Form.Label>Causa de Dependencia</Form.Label>
                <Form.Control
                  type="text"
                  name="causa_dependencia_tiempo"
                  value={datosDependencia.causa_dependencia_tiempo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="escolaridadId">
                <Form.Label>Escolaridad</Form.Label>
                <Form.Control
                  as="select"
                  name="escolaridad_id"
                  value={datosDependencia.escolaridad_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {nivelesEscolaridad.map((nivel) => (
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
              <Form.Group className="mb-3" controlId="estadoCivil">
                <Form.Label>Estado Civil</Form.Label>
                <Form.Control
                  type="text"
                  name="estado_civil"
                  value={datosDependencia.estado_civil}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="direccionPaciente">
                <Form.Label>Dirección Paciente</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="direccion_paciente"
                  value={datosDependencia.direccion_paciente}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="convivencia">
                <Form.Label>Convivencia</Form.Label>
                <Form.Control
                  type="text"
                  name="convivencia"
                  value={datosDependencia.convivencia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Posee Carne de Discapacidad"
                name="posee_carne_discapacidad"
                checked={datosDependencia.posee_carne_discapacidad}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Recibe Pensión/Subsidio Jubilación"
                name="recibe_pension_subsidio_jubilacion"
                checked={datosDependencia.recibe_pension_subsidio_jubilacion}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="tipoBeneficio">
                <Form.Label>Tipo Beneficio</Form.Label>
                <Form.Control
                  type="text"
                  name="tipo_beneficio"
                  value={datosDependencia.tipo_beneficio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Datos Cuidador */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="nombreCuidador">
                <Form.Label>Nombre Cuidador</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_cuidador"
                  value={datosDependencia.nombre_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="rutCuidador">
                <Form.Label>RUT Cuidador</Form.Label>
                <Form.Control
                  type="text"
                  name="rut_cuidador"
                  value={datosDependencia.rut_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="edadCuidador">
                <Form.Label>Edad Cuidador</Form.Label>
                <Form.Control
                  type="number"
                  name="edad_cuidador"
                  value={datosDependencia.edad_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="fechaNacimientoCuidador">
                <Form.Label>Fecha Nacimiento Cuidador</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento_cuidador"
                  value={datosDependencia.fecha_nacimiento_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="direccionCuidador">
                <Form.Label>Dirección Cuidador</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion_cuidador"
                  value={datosDependencia.direccion_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="ocupacionCuidador">
                <Form.Label>Ocupación Cuidador</Form.Label>
                <Form.Control
                  type="text"
                  name="ocupacion_cuidador"
                  value={datosDependencia.ocupacion_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="parentescoCuidador">
                <Form.Label>Parentesco Cuidador</Form.Label>
                <Form.Control
                  type="text"
                  name="parentesco_cuidador"
                  value={datosDependencia.parentesco_cuidador}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Cuidador recibe estipendio"
                name="cuidador_recibe_estipendio"
                checked={datosDependencia.cuidador_recibe_estipendio}
                onChange={handleChange}
              />
            </Col>
          </Row>
          {/* Puntaje Escala Zarit y control Cesfam */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="puntajeEscalaZarit">
                <Form.Label>Puntaje Escala Zarit</Form.Label>
                <Form.Control
                  type="number"
                  name="puntaje_escala_zarit"
                  value={datosDependencia.puntaje_escala_zarit}
                  onChange={handleChange}
                  min={0}
                  max={88}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Ingrese el puntaje (0-88)"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="nivelSobrecargaZarit">
                <Form.Label>Nivel de Sobrecarga</Form.Label>
                <Form.Control
                  type="text"
                  name="nivel_sobrecarga_zarit"
                  value={datosDependencia.nivel_sobrecarga_zarit}
                  readOnly
                  placeholder="Se calcula automáticamente"
                  style={{
                    backgroundColor: "#f8f9fa",
                    cursor: "not-allowed",
                  }}
                />
                <Form.Text className="text-muted">
                  Se calcula automáticamente según la Escala Zarit
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="controlCesfamDependencia">
                <Form.Label>Control Cesfam</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="control_cesfam_dependencia"
                  value={datosDependencia.control_cesfam_dependencia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="consultaServicioUrgencia">
                <Form.Label>Consulta Servicio Urgencia</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="consulta_servicio_urgencia"
                  value={datosDependencia.consulta_servicio_urgencia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Consulta servicio urgencia y tipo familia */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="tipoFamiliaId">
                <Form.Label>Tipo Familia</Form.Label>
                <Form.Control
                  as="select"
                  name="tipo_familia_id"
                  value={datosDependencia.tipo_familia_id || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {tiposFamilia.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                  <option value="otro">Otro</option>
                </Form.Control>

                {/* Campo de texto que aparece cuando se selecciona "Otro" */}
                {datosDependencia.tipo_familia_id === "otro" && (
                  <Form.Control
                    type="text"
                    name="otro_tipo_familia"
                    value={datosDependencia.otro_tipo_familia || ""}
                    onChange={handleChange}
                    placeholder="Especifique otro tipo de familia"
                    className="mt-2"
                    size="sm"
                  />
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="cicloVitalFamiliarId">
                <Form.Label>Ciclo Vital Familiar</Form.Label>
                <Form.Control
                  as="select"
                  name="ciclo_vital_familiar_id"
                  value={datosDependencia.ciclo_vital_familiar_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {ciclosVitales.map((ciclo) => (
                    <option key={ciclo.id} value={ciclo.id}>
                      {ciclo.ciclo}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          {/* Ciclo vital familiar y factores de riesgo */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="factoresRiesgoFamiliar">
                <Form.Label>Factores Riesgo Familiar</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="factores_riesgo_familiar"
                  value={datosDependencia.factores_riesgo_familiar}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Teléfonos */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="telefono1">
                <Form.Label>Teléfono 1</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefono_1"
                  value={datosDependencia.telefono_1}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="telefono2">
                <Form.Label>Teléfono 2</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefono_2"
                  value={datosDependencia.telefono_2}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Horario llamada y conectividad */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="horarioLlamada">
                <Form.Label>Horario Llamada</Form.Label>
                <Form.Control
                  type="text"
                  name="horario_llamada"
                  value={datosDependencia.horario_llamada}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="conectividad">
                <Form.Label>Conectividad</Form.Label>
                <Form.Control
                  type="text"
                  name="conectividad"
                  value={datosDependencia.conectividad}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" type="submit" className="mt-3">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarFichaDependencia;
