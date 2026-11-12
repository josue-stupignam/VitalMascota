# AGENTS.md

## Project

VitalMascota: Spanish-language, mobile-first React 18 + Vite 5 PWA for pet health management. Firebase Auth + Firestore backend. Plain JavaScript/JSX, plain CSS, no TypeScript.

## Commands

- `npm install` — uses `package-lock.json` (lockfile v3).
- `npm run dev` — Vite dev server on port 3000; auto-opens browser (`server.open: true`).
- `npm run build` — production build to `dist/`, generating service worker via `vite-plugin-pwa` with manual chunk splitting.
- `npm run preview` — serve built `dist/`.
- There are no test, lint, typecheck, or format scripts. Do not invent them.

## Architecture & Routing

- Entry: `index.html` → `src/main.jsx` → `BrowserRouter` → `AuthProvider` → `PetProvider` → `src/App.jsx`. `PetProvider` calls `useAuth()`, so provider order matters.
- Public routes:
  - `/login` → `AuthView` (form resets inputs when toggling mode to avoid leftover credentials).
  - `/emergencia/:petId` → `PublicEmergencyProfile` (unauthenticated medical emergency page accessible via QR code scan).
  - `/cuidador/:petId` → `SitterView` (read-only temporary view for pet sitters, validating 48h token expiration).
- Protected routes (wrapped in `ProtectedRoute`):
  - `/dashboard` → `DashboardHome` (multi-pet swipe gesture, routines, inventory, missing pet poster modal, sitter modal).
  - `/emergencia` → `EmergencyMap` (Overpass API query, 5 km radius, Leaflet/OSM map).
  - `/perfil-medico` → `MedicalDashboard` (AES medical data viewer/editor, one-click emergency QR transfer).
- Fallback route: `*` redirects to `/dashboard` if authenticated, otherwise `/login`.
- `vercel.json` provides SPA routing rewrites (`/(.*)` → `/index.html`) so deep links do not return 404 on deployment.
- `src/pages/Login.jsx` and `src/pages/MedicalProfile.jsx` are legacy orphaned pages—editing them does not affect the app.

## State & Data Layer

- `src/context/PetContext.jsx` is the single source of truth for pets, active pet, tasks, and inventory. Use `usePet()` hook.
- Data synchronization: Firestore collection `pets`, filtered by `userId`.
- Performance & Offline Cache: `PetContext` initializes state from `localStorage.getItem('vitalmascota_pets_cache_' + user.uid)` to prevent blank/white loading screens on refreshes before Firestore snapshot resolves.
- Sensitive medical records are encrypted on write and decrypted on read using AES (`crypto-js`) with `SECRET_KEY = 'vitalmascota_secure_vault_2026'`. Shape: `veterinario`, `clinica`, `telefono`, `proximaCita`, `alergias[]`, `vacunas[]`, `cirugias[]`, `historialPeso[]`.
- `src/firebaseConfig.js` hardcodes Firebase configuration.
- Missing pet posters are assembled in `MissingPetPoster.jsx` and downloaded as PNGs via `html2canvas`.

## Conventions

- Styles are plain CSS files in `src/styles/` (no CSS modules or Tailwind). Shared classes live in `global.css`.
- UI copy and comments are in Spanish; keep all new user-facing strings in Spanish.
- Function components, 2-space indentation, single quotes, semicolons.
- React Router v6; `qrcode.react` is imported as `QRCodeCanvas`.
