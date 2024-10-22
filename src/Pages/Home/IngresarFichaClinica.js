// FichaClinica.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FichaClinicaInfantil from './FichaClinicaInfantil';
import FichaClinicaAdultoMayor from './FichaClinicaAdultoMayor';

const IngresarFichaClinica = () => {
  const navigate = useNavigate();
  const [tipoFicha, setTipoFicha] = useState('');

  const handleVolver = () => {
    navigate(-1);
  };

  const handleIngresar = () => {
    // Lógica para ingresar la ficha
    console.log('Ficha ingresada'); // Temporal
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4" style={{ color: '#388DE2' }}>Ficha Clínica</h2>
      
      <div className="form-group">
        <label>Tipo de Ficha</label>
        <select className="form-control" value={tipoFicha} onChange={(e) => setTipoFicha(e.target.value)}>
          <option value="">Seleccione...</option>
          <option value="adultoMayor">Adulto Mayor</option>
          <option value="infantil">Infantil</option>
        </select>
      </div>

      {tipoFicha === 'infantil' && (
        <FichaClinicaInfantil onVolver={handleVolver} onIngresar={handleIngresar} />
      )}
      {tipoFicha === 'adultoMayor' && (
        <FichaClinicaAdultoMayor onVolver={handleVolver} onIngresar={handleIngresar} />
      )}
    </div>
  );
};

export default IngresarFichaClinica;