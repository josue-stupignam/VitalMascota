import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generarCodigo() {
  let codigo = '';
  for (let i = 0; i < 6; i += 1) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

async function generarCodigoUnico() {
  for (let intento = 0; intento < 12; intento += 1) {
    const codigo = generarCodigo();
    const existentes = await getDocs(
      query(collection(db, 'families'), where('inviteCode', '==', codigo))
    );
    if (existentes.empty) return codigo;
  }
  throw new Error('No se pudo generar un código de invitación. Inténtalo de nuevo.');
}

async function compartirMascotasConFamilia(uid, familyId) {
  const propias = await getDocs(query(collection(db, 'pets'), where('userId', '==', uid)));
  await Promise.all(
    propias.docs.map((documento) => updateDoc(documento.ref, { familyId }))
  );
}

async function desvincularMascotas(uid) {
  const propias = await getDocs(query(collection(db, 'pets'), where('userId', '==', uid)));
  await Promise.all(
    propias.docs.map((documento) => updateDoc(documento.ref, { familyId: uid }))
  );
}

export async function cargarFamilia(familyId) {
  if (!familyId) return null;
  const snapshot = await getDoc(doc(db, 'families', familyId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function crearFamilia({ uid, nombre, email }) {
  const inviteCode = await generarCodigoUnico();
  const familyRef = doc(collection(db, 'families'));
  const ahora = new Date().toISOString();
  const miembro = {
    uid,
    name: nombre || email || 'Administrador',
    email: email || '',
    role: 'admin',
    joinedAt: ahora,
  };

  await setDoc(familyRef, {
    adminId: uid,
    inviteCode,
    members: [miembro],
    memberIds: [uid],
    createdAt: ahora,
  });

  await updateDoc(doc(db, 'users', uid), { familyId: familyRef.id });
  await compartirMascotasConFamilia(uid, familyRef.id);

  return { id: familyRef.id, inviteCode };
}

export async function unirseAFamilia({ uid, nombre, email, codigo }) {
  const limpio = String(codigo || '').trim().toUpperCase();
  if (!limpio) throw new Error('Escribe el código de invitación.');

  const encontradas = await getDocs(
    query(collection(db, 'families'), where('inviteCode', '==', limpio))
  );
  if (encontradas.empty) throw new Error('El código de invitación no existe.');

  const familyDoc = encontradas.docs[0];
  const familia = familyDoc.data();
  const miembros = familia.members || [];
  const yaPertenece = (familia.memberIds || []).includes(uid) || miembros.some((m) => m.uid === uid);
  if (yaPertenece) throw new Error('Ya perteneces a esta familia.');

  const nuevoMiembro = {
    uid,
    name: nombre || email || 'Integrante',
    email: email || '',
    role: 'member',
    joinedAt: new Date().toISOString(),
  };

  await updateDoc(familyDoc.ref, {
    members: [...miembros, nuevoMiembro],
    memberIds: [...(familia.memberIds || []), uid],
  });
  await updateDoc(doc(db, 'users', uid), { familyId: familyDoc.id });
  await compartirMascotasConFamilia(uid, familyDoc.id);

  return { id: familyDoc.id, inviteCode: familia.inviteCode };
}

export async function regenerarCodigo(familyId) {
  const inviteCode = await generarCodigoUnico();
  await updateDoc(doc(db, 'families', familyId), { inviteCode });
  return inviteCode;
}

async function quitarMiembro(familyId, memberUid) {
  const ref = doc(db, 'families', familyId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('La familia ya no existe.');
  const familia = snapshot.data();
  const miembros = (familia.members || []).filter((m) => m.uid !== memberUid);

  await updateDoc(ref, {
    members: miembros,
    memberIds: miembros.map((m) => m.uid),
  });
  await updateDoc(doc(db, 'users', memberUid), { familyId: null });
  await desvincularMascotas(memberUid);
}

export async function expulsarMiembro(familyId, memberUid) {
  await quitarMiembro(familyId, memberUid);
}

export async function salirDeFamilia({ familyId, uid }) {
  const ref = doc(db, 'families', familyId);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const familia = snapshot.data();
    const miembros = familia.members || [];
    const restantes = miembros.filter((m) => m.uid !== uid);

    if (restantes.length === 0) {
      await deleteDoc(ref);
    } else if (familia.adminId === uid) {
      const nuevoAdmin = restantes[0];
      const actualizados = restantes.map((m) =>
        m.uid === nuevoAdmin.uid ? { ...m, role: 'admin' } : m
      );
      await updateDoc(ref, {
        adminId: nuevoAdmin.uid,
        members: actualizados,
        memberIds: actualizados.map((m) => m.uid),
      });
    } else {
      await updateDoc(ref, {
        members: restantes,
        memberIds: restantes.map((m) => m.uid),
      });
    }
  }

  await updateDoc(doc(db, 'users', uid), { familyId: null });
  await desvincularMascotas(uid);
}
