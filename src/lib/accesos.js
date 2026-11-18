export const HORAS_EMERGENCIA = [24, 48];
export const HORAS_CUIDADOR = 48;

export function generarToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function crearAcceso(tipo, horas) {
  const ahora = Date.now();
  return {
    token: generarToken(),
    tipo,
    creado: ahora,
    expira: ahora + horas * 60 * 60 * 1000,
  };
}

export function accesoValido(accesos, token, tipo) {
  if (!token || !Array.isArray(accesos)) return false;
  const acceso = accesos.find((a) => a.token === token);
  if (!acceso) return false;
  if (tipo && acceso.tipo !== tipo) return false;
  return Number(acceso.expira) > Date.now();
}

export function accesosVigentes(accesos) {
  if (!Array.isArray(accesos)) return [];
  return accesos.filter((a) => Number(a.expira) > Date.now());
}

export function horasRestantes(expira) {
  const ms = Number(expira) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.ceil(ms / (60 * 60 * 1000));
}

export function urlEmergencia(petId, token) {
  return `${window.location.origin}/emergencia/${petId}?token=${token}`;
}

export function urlCuidador(petId, token) {
  return `${window.location.origin}/cuidador/${petId}?token=${token}`;
}
