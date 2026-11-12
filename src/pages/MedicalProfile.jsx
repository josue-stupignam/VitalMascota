import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import WeightChart from '../components/medical/WeightChart';
import AllergyList from '../components/medical/AllergyList';
import VaccineList from '../components/medical/VaccineList';
import QREmergencyModal from '../components/medical/QREmergencyModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePet } from '../context/PetContext';

export default function MedicalProfile() {
  const { mascota, medico } = usePet();
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner message="Cargando perfil médico..." />;

  return (
    <main className="page">
      <PageHeader
        title="Perfil Médico"
        subtitle={`Expediente clínico de ${mascota.nombre}`}
        icon="🩺"
      />

      {/* Info del veterinario */}
      <div className="card vet-card">
        <p><strong>🩺 Veterinario:</strong> {medico.veterinario}</p>
        <p><strong>🏥 Clínica:</strong> {medico.clinica}</p>
        <p><strong>📅 Próxima cita:</strong> {medico.proximaCita}</p>
      </div>

      <WeightChart historial={medico.historialPeso} />
      <AllergyList alergias={medico.alergias} />
      <VaccineList vacunas={medico.vacunas} />

      {/* Botón rojo de transferencia One-Click */}
      <button
        className="btn btn-emergency-transfer"
        onClick={() => setShowQR(true)}
      >
        🚑 Transferencia One-Click
      </button>

      <QREmergencyModal isOpen={showQR} onClose={() => setShowQR(false)} />
    </main>
  );
}
