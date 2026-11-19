import React, { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const generarReto = () => {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  const usaSuma = Math.random() < 0.6;
  return {
    a,
    b,
    operador: usaSuma ? '+' : '×',
    respuesta: usaSuma ? a + b : a * b,
  };
};

export default function Captcha({ onChange, resetKey = 0 }) {
  const [reto, setReto] = useState(generarReto);
  const [valor, setValor] = useState('');

  useEffect(() => {
    setReto(generarReto());
    setValor('');
  }, [resetKey]);

  const correcto = valor.trim() !== '' && Number(valor) === reto.respuesta;

  useEffect(() => {
    if (onChange) onChange(correcto);
  }, [correcto, onChange]);

  const refrescar = () => {
    setReto(generarReto());
    setValor('');
  };

  return (
    <div className="input-group captcha-group">
      <label className="input-label" htmlFor="auth-captcha">
        Verificación anti-bots
      </label>
      <div className="captcha-row">
        <span className="captcha-question" aria-live="polite">
          <ShieldCheck size={16} aria-hidden="true" /> ¿Cuánto es {reto.a} {reto.operador} {reto.b}?
        </span>
        <button
          type="button"
          className="icon-btn captcha-refresh"
          onClick={refrescar}
          aria-label="Generar otra pregunta de verificación"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>
      <input
        id="auth-captcha"
        type="text"
        inputMode="numeric"
        className="input-field"
        value={valor}
        onChange={(e) => setValor(e.target.value.replace(/[^0-9-]/g, ''))}
        placeholder="Escribe el resultado"
        autoComplete="off"
        required
      />
    </div>
  );
}
