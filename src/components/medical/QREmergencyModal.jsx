import React, { useEffect, useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, RefreshCw, ShieldCheck, Timer, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { getEspecieIcono } from '../../lib/especies';
import { usePet } from '../../context/PetContext';
import {
  HORAS_EMERGENCIA,
  accesosVigentes,
  crearAcceso,
  horasRestantes,
  urlEmergencia,
} from '../../lib/accesos';
import { vibrateSuccess } from '../../lib/haptics';
import '../../styles/global.css';

export default function QREmergencyModal({ isOpen, onClose }) {
  const { activePet, updatePet } = usePet();
  const [horas, setHoras] = useState(48);
  const [token, setToken] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (!isOpen || !activePet) return;
    const vigentes = accesosVigentes(activePet.accesos).filter(
      (a) => a.tipo === 'emergencia'
    );
    setToken(vigentes.length > 0 ? vigentes[vigentes.length - 1].token : '');
    setCopiado(false);
  }, [isOpen, activePet]);

  if (!activePet) return null;

  const Icono = getEspecieIcono(activePet.especie);
  const publicUrl = token ? urlEmergencia(activePet.id, token) : '';
  const accesoActual = accesosVigentes(activePet.accesos).find((a) => a.token === token);
  const restantes = accesoActual ? horasRestantes(accesoActual.expira) : 0;

  const generar = async (horasElegidas) => {
    setGenerando(true);
    try {
      const nuevo = crearAcceso('emergencia', horasElegidas);
      const otros = accesosVigentes(activePet.accesos).filter(
        (a) => a.tipo !== 'emergencia'
      );
      await updatePet({ accesos: [...otros, nuevo] });
      setToken(nuevo.token);
      vibrateSuccess();
    } catch (err) {
      console.error('Error al generar el acceso de emergencia:', err);
    } finally {
      setGenerando(false);
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferencia de emergencia">
      <div className="qr-modal-content">
        <div className="qr-pet-info">
          {activePet.avatar_url || activePet.foto ? (
            <img
              src={activePet.avatar_url || activePet.foto}
              alt={activePet.nombre}
              className="qr-pet-photo"
            />
          ) : (
            <div className="qr-pet-photo qr-pet-photo-icon">
              <Icono size={34} />
            </div>
          )}
          <h3>{activePet.nombre}</h3>
          <p>
            {activePet.raza || activePet.especie} • {activePet.edad || 'Edad no especificada'}
          </p>
          {activePet.microchip && <p className="qr-chip">Microchip: {activePet.microchip}</p>}
        </div>

        {!token ? (
          <>
            <p className="qr-instruction">
              Elige cuánto tiempo estará disponible la ficha médica pública. Pasado ese plazo el
              enlace deja de funcionar automáticamente.
            </p>
            <div className="segmented">
              {HORAS_EMERGENCIA.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={horas === h ? 'active' : ''}
                  onClick={() => setHoras(h)}
                >
                  {h} horas
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => generar(horas)}
              disabled={generando}
            >
              <ShieldCheck size={16} /> {generando ? 'Generando…' : 'Generar enlace seguro'}
            </button>
          </>
        ) : (
          <>
            <div className="qr-code-wrapper">
              <QRCode value={publicUrl} size={180} level="H" includeMargin={true} />
            </div>

            <span className="qr-expiry">
              <Timer size={13} /> Válido {restantes} h más
            </span>

            <p className="qr-instruction">
              Escanea para abrir el expediente médico de emergencia sin iniciar sesión. El acceso es
              de solo lectura.
            </p>

            <div className="qr-url">{publicUrl}</div>

            <div className="qr-actions">
              <button type="button" className="btn btn-primary" onClick={copiar}>
                <Copy size={16} /> {copiado ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => generar(horas)}
                disabled={generando}
              >
                <RefreshCw size={16} /> Regenerar
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost qr-revoke"
              onClick={async () => {
                const otros = accesosVigentes(activePet.accesos).filter((a) => a.token !== token);
                await updatePet({ accesos: otros });
                setToken('');
              }}
            >
              <X size={16} /> Revocar este acceso
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
