import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Activity,
  ClipboardList,
  FileDown,
  Phone,
  Plus,
  Scale,
  Scissors,
  ShieldAlert,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Modal from '../components/ui/Modal';
import QREmergencyModal from '../components/medical/QREmergencyModal';
import WeightChart from '../components/medical/WeightChart';
import { usePet } from '../context/PetContext';
import {
  etiquetaVacuna,
  estadoVacuna,
  normalizarAlergia,
  pesoFueraDeRango,
  resumenSalud,
} from '../lib/medico';
import { getTalla } from '../lib/pets';
import { vibrateSuccess } from '../lib/haptics';
import '../styles/medical-dashboard.css';

const TABS = [
  { key: 'vacunas', label: 'Vacunas', icon: Syringe },
  { key: 'alergias', label: 'Alergias', icon: AlertTriangle },
  { key: 'cirugias', label: 'Cirugías', icon: Scissors },
  { key: 'bitacora', label: 'Bitácora', icon: ClipboardList },
  { key: 'peso', label: 'Peso', icon: Scale },
  { key: 'contactos', label: 'Contactos', icon: Phone },
];

const TITULOS_MODAL = {
  vacunas: 'Añadir vacuna',
  alergias: 'Añadir alergia',
  cirugias: 'Añadir cirugía',
  bitacora: 'Nueva entrada de bitácora',
  peso: 'Registrar peso',
  contactos: 'Editar contactos',
};

const ETIQUETAS_RESCATE = [
  'En tratamiento',
  'Listo para adopción',
  'Mascota de apoyo',
];

const formVacio = () => ({
  nombre: '',
  fecha: '',
  vigente: true,
  descripcion: '',
  nota: '',
  peso: '',
});

export default function MedicalDashboard() {
  const { activePet, updateActivePetMedico, updatePet } = usePet();
  const [activeTab, setActiveTab] = useState('vacunas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [formData, setFormData] = useState(formVacio());
  const [errorMsg, setErrorMsg] = useState('');
  const [contacto, setContacto] = useState({
    veterinario: '',
    clinica: '',
    telefono: '',
    proximaCita: '',
    microchip: '',
  });


  const medico = activePet?.medico || {};

  const salud = useMemo(() => resumenSalud(medico), [medico]);
  const talla = getTalla(activePet?.talla);
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

  const historialPeso = useMemo(() => medico.historialPeso || [], [medico]);
  const ultimoPeso = useMemo(() => {
    if (historialPeso.length === 0) return activePet?.peso;
    return historialPeso[historialPeso.length - 1].peso;
  }, [historialPeso, activePet]);

  if (!activePet) return null;

  const abrirModal = () => {
    setFormData(formVacio());
    setIsModalOpen(true);
  };

  const cerrarModal = () => setIsModalOpen(false);

  const set = (campo) => (e) =>
    setFormData((prev) => ({
      ...prev,
      [campo]: e?.target ? e.target.value : e,
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    const detalle = formData.descripcion.trim();
    setErrorMsg('');

    try {
      await guardarSegunPestana(detalle);
    } catch (error) {
      setErrorMsg(error?.message || 'No se pudo guardar. Inténtalo de nuevo.');
      return;
    }

    vibrateSuccess();
    setIsModalOpen(false);
  };

  const guardarSegunPestana = (detalle) => {
    if (activeTab === 'vacunas') {
      return updateActivePetMedico((prev) => ({
        ...prev,
        vacunas: [
          ...(prev.vacunas || []),
          {
            nombre: formData.nombre.trim(),
            fecha: formData.fecha,
            vigente: formData.vigente,
            descripcion: detalle,
          },
        ],
      }));
    }

    if (activeTab === 'alergias') {
      return updateActivePetMedico((prev) => ({
        ...prev,
        alergias: [
          ...(prev.alergias || []),
          { nombre: formData.nombre.trim(), descripcion: detalle },
        ],
      }));
    }

    if (activeTab === 'cirugias') {
      return updateActivePetMedico((prev) => ({
        ...prev,
        cirugias: [
          ...(prev.cirugias || []),
          {
            nombre: formData.nombre.trim(),
            fecha: formData.fecha,
            descripcion: detalle,
          },
        ],
      }));
    }

    if (activeTab === 'bitacora') {
      return updateActivePetMedico((prev) => ({
        ...prev,
        bitacora: [
          ...(prev.bitacora || []),
          { id: Date.now().toString(), fecha: formData.fecha, nota: formData.nota.trim() },
        ],
      }));
    }

    if (activeTab === 'peso') {
      return updateActivePetMedico((prev) => ({
        ...prev,
        historialPeso: [
          ...(prev.historialPeso || []),
          { fecha: formData.fecha, peso: Number(formData.peso) },
        ],
      }));
    }

    return Promise.resolve();
  };

  const detalleForm = (
    <div className="input-group">
      <label className="input-label" htmlFor="med-detalle">
        Detalles, síntomas o causa que lo provocó
      </label>
      <textarea
        id="med-detalle"
        className="input-field medical-textarea"
        rows="3"
        value={formData.descripcion}
        onChange={set('descripcion')}
        placeholder={
          activeTab === 'vacunas'
            ? 'Ej. Refuerzo anual aplicado en la pata trasera derecha, sin reacción adversa.'
            : activeTab === 'alergias'
            ? 'Ej. Estornudos y picazón tras comer pollo; suspendido desde marzo.'
            : 'Ej. Esterilización con recuperación completa en 10 días.'
        }
      />
      <span className="field-hint">Opcional: agrega síntomas, causa o cualquier detalle útil.</span>
    </div>
  );

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

        <div className={`health-banner health-${salud.estado}`}>
          {salud.estado === 'critico' ? (
            <ShieldAlert size={18} />
          ) : salud.estado === 'proximo' ? (
            <AlertTriangle size={18} />
          ) : (
            <Activity size={18} />
          )}
          <span>{salud.mensaje}</span>
        </div>

        <button
          className="btn-emergency-transfer"
          onClick={() => setIsQrModalOpen(true)}
        >
          <ShieldAlert size={18} /> Transferencia One-Click
        </button>

        <div className="rescuer-tags">
          <span className="section-label">Etiquetas de rescate (opcional)</span>
          <div className="rescuer-tag-row">
            {ETIQUETAS_RESCATE.map((etiqueta) => {
              const activa = (activePet.etiquetas || []).includes(etiqueta);
              return (
                <button
                  key={etiqueta}
                  type="button"
                  className={`rescuer-tag ${activa ? 'active' : ''}`}
                  aria-pressed={activa}
                  onClick={() => {
                    const actuales = activePet.etiquetas || [];
                    const nuevas = activa
                      ? actuales.filter((e) => e !== etiqueta)
                      : [...actuales, etiqueta];
                    updatePet({ etiquetas: nuevas });
                  }}
                >
                  {etiqueta}
                </button>
              );
            })}
          </div>
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
            {activePet.raza || activePet.especie} • {activePet.edad || 'Edad N/A'} • Talla{' '}
            {talla.label}
          </p>
        </div>

        {activeTab === 'vacunas' && (
          <div className="medical-list">
            {(!medico.vacunas || medico.vacunas.length === 0) ? (
              <p className="empty-state">No hay vacunas registradas.</p>
            ) : (
              medico.vacunas.map((v, i) => {
                const estado = estadoVacuna(v);
                return (
                  <div key={i} className="medical-card">
                    <div className="medical-info">
                      <span className="medical-title">{v.nombre}</span>
                      <span className="medical-date">{v.fecha || 'Sin fecha'}</span>
                      {v.descripcion && <span className="medical-desc">{v.descripcion}</span>}
                    </div>
                    <span className={`status-pill light-${estado}`}>
                      {etiquetaVacuna(estado)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'alergias' && (
          <div className="medical-list">
            {(!medico.alergias || medico.alergias.length === 0) ? (
              <p className="empty-state">No hay alergias registradas.</p>
            ) : (
              medico.alergias.map((raw, i) => {
                const alergia = normalizarAlergia(raw);
                return (
                  <div key={i} className="medical-card alert-card">
                    <div className="medical-info">
                      <span className="medical-title">{alergia.nombre}</span>
                      {alergia.descripcion && (
                        <span className="medical-desc">{alergia.descripcion}</span>
                      )}
                    </div>
                    <span className="status-pill light-critico">Restricción</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'cirugias' && (
          <div className="medical-list">
            {(!medico.cirugias || medico.cirugias.length === 0) ? (
              <p className="empty-state">No hay cirugías registradas.</p>
            ) : (
              medico.cirugias.map((c, i) => (
                <div key={i} className="medical-card">
                  <div className="medical-info">
                    <span className="medical-title">{c.nombre}</span>
                    <span className="medical-date">{c.fecha || 'Sin fecha'}</span>
                    {c.descripcion && <span className="medical-desc">{c.descripcion}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'bitacora' && (
          <div className="medical-list">
            {(!medico.bitacora || medico.bitacora.length === 0) ? (
              <p className="empty-state">
                Sin registros de comportamiento. Anota síntomas o cambios de ánimo.
              </p>
            ) : (
              [...medico.bitacora]
                .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
                .map((b) => (
                  <div key={b.id} className="medical-card">
                    <div className="medical-info">
                      <span className="medical-date">{b.fecha}</span>
                      <span className="medical-desc">{b.nota}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'peso' && (
          <div className="weight-tab">
            <WeightChart
              historial={medico.historialPeso || []}
              tallaKey={activePet.talla}
            />
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
          <form
            className="medical-form contact-form no-print"
            onSubmit={async (e) => {
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
            }}
          >
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
                placeholder="Ej. Dra. Laura Méndez"
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
                placeholder="Ej. Hospital Veterinario del Valle"
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
                placeholder="Ej. +52 55 1234 5678"
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
          <Plus size={18} /> Añadir {TABS.find((t) => t.key === activeTab)?.label}
        </button>
      )}

      <Modal isOpen={isModalOpen} onClose={cerrarModal} title={TITULOS_MODAL[activeTab]}>
        <form onSubmit={handleSave} className="medical-form">
          {activeTab !== 'bitacora' && activeTab !== 'peso' && (
            <div className="input-group">
              <label className="input-label" htmlFor="med-nombre">
                Nombre {activeTab === 'alergias' ? 'de la alergia' : ''} *
              </label>
              <input
                id="med-nombre"
                type="text"
                className="input-field"
                required
                value={formData.nombre}
                onChange={set('nombre')}
                placeholder={`Ej. ${
                  activeTab === 'vacunas'
                    ? 'Rabia'
                    : activeTab === 'alergias'
                    ? 'Pollo'
                    : 'Esterilización'
                }`}
              />
            </div>
          )}

          {(activeTab === 'vacunas' || activeTab === 'cirugias' || activeTab === 'bitacora') && (
            <div className="input-group">
              <label className="input-label" htmlFor="med-fecha">
                Fecha *
              </label>
              <input
                id="med-fecha"
                type="date"
                className="input-field"
                required
                value={formData.fecha}
                onChange={set('fecha')}
              />
            </div>
          )}

          {activeTab === 'vacunas' && (
            <div className="input-group checkbox-group">
              <label className="input-label" htmlFor="med-vigente">
                <input
                  id="med-vigente"
                  type="checkbox"
                  checked={formData.vigente}
                  onChange={(e) => set('vigente')(e.target.checked)}
                />{' '}
                ¿Está vigente actualmente?
              </label>
            </div>
          )}

          {activeTab === 'bitacora' && (
            <div className="input-group">
              <label className="input-label" htmlFor="med-nota">
                Síntoma, conducta o nota del día
              </label>
              <textarea
                id="med-nota"
                className="input-field medical-textarea"
                rows="3"
                value={formData.nota}
                onChange={set('nota')}
                placeholder="Ej. Durmió más de lo normal y rechazó el desayuno."
              />
            </div>
          )}

          {activeTab === 'peso' && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="med-peso-fecha">
                  Fecha *
                </label>
                <input
                  id="med-peso-fecha"
                  type="date"
                  className="input-field"
                  required
                  value={formData.fecha}
                  onChange={set('fecha')}
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
                  value={formData.peso}
                  onChange={set('peso')}
                  placeholder={`Rango saludable: ${talla.rango}`}
                />
              </div>
            </>
          )}

          {activeTab !== 'bitacora' && activeTab !== 'peso' && detalleForm}

          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <button type="submit" className="btn-submit-medical">
            Guardar
          </button>
        </form>
      </Modal>

      <QREmergencyModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </main>
  );
}
