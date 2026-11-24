import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ConfigError from './components/ui/ConfigError';
import { firebaseConfigError, firebaseConfigFaltantes } from './firebaseConfig';
import { AuthProvider } from './context/AuthContext';
import { PetProvider } from './context/PetContext';
import { UserProvider } from './context/UserContext';
import { FamilyProvider } from './context/FamilyContext';
import './styles/global.css';

const raiz = document.getElementById('root');

if (firebaseConfigError) {
  ReactDOM.createRoot(raiz).render(
    <ConfigError mensaje={firebaseConfigError} faltantes={firebaseConfigFaltantes} />
  );
} else {
  ReactDOM.createRoot(raiz).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
          <FamilyProvider>
            <PetProvider>
              <App />
            </PetProvider>
          </FamilyProvider>
        </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
