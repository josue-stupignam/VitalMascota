import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import PetSelector from '../components/dashboard/PetSelector';
import PetStatusCard from '../components/dashboard/PetStatusCard';
import EventFeed from '../components/dashboard/EventFeed';
import InventoryModule from '../components/dashboard/InventoryModule';
import TaskList from '../components/dashboard/TaskList';
import MissingPetPoster from '../components/dashboard/MissingPetPoster';
import PetSitterModal from '../components/dashboard/PetSitterModal';
import DatoCurioso from '../components/dashboard/DatoCurioso';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PawPrint } from 'lucide-react';
import { usePet } from '../context/PetContext';

export default function DashboardHome() {
  const { hasPets, petsLoading, setShowWizard, activePet, eventos } = usePet();
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [isSitterOpen, setIsSitterOpen] = useState(false);

  if (petsLoading) {
    return (
      <main className="page">
        <PageHeader title="VitalMascota" subtitle="Panel de control familiar" icon={null} />
        <div className="skeleton-dashboard">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    );
  }

  // ── Estado vacío: 0 mascotas ────────────────────────────────────
  if (!hasPets) {
    return (
      <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '20px' }}>
        <PawPrint size={56} className="empty-pets-icon" aria-hidden="true" />
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
      />

      <DatoCurioso />

      <div className="dashboard-grid">
        <div className="dash-pet">
          <PetSelector />
          <PetStatusCard
            onOpenPoster={() => setIsPosterOpen(true)}
            onOpenSitter={() => setIsSitterOpen(true)}
          />
        </div>
        <div className="dash-alerts">
          <EventFeed eventos={eventos} />
        </div>
        <div className="dash-inventory">
          <InventoryModule />
        </div>
        <div className="dash-tasks">
          <TaskList />
        </div>
      </div>

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
