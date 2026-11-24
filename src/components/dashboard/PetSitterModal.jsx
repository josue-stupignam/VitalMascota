import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Copy, Link2Off, RefreshCw, Timer, UserRoundCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import { db } from '../../firebaseConfig';
import { useUser } from '../../context/UserContext';
import {
  HORAS_CUIDADOR,
  accesosVigentes,
  crearAcceso,
  horasRestantes,
  urlCuidador,
} from '../../lib/accesos';
import { getPorcionDiaria, getTalla } from '../../lib/pets';
import { vibrateSuccess } from '../../lib/haptics';

async function borrarEnlace(token) {
  try {
    await deleteDoc(doc(db, 'sitterLinks', token));
  } catch (err) {
    console.error('No se pudo borrar el enlace de cuidador:', err);
  }
}

export default function PetSitterModal({ pet, isOpen, onClose, onUpdatePet }) {
  const { profile } = useUser();
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!pet) return null;

  const accesos = accesosVigentes(pet.accesos).filter((a) => a.tipo === 'cuidador');
  const accesoActivo = accesos[accesos.length - 1];
  const sitterUrl = accesoActivo ? urlCuidador(accesoActivo.token) : '';
  const medico = pet.medico || {};
  const alimento = (pet.inventario || []).find(
    (item) => item.tipo === 'alimento' && item.porcionDiaria
  );
  const porcion = alimento?.porcionDiaria || getPorcionDiaria(pet.talla);
  const talla = getTalla(pet.talla);

  const crearEnlace = async () => {
    if (!onUpdatePet) return;
    setGenerando(true);
    setErrorMsg('');
    try {
      const nuevo = crearAcceso('cuidador', HORAS_CUIDADOR);
      const datosEnlace = {
        token: nuevo.token,
        petId: pet.id,
        petNombre: pet.nombre,
        petFoto: pet.avatar_url || pet.foto || '',
        especie: pet.especie || '',
        raza: pet.raza || '',
        edad: pet.edad || '',
        talla: pet.talla || 'mediana',
        racion: porcion,
        racionNota: alimento
          ? `ración diaria indicada por el dueño (${alimento.nombre})`
          : `ración diaria recomendada para talla ${talla.label}`,
        tareas: (pet.tareas || []).map((t) => ({
          id: t.id,
          tarea: t.tarea,
          asignadoA: t.asignadoA || '',
        })),
        contacto: {
          veterinario: medico.veterinario || '',
          clinica: medico.clinica || '',
          telefono: medico.telefono || '',
          telefonoDueno: profile?.telefono || '',
        },
        creado: new Date().toISOString(),
        expiresAt: new Date(nuevo.expira).toISOString(),
      };

      await setDoc(doc(db, 'sitterLinks', nuevo.token), datosEnlace);

      // Al regenerar, los enlaces anteriores de cuidador dejan de servir.
      await Promise.all(accesos.map((acceso) => borrarEnlace(acceso.token)));

      const otros = accesosVigentes(pet.accesos).filter((a) => a.tipo !== 'cuidador');
      await onUpdatePet({
        accesos: [...otros, { token: nuevo.token, tipo: 'cuidador', creado: nuevo.creado, expira: nuevo.expira }],
      });
      setCopiado(false);
      vibrateSuccess();
    } catch (err) {
      console.error('Error al generar el acceso de cuidador:', err);
      setErrorMsg('No se pudo generar el enlace. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  const revocar = async (token) => {
    try {
      await borrarEnlace(token);
      const restantes = accesosVigentes(pet.accesos).filter((a) => a.token !== token);
      await onUpdatePet({ accesos: restantes });
      setErrorMsg('');
    } catch (err) {
      console.error('Error al revocar el acceso:', err);
      setErrorMsg('No se pudo revocar el acceso. Inténtalo de nuevo.');
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(sitterUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch (err) {
      setErrorMsg('No se pudo copiar. Selecciona el enlace manualmente.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de cuidadores">
      <div className="sitter-modal">
        <p className="sitter-intro">
          Enlace temporal de <strong>solo lectura (48 horas)</strong> para el paseador, guardería o
          cuidador de <strong>{pet.nombre}</strong>. Muestra únicamente rutinas de cuidado y
          teléfonos de emergencia, y funciona sin iniciar sesión.
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

        {errorMsg && <p className="form-error">{errorMsg}</p>}

        <div className="sitter-permissions">
          <span className="section-label">El cuidador podrá ver</span>
          <ul>
            <li>Ración diaria y rutinas de comida</li>
            <li>Rutinas asignadas (paseo, medicinas)</li>
            <li>Teléfonos del dueño y de la veterinaria</li>
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
