// ─── Datos de referencia (sin mascotas precargadas) ───────────────────────
// Las mascotas se crean desde el Wizard y se persisten por usuario en localStorage.

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
    { tarea: 'Paseo matutino' },
    { tarea: 'Paseo nocturno' },
    { tarea: 'Dar de comer (mañana)' },
    { tarea: 'Dar de comer (tarde)' },
    { tarea: 'Cepillado semanal' },
    { tarea: 'Baño quincenal' },
  ],
  gato: [
    { tarea: 'Limpiar arenero' },
    { tarea: 'Dar de comer (mañana)' },
    { tarea: 'Dar de comer (tarde)' },
    { tarea: 'Sesión de juego' },
    { tarea: 'Cepillado' },
    { tarea: 'Revisar fuente de agua' },
  ],
  ave: [
    { tarea: 'Limpiar jaula' },
    { tarea: 'Cambiar agua' },
    { tarea: 'Dar de comer' },
    { tarea: 'Tiempo fuera de jaula' },
    { tarea: 'Revisar plumas' },
  ],
  pez: [
    { tarea: 'Alimentar' },
    { tarea: 'Revisar temperatura del agua' },
    { tarea: 'Cambio parcial de agua' },
    { tarea: 'Limpiar filtro' },
    { tarea: 'Limpieza del acuario' },
  ],
  exotico: [
    { tarea: 'Dar de comer' },
    { tarea: 'Limpiar hábitat' },
    { tarea: 'Revisar temperatura' },
    { tarea: 'Revisar humedad' },
    { tarea: 'Control veterinario mensual' },
  ],
};

