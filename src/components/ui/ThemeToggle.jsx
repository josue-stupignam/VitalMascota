import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle, showLabel = true }) {
  const esOscuro = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {esOscuro ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
      {showLabel && <span>{esOscuro ? 'Tema claro' : 'Tema oscuro'}</span>}
    </button>
  );
}
