import React from 'react';
import '../../styles/global.css';

export default function EventFeed({ eventos = [] }) {
  const defaultEvents = [
    { icono: '💉', mensaje: 'Control de vacunas al día', tiempo: 'Hoy' },
    { icono: '⚖️', mensaje: 'Peso registrado y actualizado', tiempo: 'Esta semana' },
    { icono: '🍖', mensaje: 'Alimentación registrada', tiempo: 'Hace unas horas' },
  ];

  const displayEvents = eventos && eventos.length > 0 ? eventos : defaultEvents;

  return (
    <div className="card">
      <h3 className="card-title">🕒 Actividad Reciente</h3>
      <div className="timeline">
        {displayEvents.map((ev, index) => (
          <div key={index} className="timeline-item">
            <span className="timeline-icon">{ev.icono || '🐾'}</span>
            <div style={{ flex: 1 }}>
              <p className="timeline-message">{ev.mensaje}</p>
              <span className="timeline-time">{ev.tiempo || 'Reciente'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
