# Seguridad y despliegue — VitalMascota

Este documento recoge el estado del endurecimiento (hardening) aplicado, los riesgos que
quedan abiertos a propósito, y los pasos manuales que debe ejecutar una persona con acceso a
Firebase y al repositorio.

## 1. Qué se corrigió

- Dependencias con CVE actualizadas y `overrides` fijados: `npm audit` reporta **0
  vulnerabilidades** (vite, react-router, firebase/@grpc, serialize-javascript, source-map-js,
  re2js, minimatch, fast-uri, source-map, glob).
- Credenciales de Firebase y secreto AES fuera del código: se leen de `VITE_FIREBASE_*` y
  `VITE_CRYPTO_SECRET` (ver `.env.example`). `.env` está ignorado por Git.
- Historial de Git purgado: el commit original que contenía la API key se reescribió en local.
  `git log -p main | grep -c AIzaSy` devuelve 0.
- Accesos de emergencia y de cuidador con token propio, caducidad de 24/48 h y revocación.
  El cuidador ya no descifra el expediente clínico: recibe solo rutinas, ración y teléfonos.
- Si el expediente no se puede descifrar, la app avisa y **bloquea la escritura** en lugar de
  sobrescribir datos con un objeto vacío.
- Inventario: kg → g, ración diaria por talla con ajuste manual, días restantes que descuentan
  el tiempo transcurrido y semáforo.
- Consulta Overpass por POST con `AbortController`, timeout de 15 s y lista de respaldo no
  bloqueante; el aviso de ubicación aproximada ya no se borra.
- Caché offline del expediente y de la app con IndexedDB + service worker.

## 2. Riesgos aceptados (conscientes)

1. **El token de acceso vive en el documento `pets/{id}`**, que la ficha pública lee sin
   autenticación. La validación es de cliente: quien pueda leer el documento puede leer el
   token y, además, atrasar el reloj del dispositivo para revivir un enlace caducado.
   *Cierre definitivo:* mover las concesiones a una colección `accesos/{token}` con reglas
   `allow get: if true; allow list: if false` y expiración validada en servidor, o a una Cloud
   Function. Requiere desplegar reglas y una migración de datos; fuera del alcance de la app
   cliente.
2. **`VITE_CRYPTO_SECRET` viaja en el bundle**. Cifra en reposo frente a una lectura casual de
   Firestore, pero no es confidencialidad real: cualquiera con el bundle y el documento puede
   descifrarlo. *Cierre definitivo:* cifrado en servidor o reglas de Firestore estrictas.
3. **La caché local guarda el expediente ya descifrado** en `localStorage` (necesario para la
   consulta offline del QR). En un dispositivo compartido o perdido, el dato es legible.
   *Mitigación actual:* el logout borra todas las claves `vitalmascota_*`.
4. **Sin variables de entorno la app no arranca** (`firebaseConfig` lanza un error claro en
   consola). Es intencional: fallar ruidosamente es preferible a arrancar sin backend.
5. **Reglas de Firestore no versionadas.** El repositorio no contiene `firestore.rules`; el
   acceso público actual exige que `pets` sea legible sin sesión. Cualquier endurecimiento
   real empieza por versionar y desplegar reglas.

## 3. Rotación obligatoria de credenciales

La clave estuvo en el historial de Git, así que debe considerarse comprometida aunque el
historial se haya reescrito.

1. Google Cloud Console → APIs y servicios → Credenciales → clave de API del proyecto de
   Firebase: **crear una nueva, restringirla por HTTP referrer/API y borrar la anterior**.
2. Firebase Console → Configuración del proyecto → Tus apps: el `measurementId`
   (`G-...`) también quedó expuesto; rota el flujo de Analytics si te importa.
3. Genera un `VITE_CRYPTO_SECRET` nuevo y **solo cámbialo cuando decidas migrar** los
   expedientes: al cambiarlo, los documentos ya cifrados dejan de leerse (la app avisará y
   bloqueará la escritura). Plan de migración: descifrar con la clave vieja, volver a cifrar
   con la nueva.
4. Actualiza `.env` local y las variables de entorno del hosting (Vercel) con los valores
   nuevos.

## 4. Publicación del historial reescrito

El remoto sigue con el historial antiguo. Cuando estés listo, desde la raíz del repo:

```bash
git push --force-with-lease origin main
```

Después, avisa a cualquier colaborador de que debe re-clonar o hacer `git fetch` y
`git reset --hard origin/main`: su copia local conserva los commits viejos con el secreto.

## 5. Reglas de Firestore objetivo

Punto de partida para cuando se migren los accesos públicos (no desplegar tal cual sin migrar
primero la lectura de la ficha de emergencia):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /pets/{petId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Acceso público: solo a través de la concesión, nunca al documento completo.
      allow get: if exists(/databases/$(database)/documents/accesos/$(petId));
    }
    match /accesos/{token} {
      allow get: if true;
      allow list: if false;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Verificación

```bash
npm audit          # debe decir: found 0 vulnerabilities
npm run build      # debe terminar en verde
git log -p main | grep -c AIzaSy   # debe imprimir 0
```

## 7. Despliegue en Vercel

Síntomas de una configuración incompleta: pantalla vacía o la tarjeta "Configuración
incompleta" con la lista de variables que faltan.

1. Vercel → proyecto → **Settings → Environment Variables**. Crea estas variables en
   *Production*, *Preview* y *Development* (copia los valores de tu `.env` local):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (opcional)
   - `VITE_CRYPTO_SECRET` (obligatoria para leer expedientes ya cifrados)

   Todas deben tener visibilidad **config**, no **secret**: Vercel rechaza
   `visibility: secret` en variables con prefijo público (`VITE_`), porque se incrustan en el
   bundle. Marca las ocho como `config`.
2. Settings → **General → Node.js Version**: 22.x (Vite 7 exige Node 20.19+ / 22.12+;
   el repo fija `"engines": { "node": ">=22.12.0" }` y `.nvmrc`).
3. **Deployments → Redeploy** sin caché de build. Las variables `VITE_*` se incrustan al
   compilar: si las añades después de un build, el despliegue anterior no las verá.
4. Comprueba en el navegador la consola: si sigue vacío, revisa el log de build de Vercel;
   un fallo de compilación no publica la versión anterior automáticamente.
