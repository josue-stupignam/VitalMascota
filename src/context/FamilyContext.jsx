import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import {
  cargarFamilia,
  crearFamilia,
  expulsarMiembro,
  regenerarCodigo,
  salirDeFamilia,
  unirseAFamilia,
} from '../lib/familias';

const FamilyContext = createContext();

export function FamilyProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const familyId = profile?.familyId || null;

  useEffect(() => {
    if (!user || !familyId) {
      setFamily(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');
    const unsubscribe = onSnapshot(
      doc(db, 'families', familyId),
      (snapshot) => {
        setFamily(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error('Error obteniendo la familia:', err);
        setError('No se pudo cargar la familia.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, familyId]);

  const miembros = family?.members || [];
  const esAdmin = Boolean(family && user && family.adminId === user.uid);

  const crear = async () => {
    if (!user) return null;
    setError('');
    const resultado = await crearFamilia({
      uid: user.uid,
      nombre: profile?.nombre || user.displayName,
      email: user.email,
    });
    const cargada = await cargarFamilia(resultado.id);
    setFamily(cargada);
    return resultado;
  };

  const unirse = async (codigo) => {
    if (!user) return null;
    if (familyId && user && familyId !== user.uid) {
      throw new Error('Ya perteneces a una familia. Sal de ella antes de unirte a otra.');
    }
    setError('');
    const resultado = await unirseAFamilia({
      uid: user.uid,
      nombre: profile?.nombre || user.displayName,
      email: user.email,
      codigo,
    });
    const cargada = await cargarFamilia(resultado.id);
    setFamily(cargada);
    return resultado;
  };

  const regenerar = async () => {
    if (!family) return null;
    const codigo = await regenerarCodigo(family.id);
    setFamily((prev) => (prev ? { ...prev, inviteCode: codigo } : prev));
    return codigo;
  };

  const expulsar = async (memberUid) => {
    if (!family) return;
    await expulsarMiembro(family.id, memberUid);
  };

  const salir = async () => {
    if (!family || !user) return;
    await salirDeFamilia({ familyId: family.id, uid: user.uid });
    setFamily(null);
  };

  const value = {
    family,
    members: miembros,
    loading,
    error,
    esAdmin,
    crear,
    unirse,
    regenerar,
    expulsar,
    salir,
    setError,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily debe usarse dentro de un FamilyProvider');
  }
  return context;
}
