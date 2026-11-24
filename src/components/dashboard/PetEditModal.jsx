import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from '../ui/Modal';
import { usePet } from '../../context/PetContext';
import { TALLAS, tallaDesdePeso } from '../../lib/pets';
import { vibrateSuccess } from '../../lib/haptics';

export default function PetEditModal({ isOpen, onClose }) {
  const { activePet, updatePet } = usePet();
  const [form, setForm] = useState({
    nombre: '',
    raza: '',
    edad: '',
    peso: '',
    sexo: 'macho',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen || !activePet) return;
    setForm({
      nombre: activePet.nombre || '',
      raza: activePet.raza || '',
      edad: activePet.edad || '',
      peso: activePet.peso ? String(activePet.peso) : '',
      sexo: activePet.sexo || 'macho',
    });
    setErrorMsg('');
  }, [isOpen, activePet]);

  const talla = tallaDesdePeso(form.peso);

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }
    if (!talla) {
      setErrorMsg('Ingresa un peso mayor a 0 kg para calcular la talla.');
      return;
    }

    setGuardando(true);
    try {
      await updatePet({
        nombre: form.nombre.trim(),
        raza: form.raza.trim(),
        edad: form.edad.trim(),
        peso: Number(form.peso),
        talla,
        sexo: form.sexo,
      });
      vibrateSuccess();
      onClose();
    } catch (error) {
      setErrorMsg(error?.message || 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar mascota">
      <form className="medical-form" onSubmit={guardar}>
        <div className="input-group">
          <label className="input-label" htmlFor="edit-pet-nombre">
            Nombre *
          </label>
          <input
            id="edit-pet-nombre"
            type="text"
            className="input-field"
            value={form.nombre}
            onChange={set('nombre')}
            required
          />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label" htmlFor="edit-pet-raza">
              Raza
            </label>
            <input
              id="edit-pet-raza"
              type="text"
              className="input-field"
              value={form.raza}
              onChange={set('raza')}
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="edit-pet-edad">
              Edad
            </label>
            <input
              id="edit-pet-edad"
              type="text"
              className="input-field"
              value={form.edad}
              onChange={set('edad')}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label" htmlFor="edit-pet-peso">
              Peso (kg) *
            </label>
            <input
              id="edit-pet-peso"
              type="number"
              step="0.1"
              min="0"
              className="input-field"
              value={form.peso}
              onChange={set('peso')}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="edit-pet-sexo">
              Sexo
            </label>
            <select
              id="edit-pet-sexo"
              className="input-field"
              value={form.sexo}
              onChange={set('sexo')}
            >
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>
        </div>

        <div className="talla-auto">
          <span className="talla-auto-label">Talla asignada automáticamente</span>
          {talla ? (
            <>
              <strong className="talla-auto-value">{TALLAS[talla].label}</strong>
              <span className="talla-auto-meta">
                {TALLAS[talla].rango} · {TALLAS[talla].porcionDiaria} g al día
              </span>
            </>
          ) : (
            <span className="talla-auto-meta">Escribe el peso para calcularla</span>
          )}
        </div>

        {errorMsg && <p className="form-error">{errorMsg}</p>}

        <button type="submit" className="btn-submit-medical" disabled={guardando}>
          <Pencil size={16} /> {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  );
}
