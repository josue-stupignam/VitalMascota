import React from 'react';
import '../../styles/global.css';

export default function VaccineList({ vacunas = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">💉 Vacunas y Desparasitación</h3>
      {vacunas.length === 0 ? (
        <p className="empty-state">No hay vacunas registradas.</p>
      ) : (
        <ul className="vaccine-list">
          {vacunas.map((vacuna, index) => (
            <li key={index} className="vaccine-item">
              <div>
                <span className="vaccine-name">{vacuna.nombre}</span>
                <span className="vaccine-date">{vacuna.fecha}</span>
              </div>
              <span className={`vaccine-status ${vacuna.vigente ? 'vigente' : 'vencida'}`}>
                {vacuna.vigente ? '✓ Vigente' : '✕ Vencida'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
