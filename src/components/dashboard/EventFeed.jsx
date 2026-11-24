import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Bug,
  Clock,
  MessageSquare,
  Pill,
  Scale,
  Scissors,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { CATEGORIAS_REGISTRO, normalizarRegistros } from '../../lib/medico';
import { formatearFecha } from '../../lib/fechas';
import WeightChart from '../medical/WeightChart';
import '../../styles/global.css';

const ICONO_CATEGORIA = {
  Vacuna: Syringe,
  Alergia: AlertTriangle,
  Cirugía: Scissors,
  Desparasitación: Bug,
  Consulta: Stethoscope,
  Tratamiento: Pill,
  Otro: MessageSquare,
};

function iconoEvento(ev) {
  const texto = `${ev.tipo || ''} ${ev.mensaje || ''}`.toLowerCase();
  if (/vacun|desparasit/.test(texto)) return Syringe;
  if (/peso|báscula|bascula/.test(texto)) return Scale;
  if (/comida|aliment|porci/.test(texto)) return Activity;
  if (/cita|control|revisi/.test(texto)) return Clock;
  return Activity;
}

export default function EventFeed({ eventos = [] }) {
  const { activePet } = usePet();
  const medico = activePet?.medico || {};

  const registros = useMemo(() => normalizarRegistros(medico), [medico]);
  const historial = medico.historialPeso || [];

  const feed = useMemo(() => {
    const deRegistros = registros.map((registro) => ({
      id: `registro-${registro.id}`,
      fecha: registro.fecha || '',
      mensaje: registro.nombre,
      detalle: registro.categoria,
      estado: registro.estado,
      categoria: registro.categoria,
      esRegistro: true,
    }));

    const deEventos = (eventos || []).map((evento, index) => ({
      id: `evento-${index}`,
      fecha: evento.fecha || '',
      mensaje: evento.mensaje,
      detalle: evento.tiempo || 'Reciente',
      estado: '',
      tipo: evento.tipo || '',
      esRegistro: false,
    }));

    return [...deRegistros, ...deEventos].sort((a, b) => {
      if (!a.fecha && !b.fecha) return 0;
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return String(b.fecha).localeCompare(String(a.fecha));
    });
  }, [registros, eventos]);

  const resumen = useMemo(() => {
    const conteo = CATEGORIAS_REGISTRO.map((categoria) => ({
      categoria,
      total: registros.filter((r) => r.categoria === categoria).length,
    })).filter((fila) => fila.total > 0);
    const mayor = conteo.reduce((max, fila) => Math.max(max, fila.total), 0);
    return { conteo, mayor };
  }, [registros]);

  return (
    <div className="card activity-card">
      <h3 className="card-title">
        <Clock size={18} /> Actividad reciente
      </h3>

      {feed.length === 0 ? (
        <p className="empty-hint">
          Aún no hay actividad registrada. Aquí verás vacunas, pesos y comidas cuando los registres.
        </p>
      ) : (
        <div className="timeline">
          {feed.map((item) => {
            const Icono = item.esRegistro
              ? ICONO_CATEGORIA[item.categoria] || Activity
              : iconoEvento(item);
            return (
              <div key={item.id} className="timeline-item">
                <span className="timeline-icon">
                  <Icono size={16} />
                </span>
                <div className="timeline-body">
                  <p className="timeline-message">{item.mensaje}</p>
                  <span className="timeline-time">
                    {item.fecha ? formatearFecha(item.fecha) : item.detalle}
                    {item.fecha && item.detalle ? ` • ${item.detalle}` : ''}
                  </span>
                  {item.estado && (
                    <span
                      className={`status-pill ${
                        item.estado === 'Aplicada' ? 'light-ok' : 'light-proximo'
                      }`}
                    >
                      {item.estado}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resumen.conteo.length > 0 && (
        <div className="activity-section">
          <h4 className="activity-subtitle">Resumen de registros</h4>
          <div className="activity-bars">
            {resumen.conteo.map((fila) => (
              <div key={fila.categoria} className="activity-bar-row">
                <span className="activity-bar-label">{fila.categoria}</span>
                <div className="activity-bar-track">
                  <div
                    className="activity-bar-fill"
                    style={{ width: `${(fila.total / resumen.mayor) * 100}%` }}
                  />
                </div>
                <span className="activity-bar-total">{fila.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className="activity-section">
          <WeightChart historial={historial} tallaKey={activePet?.talla} embedded />
        </div>
      )}
    </div>
  );
}
