# Qoore — Roadmap

## ✅ Completado

### Core de la app
- [x] Gestión de equipos (crear, editar, eliminar)
- [x] Gestión de categorías por equipo
- [x] Plantel de jugadores (agregar, eliminar, transferir)
- [x] Registro de asistencia diaria (P/A con motivo de ausencia)
- [x] Sesiones de entrenamiento — RPE equipo e individual, duración individual
- [x] Wellness pre-sesión por jugador
- [x] Métricas de carga (ACWR, monotonía, strain, carga aguda/crónica)
- [x] Fichas de atletas (perfil, morfología, antropometría ISAK, tests de salto, FMS)
- [x] Reportes de asistencia (semanal, por jugador, por mes)
- [x] Exportar PDF de ficha de atleta
- [x] Exportar CSV de categoría
- [x] Exportar PDF de cargas
- [x] Búsqueda global de jugadores, equipos y categorías
- [x] Gráficos de evolución (peso, antropometría, saltos)
- [x] Umbrales automáticos por categoría (Menores vs Pro)
- [x] Transferencia de jugadores entre categorías

### Firebase & Auth
- [x] Firebase Realtime Database integrado
- [x] Firebase Authentication (email/password)
- [x] Registro de nuevos usuarios desde la app
- [x] Migración automática de datos legacy a estructura compartida `/teams/`
- [x] Security Rules configuradas

### Sistema de permisos e invitaciones
- [x] Roles: Owner / Editor / Viewer
- [x] Permisos granulares por categoría (editar/ver/ninguno)
- [x] Invitaciones por link único (expiran en 7 días)
- [x] Panel de gestión de acceso (ver miembros, editar roles, quitar acceso)
- [x] Notificaciones al owner cuando alguien acepta una invitación
- [x] Ver y revocar invitaciones pendientes

### UI & Diseño (Rediseño Qoore)
- [x] Marca definitiva: **Qoore**, logos en `/public/brand/`, acento naranja `#F97316`
- [x] Design system completo: tokens CSS, componentes `q-*`, tipografía Inter + JetBrains Mono
- [x] Sidebar árbol dinámico (240px fijo, navegación 1-click a cualquier categoría)
- [x] Stats bar desktop (4 KPIs: equipos, jugadores, asistencia configurable 7d/30d, sesiones hoy)
- [x] Header desktop oculto (sidebar lo reemplaza)
- [x] Mobile responsive: bottom TabBar 5 tabs, 2-col grid, bottom sheet search, tap targets 44px
- [x] `renderHome()` — saludo dinámico, cards con KPIs + barra de progreso
- [x] `renderAttend()` — date nav, tabla 5-col, toggles P/A
- [x] `renderSession()` — sub-tabs Carga/Wellness, RPE equipo/individual, wellness expandible
- [x] `renderMetrics()` — KPI strip 4-col, bar chart 28 días, tabla per-player ACWR/Carga/etc.
- [x] `renderReports()` — nav semanal ←→, sub-tabs Resumen/Jugadores/Por mes, dashboard 2 paneles en Jugadores
- [x] `renderSearch()` — overlay modal ⌘K/Ctrl+K, backdrop blur, match highlight
- [x] `renderAthleteTests()` — KPI strip 5-col saltos, historial q-card, FMS circular + tabla
- [x] Reportes > Jugadores: dashboard con KPIs, sparkline 7D, strip 30D, composición corporal, saltos, FMS

### Feature 1 — Médico / Lesiones ✅ (completado)
- [x] Tab "Médico" en cada categoría (ícono + integrado en renderCat)
- [x] Mapa corporal SVG interactivo (frontal + dorsal, 30 regiones clicables)
- [x] Silueta atlética (V-taper, brazos anchos, proporciones de jugador)
- [x] CRUD completo de lesiones: región, tipo, mecanismo, fecha, severidad N1/N2/N3, estado, notas
- [x] Colores por severidad: N1 azul (molestia), N2 amarillo (subaguda), N3 rojo (lesión)
- [x] Filtros por estado (Activa / En rehab / Recuperada / Todas)
- [x] Filtro por región clicando en el mapa
- [x] Dashboard de categoría: contador activas/rehab, mapa de calor de regiones, listado de lesiones
- [x] Lesiones activas/recientes (≤6 meses) visibles en Reportes > Jugadores (carga lazy por jugador)
- [x] Datos en Firebase: `teams/{tid}/athletes/{key}/injuries/{injKey}` — aislado, no rompe datos existentes

---

## 🔄 Beta (en curso)
- [ ] Probar flujo completo con 4 usuarios en Urunday Universitario
- [ ] Probar con 2 PF externos en sus propias instituciones
- [ ] Recolectar feedback sobre el Feature Médico

---

## 📋 Pendiente

### Feature 2 — Rutinas de entrenamiento (PRÓXIMO)
- [ ] Biblioteca de ejercicios (nombre, grupo muscular, tipo)
- [ ] Constructor de sesiones/rutinas (bloques, series, reps, carga)
- [ ] Asignación de rutinas a categorías o jugadores
- [ ] Registro de ejecución (completado, carga real, RPE por ejercicio)
- [ ] Historial de rutinas por jugador

### Feature 3 — Portal del jugador (FUTURO)
- [ ] Vista solo-lectura para el atleta (sin entrar al panel del cuerpo técnico)
- [ ] Login separado o link de acceso
- [ ] Ver propias métricas, asistencia, lesiones, evaluaciones
- [ ] Puede ser una app separada que lee el mismo Firebase

### Bugs conocidos
- [ ] Equipo "Urunday viejo" en path legacy de Santiago (cosmético, no urgente)

### Mejoras UX pendientes
- [ ] Conectar `renderHomeAlerts()` a alguna vista (alertas ACWR alto / wellness bajo / ausencias consecutivas) — función ya existe, no está conectada a ninguna vista
- [ ] Confirmación visual cuando se guardan permisos de un miembro
- [ ] Filtro de jugadores en plantel (por posición, estado)

### Negocio / Monetización
- [ ] **Tiers de suscripción con Stripe**
  - Free: 1 equipo, 2 categorías
  - Pro: 3 equipos, 5 categorías
  - Club: ilimitado
  - Requiere Firebase Functions para webhooks + migración a estructura multi-archivo
- [ ] Landing page pública
- [ ] Notificaciones push/email (alertas de carga, recordatorios)

---

## 🚀 Visión a largo plazo
- [ ] App móvil nativa (PWA o React Native)
- [ ] Integración con wearables / GPS
- [ ] Comparativas entre categorías
- [ ] Múltiples idiomas
- [ ] Panel de administración para clubes grandes
