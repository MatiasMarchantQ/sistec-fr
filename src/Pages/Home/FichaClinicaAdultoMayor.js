// FichaClinicaAdultoMayor.js
import React from 'react';

const FichaClinicaAdultoMayor = ({ onVolver, onIngresar }) => {
  return (
    <>
      <h3>Ficha Clínica Adulto Mayor</h3>
      {/* Aquí irá el contenido de la ficha clínica de adulto mayor */}
      <div className="d-flex justify-content-center">
        <button className="btn btn-secondary mr-2" onClick={onVolver}>Volver</button>
        <button className="btn btn-primary" onClick={onIngresar}>Ingresar</button>
      </div>
    </>
  );
};

export default FichaClinicaAdultoMayor;