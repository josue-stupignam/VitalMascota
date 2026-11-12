import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CryptoJS from 'crypto-js';
import '../styles/global.css';

const SECRET_KEY = 'vitalmascota_secure_vault_2026';

const decryptData = (ciphertext) => {
  if (!ciphertext) return {};
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return {};
  }
};

export default function SitterView() {
  const { petId } = useParams();
  const [searchParams] = useSearchParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const exp = searchParams.get('exp');

  useEffect(() => {
    // Validar expiración (48h)
    if (exp && Number(exp) < Date.now()) {
      setIsExpired(true);
      setLoading(false);
      return;
    }

    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (petDoc.exists()) {
          const raw = petDoc.data();
          const medicoData = raw.medico ? (typeof raw.medico === 'string' ? decryptData(raw.medico) : raw.medico) : {};
          setPet({ id: petDoc.id, ...raw, medico: medicoData });
        }
      } catch (err) {
        console.error('Error cargando información para el cuidador:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId, exp]);

  if (loading) return <LoadingSpinner message="Cargando perfil para cuidador..." />;

  if (isExpired) {
    return (
      <main className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <span style={{ fontSize: '3rem' }}>⏳</span>
        <h2>Enlace Expirado</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Este enlace temporal para cuidador ha caducado por motivos de seguridad (límite 48 horas). Solicita un nuevo enlace al dueño.
        </p>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <span style={{ fontSize: '3rem' }}>🐾</span>
        <h2>Mascota no encontrada</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          El registro solicitado no existe o el enlace es incorrecto.
        </p>
      </main>
    );
  }

  const { inventario = [], tareas = [], medico = {} } = pet;

  return (
    <main className="page">
      <div
        style={{
          background: 'var(--color-warning-bg)',
          color: '#8a6d00',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>👁️</span> Modo Cuidador (Sólo Lectura • Acceso Temporal 48h)
      </div>

      <div className="card pet-status-card" style={{ marginBottom: '16px' }}>
        <div className="pet-status-header">
          {pet.avatar_url || pet.foto ? (
            <img src={pet.avatar_url || pet.foto} alt={pet.nombre} className="pet-avatar" />
          ) : (
            <div
              className="pet-avatar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
              }}
            >
              🐾
            </div>
          )}
          <div>
            <h2 className="pet-name">{pet.nombre}</h2>
            <p className="pet-detail">{pet.raza || pet.especie} • {pet.edad || ''}</p>
            <span className="status-badge" style={{ background: 'rgba(255,255,255,0.25)' }}>
              A cargo del cuidador
            </span>
          </div>
        </div>
      </div>

      {/* Rutinas diarias */}
      <div className="card">
        <h3 className="card-title">📋 Rutinas para el Cuidador</h3>
        {tareas.length === 0 ? (
          <p className="empty-state">No hay tareas o rutinas específicas asignadas.</p>
        ) : (
          <ul className="task-list">
            {tareas.map((t, idx) => (
              <li key={idx} className="task-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{t.icono || '🐾'}</span>
                <div>
                  <span className="task-name">{t.tarea}</span>
                  <span style={{ fontSize: '0.75rem', color: t.completada ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                    {t.completada ? '✓ Marcada como completada hoy' : 'Pendiente de realizar'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Insumos y Porciones */}
      <div className="card">
        <h3 className="card-title">🍖 Porciones e Insumos</h3>
        {inventario.length === 0 ? (
          <p className="empty-state">No hay especificaciones de insumos registradas.</p>
        ) : (
          <ul className="inventory-list">
            {inventario.map((item, idx) => (
              <li key={idx} className="inventory-item">
                <div>
                  <strong className="inventory-name">{item.nombre}</strong>
                  <span className="inventory-qty">
                    Porción / consumo: {item.consumoDiario} {item.unidad}/día
                  </span>
                </div>
                <span className="days-left days-ok">
                  {item.diasRestantes} días disponibles
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contactos de emergencia para el cuidador */}
      <div className="card vet-card">
        <h3 className="card-title">🚨 Contactos de Emergencia</h3>
        {medico.veterinario && <p><strong>🩺 Veterinario:</strong> {medico.veterinario}</p>}
        {medico.clinica && <p><strong>🏥 Clínica:</strong> {medico.clinica}</p>}
        {medico.telefono && (
          <p>
            <strong>📞 Teléfono:</strong>{' '}
            <a href={`tel:${medico.telefono}`} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
              {medico.telefono}
            </a>
          </p>
        )}
        <div style={{ marginTop: '12px' }}>
          <Link
            to={`/emergencia/${pet.id}`}
            className="btn btn-emergency-transfer"
            style={{ textDecoration: 'none', padding: '12px' }}
          >
            Ver Ficha Médica de Urgencia
          </Link>
        </div>
      </div>
    </main>
  );
}
