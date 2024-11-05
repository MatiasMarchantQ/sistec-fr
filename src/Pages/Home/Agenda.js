import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agenda.css';

const Agenda = ({ onFichaSelect, setActiveComponent }) => {
  const currentDate = new Date();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const [selectedCentro, setSelectedCentro] = useState(null);

  const getMonthName = (monthIndex) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthIndex];
  };

  const handleFichaClick = (fichaId) => {
    onFichaSelect(fichaId);
    setActiveComponent('ficha-clinica');
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const getSemester = () => {
    if (month >= 2 && month <= 6) {
      return '1er Semestre';
    } else if (month >= 7 && month <= 11) {
      return '2do Semestre';
    } else {
      return 'Fuera de Semestre';
    }
  };

  const getPrevMonth = () => {
    return month === 0 ? getMonthName(11) : getMonthName(month - 1);
  };

  const getNextMonth = () => {
    return month === 11 ? getMonthName(0) : getMonthName(month + 1);
  };

  const handleCentroClick = (centroId) => {
    // Si ya está seleccionado, lo deseleccionamos; si no, lo seleccionamos
    setSelectedCentro(selectedCentro === centroId ? null : centroId);
  };

  // Datos de ejemplo
  const rotaciones = [
    {
      periodo: '01/10 al 15/10 del 2024',
      instituciones: [
        {
          id: 1,
          nombre: 'CESFAM Carlos Trupp',
          receptora: 'Enf. Pérez',
          estudiantes: ['Juan Díaz', 'María López'],
          fichasClinicas: [
            {
              id: 'F001',
              paciente: 'Pedro González',
              fecha: '01/10/2024',
              diagnosticoDSM: 'Riesgo',
            },
            {
              id: 'F002',
              paciente: 'Ana Martínez',
              fecha: '03/10/2024',
              diagnosticoDSM: 'Retraso',
            },
          ],
        },
        {
          id: 2,
          nombre: 'Clínica Lircay',
          receptora: 'Lic. Gómez',
          estudiantes: ['Carlos Pérez', 'Elena Ramírez'],
          fichasClinicas: [
            {
              id: 'F003',
              paciente: 'María Rodríguez',
              fecha: '05/10/2024',
              diagnosticoDSM: 'Retraso',
            },
          ],
        },
      ],
    },
    {
      periodo: '16/10 al 31/10 del 2024',
      instituciones: [
        {
          id: 3,
          nombre: 'Hospital de San Javier',
          receptora: 'Dr. Castillo',
          estudiantes: ['Luis García', 'Carmen Rivera'],
          fichasClinicas: [
            {
              id: 'F004',
              paciente: 'Luis Suárez',
              fecha: '17/10/2024',
              diagnosticoDSM: 'Riesgo',
            },
            {
              id: 'F005',
              paciente: 'Carmen Rivera',
              fecha: '18/10/2024',
              diagnosticoDSM: 'Riesgo',
            },
          ],
        },
        {
          id: 4,
          nombre: 'Clínica San Fernando',
          receptora: 'Lic. Morales',
          estudiantes: ['Gabriela Torres', 'Manuel Castillo'],
          fichasClinicas: [
            {
              id: 'F006',
              paciente: 'Gabriela Torres',
              fecha: '20/10/2024',
              diagnosticoDSM: 'Riesgo',
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="agenda-container">
      <div className="badge badge-info p-2 mb-4">
        {getSemester()}
      </div>

      {/* Navegación entre meses */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-secondary" onClick={handlePrevMonth}>
          <i className="fas fa-chevron-left"></i> {getPrevMonth()}
        </button>
        <h3 style={{ color: '#388DE2' }}>{getMonthName(month)} {year}</h3>
        <button className="btn btn-secondary" onClick={handleNextMonth}>
          {getNextMonth()} <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Cards de rotación agrupadas */}
      <div className="row">
        {rotaciones.map((rotacion, index) => (
          <div key={index} className="col-lg-6 col-md-12 mb-4">
            <div className="card card-primary shadow-lg">
              <div className="card-header bg-gradient-primary">
                <h5 className="card-title">{rotacion.periodo}</h5>
              </div>
              <div className="card-body">
                {rotacion.instituciones.map((institucion) => (
                  <div
                    key={institucion.id}
                    className="card card-secondary mb-3 shadow-sm"
                    onClick={() => handleCentroClick(institucion.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="card-title">
                        <i className="fas fa-hospital-alt mr-2"></i> {institucion.nombre}
                      </h6>
                      <span><i className="fas fa-user-md"></i> {institucion.receptora}</span>
                    </div>
                    <div className="card-body p-2">
                      <strong>Estudiantes asignados:</strong>
                      <ul>
                        {institucion.estudiantes.map((estudiante, index) => (
                          <li key={index}>
                            <i className="fas fa-user-graduate"></i> {estudiante}
                          </li>
                        ))}
                      </ul>
                      {/* Mostrar fichas clínicas solo si el centro ha sido seleccionado */}
                      {selectedCentro === institucion.id && (
                        <div className="fichas-clinicas mt-3">
                          <h6><i className="fas fa-file-medical-alt"></i> Fichas Clínicas:</h6>
                          <ul>
                            {institucion.fichasClinicas.map((ficha) => (
                             <li
                                key={ficha.id}
                                onClick={() => handleFichaClick(ficha.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                {ficha.paciente} - {ficha.fecha}: {ficha.diagnosticoDSM}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aviso final */}
      <div className="alert alert-warning mt-4 shadow-lg">
        <i className="fas fa-exclamation-triangle"></i> <strong>Importante:</strong> No se asisten los fines de semana ni feriados irrenunciables.
      </div>
    </div>
  );
};

export default Agenda;
