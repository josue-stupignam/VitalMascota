import React from 'react';
import { Hospital, Navigation, Phone } from 'lucide-react';
import '../../styles/map.css';

export default function ClinicCard({ clinica }) {
  const { nombre, direccion, telefono, abierto, horario, distancia, lat, lng } = clinica;
  const tieneTelefono = telefono && telefono !== 'Teléfono no disponible';
  const estado = abierto === null || abierto === undefined ? 'unknown' : abierto ? 'open' : 'closed';
  const etiquetaEstado =
    estado === 'unknown' ? 'Horario no disponible' : estado === 'open' ? 'Abierto' : 'Cerrado';
  const tieneUbicacion = Number.isFinite(lat) && Number.isFinite(lng);

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
          <span className={`clinic-status ${estado}`}>{etiquetaEstado}</span>
          {horario && <span className="clinic-hours">{horario}</span>}
          {distancia && <span className="clinic-distance">{distancia}</span>}
        </div>

        <div className="clinic-actions">
          {tieneUbicacion && (
            <a
              href={`https://www.openstreetmap.org/directions?to=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost clinic-route"
              aria-label={`Ver ruta a ${nombre} en el mapa`}
            >
              <Navigation size={14} /> Ruta
            </a>
          )}

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
    </div>
  );
}
