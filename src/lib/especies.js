import { Bird, Cat, Dog, Fish, PawPrint, Rabbit, Squirrel, Turtle } from 'lucide-react';

export const ESPECIE_ICONOS = {
  perro: Dog,
  gato: Cat,
  ave: Bird,
  pez: Fish,
  conejo: Rabbit,
  hamster: Squirrel,
  exotico: Turtle,
};

export function getEspecieIcono(especie) {
  return ESPECIE_ICONOS[especie] || PawPrint;
}
