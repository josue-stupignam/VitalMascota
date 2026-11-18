import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, Link2Off, RefreshCw, Timer, UserRoundCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import {
  HORAS_CUIDADOR,
  accesosVigentes,
  crearAcceso,
  horasRestantes,
  urlCuidador,
} from '../../lib/accesos';
import { vibrateSuccess } from '../../lib/haptics';

export default function PetSitterModal({ pet, isOpen, onClose, onUpdatePet }) {
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);

  if (!pet) return null;

  const accesos = accesosVigentes(pet.accesos).filter((a) => a.tipo === 'cuidador');
  const accesoActivo = accesos[accesos.length - 1];
  const sitterUrl = accesoActivo ? urlCuidador(pet.id, accesoActivo.token) : '';

  const crearEnlace = async () => {
    setGenerando(true);
    try {
      const nuevo = crearAcceso('cuidador', HORAS_CUIDADOR);
      const otros = accesosVigentes(pet.accesos).filter((a) => a.tipo !== 'cuidador');
      await onUpdatePet({ accesos: [...otros, nuevo] });
      vibrateSuccess();
    } catch (err) {
      console.error('Error al generar el acceso de cuidador:', err);
    } finally {
      setGenerando(false);
    }
  };

  const revocar = async (token) => {
    const restantes = accesosVigentes(pet.accesos).filter((a) => a.token !== token);
    await onUpdatePet({ accesos: restantes });
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(sitterUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de cuidadores">
      <div className="sitter-modal">
        <p className="sitter-intro">
          Enlace temporal de <strong>solo lectura (48 horas)</strong> para el paseador, guardería o
          cuidador de <strong>{pet.nombre}</strong>. Muestra únicamente rutinas de alimentación y
          teléfonos de emergencia.
        </p>

        {accesoActivo ? (
          <div className="sitter-card">
            <div className="qr-code-wrapper">
              <QRCode value={sitterUrl} size={160} level="M" includeMargin={true} />
            </div>
            <span className="qr-expiry">
              <Timer size={13} /> Válido {horasRestantes(accesoActivo.expira)} h más
            </span>
            <div className="qr-url">{sitterUrl}</div>
            <div className="qr-actions">
              <button type="button" className="btn btn-primary" onClick={copiar}>
                <Copy size={16} /> {copiado ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={crearEnlace}
                disabled={generando}
              >
                <RefreshCw size={16} /> Regenerar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={crearEnlace}
            disabled={generando}
          >
            <UserRoundCheck size={16} /> {generando ? 'Generando…' : 'Generar enlace de 48 horas'}
          </button>
        )}

        <div className="sitter-permissions">
          <span className="section-label">El cuidador podrá ver</span>
          <ul>
            <li>Raciones y horarios de comida</li>
            <li>Rutinas asignadas (paseo, medicinas)</li>
            <li>Teléfonos de emergencia y veterinaria</li>
            <li>No puede editar ni borrar ningún dato</li>
          </ul>
        </div>

        {accesos.length > 0 && (
          <div className="sitter-access-list">
            <span className="section-label">Accesos activos ({accesos.length})</span>
            {accesos.map((a) => (
              <div key={a.token} className="sitter-access-row">
                <span className="sitter-access-info">
                  <Timer size={13} /> {horasRestantes(a.expira)} h restantes
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => revocar(a.token)}
                  title="Revocar acceso"
                  aria-label="Revocar acceso"
                >
                  <Link2Off size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
