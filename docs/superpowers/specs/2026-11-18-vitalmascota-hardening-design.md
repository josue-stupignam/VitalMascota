# VitalMascota — Endurecimiento, Perfil y Rediseño Responsivo

Fecha: 2026-11-18

## Intención y por qué

VitalMascota es una PWA de salud veterinaria en producción (Vercel + GitHub). Hoy tiene 17 avisos de
seguridad abiertos, la API key de Firebase escrita en el código y en el historial de Git, una UI
mobile-first que en escritorio se ve estirada, y varios módulos médicos sin contexto clínico. El
objetivo es dejar el repositorio en estado de producción: sin CVEs altos/medios, sin secretos en el
código ni en el historial, con las heurísticas de Nielsen cubiertas y las fases 1–4 del prompt
maestro implementadas.

## Objetivos

1. `npm audit` con 0 altas y 0 moderadas; `npm run build` verde.
2. Cero credenciales en `src/` y cero credenciales en `git log`. `.env.example` versionado.
3. Perfil de propietario persistido en `users/{uid}`, accesible desde el navbar, con logout real.
4. Layout de escritorio (≥1024px) en grid, modo oscuro por defecto con interruptor, skeletons, 404.
5. Talla estandarizada, burbuja de datos curiosos, inventario kg→g con ración y semáforo.
6. Expediente médico con detalles por vacuna/alergia/cirugía, bitácora, QR con token temporal.
7. Cero emojis en el código y la UI: todo `lucide-react`.
8. Un commit atómico por módulo estable.

## No-objetivos

- No se migra a TypeScript ni a un framework distinto de Vite+React 18.
- No se cambia el esquema de datos existente de `pets` (solo se añaden campos opcionales).
- No se implementa multi-familia funcional; solo se preparan los campos `familyId`, `role`,
  `familyMembers`.
- No se ejecuta `git push --force`: el usuario lo corre con el comando que se le entrega.
- No se eliminan `src/pages/Login.jsx` ni `src/pages/MedicalProfile.jsx` (huérfanos), pero sí se
  limpian de emojis para que la auditoría quede consistente.

## Restricciones

- El secreto de cifrado **no puede cambiar de valor**: los expedientes médicos ya cifrados en
  Firestore dejarían de descifrarse. `VITE_CRYPTO_SECRET` conserva el valor actual.
- `git filter-repo` no está instalado; se usa `git filter-branch --tree-filter` (Git 2.43).
- Node 22.14 / npm 10.9. La PWA debe seguir compilando con `vite-plugin-pwa@2`.

## Enfoques considerados

### Dependencias

- **A. Todo a último major (vite 8 + plugin-react 6):** máximo futuro, pero `@vitejs/plugin-react@6`
  exige peers extra (`oxc-transform-react`, `@rolldown/plugin-babel`) y vite 8 cambia el motor a
  rolldown. Riesgo de romper la PWA por un beneficio que no se necesita.
- **B. Saltos mínimos sin CVE + `overrides` (elegido):** `vite@7.3.8`, `@vitejs/plugin-react@5.2.0`,
  `react-router-dom@7.18.6`, `firebase@13.4.0`, `lucide-react@1.75.0`. Los transitivos que no se
  resuelven subiendo el árbol se fijan con `overrides`: `serialize-javascript@7.1.4`,
  `fast-uri@3.1.9`, `source-map-js@1.2.2`, `re2js@2.10.0`, `minimatch@11.0.9`, `glob@14.0.6`,
  `@grpc/grpc-js@1.14.7`. No se fuerza `esbuild`: vite 7 ya arrastra >0.24.2.
- **C. `npm audit fix --force`:** descarta control sobre qué majors cambian; descartado.

Justificación de B: cada versión elegida está fuera del rango vulnerable reportado y mantiene la API
que el código ya usa (RR7 conserva `BrowserRouter/Routes/Route/NavLink/Navigate`).

### Secretos e historial

- **A. Borrar `src/firebaseConfig.js` del historial:** el proyecto no compilaría en ningún commit
  intermedio.
- **B. Reescribir el contenido del archivo en todo el historial (elegido):** cada commit sigue siendo
  coherente y utilizable, y ninguna versión contiene la clave.
- **C. Solo rotar claves:** rechazado por el usuario.

Además se rota el secreto en Google Cloud (acción del usuario) porque la clave ya fue pública.

## Diseño

### Fase 0 — Seguridad

- `src/firebaseConfig.js` lee `import.meta.env.VITE_FIREBASE_*` y valida que existan; si falta alguna,
  lanza un error explícito en desarrollo.
- `.env.example` versionado con las siete variables vacías. `.env` y `ak.env` ignorados (se añade
  `ak.env` explícitamente a `.gitignore`).
- `VITE_CRYPTO_SECRET` sustituye la constante de `PetContext.jsx`.
- `git filter-branch --tree-filter` reescribe `src/firebaseConfig.js` en los 3 commits con la versión
  basada en `import.meta.env`, borra `refs/original` y hace `git gc --prune=now`. Se entrega el
  comando de `push --force` y la lista de claves a rotar.
- Se añade `lucide-react` y se sustituyen los 109 emojis por iconos SVG.

### Fase 1 — Perfil

- Nueva colección `users/{uid}` con `{ nombre, telefono, email, familyId, role: 'owner',
  familyMembers: [] }`. Se crea el documento al primer login si no existe (en `PetContext` o un
  `UserContext` nuevo; se elige `UserContext` para no engordar `PetContext`).
- `src/pages/Profile.jsx` + ruta `/perfil` protegida. Email de solo lectura desde Firebase Auth.
  Teléfono validado con `^[0-9+\s-]{7,15}$`.
- `Navbar` gana un cuarto item con icono `User`; se añade botón de logout que hace `signOut`, limpia
  la caché `vitalmascota_pets_cache_*` y navega a `/login`.
- `MissingPetPoster` toma el teléfono de `UserContext` como valor por defecto (editable).

### Fase 2 — Heurísticas y responsive

- Tokens CSS en `:root` (superficies, texto, acento, semáforos) y tema oscuro por defecto con
  `[data-theme="light"]` para el interruptor; persistencia en `localStorage`. Tipografía Inter con
  fallback `system-ui`.
- `DashboardHome` en CSS Grid: ≥1024px dos columnas (mascota+alertas+emergencia | inventario+tareas).
  Mobile conserva el swipe de `PetSelector`.
- Skeletons: `SkeletonCard` reutilizable reemplaza `LoadingSpinner` en dashboard y perfil médico.
- Ruta 404 real (`NotFound.jsx`) en lugar del `Navigate` comodín, con botón de regreso.
- `navigator.vibrate` centralizado en un helper con guardas; icono de confirmación animado.
- Auditoría de modales: `Modal` ya cierra con Escape y con overlay; se verifica que cada sub-vista
  tenga salida visible. `OnboardingWizard` nunca se abre automáticamente (ya es así: `showWizard`
  inicia en `false`); se mantiene y se cubre con el estado vacío existente.

### Fase 3 — Talla y nutrición

- `OnboardingWizard` y edición de mascota añaden `talla` obligatoria (`pequena|mediana|grande|gigante`).
- `PetContext` expone `TALLAS` (rangos kg + ración diaria) como única fuente de verdad.
- `FunFactBubble` en la parte superior del dashboard, contenido por especie × talla desde
  `mockData.js` (sin emojis).
- `InventoryModule`: formulario en kg, guarda `gramosTotales = kg * 1000`, `porcionDiaria` calculada
  por talla y ajustable, `diasRestantes = floor(gramos/porcion)`, semáforo verde/amarillo/rojo.
- `TaskList`: campo `asignadoA` y sincronización por documento de mascota (ya es tiempo real vía
  `onSnapshot`).

### Fase 4 — Clínico, QR y offline

- `VaccineList`/`AllergyList` y el formulario de cirugías en `MedicalDashboard` ganan `detalles`
  multilínea obligatorio.
- Semáforos por vencimiento, `BitacoraComportamiento` (fecha + nota), `WeightChart` con rango
  saludable por talla, etiquetas de rescatista.
- QR con `token` y expiración (24/48h) validada en `PublicEmergencyProfile`; `PetSitterModal` lista y
  revoca accesos activos.
- `EmergencyMap` cambia Overpass a `POST` con `AbortController` y estados de carga.
- `vite.config.js`: runtime caching para Firestore/expediente y para el QR; fallback offline.

## Lo que queda al constructor

- Elegir el nombre exacto de las clases CSS nuevas y su ubicación (se respeta `src/styles/*.css`).
- Diseñar los textos de los datos curiosos (4 especies × 4 tallas).
- Decidir si `UserContext` se fusiona con `AuthContext` si al implementarlo resulta más simple.

## Riesgos

- `glob@14` dentro de `workbox-build` puede romper la generación del SW; si ocurre, se baja a
  `glob@11` (también fuera del rango vulnerable) o se sube `workbox-build` a la última 7.x.
- La reescritura de historial cambia los hashes: cualquier clon existente debe re-clonarse.
- El cifrado depende de conservar `VITE_CRYPTO_SECRET`; se documenta en `.env.example`.
