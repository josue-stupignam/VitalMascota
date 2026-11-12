# AGENTS.md

## Project

VitalMascota: Spanish-language, mobile-first React 18 + Vite 5 PWA for pet health management. Firebase Auth + Firestore backend. Plain JavaScript/JSX, plain CSS, no TypeScript.

## Commands

- `npm install` — uses `package-lock.json` (lockfile v3).
- `npm run dev` — Vite dev server on port 3000; it auto-opens a browser (`server.open: true`).
- `npm run build` — production build to `dist/`, generating the PWA manifest/service worker.
- `npm run preview` — serve the built `dist/`.
- There are no test, lint, typecheck, or format scripts. Do not invent them.

## Known gaps (check before starting)

- `src/components/` is missing entirely, but `src/App.jsx` and every page import from it. The app cannot build or run until these are recreated: `layout/{Navbar,PageHeader}`, `auth/{AuthView,ProtectedRoute}`, `onboarding/OnboardingWizard`, `dashboard/*`, `map/*`, `medical/*`, `ui/{LoadingSpinner,Modal}`.
- `node_modules/` is incomplete (no `react`, `firebase`, or `.bin`), and `node`/`npm` are not currently on PATH in this workspace. Install/activate Node 18+ and run `npm install` before dev/build.
- `dist/` is a stale/incomplete build (its HTML references a missing `assets/index-*.js`). Never edit `dist/` by hand; rebuild from `src/`.

## Architecture

- Entry: `index.html` → `src/main.jsx` → `BrowserRouter` → `AuthProvider` → `PetProvider` → `src/App.jsx`. `PetProvider` calls `useAuth()`, so provider order matters.
- Routes: `/login` → `AuthView`; `/dashboard`, `/emergencia`, `/perfil-medico` (MedicalDashboard) are protected; `*` redirects to login/dashboard. `src/pages/Login.jsx` and `src/pages/MedicalProfile.jsx` are orphaned legacy pages—editing them does not affect the running app.
- `src/context/PetContext.jsx` is the single source of truth for pets, the active pet, medical records, inventory, and tasks. Use `usePet()` rather than duplicating this state. Firestore collection is `pets`, filtered by `userId`.
- Medical data lives in the `medico` field as an AES-encrypted string. `PetContext` decrypts on read and encrypts on write (hardcoded key in that file). Any direct Firestore write must use the same scheme. Shape: `veterinario`, `clinica`, `telefono`, `proximaCita`, `alergias[]`, `vacunas[]`, `cirugias[]`, `historialPeso[]`.
- `src/firebaseConfig.js` hardcodes Firebase credentials; there is no `.env` loading.
- `src/data/mockData.js` supplies species emojis, family members, and fallback clinics. Its comment about localStorage is stale—pets persist in Firestore.
- `EmergencyMap.jsx` queries the Overpass API (POST, 5 km radius) and renders with Leaflet/OSM; geolocation failure falls back to CDMX coordinates. Leaflet CSS is loaded from a CDN in `index.html`.
- `src/hooks/useDeviceFeatures.js` exists but is not used anywhere.

## Conventions

- Styles are plain CSS files in `src/styles/` (no CSS modules/Tailwind). Shared classes live in `global.css`.
- UI copy and comments are in Spanish; keep new user-facing strings in Spanish.
- Function components, 2-space indentation, single quotes, semicolons. Pages use default exports; contexts/hooks use named exports.
- React Router v6; `qrcode.react` is imported as `QRCodeCanvas`.
- PWA config is in `vite.config.js` (auto-update service worker, OSM tile and Unsplash image caching). New precached assets must be added to `public/` and reflected in `includeAssets`/`globPatterns`.
- `.vscode/launch.json` is stale (points to port 8080/Brave); the actual dev port is 3000.
