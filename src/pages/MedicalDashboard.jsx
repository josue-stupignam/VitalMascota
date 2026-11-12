import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Modal from '../components/ui/Modal';
import { usePet } from '../context/PetContext';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import '../styles/medical-dashboard.css';

export default function MedicalDashboard() {
  const { activePet, updateActivePetMedico } = usePet();
  const [activeTab, setActiveTab] = useState('vacunas'); // 'vacunas' | 'alergias' | 'cirugias'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Estados temporales para los formularios del Modal
  const [formData, setFormData] = useState({
    nombre: '', fecha: '', vigente: true, descripcion: ''
  });

  if (!activePet) return null;
  const { medico } = activePet;

  // Manejador del Botón Flotante (FAB)
  const handleFabClick = () => {
    setFormData({ nombre: '', fecha: '', vigente: true, descripcion: '' });
    setIsModalOpen(true);
  };

  // Guardar datos según la pestaña activa
  const handleSave = (e) => {
    e.preventDefault();
    if (activeTab === 'vacunas') {
      const nuevaVacuna = { nombre: formData.nombre, fecha: formData.fecha, vigente: formData.vigente };
      updateActivePetMedico((prev) => ({ ...prev, vacunas: [...(prev.vacunas || []), nuevaVacuna] }));
    } else if (activeTab === 'alergias') {
      updateActivePetMedico((prev) => ({ ...prev, alergias: [...(prev.alergias || []), formData.nombre] }));
    } else if (activeTab === 'cirugias') {
      const nuevaCirugia = { nombre: formData.nombre, fecha: formData.fecha, descripcion: formData.descripcion };
      updateActivePetMedico((prev) => ({ ...prev, cirugias: [...(prev.cirugias || []), nuevaCirugia] }));
    }
    setIsModalOpen(false);
  };

  return (
    <main className="page medical-page">
      <PageHeader
        title="Historial Médico"
        subtitle={`Expediente de ${activePet.nombre}`}
        icon="🩺"
      />

      <button className="btn-emergency-transfer" onClick={() => setIsQrModalOpen(true)}>
        <span>🚨</span> Transferencia One-Click
      </button>

      {/* ─── Pestañas (Tabs) ──────────────────────────────────────────────── */}
      <div className="tabs-container" style={{ marginTop: '16px' }}>
        <button className={`tab-button ${activeTab === 'vacunas' ? 'active' : ''}`} onClick={() => setActiveTab('vacunas')}>
          💉 Vacunas
        </button>
        <button className={`tab-button ${activeTab === 'alergias' ? 'active' : ''}`} onClick={() => setActiveTab('alergias')}>
          ⚠️ Alergias
        </button>
        <button className={`tab-button ${activeTab === 'cirugias' ? 'active' : ''}`} onClick={() => setActiveTab('cirugias')}>
          ✂️ Cirugías
        </button>
      </div>

      {/* ─── Contenido Dinámico de la Pestaña ─────────────────────────────── */}
      <div className="tab-content">
        {activeTab === 'vacunas' && (
          <div className="medical-list">
            {(!medico.vacunas || medico.vacunas.length === 0) ? (
              <p className="empty-state">No hay vacunas registradas.</p>
            ) : (
              medico.vacunas.map((v, i) => (
                <div key={i} className="medical-card">
                  <div className="medical-info">
                    <span className="medical-title">{v.nombre}</span>
                    <span className="medical-date">{v.fecha}</span>
                  </div>
                  <span className={`status-pill ${v.vigente ? 'active' : 'expired'}`}>
                    {v.vigente ? 'Vigente' : 'Vencida'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'alergias' && (
          <div className="medical-list">
            {(!medico.alergias || medico.alergias.length === 0) ? (
              <p className="empty-state">No hay alergias registradas.</p>
            ) : (
              medico.alergias.map((a, i) => (
                <div key={i} className="medical-card alert-card">
                  <span className="medical-title">{a}</span>
                </div>
              ))
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
                    <span className="medical-date">{c.fecha}</span>
                    {c.descripcion && <span className="medical-desc">{c.descripcion}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Botón Flotante (FAB) ─────────────────────────────────────────── */}
      <button className="fab-button" onClick={handleFabClick}>
        + Añadir {activeTab === 'vacunas' ? 'Vacuna' : activeTab === 'alergias' ? 'Alergia' : 'Cirugía'}
      </button>

      {/* ─── Modal Limpio para Agregar Datos ──────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Añadir nueva ${activeTab}`}>
        <form onSubmit={handleSave} className="medical-form">
          
          <div className="input-group">
            <label className="input-label">Nombre {activeTab === 'alergias' ? 'de la Alergia' : ''}</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              placeholder={`Ej. ${activeTab === 'vacunas' ? 'Rabia' : activeTab === 'alergias' ? 'Pollo' : 'Esterilización'}`}
            />
          </div>

          {activeTab !== 'alergias' && (
            <div className="input-group">
              <label className="input-label">Fecha</label>
              <input 
                type="date" 
                className="input-field" 
                required 
                value={formData.fecha}
                onChange={e => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
          )}

          {activeTab === 'vacunas' && (
            <div className="input-group checkbox-group">
              <label className="input-label">
                <input 
                  type="checkbox" 
                  checked={formData.vigente} 
                  onChange={e => setFormData({...formData, vigente: e.target.checked})}
                /> ¿Está vigente actualmente?
              </label>
            </div>
          )}

          {activeTab === 'cirugias' && (
            <div className="input-group">
              <label className="input-label">Notas (Opcional)</label>
              <textarea 
                className="input-field" 
                rows="3" 
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Detalles de la cirugía..."
              ></textarea>
            </div>
          )}

          <button type="submit" className="btn-submit-medical">Guardar</button>
        </form>
      </Modal>

      {/* ─── Modal de QR One-Click ────────────────────────────────────────── */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Transferencia de Emergencia">
        <div className="qr-modal-content">
          <div className="qr-pet-info">
            {activePet.avatar_url || activePet.foto ? (
              <img src={activePet.avatar_url || activePet.foto} alt={activePet.nombre} className="qr-pet-photo" style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <div className="qr-pet-photo" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa', fontSize: '2rem'}}>
                {activePet.especie === 'gato' ? '🐈' : '🐕'}
              </div>
            )}
            <h3>{activePet.nombre}</h3>
            <p>{activePet.raza || activePet.especie} • {activePet.edad}</p>
          </div>
          
          <div className="qr-code-wrapper">
            {activePet?.id ? (
              <QRCode 
                value={`https://vitalmascota.vercel.app/emergencia/${activePet.id}`} 
                size={180} 
                level="H" 
                includeMargin={true}
              />
            ) : (
              <p>Selecciona o registra una mascota primero para generar el código de transferencia.</p>
            )}
          </div>
          
          <p className="qr-instruction">
            Muestra este código al veterinario para transferir inmediatamente el expediente médico y contactos de emergencia.
          </p>
        </div>
      </Modal>

    </main>
  );
}
