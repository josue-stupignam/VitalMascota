import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileDown,
  Phone,
  Plus,
  Scale,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Modal from '../components/ui/Modal';
import QREmergencyModal from '../components/medical/QREmergencyModal';
import WeightChart from '../components/medical/WeightChart';
import { usePet } from '../context/PetContext';
import {
  CATEGORIAS_REGISTRO,
  ESTADOS_REGISTRO,
  normalizarRegistros,
  pesoFueraDeRango,
  registrosPendientes,
} from '../lib/medico';
import { getTalla } from '../lib/pets';
import { getTodayLocalDate } from '../lib/fechas';
import { vibrateSuccess } from '../lib/haptics';
import '../styles/medical-dashboard.css';

const TABS = [
  { key: 'registros', label: 'Registros', icon: ClipboardList },
  { key: 'peso', label: 'Peso', icon: Scale },
  { key: 'contactos', label: 'Contactos', icon: Phone },
];

const formRegistroVacio = () => ({
  nombre: '',
  categoria: 'Vacuna',
  estado: 'Aplicada',
  fecha: getTodayLocalDate(),
  detalles: '',
});

const formPesoVacio = () => ({
  fecha: getTodayLocalDate(),
  peso: '',
});

export default function MedicalDashboard() {
  const { activePet, activePetId, pets, setActivePet, updateActivePetMedico } = usePet();
  const [activeTab, setActiveTab] = useState('registros');
  const [filtro, setFiltro] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [formData, setFormData] = useState(formRegistroVacio());
  const [pesoData, setPesoData] = useState(formPesoVacio());
  const [errorMsg, setErrorMsg] = useState('');
  const [contacto, setContacto] = useState({
    veterinario: '',
    clinica: '',
    telefono: '',
    proximaCita: '',
    microchip: '',
  });

  const medico = activePet?.medico || {};
  const registros = useMemo(() => normalizarRegistros(medico), [medico]);
  const pendientes = useMemo(() => registrosPendientes(medico), [medico]);
  const talla = getTalla(activePet?.talla);
  const hoy = getTodayLocalDate();

  useEffect(() => {
    setContacto({
      veterinario: medico.veterinario || '',
      clinica: medico.clinica || '',
      telefono: medico.telefono || '',
      proximaCita: medico.proximaCita || '',
      microchip: medico.microchip || '',
    });
  }, [
    activePet?.id,
    medico.veterinario,
    medico.clinica,
    medico.telefono,
    medico.proximaCita,
    medico.microchip,
  ]);

  useEffect(() => {
    setErrorMsg('');
    setFiltro('Todas');
  }, [activePetId]);

  const historialPeso = useMemo(() => medico.historialPeso || [], [medico]);
  const ultimoPeso = useMemo(() => {
    if (historialPeso.length === 0) return activePet?.peso;
    return historialPeso[historialPeso.length - 1].peso;
  }, [historialPeso, activePet]);

  const registrosFiltrados = useMemo(() => {
    const lista =
      filtro === 'Todas' ? registros : registros.filter((r) => r.categoria === filtro);
    return [...lista].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }, [registros, filtro]);

  const salud = useMemo(() => {
    if (registros.length === 0) {
      return { estado: 'sin-datos', mensaje: 'Aún no hay registros médicos' };
    }
    if (pendientes.length > 0) {
      return {
        estado: 'proximo',
        mensaje: `${pendientes.length} ${
          pendientes.length === 1 ? 'registro pendiente' : 'registros pendientes'
        } de aplicar`,
      };
    }
    return { estado: 'ok', mensaje: 'No hay registros pendientes de aplicar' };
  }, [registros, pendientes]);

  if (!activePet) return null;

  const abrirModal = () => {
    setErrorMsg('');
    setFormData(formRegistroVacio());
    setPesoData(formPesoVacio());
    setIsModalOpen(true);
  };

  const cerrarModal = () => setIsModalOpen(false);

  const setCampo = (campo) => (e) =>
    setFormData((prev) => ({
      ...prev,
      [campo]: e?.target ? e.target.value : e,
    }));

  const setPeso = (campo) => (e) =>
    setPesoData((prev) => ({ ...prev, [campo]: e.target.value }));

  const guardarRegistro = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim()) {
      setErrorMsg('El nombre del registro es obligatorio.');
      return;
    }
    if (!CATEGORIAS_REGISTRO.includes(formData.categoria)) {
      setErrorMsg('Selecciona una categoría válida.');
      return;
    }
    if (!ESTADOS_REGISTRO.includes(formData.estado)) {
      setErrorMsg('Selecciona un estado válido.');
      return;
    }
    if (!formData.fecha) {
      setErrorMsg('La fecha es obligatoria.');
      return;
    }
    if (formData.estado === 'Aplicada' && formData.fecha > hoy) {
      setErrorMsg('Un registro aplicado no puede tener una fecha futura.');
      return;
    }

    const nuevoRegistro = {
      id: `${Date.now()}`,
      nombre: formData.nombre.trim(),
      categoria: formData.categoria,
      estado: formData.estado,
      fecha: formData.fecha,
      detalles: formData.detalles.trim(),
    };

    try {
      await updateActivePetMedico((prev) => ({
        ...prev,
        registros: [...normalizarRegistros(prev), nuevoRegistro],
      }));
    } catch (error) {
      setErrorMsg(error?.message || 'No se pudo guardar. Inténtalo de nuevo.');
      return;
    }

    vibrateSuccess();
    setIsModalOpen(false);
  };

  const guardarPeso = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const peso = Number(pesoData.peso);

    if (!pesoData.fecha) {
      setErrorMsg('La fecha es obligatoria.');
      return;
    }
    if (!Number.isFinite(peso) || peso <= 0) {
      setErrorMsg('Ingresa un peso mayor a 0 kg.');
      return;
    }

    try {
      await updateActivePetMedico((prev) => ({
        ...prev,
        historialPeso: [
          ...(prev.historialPeso || []),
          { fecha: pesoData.fecha, peso },
        ],
      }));
    } catch (error) {
      setErrorMsg(error?.message || 'No se pudo guardar. Inténtalo de nuevo.');
      return;
    }

    vibrateSuccess();
    setIsModalOpen(false);
  };

  const guardarContactos = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await updateActivePetMedico({
        veterinario: contacto.veterinario.trim(),
        clinica: contacto.clinica.trim(),
        telefono: contacto.telefono.trim(),
        proximaCita: contacto.proximaCita,
        microchip: contacto.microchip.trim(),
      });
    } catch (error) {
      setErrorMsg(error?.message || 'No se pudo guardar. Inténtalo de nuevo.');
      return;
    }
    vibrateSuccess();
  };

  const tituloModal = activeTab === 'peso' ? 'Registrar peso' : 'Añadir registro médico';

  return (
    <main className="page medical-page">
      <div className="no-print">
        <PageHeader
          title="Historial Médico"
          subtitle={`Expediente de ${activePet.nombre}`}
          icon={<Stethoscope size={22} />}
          rightAction={
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => window.print()}
              title="Descargar respaldo en PDF"
            >
              <FileDown size={16} /> PDF
            </button>
          }
        />

        <div className="medical-toolbar">
          <label className="medical-pet-picker" htmlFor="med-mascota">
            <span className="section-label">Mascota</span>
            <select
              id="med-mascota"
              className="input-field"
              value={activePetId || ''}
              onChange={(e) => setActivePet(e.target.value)}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-emergency-transfer"
            onClick={() => setIsQrModalOpen(true)}
          >
            <ShieldAlert size={18} /> Transferencia One-Click
          </button>
        </div>

        <div className={`health-banner health-${salud.estado}`}>
          {salud.estado === 'proximo' ? (
            <CalendarDays size={18} />
          ) : (
            <Activity size={18} />
          )}
          <span>{salud.mensaje}</span>
        </div>

        <div className="tabs-container">
          {TABS.map(({ key, label, icon: Icono }) => (
            <button
              key={key}
              type="button"
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icono size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content print-area">
        <div className="print-only print-header">
          <h2>{activePet.nombre}</h2>
          <p>
            {activePet.raza || activePet.especie} • {activePet.edad || 'Edad no registrada'} • Talla{' '}
            {talla.label}
          </p>
        </div>

        {activeTab === 'registros' && (
          <>
            <div className="record-filters no-print" role="group" aria-label="Filtrar por categoría">
              {['Todas', ...CATEGORIAS_REGISTRO].map((categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={`record-chip ${filtro === categoria ? 'active' : ''}`}
                  aria-pressed={filtro === categoria}
                  onClick={() => setFiltro(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </div>

            {registrosFiltrados.length === 0 ? (
              <p className="empty-state">
                {filtro === 'Todas'
                  ? 'Aún no hay registros médicos para esta mascota.'
                  : `No hay registros en la categoría ${filtro}.`}
              </p>
            ) : (
              <div className="medical-list">
                {registrosFiltrados.map((registro) => (
                  <div key={registro.id} className="medical-card record-card">
                    <div className="medical-info">
                      <div className="record-heading">
                        <span className="medical-title">{registro.nombre}</span>
                        <span className="record-category">{registro.categoria}</span>
                      </div>
                      <span className="medical-date">{registro.fecha || 'Sin fecha'}</span>
                      {registro.detalles && (
                        <span className="medical-desc">{registro.detalles}</span>
                      )}
                    </div>
                    <span
                      className={`status-pill ${
                        registro.estado === 'Aplicada' ? 'light-ok' : 'light-proximo'
                      }`}
                    >
                      {registro.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'peso' && (
          <div className="weight-tab">
            <WeightChart historial={medico.historialPeso || []} tallaKey={activePet.talla} />
            {pesoFueraDeRango(ultimoPeso, activePet.talla) === 'bajo' && (
              <p className="weight-warning">
                El peso registrado está por debajo del rango saludable de la talla {talla.label}.
              </p>
            )}
            {pesoFueraDeRango(ultimoPeso, activePet.talla) === 'alto' && (
              <p className="weight-warning">
                El peso registrado está por encima del rango saludable de la talla {talla.label}.
              </p>
            )}
          </div>
        )}

        {activeTab === 'contactos' && (
          <form className="medical-form contact-form no-print" onSubmit={guardarContactos}>
            <p className="field-hint">
              Estos datos aparecen en el QR de emergencia y en el enlace del cuidador.
            </p>
            {errorMsg && <p className="form-error">{errorMsg}</p>}
            <div className="input-group">
              <label className="input-label" htmlFor="contacto-vet">
                Veterinario de cabecera
              </label>
              <input
                id="contacto-vet"
                type="text"
                className="input-field"
                value={contacto.veterinario}
                onChange={(e) => setContacto((p) => ({ ...p, veterinario: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="contacto-clinica">
                Clínica
              </label>
              <input
                id="contacto-clinica"
                type="text"
                className="input-field"
                value={contacto.clinica}
                onChange={(e) => setContacto((p) => ({ ...p, clinica: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="contacto-telefono">
                Teléfono de emergencia
              </label>
              <input
                id="contacto-telefono"
                type="tel"
                inputMode="tel"
                className="input-field"
                value={contacto.telefono}
                onChange={(e) => setContacto((p) => ({ ...p, telefono: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="contacto-cita">
                Próxima cita
              </label>
              <input
                id="contacto-cita"
                type="date"
                className="input-field"
                value={contacto.proximaCita}
                onChange={(e) => setContacto((p) => ({ ...p, proximaCita: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="contacto-microchip">
                Microchip
              </label>
              <input
                id="contacto-microchip"
                type="text"
                className="input-field"
                value={contacto.microchip}
                onChange={(e) => setContacto((p) => ({ ...p, microchip: e.target.value }))}
                placeholder="Número de microchip"
              />
            </div>
            <button type="submit" className="btn-submit-medical">
              Guardar contactos
            </button>
          </form>
        )}

        {medico.veterinario && (
          <div className="print-only print-footer">
            <p>Veterinario: {medico.veterinario}</p>
            {medico.clinica && <p>Clínica: {medico.clinica}</p>}
            {medico.telefono && <p>Teléfono: {medico.telefono}</p>}
          </div>
        )}
      </div>

      {activeTab !== 'contactos' && (
        <button type="button" className="fab-button no-print" onClick={abrirModal}>
          <Plus size={18} /> {activeTab === 'peso' ? 'Registrar peso' : 'Añadir registro'}
        </button>
      )}

      <Modal isOpen={isModalOpen} onClose={cerrarModal} title={tituloModal}>
        {activeTab === 'peso' ? (
          <form onSubmit={guardarPeso} className="medical-form">
            <div className="input-group">
              <label className="input-label" htmlFor="med-peso-fecha">
                Fecha *
              </label>
              <input
                id="med-peso-fecha"
                type="date"
                className="input-field"
                required
                max={hoy}
                value={pesoData.fecha}
                onChange={setPeso('fecha')}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="med-peso">
                Peso (kg) *
              </label>
              <input
                id="med-peso"
                type="number"
                step="0.1"
                min="0"
                className="input-field"
                required
                value={pesoData.peso}
                onChange={setPeso('peso')}
                placeholder={`Rango saludable: ${talla.rango}`}
              />
            </div>
            {errorMsg && <p className="form-error">{errorMsg}</p>}
            <button type="submit" className="btn-submit-medical">
              Guardar
            </button>
          </form>
        ) : (
          <form onSubmit={guardarRegistro} className="medical-form">
            <div className="input-group">
              <label className="input-label" htmlFor="med-nombre">
                Nombre *
              </label>
              <input
                id="med-nombre"
                type="text"
                className="input-field"
                required
                value={formData.nombre}
                onChange={setCampo('nombre')}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label" htmlFor="med-categoria">
                  Categoría *
                </label>
                <select
                  id="med-categoria"
                  className="input-field"
                  required
                  value={formData.categoria}
                  onChange={setCampo('categoria')}
                >
                  {CATEGORIAS_REGISTRO.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="med-estado">
                  Estado *
                </label>
                <select
                  id="med-estado"
                  className="input-field"
                  required
                  value={formData.estado}
                  onChange={setCampo('estado')}
                >
                  {ESTADOS_REGISTRO.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="med-fecha">
                Fecha *
              </label>
              <input
                id="med-fecha"
                type="date"
                className="input-field"
                required
                max={formData.estado === 'Aplicada' ? hoy : undefined}
                value={formData.fecha}
                onChange={setCampo('fecha')}
              />
              <span className="field-hint">
                {formData.estado === 'Aplicada'
                  ? 'Para registros aplicados solo se permiten fechas de hoy o anteriores.'
                  : 'Puedes registrar fechas pasadas o futuras para dosis pendientes.'}
              </span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="med-detalle">
                Detalles
              </label>
              <textarea
                id="med-detalle"
                className="input-field medical-textarea"
                rows="3"
                value={formData.detalles}
                onChange={setCampo('detalles')}
              />
            </div>

            {errorMsg && <p className="form-error">{errorMsg}</p>}

            <button type="submit" className="btn-submit-medical">
              Guardar
            </button>
          </form>
        )}
      </Modal>

      <QREmergencyModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </main>
  );
}
