import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import PetSelector from '../components/dashboard/PetSelector';
import PetStatusCard from '../components/dashboard/PetStatusCard';
import EventFeed from '../components/dashboard/EventFeed';
import InventoryModule from '../components/dashboard/InventoryModule';
import TaskList from '../components/dashboard/TaskList';
import MissingPetPoster from '../components/dashboard/MissingPetPoster';
import PetSitterModal from '../components/dashboard/PetSitterModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePet } from '../context/PetContext';

export default function DashboardHome() {
  const { hasPets, petsLoading, setShowWizard, activePet, eventos } = usePet();
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [isSitterOpen, setIsSitterOpen] = useState(false);

  if (petsLoading) return <LoadingSpinner message="Cargando panel de mascotas..." />;

  // ── Estado vacío: 0 mascotas ────────────────────────────────────
  if (!hasPets) {
    return (
      <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '20px' }}>
        <span style={{ fontSize: '4rem', marginBottom: '16px' }}>🐾</span>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>Aún no tienes mascotas registradas.</h2>
        <p style={{ color: '#888', marginBottom: '24px', maxWidth: '300px' }}>
          Registra a tu primera mascota para comenzar a gestionar su salud, alimentación y citas.
        </p>
        <button
          onClick={() => setShowWizard(true)}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          + Registrar mi primera mascota
        </button>
      </main>
    );
  }

  // ── Dashboard normal ────────────────────────────────────────────
  return (
    <main className="page">
      <PageHeader
        title="VitalMascota"
        subtitle="Panel de control familiar"
        icon="🐾"
      />

      <PetSelector />
      <PetStatusCard
        onOpenPoster={() => setIsPosterOpen(true)}
        onOpenSitter={() => setIsSitterOpen(true)}
      />
      <EventFeed eventos={eventos} />
      <InventoryModule />
      <TaskList />

      {activePet && (
        <>
          <MissingPetPoster
            pet={activePet}
            isOpen={isPosterOpen}
            onClose={() => setIsPosterOpen(false)}
          />
          <PetSitterModal
            pet={activePet}
            isOpen={isSitterOpen}
            onClose={() => setIsSitterOpen(false)}
          />
        </>
      )}
    </main>
  );
}
