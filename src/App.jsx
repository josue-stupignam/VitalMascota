import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthView from './components/auth/AuthView';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import DashboardHome from './pages/DashboardHome';
import EmergencyMap from './pages/EmergencyMap';
import MedicalDashboard from './pages/MedicalDashboard';
import { useAuth } from './context/AuthContext';
import { usePet } from './context/PetContext';
import './styles/global.css';

export default function App() {
  const { user } = useAuth();
  const { hasPets, showWizard, setShowWizard } = usePet();

  // Mostrar el navbar solo si el usuario está autenticado y tiene mascotas registradas
  const showNavbar = user && hasPets;

  return (
    <div className="app-container">
      {/* Wizard modal globally rendered */}
      {showWizard && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, background: 'var(--color-bg)' }}>
          <OnboardingWizard onClose={() => setShowWizard(false)} />
        </div>
      )}

      <Routes>
        <Route path="/login" element={<AuthView />} />

        {/* Rutas protegidas (requieren login, validado por ProtectedRoute) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergencia"
          element={
            <ProtectedRoute>
              <EmergencyMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil-medico"
          element={
            <ProtectedRoute>
              <MedicalDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirección raíz que respeta ProtectedRoute */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>

      {showNavbar && <Navbar />}
    </div>
  );
}
