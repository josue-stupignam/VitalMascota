import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">🏠</span>
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/perfil-medico"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">🩺</span>
        <span>Médico</span>
      </NavLink>

      <NavLink
        to="/emergencia"
        className={({ isActive }) => `nav-item nav-emergency ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">🚨</span>
        <span>Urgencias</span>
      </NavLink>
    </nav>
  );
}
