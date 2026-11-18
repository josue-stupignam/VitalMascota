import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { getDatoCurioso } from '../../lib/datosCuriosos';

export default function DatoCurioso() {
  const { activePet } = usePet();
  if (!activePet) return null;

  const { titulo, texto, consejo } = getDatoCurioso(activePet.especie, activePet.talla);

  return (
    <section className="dato-curioso" aria-live="polite">
      <span className="dato-curioso-icon">
        <Lightbulb size={20} />
      </span>
      <div className="dato-curioso-body">
        <p className="dato-curioso-titulo">{titulo}</p>
        <p className="dato-curioso-texto">{texto}</p>
        <p className="dato-curioso-consejo">
          <Sparkles size={13} /> {consejo}
        </p>
      </div>
    </section>
  );
}
