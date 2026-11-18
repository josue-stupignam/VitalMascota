import React from 'react';
import { Plus } from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { getEspecieIcono } from '../../lib/especies';
import '../../styles/pet-selector.css';

export default function PetSelector() {
  const { pets, activePetId, setActivePet, setShowWizard } = usePet();

  return (
    <div className="pet-selector-wrapper">
      <div className="pet-selector-scroll">
        {pets.map((pet) => {
          const isActive = pet.id === activePetId;
          const avatarUrl = pet.avatar_url || pet.foto;
          const Icono = getEspecieIcono(pet.especie);

          return (
            <button
              type="button"
              key={pet.id}
              className={`pet-selector-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePet(pet.id)}
              aria-label={`Seleccionar ${pet.nombre}`}
            >
              <div className="pet-selector-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={pet.nombre} className="pet-selector-img" />
                ) : (
                  <span className="pet-selector-emoji">
                    <Icono size={26} />
                  </span>
                )}
                {isActive && <div className="pet-selector-ring" />}
              </div>
              <span className={`pet-selector-name ${isActive ? 'active' : ''}`}>
                {pet.nombre}
              </span>
              <span className="pet-selector-species">
                <Icono size={13} />
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className="pet-selector-item"
          onClick={() => setShowWizard(true)}
          aria-label="Registrar nueva mascota"
        >
          <div className="pet-selector-avatar pet-selector-add">
            <Plus size={24} />
          </div>
          <span className="pet-selector-name pet-selector-add-label">Nueva</span>
        </button>
      </div>
    </div>
  );
}
