import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="not-found">
      <Compass size={64} strokeWidth={1.5} aria-hidden="true" />
      <h1>No encontramos esta página</h1>
      <p>El enlace puede estar roto o la página se movió de lugar.</p>
      <button
        type="button"
        className="btn btn-primary not-found-action"
        onClick={() => navigate(user ? '/dashboard' : '/login', { replace: true })}
      >
        {user ? <Home size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
        {user ? 'Volver al panel' : 'Ir a iniciar sesión'}
      </button>
    </main>
  );
}
