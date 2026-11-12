import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

export default function PetSitterModal({ pet, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!pet) return null;

  // El token o enlace de invitado temporal dura 48h desde su generación
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
  const sitterUrl = `${window.location.origin}/cuidador/${pet.id}?exp=${expiresAt}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sitterUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤝 Gestión de Cuidadores (Pet Sitter)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Genera un enlace temporal de <strong>sólo lectura (válido por 48 horas)</strong> para el paseador, guardería o cuidador de <strong>{pet.nombre}</strong>.
        </p>

        <div
          style={{
            background: 'var(--color-bg)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div className="qr-code-wrapper" style={{ margin: 0, padding: '10px' }}>
            <QRCode value={sitterUrl} size={160} level="M" includeMargin={true} />
          </div>

          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'var(--color-warning-bg)',
              color: '#8a6d00',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            ⏳ Válido por 48 Horas • Permisos de Sólo Lectura
          </div>
        </div>

        <div style={{ textAlign: 'left', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
            ¿Qué podrá ver el cuidador?
          </span>
          <ul style={{ fontSize: '0.82rem', paddingLeft: '20px', margin: 0, color: 'var(--color-text)' }}>
            <li>Horarios y porciones de comida e insumos</li>
            <li>Rutinas y tareas asignadas (paseo, medicinas)</li>
            <li>Contactos de emergencia y veterinaria de cabecera</li>
            <li>No podrá alterar expedientes ni borrar datos</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="btn"
          style={{
            background: copied ? 'var(--color-success)' : 'var(--color-primary)',
            color: '#fff',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '0.95rem',
          }}
        >
          {copied ? '✓ Enlace Copiado al Portapapeles' : '📋 Copiar Enlace de Acceso Temporal'}
        </button>
      </div>
    </Modal>
  );
}
