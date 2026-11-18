# VitalMascota Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar VitalMascota sin CVEs altos/medios, sin secretos en el código ni en el historial de Git, con perfil de propietario, layout desktop, modo oscuro, talla+nutrición automática y expediente médico completo.

**Architecture:** Se mantiene Vite + React 18 + Firestore. Se añade `UserContext` para `users/{uid}`, un módulo `src/lib/` para utilidades puras (tallas, nutrición, tokens, háptica), y se tokeniza el CSS para soportar tema oscuro/claro. Nada de TypeScript ni de frameworks nuevos.

**Tech Stack:** React 18.3, Vite 7.3, react-router-dom 7.18, Firebase 13.4, lucide-react 1.75, vite-plugin-pwa 2, crypto-js, qrcode.react, Leaflet.

**Spec:** `docs/superpowers/specs/2026-11-18-vitalmascota-hardening-design.md`

## Global Constraints

- **No hay framework de tests.** AGENTS.md prohíbe inventar scripts. Toda verificación es `npm run build` + `npm audit` + comprobación manual descrita en el paso.
- Comillas simples, punto y coma, indentación de 2 espacios, componentes función.
- Todo texto de UI en español.
- **Cero emojis** en código y UI. Solo iconos de `lucide-react`.
- `VITE_CRYPTO_SECRET` debe conservar el valor actual (`vitalmascota_secure_vault_2026`) o los datos cifrados existentes se pierden.
- Campos nuevos de Firestore son opcionales para no romper documentos existentes.
- Las claves de Firebase viven solo en `.env` / `.env.example`. `ak.env` se ignora.
- No se ejecuta `git push --force`; se entrega el comando al usuario.

## Review Focus

- **Documento de mascota antiguo sin `talla`:** el inventario debe caer a la talla por defecto `mediana` y no romper ni dividir por cero.
- **`gramosTotales` o `porcionDiaria` en 0/negativo:** la división debe devolver `null` y mostrar "sin datos", nunca `Infinity` ni `NaN`.
- **`.env` ausente al compilar:** `firebaseConfig.js` debe fallar con un mensaje legible en vez de inicializar Firebase con `undefined`.
- **Datos médicos guardados en texto plano** (documentos previos o escritura fallida): el lector debe aceptar string cifrado y objeto plano.
- **Token de QR/cuidador caducado o ausente:** la vista pública debe mostrar un estado claro de "enlace expirado" sin filtrar el expediente.

---

## Fase 0 — Seguridad

### Task 1: Actualizar dependencias y overrides

**Files:**
- Modify: `package.json`
- Regenerate: `package-lock.json`

**Interfaces:**
- Produces: árbol de dependencias sin CVEs; `lucide-react` disponible para todas las tareas siguientes.

- [ ] **Step 1: Editar `package.json`**

`dependencies`: `firebase@^13.4.0`, `react-router-dom@^7.18.6`, `lucide-react@^1.75.0`.
`devDependencies`: `vite@^7.3.8`, `@vitejs/plugin-react@^5.2.0`, `vite-plugin-pwa@^2.0.0`, `workbox-build@^7.4.1`.
Añadir bloque `overrides` con exactamente: `serialize-javascript: 7.1.4`, `fast-uri: 3.1.9`, `source-map-js: 1.2.2`, `re2js: 2.10.0`, `minimatch: 11.0.9`, `glob: 14.0.6`, `@grpc/grpc-js: 1.14.7`.

- [ ] **Step 2: Reinstalar y verificar**

Run: `rm -rf node_modules package-lock.json && npm install && npm audit`
Expected: `0 vulnerabilities` (o solo `low`). Si `glob@14` rompe `workbox-build`, bajar el override a `11.1.0` y repetir.

- [ ] **Step 3: Compilar**

Run: `npm run build`
Expected: exit 0, `dist/` generado con `sw.js`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "sec: actualizar dependencias con CVEs y fijar overrides"
```

### Task 2: Mover credenciales a variables de entorno

**Files:**
- Modify: `src/firebaseConfig.js`
- Modify: `src/context/PetContext.jsx:7`
- Create: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `auth` y `db` exportados igual que hoy; `CRYPTO_SECRET` exportado desde `src/lib/cryptoSecret.js`.

- [ ] **Step 1: Reescribir `src/firebaseConfig.js`**

Leer las 7 variables desde `import.meta.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, y opcional `VITE_FIREBASE_MEASUREMENT_ID`). Si falta alguna de las 6 primeras, `throw new Error('Faltan variables de entorno de Firebase. Revisa .env.example')`.

- [ ] **Step 2: Crear `src/lib/cryptoSecret.js`**

`export const CRYPTO_SECRET = import.meta.env.VITE_CRYPTO_SECRET || '';` y un `if (!CRYPTO_SECRET) console.warn(...)`. `PetContext.jsx` importa esa constante y elimina la constante local.

- [ ] **Step 3: Crear `.env.example` con las 7 variables vacías y añadir `ak.env` a `.gitignore`**

- [ ] **Step 4: Crear el `.env` real local**

Copiar los valores de `ak.env` a `.env` (el usuario los tiene; no se commitea).

- [ ] **Step 5: Verificar**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/firebaseConfig.js src/lib/cryptoSecret.js src/context/PetContext.jsx .env.example .gitignore
git commit -m "sec: mover credenciales de Firebase y secreto AES a variables de entorno"
```

### Task 3: Purgar secretos del historial de Git

**Files:** historial completo (sin cambios de working tree)

- [ ] **Step 1: Verificar que el working tree está limpio y respaldar**

Run: `git status --short` (vacío) y `git branch backup-pre-purge main`.

- [ ] **Step 2: Reescribir con tree-filter**

Crear `/tmp/clean_firebase_config.js` con la versión basada en `import.meta.env` del Task 2. Ejecutar:

```bash
git filter-branch -f --tree-filter 'if [ -f src/firebaseConfig.js ]; then cp /tmp/clean_firebase_config.js src/firebaseConfig.js; fi' -- --all
```

- [ ] **Step 3: Comprobar que no queda ninguna clave**

Run: `git log -p --all | grep -c 'AIzaSy'`
Expected: `0`. También `git log --oneline` debe seguir mostrando 3 commits (hashes nuevos).

- [ ] **Step 4: Limpiar referencias y objetos**

```bash
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

- [ ] **Step 5: Entregar instrucciones al usuario** (no ejecutar el push):

`git push --force-with-lease origin main` + rotar en Firebase/Google Cloud: API key de la app web, `measurementId` si se usa Analytics, y el secreto AES (solo tras re-cifrar los datos con el nuevo valor).

### Task 4: Erradicar emojis y adoptar lucide-react

**Files:** todos los `.jsx`/`.js` con emojis (26 archivos), `src/data/mockData.js`

**Interfaces:**
- Produces: componente `src/components/ui/Icon.jsx` que envuelve `lucide-react` con `size`, `strokeWidth`, `aria-hidden`.

- [ ] **Step 1: Crear `Icon.jsx`** con firma `({ as: LucideIcon, size = 20, label, ...rest })`; si `label` existe, `aria-label` y `role="img"`, si no `aria-hidden="true"`.

- [ ] **Step 2: Sustituir emojis archivo por archivo.** Mapeo: casa→`Home`, estetoscopio→`Stethoscope`, sirena→`Siren`, huella→`PawPrint`, perro→`Dog`, gato→`Cat`, ave→`Bird`, reptil→`Turtle`, alerta→`AlertTriangle`, check→`CheckCircle2`, cruz→`X`, comida→`Utensils`, tarea→`ListChecks`, peso→`Scale`, vacuna→`Syringe`, alergia→`ShieldAlert`, cirugía→`Scissors`, calendario→`CalendarDays`, teléfono→`Phone`, QR→`QrCode`, compartir→`Share2`, usuario→`User`, oscuro/claro→`Moon`/`Sun`, reloj→`Clock`, basura→`Trash2`, más→`Plus`.

- [ ] **Step 3: Verificar que no quedan emojis**

Run: `grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]' src --include='*.jsx' --include='*.js'`
Expected: sin salida (o solo caracteres tipográficos justificados como `→`, que se sustituyen igual).

- [ ] **Step 4: Compilar y commit**

Run: `npm run build` → exit 0. `git commit -m "refactor: sustituir emojis por iconos SVG de lucide-react"`

---

## Fase 1 — Perfil de propietario

### Task 5: UserContext con `users/{uid}`

**Files:**
- Create: `src/context/UserContext.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Produces: `useUser()` → `{ profile, profileLoading, updateProfile(patch), logoutAndClear() }`. `profile` shape: `{ nombre, telefono, email, familyId, role: 'owner', familyMembers: [] }`.

- [ ] **Step 1: Implementar `UserContext`**

`onSnapshot(doc(db, 'users', uid))`; si no existe, `setDoc` con `{ nombre: '', telefono: '', email, familyId: uid, role: 'owner', familyMembers: [] }`. `updateProfile` hace `setDoc(..., { merge: true })`. `logoutAndClear` borra `localStorage` con prefijo `vitalmascota_` y llama a `signOut`.

- [ ] **Step 2: Envolver en `main.jsx`** dentro de `AuthProvider` y fuera de `PetProvider`.

- [ ] **Step 3: Verificar build + commit**

`npm run build`; `git commit -m "feat: contexto de usuario con coleccion users/{uid}"`

### Task 6: Página de Perfil

**Files:**
- Create: `src/pages/Profile.jsx`, `src/styles/profile.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useUser()`, `useAuth()`.
- Produces: ruta `/perfil` protegida.

- [ ] **Step 1: Crear `Profile.jsx`** con tres campos: nombre (editable), email (`readOnly`, de `useAuth().user.email`), teléfono (editable, `inputMode="tel"`, validación `^[0-9+\s-]{7,15}$`). Botón "Guardar cambios" que llama `updateProfile`. Botón "Cerrar sesión" con `logoutAndClear()` y `navigate('/login')`.

- [ ] **Step 2: Añadir ruta protegida `/perfil`** en `App.jsx`.

- [ ] **Step 3: Verificar y commit** — `npm run build`; `git commit -m "feat: pagina de perfil del propietario"`

### Task 7: Navbar con acceso a Perfil y logout

**Files:** Modify `src/components/layout/Navbar.jsx`, `src/styles/navbar.css`

- [ ] **Step 1:** Añadir `NavLink` a `/perfil` con icono `User`. Mantener 4 items en mobile (grid de 4 columnas).
- [ ] **Step 2:** `npm run build`; `git commit -m "feat: acceso a perfil desde el navbar"`

### Task 8: Teléfono del perfil en el cartel de extravío

**Files:** Modify `src/components/dashboard/MissingPetPoster.jsx`

**Interfaces:** Consumes `useUser()`.

- [ ] **Step 1:** Inicializar el campo teléfono con `profile.telefono` cuando cambie, manteniéndolo editable.
- [ ] **Step 2:** `npm run build`; `git commit -m "feat: autocompletar telefono del cartel desde el perfil"`

---

## Fase 2 — Heurísticas y responsive

### Task 9: Tokens de diseño y modo oscuro por defecto

**Files:** Modify `src/styles/global.css`, `src/main.jsx`

**Interfaces:** Produces `useTheme()` en `src/hooks/useTheme.js` → `{ theme, toggleTheme }`, con `document.documentElement.dataset.theme`.

- [ ] **Step 1:** Definir en `:root` tokens: `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--border`, `--primary`, `--success`, `--warning`, `--danger`. Valores oscuros por defecto; bloque `:root[data-theme='light']` con la paleta clara.
- [ ] **Step 2:** Reemplazar colores hardcodeados de `global.css` y de los CSS modulares por `var(--...)`.
- [ ] **Step 3:** `useTheme` lee `localStorage.vitalmascota_theme` (default `dark`) y alterna.
- [ ] **Step 4:** Botón de alternancia `Moon`/`Sun` en Perfil y Navbar.
- [ ] **Step 5:** Build; comprobar contraste ≥ 4.5:1 en texto principal. Commit `feat: tema oscuro por defecto con tokens de diseno`.

### Task 10: Grid de escritorio en DashboardHome

**Files:** Modify `src/pages/DashboardHome.jsx`, `src/styles/global.css`

- [ ] **Step 1:** Envolver el contenido en `<div className="dashboard-grid">` con zonas: `pet` (PetSelector + FunFactBubble + PetStatusCard), `alerts` (EventFeed), `inventory` (InventoryModule), `tasks` (TaskList).
- [ ] **Step 2:** `.dashboard-grid { display: grid; gap: 24px }`; en `@media (min-width: 1024px)` → `grid-template-columns: 1.2fr 1fr; grid-template-areas: "pet inventory" "alerts tasks"`. En mobile una sola columna, orden `pet, alerts, inventory, tasks`.
- [ ] **Step 3:** Build + revisión visual a 1440px y 390px. Commit `feat: grid responsive de escritorio en el panel`.

### Task 11: Skeletons

**Files:** Create `src/components/ui/Skeleton.jsx`, `src/styles/skeleton.css`; Modify `DashboardHome.jsx`, `MedicalDashboard.jsx`

**Interfaces:** Produces `<Skeleton width height radius />` y `<SkeletonCard />`.

- [ ] **Step 1:** Implementar con animación `@keyframes shimmer` y `prefers-reduced-motion` respetado.
- [ ] **Step 2:** Sustituir `LoadingSpinner` en `petsLoading` por tres `SkeletonCard`.
- [ ] **Step 3:** Build + commit `feat: carga esqueletica en dashboard y expediente`.

### Task 12: Ruta 404 real

**Files:** Create `src/pages/NotFound.jsx`; Modify `src/App.jsx`

- [ ] **Step 1:** Página con icono `Compass`, texto "No encontramos esta página", botón "Volver al inicio" que navega a `/dashboard` si hay usuario o `/login` si no.
- [ ] **Step 2:** Reemplazar el comodín `*` manteniendo la redirección para `/` explícita. Build + commit `feat: pantalla 404 amigable`.

### Task 13: Háptica y confirmación al guardar

**Files:** Create `src/lib/haptics.js`; Modify `MedicalDashboard.jsx`, `InventoryModule.jsx`

**Interfaces:** Produces `vibrate(pattern = 15)` que no falla si `navigator.vibrate` no existe.

- [ ] **Step 1:** Implementar `vibrate` con try/catch y guarda `typeof navigator !== 'undefined'`.
- [ ] **Step 2:** Llamar en cada guardado exitoso junto a un toast/check animado (`CheckCircle2`).
- [ ] **Step 3:** Build + commit `feat: retroalimentacion haptica y confirmacion al guardar`.

### Task 14: Auditoría de salidas en modales y wizard

**Files:** Review `Modal.jsx`, `QREmergencyModal.jsx`, `PetSitterModal.jsx`, `MissingPetPoster.jsx`, `SitterView.jsx`, `PublicEmergencyProfile.jsx`

- [ ] **Step 1:** Verificar que cada uno use `Modal` o tenga botón X visible; añadir "Volver al panel" donde falte. Confirmar Escape y cierre por overlay.
- [ ] **Step 2:** Confirmar que `showWizard` nunca se pone en `true` automáticamente (grep `setShowWizard(true)`); solo debe aparecer desde el botón del estado vacío o el navbar.
- [ ] **Step 3:** Build + commit `fix: garantizar salidas visibles en modales y subvistas`.

---

## Fase 3 — Talla y nutrición

### Task 15: Catálogo de tallas

**Files:** Create `src/lib/pets.js`; Modify `src/context/PetContext.jsx`

**Interfaces:**
- Produces: `TALLAS = { pequena: { label: 'Pequeña', min: 1, max: 10, porcionDiaria: 120 }, mediana: { label: 'Mediana', min: 11, max: 25, porcionDiaria: 280 }, grande: { label: 'Grande', min: 26, max: 45, porcionDiaria: 450 }, gigante: { label: 'Gigante', min: 46, max: null, porcionDiaria: 650 } }`; `getTalla(key)` devuelve `TALLAS.mediana` si la clave falta; `getPorcionDiaria(tallaKey, override)`.

- [ ] **Step 1:** Crear `src/lib/pets.js` con lo anterior y `talla` expuesto en `mascota` del contexto.
- [ ] **Step 2:** Build + commit `feat: catalogo de tallas estandarizadas`.

### Task 16: Selector de talla en onboarding

**Files:** Modify `src/components/onboarding/OnboardingWizard.jsx`, `src/styles/onboarding.css`

- [ ] **Step 1:** Añadir campo obligatorio `talla` con las 4 opciones y el rango kg visible. Validación impide continuar sin selección.
- [ ] **Step 2:** Verificar con una mascota nueva que `talla` llega a Firestore. Build + commit `feat: talla obligatoria en el registro de mascotas`.

### Task 17: Burbuja de datos curiosos

**Files:** Create `src/components/dashboard/FunFactBubble.jsx`, `src/data/petFacts.js`, `src/styles/fun-fact.css`; Modify `DashboardHome.jsx`

**Interfaces:** Produces `getFunFact(especie, tallaKey)` → `{ titulo, texto, tip }`.

- [ ] **Step 1:** Escribir 16 entradas (4 especies × 4 tallas) con un dato de bienestar y un consejo de vacunación. Sin emojis.
- [ ] **Step 2:** Componente que use `icono` de lucide según especie y rote el dato con un botón "Otro dato".
- [ ] **Step 3:** Insertar en la zona `pet` del grid. Build + commit `feat: burbuja de datos curiosos por especie y talla`.

### Task 18: Inventario kg→g con ración y semáforo

**Files:** Modify `src/components/dashboard/InventoryModule.jsx`, `src/lib/pets.js`

**Interfaces:** Consumes `getPorcionDiaria`. Produces helper `calcularDiasRestantes(gramosTotales, porcionDiaria)` → `number | null`.

- [ ] **Step 1:** Implementar `calcularDiasRestantes`: devuelve `null` si `porcionDiaria <= 0` o `gramosTotales` no finito; si no `Math.floor(gramosTotales / porcionDiaria)`.
- [ ] **Step 2:** Formulario pide kg (`step="0.1"`, `min="0.1"`), muestra "= 3500 g" en vivo, guarda `gramosTotales` y `porcionDiaria` (auto desde talla, editable).
- [ ] **Step 3:** Semáforo: verde > 7, amarillo 3–7, rojo < 3; `null` → gris "Sin datos".
- [ ] **Step 4:** Build + commit `feat: inventario en kilogramos con racion automatica y semaforo`.

### Task 19: Asignación de tareas

**Files:** Modify `src/components/dashboard/TaskList.jsx`, `src/context/PetContext.jsx`

**Interfaces:** Produces `addTarea({ texto, asignadoA })` en el contexto.

- [ ] **Step 1:** Campo de texto + selector de responsable (por ahora "Yo" y texto libre), persistido en `tareas` del documento de la mascota.
- [ ] **Step 2:** Mostrar `asignadoA` en cada tarea. Build + commit `feat: asignacion de tareas diarias`.

---

## Fase 4 — Clínico, QR y offline

### Task 20: Detalles clínicos obligatorios

**Files:** Modify `src/components/medical/VaccineList.jsx`, `src/components/medical/AllergyList.jsx`, `src/pages/MedicalDashboard.jsx`

- [ ] **Step 1:** Añadir `detalles` (`<textarea required>`) a vacuna y alergia; en cirugías, campos `fecha` + `detalles` obligatorios.
- [ ] **Step 2:** Migración tolerante: `item.detalles || ''`. Build + commit `feat: contexto clinico obligatorio en registros medicos`.

### Task 21: Semáforos de salud

**Files:** Create `src/lib/health.js`; Modify `VaccineList.jsx`, `MedicalDashboard.jsx`

**Interfaces:** Produces `estadoVencimiento(fechaISO)` → `'ok' | 'proximo' | 'vencido' | 'sin-fecha'` (proximo = ≤30 días).

- [ ] **Step 1:** Implementar con `Date` local y tolerancia a fechas inválidas → `'sin-fecha'`.
- [ ] **Step 2:** Aplicar clase `status-ok|status-warning|status-danger` en tarjetas. Build + commit `feat: semaforos de salud en tarjetas medicas`.

### Task 22: Bitácora de comportamiento

**Files:** Create `src/components/medical/BehaviorLog.jsx`; Modify `MedicalDashboard.jsx`

**Interfaces:** Usa `medico.bitacora` (`[{ id, fecha, nota }]`).

- [ ] **Step 1:** Formulario fecha + nota, lista ordenada descendente, borrado por item.
- [ ] **Step 2:** Build + commit `feat: bitacora de comportamiento`.

### Task 23: Curva de peso con rango saludable

**Files:** Modify `src/components/medical/WeightChart.jsx`

- [ ] **Step 1:** Calcular rango desde `TALLAS[talla]` y pintar `ReferenceArea` verde; aviso si el último peso sale del rango.
- [ ] **Step 2:** Build + commit `feat: rango saludable de peso por talla`.

### Task 24: Etiquetas de rescatista

**Files:** Modify `src/pages/MedicalDashboard.jsx`, `src/components/dashboard/PetStatusCard.jsx`

- [ ] **Step 1:** Selector múltiple con `En tratamiento`, `Listo para adopción`, `Mascota de apoyo` guardado en `etiquetas: []`.
- [ ] **Step 2:** Build + commit `feat: etiquetas de rescate en el perfil de la mascota`.

### Task 25: QR con token y expiración

**Files:** Create `src/lib/shareTokens.js`; Modify `QREmergencyModal.jsx`, `PublicEmergencyProfile.jsx`, `SitterView.jsx`

**Interfaces:** Produces `createToken(petId, horas)` → `{ token, expiraEn }` (aleatorio con `crypto.getRandomValues`, guardado en `pets/{id}.tokens`); `isTokenValid(tokens, token)`.

- [ ] **Step 1:** Implementar tokens y selector 24h/48h en el modal.
- [ ] **Step 2:** Las vistas públicas leen `?token=` y muestran "Enlace expirado" si no valida.
- [ ] **Step 3:** Build + commit `feat: QR y enlaces de cuidador con token temporal`.

### Task 26: Revocación de accesos de cuidador

**Files:** Modify `src/components/dashboard/PetSitterModal.jsx`

- [ ] **Step 1:** Listar tokens activos con fecha de expiración y botón "Revocar" que los elimina del documento.
- [ ] **Step 2:** Build + commit `feat: revocar accesos de cuidadores`.

### Task 27: Overpass por POST

**Files:** Modify `src/pages/EmergencyMap.jsx`

- [ ] **Step 1:** Cambiar la consulta a `fetch(POST, body: 'data=' + encodeURIComponent(query))` con `AbortController` y timeout de 15s; estados `loading | error | ok`.
- [ ] **Step 2:** Build + commit `fix: consulta Overpass por POST con cancelacion`.

### Task 28: Caché offline del expediente

**Files:** Modify `vite.config.js`

- [ ] **Step 1:** Añadir `runtimeCaching` para `firestore.googleapis.com` (`NetworkFirst`, 24h, 50 entradas) y `navigateFallback: '/index.html'` con `navigateFallbackDenylist` para `/emergencia` y `/cuidador` (que sí deben resolverse desde el SW cacheando la ruta).
- [ ] **Step 2:** Build; verificar que `dist/sw.js` incluye `firestore` en las rutas. Commit `feat: cache offline del expediente medico`.

### Task 29: Respaldo PDF del expediente

**Files:** Create `src/styles/print.css`; Modify `MedicalDashboard.jsx`

- [ ] **Step 1:** Botón "Descargar respaldo PDF" que aplique `document.body.classList.add('printing')` y llame `window.print()`; `print.css` oculta navbar, botones y modales dejando solo el expediente.
- [ ] **Step 2:** Build + commit `feat: respaldo imprimible del expediente`.

---

## Self-Review

- **Cobertura del spec:** seguridad (Task 1-4), perfil (5-8), responsive/Nielsen (9-14), talla/nutrición (15-19), clínico/QR/offline (20-29). Todas las 4 fases quedan cubiertas.
- **Consistencia de nombres:** `TALLAS`, `getTalla`, `getPorcionDiaria`, `calcularDiasRestantes` se definen en Task 15/18 y se consumen con esos nombres exactos. `useUser` se define en Task 5 y se usa en 6-8. `createToken`/`isTokenValid` en Task 25 y se usan en 26.
- **Review Focus:** documento sin talla → Task 15 (`getTalla` fallback); división por cero → Task 18 Step 1; `.env` ausente → Task 2 Step 1; médico en texto plano → ya cubierto por `typeof data.medico === 'string'` en `PetContext` (se mantiene); token caducado → Task 25 Step 2.
- **Simplificación declarada:** el "PDF protegido" se implementa como impresión a PDF del navegador; cifrar un PDF requeriría una librería nueva no justificada.
