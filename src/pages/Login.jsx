import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const { user, login, register, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está logueado por caché de sesión, redirigir
  if (user) return <Navigate to="/dashboard" replace />;

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
      setLocalError(err.message || 'Error de autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Logo y marca */}
      <div className="login-brand">
        <span className="login-logo">🐾</span>
        <h1 className="login-title">VitalMascota</h1>
        <p className="login-subtitle">El cuidado de tu mascota, en familia</p>
      </div>

      {/* Formulario */}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            autoComplete="current-password"
          />
        </div>

        {(error || localError) && (
          <div className="login-error">
            <span>⚠️</span> {error || localError}
          </div>
        )}

        {/* Botón anclado al fondo */}
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
              isRegistering ? 'Registrarse' : 'Iniciar Sesión'
            )}
          </button>

          <p className="login-hint" onClick={() => setIsRegistering(!isRegistering)} style={{cursor: 'pointer', textDecoration: 'underline'}}>
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
          </p>
        </div>
      </form>
    </div>
  );
}
