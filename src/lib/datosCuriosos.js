const BUCKETS = {
  perro: 'perro',
  gato: 'gato',
  ave: 'ave',
  pez: 'reptil',
  conejo: 'reptil',
  hamster: 'reptil',
  exotico: 'reptil',
};

const DATOS = {
  perro: {
    pequena: [
      'Los perros pequeños queman energía rápido: tres paseos cortos al día les sientan mejor que uno largo.',
      'Su metabolismo es acelerado, así que las porciones pequeñas y frecuentes ayudan a cuidar su digestión.',
      'Cepillar sus dientes dos o tres veces por semana previene el sarro, muy común en razas pequeñas.',
    ],
    mediana: [
      'Un perro mediano necesita entre 30 y 60 minutos de actividad diaria para mantenerse en forma.',
      'Revisar sus cojinetes después de cada paseo evita lesiones por asfalto caliente o piedras.',
      'Las razas medianas suelen ser excelentes compañeras de familia: la socialización temprana es clave.',
    ],
    grande: [
      'Los perros grandes crecen rápido: controlar su peso en la etapa joven protege sus articulaciones.',
      'Evita el ejercicio intenso justo después de comer para prevenir torsión gástrica.',
      'Una cama firme y amplia reduce la presión en caderas y codos.',
    ],
    gigante: [
      'En razas gigantes las articulaciones llevan mucha carga: el peso ideal es su mejor seguro de vida.',
      'Los paseos deben ser moderados y frecuentes, evitando saltos bruscos.',
      'Su esperanza de vida es más corta, así que las revisiones veterinarias cada 6 meses son muy valiosas.',
    ],
  },
  gato: {
    pequena: [
      'Un arenero limpio y amplio previene problemas urinarios, frecuentes en gatos pequeños.',
      'Los gatos necesitan fuentes de agua corriente: beben más y cuidan sus riñones.',
      'Rascadores de altura ayudan a mantener sus uñas sanas y su estrés bajo.',
    ],
    mediana: [
      'Los gatos son depredadores de ráfagas: sesiones de juego de 10 minutos dos veces al día los mantienen activos.',
      'Las alturas son su zona segura: un estante o árbol para gatos mejora su bienestar.',
      'Revisar su peso mensualmente detecta obesidad antes de que sea un problema.',
    ],
    grande: [
      'Las razas grandes necesitan comederos elevados y camas amplias para descansar bien.',
      'Su pelaje largo requiere cepillado diario para evitar nudos y bolas de pelo.',
      'Los juegos de persecución cortos y frecuentes funcionan mejor que el ejercicio prolongado.',
    ],
    gigante: [
      'Los gatos de gran tamaño necesitan superficies resistentes y espacios verticales reforzados.',
      'Su alimentación debe ajustarse al peso real: la ración diaria evita el sobrepeso.',
      'Los controles cardíacos y articulares anuales son recomendables en razas grandes.',
    ],
  },
  ave: {
    pequena: [
      'Las aves pequeñas necesitan horas de luz natural indirecta para regular su ciclo de sueño.',
      'Rotar juguetes cada semana evita el aburrimiento y el picaje de plumas.',
      'Nunca uses aerosoles ni humo cerca de su jaula: su sistema respiratorio es muy sensible.',
    ],
    mediana: [
      'Las aves medianas aprenden rutinas: mantener horarios de comida y descanso reduce su estrés.',
      'Ofrecer vegetales frescos lavados complementa su dieta de semillas o pellets.',
      'El baño con agua tibia una o dos veces por semana mantiene su plumaje saludable.',
    ],
    grande: [
      'Las aves grandes necesitan jaulas amplias y tiempo diario fuera de ellas para ejercitarse.',
      'La interacción social diaria es parte de su salud mental: son aves muy inteligentes.',
      'Revisar su pico y uñas cada mes ayuda a detectar desgastes irregulares.',
    ],
    gigante: [
      'Las aves de gran tamaño requieren refuerzos en perchas y juguetes de madera dura.',
      'Su dieta debe ser variada y supervisada por un veterinario aviar.',
      'El espacio de vuelo reducido exige ejercicio supervisado diario.',
    ],
  },
  reptil: {
    pequena: [
      'Los reptiles pequeños dependen del gradiente de temperatura: ofrece zona cálida y zona fresca.',
      'La humedad adecuada evita problemas de muda en serpientes y geckos pequeños.',
      'Manipúlalos poco y con manos limpias: el estrés afecta su apetito.',
    ],
    mediana: [
      'Cada especie tiene su rango de temperatura ideal: usa termómetros en ambos extremos del terrario.',
      'La luz UVB es esencial para metabolizar el calcio en muchos reptiles diurnos.',
      'Respeta su ciclo de luz y oscuridad para mantener su ritmo natural.',
    ],
    grande: [
      'Los reptiles grandes necesitan terrarios amplios con escondites y sustrato adecuado.',
      'La alimentación debe ajustarse a su etapa de crecimiento y actividad.',
      'Revisa la calidad del agua diariamente si tu especie la necesita.',
    ],
    gigante: [
      'Los reptiles de gran tamaño requieren instalaciones reforzadas y un plan de manejo seguro.',
      'El control veterinario especializado es indispensable por su longevidad.',
      'Mantén registros de mudas, comidas y peso para detectar cambios a tiempo.',
    ],
  },
};

const CONSEJOS = [
  'Primera vez con una mascota: agenda una revisión veterinaria en la primera semana y guarda su carnet de vacunas.',
  'Consejo de bienestar: el agua limpia y fresca debe estar disponible todo el día, todos los días.',
  'Refuerzo de vacunación: revisa cada año el esquema de tu mascota y anota las fechas en el expediente médico.',
  'Bienestar diario: observa su apetito, energía y heces; los cambios pequeños avisan antes que los grandes.',
  'Prevención: desparasita según indique tu veterinario y mantén al día sus vacunas esenciales.',
];

const TITULOS = {
  perro: 'Dato canino del día',
  gato: 'Dato felino del día',
  ave: 'Dato sobre aves',
  reptil: 'Dato exótico del día',
};

function bucketDeEspecie(especie) {
  return BUCKETS[especie] || 'perro';
}

function indiceDelDia(total) {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), 0, 0);
  const dia = Math.floor((hoy - inicio) / 86400000);
  return Math.abs(dia) % total;
}

export function getDatoCurioso(especie, talla) {
  const bucket = bucketDeEspecie(especie);
  const porTalla = DATOS[bucket];
  const lista = porTalla[talla] || porTalla.mediana;
  return {
    titulo: TITULOS[bucket],
    texto: lista[indiceDelDia(lista.length)],
    consejo: CONSEJOS[indiceDelDia(CONSEJOS.length)],
  };
}
