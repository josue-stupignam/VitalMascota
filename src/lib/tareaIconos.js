import {
  Brush,
  Droplets,
  Footprints,
  Leaf,
  Pill,
  Scissors,
  Stethoscope,
  Sun,
  Thermometer,
  Trash2,
  Utensils,
  Wind,
  Wrench,
  Moon,
} from 'lucide-react';

const REGLAS = [
  [/paseo|caminar|caminata/i, Footprints],
  [/comer|aliment|comida/i, Utensils],
  [/agua|hidrat/i, Droplets],
  [/baño|ducha/i, Droplets],
  [/cepill/i, Brush],
  [/arenero|jaula|habitat|hábitat|acuario|limpiar|filtro/i, Trash2],
  [/medic|pastilla|desparasit/i, Pill],
  [/vacun/i, Scissors],
  [/veterinar|control|revisar plumas|plumas/i, Stethoscope],
  [/temperatura/i, Thermometer],
  [/humedad|ventilaci/i, Wind],
  [/juego|juguet/i, Sun],
  [/nocturn|noche/i, Moon],
  [/fuera de jaula|tiempo fuera/i, Sun],
  [/reparar|ajuste/i, Wrench],
];

export function iconoTarea(tarea = '') {
  const regla = REGLAS.find(([patron]) => patron.test(tarea));
  if (regla) return regla[1];
  return /hoja|verdura|dieta/i.test(tarea) ? Leaf : Pill;
}
