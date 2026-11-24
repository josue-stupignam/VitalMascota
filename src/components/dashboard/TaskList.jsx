import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { CheckSquare, Plus, Trash2, UserRound } from 'lucide-react';
import { db } from '../../firebaseConfig';
import { usePet } from '../../context/PetContext';
import { useUser } from '../../context/UserContext';
import { useFamily } from '../../context/FamilyContext';
import Modal from '../ui/Modal';
import { iconoTarea } from '../../lib/tareaIconos';
import { vibrate, vibrateSuccess } from '../../lib/haptics';
import '../../styles/global.css';

export default function TaskList() {
  const { tareas, toggleTarea, activePet, hoyLocal } = usePet();
  const { members } = useFamily();
  const { profile } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [asignadoA, setAsignadoA] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState('');

  const tareasList = tareas || [];
  const estaCompletada = (tarea) => tarea.lastCompletedDate === hoyLocal;
  const completedCount = tareasList.filter(estaCompletada).length;
  const progressPercent = tareasList.length > 0 ? (completedCount / tareasList.length) * 100 : 0;

  const responsables =
    members.length > 0
      ? members.map((miembro) => ({
          id: miembro.uid,
          nombre: miembro.name || miembro.email || 'Integrante',
        }))
      : profile?.nombre
      ? [{ id: 'yo', nombre: profile.nombre }]
      : [];

  useEffect(() => {
    if (!isModalOpen) {
      setNuevaTarea('');
      setAsignadoA('');
    }
  }, [isModalOpen]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim() || !activePet || guardando) return;

    setGuardando(true);
    const newTask = {
      id: Date.now().toString(),
      tarea: nuevaTarea.trim(),
      completada: false,
      lastCompletedDate: null,
      asignadoA: asignadoA || '',
    };

    try {
      await updateDoc(doc(db, 'pets', activePet.id), { tareas: [...tareasList, newTask] });
      vibrateSuccess();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al agregar tarea:', err);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = (id) => {
    vibrate();
    toggleTarea(id);
  };

  const handleDelete = async (id) => {
    if (!activePet || eliminandoId) return;
    setEliminandoId(id);
    try {
      const restantes = tareasList.filter((t) => t.id !== id);
      await updateDoc(doc(db, 'pets', activePet.id), { tareas: restantes });
      vibrate();
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    } finally {
      setEliminandoId('');
    }
  };

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 className="card-title">
          <CheckSquare size={18} /> Rutinas y cuidados diarios
        </h3>
        <span className="task-counter">
          {completedCount} / {tareasList.length}
        </span>
      </div>

      <div className="task-progress-bar">
        <div className="task-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <p className="field-hint">Las rutinas se reinician automáticamente cada día.</p>

      {tareasList.length === 0 ? (
        <div className="empty-state">
          <p>No hay tareas programadas para hoy.</p>
          <p className="empty-hint">
            Agrega rutinas de alimentación, paseo o medicina y asígnalas a un miembro de la familia.
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {tareasList.map((task) => {
            const Icono = iconoTarea(task.tarea);
            return (
              <li key={task.id} className={`task-card ${estaCompletada(task) ? 'task-done' : ''}`}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={estaCompletada(task)}
                    onChange={() => handleToggle(task.id)}
                  />
                  <span className="task-icon">
                    <Icono size={17} />
                  </span>
                  <span className="task-name">{task.tarea}</span>
                  <span className="task-state">
                    {estaCompletada(task) ? 'Hecho hoy' : 'Por hacer'}
                  </span>
                </label>
                {task.asignadoA && (
                  <span className="task-assignee">
                    <UserRound size={12} /> {task.asignadoA}
                  </span>
                )}
                <button
                  type="button"
                  className="task-delete"
                  onClick={() => handleDelete(task.id)}
                  disabled={eliminandoId === task.id}
                  aria-label={`Eliminar la tarea ${task.tarea}`}
                  title="Eliminar tarea"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button type="button" className="btn-dashed" onClick={() => setIsModalOpen(true)}>
        <Plus size={16} /> Añadir tarea diaria
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva tarea diaria">
        <form onSubmit={handleAddTask} className="form-stack">
          <div className="input-group">
            <label className="input-label" htmlFor="task-desc">
              Descripción de la tarea
            </label>
            <input
              id="task-desc"
              type="text"
              className="input-field"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="task-asignado">
              Asignar a
            </label>
            <select
              id="task-asignado"
              className="input-field"
              value={asignadoA}
              onChange={(e) => setAsignadoA(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {responsables.map((persona) => (
                <option key={persona.id} value={persona.nombre}>
                  {persona.nombre}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Las tareas se sincronizan en tiempo real con los demás dispositivos de la familia.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar tarea'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
