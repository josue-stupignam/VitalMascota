import React from 'react';
import { Activity, Clock, Scale, Syringe, Utensils } from 'lucide-react';
import '../../styles/global.css';

const EVENTOS_POR_DEFECTO = [
  { tipo: 'vacuna', mensaje: 'Control de vacunas al día', tiempo: 'Hoy' },
  { tipo: 'peso', mensaje: 'Peso registrado y actualizado', tiempo: 'Esta semana' },
  { tipo: 'comida', mensaje: 'Alimentación registrada', tiempo: 'Hace unas horas' },
];

function iconoEvento(ev) {
  const texto = `${ev.tipo || ''} ${ev.mensaje || ''}`.toLowerCase();
  if (/vacun|desparasit/.test(texto)) return Syringe;
  if (/peso|báscula|bascula/.test(texto)) return Scale;
  if (/comida|aliment|porci/.test(texto)) return Utensils;
  if (/cita|control|revisi/.test(texto)) return Clock;
  return Activity;
}

export default function EventFeed({ eventos = [] }) {
  const lista = eventos && eventos.length > 0 ? eventos : EVENTOS_POR_DEFECTO;

  return (
    <div className="card">
      <h3 className="card-title">
        <Clock size={18} /> Actividad reciente
      </h3>
      <div className="timeline">
        {lista.map((ev, index) => {
          const Icono = iconoEvento(ev);
          return (
            <div key={index} className="timeline-item">
              <span className="timeline-icon">
                <Icono size={16} />
              </span>
              <div className="timeline-body">
                <p className="timeline-message">{ev.mensaje}</p>
                <span className="timeline-time">{ev.tiempo || 'Reciente'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
