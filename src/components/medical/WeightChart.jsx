import React from 'react';
import { AlertTriangle, Scale } from 'lucide-react';
import { getTalla } from '../../lib/pets';
import { pesoFueraDeRango, rangoSaludable } from '../../lib/medico';
import '../../styles/global.css';

function etiqueta(item) {
  if (item.fecha) return String(item.fecha).slice(0, 10);
  return item.mes || '';
}

export default function WeightChart({ historial = [], tallaKey = 'mediana', embedded = false }) {
  const claseContenedor = embedded ? 'weight-embed' : 'card';

  if (!historial || historial.length === 0) {
    return (
      <div className={claseContenedor}>
        <h3 className="card-title">
          <Scale size={18} /> Historial de peso
        </h3>
        <p className="empty-state">No hay registros de peso disponibles.</p>
      </div>
    );
  }

  const ordenado = [...historial].sort((a, b) =>
    String(etiqueta(a)).localeCompare(String(etiqueta(b)))
  );
  const pesos = ordenado.map((h) => Number(h.peso) || 0);
  const { min, max } = rangoSaludable(tallaKey);
  const ultimo = pesos[pesos.length - 1];
  const fuera = pesoFueraDeRango(ultimo, tallaKey);

  const valores = [...pesos, min, max === null ? min * 2 : max];
  const minPeso = Math.min(...valores) * 0.9;
  const maxPeso = Math.max(...valores) * 1.1;
  const rango = maxPeso - minPeso || 1;

  const y = (peso) => 90 - ((peso - minPeso) / rango) * 70;
  const x = (i) =>
    ordenado.length === 1 ? 150 : 24 + i * (252 / (ordenado.length - 1));

  const puntos = ordenado.map((h, i) => ({
    x: x(i),
    y: y(Number(h.peso) || 0),
    peso: h.peso,
    label: etiqueta(h),
  }));

  const bandaY = max === null ? 20 : y(max);
  const bandaAlto = Math.max(14, bandaY);
  const bandaBajo = Math.min(84, y(min));

  return (
    <div className={claseContenedor}>
      <div className="card-title-row">
        <h3 className="card-title">
          <Scale size={18} /> Historial de peso
        </h3>
        <span className="weight-current">{ultimo} kg</span>
      </div>

      <p className="weight-range-note">
        Rango saludable para talla {getTalla(tallaKey).label}: {min}
        {max === null ? '+' : `–${max}`} kg
      </p>

      <svg viewBox="0 0 300 100" className="weight-chart" role="img" aria-label="Curva de peso">
        <rect
          x="0"
          y={bandaAlto}
          width="300"
          height={Math.max(0, bandaBajo - bandaAlto)}
          className="weight-band"
        />
        {puntos.length > 1 && (
          <polyline
            fill="none"
            className="weight-line"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={puntos.map((p) => `${p.x},${p.y}`).join(' ')}
          />
        )}
        {puntos.map((p, idx) => (
          <g key={`${p.label}-${idx}`}>
            <circle cx={p.x} cy={p.y} r="4" className="weight-dot" />
            <text x={p.x} y={p.y - 8} fontSize="9" textAnchor="middle" className="weight-value">
              {p.peso}kg
            </text>
            <text x={p.x} y="98" fontSize="7" textAnchor="middle" className="weight-label">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {fuera === 'bajo' && (
        <p className="weight-warning">
          <AlertTriangle size={14} /> El último peso está por debajo del rango saludable. Consulta a
          tu veterinario.
        </p>
      )}
      {fuera === 'alto' && (
        <p className="weight-warning">
          <AlertTriangle size={14} /> El último peso supera el rango saludable. Ajusta la ración con
          tu veterinario.
        </p>
      )}
      {fuera === 'ok' && (
        <p className="weight-ok">El último peso está dentro del rango saludable.</p>
      )}
    </div>
  );
}
