import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Save, LogOut, UserRound, CheckCircle2, Palette } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ui/ThemeToggle';
import '../styles/profile.css';

const TELEFONO_VALIDO = /^[0-9+\s-]{7,15}$/;

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, logoutAndClear } = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

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

      <button type="button" className="btn profile-logout" onClick={handleLogout}>
        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
      </button>
    </main>
  );
}
