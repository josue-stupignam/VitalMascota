import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, Siren, UserRound } from 'lucide-react';
import '../../styles/navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <Home size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/perfil-medico"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <Stethoscope size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>Médico</span>
      </NavLink>

      <NavLink
        to="/emergencia"
        className={({ isActive }) => `nav-item nav-emergency ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <Siren size={24} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>Urgencias</span>
      </NavLink>

      <NavLink
        to="/perfil"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <UserRound size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}
