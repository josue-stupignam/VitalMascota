import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { clinicasCercanas, especieEmojis, familia } from '../data/mockData';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'vitalmascota_secure_vault_2026';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (ciphertext) => {
  if (!ciphertext) return {};
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return {};
  }
};

const PetContext = createContext();

export function PetProvider({ children }) {
  const { user } = useAuth();
  
  // Caché en memoria / almacenamiento local para evitar pantallas en blanco durante la conexión inicial
  const getInitialCache = () => {
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`vitalmascota_pets_cache_${user.uid}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  };

  const [pets, setPets] = useState(getInitialCache);
  const [activePetId, setActivePetId] = useState(() => {
    const initial = getInitialCache();
    return initial.length > 0 ? initial[0].id : null;
  });
  const [petsLoading, setPetsLoading] = useState(() => getInitialCache().length === 0);
  const [showWizard, setShowWizard] = useState(false);

  // ── Firestore: Sincronización en tiempo real con caché en memoria ─────────
  useEffect(() => {
    if (user) {
      const cached = getInitialCache();
      if (cached.length > 0) {
        setPets(cached);
        if (!activePetId) setActivePetId(cached[0].id);
        setPetsLoading(false);
      }

      const q = query(collection(db, 'pets'), where('userId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const petsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Descifrar historial médico confidencial
            medico: data.medico ? (typeof data.medico === 'string' ? decryptData(data.medico) : data.medico) : {}
          };
        });
        
        setPets(petsData);
        // Guardar en caché local
        try {
          localStorage.setItem(`vitalmascota_pets_cache_${user.uid}`, JSON.stringify(petsData));
        } catch (e) {
          // Si el storage está lleno o restringido
        }
        
        if (petsData.length > 0) {
          if (!petsData.find(p => p.id === activePetId)) {
            setActivePetId(petsData[0].id);
          }
        } else {
          setActivePetId(null);
        }
        
        setPetsLoading(false);
      }, (error) => {
        console.error("Error obteniendo mascotas:", error);
        setPetsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setPets([]);
      setActivePetId(null);
      setPetsLoading(false);
    }
  }, [user]);

  // ── Funciones de Mutación (Firestore) ────────────────────────────────
  const addPet = useCallback(async (petData) => {
    if (!user) return;
    
    const initialMedico = {
      veterinario: '', clinica: '', telefono: '', proximaCita: '',
      alergias: [], vacunas: [], cirugias: [],
      historialPeso: petData.peso ? [{ mes: new Date().toLocaleString('es', { month: 'short' }), peso: Number(petData.peso) || 0 }] : []
    };

    const newPetData = {
      ...petData,
      userId: user.uid,
      estado: 'saludable',
      eventos: [],
      inventario: [], // Para InventoryModule
      tareas: petData.tareas || [],
      medico: encryptData(initialMedico), // Cifrar desde el inicio
    };
    
    try {
      const docRef = await addDoc(collection(db, 'pets'), newPetData);
      setActivePetId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error al agregar mascota:", error);
    }
  }, [user]);

  const removePet = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'pets', id));
    } catch (error) {
      console.error("Error eliminando mascota:", error);
    }
  }, []);

  const toggleTarea = useCallback(async (tareaId) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;

    const nuevasTareas = activePetData.tareas.map(t => 
      t.id === tareaId ? { ...t, completada: !t.completada } : t
    );

    try {
      await updateDoc(doc(db, 'pets', activePetId), { tareas: nuevasTareas });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  }, [activePetId, pets]);

  const updateActivePetMedico = useCallback(async (updater) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;

    const nuevoMedico = typeof updater === 'function' 
      ? updater(activePetData.medico || {}) 
      : { ...(activePetData.medico || {}), ...updater };

    try {
      // Ciframos antes de enviar a Firestore
      await updateDoc(doc(db, 'pets', activePetId), { medico: encryptData(nuevoMedico) });
    } catch (error) {
      console.error("Error actualizando perfil médico:", error);
    }
  }, [activePetId, pets]);

  const addInventoryItem = useCallback(async (item) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;

    const newInventory = [...(activePetData.inventario || []), { ...item, id: Date.now().toString() }];
    
    try {
      await updateDoc(doc(db, 'pets', activePetId), { inventario: newInventory });
    } catch (error) {
      console.error("Error agregando insumo:", error);
    }
  }, [activePetId, pets]);

  const removeInventoryItem = useCallback(async (itemId) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;

    const newInventory = (activePetData.inventario || []).filter(item => item.id !== itemId);
    
    try {
      await updateDoc(doc(db, 'pets', activePetId), { inventario: newInventory });
    } catch (error) {
      console.error("Error eliminando insumo:", error);
    }
  }, [activePetId, pets]);

  // ── Derivar datos de la mascota activa ─────────────────────────
  const activePet = useMemo(
    () => pets.find((p) => p.id === activePetId) || null,
    [pets, activePetId]
  );

  const hasPets = pets.length > 0;

  const mascota = activePet
    ? {
        id: activePet.id,
        nombre: activePet.nombre,
        especie: activePet.especie,
        raza: activePet.raza || '',
        edad: activePet.edad || '',
        peso: activePet.peso || 0,
        sexo: activePet.sexo || '',
        microchip: activePet.microchip || '',
        avatar_url: activePet.avatar_url || activePet.foto || '',
        estado: activePet.estado,
        familia,
      }
    : null;

  const eventos = activePet?.eventos || [];
  const items = activePet?.inventario || [];
  const tareas = activePet?.tareas || [];
  const medico = activePet?.medico || {};

  const value = {
    pets,
    activePetId,
    activePet,
    hasPets,
    petsLoading,
    showWizard,
    setShowWizard,
    setActivePet: setActivePetId,
    addPet,
    removePet,
    especieEmojis,
    updateActivePetMedico,
    addInventoryItem,
    removeInventoryItem,
    mascota,
    eventos,
    items,
    tareas,
    toggleTarea,
    medico,
    clinicas: clinicasCercanas,
    familia,
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet debe usarse dentro de un PetProvider');
  }
  return context;
}
