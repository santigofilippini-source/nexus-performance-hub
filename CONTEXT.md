# Qoore — Contexto del Proyecto

## Qué es
App web de gestión deportiva profesional para cuerpos técnicos (preparadores físicos, entrenadores). Permite registrar asistencia, sesiones de entrenamiento, RPE, wellness, cargas (ACWR), fichas de atletas (morfología, antropometría, tests de salto, FMS), historial médico/lesiones y gestionar múltiples equipos con colaboradores.

## Stack
- **Frontend**: Multi-archivo — `index.html` (estructura) + `app.js` (~4000+ líneas, toda la lógica) + `style.css` (todo el CSS) — sin framework, vanilla JS con render() manual
- **Base de datos**: Firebase Realtime Database (proyecto: `basketball-club-manager`)
- **Auth**: Firebase Authentication (email/password)
- **Deploy**: GitHub Pages (repo: `santigofilippini-source/nexus-performance-hub`) → https://santigofilippini-source.github.io/nexus-performance-hub
- **Charts**: Chart.js 4.4.1
- **Archivos a subir**: `index.html`, `app.js`, `style.css`, carpeta `public/` (logos)

## Marca
- Nombre: **Qoore**
- Logos en `/public/brand/`: `logo.png` (stacked, login), `logo-horizontal.png` (sidebar), `logo-icon.png` (header mobile)
- Color acento: `#F97316` (naranja) — variable CSS `--accent`

## Estructura de archivos
```
index.html          — HTML shell; carga Firebase, Chart.js, style.css, app.js
app.js              — toda la lógica (state, render, Firebase, events)
style.css           — design system completo (tokens CSS q-* components)
public/brand/       — logo.png, logo-horizontal.png, logo-icon.png
design-reference/   — solo referencia de diseño (NO subir a GitHub)
```

## Estructura de datos en Firebase
```
/teams/{teamId}/
  meta: { name, sport, logo, ownerId, createdAt }
  categories/{catId}/
    { name, color, players[], attendance{}, sessions{} }
  memberIndex/{uid}: { email, role, displayName }
  memberPermissions/{uid}: { role, permissions:{catId:'edit'|'view'} }
  pendingInvites/{token}: { invitedEmail, role, permissions, createdAt, expiresAt }
  notifications/{notifId}: { type, uid, email, displayName, role, timestamp, read }
  athletes/{teamId}__{catId}__{playerId}:
    { personal, morphology, anthropometry, jumpTests, fmsTests, injuries }

/users/{uid}/
  memberships/{teamId}: { role:'owner'|'editor'|'viewer', permissions, joinedAt }
  profile: { nombre, apellido, pais, rol, club, licencia }

/invitations/{token}/
  { teamId, teamName, invitedEmail, role, permissions, createdByUid, createdAt, expiresAt, status }
```

### Subnodo de lesiones (agregado — Feature Médico)
```
/teams/{tid}/athletes/{athleteKey}/injuries/{injKey}:
  { region, type, mechanism, date, severity (1|2|3), status ('activa'|'en_rehab'|'recuperada'), notes }
```
- `athleteKey` = `{tid}__{cid}__{pid}`
- Las lesiones están aisladas en su propio subnodo — no interfieren con attendance, sessions ni evaluaciones físicas

### Campos de atletas
- `morphology/{key}` → `weight`, `height`, `date`
- `anthropometry/{key}` → `masaAdip`, `masaMusc`, `masaOsea`, `zAdip`, `zMusc`, `sumSkinfolds`, `date`
- `jumpTests/{key}` → `sj`, `cmj`, `abk`, `djHeight`, `djTc`, `date`
- `fmsTests/{key}` → `deepSquat`, `hurdleL/R`, `lungeL/R`, `shoulderL/R`, `aslrL/R`, `trunkStab`, `rotaryL/R`, `date`

## Firebase Security Rules
```json
{
  "rules": {
    "users": { "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" } },
    "teams": {
      "$teamId": {
        ".read": "auth != null && root.child('users').child(auth.uid).child('memberships').child($teamId).exists()",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('memberships').child($teamId).exists() || newData.child('ownerId').val() === auth.uid)"
      }
    },
    "invitations": { "$token": { ".read": "auth != null", ".write": "auth != null" } }
  }
}
```

## Reglas críticas de Firebase (NO romper)
1. **Siempre `.update()`, nunca `.set()` sobre nodos padre** — `.set()` borra todos los hijos. Se aprendió por un bug real que borró datos de atletas.
2. **Escribir membership ANTES que teams/** — las Rules requieren que el membership exista para escribir en `/teams/`. Un `update()` conjunto falla porque Firebase evalúa reglas antes de ejecutar.
3. **Lesiones**: guardar con `db.ref(...injuries/key).set(data)` — son nodos hoja, está bien.

```js
// CORRECTO — membership primero, luego team
await db.ref(`users/${uid}/memberships/${tid}`).set({...});
await db.ref(`teams/${tid}/...`).update({...});

// INCORRECTO — falla por reglas
await db.ref().update({ 'teams/tid/...': data, 'users/uid/memberships/tid': mem });
```

## Patrón UI (optimistic updates)
```js
S.teams[tid] = newTeam;   // actualizar memoria primero
S.teamFormMode = null;    // cerrar formulario inmediatamente
render();                 // UI responde al instante
try { await persistTeam(tid); } catch(e){ setSyncBar('error'); }
```

## Estado global (S)
Un objeto `S` central con toda la UI state. `render()` lee S y redibuja.

Vistas: `home` | `team` | `cat` | `athlete` | `search`
Tabs de categoría: `attend` | `session` | `metrics` | `reports` | `roster` | `medico`

Keys relevantes:
- `lastCatTid` / `lastCatCid` — última categoría visitada
- `statsPeriod` — período en días para stats bar (default: 7)
- `reportPlayerPid` — jugador seleccionado en Reportes > Jugadores
- `reportWeekOffset` — semana offset para navegación en Reportes
- `medInjuries` — `{athleteKey: {injKey: injData}}` — cargado al abrir tab Médico o lazy al ver jugador en Reportes
- `medFilter` — filtro de estado activo en tab Médico ('activa'|'en_rehab'|'recuperada'|'todas')
- `medRegion` — región filtrada en el mapa corporal
- `injForm` — `{ak?, ikey?, data:{}}` — formulario de nueva/editar lesión

## Funciones clave
- `render()` — renderiza la vista actual leyendo `S.view`
- `persistTeam(tid)` — guarda equipo en `/teams/{tid}` con `.update()` (sin athletes)
- `persistCat(tid, cid)` — guarda categoría
- `saveAthlete(key)` — guarda atleta en `/teams/{tid}/athletes/{key}` con `.set()` (solo en nodo hoja)
- `loadAll()` — carga memberships → teams → memberPermissions → athletes → profile
- `loadMedical()` — carga todas las lesiones de la categoría actual en `S.medInjuries`
- `loadPlayerInjuries(key)` — carga lazy las lesiones de un atleta específico (usado en Reportes > Jugadores)
- `saveInjury()` — guarda/actualiza una lesión en Firebase; usa `.set()` sobre el nodo hoja
- `deleteInjury(ak, key)` — elimina una lesión
- `canEdit(tid, cid)` — true si el usuario puede editar esa categoría
- `myRole(tid)` — 'owner'|'editor'|'viewer'|null
- `athleteKey(tid, cid, pid)` — retorna `${tid}__${cid}__${pid}`
- `regionLabel(id)` — retorna el nombre legible de una región corporal
- `injSevColor(sev)` — retorna color CSS según severidad (1=info, 2=warn, 3=bad)
- `buildBodyMapSVG(side, injMap, interactive)` — construye el SVG del mapa corporal
- `updateHeader()` → llama a `updateStatsBar()` y `updateSidebarNav()`

## Constantes médicas (en app.js, antes de `let S`)
```js
const INJ_TYPES = ['Desgarro muscular', 'Esguince/Lesión lig.', 'Contusión', 'Tendinopatía', 'Fractura', 'Luxación', 'Pubalgia', 'Otro'];
const INJ_MECHS = ['Contacto', 'No contacto', 'Sobreuso', 'Otro'];
const REGIONS_ALL = [...] // 30 regiones con id y label
```

## Design system (style.css)
- Tokens: `--bg-0` a `--bg-5`, `--text-0` a `--text-3`, `--line`, `--line-strong`
- Acento: `--accent: #F97316`, `--accent-soft`
- Semáforos: `--ok` (verde), `--warn` (amarillo), `--bad` (rojo), `--info` (azul)
- Componentes: `q-card`, `q-btn`, `q-stat`, `q-tabs`, `q-tab`, `q-input`, `q-modal`, `q-modal-backdrop`
- Medical: `q-medical`, `q-bodymap-wrap`, `q-bodymap-panel`, `bm-svg`, `bm-reg`, `q-inj-card`, `q-sev-badge`
- Mobile: `@media(max-width:899px)` — bottom TabBar 5 tabs, 2-col grid, bottom sheet search

## Convenciones del código
- Sin framework — todo vanilla JS con template literals
- `data-action="accion"` en botones, `handleAction(e)` los captura centralmente
- Inputs que persisten a través de render() → guardar en S antes de render
- No usar nested template literals en strings complejos — usar concatenación de strings
- No usar `await` antes de `render()` para acciones de UI (optimistic)

## Migración legacy
Usuarios viejos tienen datos en `users/{uid}/teams/`. `loadAll()` detecta si no hay memberships y migra automáticamente a `/teams/`. Si la migración falla (reglas), hay fallback que carga del path viejo.

## Contexto de negocio
- Beta actual: ~6 usuarios (4 en Urunday Universitario + 2 PF de otros clubes)
- Mercado: preparadores físicos y entrenadores de clubes deportivos (Uruguay y región)
- Múltiples deportes (no solo básquetbol)
