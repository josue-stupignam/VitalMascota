import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Circle,
  PawPrint,
  Sparkles,
  X,
} from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { sugerenciasPorEspecie } from '../../data/mockData';
import { TALLAS, tallaDesdePeso } from '../../lib/pets';
import { getEspecieIcono } from '../../lib/especies';
import { iconoTarea } from '../../lib/tareaIconos';
import '../../styles/onboarding.css';

const ESPECIES = [
  { key: 'perro', label: 'Perro' },
  { key: 'gato', label: 'Gato' },
  { key: 'ave', label: 'Ave' },
  { key: 'conejo', label: 'Conejo' },
  { key: 'hamster', label: 'Hámster' },
  { key: 'exotico', label: 'Otro/Exótico' },
];

export default function OnboardingWizard({ onClose }) {
  const { addPet } = usePet();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [especie, setEspecie] = useState('perro');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('macho');
  const [foto, setFoto] = useState('');
  const [selectedTareas, setSelectedTareas] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const EspecieIcono = getEspecieIcono(especie);
  const talla = tallaDesdePeso(peso);

  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onClose]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imagen = new Image();
      imagen.onload = () => {
        const maximo = 640;
        const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(imagen.width * escala);
        canvas.height = Math.round(imagen.height * escala);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
        setFoto(canvas.toDataURL('image/jpeg', 0.75));
      };
      imagen.onerror = () => setFoto(reader.result);
      imagen.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const toggleTareaSelection = (t) => {
    if (selectedTareas.some((item) => item.tarea === t.tarea)) {
      setSelectedTareas(selectedTareas.filter((item) => item.tarea !== t.tarea));
    } else {
      setSelectedTareas([
        ...selectedTareas,
        {
          ...t,
          completada: false,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        },
      ]);
    }
  };

  const handleFinish = async () => {
    if (!nombre.trim() || !talla) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await addPet({
        nombre: nombre.trim(),
        especie,
        raza: raza.trim(),
        edad: edad.trim(),
        peso: Number(peso) || 0,
        talla,
        sexo,
        avatar_url: foto,
        foto,
        tareas: selectedTareas,
      });
      if (onClose) onClose();
    } catch (err) {
      console.error('Error al registrar mascota:', err);
      setErrorMsg(err?.message || 'No se pudo registrar la mascota. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSuggestions = sugerenciasPorEspecie[especie] || sugerenciasPorEspecie.perro;
  const datosCompletos = nombre.trim().length > 0 && Boolean(talla);

  return (
    <div className="onboarding-page">
      <button
        type="button"
        className="onboarding-close"
        onClick={onClose}
        aria-label="Cerrar registro"
      >
        <X size={22} />
      </button>

      <div className="onboarding-progress">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`progress-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
          />
        ))}
      </div>
      <div className="onboarding-step-label">Paso {step} de 4</div>

      {step === 1 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">
              <PawPrint size={30} />
            </span>
            <h2 className="step-title">¿Qué mascota deseas registrar?</h2>
            <p className="step-hint">Selecciona la especie de tu compañero</p>
          </div>

          <div className="selection-grid cols-2 species-grid">
            {ESPECIES.map((sp) => {
              const Icono = getEspecieIcono(sp.key);
              return (
                <button
                  type="button"
                  key={sp.key}
                  className={`selection-card species-card ${especie === sp.key ? 'selected' : ''}`}
                  onClick={() => setEspecie(sp.key)}
                >
                  <span className="species-emoji-lg">
                    <Icono size={34} />
                  </span>
                  <span className="selection-label">{sp.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">
              <EspecieIcono size={30} />
            </span>
            <h2 className="step-title">Cuéntanos sobre tu mascota</h2>
          </div>

          <div className="form-stack">
            <div className="input-group">
              <label className="input-label" htmlFor="pet-nombre">
                Nombre de tu mascota *
              </label>
              <input
                id="pet-nombre"
                type="text"
                className="input-field"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="pet-raza">
                Raza (Opcional)
              </label>
              <input
                id="pet-raza"
                type="text"
                className="input-field"
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label" htmlFor="pet-edad">
                  Edad aprox.
                </label>
                <input
                  id="pet-edad"
                  type="text"
                  className="input-field"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="pet-peso">
                  Peso (kg) *
                </label>
                <input
                  id="pet-peso"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  required
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <span className="input-label">Talla de tu mascota</span>
              <p className="step-hint talla-hint">
                Se calcula automáticamente a partir del peso y define su ración diaria
              </p>
              {talla ? (
                <div className="talla-auto">
                  <span className="talla-auto-label">Talla asignada</span>
                  <strong className="talla-auto-value">{TALLAS[talla].label}</strong>
                  <span className="talla-auto-meta">
                    {TALLAS[talla].rango} · {TALLAS[talla].porcionDiaria} g al día
                  </span>
                </div>
              ) : (
                <p className="talla-error">
                  Escribe el peso de tu mascota para calcular su talla
                </p>
              )}
            </div>

            <div className="input-group">
              <span className="input-label">Sexo</span>
              <div className="form-row">
                <button
                  type="button"
                  className={`selection-card ${sexo === 'macho' ? 'selected' : ''}`}
                  onClick={() => setSexo('macho')}
                >
                  <span className="selection-label">Macho</span>
                </button>
                <button
                  type="button"
                  className={`selection-card ${sexo === 'hembra' ? 'selected' : ''}`}
                  onClick={() => setSexo('hembra')}
                >
                  <span className="selection-label">Hembra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">
              <Camera size={30} />
            </span>
            <h2 className="step-title">Agrega una foto de {nombre || 'tu mascota'}</h2>
            <p className="step-hint">Se mostrará en su perfil y en caso de emergencia</p>
          </div>

          <label className={`photo-upload-area ${foto ? 'has-photo' : ''}`}>
            {foto ? (
              <img src={foto} alt="Vista previa" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <span className="photo-icon">
                  <Camera size={30} />
                </span>
                <span className="photo-text">Toca para subir una foto</span>
                <span className="photo-subtext">JPG, PNG o WEBP</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="photo-input-hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          {foto && (
            <button type="button" className="btn-change-photo" onClick={() => setFoto('')}>
              Eliminar foto
            </button>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">
              <Sparkles size={30} />
            </span>
            <h2 className="step-title">Rutinas recomendadas</h2>
            <p className="step-hint">Elige las tareas diarias iniciales para {nombre}</p>
          </div>

          <div className="suggestions-list">
            {currentSuggestions.map((sug, idx) => {
              const isSelected = selectedTareas.some((item) => item.tarea === sug.tarea);
              const Icono = iconoTarea(sug.tarea);
              return (
                <button
                  type="button"
                  key={idx}
                  className={`suggestion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTareaSelection(sug)}
                >
                  <span className="suggestion-icon">
                    <Icono size={20} />
                  </span>
                  <span className="suggestion-label">{sug.tarea}</span>
                  <span className="suggestion-check">
                    {isSelected ? <Check size={18} /> : <Circle size={18} />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="suggestions-count">
            {selectedTareas.length} rutina(s) seleccionada(s)
          </p>
        </div>
      )}

      <div className="onboarding-actions">
        {step > 1 ? (
          <button type="button" className="btn-back" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={18} /> Volver
          </button>
        ) : (
          <button type="button" className="btn-back" onClick={onClose}>
            Cancelar
          </button>
        )}

        {errorMsg && <p className="form-error">{errorMsg}</p>}

        {step < 4 ? (
          <button
            type="button"
            className="btn-next"
            disabled={step === 2 && !datosCompletos}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuar <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="btn-finish"
            disabled={isSubmitting}
            onClick={handleFinish}
          >
            {isSubmitting ? 'Guardando…' : 'Finalizar registro'}
          </button>
        )}
      </div>
    </div>
  );
}
