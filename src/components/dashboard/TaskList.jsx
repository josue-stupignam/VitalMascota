import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { usePet } from '../../context/PetContext';
import Modal from '../ui/Modal';
import '../../styles/global.css';

export default function TaskList() {
  const { tareas, toggleTarea, activePet, addPet } = usePet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [icono, setIcono] = useState('🐾');

  const tareasList = tareas || [];
  const completedCount = tareasList.filter((t) => t.completada).length;
  const progressPercent = tareasList.length > 0 ? (completedCount / tareasList.length) * 100 : 0;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim() || !activePet) return;

    const newTask = {
      id: Date.now().toString(),
      tarea: nuevaTarea.trim(),
      icono: icono || '🐾',
      completada: false,
    };

    const updatedTasks = [...tareasList, newTask];
    // Persist to active pet in Firestore
    try {
      await updateDoc(doc(db, 'pets', activePet.id), { tareas: updatedTasks });
      setNuevaTarea('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al agregar tarea:', err);
    }
  };

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 className="card-title">✅ Rutinas y Cuidados Diarios</h3>
        <span className="task-counter">
          {completedCount} / {tareasList.length}
        </span>
      </div>

      <div className="task-progress-bar">
        <div className="task-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {tareasList.length === 0 ? (
        <p className="empty-state">No hay tareas programadas para hoy.</p>
      ) : (
        <ul className="task-list">
          {tareasList.map((task) => (
            <li key={task.id} className={`task-card ${task.completada ? 'task-done' : ''}`}>
              <label className="task-label">
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={!!task.completada}
                  onChange={() => toggleTarea(task.id)}
                />
                <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{task.icono || '🐾'}</span>
                <span className="task-name">{task.tarea}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '10px',
          background: 'var(--color-bg)',
          border: '1px dashed var(--color-primary)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-primary)',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        + Añadir Tarea Diaria
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Tarea Diaria">
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Descripción de la tarea</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. Dar pastilla para el corazón"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Icono</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['💊', '🍖', '🐕', '🧹', '💧', '🛁'].map((ic) => (
                <button
                  key={ic}
                  type="button"
                  style={{
                    padding: '8px 12px',
                    fontSize: '1.2rem',
                    borderRadius: '8px',
                    border: icono === ic ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: icono === ic ? '#eef3ff' : 'var(--color-bg)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIcono(ic)}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            style={{ background: 'var(--color-primary)', color: '#fff', padding: '14px', borderRadius: '12px' }}
          >
            Guardar Tarea
          </button>
        </form>
      </Modal>
    </div>
  );
}
