import React from 'react';
import '../../styles/global.css';

export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
