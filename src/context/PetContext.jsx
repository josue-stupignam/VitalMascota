import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { clinicasCercanas } from '../data/mockData';
import CryptoJS from 'crypto-js';
import { CRYPTO_SECRET } from '../lib/cryptoSecret';
import { TALLAS } from '../lib/pets';
import { getTodayLocalDate } from '../lib/fechas';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), CRYPTO_SECRET).toString();
};

const decryptData = (ciphertext) => {
  if (!ciphertext) return {};
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_SECRET);
    const texto = bytes.toString(CryptoJS.enc.Utf8);
    if (!texto) return null;
    const datos = JSON.parse(texto);
    return datos && typeof datos === 'object' ? datos : null;
  } catch (e) {
    console.error('No se pudo descifrar el expediente médico:', e);
    return null;
  }
};

const PetContext = createContext();

export function PetProvider({ children }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const familiaEfectiva =
    profile?.familyId && user && profile.familyId !== user.uid ? profile.familyId : null;

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
  const [hoyLocal, setHoyLocal] = useState(getTodayLocalDate);

  // ── Firestore: Sincronización en tiempo real con caché en memoria ─────────
  useEffect(() => {
    if (user) {
      const cached = getInitialCache();
      if (cached.length > 0) {
        setPets(cached);
        if (!activePetId) setActivePetId(cached[0].id);
        setPetsLoading(false);
      }

      const mapear = (snapshot) =>
        snapshot.docs.map((documento) => {
          const data = documento.data();
          const medicoDescifrado = data.medico
            ? typeof data.medico === 'string'
              ? decryptData(data.medico)
              : data.medico
            : {};
          return {
            id: documento.id,
            ...data,
            medico: medicoDescifrado || {},
            medicoError: Boolean(data.medico) && medicoDescifrado === null,
          };
        });

      let propios = [];
      let compartidos = [];
      let primerEvento = true;

      const emitir = () => {
        const mapa = new Map();
        [...propios, ...compartidos].forEach((pet) => mapa.set(pet.id, pet));
        const petsData = [...mapa.values()];

        setPets(petsData);
        try {
          localStorage.setItem(`vitalmascota_pets_cache_${user.uid}`, JSON.stringify(petsData));
        } catch (e) {
          // Si el storage está lleno o restringido
        }

        setActivePetId((prev) => {
          if (petsData.length === 0) return null;
          return petsData.some((pet) => pet.id === prev) ? prev : petsData[0].id;
        });

        if (primerEvento) {
          primerEvento = false;
          setPetsLoading(false);
        }
      };

      const alFallar = (error) => {
        console.error('Error obteniendo mascotas:', error);
        setPetsLoading(false);
      };

      const qPropios = query(collection(db, 'pets'), where('userId', '==', user.uid));
      const unsubscribePropios = onSnapshot(
        qPropios,
        (snapshot) => {
          propios = mapear(snapshot);
          emitir();
        },
        alFallar
      );

      let unsubscribeFamilia = () => {};
      if (familiaEfectiva) {
        const qFamilia = query(
          collection(db, 'pets'),
          where('familyId', '==', familiaEfectiva)
        );
        unsubscribeFamilia = onSnapshot(
          qFamilia,
          (snapshot) => {
            compartidos = mapear(snapshot);
            emitir();
          },
          alFallar
        );
      }

      return () => {
        unsubscribePropios();
        unsubscribeFamilia();
      };
    } else {
      setPets([]);
      setActivePetId(null);
      setPetsLoading(false);
    }
  }, [user, familiaEfectiva]);

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
      familyId: familiaEfectiva || user.uid,
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
      throw new Error(
        'No se pudo guardar la mascota. Revisa tu conexión e inténtalo de nuevo (si la foto es muy grande, quítala).'
      );
    }
  }, [user, familiaEfectiva]);

  const removePet = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'pets', id));
    } catch (error) {
      console.error("Error eliminando mascota:", error);
    }
  }, []);

  useEffect(() => {
    const refrescarFecha = () => setHoyLocal(getTodayLocalDate());
    const alCambiarVisibilidad = () => {
      if (!document.hidden) refrescarFecha();
    };
    const intervalo = setInterval(refrescarFecha, 60000);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('focus', alCambiarVisibilidad);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('focus', alCambiarVisibilidad);
    };
  }, []);

  const toggleTarea = useCallback(async (tareaId) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;

    const hoy = getTodayLocalDate();
    const nuevasTareas = (activePetData.tareas || []).map(t => {
      if (t.id !== tareaId) return t;
      const completadaHoy = t.lastCompletedDate === hoy;
      return {
        ...t,
        lastCompletedDate: completadaHoy ? null : hoy,
        completada: !completadaHoy,
      };
    });

    try {
      await updateDoc(doc(db, 'pets', activePetId), { tareas: nuevasTareas });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  }, [activePetId, pets]);

  // Al cambiar el día, las rutinas vuelven a "por hacer" también en Firestore.
  useEffect(() => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;
    const lista = activePetData.tareas || [];
    const requiereReinicio = lista.some(
      (t) => t.completada && t.lastCompletedDate !== hoyLocal
    );
    if (!requiereReinicio) return;

    const reiniciadas = lista.map((t) => ({
      ...t,
      completada: t.lastCompletedDate === hoyLocal,
    }));

    updateDoc(doc(db, 'pets', activePetId), { tareas: reiniciadas }).catch((error) => {
      console.error('Error al reiniciar rutinas diarias:', error);
    });
  }, [activePetId, hoyLocal, pets]);

  const updateActivePetMedico = useCallback(async (updater) => {
    if (!activePetId) return;
    const activePetData = pets.find(p => p.id === activePetId);
    if (!activePetData) return;
    if (activePetData.medicoError) {
      throw new Error('No se pudo descifrar el expediente. Recarga la página antes de guardar para no perder datos.');
    }

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

  const updatePet = useCallback(async (patch) => {
    if (!activePetId) return;
    try {
      await updateDoc(doc(db, 'pets', activePetId), patch);
    } catch (error) {
      console.error('Error actualizando la mascota:', error);
    }
  }, [activePetId]);

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
        talla: activePet.talla || 'mediana',
        sexo: activePet.sexo || '',
        microchip: activePet.microchip || '',
        avatar_url: activePet.avatar_url || activePet.foto || '',
        estado: activePet.estado,
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
    TALLAS,
    updatePet,
    hoyLocal,
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
