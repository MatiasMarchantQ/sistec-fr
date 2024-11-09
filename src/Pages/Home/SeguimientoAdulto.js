import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Form, Button, Table, Card, 
  Modal, Alert, Row, Col 
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Importaciones de componentes
import PrimerLlamado from './PrimerLlamado';
import SegundoLlamado from './SegundoLlamado';
import TercerLlamado from './TercerLlamado';

// Función de procesamiento de datos
const procesarSeguimiento = (seguimientoData = {}) => {
  return {
    fecha: seguimientoData.fecha || new Date().toISOString().split('T')[0],
    pacienteId: seguimientoData.pacienteId || null,
    fichaId: seguimientoData.fichaId || null,
    numeroLlamado: seguimientoData.numeroLlamado || 1,
    riesgoInfeccion: {
      herida: !!seguimientoData.riesgoInfeccion?.herida,
      heridaDetalle: seguimientoData.riesgoInfeccion?.heridaDetalle || '',
      dolorNeuropatico: !!seguimientoData.riesgoInfeccion?.dolorNeuropatico,
      intensidadDolor: seguimientoData.riesgoInfeccion?.intensidadDolor || 0,
      intervencionDolor: seguimientoData.riesgoInfeccion?.intervencionDolor || ''
    },
    riesgoGlicemia: {
      hipoglicemia: !!seguimientoData.riesgoGlicemia?.hipoglicemia,
      intervencionHipoglicemia: seguimientoData.riesgoGlicemia?.intervencionHipoglicemia || '',
      hiperglicemia: !!seguimientoData.riesgoGlicemia?.hiperglicemia,
      intervencionHiperglicemia: seguimientoData.riesgoGlicemia?.intervencionHiperglicemia || ''
    },
    // Continúa con el resto de los objetos anidados de manera similar
    riesgoHipertension: {
      dolorPecho: !!seguimientoData.riesgoHipertension?.dolorPecho,
      dolorCabeza: !!seguimientoData.riesgoHipertension?.dolorCabeza,
      zumbidoOidos: !!seguimientoData.riesgoHipertension?.zumbidoOidos,
      nauseaVomitos: !!seguimientoData.riesgoHipertension?.nauseaVomitos
    },
    // Resto de las propiedades con valores por defecto
    adherencia: {
      olvido: !!seguimientoData.adherencia?.olvido,
      horaIndicada: !!seguimientoData.adherencia?.horaIndicada,
      dejaRemedio: !!seguimientoData.adherencia?.dejaRemedio,
      dejaRemedioMal: !!seguimientoData.adherencia?.dejaRemedioMal
    },
    adherenciaTratamiento: {
      moriskyGreen: {
        olvidaMedicamento: !!seguimientoData.adherenciaTratamiento?.moriskyGreen?.olvidaMedicamento,
        tomaHoraIndicada: !!seguimientoData.adherenciaTratamiento?.moriskyGreen?.tomaHoraIndicada,
        dejaMedicamentoBien: !!seguimientoData.adherenciaTratamiento?.moriskyGreen?.dejaMedicamentoBien,
        dejaMedicamentoMal: !!seguimientoData.adherenciaTratamiento?.moriskyGreen?.dejaMedicamentoMal
      },
      adherencia: seguimientoData.adherenciaTratamiento?.adherencia ?? true
    },
    efectosSecundarios: {
      presente: !!seguimientoData.efectosSecundarios?.presente,
      detalle: seguimientoData.efectosSecundarios?.detalle || '',
      intervencion: seguimientoData.efectosSecundarios?.intervencion || ''
    },
    nutricion: {
      comidasDia: seguimientoData.nutricion?.comidasDia || 0,
      comidas: {
        desayuno: seguimientoData.nutricion?.comidas?.desayuno || '',
        almuerzo: seguimientoData.nutricion?.comidas?.almuerzo || '',
        once: seguimientoData.nutricion?.comidas?.once || '',
        cena: seguimientoData.nutricion?.comidas?.cena || ''
      },
      alimentosNoRecomendados: seguimientoData.nutricion?.alimentosNoRecomendados || ''
    },
    actividadFisica: {
      realiza: !!seguimientoData.actividadFisica?.realiza,
      tipo: seguimientoData.actividadFisica?.tipo || '',
      frecuencia: seguimientoData.actividadFisica?.frecuencia || ''
    },
    eliminacion: {
      poliuria: !!seguimientoData.eliminacion?.poliuria,
      urgenciaMiccional: !!seguimientoData.eliminacion?.urgenciaMiccional,
      tenesmoVesical: !!seguimientoData.eliminacion?.tenesmoVesical,
      intervencion: seguimientoData.eliminacion?.intervencion || ''
    },
    sintomasDepresivos: seguimientoData.sintomasDepresivos || '',
    autoeficacia: {
      comerCada4Horas: seguimientoData.autoeficacia?.comerCada4Horas || 0,
      continuarDieta: seguimientoData.autoeficacia?.continuarDieta || 0,
      escogerAlimentos: seguimientoData.autoeficacia?.escogerAlimentos || 0,
      hacerEjercicio: seguimientoData.autoeficacia?.hacerEjercicio || 0,
      prevenirBajaAzucar: seguimientoData.autoeficacia?.prevenirBajaAzucar || 0,
      saberQueHacer: seguimientoData.autoeficacia?.saberQueHacer || 0,
      evaluarCambios: seguimientoData.autoeficacia?.evaluarCambios || 0,
      controlarDiabetes: seguimientoData.autoeficacia?.controlarDiabetes || 0
    }
  };
};

const SeguimientoAdulto = ({ pacienteId, fichaId }) => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Estado inicial con función de procesamiento
  const [seguimiento, setSeguimiento] = useState(() => 
    procesarSeguimiento({ pacienteId, fichaId })
  );

  const [seguimientosAnteriores, setSeguimientosAnteriores] = useState([]);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar seguimientos anteriores
  useEffect(() => {
    if (pacienteId) {
      cargarSeguimientosAnteriores();
    }
  }, [pacienteId]);

  // Función para cargar seguimientos anteriores
  const cargarSeguimientosAnteriores = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios .get(
        `${process.env.REACT_APP_API_URL}/seguimientos/adulto/${pacienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const procesados = response.data.map(procesarSeguimiento);
      setSeguimientosAnteriores(procesados);
    } catch (error) {
      console.error('Error al cargar seguimientos anteriores', error);
      toast.error('Error al cargar los seguimientos anteriores');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar seguimiento
  const guardarSeguimiento = async () => {
    try {
      const token = getToken();
      const seguimientoValidado = procesarSeguimiento(seguimiento);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/seguimientos/adulto`,
        seguimientoValidado,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Seguimiento guardado correctamente');
      setSeguimientosAnteriores(prev => [...prev, procesarSeguimiento(response.data)]);
      setSeguimiento(procesarSeguimiento({ pacienteId, fichaId })); // Resetear el formulario
    } catch (error) {
      console.error('Error al guardar seguimiento', error);
      toast.error('Error al guardar el seguimiento');
    }
  };

  // Renderizar formulario de seguimiento
  const renderFormularioSeguimiento = () => {
    return (
      <Container>
        <PrimerLlamado seguimiento={seguimiento} setSeguimiento={setSeguimiento} />
        <SegundoLlamado seguimiento={seguimiento} setSeguimiento={setSeguimiento} />
        <TercerLlamado seguimiento={seguimiento} setSeguimiento={setSeguimiento} />
        
        <Button variant="primary" onClick={guardarSeguimiento}>
          Guardar Seguimiento
        </Button>
      </Container>
    );
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Seguimiento de Adulto - Telecuidado</h2>
      
      {loading ? <p>Cargando...</p> : renderFormularioSeguimiento()}

      <Card className="mt-4">
        <Card.Header>Seguimientos Anteriores</Card.Header>
        <Card.Body>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Número de Llamado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seguimientosAnteriores.map((seguimiento, index) => (
                <tr key={index}>
                  <td>{seguimiento.fecha}</td>
                  <td>{seguimiento.numeroLlamado}</td>
                  <td>
                    <Button 
                      variant="info" 
                      onClick={() => setSelectedSeguimiento(seguimiento)}
                    >
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal 
        show={!!selectedSeguimiento} 
        onHide={() => setSelectedSeguimiento(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Seguimiento - {selectedSeguimiento?.fecha}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSeguimiento && (
            <div>
              <p><strong>Número de Llamado:</strong> {selectedSeguimiento.numeroLlamado}</p>
              <h5>Riesgo de Infección</h5>
              <p><strong>Herida en pies:</strong> {selectedSeguimiento.riesgoInfeccion.herida ? 'Sí ' : 'No'}</p>
              {selectedSeguimiento.riesgoInfeccion.herida && (
                <p><strong>Detalle:</strong> {selectedSeguimiento.riesgoInfeccion.heridaDetalle}</p>
              )}
              <h5>Riesgo de Glicemia</h5>
              <p><strong>Hipoglicemia:</strong> {selectedSeguimiento.riesgoGlicemia.hipoglicemia ? 'Sí' : 'No'}</p>
              <p><strong>Intervención Hipoglicemia:</strong> {selectedSeguimiento.riesgoGlicemia.intervencionHipoglicemia}</p>
              <p><strong>Hiperglicemia:</strong> {selectedSeguimiento.riesgoGlicemia.hiperglicemia ? 'Sí' : 'No'}</p>
              <p><strong>Intervención Hiperglicemia:</strong> {selectedSeguimiento.riesgoGlicemia.intervencionHiperglicemia}</p>
              <h5>Riesgo de Hipertensión</h5>
              <p><strong>Dolor de pecho:</strong> {selectedSeguimiento.riesgoHipertension.dolorPecho ? 'Sí' : 'No'}</p>
              <p><strong>Dolor de cabeza:</strong> {selectedSeguimiento.riesgoHipertension.dolorCabeza ? 'Sí' : 'No'}</p>
              <p><strong>Zumbido de oídos:</strong> {selectedSeguimiento.riesgoHipertension.zumbidoOidos ? 'Sí' : 'No'}</p>
              <p><strong>Náuseas y vómitos:</strong> {selectedSeguimiento.riesgoHipertension.nauseaVomitos ? 'Sí' : 'No'}</p>
              <h5>Adherencia al Tratamiento</h5>
              <p><strong>Adhiere al tratamiento:</strong> {selectedSeguimiento.adherenciaTratamiento.adherencia ? 'Sí' : 'No'}</p>
              <h5>Efectos Secundarios</h5>
              <p><strong>Presenta efectos secundarios:</strong> {selectedSeguimiento.efectosSecundarios.presente ? 'Sí' : 'No'}</p>
              {selectedSeguimiento.efectosSecundarios.presente && (
                <p><strong>Detalle:</strong> {selectedSeguimiento.efectosSecundarios.detalle}</p>
              )}
              <h5>Nutrición</h5>
              <p><strong>Comidas al día:</strong> {selectedSeguimiento.nutricion.comidasDia}</p>
              <p><strong>Desayuno:</strong> {selectedSeguimiento.nutricion.comidas.desayuno}</p>
              <p><strong>Almuerzo:</strong> {selectedSeguimiento.nutricion.comidas.almuerzo}</p>
              <p><strong>Once:</strong> {selectedSeguimiento.nutricion.comidas.once}</p>
              <p><strong>Cena:</strong> {selectedSeguimiento.nutricion.comidas.cena}</p>
              <h5>Actividad Física</h5>
              <p><strong>Realiza actividad física:</strong> {selectedSeguimiento.actividadFisica.realiza ? 'Sí' : 'No'}</p>
              {selectedSeguimiento.actividadFisica.realiza && (
                <p><strong>Tipo:</strong> {selectedSeguimiento.actividadFisica.tipo}</p>
              )}
              <h5>Eliminación</h5>
              <p><strong>Poliuria:</strong> {selectedSeguimiento.eliminacion.poliuria ? 'Sí' : 'No'}</p>
              <p><strong>Urgencia Miccional:</strong> {selectedSeguimiento.eliminacion.urgenciaMiccional ? 'Sí' : 'No'}</p>
              <p><strong>Tenesmo Vesical:</strong> {selectedSeguimiento.eliminacion.tenesmoVesical ? 'Sí' : 'No'}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SeguimientoAdulto;