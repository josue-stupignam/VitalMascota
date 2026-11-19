import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Save,
  LogOut,
  Trash2,
  UserRound,
  CheckCircle2,
  Palette,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { usePet } from '../context/PetContext';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ui/ThemeToggle';
import '../styles/profile.css';

const TELEFONO_VALIDO = /^[0-9+\s-]{7,15}$/;

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, logoutAndClear } = useUser();
  const { pets, removePet } = usePet();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [zonaAbierta, setZonaAbierta] = useState(false);
  const [petAEliminar, setPetAEliminar] = useState(null);
  const [confirmacion, setConfirmacion] = useState('');
  const [errorEliminar, setErrorEliminar] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '');
      setTelefono(profile.telefono || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardado(false);

    const telefonoLimpio = telefono.trim();
    if (telefonoLimpio && !TELEFONO_VALIDO.test(telefonoLimpio)) {
      setError('Escribe un teléfono válido de 7 a 15 dígitos. Puedes usar +, espacios o guiones.');
      return;
    }

    setGuardando(true);
    try {
      await updateProfile({ nombre: nombre.trim(), telefono: telefonoLimpio });
      setGuardado(true);
    } catch (err) {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    await logoutAndClear();
    navigate('/login', { replace: true });
  };

  const abrirEliminar = (pet) => {
    setPetAEliminar(pet);
    setConfirmacion('');
    setErrorEliminar('');
  };

  const cerrarEliminar = () => {
    setPetAEliminar(null);
    setConfirmacion('');
    setErrorEliminar('');
  };

  const confirmarEliminar = async (e) => {
    e.preventDefault();
    if (!petAEliminar) return;

    const esperado = (petAEliminar.nombre || '').trim().toLowerCase();
    if (confirmacion.trim().toLowerCase() !== esperado) {
      setErrorEliminar('El nombre no coincide. Escríbelo tal como aparece arriba.');
      return;
    }

    setEliminando(true);
    try {
      await removePet(petAEliminar.id);
      cerrarEliminar();
    } catch (err) {
      setErrorEliminar('No se pudo eliminar la mascota. Intenta de nuevo.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <main className="page">
      <PageHeader title="Mi perfil" subtitle="Datos del propietario" icon={<UserRound size={22} />} />

      <form className="profile-form card" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="perfil-nombre" className="input-label">
            Nombre
          </label>
          <input
            id="perfil-nombre"
            type="text"
            className="input-field"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </div>

        <div className="input-group">
          <label htmlFor="perfil-email" className="input-label">
            Correo electrónico
          </label>
          <div className="profile-input-icon">
            <Mail size={16} aria-hidden="true" />
            <input
              id="perfil-email"
              type="email"
              className="input-field"
              value={user?.email || ''}
              readOnly
              disabled
            />
          </div>
          <p className="profile-help">El correo se gestiona desde tu cuenta y no se puede editar aquí.</p>
        </div>

        <div className="input-group">
          <label htmlFor="perfil-telefono" className="input-label">
            Teléfono
          </label>
          <div className="profile-input-icon">
            <Phone size={16} aria-hidden="true" />
            <input
              id="perfil-telefono"
              type="tel"
              inputMode="tel"
              className="input-field"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+52 55 1234 5678"
              autoComplete="tel"
            />
          </div>
          <p className="profile-help">Se usa para el cartel de mascota extraviada.</p>
        </div>

        {error && (
          <p className="profile-error" role="alert">
            {error}
          </p>
        )}

        {guardado && (
          <p className="profile-success" role="status">
            <CheckCircle2 size={16} aria-hidden="true" /> Cambios guardados
          </p>
        )}

        <button type="submit" className="btn btn-primary profile-save" disabled={guardando}>
          <Save size={16} aria-hidden="true" />
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <section className="card profile-theme">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={18} aria-hidden="true" /> Apariencia
        </h3>
        <p className="profile-help">El tema oscuro es el predeterminado para cuidar tu vista de noche.</p>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </section>

      <section className="card profile-danger">
        <button
          type="button"
          className="profile-danger-toggle"
          onClick={() => setZonaAbierta((prev) => !prev)}
          aria-expanded={zonaAbierta}
          aria-controls="profile-danger-body"
        >
          <span className="profile-danger-title">
            <AlertTriangle size={16} aria-hidden="true" /> Zona de riesgo
          </span>
          {zonaAbierta ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
        </button>

        {zonaAbierta && (
          <div id="profile-danger-body" className="profile-danger-body">
            <p className="profile-help">
              Dar de baja una mascota elimina su expediente, rutinas e inventario de forma permanente.
            </p>

            {pets.length === 0 ? (
              <p className="profile-help">No tienes mascotas registradas.</p>
            ) : (
              <ul className="profile-danger-list">
                {pets.map((pet) => (
                  <li key={pet.id} className="profile-danger-item">
                    <span className="profile-danger-name">{pet.nombre}</span>
                    <button
                      type="button"
                      className="btn btn-danger profile-danger-btn"
                      onClick={() => abrirEliminar(pet)}
                    >
                      <Trash2 size={15} aria-hidden="true" /> Dar de baja
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <button type="button" className="btn profile-logout" onClick={handleLogout}>
        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
      </button>

      <Modal
        isOpen={Boolean(petAEliminar)}
        onClose={cerrarEliminar}
        title="Confirmar baja de mascota"
      >
        <form className="form-stack" onSubmit={confirmarEliminar}>
          <p className="profile-danger-warning">
            Esta acción no se puede deshacer. Se eliminará el expediente completo de{' '}
            <strong>{petAEliminar?.nombre}</strong>.
          </p>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmar-nombre">
              Escribe <strong>{petAEliminar?.nombre}</strong> para confirmar
            </label>
            <input
              id="confirmar-nombre"
              type="text"
              className="input-field"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>

          {errorEliminar && (
            <p className="form-error" role="alert">
              {errorEliminar}
            </p>
          )}

          <div className="profile-danger-actions">
            <button type="button" className="btn btn-ghost" onClick={cerrarEliminar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" disabled={eliminando}>
              <Trash2 size={16} aria-hidden="true" />
              {eliminando ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
