import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Clock, Eye, Phone, Stethoscope, Utensils } from 'lucide-react';
import { db } from '../firebaseConfig';
import { getEspecieIcono } from '../lib/especies';
import { getTalla } from '../lib/pets';
import { iconoTarea } from '../lib/tareaIconos';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/global.css';

function horasRestantesISO(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.ceil(ms / (60 * 60 * 1000));
}

export default function SitterView() {
  const { token } = useParams();
  const [enlace, setEnlace] = useState(null);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!token) {
        setEstado('invalido');
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, 'sitterLinks', token));
        if (!activo) return;

        if (!snapshot.exists()) {
          setEstado('invalido');
          return;
        }

        const datos = snapshot.data();
        if (!datos.expiresAt || new Date(datos.expiresAt).getTime() <= Date.now()) {
          setEnlace(datos);
          setEstado('expirado');
          return;
        }

        setEnlace(datos);
        setEstado('ok');
      } catch (err) {
        console.error('Error cargando el enlace de cuidador:', err);
        if (activo) setEstado('invalido');
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [token]);

  if (estado === 'cargando') return <LoadingSpinner message="Cargando perfil para cuidador..." />;

  if (estado !== 'ok') {
    return (
      <main className="page not-found">
        <Clock size={48} className="not-found-icon" />
        <h1>{estado === 'expirado' ? 'Enlace expirado' : 'Enlace no válido'}</h1>
        <p>
          Este acceso temporal de cuidador {estado === 'expirado' ? 'caducó' : 'no existe o fue revocado'}.
          Solicita al dueño un nuevo enlace de 48 horas.
        </p>
        <Link to="/login" className="btn btn-primary">
          <ArrowLeft size={16} /> Volver
        </Link>
      </main>
    );
  }

  const tareas = enlace.tareas || [];
  const contacto = enlace.contacto || {};
  const Icono = getEspecieIcono(enlace.especie);
  const talla = getTalla(enlace.talla);
  const porcion = enlace.racion;
  const tareasComida = tareas.filter((t) =>
    /comer|aliment|comida|agua|porcion|porción/i.test(t.tarea || '')
  );
  const otrasTareas = tareas.filter((t) => !tareasComida.includes(t));
  const foto = enlace.petFoto;

  return (
    <main className="page">
      <div className="sitter-banner">
        <Eye size={16} /> Modo cuidador · solo lectura ·{' '}
        {horasRestantesISO(enlace.expiresAt)} h restantes
      </div>

      <div className="card pet-status-card">
        <div className="pet-status-header">
          {foto ? (
            <img src={foto} alt={enlace.petNombre} className="pet-avatar" />
          ) : (
            <div className="pet-avatar pet-avatar-icon">
              <Icono size={34} />
            </div>
          )}
          <div className="pet-status-info">
            <h2 className="pet-name">{enlace.petNombre}</h2>
            <p className="pet-detail">
              {enlace.raza || enlace.especie} • {enlace.edad || 'Edad no registrada'}
            </p>
            <div className="pet-badges">
              <span className="talla-badge">{talla.label}</span>
              <span className="talla-badge">A cargo del cuidador</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">
          <Utensils size={18} /> Alimentación
        </h3>
        <div className="feeding-summary">
          <span className="feeding-portion">{porcion} g</span>
          <span className="feeding-label">
            {enlace.racionNota || `ración diaria recomendada para talla ${talla.label}`}
          </span>
        </div>
        {tareasComida.length > 0 ? (
          <ul className="task-list">
            {tareasComida.map((t, idx) => {
              const TareaIcono = iconoTarea(t.tarea);
              return (
                <li key={t.id || idx} className="task-card">
                  <span className="task-icon">
                    <TareaIcono size={17} />
                  </span>
                  <span className="task-name">{t.tarea}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-state">El dueño no definió rutinas de comida específicas.</p>
        )}
      </div>

      {otrasTareas.length > 0 && (
        <div className="card">
          <h3 className="card-title">Rutinas asignadas</h3>
          <ul className="task-list">
            {otrasTareas.map((t, idx) => {
              const TareaIcono = iconoTarea(t.tarea);
              return (
                <li key={t.id || idx} className="task-card">
                  <span className="task-icon">
                    <TareaIcono size={17} />
                  </span>
                  <span className="task-name">{t.tarea}</span>
                  {t.asignadoA && <span className="task-assignee">{t.asignadoA}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">
          <Stethoscope size={18} /> Teléfonos de emergencia
        </h3>
        {contacto.veterinario && (
          <p>
            <strong>Veterinario:</strong> {contacto.veterinario}
          </p>
        )}
        {contacto.clinica && (
          <p>
            <strong>Clínica:</strong> {contacto.clinica}
          </p>
        )}
        {contacto.telefono ? (
          <p>
            <strong>Veterinaria:</strong>{' '}
            <a href={`tel:${contacto.telefono}`} className="link-phone">
              <Phone size={14} /> {contacto.telefono}
            </a>
          </p>
        ) : null}
        {contacto.telefonoDueno ? (
          <p>
            <strong>Dueño:</strong>{' '}
            <a href={`tel:${contacto.telefonoDueno}`} className="link-phone">
              <Phone size={14} /> {contacto.telefonoDueno}
            </a>
          </p>
        ) : null}
        {!contacto.telefono && !contacto.telefonoDueno && (
          <p className="empty-state">
            El dueño aún no registró un teléfono de emergencia para este enlace.
          </p>
        )}
      </div>
    </main>
  );
}
