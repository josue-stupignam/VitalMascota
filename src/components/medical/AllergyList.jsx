import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { normalizarAlergia } from '../../lib/medico';
import '../../styles/global.css';

export default function AllergyList({ alergias = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">
        <AlertTriangle size={18} /> Alergias y restricciones
      </h3>
      {alergias.length === 0 ? (
        <p className="empty-state">No hay alergias registradas.</p>
      ) : (
        <ul className="allergy-list">
          {alergias.map((raw, index) => {
            const alergia = normalizarAlergia(raw);
            return (
              <li key={index} className="allergy-item">
                <span className="allergy-tag">
                  <AlertTriangle size={13} /> {alergia.nombre}
                </span>
                {alergia.descripcion && (
                  <span className="medical-desc">{alergia.descripcion}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
