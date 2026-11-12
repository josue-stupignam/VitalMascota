import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import WeightChart from '../components/medical/WeightChart';
import AllergyList from '../components/medical/AllergyList';
import VaccineList from '../components/medical/VaccineList';
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

export default function PublicEmergencyProfile() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (petDoc.exists()) {
          const raw = petDoc.data();
          const medicoData = raw.medico ? (typeof raw.medico === 'string' ? decryptData(raw.medico) : raw.medico) : {};
          setPet({ id: petDoc.id, ...raw, medico: medicoData });
        }
      } catch (err) {
        console.error('Error al obtener perfil público de emergencia:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  if (loading) return <LoadingSpinner message="Cargando ficha médica de emergencia..." />;

  if (!pet) {
    return (
      <main className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <span style={{ fontSize: '3rem' }}>🚨</span>
        <h2>Ficha Médica no encontrada</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          El expediente solicitado no existe o fue retirado.
        </p>
        <Link to="/login" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--color-primary)' }}>
          Ir a VitalMascota
        </Link>
      </main>
    );
  }

  const { medico = {} } = pet;

  return (
    <main className="page">
      <div
        style={{
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          padding: '12px 16px',
          borderRadius: '12px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '0.95rem',
        }}
      >
        🚨 Ficha Médica de Emergencia • Acceso Rápido Rescatista / Veterinario
      </div>

      <div className="card pet-status-card">
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
            <h1 className="pet-name" style={{ fontSize: '1.6rem' }}>{pet.nombre}</h1>
            <p className="pet-detail">
              {pet.raza || pet.especie} • {pet.sexo || ''} • {pet.edad || ''}
            </p>
            {pet.microchip && (
              <span className="status-badge" style={{ background: '#fff', color: '#1a1a2e' }}>
                Chip: {pet.microchip}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contactos de Urgencia */}
      <div className="card vet-card">
        <h3 className="card-title">📞 Contactos Directos de Cabecera</h3>
        {medico.veterinario && <p><strong>🩺 Veterinario:</strong> {medico.veterinario}</p>}
        {medico.clinica && <p><strong>🏥 Clínica habitual:</strong> {medico.clinica}</p>}
        {medico.telefono && (
          <p>
            <strong>Teléfono clínica:</strong>{' '}
            <a href={`tel:${medico.telefono}`} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
              {medico.telefono}
            </a>
          </p>
        )}
      </div>

      {/* Alergias críticas */}
      <AllergyList alergias={medico.alergias || []} />

      {/* Vacunas */}
      <VaccineList vacunas={medico.vacunas || []} />

      {/* Cirugías si existen */}
      {medico.cirugias && medico.cirugias.length > 0 && (
        <div className="card">
          <h3 className="card-title">✂️ Cirugías y Procedimientos Previos</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {medico.cirugias.map((c, i) => (
              <li key={i} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                <strong>{c.nombre}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>({c.fecha})</span>
                {c.descripcion && <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '2px' }}>{c.descripcion}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Peso */}
      <WeightChart historial={medico.historialPeso || []} />

      <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '30px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Datos provistos de forma segura y cifrada por <strong>VitalMascota</strong>
        </p>
      </div>
    </main>
  );
}
