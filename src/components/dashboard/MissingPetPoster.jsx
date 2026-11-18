import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Gift, MapPin, Megaphone, PawPrint, Phone } from 'lucide-react';
import Modal from '../ui/Modal';
import { useUser } from '../../context/UserContext';

export default function MissingPetPoster({ pet, isOpen, onClose }) {
  const posterRef = useRef(null);
  const { profile } = useUser();
  const [telefono, setTelefono] = useState('');
  const [recompensa, setRecompensa] = useState('');
  const [lugarExtravio, setLugarExtravio] = useState('');
  const [detalles, setDetalles] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (profile?.telefono) {
      setTelefono((actual) => actual || profile.telefono);
    }
  }, [profile]);

  if (!pet) return null;

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `SE_BUSCA_${pet.nombre.toUpperCase()}.png`;
      link.click();
    } catch (err) {
      console.error('Error al generar cartel:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const avatarUrl = pet.avatar_url || pet.foto;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Megaphone size={18} aria-hidden="true" /> Cartel digital de extravío
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="cartel-telefono">
              Teléfono de contacto *
            </label>
            <input
              id="cartel-telefono"
              type="tel"
              className="input-field"
              placeholder="Ej. +52 55 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="cartel-recompensa">
              Recompensa (opcional)
            </label>
            <input
              id="cartel-recompensa"
              type="text"
              className="input-field"
              placeholder="Ej. $2,000 MXN"
              value={recompensa}
              onChange={(e) => setRecompensa(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="cartel-lugar">
            Última vez visto (lugar / colonia)
          </label>
          <input
            id="cartel-lugar"
            type="text"
            className="input-field"
            placeholder="Ej. Parque México, Condesa"
            value={lugarExtravio}
            onChange={(e) => setLugarExtravio(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="cartel-senas">
            Señas particulares
          </label>
          <input
            id="cartel-senas"
            type="text"
            className="input-field"
            placeholder="Ej. Mancha blanca en pecho, collar rojo"
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
          />
        </div>

        <div
          ref={posterRef}
          style={{
            background: '#ffffff',
            border: '6px solid #ff3b30',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            color: '#1a1a2e',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              background: '#ff3b30',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '1.4rem',
              fontWeight: '900',
              letterSpacing: '2px',
              marginBottom: '10px',
            }}
          >
            SE BUSCA
          </div>

          <div
            style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 10px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ddd',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={pet.nombre}
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PawPrint size={64} color="#9aa0a6" aria-hidden="true" />
            )}
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '4px 0', color: '#1a1a2e' }}>
            {pet.nombre.toUpperCase()}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '8px' }}>
            {pet.raza || pet.especie} · {pet.sexo || ''} · {pet.edad || ''}
          </p>

          {detalles && (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#333',
                background: '#fff5e0',
                padding: '6px',
                borderRadius: '6px',
                margin: '6px 0',
              }}
            >
              <strong>Señas:</strong> {detalles}
            </p>
          )}

          {lugarExtravio && (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#333',
                margin: '6px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <MapPin size={14} aria-hidden="true" />
              <strong>Visto en:</strong> {lugarExtravio}
            </p>
          )}

          {recompensa && (
            <div
              style={{
                background: '#e8f9ee',
                color: '#1f8a44',
                border: '1px solid #34c759',
                padding: '6px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                margin: '8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Gift size={16} aria-hidden="true" /> RECOMPENSA: {recompensa}
            </div>
          )}

          <div
            style={{
              marginTop: '12px',
              padding: '10px',
              background: '#ffe5e3',
              borderRadius: '10px',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#ff3b30',
                textTransform: 'uppercase',
              }}
            >
              Si lo has visto o tienes informes llama urgente a:
            </p>
            <p
              style={{
                fontSize: '1.3rem',
                fontWeight: '900',
                color: '#1a1a2e',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Phone size={18} aria-hidden="true" />
              {telefono || 'Introduce un número'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating || !telefono}
          className="btn"
          style={{
            background: 'var(--color-danger)',
            color: '#fff',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '1rem',
            width: '100%',
            gap: 8,
          }}
        >
          <Download size={18} aria-hidden="true" />
          {isGenerating ? 'Generando imagen…' : 'Descargar cartel (PNG)'}
        </button>
      </div>
    </Modal>
  );
}
