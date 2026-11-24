import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  UserMinus,
  Users,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useFamily } from '../../context/FamilyContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/profile.css';

export default function FamilySection() {
  const { family, members, loading, esAdmin, crear, unirse, regenerar, expulsar, salir } =
    useFamily();
  const { profile } = useUser();
  const { user } = useAuth();

  const [codigo, setCodigo] = useState('');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const mostrarError = (err) => {
    setAviso('');
    setError(err?.message || 'No se pudo completar la acción. Inténtalo de nuevo.');
  };

  const handleCrear = async () => {
    if (ocupado) return;
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await crear();
      setAviso('Familia creada. Comparte el código de invitación con tus integrantes.');
    } catch (err) {
      mostrarError(err);
    } finally {
      setOcupado(false);
    }
  };

  const handleUnirse = async (e) => {
    e.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await unirse(codigo);
      setCodigo('');
      setAviso('Te uniste a la familia.');
    } catch (err) {
      mostrarError(err);
    } finally {
      setOcupado(false);
    }
  };

  const handleRegenerar = async () => {
    if (ocupado) return;
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await regenerar();
      setCopiado(false);
      setAviso('Código de invitación regenerado. El anterior ya no funciona.');
    } catch (err) {
      mostrarError(err);
    } finally {
      setOcupado(false);
    }
  };

  const copiarCodigo = async () => {
    if (!family?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(family.inviteCode);
      setCopiado(true);
      setAviso('Código copiado al portapapeles.');
    } catch (err) {
      setError('No se pudo copiar. Selecciona el código y cópialo manualmente.');
    }
  };

  const confirmarAccion = async () => {
    if (!confirmacion || ocupado) return;
    setOcupado(true);
    setError('');
    try {
      if (confirmacion.tipo === 'expulsar') {
        await expulsar(confirmacion.member.uid);
        setAviso(`${confirmacion.member.name} ya no pertenece a la familia.`);
      } else {
        await salir();
        setAviso('Saliste de la familia.');
      }
      setConfirmacion(null);
    } catch (err) {
      mostrarError(err);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="card profile-family">
      <h3 className="card-title">
        <Users size={18} aria-hidden="true" /> Familia
      </h3>

      {loading && <p className="profile-help">Cargando familia…</p>}

      {!loading && !family && (
        <>
          <p className="profile-help">
            Crea una familia para compartir mascotas y rutinas, o únete con un código de
            invitación. Solo puedes pertenecer a una familia a la vez.
          </p>

          <button
            type="button"
            className="btn btn-primary profile-family-btn"
            onClick={handleCrear}
            disabled={ocupado}
          >
            <Plus size={16} aria-hidden="true" /> Crear familia
          </button>

          <form className="family-join" onSubmit={handleUnirse}>
            <div className="input-group">
              <label className="input-label" htmlFor="family-code">
                Código de invitación
              </label>
              <input
                id="family-code"
                type="text"
                className="input-field family-code-input"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
                required
              />
            </div>
            <button type="submit" className="btn btn-ghost" disabled={ocupado || !codigo.trim()}>
              <KeyRound size={16} aria-hidden="true" /> Unirme a una familia
            </button>
          </form>
        </>
      )}

      {!loading && family && (
        <>
          <div className="family-header">
            <span className="family-count">
              {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}
            </span>
            {esAdmin && <span className="family-role-badge">Administrador</span>}
          </div>

          <ul className="family-members">
            {members.map((miembro) => {
              const esYo = miembro.uid === user?.uid;
              const esAdminMiembro = miembro.role === 'admin';
              return (
                <li key={miembro.uid} className="family-member">
                  <div className="family-member-info">
                    <span className="family-member-name">
                      {miembro.name || miembro.email || 'Integrante'}
                      {esYo ? ' (tú)' : ''}
                    </span>
                    {miembro.email && (
                      <span className="family-member-email">{miembro.email}</span>
                    )}
                  </div>
                  <span className="family-member-role">
                    {esAdminMiembro ? 'Administrador' : 'Integrante'}
                  </span>
                  {esAdmin && !esAdminMiembro && (
                    <button
                      type="button"
                      className="btn btn-ghost family-remove"
                      onClick={() => setConfirmacion({ tipo: 'expulsar', member: miembro })}
                    >
                      <UserMinus size={15} aria-hidden="true" /> Expulsar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {esAdmin && (
            <div className="family-code-box">
              <span className="input-label">Código de invitación</span>
              <div className="family-code-row">
                <code className="family-code">{family.inviteCode}</code>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={copiarCodigo}
                  title="Copiar código"
                >
                  {copiado ? (
                    <CheckCircle2 size={16} aria-hidden="true" />
                  ) : (
                    <Copy size={16} aria-hidden="true" />
                  )}
                  Copiar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleRegenerar}
                  disabled={ocupado}
                  title="Regenerar código"
                >
                  <RefreshCw size={16} aria-hidden="true" /> Regenerar
                </button>
              </div>
              <p className="profile-help">
                Solo el administrador puede generar y copiar el código de invitación.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost family-leave"
            onClick={() => setConfirmacion({ tipo: 'salir' })}
          >
            <LogOut size={16} aria-hidden="true" /> Salir de la familia
          </button>
        </>
      )}

      {error && (
        <p className="profile-error" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="profile-success" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> {aviso}
        </p>
      )}

      <Modal
        isOpen={Boolean(confirmacion)}
        onClose={() => setConfirmacion(null)}
        title={confirmacion?.tipo === 'expulsar' ? 'Expulsar integrante' : 'Salir de la familia'}
      >
        <div className="form-stack">
          <p className="profile-help">
            {confirmacion?.tipo === 'expulsar'
              ? `Se quitará a ${confirmacion?.member?.name} de la familia y perderá acceso a las mascotas compartidas.`
              : 'Si sales, dejarás de ver las mascotas compartidas de esta familia.'}
          </p>
          <div className="profile-danger-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmacion(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmarAccion}
              disabled={ocupado}
            >
              {confirmacion?.tipo === 'expulsar' ? 'Expulsar' : 'Salir'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
