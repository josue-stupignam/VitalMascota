import React, { useRef } from 'react';
import { usePet } from '../../context/PetContext';
import { especieEmojis } from '../../data/mockData';
import '../../styles/global.css';

export default function PetStatusCard({ onOpenPoster, onOpenSitter }) {
  const { pets, activePet, activePetId, setActivePet } = usePet();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!activePet) return null;

  const emoji = especieEmojis[activePet.especie] || '🐾';
  const avatarUrl = activePet.avatar_url || activePet.foto;

  // Manejo de Swipe Touch para cambiar de mascota a la izquierda / derecha
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    if (Math.abs(diffX) > 60 && pets.length > 1) {
      const currentIndex = pets.findIndex((p) => p.id === activePetId);
      if (diffX > 0) {
        // Swipe left -> Siguiente mascota
        const nextIndex = (currentIndex + 1) % pets.length;
        setActivePet(pets[nextIndex].id);
      } else {
        // Swipe right -> Mascota anterior
        const prevIndex = (currentIndex - 1 + pets.length) % pets.length;
        setActivePet(pets[prevIndex].id);
      }
    }
  };

  return (
    <div
      className="card pet-status-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', position: 'relative', overflow: 'hidden' }}
    >
      {pets.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            fontSize: '0.72rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
        >
          ⇄ Desliza para cambiar
        </div>
      )}

      <div className="pet-status-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt={activePet.nombre} className="pet-avatar" />
        ) : (
          <div
            className="pet-avatar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '2rem',
            }}
          >
            {emoji}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div className="pet-name">{activePet.nombre}</div>
          <div className="pet-detail">
            {activePet.raza || activePet.especie} • {activePet.edad || 'Edad N/A'}
            {activePet.peso ? ` • ${activePet.peso} kg` : ''}
          </div>
          <span className="status-badge">
            {activePet.estado === 'saludable' ? '🟢 Saludable' : '🟡 En observación'}
          </span>
        </div>
      </div>

      {/* Acciones Rápidas: Cartel de Extravío y Cuidador / Pet Sitter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <button
          type="button"
          onClick={onOpenPoster}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s',
          }}
        >
          <span>📢</span> Cartel Extravío
        </button>

        <button
          type="button"
          onClick={onOpenSitter}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s',
          }}
        >
          <span>🤝</span> Modo Cuidador
        </button>
      </div>
    </div>
  );
}
