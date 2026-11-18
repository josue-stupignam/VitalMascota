import React from 'react';
import { Hospital, Phone } from 'lucide-react';
import '../../styles/map.css';

export default function ClinicCard({ clinica }) {
  const { nombre, direccion, telefono, abierto, horario, distancia } = clinica;
  const tieneTelefono = telefono && telefono !== 'Teléfono no disponible';

  return (
    <div className="clinic-card">
      <div className="clinic-card-header">
        <span className="clinic-icon">
          <Hospital size={20} />
        </span>
        <div className="clinic-main">
          <h4 className="clinic-name">{nombre}</h4>
          <p className="clinic-address">{direccion}</p>
        </div>
      </div>

      <div className="clinic-card-footer">
        <div className="clinic-meta">
          <span className={`clinic-status ${abierto ? 'open' : 'closed'}`}>
            {abierto ? 'Abierto' : 'Cerrado'}
          </span>
          {horario && <span className="clinic-hours">{horario}</span>}
          {distancia && <span className="clinic-distance">{distancia}</span>}
        </div>

        {tieneTelefono && (
          <a
            href={`tel:${telefono.replace(/\s+/g, '')}`}
            className="btn btn-call"
            aria-label={`Llamar a ${nombre}`}
          >
            <Phone size={14} /> Llamar
          </a>
        )}
      </div>
    </div>
  );
}
