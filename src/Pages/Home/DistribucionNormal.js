import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Generador de colores para múltiples diagnósticos
const generarPaletaColores = (cantidad) => {
    const colores = [
        { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' },
        { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' },
        { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' },
        { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' },
        { border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)' }
    ];
    return colores.slice(0, cantidad);
};

const DistribucionDiagnosticos = ({ 
    datosProgreso = {
        diagnosticos: [],
        pacientes: [],
        reevaluaciones: []
    },
    title = 'Evolución del Progreso Clínico'
}) => {
    // Definir el estado inicial de tipoProgreso
    const [tipoProgreso, setTipoProgreso] = useState('diagnosticos');

    const chartData = useMemo(() => {
        let datosAMostrar = [];
        
        switch(tipoProgreso) {
            case 'diagnosticos':
                datosAMostrar = datosProgreso.diagnosticos;
                break;
            case 'pacientes':
                datosAMostrar = datosProgreso.pacientes;
                break;
            case 'reevaluaciones':
                datosAMostrar = datosProgreso.reevaluaciones;
                break;
            default:
                datosAMostrar = datosProgreso.diagnosticos;
        }

        // Filtrar los top N diagnósticos más frecuentes
        const topDiagnosticos = datosAMostrar
            .filter(año => año.diagnosticos.length > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Preparar colores
        const colores = generarPaletaColores(topDiagnosticos.length);

        const datasets = topDiagnosticos.map((año, index) => {
            const { border, background } = colores[index];

            return {
                label: año.diagnosticos[0].nombre, // Tomar el nombre del primer diagnóstico
                data: año.diagnosticos.map(diagnostico => ({
                    x: año.año,
                    y: parseFloat(diagnostico.porcentaje)
                })),
                borderColor: border,
                backgroundColor: background,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 2
            };
        });

        const anos = topDiagnosticos.map(año => año.año).sort();

        return {
            labels: anos,
            datasets
        };
    }, [datosProgreso, tipoProgreso]);

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            title: {
                display: true,
                text: title
            },
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Año'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Porcentaje (%)'
                },
                beginAtZero: true,
                max: 100
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="flex space-x-2">
                    {['diagnosticos', 'pacientes', 'reevaluaciones'].map(tipo => (
                        <button 
                            key={tipo}
                            onClick={() => setTipoProgreso(tipo)}
                            className={`px-3 py-1 rounded ${
                                tipoProgreso === tipo 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default DistribucionDiagnosticos;