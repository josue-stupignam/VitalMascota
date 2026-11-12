import React from 'react';
import '../../styles/global.css';

export default function AllergyList({ alergias = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">⚠️ Alergias y Restricciones</h3>
      {alergias.length === 0 ? (
        <p className="empty-state">No hay alergias registradas.</p>
      ) : (
        <div className="allergy-tags">
          {alergias.map((alergia, index) => (
            <span key={index} className="allergy-tag">
              ⚠️ {alergia}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
