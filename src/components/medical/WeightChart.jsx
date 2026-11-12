import React from 'react';
import '../../styles/global.css';

export default function WeightChart({ historial = [] }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">⚖️ Historial de Peso</h3>
        <p className="empty-state">No hay registros de peso disponibles.</p>
      </div>
    );
  }

  const pesos = historial.map((h) => Number(h.peso) || 0);
  const minPeso = Math.min(...pesos);
  const maxPeso = Math.max(...pesos);
  const range = maxPeso - minPeso === 0 ? 1 : maxPeso - minPeso;

  const points = historial.map((h, i) => {
    const x = historial.length === 1 ? 150 : 20 + (i * (260 / (historial.length - 1)));
    const y = 80 - (((Number(h.peso) || 0) - minPeso) / range) * 55;
    return { x, y, peso: h.peso, mes: h.mes };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 className="card-title">⚖️ Historial de Peso</h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {historial[historial.length - 1]?.peso} kg
        </span>
      </div>

      <svg viewBox="0 0 300 100" className="weight-chart" style={{ width: '100%', height: '110px' }}>
        {/* Línea de tendencia */}
        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}
        {/* Puntos y etiquetas */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={p.y - 8} fontSize="9" textAnchor="middle" fill="var(--color-text)" fontWeight="600">
              {p.peso}kg
            </text>
            <text x={p.x} y={96} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
              {p.mes}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
