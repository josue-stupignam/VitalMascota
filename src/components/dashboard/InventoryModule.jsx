import React, { useState } from 'react';
import { usePet } from '../../context/PetContext';
import Modal from '../ui/Modal';
import '../../styles/global.css';

export default function InventoryModule() {
  const { items, addInventoryItem, removeInventoryItem, activePet } = usePet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nombre, setNombre] = useState('');
  const [cantidadTotal, setCantidadTotal] = useState('');
  const [consumoDiario, setConsumoDiario] = useState('');
  const [unidad, setUnidad] = useState('g'); // g, dosis, latas

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !cantidadTotal || !consumoDiario) return;

    const total = parseFloat(cantidadTotal) || 0;
    const consumo = parseFloat(consumoDiario) || 1;
    const diasRestantes = Math.max(0, Math.floor(total / (consumo > 0 ? consumo : 1)));

    const newItem = {
      nombre: nombre.trim(),
      total,
      consumoDiario: consumo,
      diasRestantes,
      unidad,
      fechaActualizacion: new Date().toLocaleDateString('es-MX'),
    };

    await addInventoryItem(newItem);
    setNombre('');
    setCantidadTotal('');
    setConsumoDiario('');
    setIsModalOpen(false);
  };

  const inventoryList = items || [];

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 className="card-title">📦 Insumos y Alimento</h3>
        <span className="section-label">Cálculo Inteligente</span>
      </div>

      {inventoryList.length === 0 ? (
        <p className="empty-state">No tienes insumos ni alimento registrados.</p>
      ) : (
        <ul className="inventory-list">
          {inventoryList.map((item) => {
            const isLow = item.diasRestantes <= 5;
            return (
              <li key={item.id} className="inventory-item">
                <div style={{ flex: 1 }}>
                  <div className="inventory-name">{item.nombre}</div>
                  <span className="inventory-qty">
                    Total: {item.total} {item.unidad} • Consumo: {item.consumoDiario} {item.unidad}/día
                  </span>
                </div>

                <div className="inventory-status">
                  <span className={`days-left ${isLow ? 'days-danger' : 'days-ok'}`}>
                    {item.diasRestantes} días rest.
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInventoryItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '4px',
                    }}
                    title="Eliminar insumo"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}
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
        + Registrar Insumo / Alimento
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Insumo">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Nombre del insumo / alimento</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. Croquetas Royal Canin"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Cantidad Total</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                placeholder="Ej. 3000"
                value={cantidadTotal}
                onChange={(e) => setCantidadTotal(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Unidad</label>
              <select
                className="input-field"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
              >
                <option value="g">Gramos (g)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="latas">Latas / Sobres</option>
                <option value="pastillas">Pastillas / Dosis</option>
                <option value="ml">Mililitros (ml)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Consumo diario estimado</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="Ej. 150 (g al día)"
              value={consumoDiario}
              onChange={(e) => setConsumoDiario(e.target.value)}
              required
            />
            {cantidadTotal && consumoDiario && Number(consumoDiario) > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
                💡 Durará aproximadamente {Math.floor(Number(cantidadTotal) / Number(consumoDiario))} días.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            style={{ background: 'var(--color-primary)', color: '#fff', padding: '14px', borderRadius: '12px' }}
          >
            Calcular y Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
