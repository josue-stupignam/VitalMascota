import React from 'react';
import { Syringe } from 'lucide-react';
import { estadoVacuna, etiquetaVacuna } from '../../lib/medico';
import '../../styles/global.css';

export default function VaccineList({ vacunas = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">
        <Syringe size={18} /> Vacunas y desparasitación
      </h3>
      {vacunas.length === 0 ? (
        <p className="empty-state">No hay vacunas registradas.</p>
      ) : (
        <ul className="vaccine-list">
          {vacunas.map((vacuna, index) => {
            const estado = estadoVacuna(vacuna);
            return (
              <li key={index} className="vaccine-item">
                <div className="medical-info">
                  <span className="vaccine-name">{vacuna.nombre}</span>
                  {vacuna.fecha && <span className="vaccine-date">{vacuna.fecha}</span>}
                  {vacuna.descripcion && (
                    <span className="medical-desc">{vacuna.descripcion}</span>
                  )}
                </div>
                <span className={`status-pill light-${estado}`}>
                  {etiquetaVacuna(estado)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
