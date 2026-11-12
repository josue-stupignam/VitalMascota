import React from 'react';
import Modal from '../ui/Modal';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { usePet } from '../../context/PetContext';
import '../../styles/global.css';

export default function QREmergencyModal({ isOpen, onClose }) {
  const { activePet } = usePet();

  if (!activePet) return null;

  const publicUrl = `${window.location.origin}/emergencia/${activePet.id}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferencia One-Click">
      <div className="qr-modal-content">
        <div className="qr-pet-info">
          {activePet.avatar_url || activePet.foto ? (
            <img
              src={activePet.avatar_url || activePet.foto}
              alt={activePet.nombre}
              className="qr-pet-photo"
            />
          ) : (
            <div
              className="qr-pet-photo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f7fa',
                fontSize: '2rem',
              }}
            >
              {activePet.especie === 'gato' ? '🐈' : '🐕'}
            </div>
          )}
          <h3>{activePet.nombre}</h3>
          <p>{activePet.raza || activePet.especie} • {activePet.edad || 'Edad no especificada'}</p>
          {activePet.microchip && <p className="qr-chip">Microchip: {activePet.microchip}</p>}
        </div>

        <div className="qr-code-wrapper">
          <QRCode
            value={publicUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="qr-instruction">
          Escanea para acceder al expediente médico de emergencia sin necesidad de iniciar sesión.
        </p>

        <div style={{ wordBreak: 'break-all', fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '8px', borderRadius: '8px' }}>
          {publicUrl}
        </div>
      </div>
    </Modal>
  );
}
