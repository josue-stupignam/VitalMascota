import React, { useState } from 'react';
import { Check, PawPrint, TriangleAlert, X } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Captcha from './Captcha';
import '../../styles/auth.css';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAYUSCULA = /[A-Z]/;
const SIMBOLO = /[!@#$%^&*(),.?":{}|<>]/;

const reglasPassword = (password) => [
  { id: 'largo', texto: 'Al menos 10 caracteres', cumple: password.length >= 10 },
  { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: MAYUSCULA.test(password) },
  { id: 'simbolo', texto: 'Un símbolo especial (!@#$%^&*…)', cumple: SIMBOLO.test(password) },
];

const passwordSegura = (password) => reglasPassword(password).every((r) => r.cumple);

export default function AuthView() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  // Redirigir si ya tiene sesión iniciada
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleAuthMode = () => {
    setIsRegistering((prev) => !prev);
    // Reiniciar campos explícitamente para evitar trampas visuales y autocompletados erróneos
    setNombre('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    setCaptchaKey((prev) => prev + 1);
  };

  const validar = () => {
    if (isRegistering && !nombre.trim()) {
      return 'Escribe tu nombre completo.';
    }
    if (!EMAIL_VALIDO.test(email.trim())) {
      return 'El formato de correo no es válido.';
    }
    if (isRegistering && !passwordSegura(password)) {
      return 'La contraseña debe tener al menos 10 caracteres, una mayúscula y un símbolo especial.';
    }
    if (isRegistering && password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }
    if (!captchaOk) {
      return 'Resuelve la verificación anti-bots para continuar.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const mensajeValidacion = validar();
    if (mensajeValidacion) {
      setLocalError(mensajeValidacion);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(nombre.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
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
        errorMsg = 'La contraseña debe tener al menos 10 caracteres, una mayúscula y un símbolo especial.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato de correo no es válido.';
      }
      setLocalError(errorMsg);
      setCaptchaKey((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reglas = reglasPassword(password);

  return (
    <div className="login-page">
      <div className="login-brand">
        <span className="login-logo">
          <PawPrint size={30} />
        </span>
        <h1 className="login-title">VitalMascota</h1>
        <p className="login-subtitle">El cuidado de tu mascota, en familia</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {isRegistering && (
          <div className="input-group">
            <label htmlFor="auth-nombre" className="input-label">
              Nombre completo
            </label>
            <input
              id="auth-nombre"
              type="text"
              className="input-field"
              placeholder="Ej. Ana López"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

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
            placeholder={isRegistering ? 'Mínimo 10 caracteres' : 'Tu contraseña'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
          />
          {isRegistering && (
            <ul className="password-rules">
              {reglas.map((regla) => (
                <li
                  key={regla.id}
                  className={`password-rule ${regla.cumple ? 'rule-ok' : 'rule-pending'}`}
                >
                  {regla.cumple ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}
                  {regla.texto}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isRegistering && (
          <div className="input-group">
            <label htmlFor="auth-confirm" className="input-label">
              Confirmar contraseña
            </label>
            <input
              id="auth-confirm"
              type="password"
              className="input-field"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="field-hint field-hint-error">Las contraseñas no coinciden.</p>
            )}
          </div>
        )}

        <Captcha onChange={setCaptchaOk} resetKey={captchaKey} />

        {localError && (
          <div className="login-error" role="alert">
            <TriangleAlert size={16} /> <span>{localError}</span>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleAuthMode();
            }}
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
