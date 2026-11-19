import React from 'react';
import { Megaphone, UserRoundCheck } from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { getEspecieIcono } from '../../lib/especies';
import { getTalla } from '../../lib/pets';
import '../../styles/global.css';

export default function PetStatusCard({ onOpenPoster, onOpenSitter }) {
  const { activePet } = usePet();

  if (!activePet) return null;

  const Icono = getEspecieIcono(activePet.especie);
  const avatarUrl = activePet.avatar_url || activePet.foto;
  const talla = getTalla(activePet.talla);
  const saludable = activePet.estado === 'saludable';

  return (
    <div className="card pet-status-card">
      <div className="pet-status-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt={activePet.nombre} className="pet-avatar" />
        ) : (
          <div className="pet-avatar pet-avatar-icon">
            <Icono size={34} />
          </div>
        )}

        <div className="pet-status-info">
          <div className="pet-name">{activePet.nombre}</div>
          <div className="pet-detail">
            {activePet.raza || activePet.especie} • {activePet.edad || 'Edad N/A'}
            {activePet.peso ? ` • ${activePet.peso} kg` : ''}
          </div>
          <div className="pet-badges">
            <span className={`status-badge ${saludable ? 'ok' : 'warn'}`}>
              {saludable ? 'Saludable' : 'En observación'}
            </span>
            <span className="talla-badge">{talla.label}</span>
          </div>
        </div>
      </div>

      <div className="pet-quick-actions">
        <button type="button" onClick={onOpenPoster} className="pet-quick-btn">
          <Megaphone size={16} /> Cartel Extravío
        </button>
        <button type="button" onClick={onOpenSitter} className="pet-quick-btn">
          <UserRoundCheck size={16} /> Modo Cuidador
        </button>
      </div>
    </div>
  );
}
