import { getTalla } from './pets';

export const DIAS_AVISO = 30;

export const CATEGORIAS_REGISTRO = [
  'Vacuna',
  'Alergia',
  'Cirugía',
  'Desparasitación',
  'Consulta',
  'Tratamiento',
  'Otro',
];

export const ESTADOS_REGISTRO = ['Aplicada', 'Pendiente de aplicar'];

export function normalizarRegistros(medico = {}) {
  if (Array.isArray(medico.registros)) return medico.registros;

  const legacy = [];
  (medico.vacunas || []).forEach((v, i) => {
    legacy.push({
      id: `vacuna-${i}`,
      nombre: v.nombre || '',
      categoria: 'Vacuna',
      estado: v.vigente === false ? 'Pendiente de aplicar' : 'Aplicada',
      fecha: v.fecha || '',
      detalles: v.descripcion || '',
    });
  });
  (medico.alergias || []).forEach((raw, i) => {
    const alergia = normalizarAlergia(raw);
    legacy.push({
      id: `alergia-${i}`,
      nombre: alergia.nombre,
      categoria: 'Alergia',
      estado: 'Aplicada',
      fecha: '',
      detalles: alergia.descripcion,
    });
  });
  (medico.cirugias || []).forEach((c, i) => {
    legacy.push({
      id: `cirugia-${i}`,
      nombre: c.nombre || '',
      categoria: 'Cirugía',
      estado: 'Aplicada',
      fecha: c.fecha || '',
      detalles: c.descripcion || '',
    });
  });
  return legacy;
}

export function registrosPendientes(medico = {}) {
  return normalizarRegistros(medico).filter(
    (r) => r.estado === 'Pendiente de aplicar'
  );
}

export function normalizarAlergia(alergia) {
  if (typeof alergia === 'string') return { nombre: alergia, descripcion: '' };
  if (alergia && typeof alergia === 'object') {
    return {
      nombre: alergia.nombre || '',
      descripcion: alergia.descripcion || '',
    };
  }
  return { nombre: '', descripcion: '' };
}

function fechaValida(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function diasHasta(fecha) {
  const d = fechaValida(fecha);
  if (!d) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((d - hoy) / 86400000);
}

export function estadoVacuna(vacuna) {
  if (!vacuna) return 'sin-datos';
  const fecha = fechaValida(vacuna.fecha);
  if (vacuna.vigente === false) return 'vencido';
  if (!fecha) return vacuna.vigente ? 'ok' : 'sin-datos';

  const vencimiento = new Date(fecha);
  vencimiento.setFullYear(vencimiento.getFullYear() + 1);
  const dias = diasHasta(vencimiento);
  if (dias === null) return 'sin-datos';
  if (dias < 0) return 'vencido';
  if (dias <= DIAS_AVISO) return 'proximo';
  return 'ok';
}

export function etiquetaVacuna(estado) {
  if (estado === 'vencido') return 'Vencida';
  if (estado === 'proximo') return 'Por vencer';
  if (estado === 'ok') return 'Vigente';
  return 'Sin fecha';
}

export function estadoCita(proximaCita) {
  const dias = diasHasta(proximaCita);
  if (dias === null) return 'sin-datos';
  if (dias < 0) return 'vencido';
  if (dias <= 7) return 'proximo';
  return 'ok';
}

export function resumenSalud(medico = {}) {
  const vacunas = medico.vacunas || [];
  const estados = vacunas.map(estadoVacuna);
  const cita = estadoCita(medico.proximaCita);

  if (estados.includes('vencido') || cita === 'vencido') {
    return { estado: 'critico', mensaje: 'Hay vacunas vencidas o una cita atrasada' };
  }
  if (estados.includes('proximo') || cita === 'proximo') {
    return { estado: 'proximo', mensaje: 'Revisa vacunas o citas próximas a vencer' };
  }
  if (estados.length === 0) {
    return { estado: 'sin-datos', mensaje: 'Aún no hay vacunas registradas' };
  }
  if (estados.includes('sin-datos')) {
    return { estado: 'sin-datos', mensaje: 'Faltan fechas de vacunación' };
  }
  return { estado: 'ok', mensaje: 'Esquema de vacunación al día' };
}

export function rangoSaludable(tallaKey) {
  const talla = getTalla(tallaKey);
  return { min: talla.min, max: talla.max, label: talla.label };
}

export function pesoFueraDeRango(peso, tallaKey) {
  const n = Number(peso);
  if (!Number.isFinite(n) || n <= 0) return null;
  const { min, max } = rangoSaludable(tallaKey);
  if (n < min) return 'bajo';
  if (max !== null && n > max) return 'alto';
  return 'ok';
}
