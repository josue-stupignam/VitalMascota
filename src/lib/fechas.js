export function getTodayLocalDate(date = new Date()) {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function esFechaFutura(fecha) {
  if (!fecha) return false;
  return fecha > getTodayLocalDate();
}

export function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  const [anio, mes, dia] = String(fecha).split('-');
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
}
