import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import {
  ArrowLeft,
  Clock,
  Phone,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TriangleAlert,
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { CRYPTO_SECRET } from '../lib/cryptoSecret';
import { accesoValido } from '../lib/accesos';
import { getEspecieIcono } from '../lib/especies';
import { getTalla } from '../lib/pets';
import { normalizarAlergia } from '../lib/medico';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import WeightChart from '../components/medical/WeightChart';
import '../styles/global.css';

const decryptData = (ciphertext) => {
  if (!ciphertext) return {};
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_SECRET);
    const texto = bytes.toString(CryptoJS.enc.Utf8);
    if (!texto) return null;
    return JSON.parse(texto);
  } catch (e) {
    console.error('No se pudo descifrar el expediente público:', e);
    return null;
  }
};

export default function PublicEmergencyProfile() {
  const { petId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [errorCifrado, setErrorCifrado] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (petDoc.exists()) {
          const raw = petDoc.data();
          const medicoData = raw.medico
            ? typeof raw.medico === 'string'
              ? decryptData(raw.medico)
              : raw.medico
            : {};
          setErrorCifrado(Boolean(raw.medico) && medicoData === null);
          setPet({ id: petDoc.id, ...raw, medico: medicoData || {} });
          setAutorizado(accesoValido(raw.accesos, token, 'emergencia'));
        }
      } catch (err) {
        console.error('Error al obtener perfil público de emergencia:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId, token]);

  if (loading) return <LoadingSpinner message="Cargando ficha médica de emergencia..." />;

  if (!pet || !autorizado) {
    return (
      <main className="page not-found">
        <Clock size={48} className="not-found-icon" />
        <h1>Enlace no válido o expirado</h1>
        <p>
          Esta ficha de emergencia solo se abre con un enlace vigente generado por el dueño. Pide
          un nuevo código QR o solicita el acceso directamente.
        </p>
        <Link to="/login" className="btn btn-primary">
          <ArrowLeft size={16} /> Ir a VitalMascota
        </Link>
      </main>
    );
  }

  const { medico = {} } = pet;
  const Icono = getEspecieIcono(pet.especie);
  const talla = getTalla(pet.talla);

  return (
    <main className="page">
      <div className="emergency-banner">
        <ShieldAlert size={18} /> Ficha médica de emergencia • Acceso de solo lectura
      </div>

      {errorCifrado && (
        <p className="form-error">
          El expediente médico está cifrado y no se pudo leer en este dispositivo. Muestra esta
          pantalla al veterinario y contacta al dueño para confirmar alergias y tratamientos.
        </p>
      )}

      <div className="card pet-status-card">
        <div className="pet-status-header">
          {pet.avatar_url || pet.foto ? (
            <img src={pet.avatar_url || pet.foto} alt={pet.nombre} className="pet-avatar" />
          ) : (
            <div className="pet-avatar pet-avatar-icon">
              <Icono size={34} />
            </div>
          )}
          <div className="pet-status-info">
            <h1 className="pet-name">{pet.nombre}</h1>
            <p className="pet-detail">
              {pet.raza || pet.especie} • {pet.sexo || 'Sin dato'} • {pet.edad || 'Edad N/A'}
            </p>
            <div className="pet-badges">
              <span className="talla-badge">{talla.label}</span>
              {pet.peso ? <span className="talla-badge">{pet.peso} kg</span> : null}
              {pet.microchip ? (
                <span className="talla-badge">Chip {pet.microchip}</span>
              ) : null}
            </div>
          </div>
        </div>
        {pet.etiquetas?.length > 0 && (
          <p className="emergency-tags">{pet.etiquetas.join(' • ')}</p>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">
          <Stethoscope size={18} /> Contactos de cabecera
        </h3>
        {medico.veterinario && <p><strong>Veterinario:</strong> {medico.veterinario}</p>}
        {medico.clinica && <p><strong>Clínica:</strong> {medico.clinica}</p>}
        {medico.telefono && (
          <p>
            <strong>Teléfono:</strong>{' '}
            <a href={`tel:${medico.telefono}`} className="link-phone">
              <Phone size={14} /> {medico.telefono}
            </a>
          </p>
        )}
        {medico.proximaCita && (
          <p><strong>Próxima cita:</strong> {medico.proximaCita}</p>
        )}
      </div>

      {medico.alergias?.length > 0 && (
        <div className="card alert-card">
          <h3 className="card-title">
            <TriangleAlert size={18} /> Alergias y restricciones
          </h3>
          <ul className="allergy-list">
            {medico.alergias.map((raw, i) => {
              const alergia = normalizarAlergia(raw);
              return (
                <li key={i} className="allergy-item">
                  <span className="allergy-tag">
                    <TriangleAlert size={13} /> {alergia.nombre}
                  </span>
                  {alergia.descripcion && (
                    <span className="medical-desc">{alergia.descripcion}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {medico.vacunas?.length > 0 && (
        <div className="card">
          <h3 className="card-title">
            <Syringe size={18} /> Vacunas
          </h3>
          <ul className="vaccine-list">
            {medico.vacunas.map((v, i) => (
              <li key={i} className="vaccine-item">
                <div className="medical-info">
                  <span className="vaccine-name">{v.nombre}</span>
                  {v.fecha && <span className="vaccine-date">{v.fecha}</span>}
                  {v.descripcion && <span className="medical-desc">{v.descripcion}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {medico.cirugias?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Cirugías y procedimientos previos</h3>
          <ul className="allergy-list">
            {medico.cirugias.map((c, i) => (
              <li key={i} className="allergy-item">
                <strong>
                  {c.nombre}
                  {c.fecha ? ` (${c.fecha})` : ''}
                </strong>
                {c.descripcion && <span className="medical-desc">{c.descripcion}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <WeightChart historial={medico.historialPeso || []} tallaKey={pet.talla} />

      <div className="public-footer">
        <p>Datos cifrados y compartidos de forma segura por VitalMascota.</p>
        <Link to="/login" className="btn btn-ghost">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    </main>
  );
}
