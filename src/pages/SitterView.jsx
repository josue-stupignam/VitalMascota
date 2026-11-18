import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import {
  ArrowLeft,
  Clock,
  Eye,
  Phone,
  Stethoscope,
  Utensils,
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { CRYPTO_SECRET } from '../lib/cryptoSecret';
import { accesoValido, horasRestantes } from '../lib/accesos';
import { getEspecieIcono } from '../lib/especies';
import { getPorcionDiaria, getTalla } from '../lib/pets';
import { iconoTarea } from '../lib/tareaIconos';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/global.css';

const decryptData = (ciphertext) => {
  if (!ciphertext) return {};
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return {};
  }
};

export default function SitterView() {
  const { petId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [pet, setPet] = useState(null);
  const [acceso, setAcceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (petDoc.exists()) {
          const raw = petDoc.data();
          const medicoData = raw.medico
            ? typeof raw.medico === 'string'
              ? decryptData(raw.medico)
              : raw.medico
            : {};
          setPet({ id: petDoc.id, ...raw, medico: medicoData });
          if (accesoValido(raw.accesos, token, 'cuidador')) {
            setAcceso((raw.accesos || []).find((a) => a.token === token));
          }
        }
      } catch (err) {
        console.error('Error cargando información para el cuidador:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petId, token]);

  if (loading) return <LoadingSpinner message="Cargando perfil para cuidador..." />;

  if (!pet || !acceso) {
    return (
      <main className="page not-found">
        <Clock size={48} className="not-found-icon" />
        <h1>Enlace expirado o revocado</h1>
        <p>
          Este acceso temporal de cuidador caducó o fue revocado por el dueño. Solicita un nuevo
          enlace de 48 horas.
        </p>
        <Link to="/login" className="btn btn-primary">
          <ArrowLeft size={16} /> Volver
        </Link>
      </main>
    );
  }

  const { medico = {}, tareas = [] } = pet;
  const Icono = getEspecieIcono(pet.especie);
  const talla = getTalla(pet.talla);
  const porcion = getPorcionDiaria(pet.talla);
  const tareasComida = tareas.filter((t) =>
    /comer|aliment|comida|agua|porcion|porción/i.test(t.tarea || '')
  );
  const otrasTareas = tareas.filter((t) => !tareasComida.includes(t));

  return (
    <main className="page">
      <div className="sitter-banner">
        <Eye size={16} /> Modo cuidador · solo lectura · {horasRestantes(acceso.expira)} h restantes
      </div>

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
            <h2 className="pet-name">{pet.nombre}</h2>
            <p className="pet-detail">
              {pet.raza || pet.especie} • {pet.edad || 'Edad N/A'}
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
          <span className="feeding-label">ración diaria recomendada para talla {talla.label}</span>
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
                  <span className={`task-state ${t.completada ? 'done' : ''}`}>
                    {t.completada ? 'Completada' : 'Pendiente'}
                  </span>
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
        {medico.veterinario && <p><strong>Veterinario:</strong> {medico.veterinario}</p>}
        {medico.clinica && <p><strong>Clínica:</strong> {medico.clinica}</p>}
        {medico.telefono ? (
          <p>
            <strong>Teléfono:</strong>{' '}
            <a href={`tel:${medico.telefono}`} className="link-phone">
              <Phone size={14} /> {medico.telefono}
            </a>
          </p>
        ) : (
          <p className="empty-state">Sin teléfono de emergencia registrado.</p>
        )}
      </div>
    </main>
  );
}
