import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function AuthView() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya tiene sesión iniciada
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleAuthMode = () => {
    setIsRegistering((prev) => !prev);
    // Reiniciar campos explícitamente para evitar trampas visuales y autocompletados erróneos
    setEmail('');
    setPassword('');
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error de autenticación:', err);
      let errorMsg = 'Error al procesar la solicitud.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMsg = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Este correo ya está registrado. Por favor inicia sesión.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato de correo no es válido.';
      }
      setLocalError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <span className="login-logo">🐾</span>
        <h1 className="login-title">VitalMascota</h1>
        <p className="login-subtitle">El cuidado de tu mascota, en familia</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="auth-email" className="input-label">
            Correo electrónico
          </label>
          <input
            id="auth-email"
            type="email"
            className="input-field"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="auth-password" className="input-label">
            Contraseña
          </label>
          <input
            id="auth-password"
            type="password"
            className="input-field"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
          />
        </div>

        {localError && (
          <div className="login-error" role="alert">
            <span>⚠️</span> <span>{localError}</span>
          </div>
        )}

        <div className="login-actions">
          <button
            type="submit"
            className="btn-login"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span>
                {isRegistering ? 'Creando cuenta…' : 'Iniciando sesión…'}
              </span>
            ) : (
              isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'
            )}
          </button>

          <p
            className="login-hint"
            onClick={toggleAuthMode}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            role="button"
            tabIndex={0}
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta? Regístrate aquí'}
          </p>
        </div>
      </form>
    </div>
  );
}
