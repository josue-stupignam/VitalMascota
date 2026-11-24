import React, { useEffect, useState } from 'react';
import { Lightbulb, Package, Plus, Trash2 } from 'lucide-react';
import { usePet } from '../../context/PetContext';
import Modal from '../ui/Modal';
import {
  calcularDiasRestantes,
  estadoInventario,
  getPorcionDiaria,
  getTalla,
} from '../../lib/pets';
import { vibrateSuccess } from '../../lib/haptics';
import '../../styles/global.css';

const ETIQUETA_ESTADO = {
  ok: 'Abasto suficiente',
  proximo: 'Por agotarse',
  critico: 'Se agota pronto',
  'sin-datos': 'Sin cálculo',
};

export default function InventoryModule() {
  const { items, addInventoryItem, removeInventoryItem, activePet, pets } = usePet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tipo, setTipo] = useState('alimento');
  const [nombre, setNombre] = useState('');
  const [cantidadKg, setCantidadKg] = useState('');
  const [cantidadOtro, setCantidadOtro] = useState('');
  const [unidadOtro, setUnidadOtro] = useState('latas');
  const [porcionManual, setPorcionManual] = useState('');
  const [consumoOtro, setConsumoOtro] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tallaKey = activePet?.talla || 'mediana';
  const talla = getTalla(tallaKey);
  const porcionSugerida = getPorcionDiaria(tallaKey);
  const porcionEfectiva = getPorcionDiaria(tallaKey, porcionManual);

  const gramosTotales = Math.round((parseFloat(cantidadKg) || 0) * 1000);
  const diasCalculados =
    tipo === 'alimento'
      ? calcularDiasRestantes(gramosTotales, porcionEfectiva)
      : calcularDiasRestantes(parseFloat(cantidadOtro), parseFloat(consumoOtro));

  useEffect(() => {
    if (!isModalOpen) {
      setTipo('alimento');
      setNombre('');
      setCantidadKg('');
      setCantidadOtro('');
      setUnidadOtro('latas');
      setPorcionManual('');
      setConsumoOtro('');
      setErrorMsg('');
    }
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const kilos = parseFloat(cantidadKg);
    const consumoDiario = parseFloat(consumoOtro);
    if (tipo === 'alimento' && (!Number.isFinite(kilos) || kilos <= 0)) {
      setErrorMsg('Indica cuántos kilogramos de alimento tienes (mayor que 0).');
      return;
    }
    if (tipo === 'insumo' && (!Number.isFinite(consumoDiario) || consumoDiario <= 0)) {
      setErrorMsg('Indica la cantidad total y el consumo diario (mayores que 0).');
      return;
    }
    setErrorMsg('');

    let newItem;
    if (tipo === 'alimento') {
      newItem = {
        nombre: nombre.trim(),
        tipo: 'alimento',
        total: gramosTotales,
        unidad: 'g',
        porcionDiaria: porcionEfectiva,
        diasRestantes: calcularDiasRestantes(gramosTotales, porcionEfectiva),
      };
    } else {
      const total = parseFloat(cantidadOtro) || 0;
      const consumo = consumoDiario;
      newItem = {
        nombre: nombre.trim(),
        tipo: 'insumo',
        total,
        unidad: unidadOtro,
        porcionDiaria: consumo,
        diasRestantes: calcularDiasRestantes(total, consumo),
      };
    }

    newItem.fechaActualizacion = new Date().toLocaleDateString('es-MX');
    newItem.actualizadoEn = new Date().toISOString();
    await addInventoryItem(newItem);
    vibrateSuccess();
    setIsModalOpen(false);
  };

  const inventoryList = items || [];

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 className="card-title">
          <Package size={18} /> Insumos y Alimento
        </h3>
        <span className="section-label">Ración automática</span>
      </div>

      {inventoryList.length === 0 ? (
        <div className="empty-state">
          <p>No tienes insumos ni alimento registrados.</p>
          <p className="empty-hint">
            Registra el saco de croquetas en kilogramos y calcularemos cuántos días durará según la
            talla de {activePet?.nombre || 'tu mascota'}.
          </p>
        </div>
      ) : (
        <ul className="inventory-list">
          {inventoryList.map((item) => {
            const diasVividos = item.actualizadoEn
              ? Math.floor((Date.now() - new Date(item.actualizadoEn).getTime()) / 86400000)
              : 0;
            const diasRestantes = Number.isFinite(item.diasRestantes)
              ? Math.max(0, item.diasRestantes - Math.max(0, diasVividos))
              : item.diasRestantes;
            const estado = estadoInventario(diasRestantes);
            return (
              <li key={item.id} className="inventory-item">
                <div className="inventory-info">
                  <div className="inventory-name">{item.nombre}</div>
                  <span className="inventory-qty">
                    Total: {item.total} {item.unidad}
                    {item.porcionDiaria
                      ? ` • Ración: ${item.porcionDiaria} ${item.unidad}/día`
                      : ''}
                  </span>
                </div>

                <div className="inventory-status">
                  <span className={`days-left days-${estado}`}>
                    {diasRestantes === null
                      ? 'Sin cálculo'
                      : `${diasRestantes} días`}
                  </span>
                  <span className={`inventory-light light-${estado}`}>
                    {ETIQUETA_ESTADO[estado]}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeInventoryItem(item.id)}
                    title="Eliminar insumo"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button type="button" className="btn-dashed" onClick={() => setIsModalOpen(true)}>
        <Plus size={16} /> Registrar insumo o alimento
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Insumo">
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="input-group">
            <span className="input-label">Tipo de registro</span>
            <div className="segmented">
              <button
                type="button"
                className={tipo === 'alimento' ? 'active' : ''}
                onClick={() => setTipo('alimento')}
              >
                Alimento
              </button>
              <button
                type="button"
                className={tipo === 'insumo' ? 'active' : ''}
                onClick={() => setTipo('insumo')}
              >
                Otro insumo
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="inv-nombre">
              Nombre
            </label>
            <input
              id="inv-nombre"
              type="text"
              className="input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
            />
          </div>

          {tipo === 'alimento' ? (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="inv-kg">
                  Cantidad disponible (kg)
                </label>
                <input
                  id="inv-kg"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  value={cantidadKg}
                  onChange={(e) => setCantidadKg(e.target.value)}
                  required
                />
                {gramosTotales > 0 && (
                  <span className="field-hint">
                    Equivale a {gramosTotales.toLocaleString('es-MX')} gramos
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="inv-porcion">
                  Ración diaria (gramos)
                </label>
                <input
                  id="inv-porcion"
                  type="number"
                  step="1"
                  min="1"
                  className="input-field"
                  placeholder={`Sugerida: ${porcionSugerida} g`}
                  value={porcionManual}
                  onChange={(e) => setPorcionManual(e.target.value)}
                />
                <span className="field-hint">
                  <Lightbulb size={13} /> Ración automática para talla {talla.label} ({talla.rango}):{' '}
                  <strong>{porcionSugerida} g/día</strong>. Déjalo vacío para usarla.
                </span>
              </div>

              {diasCalculados !== null && (
                <div className={`calc-preview cal-${estadoInventario(diasCalculados)}`}>
                  <span className="calc-dias">{diasCalculados} días de alimento</span>
                  <span className="calc-detalle">
                    {gramosTotales} g ÷ {porcionEfectiva} g/día ·{' '}
                    {ETIQUETA_ESTADO[estadoInventario(diasCalculados)]}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="inv-cantidad">
                    Cantidad
                  </label>
                  <input
                    id="inv-cantidad"
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field"
                    value={cantidadOtro}
                    onChange={(e) => setCantidadOtro(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="inv-unidad">
                    Unidad
                  </label>
                  <select
                    id="inv-unidad"
                    className="input-field"
                    value={unidadOtro}
                    onChange={(e) => setUnidadOtro(e.target.value)}
                  >
                    <option value="latas">Latas / Sobres</option>
                    <option value="pastillas">Pastillas / Dosis</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="inv-consumo">
                  Consumo diario
                </label>
                <input
                  id="inv-consumo"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  value={consumoOtro}
                  onChange={(e) => setConsumoOtro(e.target.value)}
                  required
                />
              </div>

              {diasCalculados !== null && (
                <div className={`calc-preview cal-${estadoInventario(diasCalculados)}`}>
                  <span className="calc-dias">{diasCalculados} días de abasto</span>
                  <span className="calc-detalle">
                    {cantidadOtro} ÷ {consumoOtro}/día ·{' '}
                    {ETIQUETA_ESTADO[estadoInventario(diasCalculados)]}
                  </span>
                </div>
              )}
            </>
          )}

          {errorMsg && <p className="form-error">{errorMsg}</p>}
          <button type="submit" className="btn btn-primary">
            Calcular y guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
