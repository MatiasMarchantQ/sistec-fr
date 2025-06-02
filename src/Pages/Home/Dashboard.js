import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
Chart.register(...registerables);

// Componente de gráfico de barras optimizado
const InstitucionesChart = React.memo(({
  estadisticasPorInstitucion,
  semestre,
  tipoInstitucion, // Nuevo prop
  institucionId    // Nuevo prop
}) => {
  // Filtrar y preparar datos con useMemo
  const chartData = useMemo(() => {
    // Filtrar instituciones según semestre, tipo de institución e institución
    const filteredInstituciones = estadisticasPorInstitucion.filter(i => {
      // Filtro de semestre
      const semestreFiltro = (semestre === 'primero' && i.tipoInstitucion === 'JARDÍN') ||
        (semestre === 'segundo' && i.tipoInstitucion !== 'JARDÍN') ||
        semestre === '';

      // Filtro de tipo de institución
      const tipoInstitucionFiltro = !tipoInstitucion || i.tipoInstitucion === tipoInstitucion;

      // Filtro de institución específica
      const institucionFiltro = !institucionId || i.id.toString() === institucionId;

      return semestreFiltro && tipoInstitucionFiltro && institucionFiltro;
    });

    return {
      labels: filteredInstituciones.map(i => `${i.nombre} (${i.tipoInstitucion})`),
      datasets: [
        {
          label: 'Fichas Iniciales Adultos',
          data: filteredInstituciones.map(i => i.fichasInicialesAdultos || 0),
          backgroundColor: 'rgba(60,141,188,0.6)',
          borderColor: 'rgba(60,141,188,1)',
          borderWidth: 1
        },
        {
          label: 'Reevaluaciones Adultos',
          data: filteredInstituciones.map(i => i.reevaluacionesAdultos || 0),
          backgroundColor: 'rgba(210, 214, 222, 0.6)',
          borderColor: 'rgba(210, 214, 222, 1)',
          borderWidth: 1
        },
        {
          label: 'Fichas Iniciales Infantiles',
          data: filteredInstituciones.map(i => i.fichasInicialesInfantiles || 0),
          backgroundColor: 'rgba(0,192,239,0.6)',
          borderColor: 'rgba(0,192,239,1)',
          borderWidth: 1
        },
        {
          label: 'Reevaluaciones Infantiles',
          data: filteredInstituciones.map(i => i.reevaluacionesInfantiles || 0),
          backgroundColor: 'rgba(243,156,18,0.6)',
          borderColor: 'rgba(243,156,18,1)',
          borderWidth: 1
        }
      ]
    };
  }, [estadisticasPorInstitucion, semestre, tipoInstitucion, institucionId]);

  // Opciones de gráfico optimizadas
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index', // Cambiar a 'index' para mostrar tooltip por columna
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        stacked: false // Desactivar apilamiento
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        stacked: false // Desactivar apilamiento
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 10
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'gray',
        borderWidth: 1
      },
      title: {
        display: true,
        text: semestre === 'primero'
          ? 'Instituciones de Jardín'
          : semestre === 'segundo'
            ? 'Instituciones CESFAM y Postas'
            : 'Todas las Instituciones'
      }
    },
    animation: {
      duration: 300,
      easing: 'easeOutQuad'
    }
  }), [semestre]);

  // Si no hay datos después de filtrar
  if (chartData.labels.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No hay datos disponibles para los filtros seleccionados</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '400px',
        position: 'relative',
        width: '100%'
      }}
    >
      <Bar
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
});

// Función de colores estática y memoizada
const useEstablePalette = (length) => {
  return useMemo(() => {
    const paleta = [
      'rgba(54, 162, 235, 0.6)',   // Azul
      'rgba(255, 99, 132, 0.6)',   // Rosa
      'rgba(75, 192, 192, 0.6)',   // Verde azulado
      'rgba(255, 206, 86, 0.6)',   // Amarillo
      'rgba(153, 102, 255, 0.6)',  // Púrpura
      'rgba(255, 159, 64, 0.6)',   // Naranja
      'rgba(199, 199, 199, 0.6)',  // Gris
      'rgba(83, 102, 255, 0.6)',   // Azul oscuro
      'rgba(40, 159, 64, 0.6)',    // Verde
      'rgba(210, 99, 132, 0.6)'    // Rosa oscuro
    ];

    return Array.from({ length }, (_, index) =>
      paleta[index % paleta.length]
    );
  }, [length]);
};

// Componente de gráfico optimizado
const DiagnosticosChart = ({
  diagnosticos,
  tipo = 'pie',
  title
}) => {
  // Generar colores estables
  const backgroundColor = useEstablePalette(diagnosticos.length);

  // Configuración de opciones optimizada
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 10
        }
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: 'white',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        }
      }
    },
    animation: {
      duration: 300, // Reducir tiempo de animación
      easing: 'easeOutQuad'
    }
  }), []);

  // Datos del gráfico
  const chartData = useMemo(() => ({
    labels: diagnosticos.map(d => d.nombre),
    datasets: [{
      data: diagnosticos.map(d => d.cantidad),
      backgroundColor,
      borderColor: 'white',
      borderWidth: 1
    }]
  }), [diagnosticos, backgroundColor]);

  // Renderizado condicional del tipo de gráfico
  const ChartComponent = tipo === 'pie' ? Pie : Doughnut;

  return (
    <div
      style={{
        height: '300px',
        position: 'relative'
      }}
    >
      <ChartComponent
        data={chartData}
        options={chartOptions}
        plugins={[
          {
            id: 'custom-tooltip',
            afterDraw: (chart) => {
              const ctx = chart.ctx;
              ctx.save();
              ctx.font = '12px Arial';
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.restore();
            }
          }
        ]}
      />
    </div>
  );
};

const Dashboard = () => {
  const { token } = useAuth(); // Cambiar de getToken a token directo
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Usar useMemo para el estado inicial
  const initialDashboardData = useMemo(() => ({
    pacientesAdultos: {
      diagnosticos: [],
      fichas: {
        totalFichas: 0,
        totalPacientes: 0,
        fichasIniciales: 0,
        totalReevaluaciones: 0,
        pacientesReevaluados: 0
      }
    },
    pacientesInfantiles: {
      diagnosticos: [],
      fichas: {
        totalFichas: 0,
        totalPacientes: 0,
        fichasIniciales: 0,
        totalReevaluaciones: 0,
        pacientesReevaluados: 0
      }
    },
    estudiantes: {
      total: 0,
      asignados: [{ total: 0 }]
    },
    estadisticasPorInstitucion: []
  }), []);

  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: currentYear,
    semestre: currentMonth <= 6 ? 'primero' : 'segundo',
    tipoInstitucion: '',
    institucionId: ''
  });

  const [tiposInstituciones, setTiposInstituciones] = useState([]);
  const [instituciones, setInstituciones] = useState([]);

  const [tendencias, setTendencias] = useState({
    evolucionPacientes: [],
    evolucionDiagnosticos: {
      adultos: [],
      infantiles: []
    },
    evolucionReevaluaciones: []
  });

  // Cargar tipos de instituciones con useCallback
  const cargarTiposInstituciones = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/obtener/tipos-instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTiposInstituciones(response.data);
    } catch (error) {
      console.error('Error al cargar tipos de instituciones', error);
      toast.error('No se pudo cargar los tipos de instituciones');
    }
  }, [token]);

  // Cargar instituciones con useCallback
  const cargarInstituciones = useCallback(async () => {
    if (!token || !filters.tipoInstitucion) {
      setInstituciones([]);
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/instituciones`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          tipo: filters.tipoInstitucion,
          estado: 'activas'
        }
      });
      setInstituciones(response.data.instituciones || []);
    } catch (error) {
      console.error('Error al cargar instituciones', error);
      toast.error('No se pudo cargar las instituciones');
    }
  }, [token, filters.tipoInstitucion]);

  // Cargar dashboard con useCallback
  const cargarDashboard = useCallback(async () => {
    if (!token) return;

    const { year, semestre, tipoInstitucion, institucionId } = filters;

    // Calcular fechas
    const fechaInicio = semestre === 'primero'
      ? `${year}-01-01T00:00:00Z`
      : `${year}-07-01T00:00:00Z`;

    const fechaFin = semestre === 'primero'
      ? `${year}-06-30T23:59:59Z`
      : `${year}-12-31T23:59:59Z`;

    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/reportes/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          year,
          fechaInicio,
          fechaFin,
          institucionId,
          semestre: semestre === '' ? null : semestre,
          tipoInstitucion
        }
      });
      setDashboardData(response.data);
      setTendencias(response.data.tendencias); // Agregar tendencias al estado
    } catch (error) {
      console.error('Error al cargar dashboard', error);
      toast.error('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // Efectos para cargar datos
  useEffect(() => {
    cargarTiposInstituciones();
  }, [cargarTiposInstituciones]);

  useEffect(() => {
    cargarInstituciones();
  }, [cargarInstituciones]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  // Manejar cambios de filtros con useCallback
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      // Si cambia el tipo de institución, resetear institución
      if (key === 'tipoInstitucion') {
        return {
          ...prev,
          [key]: value,
          institucionId: ''
        };
      }
      return {
        ...prev,
        [key]: value
      };
    });
  }, []);

  // Función de generación de colores más estable
  const generarColoresPaleta = (cantidad) => {
    const paleta = [
      'rgba(54, 162, 235, 0.6)',   // Azul
      'rgba(255, 99, 132, 0.6)',   // Rosa
      'rgba(75, 192, 192, 0.6)',   // Verde azulado
      'rgba(255, 206, 86, 0.6)',   // Amarillo
      'rgba(153, 102, 255, 0.6)',  // Púrpura
      'rgba(255, 159, 64, 0.6)',   // Naranja
      'rgba(199, 199, 199, 0.6)',  // Gris
      'rgba(83, 102, 255, 0.6)',   // Azul oscuro
      'rgba(40, 159, 64, 0.6)',    // Verde
      'rgba(210, 99, 132, 0.6)'    // Rosa oscuro
    ];

    // Si se necesitan más colores, repetir la paleta
    return Array.from({ length: cantidad }, (_, index) =>
      paleta[index % paleta.length]
    );
  };

  const ResumenEvolucionPacientes = ({ tendencias, filters }) => {
    const esPrimerSemestre = ['primero', 'primer'].includes(filters.semestre);

    const datosAno = tendencias.evolucionPacientes.find(item => item.year === filters.year);

    const datosInfantiles = datosAno?.infantiles || {};
    const datosAdultos = datosAno?.adultos || {};

    return (
      <div className='container-fluid'>
        <div className="row">
          {/* Pacientes Infantiles */}
          <div className="col-md-6 mb-4">
            <div className="card border-left-info shadow h-100">
              <div className="card-header text-center bg-info text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-child mr-2"></i>Pacientes Infantiles
                </h5>
              </div>
              <div className="card-body">
                <div className="info-box mb-3">
                  <span className="info-box-icon bg-info"><i className="fas fa-child"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Pacientes</span>
                    <span className="info-box-number">{datosInfantiles.totalPacientes || 0}</span>
                  </div>
                </div>
                <div className="info-box mb-3">
                  <span className="info-box-icon bg-success"><i className="fas fa-file-medical"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Fichas Iniciales</span>
                    <span className="info-box-number">{datosInfantiles.fichasIniciales || 0}</span>
                  </div>
                </div>
                <div className="info-box">
                  <span className="info-box-icon bg-warning"><i className="fas fa-redo"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Reevaluaciones</span>
                    <span className="info-box-number">{datosInfantiles.totalReevaluaciones || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pacientes Adultos */}
          <div className="col-md-6 mb-4">
            <div className="card border-left-success shadow h-100">
              <div className="card-header text-center bg-danger text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-users mr-2"></i>Pacientes Adultos
                </h5>
              </div>
              <div className="card-body">
                <div className="info-box mb-3">
                  <span className="info-box-icon bg-info"><i className="fas fa-users"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Pacientes</span>
                    <span className="info-box-number">{datosAdultos.totalPacientes || 0}</span>
                  </div>
                </div>
                <div className="info-box mb-3">
                  <span className="info-box-icon bg-success"><i className="fas fa-file-medical"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Fichas Iniciales</span>
                    <span className="info-box-number">{datosAdultos.fichasIniciales || 0}</span>
                  </div>
                </div>
                <div className="info-box">
                  <span className="info-box-icon bg-warning"><i className="fas fa-redo"></i></span>
                  <div className="info-box-content">
                    <span className="info-box-text">Reevaluaciones</span>
                    <span className="info-box-number">{datosAdultos.totalReevaluaciones || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnósticos Infantiles - YA NO HAY FILA ANIDADA */}
          {dashboardData.pacientesInfantiles.diagnosticos.length > 0 && (
            <div className="col-md-6 mb-4 d-flex">
              <div className="card card-info flex-fill d-flex flex-column shadow h-100">
                <div className="card-header">
                  <h3 className="card-title text-light">Diagnósticos de Pacientes Infantiles</h3>
                </div>
                <div className="card-body flex-fill">
                  <DiagnosticosChart
                    diagnosticos={dashboardData.pacientesInfantiles.diagnosticos}
                    tipo="doughnut"
                    title="Diagnósticos Infantiles"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Diagnósticos Adultos */}
          {dashboardData.pacientesAdultos.diagnosticos.length > 0 && (
            <div className="col-md-6 mb-4 d-flex">
              <div className="card card-danger flex-fill d-flex flex-column shadow h-100">
                <div className="card-header">
                  <h3 className="card-title text-light">Diagnósticos de Pacientes Adultos</h3>
                </div>
                <div className="card-body flex-fill">
                  <DiagnosticosChart
                    diagnosticos={dashboardData.pacientesAdultos.diagnosticos}
                    tipo="pie"
                    title="Diagnósticos Adultos"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  // Estado de carga
  if (loading) {
    return (
      <div className="content-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="content">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className='font-weight-bold' style={{ 'color': 'var(--color-accent)' }}>Dashboard General</h1>
            </div>
            <div className="col-sm-6">
              <div className="float-right d-flex">
                {/* Selector de Año */}
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                  className="form-control mr-2"
                >
                  {[...Array(6)].map((_, index) => {
                    const yearOption = currentYear - index;
                    return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                  })}
                  <option value={0}>Todos los Años</option>
                </select>

                {/* Selector de Semestre */}
                <select
                  value={filters.semestre}
                  onChange={(e) => handleFilterChange('semestre', e.target.value)}
                  className="form-control ml-2 mr-2"
                >
                  <option value="">Ambos Semestres</option>
                  <option value="primero">Primer Semestre</option>
                  <option value="segundo">Segundo Semestre</option>
                </select>

                {/* Selector de Tipo de Institución */}
                <select
                  value={filters.tipoInstitucion}
                  onChange={(e) => handleFilterChange('tipoInstitucion', e.target.value)}
                  className="form-control mr-2"
                >
                  <option value="">Todos los Tipos</option>
                  {tiposInstituciones.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.tipo}
                    </option>
                  ))}
                </select>

                {/* Selector de Institución */}
                <select
                  value={filters.institucionId}
                  onChange={(e) => handleFilterChange('institucionId', e.target.value)}
                  className="form-control"
                  disabled={!filters.tipoInstitucion}
                >
                  <option value="">
                    {filters.tipoInstitucion
                      ? 'Seleccione una Institución'
                      : 'Primero seleccione un Tipo de Institución'}
                  </option>
                  {instituciones.map(institucion => (
                    <option key={institucion.id} value={institucion.id}>
                      {institucion.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Resumen de Estudiantes */}
          <div className="row">
            <div className="col-lg-6 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{dashboardData.estudiantes.total}</h3>
                  <p>Total de Estudiantes</p>
                </div>
                <div className="icon">
                  <i className="fas fa-users"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-6">
              <div className="small-box bg-primary">
                <div className="inner">
                  <h3>{dashboardData.estudiantes.asignados[0]?.total || 0}</h3>
                  <p>Estudiantes Asignados</p>
                </div>
                <div className="icon">
                  <i className="fas fa-user-check"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos de Tendencias */}
          <div className="container-fluid">
            <div className="row">
              {/* Gráfico de Evolución de Pacientes Ingresados */}
              <div className="col-md-12 mb-3">
                <div className="card-body">
                  {(filters.year !== 0 && filters.semestre !== 'ambos') ? (
                    <ResumenEvolucionPacientes
                      tendencias={tendencias}
                      filters={filters}
                    />
                  ) : (
                    <Line
                      data={{
                        labels: tendencias.evolucionPacientes.map(item => item.year),
                        datasets: [
                          {
                            label: 'Pacientes Adultos',
                            data: tendencias.evolucionPacientes.map(item =>
                              item.adultos?.totalPacientes || 0
                            ),
                            backgroundColor: 'rgba(60,141,188,0.6)',
                            borderColor: 'rgba(60,141,188,1)',
                            borderWidth: 1,
                            fill: true
                          },
                          {
                            label: 'Pacientes Infantiles',
                            data: tendencias.evolucionPacientes.map(item =>
                              item.infantiles?.totalPacientes || 0
                            ),
                            backgroundColor: 'rgba(255,99,132,0.6)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Evolución de Pacientes Ingresados'
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Año'
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Cantidad de Pacientes'
                            },
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Estadísticas por institución */}
              {dashboardData.estadisticasPorInstitucion.length > 0 && (
                <div className="row">
                  <div className="col-12 ml-2">
                    <div className="card card-warning shadow h-100">
                      <div className="card-header">
                        <h3 className="card-title">Distribución de Fichas por Institución</h3>
                      </div>
                      <div className="card-body">
                        <InstitucionesChart
                          estadisticasPorInstitucion={dashboardData.estadisticasPorInstitucion}
                          semestre={filters.semestre}
                          tipoInstitucion={filters.tipoInstitucion}
                          institucionId={filters.institucionId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;