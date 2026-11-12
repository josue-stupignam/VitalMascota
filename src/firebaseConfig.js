// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase (credenciales reales proporcionadas)
const firebaseConfig = {
    apiKey: "AIzaSyCRDoqa_CzciDiOPQPucIR4UfcWlD1rMAk",
    authDomain: "vitalmascota-30464.firebaseapp.com",
    projectId: "vitalmascota-30464",
    storageBucket: "vitalmascota-30464.firebasestorage.app",
    messagingSenderId: "479067987349",
    appId: "1:479067987349:web:ee374549da1332f0046a9c",
    measurementId: "G-0DZK6FM17L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios requeridos
export const auth = getAuth(app);
export const db = getFirestore(app);
