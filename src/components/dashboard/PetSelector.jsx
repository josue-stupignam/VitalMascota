import React from 'react';
import { usePet } from '../../context/PetContext';
import { especieEmojis } from '../../data/mockData';
import '../../styles/pet-selector.css';

export default function PetSelector() {
  const { pets, activePetId, setActivePet, setShowWizard } = usePet();

  return (
    <div className="pet-selector-wrapper">
      <div className="pet-selector-scroll">
        {pets.map((pet) => {
          const isActive = pet.id === activePetId;
          const avatarUrl = pet.avatar_url || pet.foto;
          const emoji = especieEmojis[pet.especie] || '🐾';

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
                  <span className="pet-selector-emoji">{emoji}</span>
                )}
                {isActive && <div className="pet-selector-ring" />}
              </div>
              <span className={`pet-selector-name ${isActive ? 'active' : ''}`}>
                {pet.nombre}
              </span>
              <span className="pet-selector-species">{emoji}</span>
            </button>
          );
        })}

        {/* Botón para agregar una nueva mascota */}
        <button
          type="button"
          className="pet-selector-item"
          onClick={() => setShowWizard(true)}
          style={{ opacity: 0.8 }}
          aria-label="Registrar nueva mascota"
        >
          <div
            className="pet-selector-avatar"
            style={{
              border: '2px dashed var(--color-primary)',
              background: 'rgba(79, 140, 255, 0.08)',
              color: 'var(--color-primary)',
              fontSize: '1.4rem',
              fontWeight: 'bold',
            }}
          >
            +
          </div>
          <span className="pet-selector-name" style={{ color: 'var(--color-primary)' }}>
            Nueva
          </span>
        </button>
      </div>
    </div>
  );
}
