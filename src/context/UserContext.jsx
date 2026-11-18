import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const UserContext = createContext();

const perfilInicial = (user) => ({
  nombre: user.displayName || '',
  telefono: '',
  email: user.email || '',
  familyId: user.uid,
  role: 'owner',
  familyMembers: [],
});

export function UserProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return undefined;
    }

    setProfileLoading(true);
    const ref = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      ref,
      async (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ ...perfilInicial(user), ...snapshot.data() });
        } else {
          const base = perfilInicial(user);
          setProfile(base);
          try {
            await setDoc(ref, base, { merge: true });
          } catch (error) {
            console.error('No se pudo crear el perfil del usuario:', error);
          }
        }
        setProfileLoading(false);
      },
      (error) => {
        console.error('Error obteniendo el perfil del usuario:', error);
        setProfile(perfilInicial(user));
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          { ...patch, email: user.email || '' },
          { merge: true }
        );
      } catch (error) {
        console.error('Error actualizando el perfil:', error);
        throw error;
      }
    },
    [user]
  );

  const logoutAndClear = useCallback(async () => {
    try {
      Object.keys(localStorage)
        .filter((clave) => clave.startsWith('vitalmascota_'))
        .forEach((clave) => localStorage.removeItem(clave));
    } catch (error) {
      console.error('No se pudo limpiar la caché local:', error);
    }
    await signOut(auth);
  }, []);

  const value = { profile, profileLoading, updateProfile, logoutAndClear };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
}
