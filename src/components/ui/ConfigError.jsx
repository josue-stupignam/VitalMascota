import React from 'react';
import { TriangleAlert } from 'lucide-react';

export default function ConfigError({ mensaje, faltantes = [] }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#0f1117',
        color: '#e8eaf2',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <TriangleAlert size={26} color="#ffb340" aria-hidden="true" />
          <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Configuración incompleta</h1>
        </div>
        <p style={{ color: '#9aa3b2', lineHeight: 1.6 }}>
          La aplicación no puede conectarse porque faltan variables de entorno de Firebase en este
          despliegue. No es un problema de tu cuenta ni de tus datos.
        </p>
        {faltantes.length > 0 && (
          <ul
            style={{
              background: '#1f2430',
              border: '1px solid #2a3140',
              borderRadius: '12px',
              padding: '12px 12px 12px 30px',
              fontSize: '0.85rem',
              color: '#ffb340',
            }}
          >
            {faltantes.map((clave) => (
              <li key={clave}>
                <code>{clave}</code>
              </li>
            ))}
          </ul>
        )}
        <p style={{ color: '#9aa3b2', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Añádelas en el panel de tu hosting (Vercel → Settings → Environment Variables) con los
          mismos nombres de <code>.env.example</code> y vuelve a desplegar.
        </p>
        {mensaje && (
          <p style={{ color: '#ff6b60', fontSize: '0.8rem', wordBreak: 'break-word' }}>{mensaje}</p>
        )}
      </div>
    </div>
  );
}
