import React, { useState } from 'react';
import { usePet } from '../../context/PetContext';
import { sugerenciasPorEspecie, especieEmojis } from '../../data/mockData';
import '../../styles/onboarding.css';

export default function OnboardingWizard({ onClose }) {
  const { addPet } = usePet();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [especie, setEspecie] = useState('perro');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('macho');
  const [foto, setFoto] = useState('');
  const [selectedTareas, setSelectedTareas] = useState([]);

  const availableSpecies = [
    { key: 'perro', label: 'Perro', emoji: '🐕' },
    { key: 'gato', label: 'Gato', emoji: '🐈' },
    { key: 'ave', label: 'Ave', emoji: '🐦' },
    { key: 'conejo', label: 'Conejo', emoji: '🐇' },
    { key: 'hamster', label: 'Hámster', emoji: '🐹' },
    { key: 'exotico', label: 'Otro/Exótico', emoji: '🦎' },
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTareaSelection = (t) => {
    if (selectedTareas.some((item) => item.tarea === t.tarea)) {
      setSelectedTareas(selectedTareas.filter((item) => item.tarea !== t.tarea));
    } else {
      setSelectedTareas([...selectedTareas, { ...t, completada: false, id: Date.now().toString() + Math.random().toString(36).substring(2, 5) }]);
    }
  };

  const handleFinish = async () => {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    try {
      const petPayload = {
        nombre: nombre.trim(),
        especie,
        raza: raza.trim(),
        edad: edad.trim(),
        peso: Number(peso) || 0,
        sexo,
        avatar_url: foto,
        foto: foto,
        tareas: selectedTareas,
      };
      await addPet(petPayload);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error al registrar mascota:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSuggestions = sugerenciasPorEspecie[especie] || sugerenciasPorEspecie['perro'];

  return (
    <div className="onboarding-page" style={{ position: 'relative' }}>
      {/* Botón explícito para cancelar/cerrar y evitar trampas de navegación */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          fontSize: '1.4rem',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          padding: '8px',
          zIndex: 10,
        }}
        aria-label="Cerrar registro"
      >
        ✕
      </button>

      {/* Indicador de progreso */}
      <div className="onboarding-progress">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`progress-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
          />
        ))}
      </div>
      <div className="onboarding-step-label">Paso {step} de 4</div>

      {/* Paso 1: Especie */}
      {step === 1 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">🐾</span>
            <h2 className="step-title">¿Qué mascota deseas registrar?</h2>
            <p className="step-hint">Selecciona la especie de tu compañero</p>
          </div>

          <div className="selection-grid cols-2 species-grid">
            {availableSpecies.map((sp) => (
              <button
                type="button"
                key={sp.key}
                className={`selection-card species-card ${especie === sp.key ? 'selected' : ''}`}
                onClick={() => setEspecie(sp.key)}
              >
                <span className="species-emoji-lg">{sp.emoji}</span>
                <span className="selection-label">{sp.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: Información básica */}
      {step === 2 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">{especieEmojis[especie] || '🐾'}</span>
            <h2 className="step-title">Cuéntanos sobre tu mascota</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Nombre de tu mascota *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Luna, Max, Firulais"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">Raza (Opcional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Golden Retriever, Mestizo"
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Edad aprox.</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. 2 años"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="Ej. 12.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Sexo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`selection-card ${sexo === 'macho' ? 'selected' : ''}`}
                  onClick={() => setSexo('macho')}
                >
                  <span className="selection-emoji">♂️</span>
                  <span className="selection-label">Macho</span>
                </button>
                <button
                  type="button"
                  className={`selection-card ${sexo === 'hembra' ? 'selected' : ''}`}
                  onClick={() => setSexo('hembra')}
                >
                  <span className="selection-emoji">♀️</span>
                  <span className="selection-label">Hembra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Foto */}
      {step === 3 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">📸</span>
            <h2 className="step-title">Agrega una foto de {nombre || 'tu mascota'}</h2>
            <p className="step-hint">Se mostrará en su perfil y en caso de emergencia</p>
          </div>

          <label className={`photo-upload-area ${foto ? 'has-photo' : ''}`}>
            {foto ? (
              <img src={foto} alt="Vista previa" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <span className="photo-icon">📷</span>
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
            <button
              type="button"
              className="btn-change-photo"
              onClick={() => setFoto('')}
            >
              Eliminar foto
            </button>
          )}
        </div>
      )}

      {/* Paso 4: Tareas sugeridas */}
      {step === 4 && (
        <div className="onboarding-step">
          <div className="step-header">
            <span className="step-emoji">✨</span>
            <h2 className="step-title">Rutinas recomendadas</h2>
            <p className="step-hint">Elige las tareas diarias iniciales para {nombre}</p>
          </div>

          <div className="suggestions-list">
            {currentSuggestions.map((sug, idx) => {
              const isSelected = selectedTareas.some((item) => item.tarea === sug.tarea);
              return (
                <button
                  type="button"
                  key={idx}
                  className={`suggestion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTareaSelection(sug)}
                >
                  <span className="suggestion-icon">{sug.icono}</span>
                  <span className="suggestion-label">{sug.tarea}</span>
                  <span className="suggestion-check">{isSelected ? '✅' : '⚪'}</span>
                </button>
              );
            })}
          </div>
          <p className="suggestions-count">
            {selectedTareas.length} rutina(s) seleccionada(s)
          </p>
        </div>
      )}

      {/* Botones de navegación inferiores */}
      <div className="onboarding-actions">
        {step > 1 ? (
          <button
            type="button"
            className="btn-back"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Volver
          </button>
        ) : (
          <button
            type="button"
            className="btn-back"
            onClick={onClose}
          >
            Cancelar
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            className="btn-next"
            disabled={step === 2 && !nombre.trim()}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuar →
          </button>
        ) : (
          <button
            type="button"
            className="btn-finish"
            disabled={isSubmitting}
            onClick={handleFinish}
          >
            {isSubmitting ? 'Guardando…' : 'Finalizar y Crear 🐾'}
          </button>
        )}
      </div>
    </div>
  );
}
