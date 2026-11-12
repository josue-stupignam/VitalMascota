// ─── Datos de referencia (sin mascotas precargadas) ───────────────────────
// Las mascotas se crean desde el Wizard y se persisten por usuario en localStorage.

export const familia = [
  { id: 'f1', nombre: 'Carlos', rol: 'Dueño principal', avatar: '👨' },
  { id: 'f2', nombre: 'María', rol: 'Co-dueña', avatar: '👩' },
  { id: 'f3', nombre: 'Sofía', rol: 'Hija', avatar: '👧' },
];

export const clinicasCercanas = [
  {
    id: 'c1',
    nombre: 'Clínica Veterinaria San Ángel',
    lat: 19.348,
    lng: -99.193,
    direccion: 'Av. Revolución 1234, CDMX',
    telefono: '+52 55 1234 5678',
    abierto: true,
    horario: '24 hrs',
    distancia: '0.8 km',
  },
  {
    id: 'c2',
    nombre: 'Pet Emergency 24h',
    lat: 19.352,
    lng: -99.187,
    direccion: 'Calle Insurgentes Sur 567, CDMX',
    telefono: '+52 55 9876 5432',
    abierto: true,
    horario: '24 hrs',
    distancia: '1.2 km',
  },
  {
    id: 'c3',
    nombre: 'Hospital Veterinario UNAM',
    lat: 19.332,
    lng: -99.185,
    direccion: 'Circuito Exterior, Ciudad Universitaria',
    telefono: '+52 55 5622 5941',
    abierto: true,
    horario: '8:00 - 20:00',
    distancia: '2.5 km',
  },
];

// ─── Sugerencias de tareas por especie (para el Wizard) ────────────────────

export const sugerenciasPorEspecie = {
  perro: [
    { tarea: 'Paseo matutino', icono: '🐕' },
    { tarea: 'Paseo nocturno', icono: '🌙' },
    { tarea: 'Dar de comer (mañana)', icono: '🍖' },
    { tarea: 'Dar de comer (tarde)', icono: '🍖' },
    { tarea: 'Cepillado semanal', icono: '🪮' },
    { tarea: 'Baño quincenal', icono: '🛁' },
  ],
  gato: [
    { tarea: 'Limpiar arenero', icono: '🧹' },
    { tarea: 'Dar de comer (mañana)', icono: '🐟' },
    { tarea: 'Dar de comer (tarde)', icono: '🐟' },
    { tarea: 'Sesión de juego', icono: '🧶' },
    { tarea: 'Cepillado', icono: '🪮' },
    { tarea: 'Revisar fuente de agua', icono: '💧' },
  ],
  ave: [
    { tarea: 'Limpiar jaula', icono: '🧹' },
    { tarea: 'Cambiar agua', icono: '💧' },
    { tarea: 'Dar de comer', icono: '🌾' },
    { tarea: 'Tiempo fuera de jaula', icono: '🕊️' },
    { tarea: 'Revisar plumas', icono: '🪶' },
  ],
  pez: [
    { tarea: 'Alimentar', icono: '🐠' },
    { tarea: 'Revisar temperatura del agua', icono: '🌡️' },
    { tarea: 'Cambio parcial de agua', icono: '💧' },
    { tarea: 'Limpiar filtro', icono: '🔧' },
    { tarea: 'Limpieza del acuario', icono: '🧽' },
  ],
  exotico: [
    { tarea: 'Dar de comer', icono: '🍃' },
    { tarea: 'Limpiar hábitat', icono: '🧹' },
    { tarea: 'Revisar temperatura', icono: '🌡️' },
    { tarea: 'Revisar humedad', icono: '💨' },
    { tarea: 'Control veterinario mensual', icono: '🩺' },
  ],
};

export const especieEmojis = {
  perro: '🐕',
  gato: '🐈',
  ave: '🐦',
  pez: '🐠',
  conejo: '🐇',
  hamster: '🐹',
  exotico: '🦎',
};
