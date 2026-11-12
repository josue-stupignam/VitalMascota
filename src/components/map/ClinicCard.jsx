import React from 'react';
import '../../styles/map.css';

export default function ClinicCard({ clinica }) {
  const { nombre, direccion, telefono, abierto, horario, distancia } = clinica;

  return (
    <div className="clinic-card">
      <div className="clinic-card-header">
        <span className="clinic-icon">🏥</span>
        <div style={{ flex: 1 }}>
          <h4 className="clinic-name">{nombre}</h4>
          <p className="clinic-address">{direccion}</p>
        </div>
      </div>

      <div className="clinic-card-footer">
        <div>
          <span className={`clinic-status ${abierto ? 'open' : 'closed'}`}>
            {abierto ? 'Abierto' : 'Cerrado'}
          </span>
          {horario && <span className="clinic-hours" style={{ marginLeft: '8px' }}>{horario}</span>}
          {distancia && <span className="clinic-distance" style={{ marginLeft: '8px' }}>{distancia}</span>}
        </div>

        {telefono && telefono !== 'Teléfono no disponible' && (
          <a
            href={`tel:${telefono.replace(/\s+/g, '')}`}
            className="btn btn-call"
            style={{ textDecoration: 'none' }}
          >
            📞 Llamar
          </a>
        )}
      </div>
    </div>
  );
}
