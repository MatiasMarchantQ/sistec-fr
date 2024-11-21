import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Reevaluacion = ({ fichaClinica, onSave, tipo }) => {
  const { getToken } = useAuth();
  
  // Inicializa el estado con todos los campos de fichaClinica
  const [formData, setFormData] = useState({
    diagnostico: fichaClinica.diagnostico || '',
    ocupacion: fichaClinica.ocupacion || '',
    conQuienVive: fichaClinica.conQuienVive || '',
    horarioLlamada: fichaClinica.horarioLlamada || '',
    direccion: fichaClinica.direccion || '',
    escolaridad: fichaClinica.escolaridad?.nivel || '',
    valorHbac1: fichaClinica.factoresRiesgo?.valorHbac1 || '',
    alcoholDrogas: fichaClinica.factoresRiesgo?.alcoholDrogas || false,
    tabaquismo: fichaClinica.factoresRiesgo?.tabaquismo || false,
    otros: fichaClinica.factoresRiesgo?.otros || '',
    // Campos específicos para niños
    puntajeDPM: fichaClinica.evaluacionPsicomotora?.puntajeDPM || '',
    diagnosticoDSM: fichaClinica.evaluacionPsicomotora?.diagnosticoDSM || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/fichas-clinicas/${fichaClinica.id}`, {
        ...fichaClinica,
        ...formData, // Combina los datos existentes con los nuevos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Llama a la función onSave para refrescar los datos
      onSave();
    } catch (error) {
      console.error('Error al guardar la reevaluación:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h5 className="border-bottom pb-2">Datos Personales</h5>
      <div className="row mb-4">
        <div className="col-md-6">
          <p><strong>ID:</strong> {fichaClinica.id}</p>
          <p><strong>RUT:</strong> {fichaClinica.paciente?.rut}</p>
          <p><strong>Nombres:</strong> {fichaClinica.paciente?.nombres}</p>
          <p><strong>Apellidos:</strong> {fichaClinica.paciente?.apellidos}</p>
          <p><strong>Edad:</strong> {fichaClinica.paciente?.edad} Años</p>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formDireccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formConQuienVive">
            <Form.Label>Con quién vive</Form.Label>
            <Form.Control
              type="text"
              name="conQuienVive"
              value={formData.conQuienVive}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>
      </div>

      <h5 className="border-bottom pb-2">Información Médica</h5>
      <div className="row mb-4">
        <div className="col-md-6">
          <Form.Group controlId="formDiagnostico">
            <Form.Label>Diagnóstico</Form.Label>
            <Form.Control
              type="text"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEscolaridad">
            < Form.Label>Escolaridad</Form.Label>
            <Form.Control
              type="text"
              name="escolaridad"
              value={formData.escolaridad}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formOcupacion">
            <Form.Label>Ocupación</Form.Label>
            <Form.Control
              type="text"
              name="ocupacion"
              value={formData.ocupacion}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formHorarioLlamada">
            <Form.Label>Horario de Llamada</Form.Label>
            <Form.Control
              type="text"
              name="horarioLlamada"
              value={formData.horarioLlamada}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>
      </div>

      {tipo === 'infantil' && (
        <>
          <h5 className="border-bottom pb-2">Evaluación Psicomotora</h5>
          <div className="row mb-4">
            <div className="col-md-6">
              <Form.Group controlId="formPuntajeDPM">
                <Form.Label>Puntaje DPM</Form.Label>
                <Form.Control
                  type="text"
                  name="puntajeDPM"
                  value={formData.puntajeDPM}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formDiagnosticoDSM">
                <Form.Label>Diagnóstico DSM</Form.Label>
                <Form.Control
                  type="text"
                  name="diagnosticoDSM"
                  value={formData.diagnosticoDSM}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>
        </>
      )}

      <h5 className="border-bottom pb-2">Factores de Riesgo</h5>
      <div className="row mb-4">
        <div className="col-md-6">
          <Form.Group controlId="formValorHbac1">
            <Form.Label>Valor HbA1c</Form.Label>
            <Form.Control
              type="text"
              name="valorHbac1"
              value={formData.valorHbac1}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formAlcoholDrogas">
            <Form.Check
              type="checkbox"
              name="alcoholDrogas"
              label="Consumo de Alcohol/Drogas"
              checked={formData.alcoholDrogas}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formTabaquismo">
            <Form.Check
              type="checkbox"
              name="tabaquismo"
              label="Tabaquismo"
              checked={formData.tabaquismo}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
      </div>

      <Form.Group controlId="formOtros">
        <Form.Label>Otros Factores de Riesgo</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="otros"
          value={formData.otros}
          onChange={handleChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Guardar Reevaluación
      </Button>
    </Form>
  );
};

export default Reevaluacion;