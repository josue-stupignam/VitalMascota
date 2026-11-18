// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requeridas = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const faltantes = requeridas.filter((clave) => !env[clave]);

export const firebaseConfigError =
  faltantes.length > 0
    ? `Faltan variables de entorno de Firebase: ${faltantes.join(', ')}.`
    : '';

export const firebaseConfigFaltantes = faltantes;

let app = null;
let authInstance = null;
let dbInstance = null;

if (!firebaseConfigError) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    // Caché persistente en IndexedDB: el expediente médico sigue disponible sin conexión
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (error) {
    console.error('No se pudo inicializar Firebase:', error);
  }
}

if (firebaseConfigError) {
  console.error(firebaseConfigError, 'Revisa .env.example y define las variables en tu hosting.');
}

export const auth = authInstance;
export const db = dbInstance;
