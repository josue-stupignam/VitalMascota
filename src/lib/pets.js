export const TALLAS = {
  pequena: {
    label: 'Pequeña',
    min: 1,
    max: 10,
    rango: '1 a 10 kg',
    porcionDiaria: 120,
  },
  mediana: {
    label: 'Mediana',
    min: 11,
    max: 25,
    rango: '11 a 25 kg',
    porcionDiaria: 280,
  },
  grande: {
    label: 'Grande',
    min: 26,
    max: 45,
    rango: '26 a 45 kg',
    porcionDiaria: 450,
  },
  gigante: {
    label: 'Gigante',
    min: 46,
    max: null,
    rango: 'Más de 45 kg',
    porcionDiaria: 650,
  },
};

export const TALLAS_KEYS = Object.keys(TALLAS);

export function getTalla(tallaKey) {
  return TALLAS[tallaKey] || TALLAS.mediana;
}

export function getPorcionDiaria(tallaKey, override) {
  const manual = Number(override);
  if (Number.isFinite(manual) && manual > 0) return manual;
  return getTalla(tallaKey).porcionDiaria;
}

export function calcularDiasRestantes(gramosTotales, porcionDiaria) {
  const gramos = Number(gramosTotales);
  const porcion = Number(porcionDiaria);
  if (!Number.isFinite(gramos) || !Number.isFinite(porcion) || porcion <= 0 || gramos < 0) {
    return null;
  }
  return Math.floor(gramos / porcion);
}

export function estadoInventario(dias) {
  if (dias === null || dias === undefined) return 'sin-datos';
  if (dias > 7) return 'ok';
  if (dias >= 3) return 'proximo';
  return 'critico';
}

export function formatearRangoTalla(tallaKey) {
  return getTalla(tallaKey).rango;
}

export function tallaDesdePeso(peso) {
  const n = Number(peso);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n <= 10) return 'pequena';
  if (n <= 25) return 'mediana';
  if (n <= 45) return 'grande';
  return 'gigante';
}
