// ── Firebase ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:"AIzaSyB2cH0Sf2ZDxmYgdds3SOHfmUY-P1VIvcQ",
  authDomain:"basketball-club-manager.firebaseapp.com",
  databaseURL:"https://basketball-club-manager-default-rtdb.firebaseio.com",
  projectId:"basketball-club-manager",
  storageBucket:"basketball-club-manager.firebasestorage.app",
  messagingSenderId:"139208921434",
  appId:"1:139208921434:web:75396a78070dc6e6416363"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.database();

// ── Constants ─────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const ALERT_N = 3;
const MES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CAT_PALETTE = ['#2563eb','#d97706','#059669','#7c3aed','#dc2626','#0891b2','#db2777','#ea580c','#16a34a','#b45309'];
const SPORTS = ['Básquetbol','Fútbol','Vóley','Handball','Rugby','Hockey','Natación','Atletismo','Tenis','Otro'];
const RPE_LABELS = ['Reposo','Muy muy ligero','Muy ligero','Ligero','Moderado','Algo difícil','Difícil','Muy difícil','Muy muy difícil','Casi máximo','Máximo'];
const RPE_BG = ['#475569','#16a34a','#22c55e','#65a30d','#ca8a04','#d97706','#ea580c','#dc2626','#b91c1c','#7f1d1d','#4c1d95'];
const RPE_FG = ['#fff','#fff','#000','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff'];
const W_KEYS   = ['sleep','fatigue','soreness','stress','mood'];
const W_ICONS  = {sleep:'😴',fatigue:'⚡',soreness:'🤕',stress:'🧘',mood:'😊'};
const W_LABELS = {sleep:'Sueño',fatigue:'Energía',soreness:'Dolor musc.',stress:'Estrés',mood:'Ánimo'};
const SESSION_TYPES=[{id:'practica',label:'Práctica',icon:'🏃'},{id:'partido',label:'Partido',icon:'⚽'},{id:'libre',label:'Día libre',icon:'😴'},{id:'recuperacion',label:'Recuperación',icon:'🔄'}];
const ABSENCE_REASONS=[{id:'lesion',label:'Lesión',icon:'🤕'},{id:'illness',label:'Enfermedad',icon:'🤒'},{id:'other',label:'Otro',icon:'📝'}];
const W_TIPS   = {
  sleep:['Muy malo','Malo','Regular','Bueno','Excelente'],
  fatigue:['Agotado','Muy cansado','Normal','Bien','Lleno de energía'],
  soreness:['Mucho dolor','Bastante','Algo','Leve','Sin dolor'],
  stress:['Muy alto','Alto','Moderado','Bajo','Sin estrés'],
  mood:['Muy bajo','Bajo','Normal','Bueno','Excelente']
};
const W_COLORS = ['#ef4444','#fb923c','#f59e0b','#84cc16','#22c55e'];

// ── Medical / Injury constants ────────────────────────────────
const INJ_TYPES=['Desgarro muscular','Esguince/Lesión lig.','Contusión','Tendinopatía','Fractura','Luxación','Pubalgia','Otro'];
const INJ_MECHS=['Contacto','No contacto','Sobreuso','Otro'];
const REGIONS_ALL=[
  {id:'cabeza',label:'Cabeza'},{id:'cuello',label:'Cuello'},
  {id:'hombro_izq',label:'Hombro izquierdo'},{id:'hombro_der',label:'Hombro derecho'},
  {id:'pecho',label:'Pecho'},{id:'espalda_alta',label:'Espalda alta'},
  {id:'brazo_izq',label:'Brazo izquierdo'},{id:'brazo_der',label:'Brazo derecho'},
  {id:'codo_izq',label:'Codo izquierdo'},{id:'codo_der',label:'Codo derecho'},
  {id:'antebrazo_izq',label:'Antebrazo izquierdo'},{id:'antebrazo_der',label:'Antebrazo derecho'},
  {id:'muneca_izq',label:'Muñeca/Mano izquierda'},{id:'muneca_der',label:'Muñeca/Mano derecha'},
  {id:'abdomen',label:'Abdomen'},{id:'espalda_baja',label:'Espalda baja'},
  {id:'gluteo_izq',label:'Glúteo izquierdo'},{id:'gluteo_der',label:'Glúteo derecho'},
  {id:'cadera_izq',label:'Cadera/Aductor izquierdo'},{id:'cadera_der',label:'Cadera/Aductor derecho'},
  {id:'cuad_izq',label:'Cuádriceps izquierdo'},{id:'cuad_der',label:'Cuádriceps derecho'},
  {id:'isquio_izq',label:'Isquiotibial izquierdo'},{id:'isquio_der',label:'Isquiotibial derecho'},
  {id:'rodilla_izq',label:'Rodilla izquierda'},{id:'rodilla_der',label:'Rodilla derecha'},
  {id:'tibial_izq',label:'Tibial/Gemelo izquierdo'},{id:'tibial_der',label:'Tibial/Gemelo derecho'},
  {id:'tobillo_izq',label:'Tobillo izquierdo'},{id:'tobillo_der',label:'Tobillo derecho'},
  {id:'pie_izq',label:'Pie izquierdo'},{id:'pie_der',label:'Pie derecho'},
];
function regionLabel(id){return REGIONS_ALL.find(r=>r.id===id)?.label||id;}

// ── Exercise / Program constants ──────────────────────────────
const EX_CATEGORIES = ['Tren inferior','Tren superior','Core','Cardio / Metabólico','Técnico / Táctico','Movilidad / Elongación','Potencia / Pliometría','Otro'];
const BLOCK_TYPES = [
  {id:'warmup',  label:'WARM-UP',   color:'#0891b2'},
  {id:'strength',label:'STRENGTH',  color:'#7c3aed'},
  {id:'power',   label:'POWER',     color:'#ea580c'},
  {id:'cardio',  label:'CARDIO',    color:'#16a34a'},
  {id:'tactical',label:'TACTICAL',  color:'#2563eb'},
  {id:'cooldown',label:'COOL-DOWN', color:'#475569'},
  {id:'custom',  label:'BLOQUE',    color:'#d97706'},
];
function blockTypeInfo(id){return BLOCK_TYPES.find(b=>b.id===id)||BLOCK_TYPES[BLOCK_TYPES.length-1];}
function formatSetDisplay(s){
  if(!s) return '—';
  const type=s.type||'reps';
  const val=type==='time'?(s.time?s.time+'s':''):(s.reps||'');
  const w=s.weight?s.weight+'kg':'';
  const mod=s.rir?'RiR'+s.rir:(s.pct?s.pct+'%RM':'');
  const parts=[val,w,mod].filter(Boolean);
  return parts.length?parts.join(' · '):'—';
}

// ── Default exercise library (always visible in Global tab) ───
const DEFAULT_EXERCISES = {
  // ── Tren inferior ──────────────────────────────────────────────
  'def_sq':      {name:'Sentadilla con barra',            category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=QmZAiBqPvZw'},
  'def_fsq':     {name:'Sentadilla frontal',              category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=uYumuL_G_V0'},
  'def_airsq':   {name:'Sentadilla al aire',              category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=rMvwVtlqjTE'},
  'def_rdl':     {name:'Peso muerto rumano',              category:'Tren inferior'},
  'def_leg':     {name:'Prensa de piernas',               category:'Tren inferior'},
  'def_lunge':   {name:'Estocadas caminando',             category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=DlhojghkaQ0'},
  'def_stepup':  {name:'Step-up en caja',                 category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=5qjqDHOUh-A'},
  'def_nordic':  {name:'Nordic curl',                     category:'Tren inferior'},
  'def_hipth':   {name:'Hip thrust con barra',            category:'Tren inferior'},
  // ── Tren superior ─────────────────────────────────────────────
  'def_bp':      {name:'Press de banca plano',            category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=SCVCLChPQFY'},
  'def_ohp':     {name:'Press militar con barra',         category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=5yWaNOvgFCM'},
  'def_pp':      {name:'Push press',                      category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=iaBVSJm78ko'},
  'def_dbpp':    {name:'Push press con mancuernas',       category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=4tCaD42ghlc'},
  'def_pushup':  {name:'Flexiones de brazo',              category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=0pkjOk0EiAk'},
  'def_row':     {name:'Remo con barra',                  category:'Tren superior'},
  'def_pull':    {name:'Dominadas / Pull-up',             category:'Tren superior'},
  'def_dips':    {name:'Fondos en paralelas',             category:'Tren superior'},
  'def_curl':    {name:'Curl de bíceps con mancuerna',    category:'Tren superior'},
  'def_tri':     {name:'Extensión de tríceps en polea',   category:'Tren superior'},
  // ── Core ──────────────────────────────────────────────────────
  'def_plank':   {name:'Plancha isométrica',              category:'Core'},
  'def_dead':    {name:'Peso muerto convencional',        category:'Core'},
  'def_ab':      {name:'Abdominales en suelo',            category:'Core'},
  'def_russ':    {name:'Russian twist',                   category:'Core'},
  'def_tgu':     {name:'Turkish get-up con mancuerna',    category:'Core',                   videoUrl:'https://www.youtube.com/watch?v=saYKvqSscuY'},
  // ── Cardio / Metabólico ───────────────────────────────────────
  'def_burpee':  {name:'Burpee',                          category:'Cardio / Metabólico',    videoUrl:'https://www.youtube.com/watch?v=auBLPXO8Fww'},
  'def_sprint':  {name:'Sprint 30m',                      category:'Cardio / Metabólico'},
  'def_rondo':   {name:'Rondo 5v2',                       category:'Cardio / Metabólico'},
  'def_hitt':    {name:'HIIT 30-30',                      category:'Cardio / Metabólico'},
  // ── Potencia / Pliometría ─────────────────────────────────────
  'def_clean':   {name:'Cargada (Clean)',                  category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=Ty14ogq_Vok'},
  'def_hpc':     {name:'Cargada desde colgado (Hang Power Clean)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=0aP3tgKZcHQ'},
  'def_dbclean': {name:'Cargada con mancuernas (DB Clean)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=SYxObzJ3gn0'},
  'def_mbclean': {name:'Cargada con balón medicinal',     category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=KVGhkHSrDJo'},
  'def_cj':      {name:'Cargada y envión (Clean & Jerk)', category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=PjY1rH4_MOA'},
  'def_snatch':  {name:'Arranque (Snatch)',                category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=GhxhiehJcQY'},
  'def_psnatch': {name:'Arranque de fuerza (Power Snatch)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=TL8SMp7RdXQ'},
  'def_hps':     {name:'Arranque desde colgado (Hang Power Snatch)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=-mLzQdVAwlw'},
  'def_dbsnatch':{name:'Arranque con mancuerna (DB Power Snatch)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=3mlhF3dptAo'},
  'def_kbsnatch':{name:'Arranque con pesa rusa (KB Snatch)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=Pm-b2XFeABA'},
  'def_sjerk':   {name:'Envión de tijera (Split Jerk)',   category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=GUDkOtraHHY'},
  'def_thr':     {name:'Thruster',                        category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=L219ltL15zk'},
  'def_dbthr':   {name:'Thruster con mancuernas',         category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=u3wKkZjE8QM'},
  'def_kbswing': {name:'Swing con pesa rusa (KB Swing)',  category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=mKDIuUbH94Q'},
  'def_slamball':{name:'Lanzamiento de balón (Slam Ball)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=k9W6g9LvXDI'},
  'def_cmj':     {name:'Salto CMJ',                       category:'Potencia / Pliometría'},
  'def_box':     {name:'Box jump',                        category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=NBY9-kTuHEk'},
  'def_bbjo':    {name:'Burpee box jump over',            category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=GLktGkmcvWE'},
  'def_drop':    {name:'Drop jump',                       category:'Potencia / Pliometría'},
  // ── Movilidad / Elongación ────────────────────────────────────
  'def_foam':    {name:'Foam roller — MMII',              category:'Movilidad / Elongación'},
  'def_mob':     {name:'Movilidad articular guiada',      category:'Movilidad / Elongación'},
  'def_elon':    {name:'Elongación isquiotibial',         category:'Movilidad / Elongación'},
  // ── Nuevos ────────────────────────────────────────────────────
  'def_ringrow': {name:'Remo en anillas (Ring Row)',                    category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=sEAOZc77wk8'},
  'def_dbohsq':  {name:'Sentadilla sobre cabeza con mancuerna (OHS)',  category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=azumEfnk-GI'},
  'def_absit':   {name:'Abdominales con AbMat (AbMat Sit-Up)',         category:'Core',                   videoUrl:'https://www.youtube.com/watch?v=VIZX2Ru9qU8'},
  'def_hpccpj':  {name:'Cargada desde colgado y envión (HPC + Push Jerk)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=8IYt7AtP8BI'},
  'def_zercher': {name:'Sentadilla Zercher (Zercher Squat)',           category:'Tren inferior',          videoUrl:'https://www.youtube.com/watch?v=nwx6Ip7hd3I'},
  'def_lsit':    {name:'L-Sit colgado (Hanging L-Sit)',               category:'Core',                   videoUrl:'https://www.youtube.com/watch?v=WHi1bvZLwlw'},
  'def_ctb':     {name:'Dominada pecho a la barra (Chest-to-Bar)',    category:'Tren superior',          videoUrl:'https://www.youtube.com/watch?v=xf69XHAs5w8'},
  'def_broadjmp':{name:'Salto en largo (Broad Jump)',                 category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=AOkmLTD8J24'},
  'def_cqsjmp':  {name:'Salto concéntrico en cuarto sentadilla',      category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=jDmNzL_jctc'},
  'def_depthdrop':{name:'Caída de profundidad (Depth Drop)',          category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=GZLyZCqF8BQ'},
  'def_depthjmp':{name:'Salto de profundidad (Depth Jump)',           category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=GeN0S3XCZnM'},
  'def_pausebox':{name:'Salto al cajón con pausa (Pause Box Jump)',   category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=OupSuT2VFTk'},
  'def_seatedbox':{name:'Salto al cajón sentado (Seated Box Jump)',   category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=yhBwqIvXHgw'},
  'def_seatedvj':{name:'Salto vertical sentado (Seated Vertical Jump)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=3x_mz9qztMI'},
  'def_sqboxjmp':{name:'Salto al cajón desde sentadilla (Squat Box Jump)', category:'Potencia / Pliometría', videoUrl:'https://www.youtube.com/watch?v=sUK1NDgjIcg'},
  'def_vertjmp': {name:'Salto vertical (Vertical Jump)',              category:'Potencia / Pliometría',  videoUrl:'https://www.youtube.com/watch?v=85FvMEHl3Vo'},
};

// ── State ─────────────────────────────────────────────────────
let currentUser = null;
let S = {
  view:'home', teams:{}, teamId:null, cat:null,
  tab:'attend', date:TODAY,
  sess:{}, absenceReasons:{}, sessionDraft:{duration:'',teamRPE:null,playerRPE:{},playerDuration:{},sessionType:null},
  wellnessDraft:{}, wellnessExpanded:{}, sessionSub:'plan', rpeMode:'team',
  reportSub:'semanal', reportWeekOffset:0, reportPlayerPid:null, confirmDel:null, editId:null,
  loadFilter:'7d', loadFrom:'', loadTo:'',
  athletes:{}, athleteKey:null, athleteTab:'perfil', athleteForm:null, editingEvalId:null,
  prevView:'home', prevTeamId:null, prevCat:null,
  lastCatTid:null, lastCatCid:null, statsPeriod:7,
  searchQuery:'',
  // Team/category forms
  medInjuries:{}, medFilter:'activa', medRegion:'', injForm:null,
  editingTeamId:null, editingCatId:null,
  teamFormMode:null, catFormMode:null, // 'new'|'edit'
  // Programs (personal per-user training programs)
  programs:{},           // { progId: { name, createdAt, days:{dayId:{name,order,blocks}} } }
  programView:null,      // null | { progId, dayId? }
  programForm:null,      // null | { mode:'new'|'edit', progId?, name, dayId?, dayName }
  // Exercise library
  exercises:{ global:{}, personal:{} },
  // Session plans (loaded for current date)
  sessionPlans:{},       // { planId: { name, assignedToAll, assignedTo:{}, blocks:{} } }
  planForm:null,         // null | { mode:'new'|'edit', planId?, name, assignedToAll, assignedTo:{} }
  exPicker:null,         // null | { planId, blockId } or { progId, dayId, blockId }
  exPickerQuery:'', exPickerTab:'global', exPickerAddForm:null,
  exLibEdit:null,        // null | { id, name, category } — editing a personal exercise
  planEditBlock:null,    // { planId, blockId } block name being edited
  planEditSet:null,      // { planId, blockId, itemId, setIdx, field } cell in edit
  planCollapsed:{},      // { 'planId__blockId': true }
  // User profile & logo
  userProfile:{}, pendingLogo:null, profileView:false,
  // Permissions & invitations
  memberships:{},       // { teamId: {role, permissions, joinedAt} }
  pendingInvite:null,   // token from URL ?invite=
  accessPanel:false,    // show access management in team view
  inviteLink:null,      // generated link to copy
  teamMembers:{},       // { teamId: [{uid, email, role, permissions}] }
  teamNotifs:{},        // { teamId: [{id, email, displayName, role, timestamp, read}] }
  teamInvites:{},       // { teamId: [{token, invitedEmail, role, permissions, expiresAt, createdAt}] }
  inviteForm:{role:'editor', permissions:{}, email:''}, // draft form for new invite
  showInviteModal:false,// show accept-invitation modal
  pendingInviteData:null,// data loaded from Firebase for pending invite
  editingMember:null,   // uid of member being edited in access panel
  editMemberForm:{},    // {role, permissions} draft for member being edited
  confirmModal:null,    // {msg, cb} — custom confirm dialog
  toastMsg:null,        // string — brief toast notification
  videoModal:null,      // {url, title} — YouTube embed modal
  // Tiers & beta
  betaMode:true,        // loaded from /config/app — true = all teams get Elite
  upgradeModal:null,    // {feature, currentTier} — shown when limit hit
  subscriptionModal:false, // true = show subscription/plans modal
  adminTeams:null,         // null = not loaded yet, {} = loaded (admin only)
};

// ── Admin ──────────────────────────────────────────────────────
const ADMIN_EMAIL = 'santigofilippini@gmail.com';
function isAdmin(){ return currentUser?.email === ADMIN_EMAIL; }

// ── Tier helpers ───────────────────────────────────────────────
function getEffectiveTier(tid=S.teamId){
  if(S.betaMode) return 'elite';
  const sub=S.teams[tid]?.subscription;
  return sub?.tier||'free';
}
function getTierLimits(tid=S.teamId){
  return TIER_CONFIG[getEffectiveTier(tid)]||TIER_CONFIG.free;
}
function canCreateTeam(){
  if(S.betaMode) return {ok:true};
  const limits=TIER_CONFIG[getEffectiveTier()]||TIER_CONFIG.free;
  const count=Object.keys(S.teams||{}).length;
  return count<limits.maxTeams?{ok:true}:{ok:false,feature:'maxTeams',tier:getEffectiveTier()};
}
function canCreateCategory(tid=S.teamId){
  if(S.betaMode) return {ok:true};
  const limits=getTierLimits(tid);
  const count=Object.keys(getTeam(tid).categories||{}).length;
  return count<limits.maxCategoriesPerTeam?{ok:true}:{ok:false,feature:'maxCategoriesPerTeam',tier:getEffectiveTier(tid)};
}
function canInviteMember(tid=S.teamId){
  if(S.betaMode) return {ok:true};
  const limits=getTierLimits(tid);
  const members=S.teamMembers[tid]||[];
  return members.length<limits.maxMembersPerTeam?{ok:true}:{ok:false,feature:'maxMembersPerTeam',tier:getEffectiveTier(tid)};
}
function canUseFeature(feature, tid=S.teamId){
  if(S.betaMode) return true;
  return getTierLimits(tid).features[feature]===true;
}

// ── Accessors ─────────────────────────────────────────────────
function getTeam(tid=S.teamId) { return S.teams[tid] || {name:'',sport:'',categories:{}}; }
function getCats(tid=S.teamId) { return Object.keys(getTeam(tid).categories||{}); }
function getCat(cat=S.cat, tid=S.teamId) {
  const c = getTeam(tid).categories?.[cat];
  if (!c) return {players:[],attendance:{},sessions:{}};
  if (!c.players || typeof c.players !== 'object') c.players=[];
  else if (!Array.isArray(c.players)) c.players=Object.values(c.players);
  if (!c.attendance || typeof c.attendance !== 'object') c.attendance={};
  if (!c.sessions || typeof c.sessions !== 'object') c.sessions={};
  return c;
}
function getCatName(cat=S.cat, tid=S.teamId) { return getTeam(tid).categories?.[cat]?.name || '—'; }
function getCatColor(cat=S.cat, tid=S.teamId) {
  const cats = getCats(tid);
  const idx = cats.indexOf(cat);
  return getTeam(tid).categories?.[cat]?.color || CAT_PALETTE[idx>=0?idx%CAT_PALETTE.length:0];
}
function athleteKey(teamId=S.teamId, catId=S.cat, pid) { return `${teamId}__${catId}__${pid}`; }

// ── Detect invite token from URL ──────────────────────────────
(function(){
  const params=new URLSearchParams(window.location.search);
  const tok=params.get('invite');
  if(tok){
    S.pendingInvite=tok;
    const banner=document.getElementById('login-invite-banner');
    if(banner)banner.style.display='block';
    // Switch to register tab by default for invite flow
    setTimeout(()=>switchLoginTab('register'),0);
  }
})();

// ── Login tab switch ──────────────────────────────────────────
function switchLoginTab(tab){
  document.getElementById('login-form-section').style.display=tab==='login'?'block':'none';
  document.getElementById('register-form-section').style.display=tab==='register'?'block':'none';
  document.getElementById('tab-login-btn').classList.toggle('active',tab==='login');
  document.getElementById('tab-reg-btn').classList.toggle('active',tab==='register');
  document.getElementById('login-err').textContent='';
}

// ── Auth ──────────────────────────────────────────────────────
auth.onAuthStateChanged(async user => {
  document.getElementById('loading-screen').style.display='none';
  if (user) {
    currentUser=user;
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app-screen').style.display='block';
    document.body.classList.add('is-auth');
    document.getElementById('user-name').textContent=user.displayName||user.email.split('@')[0];
    document.getElementById('app-body').innerHTML='<div style="padding:24px 16px;display:flex;flex-direction:column;gap:12px;"><div style="height:14px;background:var(--bg-3);border-radius:6px;width:30%;animation:nx-pulse 1.4s ease-in-out infinite;"></div><div style="height:80px;background:var(--bg-3);border-radius:12px;animation:nx-pulse 1.4s ease-in-out infinite;"></div><div style="height:80px;background:var(--bg-3);border-radius:12px;animation:nx-pulse 1.4s ease-in-out infinite;opacity:.7;"></div><div style="height:80px;background:var(--bg-3);border-radius:12px;animation:nx-pulse 1.4s ease-in-out infinite;opacity:.5;"></div></div>';
    await loadAll();
    // After loading, check for pending invite
    if(S.pendingInvite){
      await handlePendingInvite(S.pendingInvite);
    }
  } else {
    currentUser=null;
    document.getElementById('login-screen').style.display='flex';
    document.getElementById('app-screen').style.display='none';
    document.body.classList.remove('is-auth');
  }
});

async function doLogin() {
  const email=document.getElementById('email-input').value.trim();
  const pass=document.getElementById('pass-input').value;
  const btn=document.getElementById('login-btn');
  const err=document.getElementById('login-err');
  if(!email||!pass){err.textContent='Ingresá email y contraseña.';return;}
  btn.disabled=true; btn.textContent='Ingresando...'; err.textContent='';
  try { await auth.signInWithEmailAndPassword(email,pass); }
  catch(e) {
    const msgs={'auth/user-not-found':'Usuario no encontrado.','auth/wrong-password':'Contraseña incorrecta.','auth/invalid-credential':'Email o contraseña incorrectos.','auth/too-many-requests':'Demasiados intentos.'};
    err.textContent=msgs[e.code]||'Error: '+e.message;
    btn.disabled=false; btn.textContent='Iniciar sesión';
  }
}
async function doRegister() {
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const btn=document.getElementById('reg-btn');
  const err=document.getElementById('login-err');
  if(!email||!pass){err.textContent='Ingresá email y contraseña.';return;}
  if(pass.length<6){err.textContent='La contraseña debe tener al menos 6 caracteres.';return;}
  btn.disabled=true; btn.textContent='Creando cuenta...'; err.textContent='';
  try {
    const cred=await auth.createUserWithEmailAndPassword(email,pass);
    if(name) await cred.user.updateProfile({displayName:name});
  } catch(e) {
    const msgs={'auth/email-already-in-use':'Ya existe una cuenta con ese email.','auth/invalid-email':'Email inválido.','auth/weak-password':'Contraseña muy débil.'};
    err.textContent=msgs[e.code]||'Error: '+e.message;
    btn.disabled=false; btn.textContent='Crear cuenta';
  }
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('login-screen').style.display!=='none')doLogin();});
function doLogout(){showConfirm('¿Cerrar sesión?',()=>auth.signOut());}

// ── Firebase Storage ──────────────────────────────────────────
function setSyncBar(status, msg) {
  const bar=document.getElementById('sync-bar'); if(!bar)return;
  const t=new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});
  if(status==='ok')     bar.innerHTML=`<span class="dot-green"></span> Sincronizado · ${t}`;
  if(status==='saving') bar.innerHTML=`<span class="dot-yellow"></span> Guardando...`;
  if(status==='loading')bar.innerHTML=`<span class="dot-yellow"></span> Cargando...`;
  if(status==='error')  bar.innerHTML=`<span style="width:6px;height:6px;border-radius:50%;background:#ef4444;display:inline-block;"></span> ${msg||'Sin conexión — datos locales'}`;
}

async function loadAll() {
  setSyncBar('loading');
  try {
    // 0. Load global app config (betaMode, etc.) — failure is non-fatal
    try {
      const cfgSnap = await db.ref('config/app').get();
      if(cfgSnap.exists()) S.betaMode = cfgSnap.val().betaMode !== false;
    } catch(e) { /* rules may block this; default betaMode:true applies */ }
    // 1. Load memberships
    const mSnap = await db.ref(`users/${currentUser.uid}/memberships`).get();
    S.memberships = mSnap.exists() ? (mSnap.val()||{}) : {};

    // 2. If no memberships yet, check for legacy teams to migrate
    if(!Object.keys(S.memberships).length){
      const legacySnap = await db.ref(`users/${currentUser.uid}/teams`).get();
      if(legacySnap.exists()){
        await migrateToSharedSpace(legacySnap.val());
      } else {
        S.teams={};
      }
    } else {
      // 3. Load each team from /teams/{teamId}
      S.teams={};
      const teamIds = Object.keys(S.memberships);
      await Promise.all(teamIds.map(async tid=>{
        try {
          const tSnap = await db.ref(`teams/${tid}`).get();
          if(tSnap.exists() && tSnap.val()?.name){
            S.teams[tid]=tSnap.val()||{};
            normalizeTeam(tid);
          } else {
            // Team data missing from shared space (owner on legacy path)
            S.teams[tid]={ name:'Equipo pendiente de migración', sport:'', categories:{}, _legacyPending:true };
          }
        } catch(e) { console.warn('Could not load team',tid,e); }
      }));
    }

    // FALLBACK: if still no teams, try loading directly from legacy path
    // (happens when Firebase rules block /teams/ writes during migration)
    if(!Object.keys(S.teams).length){
      const legacySnap = await db.ref(`users/${currentUser.uid}/teams`).get();
      if(legacySnap.exists()){
        console.warn('Using legacy path fallback — update Firebase rules to enable migration');
        S.teams = legacySnap.val()||{};
        Object.keys(S.teams).forEach(tid=>{
          normalizeTeam(tid);
          S.memberships[tid]={role:'owner',permissions:{},joinedAt:TODAY};
        });
      }
    }

    // For non-owner memberships: fetch authoritative permissions from teams/{tid}/memberPermissions/
    // (owner can update these without needing write access to other users' paths)
    await Promise.all(Object.entries(S.memberships).map(async ([tid, mem])=>{
      if(mem.role==='owner') return;
      try {
        const pSnap = await db.ref(`teams/${tid}/memberPermissions/${currentUser.uid}`).get();
        if(pSnap.exists()){
          const fresh = pSnap.val()||{};
          S.memberships[tid] = {...mem, role: fresh.role||mem.role, permissions: fresh.permissions||mem.permissions||{}};
        }
      } catch(e){ /* use cached membership */ }
    }));

    // 4. Load athletes — try new path first, fallback to legacy
    S.athletes={};
    const teamIds = Object.keys(S.teams);
    await Promise.all(teamIds.map(async tid=>{
      // Try new shared path
      try {
        const aSnap = await db.ref(`teams/${tid}/athletes`).get();
        if(aSnap.exists()){ Object.assign(S.athletes, aSnap.val()||{}); return; }
      } catch(e) { /* fallthrough */ }
      // Fallback: legacy athletes path
      try {
        const aSnap2 = await db.ref(`users/${currentUser.uid}/athletes`).get();
        if(aSnap2.exists()) Object.assign(S.athletes, aSnap2.val()||{});
      } catch(e) { /* ignore */ }
    }));

    // 5. Load user profile
    const pSnap = await db.ref(`users/${currentUser.uid}/profile`).get();
    S.userProfile = pSnap.exists() ? (pSnap.val()||{}) : {};

    // 6. Load personal programs and exercise library (in parallel)
    const [progSnap, exPersonalSnap, exGlobalSnap] = await Promise.all([
      db.ref(`users/${currentUser.uid}/programs`).get(),
      db.ref(`users/${currentUser.uid}/exercises`).get(),
      db.ref('exercises_library').get()
    ]);
    S.programs = progSnap.exists() ? (progSnap.val()||{}) : {};
    S.exercises.personal = exPersonalSnap.exists() ? (exPersonalSnap.val()||{}) : {};
    S.exercises.global   = exGlobalSnap.exists()   ? (exGlobalSnap.val()||{})   : {};

    setSyncBar('ok');
  } catch(e) {
    console.error(e); setSyncBar('error','Error al cargar los datos');
  }
  updateHeader();
  render();
}

// ── Header context update ─────────────────────────────────────
function updateHeader() {
  const logo = document.getElementById('header-logo');
  const clubEl = document.getElementById('header-club');
  const nameEl = document.getElementById('user-name');
  if (!logo || !clubEl) return;
  // Show team logo if in team/cat view and team has logo
  const team = S.teamId ? S.teams[S.teamId] : null;
  if (team?.logo) {
    logo.innerHTML = `<img src="${team.logo}" style="width:34px;height:34px;border-radius:9px;object-fit:cover;">`;
    logo.style.background = 'transparent';
    logo.style.padding = '0';
  } else {
    logo.innerHTML = '<img src="public/brand/logo-icon.png" style="width:30px;height:30px;object-fit:contain;">';
    logo.style.background = 'transparent';
    logo.style.padding = '2px';
  }
  // Breadcrumb
  if (S.view === 'team' && team) {
    clubEl.textContent = '← Mis equipos · ' + team.name;
    clubEl.style.cursor = 'pointer';
  } else if (S.view === 'cat' && team) {
    const catName = getCatName();
    clubEl.textContent = `← ${team.name} · ${catName}`;
    clubEl.style.cursor = 'pointer';
  } else if (S.view === 'athlete') {
    clubEl.textContent = '← Volver';
    clubEl.style.cursor = 'pointer';
  } else {
    clubEl.textContent = 'Qoore';
    clubEl.style.cursor = 'default';
  }
  // Display name from profile or email
  if (nameEl) {
    const displayName = S.userProfile?.nombre
      ? `${S.userProfile.nombre}${S.userProfile.apellido?' '+S.userProfile.apellido:''}`
      : (currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
    nameEl.textContent = displayName;
  }
  updateStatsBar();
  updateSidebarNav();
}

function updateStatsBar() {
  const teamCount = Object.values(S.teams).filter(t=>!t._legacyPending).length;
  let playerCount = 0;
  Object.values(S.teams).forEach(t=>Object.values(t.categories||{}).forEach(c=>{playerCount+=(c.players||[]).length;}));
  let totP=0,totAll=0;
  for(let i=0;i<(S.statsPeriod||7);i++){
    const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    Object.values(S.teams).forEach(t=>Object.values(t.categories||{}).forEach(c=>{
      const da=(c.attendance||{})[ds]||{};
      (c.players||[]).forEach(p=>{const s=da[p.id];if(s==='P'||s==='T'||s==='A'||s==='L'||s==='J'){totAll++;if(s==='P'||s==='T')totP++;}});
    }));
  }
  const attStr=totAll>0?Math.round(totP/totAll*100)+'%':'—';
  let sessToday=0;
  Object.values(S.teams).forEach(t=>Object.values(t.categories||{}).forEach(c=>{if((c.sessions||{})[TODAY])sessToday++;}));
  const ge=id=>document.getElementById(id);
  if(ge('nxs-teams'))    ge('nxs-teams').textContent   =teamCount||'—';
  if(ge('nxs-players'))  ge('nxs-players').textContent =playerCount||'—';
  if(ge('nxs-att'))      ge('nxs-att').textContent     =attStr;
  if(ge('nxs-sessions')) ge('nxs-sessions').textContent=sessToday||'—';
  document.querySelectorAll('.nxs-pd').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.days)===(S.statsPeriod||7)));
}

function goToTodaySessions(){
  const hits=[];
  Object.keys(S.teams).forEach(tid=>{
    const t=S.teams[tid];
    if(t._legacyPending)return;
    Object.keys(t.categories||{}).forEach(cid=>{if((t.categories[cid].sessions||{})[TODAY])hits.push({tid,cid});});
  });
  if(!hits.length)return;
  const{tid,cid}=hits[0];
  S.teamId=tid;S.cat=cid;S.lastCatTid=tid;S.lastCatCid=cid;
  S.view='cat';S.tab='session';
  loadSession();loadSessionDraft();S.sessionPlans={};loadSessionPlans().then(()=>render());
}
function sidebarOpenTeam(tid){S.teamId=tid;S.view='team';S.teamFormMode=null;S.catFormMode=null;render();}
function sidebarOpenCat(tid,cid){S.teamId=tid;S.cat=cid;S.lastCatTid=tid;S.lastCatCid=cid;S.view='cat';S.tab='attend';S.date=TODAY;loadSession();loadSessionDraft();render();}
function openPrograms(){S.view='programs';S.programView=null;S.programForm=null;render();}
function sidebarToggleAccess(tid){S.teamId=tid;S.accessPanel=!S.accessPanel;S.inviteLink=null;S.inviteForm={role:'editor',permissions:{},email:''};if(S.accessPanel)loadTeamMembers(tid);render();}
function updateSidebarNav(){
  const nav=document.getElementById('nx-sidebar-nav');
  if(!nav)return;
  const chevR=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`;
  const tids=Object.keys(S.teams).filter(tid=>!S.teams[tid]?._legacyPending);
  if(!tids.length){nav.innerHTML='<div style="padding:8px 12px;font-size:12px;color:var(--text-2);">Sin equipos aún</div>';return;}
  let h='';
  tids.forEach(tid=>{
    const t=S.teams[tid];
    const isOwn=myRole(tid)==='owner';
    const cats=Object.entries(t.categories||{}).filter(([cid])=>canView(tid,cid));
    const crest=t.name.slice(0,2).toUpperCase();
    const totalPlayers=cats.reduce((s,[,c])=>s+(c.players||[]).length,0);
    const isOpen=S.teamId===tid||cats.some(([cid])=>S.view==='cat'&&S.cat===cid&&S.teamId===tid);
    h+=`<div class="q-tree__group">`;
    h+=`<div class="q-tree__team${isOpen?' open':''}" onclick="sidebarOpenTeam('${tid}')">`;
    h+=`<span class="chev">${chevR}</span><span class="crest">${crest}</span><span class="name">${t.name}</span><span class="count">${totalPlayers}</span>`;
    if(isOwn) h+=`<button onclick="event.stopPropagation();sidebarToggleAccess('${tid}')" title="Acceso" style="background:transparent;border:0;color:var(--text-2);cursor:pointer;padding:2px 4px;border-radius:4px;font-size:12px;">👥</button>`;
    h+=`</div>`;
    if(isOpen&&cats.length){
      h+=`<div class="q-tree__cats">`;
      cats.forEach(([cid,c])=>{
        const active=S.view==='cat'&&S.teamId===tid&&S.cat===cid;
        const n=(c.players||[]).length;
        h+=`<div class="q-tree__cat${active?' active':''}" onclick="sidebarOpenCat('${tid}','${cid}')"><span class="dot" style="background:${c.color||'var(--accent)'}"></span><span class="label">${c.name}</span><span class="n">${n}</span></div>`;
      });
      h+=`</div>`;
    }
    h+=`</div>`;
  });
  // Programs section
  const progCount=Object.keys(S.programs||{}).length;
  const exCount=Object.keys(S.exercises?.personal||{}).length;
  const progActive=S.view==='programs';
  const exActive=S.view==='myexercises';
  h=`<div class="q-tree__section-label">MIS EQUIPOS</div>`+h;
  h+=`<div class="q-tree__section-label" style="margin-top:8px;">BIBLIOTECA</div>`;
  h+=`<div class="q-tree__cat${progActive?' active':''}" onclick="openPrograms()" style="border-radius:8px;">`;
  h+=`<span style="font-size:13px;">📋</span><span class="label" style="margin-left:6px;">Programas</span><span class="n">${progCount||''}</span></div>`;
  h+=`<div class="q-tree__cat${exActive?' active':''}" onclick="openMyExercises()" style="border-radius:8px;">`;
  h+=`<span style="font-size:13px;">🏋️</span><span class="label" style="margin-left:6px;">Mis ejercicios</span><span class="n">${exCount||''}</span></div>`;
  // Subscription section
  const tierKey=S.betaMode?'beta':getEffectiveTier();
  const tierLabels={beta:'Beta',free:'Free',pro:'Pro',elite:'Elite'};
  const tierLabel=tierLabels[tierKey]||tierKey;
  h+=`<div class="q-tree__section-label" style="margin-top:8px;">CUENTA</div>`;
  h+=`<div class="q-tree__cat q-sub-entry" onclick="openSubscriptionModal()" style="border-radius:8px;">`;
  h+=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  h+=`<span class="label" style="margin-left:6px;">Suscripción</span><span class="q-tier-pill q-tier-pill--${tierKey}">${tierLabel}</span></div>`;
  nav.innerHTML=h;
  // Update sidebar badge
  const badge=document.getElementById('sidebar-tier-badge');
  if(badge){badge.textContent=tierLabel;badge.className=`q-tier-badge q-tier-badge--${tierKey}`;}
  // avatar / role footer
  const av=document.getElementById('nx-sidebar-avatar');
  const roleEl=document.getElementById('nx-sidebar-role');
  const n=S.userProfile?.nombre?S.userProfile.nombre:(currentUser?.displayName||currentUser?.email?.split('@')[0]||'—');
  const initials=n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  if(av)av.textContent=initials;
  const su=document.getElementById('nx-sidebar-user');
  if(su)su.textContent=n;
  if(roleEl){const p=S.userProfile;roleEl.textContent=p?.rol||p?.club||'Preparador físico';}
}

function handleHeaderLogoClick() {
  if (S.view === 'team') { S.view='home'; S.teamId=null; S.teamFormMode=null; render(); }
  else if (S.view === 'cat') { S.view='team'; S.catFormMode=null; render(); }
  else if (S.view === 'athlete') {
    if (S.prevCat) { S.view='cat'; S.teamId=S.prevTeamId||S.teamId; S.cat=S.prevCat; }
    else if (S.prevTeamId) { S.view='team'; S.teamId=S.prevTeamId; }
    else { S.view='home'; }
    S.athleteForm=null; render();
  }
}

// ── User Profile ──────────────────────────────────────────────
const COUNTRIES = ['Uruguay','Argentina','Brasil','Chile','Paraguay','Bolivia','Perú','Colombia','Venezuela','España','México','Estados Unidos','Otro'];
const ROLES = ['Entrenador Principal','Asistente Técnico','Preparador Físico','Nutricionista','Médico','Director Deportivo','Coordinador','Otro'];

function openProfile() { S.profileView = true; render(); }

// ── Admin actions ──────────────────────────────────────────────
async function toggleBetaMode(){
  if(!isAdmin()) return;
  const next = !S.betaMode;
  try {
    await db.ref('config/app/betaMode').set(next);
    S.betaMode = next;
    showAlert(next ? 'Beta activada — todos en Elite' : 'Beta desactivada — tiers reales activos');
    render();
  } catch(e){ showAlert('Error al actualizar betaMode: ' + e.message); }
}

async function setTeamTierOverride(tid, tier){
  if(!isAdmin()) return;
  const sub = {
    tier,
    status: 'active',
    manualOverride: true,
    overrideReason: 'Admin override',
    overrideBy: currentUser.uid,
    overrideAt: TODAY,
  };
  try {
    await db.ref(`teams/${tid}/subscription`).update(sub);
    if(S.teams[tid]) S.teams[tid].subscription = {...(S.teams[tid].subscription||{}), ...sub};
    if(S.adminTeams?.[tid]) S.adminTeams[tid].subscription = {...(S.adminTeams[tid].subscription||{}), ...sub};
    const tname = S.adminTeams?.[tid]?.name || S.teams[tid]?.name || tid;
    showAlert(`Tier de "${tname}" actualizado a ${tier}`);
    render();
  } catch(e){ showAlert('Error al actualizar tier: ' + e.message); }
}

async function loadAdminTeams(){
  if(!isAdmin()) return;
  try {
    const snap = await db.ref('teams').get();
    S.adminTeams = snap.exists() ? snap.val() : {};
    render();
  } catch(e){ showAlert('Error al cargar equipos: ' + e.message); }
}

function renderAdminPanel(){
  if(!isAdmin()) return '';
  const betaOn = S.betaMode;
  const allTeams = S.adminTeams;
  let teamRows;
  if(allTeams === null){
    teamRows = `<button class="q-admin-load-btn" onclick="loadAdminTeams()">Cargar todos los equipos</button>`;
  } else {
    const tids = Object.keys(allTeams).filter(tid=>allTeams[tid]?.name);
    teamRows = tids.length ? tids.map(tid=>{
      const t = allTeams[tid];
      const sub = t.subscription || {};
      const currentTier = sub.tier || 'free';
      const isOverride = !!sub.manualOverride;
      return `<div class="q-admin-team-row">
        <div class="q-admin-team-info">
          <span class="q-admin-team-name">${t.name}</span>
          ${isOverride?`<span class="q-admin-override-badge">override</span>`:''}
          <span style="font-size:10px;color:var(--text-3);">${t.ownerId===currentUser.uid?'(tuyo)':''}</span>
        </div>
        <select class="q-admin-tier-select" onchange="setTeamTierOverride('${tid}',this.value)">
          ${['free','pro','elite'].map(tier=>`<option value="${tier}"${currentTier===tier?' selected':''}>${TIER_CONFIG[tier].label}</option>`).join('')}
        </select>
      </div>`;
    }).join('') : '<div style="font-size:12px;color:var(--text-2);padding:8px 0;">Sin equipos en la base de datos</div>';
    teamRows += `<button class="q-admin-load-btn" onclick="loadAdminTeams()" style="margin-top:10px;">Recargar</button>`;
  }

  return `<div class="q-admin-panel">
    <div class="q-admin-panel__header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Panel de Admin
    </div>

    <div class="q-admin-section">
      <div class="q-admin-section__label">Modo Beta</div>
      <div class="q-admin-beta-row">
        <div>
          <div style="font-size:13px;color:var(--text-0);font-weight:500;">${betaOn ? 'Activo — todos en Elite' : 'Inactivo — tiers reales'}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px;">${betaOn ? 'Ningún usuario ve restricciones.' : 'Los límites de cada plan están activos.'}</div>
        </div>
        <button class="q-admin-toggle${betaOn?' q-admin-toggle--on':''}" onclick="toggleBetaMode()">
          <span class="q-admin-toggle__dot"></span>
        </button>
      </div>
    </div>

    <div class="q-admin-section">
      <div class="q-admin-section__label">Override de tier por equipo</div>
      <div style="font-size:11px;color:var(--text-2);margin-bottom:10px;">Ignorado mientras betaMode esté activo.</div>
      ${teamRows}
    </div>
  </div>`;
}

function renderProfileView() {
  const p = S.userProfile || {};
  return `<div class="wrap">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="width:56px;height:56px;border-radius:14px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0;">
        ${p.nombre?p.nombre[0].toUpperCase():'👤'}
      </div>
      <div>
        <div style="font-size:16px;font-weight:600;color:var(--text);">${p.nombre?p.nombre+' '+(p.apellido||''):'Mi perfil'}</div>
        <div style="font-size:12px;color:var(--text3);">${currentUser?.email||''}</div>
      </div>
    </div>
    <div class="form-card">
      <div class="form-card-title">Datos personales <button class="sm-btn" data-action="cancelprofile">✕ Cerrar</button></div>
      <div class="form-grid-2">
        <div class="form-field"><label>Nombre</label><input type="text" id="pf-nombre" value="${p.nombre||''}" placeholder="Juan"></div>
        <div class="form-field"><label>Apellido</label><input type="text" id="pf-apellido" value="${p.apellido||''}" placeholder="García"></div>
      </div>
      <div class="form-section-label">Información profesional</div>
      <div class="form-grid-2">
        <div class="form-field"><label>País</label>
          <select id="pf-pais">${COUNTRIES.map(c=>`<option value="${c}"${p.pais===c?' selected':''}>${c}</option>`).join('')}</select>
        </div>
        <div class="form-field"><label>Rol en el club</label>
          <select id="pf-rol">${ROLES.map(r=>`<option value="${r}"${p.rol===r?' selected':''}>${r}</option>`).join('')}</select>
        </div>
        <div class="form-field" style="grid-column:1/-1;"><label>Club / Institución</label>
          <input type="text" id="pf-club" value="${p.club||''}" placeholder="Club / Institución">
        </div>
        <div class="form-field" style="grid-column:1/-1;"><label>Licencia / Matrícula (opcional)</label>
          <input type="text" id="pf-licencia" value="${p.licencia||''}" placeholder="Nº de licencia profesional">
        </div>
      </div>
      <div class="form-row"><button class="save-btn" style="width:100%;" data-action="saveprofile">Guardar perfil</button></div>
    </div>
    <div style="margin-top:8px;text-align:center;">
      <button class="sm-btn" style="color:#fca5a5;border-color:#991b1b;" onclick="doLogout()">Cerrar sesión</button>
    </div>
    ${isAdmin() ? renderAdminPanel() : ''}
  </div>`;
}

function normalizeTeam(tid) {
  const team = S.teams[tid];
  if (!team) return;
  if (!team.categories || typeof team.categories !== 'object') team.categories={};
  Object.keys(team.categories).forEach(cid => {
    const c = team.categories[cid];
    if (!c.players) c.players=[];
    else if (!Array.isArray(c.players)) c.players=Object.values(c.players);
    if (!c.attendance || typeof c.attendance !== 'object') c.attendance={};
    if (!c.sessions || typeof c.sessions !== 'object') c.sessions={};
    // Normalize sessions
    Object.values(c.sessions).forEach(sess=>{
      if(!sess.playerRPE||typeof sess.playerRPE!=='object') sess.playerRPE={};
      if(!sess.wellness||typeof sess.wellness!=='object') sess.wellness={};
    });
  });
}

// ── Migration: legacy users/{uid}/teams/ → /teams/{teamId} ───
async function migrateToSharedSpace(legacyTeams) {
  // Step 1: always build in-memory state from legacy data first
  // so the app works even if Firebase write fails
  S.teams={};
  S.memberships={};
  const writes={};
  for(const [tid, team] of Object.entries(legacyTeams)){
    const teamData={...team, ownerId:currentUser.uid};
    writes[`teams/${tid}`]=teamData;
    writes[`users/${currentUser.uid}/memberships/${tid}`]={role:'owner',permissions:{},joinedAt:TODAY};
    S.teams[tid]=teamData;
    S.memberships[tid]={role:'owner',permissions:{},joinedAt:TODAY};
    normalizeTeam(tid);
  }
  // Migrate athletes from users/{uid}/athletes/ → teams/{tid}/athletes/
  try {
    const aSnap = await db.ref(`users/${currentUser.uid}/athletes`).get();
    if(aSnap.exists()){
      const oldAths = aSnap.val()||{};
      Object.entries(oldAths).forEach(([key,val])=>{
        const parts=key.split('__'); const tid=parts[0];
        if(S.teams[tid]) writes[`teams/${tid}/athletes/${key}`]=val;
      });
    }
  } catch(e) { console.warn('Could not read legacy athletes'); }

  // Step 2: try to write to new shared structure
  // If this fails (e.g. rules), the app still works via the legacy fallback in loadAll
  try {
    await db.ref().update(writes);
    // Only remove legacy AFTER confirmed write success
    await db.ref(`users/${currentUser.uid}/teams`).remove();
    console.log('Migration to shared space complete');
  } catch(e) {
    console.warn('Migration write blocked (likely Firebase rules) — app will use legacy path until rules are updated. Error:', e.message);
    // S.teams and S.memberships are already populated above — app continues working
  }
}
// ── Old v1 data migration (keeps backward compat) ─────────────
async function migrateOldData() {
  try {
    const dSnap = await db.ref(`users/${currentUser.uid}/data`).get();
    if (!dSnap.exists()) { S.teams={}; return; }
    const oldData = dSnap.val();
    const tid = 'team_'+Date.now();
    const colorMap = {U16A:'#2563eb',U18A:'#d97706',U18B:'#059669'};
    const cats={};
    const catIdMap={};
    ['U16A','U18A','U18B'].forEach(c=>{
      if(oldData[c]){
        const cid='cat_'+Date.now()+'_'+c;
        catIdMap[c]=cid;
        cats[cid]={name:c,color:colorMap[c]||'#2563eb',players:Array.isArray(oldData[c].players)?oldData[c].players:Object.values(oldData[c].players||[]),attendance:oldData[c].attendance||{},sessions:oldData[c].sessions||{}};
      }
    });
    const team={name:'Mi equipo',sport:'Básquetbol',createdAt:TODAY,ownerId:currentUser.uid,categories:cats};
    S.teams={[tid]:team};
    S.memberships={[tid]:{role:'owner',permissions:{},joinedAt:TODAY}};
    const writes={};
    writes[`teams/${tid}`]=team;
    writes[`users/${currentUser.uid}/memberships/${tid}`]={role:'owner',permissions:{},joinedAt:TODAY};
    const aSnap=await db.ref(`users/${currentUser.uid}/athletes`).get();
    if(aSnap.exists()){
      const oldAths=aSnap.val();
      Object.entries(oldAths).forEach(([oldKey,athData])=>{
        const parts=oldKey.split('__'); const oldCat=parts[0]; const pid=parts.slice(1).join('__');
        const cid=catIdMap[oldCat];
        if(cid) writes[`teams/${tid}/athletes/${tid}__${cid}__${pid}`]=athData;
      });
    }
    await db.ref().update(writes);
  } catch(e) { console.error('Migration failed:',e); S.teams={}; }
}

async function persistTeam(tid=S.teamId) {
  if(!currentUser||!S.teams[tid]) return;
  setSyncBar('saving');
  const {athletes:_ath, ...teamData} = S.teams[tid];
  try {
    const clean=JSON.parse(JSON.stringify({...teamData, ownerId: S.teams[tid].ownerId||currentUser.uid}));
    await db.ref(`teams/${tid}`).update(clean);
    setSyncBar('ok');
  } catch(e) {
    console.error('persistTeam error:', e.code, e.message, e);
    setSyncBar('error', e.code||e.message||'Error al guardar');
  }
}

async function persistCat(tid=S.teamId, cid=S.cat) {
  if(!currentUser||!S.teams[tid]?.categories?.[cid]) return;
  setSyncBar('saving');
  try {
    const clean=JSON.parse(JSON.stringify(S.teams[tid].categories[cid]));
    await db.ref(`teams/${tid}/categories/${cid}`).set(clean);
    setSyncBar('ok');
  } catch(e) {
    console.error('persistCat error:', e.code, e.message, e);
    setSyncBar('error', e.code||e.message||'Error al guardar');
  }
}

async function saveAthlete(key) {
  if(!currentUser) return;
  const tid=key.split('__')[0];
  setSyncBar('saving');
  try {
    const clean=JSON.parse(JSON.stringify(S.athletes[key]));
    await db.ref(`teams/${tid}/athletes/${key}`).set(clean);
    setSyncBar('ok');
  } catch(e) {
    console.error('saveAthlete error:', e.code, e.message, e);
    setSyncBar('error', e.code||e.message||'Error al guardar');
  }
}

// ── Permission helpers ────────────────────────────────────────
function myRole(tid=S.teamId){ return (S.memberships[tid]||{}).role||null; }
function isOwner(tid=S.teamId){ return myRole(tid)==='owner'; }
function canEdit(tid=S.teamId, cid=S.cat){
  const role=myRole(tid); if(!role) return false;
  if(role==='owner') return true;
  if(role==='editor'){
    const perms=(S.memberships[tid]||{}).permissions||{};
    if(!Object.keys(perms).length) return true; // no restrictions = all cats editable
    const p=perms[cid];
    return !p || p==='edit'; // missing key or explicit 'edit' → can edit
  }
  return false;
}
function canView(tid=S.teamId, cid=S.cat){
  const role=myRole(tid); if(!role) return false;
  if(role==='owner'||role==='editor') return true;
  const perms=(S.memberships[tid]||{}).permissions||{};
  if(!Object.keys(perms).length) return true;
  const p=perms[cid];
  return !p || p==='view'||p==='edit'; // missing = can view
}

// ── Invitation system ─────────────────────────────────────────
function genToken(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); }

async function createInvitation(tid, email, role, permissions){
  const token = genToken();
  const now = new Date();
  const exp = new Date(now); exp.setDate(exp.getDate()+7);
  const inv = {
    teamId:tid, teamName:S.teams[tid]?.name||'',
    invitedEmail:email.toLowerCase(), role, permissions,
    createdByUid:currentUser.uid,
    createdAt:now.toISOString(), expiresAt:exp.toISOString(), status:'pending'
  };
  // Write to global invitations (for the token link) AND to team's pendingInvites (for owner panel)
  await db.ref().update({
    [`invitations/${token}`]: inv,
    [`teams/${tid}/pendingInvites/${token}`]: {
      invitedEmail: email.toLowerCase(), role, permissions,
      createdAt: now.toISOString(), expiresAt: exp.toISOString()
    }
  });
  return token;
}

async function handlePendingInvite(token){
  try {
    const snap = await db.ref(`invitations/${token}`).get();
    if(!snap.exists()){ S.pendingInvite=null; return; }
    const inv = snap.val();
    if(inv.status!=='pending'){ showAlert('Esta invitación ya fue usada.'); S.pendingInvite=null; return; }
    if(new Date()>new Date(inv.expiresAt)){ showAlert('Esta invitación expiró (7 días).'); S.pendingInvite=null; return; }
    // Hard block: invitation must match the logged-in user's email
    if(inv.invitedEmail && inv.invitedEmail!==currentUser.email?.toLowerCase()){
      showAlert(`Esta invitación es para ${inv.invitedEmail}. Estás logueado como ${currentUser.email}. Por favor cerrá sesión e ingresá con la cuenta correcta.`);
      S.pendingInvite=null;
      window.history.replaceState({},'',window.location.pathname);
      return;
    }
    S.pendingInviteData={token,...inv};
    S.showInviteModal=true;
    render();
  } catch(e){ console.error('Error loading invite:',e); }
}

async function acceptInvitation(){
  const inv = S.pendingInviteData;
  if(!inv||!currentUser) return;
  const {token, teamId, role, permissions} = inv;
  try {
    // Step 1: write membership first so the teams/ rule passes in step 2
    await db.ref(`users/${currentUser.uid}/memberships/${teamId}`).set({role,permissions,joinedAt:TODAY});
    // Step 2: write to teams/ + mark invite accepted + write notification for owner + remove from pendingInvites
    const notifId = 'notif_'+Date.now();
    await db.ref().update({
      [`invitations/${token}/status`]:'accepted',
      [`invitations/${token}/acceptedByUid`]:currentUser.uid,
      [`teams/${teamId}/memberIndex/${currentUser.uid}`]:{email:currentUser.email,role,displayName:currentUser.displayName||''},
      [`teams/${teamId}/memberPermissions/${currentUser.uid}`]:{role,permissions},
      [`teams/${teamId}/pendingInvites/${token}`]:null, // remove from pending
      [`teams/${teamId}/notifications/${notifId}`]:{
        type:'invite_accepted',
        uid:currentUser.uid,
        email:currentUser.email||'',
        displayName:currentUser.displayName||currentUser.email?.split('@')[0]||'Usuario',
        role,
        timestamp:new Date().toISOString(),
        read:false
      }
    });
    S.memberships[teamId]={role,permissions,joinedAt:TODAY};
    const tSnap = await db.ref(`teams/${teamId}`).get();
    if(tSnap.exists() && tSnap.val()?.name){
      S.teams[teamId]=tSnap.val(); normalizeTeam(teamId);
    } else {
      S.teams[teamId]={ name: inv.teamName||'Equipo compartido', sport:'', categories:{}, _legacyPending:true };
    }
    S.pendingInvite=null; S.pendingInviteData=null; S.showInviteModal=false;
    window.history.replaceState({},'',window.location.pathname);
    render();
    showAlert(`✓ Te uniste a "${inv.teamName}" como ${role==='editor'?'Editor':'Lector'}.`);
  } catch(e){ console.error('Error accepting invite:',e); showAlert('Error al aceptar la invitación.'); }
}

async function revokeAccess(tid, memberUid){
  showConfirm('¿Quitar acceso a este usuario?', async()=>{
    try {
      await db.ref(`users/${memberUid}/memberships/${tid}`).remove();
      await db.ref(`teams/${tid}/memberIndex/${memberUid}`).remove();
      await db.ref(`teams/${tid}/memberPermissions/${memberUid}`).remove();
      S.editingMember=null;
      await loadTeamMembers(tid);
      render();
    } catch(e){ showAlert('Error al quitar acceso.'); }
  });
}

async function updateMemberPermissions(tid, memberUid, role, permissions){
  try {
    // Owner writes to teams/ (allowed by rules)
    await db.ref().update({
      [`teams/${tid}/memberIndex/${memberUid}/role`]: role,
      [`teams/${tid}/memberPermissions/${memberUid}`]: {role, permissions}
    });
    // Update local memberIndex display
    await loadTeamMembers(tid);
    S.editingMember=null;
    render();
  } catch(e){ showAlert('Error al actualizar permisos.'); }
}

async function loadTeamMembers(tid){
  try {
    const [idxSnap, permSnap, notifSnap, invSnap] = await Promise.all([
      db.ref(`teams/${tid}/memberIndex`).get(),
      db.ref(`teams/${tid}/memberPermissions`).get(),
      db.ref(`teams/${tid}/notifications`).get(),
      db.ref(`teams/${tid}/pendingInvites`).get()
    ]);
    const index = idxSnap.exists()  ? idxSnap.val()||{}  : {};
    const perms = permSnap.exists() ? permSnap.val()||{} : {};
    S.teamMembers[tid] = Object.entries(index).map(([uid,v])=>({
      uid, ...v, permissions: perms[uid]?.permissions||{}
    }));
    // Notifications: sort newest first, only unread or last 5
    const notifs = notifSnap.exists() ? Object.entries(notifSnap.val()||{}) : [];
    S.teamNotifs[tid] = notifs
      .map(([id,n])=>({id,...n}))
      .sort((a,b)=>b.timestamp?.localeCompare(a.timestamp||'')||0);
    // Pending invites: include expired ones so owner can see/resend
    const invs = invSnap.exists() ? Object.entries(invSnap.val()||{}) : [];
    S.teamInvites[tid] = invs
      .map(([token,v])=>({token,...v}))
      .sort((a,b)=>b.createdAt?.localeCompare(a.createdAt||'')||0);
  } catch(e){ S.teamMembers[tid]=[]; S.teamNotifs[tid]=[]; S.teamInvites[tid]=[]; }
}

async function revokeInvite(tid, token){
  showConfirm('¿Revocar esta invitación? El link dejará de funcionar.', async()=>{
    try {
      await db.ref().update({
        [`invitations/${token}/status`]:'revoked',
        [`teams/${tid}/pendingInvites/${token}`]:null
      });
      S.teamInvites[tid]=(S.teamInvites[tid]||[]).filter(i=>i.token!==token);
      render();
    } catch(e){ showAlert('Error al revocar.'); }
  });
}

async function markNotifsRead(tid){
  const unread=(S.teamNotifs[tid]||[]).filter(n=>!n.read);
  if(!unread.length) return;
  const updates={};
  unread.forEach(n=>{ updates[`teams/${tid}/notifications/${n.id}/read`]=true; });
  try {
    await db.ref().update(updates);
    (S.teamNotifs[tid]||[]).forEach(n=>{ n.read=true; });
  } catch(e){}
}

// ── Access panel render ───────────────────────────────────────
function renderAccessPanel(tid){
  const cats    = Object.entries(S.teams[tid]?.categories||{});
  const members = S.teamMembers[tid]||[];
  const notifs  = S.teamNotifs[tid]||[];
  const invites = S.teamInvites[tid]||[];
  const form    = S.inviteForm;
  const now     = new Date();

  // ── Notifications ──────────────────────────────────────────
  const unreadCount = notifs.filter(n=>!n.read).length;
  let notifsHtml = '';
  if(notifs.length){
    const rows = notifs.slice(0,8).map(n=>{
      const ts = n.timestamp ? new Date(n.timestamp) : null;
      const ago = ts ? timeSince(ts) : '';
      const roleLabel = n.role==='editor' ? 'Editor' : 'Lector';
      return '<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:'+(n.read?'var(--bg2)':'#0c1a2e')+';border-radius:8px;margin-bottom:5px;border:1px solid '+(n.read?'var(--border)':'#1e40af')+';"><span style="font-size:15px;flex-shrink:0;">🎉</span><div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--text);font-weight:'+(n.read?'400':'600')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(n.displayName||n.email)+'</div><div style="font-size:11px;color:var(--text2);">Aceptó como <strong>'+roleLabel+'</strong></div>'+(ago?'<div style="font-size:10px;color:var(--text3);margin-top:1px;">'+ago+'</div>':'')+'</div></div>';
    }).join('');
    notifsHtml = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">Notificaciones'+(unreadCount?' <span style="background:#ef4444;color:#fff;border-radius:20px;padding:1px 6px;font-size:10px;margin-left:4px;">'+unreadCount+' nuevas</span>':'')+'</div>'+(unreadCount?'<button class="sm-btn" data-action="markread" data-tid="'+tid+'" style="font-size:11px;">Marcar leídas</button>':'')+'</div>'+rows+'<div style="border-top:1px solid var(--border);margin:12px 0;"></div>';
  }

  // ── Pending invites ────────────────────────────────────────
  let pendingHtml = '';
  if(invites.length){
    const rows = invites.map(inv=>{
      const exp = new Date(inv.expiresAt);
      const expired = now > exp;
      const daysLeft = expired ? 0 : Math.ceil((exp-now)/(1000*60*60*24));
      const roleLabel = inv.role==='editor' ? 'Editor' : 'Lector';
      const invLink = window.location.origin+window.location.pathname+'?invite='+inv.token;
      const permsStr = JSON.stringify(inv.permissions||{}).replace(/'/g,"&#39;");
      return '<div style="background:var(--bg2);border-radius:8px;padding:9px 10px;margin-bottom:6px;border:1px solid '+(expired?'#7f1d1d':'var(--border')+';">'
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">'
        +'<span style="font-size:11px;font-weight:600;padding:1px 7px;border-radius:12px;background:'+(expired?'#2d0a0a':'#052e16')+';color:'+(expired?'#fca5a5':'#86efac')+';"> '+(expired?'Expirada':'Pendiente')+'</span>'
        +'<span style="font-size:11px;padding:1px 7px;border-radius:12px;background:var(--bg3);color:var(--text3);">'+roleLabel+'</span>'
        +(!expired?'<span style="font-size:11px;color:var(--text3);margin-left:auto;">⏳ '+daysLeft+'d</span>':'')
        +'</div>'
        +'<div style="font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:6px;">'+inv.invitedEmail+'</div>'
        +'<div style="display:flex;gap:5px;flex-wrap:wrap;">'
        +(!expired?'<button class="sm-btn" style="font-size:11px;" data-action="copyinvlink" data-link="'+invLink+'">📋 Copiar link</button>':'')
        +'<button class="sm-btn" style="font-size:11px;" data-action="resendtoinvite" data-tid="'+tid+'" data-email="'+inv.invitedEmail+'" data-role="'+inv.role+'" data-perms=\''+permsStr+'\'>🔄 '+(expired?'Reenviar':'Regenerar')+'</button>'
        +'<button class="sm-btn" style="font-size:11px;color:#fca5a5;border-color:#991b1b;" data-action="revokeinvite" data-tid="'+tid+'" data-token="'+inv.token+'">Revocar</button>'
        +'</div></div>';
    }).join('');
    pendingHtml = '<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Invitaciones ('+invites.length+')</div>'+rows+'<div style="border-top:1px solid var(--border);margin:12px 0;"></div>';
  }

  // ── Member rows ────────────────────────────────────────────
  const memberRows = members.map(m=>{
    if(S.editingMember===m.uid){
      const draft = S.editMemberForm;
      const catPermRows = cats.map(([cid,cat])=>{
        const p = (draft.permissions||{})[cid]||'edit';
        return '<div class="cat-perm-row">'
          +'<span style="flex:1;font-size:12px;color:var(--text);">'+cat.name+'</span>'
          +'<button class="perm-btn '+(p==='edit'?'sel-edit':'')+'" data-action="seteditmperm" data-uid="'+m.uid+'" data-cid="'+cid+'" data-val="edit">Editar</button>'
          +'<button class="perm-btn '+(p==='view'?'sel-view':'')+'" data-action="seteditmperm" data-uid="'+m.uid+'" data-cid="'+cid+'" data-val="view">Ver</button>'
          +'<button class="perm-btn '+(p==='none'?'sel-none':'')+'" data-action="seteditmperm" data-uid="'+m.uid+'" data-cid="'+cid+'" data-val="none">Ninguno</button>'
          +'</div>';
      }).join('');
      return '<div style="background:var(--bg-1);border:1px solid var(--accent);border-radius:10px;padding:12px;margin-bottom:8px;">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
        +'<span style="flex:1;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(m.email||m.uid)+'</span>'
        +'<button class="sm-btn" data-action="canceleditm">Cancelar</button></div>'
        +'<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Rol</div>'
        +'<div style="display:flex;gap:6px;margin-bottom:10px;">'
        +'<button class="perm-btn '+((draft.role||'editor')==='editor'?'sel-edit':'')+'" data-action="seditmerole" data-uid="'+m.uid+'" data-val="editor">Editor</button>'
        +'<button class="perm-btn '+((draft.role||'editor')==='viewer'?'sel-view':'')+'" data-action="seditmerole" data-uid="'+m.uid+'" data-val="viewer">Lector</button>'
        +'</div>'
        +(cats.length?'<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Permisos por categoría</div>'+catPermRows:'')
        +'<button class="save-btn" style="width:100%;margin-top:10px;padding:8px;font-size:13px;" data-action="savememberchanges" data-tid="'+tid+'" data-uid="'+m.uid+'">Guardar cambios</button>'
        +'</div>';
    }
    const rolePillClass = m.role==='owner'?'role-owner':m.role==='editor'?'role-editor':'role-viewer';
    const roleLabel = m.role==='owner'?'Dueño':m.role==='editor'?'Editor':'Lector';
    const isSelf = m.uid===currentUser.uid;
    const permsStr = JSON.stringify(m.permissions||{}).replace(/'/g,"&#39;");
    return '<div class="member-row">'
      +'<span class="role-pill '+rolePillClass+'">'+roleLabel+'</span>'
      +'<span class="member-email">'+(m.email||m.uid)+'</span>'
      +(isSelf
        ? '<span style="font-size:11px;color:var(--text3);">Tú</span>'
        : '<button class="sm-btn" data-action="starteditm" data-uid="'+m.uid+'" data-role="'+m.role+'" data-perms=\''+permsStr+'\'>✏ Editar</button>'
          +'<button class="sm-btn" style="color:#fca5a5;border-color:#991b1b;" data-action="revokeaccess" data-tid="'+tid+'" data-muid="'+m.uid+'">Quitar</button>')
      +'</div>';
  }).join('');

  // ── New invite form ────────────────────────────────────────
  const catPerms = cats.map(([cid,cat])=>{
    const perm = (form.permissions||{})[cid]||'edit';
    return '<div class="cat-perm-row">'
      +'<span style="flex:1;font-size:13px;color:var(--text);">'+cat.name+'</span>'
      +'<button class="perm-btn '+(perm==='edit'?'sel-edit':'')+'" data-action="setcatperm" data-cid="'+cid+'" data-val="edit">Editar</button>'
      +'<button class="perm-btn '+(perm==='view'?'sel-view':'')+'" data-action="setcatperm" data-cid="'+cid+'" data-val="view">Ver</button>'
      +'<button class="perm-btn '+(perm==='none'?'sel-none':'')+'" data-action="setcatperm" data-cid="'+cid+'" data-val="none">Ninguno</button>'
      +'</div>';
  }).join('');

  const linkSection = S.inviteLink
    ? '<div style="font-size:12px;color:#86efac;margin-bottom:4px;font-weight:500;">✓ Compartí este link:</div>'
      +'<div class="invite-link-box">'+S.inviteLink+'</div>'
      +'<button class="save-btn" style="width:100%;padding:8px;font-size:13px;background:var(--bg2);color:var(--accent);border:1px solid var(--accent);" data-action="copyinvitelink">📋 Copiar link</button>'
    : '';

  return '<div class="access-panel">'
    +'<div class="access-panel-title">👥 Gestionar acceso <button class="sm-btn" data-action="toggleaccess">✕ Cerrar</button></div>'
    + notifsHtml
    + pendingHtml
    +(members.length
      ? '<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Miembros activos ('+members.length+')</div>'+memberRows
      : '<div style="font-size:12px;color:var(--text3);margin-bottom:10px;">Sin miembros aún.</div>')
    +'<div style="border-top:1px solid var(--border);margin:12px 0;"></div>'
    +'<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Nueva invitación</div>'
    +'<div class="form-field" style="margin-bottom:8px;"><label>Email del invitado</label>'
    +'<input type="email" id="inv-email" class="form-input" style="margin:0;padding:8px 10px;font-size:13px;" placeholder="entrenador@club.com" value="'+(form.email||'')+'"></div>'
    +'<div class="form-field" style="margin-bottom:8px;"><label>Rol</label>'
    +'<div style="display:flex;gap:6px;margin-top:4px;">'
    +'<button class="perm-btn '+((form.role||'editor')==='editor'?'sel-edit':'')+'" data-action="setinviterole" data-val="editor">Editor</button>'
    +'<button class="perm-btn '+((form.role||'editor')==='viewer'?'sel-view':'')+'" data-action="setinviterole" data-val="viewer">Lector</button>'
    +'</div></div>'
    +(cats.length ? '<div style="font-size:11px;color:var(--text3);margin:8px 0 4px;">Permisos por categoría</div>'+catPerms : '')
    +'<button class="save-btn" style="width:100%;margin-top:12px;" data-action="sendinvite" data-tid="'+tid+'">Generar link de invitación</button>'
    + linkSection
    +'</div>';
}

// ── Invite accept modal ───────────────────────────────────────
function renderInviteModal(){
  const inv = S.pendingInviteData;
  if(!inv) return '';
  const teamName = inv.teamName||inv.teamId;
  const role = inv.role==='editor'?'Editor':'Lector (solo lectura)';
  const perms = Object.entries(inv.permissions||{});
  const permDetail = perms.length ? perms.map(([cid,p])=>`<span style="font-size:11px;background:var(--bg2);padding:2px 8px;border-radius:12px;">${cid}: ${p}</span>`).join(' ') : '<span style="font-size:12px;color:var(--text2);">Acceso a todas las categorías</span>';
  return`<div class="invite-modal">
    <div class="invite-modal-card">
      <div style="text-align:center;margin-bottom:8px;"><img src="public/brand/logo.png" style="width:44px;height:44px;object-fit:contain;"></div>
      <div style="font-size:17px;font-weight:700;text-align:center;margin-bottom:4px;">Invitación al equipo</div>
      <div style="font-size:14px;color:var(--text2);text-align:center;margin-bottom:16px;">${teamName}</div>
      <div style="background:var(--bg2);border-radius:10px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-size:12px;color:var(--text3);margin-bottom:4px;">Tu rol</div>
        <div style="font-size:15px;font-weight:600;color:var(--text);">${role}</div>
        ${perms.length?`<div style="font-size:12px;color:var(--text3);margin-top:8px;margin-bottom:4px;">Categorías</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${permDetail}</div>`:''}
      </div>
      <button class="save-btn" style="width:100%;margin-bottom:8px;" data-action="acceptinvite">Aceptar invitación</button>
      <button class="sm-btn" style="width:100%;padding:8px;" data-action="dismissinvite">Rechazar</button>
    </div>
  </div>`;
}

function getAthlete(key) {
  if(!S.athletes[key]) S.athletes[key]={};
  const a=S.athletes[key];
  if(!a.personal) a.personal={};
  if(!a.morphology||typeof a.morphology!=='object') a.morphology={};
  if(!a.anthropometry||typeof a.anthropometry!=='object') a.anthropometry={};
  if(!a.jumpTests||typeof a.jumpTests!=='object') a.jumpTests={};
  if(!a.fmsTests||typeof a.fmsTests!=='object') a.fmsTests={};
  return a;
}

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = d=>{if(!d)return'';const[y,m,day]=d.split('-');return`${day}/${m}/${y}`;};
function timeSince(date){const s=Math.floor((new Date()-date)/1000);if(s<60)return'Hace un momento';const m=Math.floor(s/60);if(m<60)return`Hace ${m} min`;const h=Math.floor(m/60);if(h<24)return`Hace ${h}h`;const d=Math.floor(h/24);return`Hace ${d} día${d!==1?'s':''}`;};
const fmtMonth= ym=>{const[y,m]=ym.split('-');return`${MES[+m-1]} '${y.slice(2)}`;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function calcAge(bd){if(!bd)return null;const b=new Date(bd),t=new Date();let a=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;return a;}
function wellColor(v){return W_COLORS[v-1]||'#64748b';}
function pctClass(p){return p>=75?'badge-ok':p>=50?'badge-mid':'badge-bad';}
function pctBadge(pct){
  if(pct===null)return`<span style="font-size:14px;color:var(--text3);">—</span>`;
  const bg=pct>=75?'#052e16':pct>=50?'#1c1400':'#2d0a0a';
  const c=pct>=75?'#86efac':pct>=50?'#fcd34d':'#fca5a5';
  return`<span style="font-size:14px;font-weight:500;padding:2px 9px;border-radius:20px;background:${bg};color:${c};">${pct}%</span>`;
}
function acwrZone(v){
  if(v===null)return{bg:'#1e293b33',fg:'#64748b',label:'Sin datos',border:'#1e293b'};
  if(v<0.8)   return{bg:'#1e293b',fg:'#94a3b8',label:'Subcarga',border:'#475569'};
  if(v<=1.3)  return{bg:'#052e16',fg:'#86efac',label:'Óptimo',border:'#166534'};
  if(v<=1.5)  return{bg:'#1c1400',fg:'#fcd34d',label:'Precaución',border:'#92400e'};
  return{bg:'#2d0a0a',fg:'#fca5a5',label:'Riesgo',border:'#991b1b'};
}
function monoZone(v){return!v?{fg:'#64748b'}:v<1.5?{fg:'#86efac'}:v<=2.0?{fg:'#fcd34d'}:{fg:'#fca5a5'};}
function wellZone(v){return v===null?{fg:'#64748b'}:v>=4?{fg:'#86efac'}:v>=3?{fg:'#22c55e'}:v>=2?{fg:'#d97706'}:{fg:'#dc2626'};}
function sparkColor(v,max){if(!v)return'var(--bg2)';const r=max>0?v/max:0;return r<0.4?'#22c55e':r<0.7?'#f59e0b':'#ef4444';}
function sparkColorByType(v,max,type){if(!v)return type==='libre'?'#1e293b':'var(--bg2)';if(type==='partido')return'#6366f1';if(type==='recuperacion')return'#0891b2';if(type==='libre')return'#334155';return sparkColor(v,max);}
function sessionTypesWindowRange(cd,from,to){const result=[];const start=new Date(from+'T12:00:00'),end=new Date(to+'T12:00:00');for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))result.push(cd.sessions?.[d.toISOString().split('T')[0]]?.sessionType||null);return result;}
function deltaHtml(curr,prev){if(prev==null||curr==null)return'';const d=curr-prev;if(Math.abs(d)<0.01)return'';const cls=d>0?'delta-up':'delta-dn';return`<div class="eval-delta ${cls}">${d>0?'+':''}${d.toFixed(1)}</div>`;}
function checkIcon(ok){return ok?`<span style="color:#86efac;font-weight:700;">✓</span>`:`<span style="color:#fca5a5;font-weight:700;">✗</span>`;}
function rsiZone(rsi){if(!rsi)return{bg:'#1e293b',fg:'#64748b',label:'—'};if(rsi<1.5)return{bg:'#2d0a0a',fg:'#fca5a5',label:'Bajo'};if(rsi<2.0)return{bg:'#1c1400',fg:'#fcd34d',label:'Promedio'};if(rsi<2.5)return{bg:'#052e16',fg:'#86efac',label:'Bueno'};return{bg:'#0c1a2e',fg:'#60a5fa',label:'Excelente'};}

// Thresholds: auto-detect from category name
function getThresholds(catId=S.cat, tid=S.teamId) {
  const name = getCatName(catId, tid);
  const isMenores = /U14|U16|U18/i.test(name);
  if(isMenores) return{s6p:60,zadip:-1.75,imo:4.0,zmuscle:1.60,zdiff:3.35,zdiffTarget:4.0,label:'Menores (U14–U18)'};
  return{s6p:60,zadip:-1.95,imo:4.2,zmuscle:1.75,zdiff:3.70,zdiffTarget:4.0,zdiffIdeal:5.0,label:'Pro / U20'};
}
function perfColor(zA,zM,diff,th){
  if(zA===null||zM===null)return null;
  const d=diff!==null?diff:zM-zA;
  const ao=zA<th.zadip, mo=zM>th.zmuscle, dOk=d>=th.zdiff;
  if(dOk&&ao&&mo)return d>=th.zdiffTarget?{bg:'#052e16',fg:'#86efac',label:'Óptimo ✓',sub:'Composición ideal'}:{bg:'#052e16',fg:'#86efac',label:'Bueno ✓',sub:'Sobre umbral mínimo'};
  if(!mo&&ao) return{bg:'#1c1400',fg:'#fcd34d',label:'↑ Aumentar músculo',sub:'Z muscular bajo umbral'};
  if(mo&&!ao) return{bg:'#1c0500',fg:'#fb923c',label:'↓ Reducir adiposo',sub:'Z adiposa sobre umbral'};
  return{bg:'#2d0a0a',fg:'#fca5a5',label:'Revisar composición',sub:'Ambas masas fuera de rango'};
}

// ── Load calculations ─────────────────────────────────────────
function playerLoadOnDate(cd,pid,dateStr){
  const att=cd.attendance[dateStr]?.[pid];
  if(att!=='P')return 0;
  const sess=cd.sessions?.[dateStr];
  if(!sess||!sess.duration)return 0;
  const rpe=(sess.playerRPE&&sess.playerRPE[pid]!=null)?sess.playerRPE[pid]:sess.teamRPE;
  if(rpe==null)return 0;
  const dur=(sess.playerDuration&&sess.playerDuration[pid]!=null)?sess.playerDuration[pid]:sess.duration;
  return rpe*dur;
}
function loadsWindow(cd,pid,endDate,days){
  const result=[];const end=new Date(endDate+'T12:00:00');
  for(let i=days-1;i>=0;i--){const d=new Date(end);d.setDate(d.getDate()-i);result.push(playerLoadOnDate(cd,pid,d.toISOString().split('T')[0]));}
  return result;
}
function calcMetrics(cd,pid){
  const l7=loadsWindow(cd,pid,TODAY,7);
  const l28=loadsWindow(cd,pid,TODAY,28);
  const ac=l7.reduce((a,b)=>a+b,0);
  const cc=l28.reduce((a,b)=>a+b,0)/4;
  const mean7=ac/7;
  const sd7=Math.sqrt(l7.reduce((a,v)=>a+Math.pow(v-mean7,2),0)/7);
  const rawMono=sd7>0?mean7/sd7:(mean7>0?99:0);
  const monotony=Math.min(rawMono,99);
  const strain=Math.round(ac*monotony);
  const acwr=cc>0?Math.round(ac/cc*100)/100:null;
  let wSum=0,wCount=0;
  for(let i=0;i<7;i++){
    const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    const w=cd.sessions?.[ds]?.wellness?.[pid];
    if(w){const vals=W_KEYS.map(k=>w[k]).filter(v=>v!=null);if(vals.length){wSum+=vals.reduce((a,b)=>a+b,0)/vals.length;wCount++;}}
  }
  const wellAvg=wCount>0?Math.round(wSum/wCount*10)/10:null;
  return{ac:Math.round(ac),cc:Math.round(cc),monotony:Math.round(monotony*100)/100,strain,acwr,wellAvg,l7,hasData:l7.some(l=>l>0)||l28.some(l=>l>0)};
}
function getFilterWindow(){
  const f=S.loadFilter;
  let from,to=TODAY;
  if(f==='1d'){from=TODAY;}
  else if(f==='7d'){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-6);from=d.toISOString().split('T')[0];}
  else if(f==='1m'){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-29);from=d.toISOString().split('T')[0];}
  else{from=S.loadFrom||TODAY;to=S.loadTo||TODAY;}
  return{from,to};
}
function calcPeriodLoad(cd,pid,from,to){
  let total=0;
  const start=new Date(from+'T12:00:00'),end=new Date(to+'T12:00:00');
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)) total+=playerLoadOnDate(cd,pid,d.toISOString().split('T')[0]);
  return total;
}
function loadsWindowRange(cd,pid,from,to){
  const result=[];
  const start=new Date(from+'T12:00:00'),end=new Date(to+'T12:00:00');
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)) result.push(playerLoadOnDate(cd,pid,d.toISOString().split('T')[0]));
  return result;
}

// ── Attendance helpers ────────────────────────────────────────
function getStats(players,attendance){
  const dates=Object.keys(attendance).sort();
  return players.map(p=>{
    let P=0,A=0,total=0;
    dates.forEach(d=>{const s=attendance[d]?.[p.id];if(s==='P'||s==='T'||s==='A'||s==='L'||s==='J'){total++;if(s==='P'||s==='T')P++;else A++;}});
    const pct=total>0?Math.round(P/total*100):null;
    let consec=0;
    for(let i=dates.length-1;i>=0;i--){const s=attendance[dates[i]]?.[p.id];if(s==='A'||s==='L'||s==='J')consec++;else if(s)break;}
    return{...p,P,A,total,pct,consec};
  }).sort((a,b)=>(a.pct??101)-(b.pct??101));
}
function getMonthly(players,attendance){
  const dates=Object.keys(attendance).sort();
  const mm={};
  dates.forEach(d=>{const m=d.slice(0,7);if(!mm[m])mm[m]=[];mm[m].push(d);});
  return Object.entries(mm).sort().map(([month,mDates])=>{
    let tP=0,tT=0;
    mDates.forEach(d=>players.forEach(p=>{const s=attendance[d]?.[p.id];if(s==='P'||s==='T'||s==='A'||s==='L'||s==='J'){tT++;if(s==='P'||s==='T')tP++;}}));
    return{month,sessions:mDates.length,avgPct:tT>0?Math.round(tP/tT*100):null};
  });
}

// ── Session state ─────────────────────────────────────────────
function loadSession(){
  const cd=getCat();
  const ex=cd.attendance[S.date];
  if(ex){const{absenceReasons:_ar,justReasons:_jr,..._rest}=ex;S.sess={..._rest};S.absenceReasons={...(_ar||{})};}else{S.sess={};S.absenceReasons={};cd.players.forEach(p=>{S.sess[p.id]='P';});}
}
function loadSessionDraft(){
  const cd=getCat();
  const ex=cd.sessions?.[S.date]||{};
  S.sessionDraft={duration:ex.duration||'',teamRPE:ex.teamRPE??null,playerRPE:{...(ex.playerRPE||{})},playerDuration:{...(ex.playerDuration||{})},sessionType:ex.sessionType||null};
  S.wellnessDraft={};
  const w=ex.wellness||{};
  cd.players.forEach(p=>{S.wellnessDraft[p.id]=w[p.id]?{...w[p.id]}:null;});
  S.wellnessExpanded={};
}
async function loadSessionPlans(){
  const tid=S.teamId, cid=S.cat, date=S.date;
  if(!tid||!cid||!date) return;
  try {
    const snap = await db.ref(`teams/${tid}/categories/${cid}/sessions/${date}/plans`).get();
    S.sessionPlans = snap.exists() ? (snap.val()||{}) : {};
  } catch(e){ S.sessionPlans={}; }
}
async function saveAttendance(){
  getCat().attendance[S.date]={...S.sess};
  await persistCat();render();
  const msg=document.getElementById('save-msg');
  if(msg){msg.textContent='✓ Guardado';setTimeout(()=>{if(msg)msg.textContent='';},2500);}
}
async function saveSessionDraft(){
  const cd=getCat();
  if(!cd.sessions)cd.sessions={};
  const ex=cd.sessions[S.date]||{};
  const wellness={...(ex.wellness||{})};
  Object.entries(S.wellnessDraft).forEach(([pid,w])=>{if(w!==null)wellness[pid]=w;});
  const playerRPE={...(ex.playerRPE||{}),...S.sessionDraft.playerRPE};
  const playerDuration={...(ex.playerDuration||{}),...S.sessionDraft.playerDuration};
  cd.sessions[S.date]={
    duration:S.sessionDraft.duration?parseInt(S.sessionDraft.duration):ex.duration,
    teamRPE:S.sessionDraft.teamRPE!==null?S.sessionDraft.teamRPE:ex.teamRPE,
    sessionType:S.sessionDraft.sessionType!==null?S.sessionDraft.sessionType:(ex.sessionType||null),
    playerRPE,playerDuration,wellness
  };
  await persistCat();
}
// ── Programs Firebase ─────────────────────────────────────────
function progRef(pid){ return db.ref(`users/${currentUser.uid}/programs/${pid}`); }
function dayRef(pid,did){ return db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}`); }
function dayBlockRef(pid,did,bid){ return db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}/blocks/${bid}`); }
function dayItemRef(pid,did,bid,iid){ return db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}/blocks/${bid}/items/${iid}`); }

async function saveProgram(pid, data){
  if(!S.programs[pid]) S.programs[pid]={createdAt:Date.now(),days:{}};
  Object.assign(S.programs[pid],data);
  await db.ref(`users/${currentUser.uid}/programs/${pid}`).update(data);
}
async function deleteProgram(pid){
  delete S.programs[pid];
  await db.ref(`users/${currentUser.uid}/programs/${pid}`).remove();
}
async function saveProgramDay(pid, did, data){
  if(!S.programs[pid]) return;
  if(!S.programs[pid].days) S.programs[pid].days={};
  S.programs[pid].days[did]=Object.assign(S.programs[pid].days[did]||{},data);
  await dayRef(pid,did).update(data);
}
async function deleteProgramDay(pid, did){
  if(S.programs[pid]?.days) delete S.programs[pid].days[did];
  await dayRef(pid,did).remove();
}
async function saveBlockToDay(pid, did, bid, data){
  if(!S.programs[pid]?.days?.[did]) return;
  const day=S.programs[pid].days[did];
  if(!day.blocks) day.blocks={};
  day.blocks[bid]=Object.assign(day.blocks[bid]||{},data);
  await dayBlockRef(pid,did,bid).update(data);
}
async function deleteBlockFromDay(pid, did, bid){
  if(S.programs[pid]?.days?.[did]?.blocks) delete S.programs[pid].days[did].blocks[bid];
  await dayBlockRef(pid,did,bid).remove();
}
async function saveItemToDay(pid, did, bid, iid, data){
  if(!S.programs[pid]?.days?.[did]?.blocks?.[bid]) return;
  const block=S.programs[pid].days[did].blocks[bid];
  if(!block.items) block.items={};
  block.items[iid]=Object.assign(block.items[iid]||{},data);
  await dayItemRef(pid,did,bid,iid).update(data);
}
async function deleteItemFromDay(pid, did, bid, iid){
  if(S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items) delete S.programs[pid].days[did].blocks[bid].items[iid];
  await dayItemRef(pid,did,bid,iid).remove();
}

// ── Session Plans Firebase ─────────────────────────────────────
function planBase(tid=S.teamId, cid=S.cat, date=S.date){ return `teams/${tid}/categories/${cid}/sessions/${date}`; }
function planRef(planId){ return db.ref(`${planBase()}/plans/${planId}`); }
function planBlockRef(planId,bid){ return db.ref(`${planBase()}/plans/${planId}/blocks/${bid}`); }
function planItemRef(planId,bid,iid){ return db.ref(`${planBase()}/plans/${planId}/blocks/${bid}/items/${iid}`); }
function planSetRef(planId,bid,iid,sidx){ return db.ref(`${planBase()}/plans/${planId}/blocks/${bid}/items/${iid}/sets/${sidx}`); }

async function ensureSessionExists(){
  const cd=getCat();
  if(!cd.sessions?.[S.date]){
    const minSession={duration:null,teamRPE:null,sessionType:null,playerRPE:{},wellness:{}};
    if(!cd.sessions)cd.sessions={};
    cd.sessions[S.date]=minSession;
    await db.ref(`${planBase()}`).update(minSession);
  }
}
async function saveSessionPlan(planId, data){
  S.sessionPlans[planId]=Object.assign(S.sessionPlans[planId]||{blocks:{}},data);
  await ensureSessionExists();
  await planRef(planId).update(data);
}
async function deleteSessionPlan(planId){
  delete S.sessionPlans[planId];
  await planRef(planId).remove();
}
async function addBlockToPlan(planId, bid, data){
  if(!S.sessionPlans[planId]) return;
  if(!S.sessionPlans[planId].blocks) S.sessionPlans[planId].blocks={};
  S.sessionPlans[planId].blocks[bid]=data;
  await planBlockRef(planId,bid).set(data);
}
async function updateBlockInPlan(planId, bid, data){
  if(!S.sessionPlans[planId]?.blocks?.[bid]) return;
  Object.assign(S.sessionPlans[planId].blocks[bid],data);
  await planBlockRef(planId,bid).update(data);
}
async function deleteBlockFromPlan(planId, bid){
  if(S.sessionPlans[planId]?.blocks) delete S.sessionPlans[planId].blocks[bid];
  await planBlockRef(planId,bid).remove();
}
async function addItemToBlock(planId, bid, iid, data){
  if(!S.sessionPlans[planId]?.blocks?.[bid]) return;
  const block=S.sessionPlans[planId].blocks[bid];
  if(!block.items) block.items={};
  block.items[iid]=data;
  await planItemRef(planId,bid,iid).set(data);
}
async function deleteItemFromBlock(planId, bid, iid){
  if(S.sessionPlans[planId]?.blocks?.[bid]?.items) delete S.sessionPlans[planId].blocks[bid].items[iid];
  await planItemRef(planId,bid,iid).remove();
}
async function saveSetInItem(planId, bid, iid, sidx, data){
  if(!S.sessionPlans[planId]?.blocks?.[bid]?.items?.[iid]) return;
  const item=S.sessionPlans[planId].blocks[bid].items[iid];
  if(!item.sets) item.sets={};
  item.sets[String(sidx)]=Object.assign(item.sets[String(sidx)]||{},data);
  await planSetRef(planId,bid,iid,sidx).update(data);
}

// ── Personal exercise library ──────────────────────────────────
async function savePersonalExercise(name, category, videoUrl=''){
  const id=Date.now().toString();
  const data={name,category:category||'Otro',createdAt:Date.now()};
  if(videoUrl) data.videoUrl=videoUrl;
  S.exercises.personal[id]=data;
  await db.ref(`users/${currentUser.uid}/exercises/${id}`).set(data);
  return id;
}

async function addPlayer(){
  const inp=document.getElementById('new-player');
  if(!inp||!inp.value.trim())return;
  getCat().players.push({id:Date.now().toString(),name:inp.value.trim()});
  await persistCat();render();
}

function handleMobTab(tab){
  if(tab==='home'){S.view='home';S.teamId=null;S.teamFormMode=null;S.catFormMode=null;render();return;}
  const catTab={att:'attend',ses:'session',met:'metrics',more:'roster'}[tab];
  if(!catTab)return;
  const tid=S.lastCatTid||S.teamId;
  const cid=S.lastCatCid||S.cat;
  if(tid&&cid){
    S.teamId=tid;S.cat=cid;S.view='cat';S.tab=catTab;
    if(catTab==='attend')loadSession();
    if(catTab==='session'){loadSessionDraft();S.sessionPlans={};loadSessionPlans().then(()=>render());return;}
    render();
  }else{S.view='home';render();}
}
function updateMobTabBar(){
  const isCat=S.view==='cat';
  const active={
    home:!isCat&&S.view!=='search'&&S.view!=='athlete',
    att:isCat&&S.tab==='attend',
    ses:isCat&&S.tab==='session',
    met:isCat&&(S.tab==='metrics'||S.tab==='reports'),
    more:isCat&&S.tab==='roster',
  };
  ['home','att','ses','met','more'].forEach(function(k){
    var el=document.getElementById('mobt-'+k);
    if(el)el.classList.toggle('active',!!active[k]);
  });
}
// ── Render ────────────────────────────────────────────────────
function render(){
  const body=document.getElementById('app-body');if(!body)return;
  // Invite accept modal takes priority as overlay
  if(S.showInviteModal && S.pendingInviteData){
    // Render underlying home view, then overlay modal
    body.innerHTML=renderHome()+renderInviteModal();
    attachEvents(); updateHeader(); return;
  }
  if(S.profileView){ body.innerHTML=renderProfileView(); attachEvents(); updateHeader(); return; }
  if(S.view==='search') {body.innerHTML=renderSearch();attachEvents();updateHeader();return;}
  if(S.view==='athlete'){body.innerHTML=renderAthleteView();attachEvents();updateHeader();return;}
  if(S.view==='home')      body.innerHTML=renderHome();
  else if(S.view==='team')     body.innerHTML=renderTeamView();
  else if(S.view==='cat')      body.innerHTML=renderCatHeader()+renderCat();
  else if(S.view==='programs')    body.innerHTML=renderProgramsView();
  else if(S.view==='myexercises') body.innerHTML=renderMyExercises();
  updateHeader();
  attachEvents();
  if(S.exPicker) renderExPickerModal();
  if(S.videoModal) renderVideoModal();
  if(S.upgradeModal) renderUpgradeModal();
  if(S.subscriptionModal) renderSubscriptionModal();
}

// ── PROGRAMS VIEW ────────────────────────────────────────────
function renderProgramsView(){
  if(S.programView?.dayId) return renderProgramDayEditor();
  if(S.programView?.progId) return renderProgramDetail();
  return renderProgramsList();
}

function renderProgramsList(){
  const progs=Object.entries(S.programs||{}).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));
  const form=S.programForm;
  let cards='';
  if(!progs.length && !form){
    cards=`<div class="q-empty-state"><div style="font-size:36px;margin-bottom:12px;">📋</div><div style="font-weight:600;margin-bottom:4px;">Sin programas todavía</div><div style="font-size:13px;color:var(--text-2);">Crea tu primer programa de entrenamiento</div></div>`;
  } else {
    cards=progs.map(([pid,p])=>{
      const days=Object.values(p.days||{});
      return `<div class="q-card q-prog-card" data-action="openprog" data-pid="${pid}" style="cursor:pointer;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">📋</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:15px;color:var(--text);">${p.name||'Sin nombre'}</div>
            <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${days.length} ${days.length===1?'día':'días'}</div>
          </div>
          <button class="q-icon-btn" data-action="deleteprog" data-pid="${pid}" title="Eliminar" onclick="event.stopPropagation();">🗑</button>
        </div>
        ${days.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">`+
          Object.entries(p.days||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0)).map(([did,d])=>
            `<span class="q-day-chip" data-action="openprogday" data-pid="${pid}" data-did="${did}" onclick="event.stopPropagation();">${d.name||'Día'}</span>`
          ).join('')+`</div>`:''}
      </div>`;
    }).join('');
  }
  const formHtml=form?`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h"><h3>${form.mode==='edit'?'Editar programa':'Nuevo programa'}</h3></div>
    <div class="q-card__b" style="padding:12px 16px;">
      <div class="form-field"><label>Nombre del programa</label>
        <input type="text" id="prog-name-input" value="${form.name||''}" placeholder="ej: Hipertrofia 4 días" class="q-input">
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="q-btn q-btn--primary" data-action="saveprogform">Guardar</button>
        <button class="q-btn" data-action="cancelprogform">Cancelar</button>
      </div>
    </div>
  </div>`:'';
  return`<div class="wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text);">Programas</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">Tus rutinas reutilizables — disponibles en cualquier equipo</div>
      </div>
      <button class="q-btn q-btn--primary" data-action="newprog">+ Nuevo programa</button>
    </div>
    ${formHtml}
    <div style="display:flex;flex-direction:column;gap:10px;">${cards}</div>
  </div>`;
}

function renderProgramDetail(){
  const pid=S.programView.progId;
  const prog=S.programs[pid];
  if(!prog) return renderProgramsList();
  const days=Object.entries(prog.days||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const form=S.programForm;
  const dayFormHtml=form&&form.mode==='newday'?`<div class="q-card" style="margin-bottom:10px;">
    <div class="q-card__b" style="padding:12px 16px;">
      <div class="form-field"><label>Nombre del día</label>
        <input type="text" id="day-name-input" value="${form.dayName||''}" placeholder="ej: Día 1 — Tren inferior empuje" class="q-input">
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="q-btn q-btn--primary" data-action="savedayform" data-pid="${pid}">Guardar</button>
        <button class="q-btn" data-action="cancelprogform">Cancelar</button>
      </div>
    </div>
  </div>`:'';
  const dayCards=days.map(([did,d])=>{
    const blockCount=Object.keys(d.blocks||{}).length;
    const exCount=Object.values(d.blocks||{}).reduce((s,b)=>s+Object.keys(b.items||{}).length,0);
    return `<div class="q-card q-prog-card" data-action="openprogday" data-pid="${pid}" data-did="${did}" style="cursor:pointer;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:8px;background:var(--bg-3);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:var(--accent);">${(d.order||0)+1}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;">${d.name||'Sin nombre'}</div>
          <div style="font-size:12px;color:var(--text-2);">${blockCount} bloques · ${exCount} ejercicios</div>
        </div>
        <button class="q-icon-btn" data-action="deleteprogday" data-pid="${pid}" data-did="${did}" onclick="event.stopPropagation();">🗑</button>
      </div>
    </div>`;
  }).join('');
  return`<div class="wrap">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="q-btn" data-action="backprograms" style="padding:6px 10px;">← Volver</button>
      <div style="flex:1;">
        <div style="font-size:18px;font-weight:700;">${prog.name}</div>
        <div style="font-size:12px;color:var(--text-2);">${days.length} ${days.length===1?'día':'días'}</div>
      </div>
      <button class="q-btn q-btn--primary" data-action="newprogday" data-pid="${pid}">+ Agregar día</button>
    </div>
    ${dayFormHtml}
    <div style="display:flex;flex-direction:column;gap:8px;">${dayCards||`<div class="q-empty-state">Agregá días a este programa</div>`}</div>
  </div>`;
}

function renderProgramDayEditor(){
  const pid=S.programView.progId, did=S.programView.dayId;
  const prog=S.programs[pid];
  const day=prog?.days?.[did];
  if(!day) return renderProgramDetail();
  const blocks=Object.entries(day.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const blocksHtml=blocks.map(([bid,block])=>renderPlanBlock(bid,block,{progId:pid,dayId:did})).join('');
  return`<div class="wrap">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="q-btn" data-action="backprogdetail" data-pid="${pid}" style="padding:6px 10px;">← ${prog.name}</button>
      <div style="flex:1;">
        <div style="font-size:17px;font-weight:700;">${day.name}</div>
        <div style="font-size:12px;color:var(--text-2);">${blocks.length} bloques</div>
      </div>
      <button class="q-icon-btn" data-action="exportplanpdf" data-ctx="prog" data-pid="${pid}" data-did="${did}" title="Exportar PDF">🖨</button>
    </div>
    <div class="q-plan-blocks">${blocksHtml}</div>
    <button class="q-btn q-btn--ghost q-add-block-btn" data-action="addblock" data-ctx="prog" data-pid="${pid}" data-did="${did}">+ Agregar bloque</button>
  </div>`;
}

// ── MY EXERCISES (personal library management) ────────────────
function openMyExercises(){S.view='myexercises';S.exLibEdit=null;render();}

function renderMyExercises(){
  const exs=Object.entries(S.exercises.personal||{}).sort((a,b)=>(a[1].category||'').localeCompare(b[1].category||'')||a[1].name.localeCompare(b[1].name));
  const editForm=S.exLibEdit;
  const grouped={};
  exs.forEach(([id,ex])=>{
    const cat=ex.category||'Otro';
    if(!grouped[cat]) grouped[cat]=[];
    grouped[cat].push({id,...ex});
  });
  const editFormHtml=editForm?`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h"><h3>${editForm.id==='__new'?'Nuevo ejercicio':'Editar ejercicio'}</h3></div>
    <div class="q-card__b" style="padding:12px 16px;display:flex;flex-direction:column;gap:10px;">
      <div class="form-field"><label>Nombre</label>
        <input type="text" id="exlib-name" class="q-input" value="${editForm.name||''}" placeholder="Nombre del ejercicio">
      </div>
      <div class="form-field"><label>Categoría</label>
        <select id="exlib-cat" class="q-input" style="padding:6px 10px;">
          ${EX_CATEGORIES.map(c=>`<option value="${c}"${editForm.category===c?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-field"><label>Video de YouTube <span style="font-weight:400;color:var(--text-2);">(opcional)</span></label>
        <input type="url" id="exlib-video" class="q-input" value="${editForm.videoUrl||''}" placeholder="https://youtube.com/watch?v=...">
      </div>
      <div style="display:flex;gap:8px;">
        <button class="q-btn q-btn--primary" data-action="saveexlibedit">Guardar</button>
        <button class="q-btn" data-action="cancelexlibedit">Cancelar</button>
      </div>
    </div>
  </div>`:'';
  const listHtml=Object.keys(grouped).length?Object.entries(grouped).map(([cat,items])=>
    `<div class="q-card" style="margin-bottom:10px;">
      <div class="q-card__h"><h3>${cat} <span style="font-size:12px;font-weight:400;color:var(--text-2);">${items.length} ejercicios</span></h3></div>
      <div>
        ${items.map(ex=>{
          const hasVideo=ex.videoUrl&&ytId(ex.videoUrl);
          return`<div class="q-ex-lib-row">
            <span style="font-size:13px;color:var(--text-0);">${ex.name}</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${hasVideo?`<button class="q-icon-btn" data-action="showvideo" data-exid="${ex.id}" title="Ver video" style="font-size:11px;padding:3px 8px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--accent);">▶ Video</button>`:''}
              <button class="q-icon-btn" data-action="editexlib" data-exid="${ex.id}" title="Editar">✏️</button>
              <button class="q-icon-btn" data-action="deleteexlib" data-exid="${ex.id}" title="Eliminar" style="color:var(--bad);">🗑</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`
  ).join(''):`<div class="q-empty-state"><div style="font-size:32px;margin-bottom:8px;">📚</div><div style="font-weight:600;">Sin ejercicios personales</div><div style="font-size:13px;color:var(--text-2);margin-top:4px;">Agregá ejercicios desde el selector o con el botón de arriba</div></div>`;
  return`<div class="wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div>
        <div style="font-size:18px;font-weight:700;">Mis ejercicios</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${exs.length} ejercicios en tu biblioteca personal</div>
      </div>
      <button class="q-btn q-btn--primary" data-action="newexlib">+ Nuevo ejercicio</button>
    </div>
    ${editFormHtml}
    ${listHtml}
  </div>`;
}

// ── HOME: Teams list ──────────────────────────────────────────
function renderHomeAlerts(){
  const alerts=[];
  Object.keys(S.teams).forEach(tid=>{
    const t=getTeam(tid);
    if(t._legacyPending)return;
    getCats(tid).forEach(cid=>{
      const cd=getCat(cid,tid);
      if(!cd.players.length)return;
      const stats=getStats(cd.players,cd.attendance);
      const ctx=`${t.name} · ${cd.name||cid}`;
      cd.players.forEach(p=>{
        const m=calcMetrics(cd,p.id);
        if(!m.hasData)return;
        const st=stats.find(s=>s.id===p.id);
        if(m.acwr!==null&&m.acwr>1.5)
          alerts.push({lvl:'danger',icon:'🔥',msg:`${p.name} — carga muy alta (ACWR ${m.acwr})`,ctx});
        if(m.wellAvg!==null&&m.wellAvg<2.5)
          alerts.push({lvl:'warn',icon:'😴',msg:`${p.name} — wellness bajo (${m.wellAvg}/5)`,ctx});
        if(st&&st.consec>=3)
          alerts.push({lvl:'warn',icon:'📋',msg:`${p.name} — ${st.consec} ausencias seguidas`,ctx});
      });
    });
  });
  if(!alerts.length)return'';
  alerts.sort((a,b)=>a.lvl==='danger'&&b.lvl!=='danger'?-1:1);
  const chips=alerts.map(a=>`<span class="q-alert-chip q-alert-chip--${a.lvl}" title="${a.ctx}">${a.icon} ${a.msg}</span>`).join('');
  return`<div class="q-alerts-strip">
    <span class="q-alerts-strip__hd">⚡ ${alerts.length}</span>
    <div class="q-alerts-strip__scroll">${chips}</div>
  </div>`;
}
function renderHome(){
  const teamIds=Object.keys(S.teams);
  const cards=teamIds.map(tid=>{
    const t=getTeam(tid);
    const cats=getCats(tid);
    const totalPlayers=cats.reduce((a,cid)=>{const c=t.categories[cid];return a+(Array.isArray(c.players)?c.players.length:Object.keys(c.players||{}).length);},0);
    const color=t.color||CAT_PALETTE[teamIds.indexOf(tid)%CAT_PALETTE.length];
    const role=myRole(tid);
    const rolePill=role&&role!=='owner'?`<span class="role-pill ${role==='editor'?'role-editor':'role-viewer'}">${role==='editor'?'✏ Editor':'👁 Lector'}</span>`:role==='owner'&&t.ownerId!==currentUser.uid?'':'';
    // Legacy pending: owner hasn't migrated yet
    if(t._legacyPending){
      return`<div class="team-card" style="opacity:.6;cursor:default;border-color:#92400e;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:#d97706;border-radius:2px 0 0 2px;"></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:9px;background:#1c140044;display:flex;align-items:center;justify-content:center;font-size:16px;">⏳</div>
          <div>
            <div style="font-size:17px;font-weight:600;color:var(--text);">${t.name}</div>
            <div style="font-size:11px;color:#fcd34d;margin-top:2px;">Pendiente — el Admin debe actualizar y reabrir el equipo</div>
          </div>
        </div>
      </div>`;
    }
    // ── Attendance calculation ────────────────────────────────
    let weekP=0,weekAll=0;
    for(let i=0;i<7;i++){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];cats.forEach(cid=>{const da=(t.categories[cid].attendance||{})[ds]||{};(t.categories[cid].players||[]).forEach(p=>{const s=da[p.id];if(s==='P'||s==='T'||s==='A'||s==='L'||s==='J'){weekAll++;if(s==='P'||s==='T')weekP++;}});});}
    const weekAtt=weekAll>0?Math.round(weekP/weekAll*100):null;
    const attColor=weekAtt===null?'var(--text-2)':weekAtt>=85?'var(--ok)':weekAtt>=70?'#eab308':'var(--bad)';
    // ── Card HTML ─────────────────────────────────────────────
    const _nonOwner=role==='editor'||role==='viewer';
    const logoEl=t.logo?`<img src="${t.logo}" style="width:38px;height:38px;border-radius:9px;object-fit:cover;flex-shrink:0;">`:`<div style="width:38px;height:38px;border-radius:9px;background:${color}33;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;font-weight:700;color:${color};">${t.name.slice(0,2).toUpperCase()}</div>`;
    const attBar=weekAtt!==null?`<div style="margin-top:6px;height:3px;border-radius:2px;background:var(--bg-3);overflow:hidden;"><div style="height:100%;width:${weekAtt}%;background:${attColor};border-radius:2px;"></div></div>`:'';
    const statsRow=`<div style="border-top:1px solid var(--line);margin-top:12px;padding-top:10px;display:flex;gap:0;">
      <div class="q-ckpi">
        <div class="q-ckpi__lbl">Categorías</div>
        <div class="q-ckpi__val">${cats.length}</div>
      </div>
      <div class="q-ckpi" style="border-left:1px solid var(--line);">
        <div class="q-ckpi__lbl">Jugadores</div>
        <div class="q-ckpi__val">${totalPlayers}</div>
      </div>
      <div class="q-ckpi" style="border-left:1px solid var(--line);flex:1;">
        <div class="q-ckpi__lbl">Asistencia 7D</div>
        <div class="q-ckpi__val" style="color:${attColor};">${weekAtt!==null?weekAtt+'%':'—'}</div>
        ${attBar}
      </div>
    </div>`;
    const cardInner=`<button class="team-card" data-action="openteam" data-tid="${tid}" style="--c:${color};${_nonOwner?'margin-bottom:0;border-radius:14px 14px 0 0;flex:1;':''}">
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${color};border-radius:2px 0 0 2px;"></div>
      <div style="display:flex;align-items:center;gap:10px;">
        ${logoEl}
        <div style="min-width:0;">
          <div style="font-size:16px;font-weight:600;color:var(--text);line-height:1.2;">${t.name}</div>
          <div style="margin-top:3px;display:flex;gap:5px;align-items:center;flex-wrap:wrap;"><span class="sport-badge">${t.sport||'Deporte'}</span>${rolePill}</div>
        </div>
      </div>
      ${statsRow}
    </button>`;
    return _nonOwner
      ?`<div style="grid-column:auto;display:flex;flex-direction:column;">${cardInner}<button style="width:100%;padding:5px 10px;font-size:11px;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent);border-top:none;border-radius:0 0 14px 14px;cursor:pointer;font-family:var(--font-ui);letter-spacing:.01em;margin-bottom:10px;transition:background .15s;flex-shrink:0;" data-action="leaveteam" data-tid="${tid}">↩ Salir del equipo</button></div>`
      :cardInner;
  }).join('');

  const empty=!teamIds.length?`<div class="empty-state" style="padding:60px 20px;">
    <div style="margin-bottom:16px;"><img src="public/brand/logo.png" style="width:80px;height:80px;object-fit:contain;"></div>
    <div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;">Bienvenido a Qoore</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:24px;">Creá tu primer equipo o pedile al Admin que te invite a uno existente.</div>
  </div>`:'';

  const _now=new Date();
  const _hr=_now.getHours();
  const _greeting=_hr<12?'Buenos días':_hr<19?'Buenas tardes':'Buenas noches';
  const _firstName=S.userProfile?.nombre||(currentUser?.displayName?.split(' ')[0])||'';
  const _dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const _meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const _dateStr=`${_dias[_now.getDay()]} ${_now.getDate()} de ${_meses[_now.getMonth()]}`;
  return`<div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;">
      <div>
        <div style="font-size:20px;font-weight:600;color:var(--text-0);line-height:1.2;">${_greeting}${_firstName?', '+_firstName:''}</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:3px;">${_dateStr}</div>
      </div>
      <button class="sm-btn" data-action="newteam">+ Nuevo equipo</button>
    </div>
    ${S.teamFormMode?renderTeamForm():''}
    ${cards}${empty}
  </div>`;
}

function renderTeamForm(){
  const isEdit=S.teamFormMode==='edit';
  const tid=S.editingTeamId;
  const t=isEdit?getTeam(tid):{name:'',sport:'Básquetbol'};
  const logoPreview = (S.pendingLogo||t.logo) ? `<img src="${S.pendingLogo||t.logo}" class="logo-preview">` : `<div style="width:64px;height:64px;border-radius:12px;background:var(--bg3);display:flex;align-items:center;justify-content:center;"><img src=\"public/brand/logo-icon.png\" style=\"width:52px;height:52px;object-fit:contain;\"></div>`;
  return`<div class="form-card" style="margin-bottom:14px;">
    <div class="form-card-title">${isEdit?'Editar equipo':'Nuevo equipo'} <button class="sm-btn" data-action="cancelteamform">✕</button></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      ${logoPreview}
      <div>
        <label class="logo-upload-btn">📷 ${t.logo||S.pendingLogo?'Cambiar logo':'Subir logo'}
          <input type="file" id="tf-logo" accept="image/*" style="display:none;" onchange="handleLogoUpload(this)">
        </label>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">PNG, JPG · Se comprime a 80×80px</div>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-field" style="grid-column:1/-1;"><label>Nombre del equipo</label><input type="text" id="tf-name" value="${isEdit?t.name:''}" placeholder="Ej: Club Atlético X"></div>
      <div class="form-field" style="grid-column:1/-1;"><label>Deporte</label>
        <select id="tf-sport">${SPORTS.map(s=>`<option value="${s}"${(isEdit?t.sport:'')==s?' selected':''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-row">
      ${isEdit?`<button class="sm-btn" style="color:#fca5a5;border-color:#991b1b;" data-action="deleteteam" data-tid="${tid}">Eliminar</button>`:''}
      <button class="save-btn" style="flex:1;" data-action="${isEdit?'saveeditteam':'savenewteam'}">${isEdit?'Guardar':'Crear equipo'}</button>
    </div>
  </div>`;
}

// ── TEAM VIEW: Categories list ────────────────────────────────
function renderTeamView(){
  const t=getTeam();
  const cats=getCats();
  const color=t.color||CAT_PALETTE[0];
  const header=`<div class="sec-header">
    <button class="back-btn" data-action="home">← Inicio</button>
    <span class="sec-title">${t.name}</span>
    <span class="sport-badge">${t.sport||''}</span>
    ${isOwner()?`<button class="sm-btn" data-action="toggleaccess" data-tid="${S.teamId}" style="color:#60a5fa;border-color:#1e40af;position:relative;">👥${(()=>{const u=(S.teamNotifs[S.teamId]||[]).filter(n=>!n.read).length;return u?`<span style="position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${u}</span>`:''})()}</button>`:''}
    ${isOwner()?`<button class="sm-btn" data-action="editteam">⚙ Editar</button>`:''}
  </div>`;

  const catCards=cats.map((cid,i)=>{
    const c=t.categories[cid];
    const players=Array.isArray(c.players)?c.players:Object.values(c.players||[]);
    const col=c.color||CAT_PALETTE[i%CAT_PALETTE.length];
    const dates=Object.keys(c.attendance||{}).sort();
    const lastDate=dates[dates.length-1];
    const todayOk=!!c.attendance?.[TODAY];
    const allM=players.map(p=>calcMetrics(c,p.id));
    const acwrs=allM.map(m=>m.acwr).filter(v=>v!==null);
    const avgAcwr=acwrs.length>0?Math.round(acwrs.reduce((a,b)=>a+b,0)/acwrs.length*100)/100:null;
    const az=acwrZone(avgAcwr);
    const acwrAlerts=allM.filter(m=>m.acwr!==null&&m.acwr>1.5).length;
    const stats=getStats(players,c.attendance||{});
    const withPct=stats.filter(s=>s.pct!==null);
    const avgPct=withPct.length>0?Math.round(withPct.reduce((a,s)=>a+s.pct,0)/withPct.length):null;
    const alerts=stats.filter(s=>s.consec>=ALERT_N).length;
    return`<button class="cat-card" data-action="opencat" data-cid="${cid}" style="padding-left:20px;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${col};border-radius:2px 0 0 2px;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:17px;font-weight:500;color:var(--text);">${c.name}</span>
        <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;">
          ${alerts>0?`<span class="badge badge-bad">⚠ ${alerts} aus.</span>`:''}
          ${acwrAlerts>0?`<span class="badge badge-bad">⚠ ACWR</span>`:''}
          ${avgPct!==null?`<span class="badge ${pctClass(avgPct)}">${avgPct}%</span>`:''}
          ${avgAcwr!==null?`<span style="background:${az.bg};color:${az.fg};padding:2px 7px;border-radius:12px;font-size:11px;font-weight:600;">ACWR ${avgAcwr}</span>`:''}
        </div>
      </div>
      <div style="display:flex;gap:10px;font-size:12px;color:var(--text2);flex-wrap:wrap;">
        <span>${players.length} jugadores</span>
        ${lastDate?`<span>Última: ${fmtDate(lastDate)}</span>`:'<span>Sin registros</span>'}
        <span class="badge ${todayOk?'badge-today':'badge-nottoday'}">${todayOk?'✓ Hoy':'Hoy pendiente'}</span>
      </div>
    </button>`;
  }).join('');

  const empty=!cats.length?`<div class="empty-state">Sin categorías.<br>Creá la primera para empezar a registrar.</div>`:'';

  return header+`<div class="wrap">
    ${S.accessPanel&&isOwner()?renderAccessPanel(S.teamId):''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="font-size:13px;font-weight:600;color:var(--text2);">CATEGORÍAS</div>
      ${isOwner()?`<button class="add-btn" data-action="newcat">+ Nueva categoría</button>`:''}
    </div>
    ${S.teamFormMode==='edit'?renderTeamForm():''}
    ${S.catFormMode?renderCatForm():''}
    ${catCards}${empty}
  </div>`;
}

function renderCatForm(){
  const isEdit=S.catFormMode==='edit';
  const cid=S.editingCatId;
  const c=isEdit&&cid?getCat(cid):{name:'',color:''};
  const colorIdx=getCats().length%CAT_PALETTE.length;
  const defaultColor=CAT_PALETTE[colorIdx];
  return`<div class="form-card" style="margin-bottom:12px;border-color:#059669;">
    <div class="form-card-title" style="color:#059669;">${isEdit?'Editar categoría':'Nueva categoría'} <button class="sm-btn" data-action="cancelcatform">✕</button></div>
    <div class="form-field" style="margin-bottom:8px;"><label>Nombre</label><input type="text" id="cf-name" value="${isEdit?(c.name||''):''}" placeholder="Ej: U16A, Sub-20, Primera División"></div>
    <div style="font-size:11px;color:var(--text3);margin-top:4px;">💡 Si el nombre contiene U14, U16 o U18, los umbrales antropométricos se detectan automáticamente como Menores.</div>
    <div class="form-row">
      ${isEdit&&isOwner()?`<button class="sm-btn" style="color:#fca5a5;border-color:#991b1b;" data-action="deletecat" data-cid="${cid}">Eliminar categoría</button>`:''}
      <button class="save-btn" style="flex:1;background:#059669;" data-action="${isEdit?'saveeditcat':'savenewcat'}">${isEdit?'Guardar':'Crear categoría'}</button>
    </div>
  </div>`;
}

// ── CATEGORY VIEW ─────────────────────────────────────────────
function renderCatHeader(){
  const c=getCat(); const catName=getCatName();
  const role=myRole();
  const rolePill=role&&role!=='owner'?`<span class="role-pill ${role==='editor'?'role-editor':'role-viewer'}">${role==='editor'?'Editor':'Lector'}</span>`:'';
  const svg=(d)=>`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden><path d="${d}"/></svg>`;
  const tabs=[
    {id:'attend',label:'Asistencia',icon:'M22 12h-4l-3 9L9 3l-3 9H2',num:c.players.length},
    {id:'session',label:'Sesión',icon:'M6.5 6.5 17.5 17.5M6.5 17.5 17.5 6.5M3 12h2m14 0h2M7 8v8m10-8v8'},
    {id:'metrics',label:'Métricas',icon:'M3 12 7 8l4 6 4-3 6 8'},
    {id:'reports',label:'Reportes',icon:'M4 21V4M4 4h13l-2 4 2 4H4'},
    {id:'roster',label:'Plantel',icon:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm7 0a4 4 0 0 1 0 8'},
    {id:'medico',label:'Médico',icon:'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM12 8v8M8 12h8'},
  ];
  return`<div class="cat-wrap" style="padding-bottom:0;">
    <div class="q-section-h">
      <div class="q-section-h__l">
        <h2>${catName} ${rolePill}</h2>
        <p>${c.players.length} jugadores en plantel${isOwner()?` · <button class="sm-btn" style="padding:1px 7px;font-size:10px;" data-action="editcurrentcat">⚙ Editar</button>`:''}</p>
      </div>
      <div class="q-section-h__r">
        <button class="q-btn q-btn--ghost q-btn--sm" data-action="backtoTeam">${svg('m15 6-6 6 6 6')} ${getTeam().name||'Equipo'}</button>
        ${canEdit()&&S.tab==='attend'?`<button class="q-btn q-btn--primary q-btn--sm" data-action="save">Guardar asistencia</button>`:''}
      </div>
    </div>
    <div class="q-tabs">
      ${tabs.map(({id,label,icon,num})=>`<button class="q-tab${S.tab===id?' active':''}" data-action="tab" data-tab="${id}">${svg(icon)}${label}${num!==undefined?`<span class="tnum">${num}</span>`:''}</button>`).join('')}
    </div>
  </div>`;
}

function renderCat(){
  const map={attend:renderAttend,session:renderSession,metrics:renderMetrics,reports:renderReports,roster:renderRoster,medico:renderMedical};
  return`<div class="cat-wrap" style="padding-top:0;">${(map[S.tab]||renderRoster)()}</div>`;
}

// ── ATTENDANCE ────────────────────────────────────────────────
function renderAttend(){
  const cd=getCat();
  const editable=canEdit();
  const svg=(d)=>`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden><path d="${d}"/></svg>`;

  // Date display
  const dateObj=new Date(S.date+'T12:00:00');
  const dayNames=['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const monthNames=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const dateStr=`${dayNames[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(2,'0')} ${monthNames[dateObj.getMonth()]}`;

  // Attendance counts (P/T/A/L/J)
  const counts={P:0,T:0,A:0,L:0,J:0};
  cd.players.forEach(p=>{const s=S.sess[p.id]||'';if(counts[s]!==undefined)counts[s]++;});
  const total=cd.players.length;
  const present=counts.P+counts.T;
  const pct=total?Math.round(present/total*100):0;

  // Session info for RPE
  const sessEx=cd.sessions?.[S.date];
  const stDef=SESSION_TYPES.find(t=>t.id===sessEx?.sessionType);

  // Roster rows
  const rows=cd.players.map(p=>{
    const cur=S.sess[p.id]||'';
    const initials=p.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
    const pos=p.personal?.position||'';
    const rpeVal=sessEx?.playerRPE?.[p.id]??sessEx?.teamRPE??null;
    const dur=parseInt(sessEx?.duration)||0;
    const ua=rpeVal!==null&&dur?rpeVal*dur:null;
    const toggle=['P','T','A','L','J'].map(s=>`<button class="b ${s.toLowerCase()}${cur===s?' on':''}" ${editable?`data-action="setstatus" data-pid="${p.id}" data-status="${s}"`:'disabled'}>${s}</button>`).join('');
    return`<div class="q-roster__row">
      <span class="ath">
        <span class="av">${initials}</span>
        <span class="nm">${p.name}</span>
        ${pos?`<span class="pos">${pos}</span>`:''}
      </span>
      <span><div class="q-att-toggle">${toggle}</div></span>
      <span class="nmono${rpeVal===null?' muted':''}">${rpeVal!==null?rpeVal:'—'}</span>
      <span class="nmono${ua===null?' muted':''}">${ua!==null?ua+' UA':'—'}</span>
      <span style="display:flex;gap:6px;justify-content:flex-end;">
        <button class="q-btn q-btn--ghost q-btn--sm" style="font-size:10.5px;" data-action="openathlete" data-pid="${p.id}">Ficha ${svg('m9 6 6 6-6 6')}</button>
      </span>
    </div>`;
  }).join('');

  return`${!editable?`<div class="readonly-banner">👁 Modo lectura — no podés editar asistencia en esta categoría.</div>`:''}
  <div class="q-att-head">
    <div class="q-date">
      <button class="q-date__btn" data-action="prevday">${svg('m15 6-6 6 6 6')}</button>
      <div class="q-date__main">
        <span class="d">${dateStr}</span>
        <span class="dow"><input type="date" value="${S.date}" max="${TODAY}" id="date-input"></span>
      </div>
      <button class="q-date__btn" data-action="nextday" ${S.date>=TODAY?'disabled':''}>${svg('m9 6 6 6-6 6')}</button>
    </div>
    ${stDef?`<span style="font-size:12px;color:var(--text-2);padding:4px 8px;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--r-2);">${stDef.icon} ${stDef.label}</span>`:''}
    ${editable?`<button class="q-btn q-btn--ghost q-btn--sm" data-action="allp">${svg('M20 6 9 17l-5-5')} Todos presente</button>
    <button class="q-btn q-btn--ghost q-btn--sm" data-action="alla">${svg('M18 6 6 18M6 6l12 12')} Todos ausente</button>`:''}
    <span id="save-msg" style="font-size:12px;color:var(--ok);font-weight:500;margin-left:auto;"></span>
  </div>
  <div class="q-att-summary">
    <div class="cell featured">
      <span class="lbl"><span class="sw" style="background:var(--accent)"></span>Asistencia</span>
      <span class="v">${pct}<span class="pct">%</span></span>
      <span class="sub">${present} / ${total} — obj ≥ 85%</span>
    </div>
    <div class="cell">
      <span class="lbl"><span class="sw" style="background:var(--ok)"></span>Presentes</span>
      <span class="v" style="color:var(--ok);">${counts.P}</span>
      <span class="sub">${counts.T>0?counts.T+' tarde':''}</span>
    </div>
    <div class="cell">
      <span class="lbl"><span class="sw" style="background:var(--warn)"></span>Tarde</span>
      <span class="v" style="color:var(--warn);">${counts.T}</span>
      <span class="sub">—</span>
    </div>
    <div class="cell">
      <span class="lbl"><span class="sw" style="background:var(--bad)"></span>Ausentes</span>
      <span class="v" style="color:var(--bad);">${counts.A}</span>
      <span class="sub">${counts.A>0?'sin justificar':'—'}</span>
    </div>
    <div class="cell">
      <span class="lbl"><span class="sw" style="background:#C9A6FF"></span>Lesión / Just.</span>
      <span class="v" style="color:#C9A6FF;">${counts.L+counts.J}</span>
      <span class="sub">${[counts.L?counts.L+' lesión':'',counts.J?counts.J+' just.':''].filter(Boolean).join(' · ')||'—'}</span>
    </div>
  </div>
  <div class="q-roster">
    <div class="q-roster__head">
      <span>Atleta</span>
      <span>Estado</span>
      <span>RPE</span>
      <span>Carga</span>
      <span style="text-align:right;">Acciones</span>
    </div>
    ${rows}
  </div>
  <div style="font-size:11.5px;color:var(--text-2);margin-top:8px;">${total} atletas · ${editable?'clic en estado para cambiar':'modo lectura'}</div>`;
}


// ── SESSION ───────────────────────────────────────────────────
function renderSession(){
  const svg=(d)=>`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const dateObj=new Date(S.date+'T12:00:00');
  const dayNames=['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const monthNames=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const dateStr=`${dayNames[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(2,'0')} ${monthNames[dateObj.getMonth()]}`;
  return`<div class="q-att-head">
    <div class="q-date">
      <button class="q-date__btn" data-action="prevday">${svg('m15 6-6 6 6 6')}</button>
      <div class="q-date__main">
        <span class="d">${dateStr}</span>
        <span class="dow"><input type="date" value="${S.date}" max="${TODAY}" id="date-input"></span>
      </div>
      <button class="q-date__btn" data-action="nextday" ${S.date>=TODAY?'disabled':''}>${svg('m9 6 6 6-6 6')}</button>
    </div>
    <div class="q-att-toggle" style="margin-left:auto;">
      <button class="b${S.sessionSub==='plan'?' on p':''}" data-action="sessionsub" data-sub="plan">Plan</button>
      <button class="b${S.sessionSub==='load'?' on p':''}" data-action="sessionsub" data-sub="load">Carga RPE</button>
      <button class="b${S.sessionSub==='wellness'?' on p':''}" data-action="sessionsub" data-sub="wellness">Wellness</button>
    </div>
  </div>
  ${S.sessionSub==='plan'?renderPlan():S.sessionSub==='load'?renderSessionLoad():renderSessionWellness()}`;
}
// ── PLAN editor ───────────────────────────────────────────────
function renderPlan(){
  const editable=canEdit();
  const plans=Object.entries(S.sessionPlans||{}).sort((a,b)=>(a[1].createdAt||0)-(b[1].createdAt||0));
  const cd=getCat();
  const planForm=S.planForm;
  const planFormHtml=planForm?`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h"><h3>${planForm.mode==='edit'?'Editar plan':'Nuevo plan'}</h3></div>
    <div class="q-card__b" style="padding:12px 16px;display:flex;flex-direction:column;gap:10px;">
      <div class="form-field"><label>Nombre del plan</label>
        <input type="text" id="planform-name" value="${planForm.name||''}" placeholder="ej: Fuerza tren inferior" class="q-input">
      </div>
      <div>
        <label style="font-size:12px;font-weight:500;color:var(--text-2);margin-bottom:6px;display:block;">Asignar a</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="q-btn${planForm.assignedToAll?' q-btn--primary':''}" data-action="plantoggleall" style="font-size:12px;padding:4px 10px;">Toda la categoría</button>
          ${cd.players.map(p=>{
            const sel=!planForm.assignedToAll&&planForm.assignedTo?.[p.id];
            return`<button class="q-btn${sel?' q-btn--primary':''}" data-action="plantoggleplayer" data-pid="${p.id}" style="font-size:12px;padding:4px 10px;">${p.name}</button>`;
          }).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="q-btn q-btn--primary" data-action="saveplanform">Guardar</button>
        <button class="q-btn" data-action="cancelplanform">Cancelar</button>
      </div>
    </div>
  </div>`:'';
  const plansHtml=plans.map(([planId,plan])=>{
    const blocks=Object.entries(plan.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    const assignedNames=plan.assignedToAll?'Toda la categoría':Object.keys(plan.assignedTo||{}).map(pid=>{
      const p=cd.players.find(pl=>pl.id===pid);return p?p.name:'';
    }).filter(Boolean).join(', ')||'Sin asignar';
    const isUnassigned=!plan.assignedToAll&&!Object.keys(plan.assignedTo||{}).length;
    return`<div class="q-plan-card">
      <div class="q-plan-card__head">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:var(--text-0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${plan.name||'Plan sin nombre'}</div>
          <div style="font-size:12px;margin-top:3px;display:flex;align-items:center;gap:5px;color:${isUnassigned?'var(--warn)':'var(--text-2)'};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${assignedNames}
          </div>
        </div>
        <div class="q-plan-actions">
          <button class="q-plan-btn q-plan-btn--ghost" data-action="exportplanpdf" data-ctx="session" data-planid="${planId}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Exportar PDF
          </button>
          ${editable?`<button class="q-plan-btn q-plan-btn--assign" data-action="editplanmeta" data-planid="${planId}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Asignar
          </button>
          <button class="q-plan-btn q-plan-btn--danger" data-action="deleteplan" data-planid="${planId}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Eliminar
          </button>`:''}
        </div>
      </div>
      <div class="q-plan-blocks">${blocks.map(([bid,block])=>renderPlanBlock(bid,block,{planId})).join('')}</div>
      ${editable?`<button class="q-btn q-btn--ghost q-add-block-btn" data-action="addblock" data-ctx="session" data-planid="${planId}">+ Agregar bloque</button>`:''}
    </div>`;
  }).join('');
  const emptyHtml=!plans.length&&!planForm?`<div class="q-empty-state"><div style="font-size:32px;margin-bottom:8px;">🏋️</div><div style="font-weight:600;">Sin plan para este día</div><div style="font-size:13px;color:var(--text-2);margin-top:4px;">Creá un plan o cargá desde un programa guardado</div></div>`:'';
  return`<div style="padding-top:4px;">
    ${editable?`<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;">
      <button class="q-btn" data-action="newplanfromprogram" style="font-size:13px;">📋 Desde programa</button>
      <button class="q-btn q-btn--primary" data-action="newplan" style="font-size:13px;">+ Nuevo plan</button>
    </div>`:''}
    ${planFormHtml}
    ${plansHtml}
    ${emptyHtml}
  </div>`;
}

function renderPlanBlock(bid, block, ctx){
  const typeInfo=blockTypeInfo(block.type||'custom');
  const collapseKey=`${ctx.planId||ctx.progId+'_'+ctx.dayId}__${bid}`;
  const collapsed=S.planCollapsed[collapseKey];
  const items=Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const isSession=!!ctx.planId;
  const editable=isSession?canEdit():true;
  const editingBlockName=S.planEditBlock&&S.planEditBlock.blockId===bid&&
    ((isSession&&S.planEditBlock.planId===ctx.planId)||(ctx.progId&&S.planEditBlock.progId===ctx.progId));
  const blockHeader=editingBlockName?
    `<div style="display:flex;gap:8px;flex:1;align-items:center;">
      <input type="text" id="block-name-input" value="${block.name||''}" class="q-input" style="flex:1;font-size:13px;padding:4px 8px;" placeholder="Nombre del bloque">
      <button class="q-btn q-btn--primary" data-action="saveblockname" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" style="padding:4px 10px;font-size:12px;">OK</button>
      <button class="q-btn" data-action="cancelblockname" style="padding:4px 8px;font-size:12px;">✕</button>
    </div>`:
    `<div style="flex:1;display:flex;align-items:center;gap:8px;">
      <span class="q-block-type-tag" style="background:${typeInfo.color}15;color:${typeInfo.color};border:1px solid ${typeInfo.color}40;">${typeInfo.label}</span>
      <span style="font-weight:600;font-size:14px;">${block.name||'Bloque'}</span>
    </div>`;
  const maxSets=items.length?Math.max(...items.map(([,it])=>Object.keys(it.sets||{}).length)):0;
  const setHeaders=maxSets?Array.from({length:maxSets},(_,i)=>`<th style="color:var(--accent);font-weight:700;">Serie #${i+1}</th>`).join(''):'';
  const ctxAttrs=`data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}"`;
  const itemRows=items.map(([iid,item])=>{
    const sets=item.sets||{};
    const setCount=Object.keys(sets).length;
    const setCells=Array.from({length:Math.max(setCount,maxSets)},(_,i)=>{
      const s=sets[String(i)]||{};
      const isEditing=S.planEditSet&&S.planEditSet.blockId===bid&&S.planEditSet.itemId===iid&&S.planEditSet.setIdx===i;
      if(isEditing&&editable){
        const editType=S.planEditSet.editType||s.type||'reps';
        const dv=(k,fb)=>S.planEditSet['draft_'+k]!==undefined?S.planEditSet['draft_'+k]:(fb||'');
        return`<td class="q-set-cell editing q-set-cell--expanded">
          <div class="q-set-form">
            <div class="q-set-type-row">
              <button class="q-set-type-btn${editType==='reps'?' active':''}" data-action="settypetoggle" ${ctxAttrs} data-iid="${iid}" data-sidx="${i}" data-val="reps">Reps</button>
              <button class="q-set-type-btn${editType==='time'?' active':''}" data-action="settypetoggle" ${ctxAttrs} data-iid="${iid}" data-sidx="${i}" data-val="time">Tiempo</button>
            </div>
            <div class="q-set-inputs">
              ${editType==='time'
                ?`<input type="text" id="set-time-${i}" value="${dv('time',s.time)}" placeholder="Duración (ej: 30s)" class="q-input q-set-input" style="width:100%;">`
                :`<input type="text" id="set-reps-${i}" value="${dv('reps',s.reps)}" placeholder="Reps" class="q-input q-set-input">`
              }
              <input type="text" id="set-weight-${i}" value="${dv('weight',s.weight)}" placeholder="Peso (kg)" class="q-input q-set-input">
              <input type="text" id="set-rir-${i}" value="${dv('rir',s.rir)}" placeholder="RiR" class="q-input q-set-input">
              <input type="text" id="set-pct-${i}" value="${dv('pct',s.pct)}" placeholder="%RM" class="q-input q-set-input">
            </div>
            <button data-action="savesetcell" ${ctxAttrs} data-iid="${iid}" data-sidx="${i}" data-settype="${editType}" class="q-btn q-btn--primary" style="width:100%;margin-top:4px;font-size:12px;">OK</button>
          </div>
        </td>`;
      }
      const display=formatSetDisplay(s);
      return`<td class="q-set-cell${editable?' clickable':''}" ${editable?`data-action="editsetcell" ${ctxAttrs} data-iid="${iid}" data-sidx="${i}"`:''}>${display}</td>`;
    }).join('');
    const _exVideoUrl=(DEFAULT_EXERCISES[item.exId]||S.exercises.personal[item.exId]||S.exercises.global[item.exId])?.videoUrl;
    const _hasVideo=_exVideoUrl&&ytId(_exVideoUrl);
    return`<tr>
      <td class="q-ex-name" style="white-space:nowrap;">
        ${item.exName||'Ejercicio'}
        ${_hasVideo?`<button class="q-icon-btn" data-action="showvideo" data-exid="${item.exId}" title="Ver video" style="font-size:10px;padding:2px 6px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--accent);margin-left:6px;vertical-align:middle;">▶</button>`:''}
      </td>
      ${setCells}
      ${editable?`<td class="q-set-cell q-set-actions">
        <button class="q-set-pill q-set-pill--add" data-action="addset" ${ctxAttrs} data-iid="${iid}" title="Agregar serie">+ Serie</button>
        ${setCount>1?`<button class="q-set-pill q-set-pill--rem" data-action="removelastset" ${ctxAttrs} data-iid="${iid}" title="Quitar última serie">− Serie</button>`:''}
        <button class="q-icon-btn" data-action="removeitem" ${ctxAttrs} data-iid="${iid}" title="Eliminar ejercicio" style="color:var(--bad);opacity:.7;">🗑</button>
      </td>`:''}
    </tr>`;
  }).join('');
  const tableHtml=items.length?`<div style="overflow-x:auto;margin-top:8px;">
    <table class="q-plan-table">
      <thead><tr><th style="text-align:left;">Ejercicio</th>${setHeaders}${editable?'<th style="min-width:140px;"></th>':''}</tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>`:'';
  return`<div class="q-block-card" data-bid="${bid}">
    <div class="q-block-card__head">
      ${blockHeader}
      <div style="display:flex;gap:4px;margin-left:4px;">
        <button class="q-icon-btn" data-action="toggleblock" data-colkey="${collapseKey}">${collapsed?'▼':'▲'}</button>
        ${editable&&!editingBlockName?`<button class="q-icon-btn" data-action="editblockname" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Renombrar">✏️</button>`:''}
        ${editable?`<button class="q-icon-btn" data-action="deleteblock" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Eliminar bloque">🗑</button>`:''}
      </div>
    </div>
    ${!collapsed?`${tableHtml}
    ${editable?`<div style="margin-top:8px;">
      <button class="q-btn q-btn--ghost" style="font-size:12px;width:100%;" data-action="addexercise" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}">+ Agregar ejercicio</button>
    </div>`:''}`:``}
  </div>`;
}

function buildExPickerList(){
  const q=(S.exPickerQuery||'').toLowerCase();
  const tab=S.exPickerTab||'global';
  const base=tab==='global'?Object.assign({},DEFAULT_EXERCISES,S.exercises.global):S.exercises.personal||{};
  const filtered=Object.entries(base).filter(([,ex])=>
    !q||ex.name?.toLowerCase().includes(q)||(ex.category||'').toLowerCase().includes(q)
  );
  const grouped={};
  filtered.forEach(([id,ex])=>{
    const cat=ex.category||'Otro';
    if(!grouped[cat]) grouped[cat]=[];
    grouped[cat].push({id,...ex});
  });
  return Object.entries(grouped).sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,exs])=>
    `<div style="margin-bottom:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px;">${cat}</div>
      ${exs.map(ex=>{
        const hasVideo=ex.videoUrl&&ytId(ex.videoUrl);
        return`<div style="display:flex;align-items:center;gap:4px;">
          <div class="q-ex-pick-item" style="flex:1;" data-action="pickexercise" data-exid="${ex.id}" data-exname="${ex.name}">${ex.name}</div>
          ${hasVideo?`<button class="q-icon-btn" data-action="showvideo" data-exid="${ex.id}" title="Ver video" style="font-size:11px;padding:3px 8px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--accent);flex-shrink:0;">▶</button>`:''}
        </div>`;
      }).join('')}
    </div>`
  ).join('')||`<div style="color:var(--text-2);font-size:13px;padding:20px 0;text-align:center;">${q?`Sin resultados para "${S.exPickerQuery}"`:'Sin ejercicios en esta biblioteca'}</div>`;
}

function renderExPickerModal(){
  const body=document.getElementById('app-body');
  if(!body||!S.exPicker) return;
  const existing=document.getElementById('ex-picker-modal');
  if(existing){_updateExPickerList();return;}
  const tab=S.exPickerTab||'global';
  const addForm=S.exPickerAddForm;
  const footerHtml=addForm?
    `<div style="padding:12px 16px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px;">
      <div style="font-size:12px;font-weight:600;color:var(--text-1);">Agregar a mi biblioteca personal</div>
      <input type="text" id="ex-add-name" class="q-input" placeholder="Nombre del ejercicio" value="${addForm.name||''}">
      <select id="ex-add-cat" class="q-input" style="padding:6px 10px;">
        ${EX_CATEGORIES.map(c=>`<option value="${c}"${addForm.category===c?' selected':''}>${c}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;">
        <button class="q-btn q-btn--primary" data-action="confirmaddex" style="flex:1;">Guardar ejercicio</button>
        <button class="q-btn" data-action="canceladdex">Omitir</button>
      </div>
    </div>`:
    `<div style="padding:10px 16px;border-top:1px solid var(--line);">
      <button class="q-btn q-btn--ghost" data-action="savenewpersonalex" style="font-size:12px;width:100%;border-style:dashed;">+ Agregar "${S.exPickerQuery||'nuevo ejercicio'}" a mi biblioteca</button>
    </div>`;
  const modal=document.createElement('div');
  modal.id='ex-picker-modal';
  modal.className='q-modal-backdrop';
  modal.innerHTML=`<div class="q-modal" style="max-width:480px;width:95%;">
    <div class="q-modal__head">
      <span style="font-weight:600;">Seleccionar ejercicio</span>
      <button class="q-icon-btn" data-action="closeexpicker">✕</button>
    </div>
    <div style="padding:12px 16px;border-bottom:1px solid var(--line);">
      <div class="q-att-toggle" style="margin-bottom:10px;">
        <button class="b${tab==='global'?' on p':''}" data-action="expickertab" data-tab="global">Global</button>
        <button class="b${tab==='personal'?' on p':''}" data-action="expickertab" data-tab="personal">Personal</button>
      </div>
      <input type="text" id="ex-picker-q" class="q-input" placeholder="Buscar ejercicio..." value="${S.exPickerQuery||''}" style="width:100%;" autocomplete="off">
    </div>
    <div id="ex-picker-list" style="padding:12px 16px;max-height:300px;overflow-y:auto;">${buildExPickerList()}</div>
    ${footerHtml}
  </div>`;
  body.appendChild(modal);
  document.querySelectorAll('#ex-picker-modal [data-action]').forEach(el=>el.addEventListener('click',handleAction));
  const qi=document.getElementById('ex-picker-q');
  if(qi){
    qi.focus();
    qi.addEventListener('input',e=>{
      S.exPickerQuery=e.target.value;
      _updateExPickerList();
      const footBtn=document.querySelector('#ex-picker-modal [data-action="savenewpersonalex"]');
      if(footBtn) footBtn.textContent=`+ Agregar "${S.exPickerQuery||'nuevo ejercicio'}" a mi biblioteca`;
    });
  }
}

function _updateExPickerList(){
  const listEl=document.getElementById('ex-picker-list');
  if(listEl) listEl.innerHTML=buildExPickerList();
  document.querySelectorAll('#ex-picker-list [data-action]').forEach(el=>el.addEventListener('click',handleAction));
}

function renderSessionLoad(){
  const sd=S.sessionDraft,cd=getCat(),ex=cd.sessions?.[S.date]||{};
  const editable=canEdit();
  const dur=parseInt(sd.duration)||0;
  const stVal=sd.sessionType;const stDef=stVal?SESSION_TYPES.find(t=>t.id===stVal):null;
  const convocados=cd.players.filter(p=>S.sess[p.id]==='P'||S.sess[p.id]==='T').length;
  const teamRpe=sd.teamRPE;
  const indRpeVals=Object.values(sd.playerRPE||{});
  const avgIndRpe=indRpeVals.length>0?Math.round(indRpeVals.reduce((a,b)=>a+b,0)/indRpeVals.length*10)/10:null;
  const rpeDisplay=teamRpe!==null?teamRpe:avgIndRpe;
  const loadEst=rpeDisplay!==null&&dur?Math.round(rpeDisplay*dur):null;
  const hasLoad=ex.duration&&(ex.teamRPE!=null||Object.keys(ex.playerRPE||{}).length);
  const stBtns=SESSION_TYPES.map(t=>`<button class="q-sess-type-btn${stVal===t.id?' active':''}" ${editable?`data-action="sessiontype" data-type="${t.id}"`:'disabled'}>${t.icon} ${t.label}</button>`).join('');
  return`${!editable?`<div class="readonly-banner" style="margin-bottom:12px;">👁 Modo lectura — no podés editar sesiones en esta categoría.</div>`:''}
  <div class="q-att-summary" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px;">
    <div class="cell featured">
      <span class="lbl">Duración</span>
      <span class="v">${dur||'—'}<span class="pct">${dur?' min':''}</span></span>
      <span class="sub">${stDef?stDef.icon+' '+stDef.label:'Sin tipo'}</span>
    </div>
    <div class="cell">
      <span class="lbl">Carga estimada</span>
      <span class="v" style="color:var(--accent);">${loadEst!==null?loadEst:'—'}<span class="pct">${loadEst?' UA':''}</span></span>
      <span class="sub">${dur&&rpeDisplay!==null?dur+'min × RPE'+rpeDisplay:'—'}</span>
    </div>
    <div class="cell">
      <span class="lbl">RPE</span>
      <span class="v">${rpeDisplay!==null?rpeDisplay:'—'}<span class="pct">${rpeDisplay!==null?' /10':''}</span></span>
      <span class="sub">${S.rpeMode==='team'?'Equipo':'Individual'}</span>
    </div>
    <div class="cell">
      <span class="lbl">Convocados</span>
      <span class="v" style="color:var(--ok);">${convocados}</span>
      <span class="sub">${cd.players.length} en plantel</span>
    </div>
  </div>
  <div class="q-card">
    <div class="q-card__h">
      <h3>Tipo de sesión · Duración</h3>
      ${hasLoad?`<span class="meta">✓ Guardado · ${ex.duration}min · RPE ${ex.teamRPE!=null?ex.teamRPE+' (equipo)':'individual'}</span>`:'<span class="meta">Sin guardar</span>'}
    </div>
    <div class="q-card__b" style="padding:12px 16px;">
      <div class="q-sess-type-row">${stBtns}</div>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:12px;color:var(--text-2);font-weight:500;">Duración</span>
          <input type="number" id="dur-input" value="${sd.duration||''}" placeholder="90" min="1" max="300" class="q-dur-input" ${editable?'':'disabled'}>
          <span style="font-size:12px;color:var(--text-2);">min</span>
        </div>
        ${editable?`<div class="q-att-toggle" style="margin-left:auto;">
          <button class="b${S.rpeMode==='team'?' on p':''}" data-action="rpemode" data-mode="team">Equipo</button>
          <button class="b${S.rpeMode==='individual'?' on p':''}" data-action="rpemode" data-mode="individual">Individual</button>
        </div>`:''}
      </div>
    </div>
    ${S.rpeMode==='team'?renderTeamRPE():renderIndividualRPE()}
    ${editable?`<div style="padding:12px 16px;border-top:1px solid var(--line);">
      <button class="q-btn q-btn--primary" style="width:100%;" data-action="savesession">Guardar sesión</button>
      <span id="sess-save-msg" style="display:block;text-align:center;font-size:12px;color:var(--ok);font-weight:500;margin-top:6px;min-height:18px;"></span>
    </div>`:''}
  </div>`;
}
function renderTeamRPE(){
  const val=S.sessionDraft.teamRPE,dur=parseInt(S.sessionDraft.duration)||0;
  const editable=canEdit();
  const btns=Array.from({length:11},(_,i)=>`<button class="q-rpe-btn${val===i?' sel':''}"${val===i?` style="background:${RPE_BG[i]}22;color:${RPE_BG[i]};border-color:${RPE_BG[i]};"`:''}${editable?` data-action="teamrpe" data-rpe="${i}"`:' disabled'}>${i}</button>`).join('');
  return`<div style="padding:14px 16px;border-top:1px solid var(--line);">
    <div style="font-size:11px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:10px;">Percepción del esfuerzo (CR-10)</div>
    <div class="q-rpe-grid">${btns}</div>
    ${val!==null?`<div style="margin-top:10px;padding:8px 12px;border-radius:var(--r-2);background:${RPE_BG[val]}18;color:${RPE_BG[val]};font-size:13px;font-weight:500;">${RPE_LABELS[val]}${dur?` · <span style="font-family:var(--font-mono);">${val*dur} UA</span>`:''}</div>`:`<div style="margin-top:10px;font-size:12px;color:var(--text-2);">Seleccioná el RPE del equipo</div>`}
  </div>`;
}
function renderIndividualRPE(){
  const cd=getCat(),att=cd.attendance[S.date]||{},dur=parseInt(S.sessionDraft.duration)||0;
  const editable=canEdit();
  const isMob=window.innerWidth<900;
  if(!S.rpeExpand)S.rpeExpand={};
  return`<div style="border-top:1px solid var(--line);">
    <div style="padding:8px 16px;background:var(--bg-1);border-bottom:1px solid var(--line);font-size:10.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;">RPE por jugador</div>
    ${cd.players.map(p=>{
      const status=att[p.id],isPresent=status==='P'||status==='T';
      const rpeVal=S.sessionDraft.playerRPE[p.id]??null;
      const initials=p.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
      if(!isPresent){const stateLabel={A:'Ausente',L:'Lesión',J:'Justificado'};return`<div class="q-ind-row absent"><div class="q-ind-ath"><span class="av">${initials}</span><span class="nm">${p.name}</span></div><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:var(--bad-soft);color:var(--bad);">${stateLabel[status]||'Sin registro'}</span></div>`;}
      if(isMob&&!S.rpeExpand[p.id]){
        const playerDur=S.sessionDraft.playerDuration[p.id]!=null?S.sessionDraft.playerDuration[p.id]:dur;
        const ua=rpeVal!==null&&playerDur?rpeVal*playerDur:null;
        const durTag=S.sessionDraft.playerDuration[p.id]!=null?`<span style="font-size:10px;color:var(--accent);font-family:var(--font-mono);padding:1px 5px;border-radius:4px;background:var(--accent-soft);">${playerDur}min</span>`:'';
        const pill=rpeVal!==null
          ?`<span style="width:38px;height:38px;border-radius:8px;display:grid;place-items:center;font:700 20px var(--font-mono);background:${RPE_BG[rpeVal]}22;color:${RPE_BG[rpeVal]};border:1.5px solid ${RPE_BG[rpeVal]}55;">${rpeVal}</span>${ua!==null?`<span style="font-size:11px;font-family:var(--font-mono);color:var(--text-2);">${ua} UA</span>`:''}${durTag}`
          :`<span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">—</span>`;
        const btn=editable?`<button style="font-size:11px;padding:5px 12px;border-radius:6px;border:1px solid var(--line);background:var(--bg-3);color:var(--text-1);cursor:pointer;" data-action="expandrpe" data-pid="${p.id}">${rpeVal!==null?'Cambiar':'Elegir'}</button>`:'';
        return`<div class="q-ind-row" style="justify-content:space-between;">
          <div class="q-ind-ath"><span class="av">${initials}</span><span class="nm">${p.name}</span></div>
          <div style="display:flex;align-items:center;gap:8px;">${pill}${btn}</div>
        </div>`;
      }
      const btns=Array.from({length:11},(_,i)=>`<button class="b${rpeVal===i?' sel':''}"${rpeVal===i?` style="background:${RPE_BG[i]}22;color:${RPE_BG[i]};border-color:${RPE_BG[i]};"`:''}${editable?` data-action="playerrpe" data-pid="${p.id}" data-rpe="${i}"`:' disabled'}>${i}</button>`).join('');
      const playerDur=S.sessionDraft.playerDuration[p.id]!=null?S.sessionDraft.playerDuration[p.id]:dur;
      const durChanged=S.sessionDraft.playerDuration[p.id]!=null&&S.sessionDraft.playerDuration[p.id]!==dur;
      return`<div class="q-ind-row">
        <div class="q-ind-ath"><span class="av">${initials}</span><span class="nm">${p.name}</span></div>
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <input type="number" class="q-pdur-input" data-pid="${p.id}" value="${playerDur||''}" placeholder="${dur||'—'}" min="1" max="300" ${editable?'':'disabled'}${durChanged?' style="border-color:var(--accent);color:var(--accent);"':''}>
          <span style="font-size:11px;color:var(--text-2);">min</span>
        </div>
        <div class="q-ind-rpe">${btns}</div>
        <span style="font-size:12px;font-family:var(--font-mono);color:${rpeVal!==null?RPE_BG[rpeVal]:'var(--text-2)'};min-width:64px;text-align:right;">${rpeVal!==null?`RPE ${rpeVal}${playerDur?' · '+rpeVal*playerDur+' UA':''}`:''}</span>
      </div>`;
    }).join('')}
  </div>`;
}
function renderSessionWellness(){
  const cd=getCat(),editable=canEdit();
  return`<div class="q-card">
    <div class="q-card__h"><h3>Wellness pre-sesión</h3><span class="meta">${fmtDate(S.date)}</span></div>
    ${cd.players.map(p=>{
      const w=S.wellnessDraft[p.id];
      const hasAll=w&&W_KEYS.every(k=>w[k]!=null);
      const avgScore=w?W_KEYS.reduce((a,k)=>a+(w[k]||0),0)/W_KEYS.length:null;
      const dotColor=avgScore===null?'var(--text-2)':W_COLORS[Math.round(clamp(avgScore,1,5))-1];
      const expanded=!!S.wellnessExpanded[p.id];
      const initials=p.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
      const wellItems=W_KEYS.map(k=>{
        const v=w?.[k]??null;
        const opts=[1,2,3,4,5].map(n=>{const sel=v===n;const nc=wellColor(n);return`<button class="wb${sel?' wsel':''}" style="${sel?`background:${nc};border-color:${nc};color:#fff;`:`border-color:${nc};color:${nc};`}" data-action="wellness" data-pid="${p.id}" data-key="${k}" data-val="${n}">${n}</button>`;}).join('');
        return`<div class="q-well-item"><span class="wkey">${W_ICONS[k]} ${W_LABELS[k]}</span><div class="wopts">${opts}</div>${v!==null?`<span style="font-size:11px;color:var(--text-2);margin-left:8px;">${W_TIPS[k][v-1]}</span>`:''}</div>`;
      }).join('');
      return`<div class="q-well-row" data-action="togglewellness" data-pid="${p.id}">
        <div class="q-well-head">
          <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;display:inline-block;"></span>
          <span style="width:26px;height:26px;border-radius:50%;background:var(--bg-4);display:grid;place-items:center;font:600 10px var(--font-ui);color:var(--text-1);flex-shrink:0;">${initials}</span>
          <span style="font-weight:500;font-size:13px;">${p.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">${hasAll?`<span style="font-size:12px;color:${dotColor};font-weight:600;font-family:var(--font-mono);">${avgScore.toFixed(1)}/5</span>`:`<span style="font-size:11px;color:var(--text-2);">${w?'Parcial':'Sin registro'}</span>`}<span style="font-size:11px;color:var(--text-3);">${expanded?'▲':'▼'}</span></div>
      </div>
      ${expanded?`<div class="q-well-expand">${wellItems}${editable?`<button class="q-btn q-btn--primary" style="width:100%;margin-top:12px;" data-action="savesession">Guardar wellness</button>`:''}</div>`:''}`
    }).join('')}
  </div>`;
}

// ── METRICS ───────────────────────────────────────────────────
function renderMetrics(){
  const cd=getCat();
  if(!cd.players.length)return`<div class="empty-state">Sin jugadores en el plantel.</div>`;
  const allM=cd.players.map(p=>{const m=calcMetrics(cd,p.id);return{...m,id:p.id,name:p.name,pos:p.position||''};});
  const withData=allM.filter(m=>m.hasData);
  const acwrStatus=(acwr)=>{
    if(acwr===null)return null;
    if(acwr<0.8)return{lbl:'Baja',c:'var(--info)',s:'var(--info-soft)'};
    if(acwr<=1.3)return{lbl:'Óptima',c:'var(--ok)',s:'var(--ok-soft)'};
    if(acwr<=1.5)return{lbl:'Elevada',c:'var(--warn)',s:'var(--warn-soft)'};
    return{lbl:'Pico',c:'var(--bad)',s:'var(--bad-soft)'};
  };
  const avgAcwrVals=allM.filter(m=>m.acwr!==null);
  const avgAcwr=avgAcwrVals.length>0?Math.round(avgAcwrVals.reduce((a,m)=>a+m.acwr,0)/avgAcwrVals.length*100)/100:null;
  const avgWeekly=withData.length>0?Math.round(withData.reduce((a,m)=>a+m.ac,0)/withData.length):0;
  const avgMono=withData.length>0?Math.round(withData.reduce((a,m)=>a+m.monotony,0)/withData.length*10)/10:0;
  const atRisk=allM.filter(m=>m.acwr!==null&&m.acwr>1.3).length;
  const teamSt=acwrStatus(avgAcwr);
  const FILTER_OPTS=[['7d','7d'],['1m','28d'],['custom','A medida']];
  const filterToggle=`<div class="q-att-toggle" style="background:var(--bg-2);">${FILTER_OPTS.map(([v,l])=>`<button class="b${S.loadFilter===v?' on p':''}" data-action="loadfilter" data-val="${v}" style="height:26px;">${l}</button>`).join('')}</div>`;
  const {from,to}=getFilterWindow();
  const filterLabel=S.loadFilter==='7d'?'últimos 7 días':S.loadFilter==='1m'?'últimos 28 días':`${fmtDate(from)}–${fmtDate(to)}`;
  const sectionHeader=`<div class="q-section-h" style="margin-bottom:14px;">
    <div class="q-section-h__l"><h2>Métricas · Carga de equipo</h2><p>${withData.length} atletas con datos · ${filterLabel}</p></div>
    <div class="q-section-h__r">${filterToggle}<button class="q-btn q-btn--ghost q-btn--sm" data-action="exportloadspdf">⬇ Exportar</button></div>
  </div>`;
  const kpiRow=`<div class="q-stats">
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Carga semanal prom.</span></div><div class="q-stat__val">${avgWeekly}<span class="u">UA</span></div><div class="q-stat__sub"><span>Promedio del plantel</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">ACWR equipo</span></div><div class="q-stat__val" style="color:${teamSt?teamSt.c:'var(--text-0)'};">${avgAcwr!==null?avgAcwr:'—'}</div><div class="q-stat__sub"><span class="q-stat__delta flat">${teamSt?teamSt.lbl:'Sin datos'}</span><span>rango 0.8–1.3</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Monotonía</span></div><div class="q-stat__val">${avgMono||'—'}</div><div class="q-stat__sub"><span>variación del plantel</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Atletas en riesgo</span></div><div class="q-stat__val" style="color:${atRisk>0?'var(--bad)':'var(--ok)'};">${atRisk}<span class="u">/${allM.length}</span></div><div class="q-stat__sub"><span>ACWR &gt; 1.3</span></div></div>
  </div>`;
  const teamDays=Array.from({length:28},(_,i)=>{
    const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-(27-i));
    const ds=d.toISOString().split('T')[0];
    const tot=allM.reduce((a,m)=>a+playerLoadOnDate(cd,m.id,ds),0);
    return{ds,avg:allM.length>0?Math.round(tot/allM.length):0};
  });
  const maxDay=Math.max(...teamDays.map(d=>d.avg),1);
  const barChart=`<div class="q-card" style="margin-bottom:14px;">
    <div class="q-card__h"><h3>Carga diaria · 28 días</h3><span class="meta">Promedio del plantel</span></div>
    <div style="padding:16px;">
      <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">${teamDays.map(d=>{const pct=d.avg/maxDay;const col=pct>0.85?'var(--bad)':pct>0.65?'var(--warn)':d.avg>0?'var(--accent)':'var(--bg-3)';return`<div style="flex:1;height:${Math.max(d.avg>0?4:2,Math.round(pct*80))}px;background:${col};border-radius:2px 2px 0 0;" title="${d.ds}: ${d.avg} UA"></div>`;}).join('')}</div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-family:var(--font-mono);font-size:10px;color:var(--text-2);">
        <span>${fmtDate(teamDays[0].ds)}</span><span>${fmtDate(teamDays[6].ds)}</span><span>${fmtDate(teamDays[13].ds)}</span><span>${fmtDate(teamDays[20].ds)}</span><span>${fmtDate(teamDays[27].ds)}</span>
      </div>
    </div>
  </div>`;
  let sessionDays=0;for(let i=0;i<28;i++){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];if(cd.sessions[ds]?.duration)sessionDays++;}
  const insufficientBanner=sessionDays<14?`<div class="readonly-banner">⏳ Datos insuficientes — el ACWR requiere al menos 2–3 semanas de historial. Seguí registrando sesiones.</div>`:'';
  const riskPl=allM.filter(m=>m.acwr!==null&&m.acwr>1.5);
  const lowPl=allM.filter(m=>m.acwr!==null&&m.acwr<0.8);
  const monoPl=allM.filter(m=>m.monotony>2.0);
  const alertsBanner=(riskPl.length||lowPl.length||monoPl.length)?`<div class="alert-banner" style="margin-bottom:14px;">
    <div class="alert-banner-title"><span style="font-size:15px;">⚠</span> Alertas</div>
    ${riskPl.map(m=>`<div style="font-size:12px;">• ${m.name}: ACWR ${m.acwr} — Riesgo sobreentrenamiento</div>`).join('')}
    ${lowPl.map(m=>`<div style="font-size:12px;">• ${m.name}: ACWR ${m.acwr} — Subcarga</div>`).join('')}
    ${monoPl.map(m=>`<div style="font-size:12px;">• ${m.name}: Monotonía ${m.monotony} — Alta</div>`).join('')}
  </div>`:'';
  if(!withData.length)return sectionHeader+kpiRow+barChart+insufficientBanner+`<div class="empty-state">Sin datos de sesión aún.<br>Registrá RPE y duración en la tab <strong>Sesión</strong>.</div>`;
  const sorted=[...allM].sort((a,b)=>(b.acwr??-1)-(a.acwr??-1));
  const COL='minmax(0,1.6fr) 50px 80px 100px 80px 80px 1fr 90px';
  const tableHead=`<div style="display:grid;grid-template-columns:${COL};gap:14px;padding:10px 16px;background:var(--bg-1);border-bottom:1px solid var(--line);font-size:10.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;font-weight:600;">
    <span>Atleta</span><span>Pos</span><span>ACWR</span><span>Carga sem.</span><span>Monotonía</span><span>Strain</span><span>Distribución 7d</span><span>Estado</span>
  </div>`;
  const tableRows=sorted.map((m,i)=>{
    const st=acwrStatus(m.acwr);
    const initials=m.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
    const maxSpark=Math.max(...m.l7,1);
    const sparks=m.l7.map(v=>{const pct=v/maxSpark;const col=pct>0.85?'var(--bad)':pct>0.65?'var(--warn)':v>0?'var(--accent)':'var(--bg-3)';return`<i style="flex:1;height:${Math.max(v>0?4:2,Math.round(pct*20))}px;max-height:20px;background:${col};border-radius:1px;display:block;"></i>`;}).join('');
    const pill=st?`<span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;background:${st.s};color:${st.c};font-size:11px;font-weight:600;">● ${st.lbl}</span>`:`<span style="font-size:11px;color:var(--text-3);">Sin datos</span>`;
    return`<div style="display:grid;grid-template-columns:${COL};gap:14px;padding:10px 16px;align-items:center;border-bottom:${i<sorted.length-1?'1px solid var(--line)':'0'};font-size:13px;">
      <span style="display:flex;align-items:center;gap:10px;"><span style="width:26px;height:26px;border-radius:50%;background:var(--bg-3);display:grid;place-items:center;font-size:10px;font-weight:600;flex-shrink:0;">${initials}</span><span style="font-weight:500;">${m.name}</span></span>
      <span style="font-size:11px;color:var(--text-2);font-family:var(--font-mono);">${m.pos}</span>
      <span style="font-family:var(--font-mono);font-size:14px;font-weight:500;color:${st?st.c:'var(--text-2)'};">${m.acwr!==null?m.acwr:'—'}</span>
      <span style="font-family:var(--font-mono);">${m.ac.toLocaleString('es-UY')}<span style="color:var(--text-2);font-size:11px;"> UA</span></span>
      <span style="font-family:var(--font-mono);color:${m.monotony>1.8?'var(--warn)':'var(--text-1)'};">${m.monotony||'—'}</span>
      <span style="font-family:var(--font-mono);">${m.strain.toLocaleString('es-UY')}</span>
      <span style="display:flex;align-items:flex-end;gap:2px;height:20px;">${sparks}</span>
      ${pill}
    </div>`;
  }).join('');
  return sectionHeader+kpiRow+barChart+insufficientBanner+alertsBanner+`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><div class="q-card" style="min-width:760px;">${tableHead}${tableRows}</div></div>`;
}

// ── REPORTS ───────────────────────────────────────────────────
function renderReports(){
  const cd=getCat();
  const stats=getStats(cd.players,cd.attendance);
  const weekOffset=S.reportWeekOffset||0;
  // Week bounds (Mon–Sun)
  const monDate=new Date(TODAY+'T12:00:00');
  const dow=monDate.getDay();
  monDate.setDate(monDate.getDate()+(dow===0?-6:1-dow)+weekOffset*7);
  const weekStart=monDate.toISOString().split('T')[0];
  const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(monDate);d.setDate(d.getDate()+i);return d.toISOString().split('T')[0];});
  const weekEnd=weekDays[6];
  const DAY_LBL=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
  // Daily metrics
  const daily=weekDays.map((ds,di)=>{
    const dayAtt=cd.attendance[ds]||{};
    const present=cd.players.filter(p=>{const s=dayAtt[p.id];return s==='P'||s==='T';}).length;
    const pct=cd.players.length>0?Math.round(present/cd.players.length*100):null;
    const sess=cd.sessions[ds];
    return{ds,lbl:DAY_LBL[di],pct,rpe:sess?.teamRPE??null,type:sess?.sessionType??null,hasSess:!!sess?.duration};
  });
  // Week KPIs
  const attDays=daily.filter(d=>d.pct!==null);
  const weekAtt=attDays.length>0?Math.round(attDays.reduce((a,d)=>a+d.pct,0)/attDays.length):null;
  const weekLoadAvg=(()=>{const tot=cd.players.reduce((a,p)=>a+weekDays.reduce((b,ds)=>b+playerLoadOnDate(cd,p.id,ds),0),0);return cd.players.length>0?Math.round(tot/cd.players.length):0;})();
  const rpeDays=daily.filter(d=>d.rpe!==null);
  const weekRPE=rpeDays.length>0?(Math.round(rpeDays.reduce((a,d)=>a+d.rpe,0)/rpeDays.length*10)/10):null;
  const allM=cd.players.map(p=>({...calcMetrics(cd,p.id),id:p.id,name:p.name,pos:p.position||''}));
  const teamACWR=(()=>{const v=allM.filter(m=>m.acwr!==null);return v.length>0?Math.round(v.reduce((a,m)=>a+m.acwr,0)/v.length*100)/100:null;})();
  const atRisk=allM.filter(m=>(m.acwr!==null&&m.acwr>1.3)||stats.find(s=>s.id===m.id&&s.consec>=ALERT_N)).length;
  // Week number
  const weekNum=(()=>{const d=new Date(weekStart+'T12:00:00');d.setDate(d.getDate()+3);const y=d.getFullYear();const s=new Date(y,0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);})();
  const isCurrentWeek=weekOffset===0;
  // Section header
  const sectionHeader=`<div class="q-section-h" style="margin-bottom:14px;">
    <div class="q-section-h__l">
      <div style="font-size:10.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px;">Informe semanal</div>
      <h2>Semana ${weekNum} · ${fmtDate(weekStart)} — ${fmtDate(weekEnd)}</h2>
      <p>${daily.filter(d=>d.hasSess).length} sesiones registradas</p>
    </div>
    <div class="q-section-h__r">
      <button class="q-btn q-btn--ghost q-btn--sm" data-action="prevreportweek">← Sem ${weekNum-1}</button>
      ${!isCurrentWeek?`<button class="q-btn q-btn--ghost q-btn--sm" data-action="nextreportweek">Sem ${weekNum+1} →</button>`:''}
      <button class="q-btn q-btn--ghost q-btn--sm" data-action="exportcategorycsv">⬇ CSV</button>
    </div>
  </div>`;
  // Alerts banner
  const alertCount=stats.filter(s=>s.consec>=ALERT_N).length;
  const alertBanner=alertCount>0?`<div class="alert-banner" style="margin-bottom:14px;"><div class="alert-banner-title">⚠ ${alertCount} jugador${alertCount>1?'es':''} con ${ALERT_N}+ ausencias seguidas</div></div>`:'';
  // KPI strip
  const kpiRow=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;"><div class="q-stats" style="grid-template-columns:repeat(5,minmax(110px,1fr));min-width:540px;">
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Asistencia</span></div><div class="q-stat__val" style="color:${weekAtt!==null?(weekAtt>=85?'var(--ok)':weekAtt>=70?'var(--warn)':'var(--bad)'):'var(--text-0)'};">${weekAtt!==null?weekAtt+'%':'—'}</div><div class="q-stat__sub"><span>semana actual</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Carga total</span></div><div class="q-stat__val">${weekLoadAvg}<span class="u">UA</span></div><div class="q-stat__sub"><span>promedio plantel</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">ACWR</span></div><div class="q-stat__val" style="color:${teamACWR!==null?(teamACWR>1.3?'var(--warn)':teamACWR<0.8?'var(--info)':'var(--ok)'):'var(--text-0)'};">${teamACWR!==null?teamACWR:'—'}</div><div class="q-stat__sub"><span>rango 0.8–1.3</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">RPE medio</span></div><div class="q-stat__val">${weekRPE!==null?weekRPE:'—'}<span class="u">/10</span></div><div class="q-stat__sub"><span>sesiones MC</span></div></div>
    <div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">Atletas en riesgo</span></div><div class="q-stat__val" style="color:${atRisk>0?'var(--bad)':'var(--ok)'};">${atRisk}<span class="u">/${cd.players.length}</span></div><div class="q-stat__sub"><span>ACWR &gt;1.3</span></div></div>
  </div></div>`;
  // Sub-tab toggle
  const currentSub=S.reportSub||'semanal';
  const subTabs=`<div class="q-att-toggle" style="background:var(--bg-2);margin-bottom:14px;">${[['semanal','Resumen'],['players','Jugadores'],['months','Por mes']].map(([v,l])=>`<button class="b${currentSub===v?' on p':''}" data-action="reportsub" data-sub="${v}" style="height:28px;">${l}</button>`).join('')}</div>`;
  // ── Semanal tab ──
  const SESSION_TYPE_ABBR={futbol:'F',fisicoTecnico:'FT',fisico:'T',partido:'P',regenerativo:'R',evaluacion:'E'};
  const dailyChart=`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h"><h3>Distribución diaria · Sem ${weekNum}</h3><span class="meta">Asistencia % · RPE</span></div>
    <div style="padding:16px;">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">${daily.map(d=>{
        const pctH=d.pct!==null?Math.max(4,Math.round(d.pct/100*80)):2;
        const rpeH=d.rpe!==null?Math.max(3,Math.round(d.rpe/10*80)):0;
        const pctCol=d.pct!==null?(d.pct>=85?'var(--ok)':d.pct>=70?'var(--warn)':'var(--bad)'):'var(--bg-3)';
        const typeAbbr=d.type?SESSION_TYPE_ABBR[d.type]||'S':'—';
        return`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:500;color:${d.pct!==null?(d.pct>=85?'var(--ok)':d.pct>=70?'var(--warn)':'var(--bad)'):'var(--text-3)'};">${d.pct!==null?d.pct+'%':'—'}</div>
          <div style="height:80px;width:100%;display:flex;align-items:flex-end;gap:2px;">
            <div style="flex:3;height:${pctH}px;background:${pctCol};border-radius:2px 2px 0 0;opacity:.9;"></div>
            <div style="flex:2;height:${rpeH}px;background:var(--accent);border-radius:2px 2px 0 0;opacity:.9;"></div>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;font-weight:500;color:var(--text-1);">${d.lbl}</div>
          <div style="font-size:10px;color:var(--text-3);">${typeAbbr}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-2);">RPE ${d.rpe!==null?d.rpe:'—'}</div>
        </div>`;
      }).join('')}</div>
      <div style="display:flex;gap:16px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-size:11px;color:var(--text-2);">
        <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--ok);border-radius:2px;flex-shrink:0;"></span>Asistencia (%)</span>
        <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--accent);border-radius:2px;flex-shrink:0;"></span>RPE</span>
        <span style="font-family:var(--font-mono);">F Fútbol · FT Físico-T · T Físico · P Partido · R Regen.</span>
      </div>
    </div>
  </div>`;
  // Trend table (last 8 weeks)
  const trendWeeks=Array.from({length:8},(_,i)=>{
    const off=weekOffset-7+i;
    const wm=new Date(TODAY+'T12:00:00');const wd=wm.getDay();wm.setDate(wm.getDate()+(wd===0?-6:1-wd)+off*7);
    const ws=wm.toISOString().split('T')[0];
    const wdays=Array.from({length:7},(_,j)=>{const d=new Date(wm);d.setDate(d.getDate()+j);return d.toISOString().split('T')[0];});
    const wAttVals=wdays.map(ds=>{const da=cd.attendance[ds]||{};const pr=cd.players.filter(p=>{const s=da[p.id];return s==='P'||s==='T';}).length;return cd.players.length>0?pr/cd.players.length*100:null;}).filter(v=>v!==null);
    const wAtt=wAttVals.length>0?Math.round(wAttVals.reduce((a,b)=>a+b,0)/wAttVals.length):null;
    const wTot=cd.players.reduce((a,p)=>a+wdays.reduce((b,ds)=>b+playerLoadOnDate(cd,p.id,ds),0),0);
    const wLoad=cd.players.length>0?Math.round(wTot/cd.players.length):0;
    const wInj=wdays.reduce((a,ds)=>{const d=cd.attendance[ds]||{};return a+cd.players.filter(p=>d[p.id]==='L').length;},0);
    const wn=(()=>{const d=new Date(ws+'T12:00:00');d.setDate(d.getDate()+3);const y=d.getFullYear();const s=new Date(y,0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);})();
    return{ws,wn,wAtt,wLoad,wInj,isCur:off===0};
  });
  const trendTable=`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h"><h3>Tendencia · 8 semanas</h3></div>
    <div>
      <div style="display:grid;grid-template-columns:70px 1fr 80px 60px 60px;gap:8px;padding:9px 16px;background:var(--bg-1);border-bottom:1px solid var(--line);font-size:10.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;font-weight:600;">
        <span>Sem.</span><span></span><span style="text-align:right;">Carga UA</span><span style="text-align:right;">Asist.</span><span style="text-align:right;">Lesión</span>
      </div>
      ${trendWeeks.map(r=>`<div style="display:grid;grid-template-columns:70px 1fr 80px 60px 60px;gap:8px;padding:8px 16px;border-bottom:1px solid var(--line);background:${r.isCur?'var(--accent-soft)':'transparent'};align-items:center;">
        <span style="font-family:var(--font-mono);font-size:12px;font-weight:${r.isCur?600:500};color:${r.isCur?'var(--accent)':'var(--text-1)'};">S ${r.wn}${r.isCur?' →':''}</span>
        <span></span>
        <span style="font-family:var(--font-mono);font-size:12px;text-align:right;">${r.wLoad>0?r.wLoad.toLocaleString('es-UY'):'—'}</span>
        <span style="font-family:var(--font-mono);font-size:12px;text-align:right;color:${r.wAtt!==null?(r.wAtt>=85?'var(--ok)':r.wAtt>=70?'var(--warn)':'var(--bad)'):'var(--text-3)'};">${r.wAtt!==null?r.wAtt+'%':'—'}</span>
        <span style="font-family:var(--font-mono);font-size:12px;text-align:right;color:${r.wInj>0?'var(--bad)':'var(--text-2)'};">${r.wInj||'—'}</span>
      </div>`).join('')}
    </div>
  </div>`;
  // At-risk players card
  const riskPl=allM.filter(m=>(m.acwr!==null&&m.acwr>1.3)||stats.find(s=>s.id===m.id&&s.consec>=ALERT_N)).slice(0,5);
  const riskCard=`<div class="q-card" style="margin-bottom:12px;">
    <div class="q-card__h">
      <h3>Atletas en riesgo</h3>
      <span class="meta" style="color:var(--bad);background:var(--bad-soft);padding:2px 8px;border-radius:12px;">${riskPl.length}</span>
    </div>
    ${riskPl.length===0?`<div style="padding:14px 16px;font-size:12px;color:var(--text-2);">Sin atletas en riesgo.</div>`:`<div>${riskPl.map((m,i)=>{
      const ps=stats.find(s=>s.id===m.id);
      const reasons=[];if(m.acwr!==null&&m.acwr>1.3)reasons.push('ACWR '+m.acwr);if(m.monotony>2)reasons.push('Monotonía '+m.monotony);if(ps&&ps.consec>=ALERT_N)reasons.push(ps.consec+' aus. seguidas');
      const col=m.acwr>1.5?'var(--bad)':'var(--warn)';
      const initials=m.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
      return`<div style="padding:11px 16px;border-bottom:${i<riskPl.length-1?'1px solid var(--line)':'0'};display:flex;gap:10px;align-items:center;">
        <span style="width:5px;align-self:stretch;border-radius:3px;background:${col};flex-shrink:0;"></span>
        <span style="width:30px;height:30px;border-radius:6px;background:var(--bg-3);display:grid;place-items:center;font-size:10px;font-weight:600;flex-shrink:0;">${initials}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12.5px;font-weight:500;">${m.name}</div>
          ${m.pos?`<div style="font-size:10.5px;color:var(--text-2);">${m.pos}</div>`:''}
          <div style="font-size:11px;color:${col};margin-top:2px;">${reasons.join(' · ')}</div>
        </div>
      </div>`;
    }).join('')}</div>`}
  </div>`;
  // Top adherencia card
  const topPl=[...stats].filter(s=>s.total>0).sort((a,b)=>(b.pct??0)-(a.pct??0)).slice(0,5);
  const topCard=`<div class="q-card">
    <div class="q-card__h"><h3>Top adherencia</h3><span class="meta">Mayor asistencia</span></div>
    <div style="padding:10px 16px;">${topPl.length===0?`<div style="font-size:12px;color:var(--text-2);">Sin datos.</div>`:topPl.map((p,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:${i<topPl.length-1?'1px solid var(--line)':'0'};">
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-3);width:18px;">0${i+1}</span>
      <span style="flex:1;font-size:12.5px;">${p.name}</span>
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-2);">${p.P}P · ${p.A}A</span>
      <span style="font-family:var(--font-mono);font-size:11px;font-weight:600;color:${p.pct>=85?'var(--ok)':p.pct>=70?'var(--warn)':'var(--bad)'};">${p.pct!==null?p.pct+'%':'—'}</span>
    </div>`).join('')}</div>
  </div>`;
  // ── Jugadores tab ──
  if(!S.reportPlayerPid||!cd.players.find(p=>p.id===S.reportPlayerPid))S.reportPlayerPid=stats[0]?.id||cd.players[0]?.id||null;
  const selPid=S.reportPlayerPid;
  const selPlayer=cd.players.find(p=>p.id===selPid)||null;
  const selStat=stats.find(s=>s.id===selPid)||null;
  const selKey=selPid?athleteKey(S.teamId,S.cat,selPid):null;
  const selAth=selKey?getAthlete(selKey):null;
  const selM=selPid?calcMetrics(cd,selPid):null;
  const _rpdList=`<div class="q-rpd-list">${stats.map(p=>{
    const pc=p.pct!==null?(p.pct>=85?'var(--ok)':p.pct>=70?'var(--warn)':'var(--bad)'):'var(--text-2)';
    return`<button class="q-rpd-player${p.id===selPid?' q-rpd-player--sel':''}" data-action="reportplayerpid" data-pid="${p.id}">
      <span style="flex:1;text-align:left;font-size:12.5px;font-weight:${p.id===selPid?'600':'400'};">${p.name}</span>
      <span style="font-family:var(--font-mono);font-size:11px;color:${pc};">${p.pct!==null?p.pct+'%':'—'}</span>
    </button>`;
  }).join('')}</div>`;
  let _rpdDash='<div style="padding:48px 24px;text-align:center;color:var(--text-2);font-size:13px;">Seleccioná un jugador</div>';
  if(selPlayer&&selM){
    const age=selAth?.personal?.birthdate?calcAge(selAth.personal.birthdate):null;
    const pos=selPlayer.position||selAth?.personal?.position||'';
    const num=selPlayer.number||selAth?.personal?.number||'';
    const meta=[pos,age?age+' años':null,num?'#'+num:null].filter(Boolean).join(' · ');
    const _hd=`<div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--line);">
      <div style="width:42px;height:42px;border-radius:50%;background:var(--accent-soft);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:var(--accent);flex-shrink:0;">${selPlayer.name.charAt(0).toUpperCase()}</div>
      <div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;">${selPlayer.name}</div><div style="font-size:11px;color:var(--text-2);margin-top:2px;">${meta||'Sin info personal'}</div></div>
      <button class="q-btn q-btn--ghost q-btn--sm" data-action="openathlete" data-pid="${selPid}">Ver ficha →</button>
    </div>`;
    const acZ=acwrZone(selM.acwr);
    const _kpi=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line);">
      <div class="q-stat" style="border-radius:0;border:0;padding:10px 12px;"><div class="q-stat__row"><span class="q-stat__label">Asistencia</span></div><div class="q-stat__val" style="font-size:18px;color:${selStat?.pct!=null?(selStat.pct>=85?'var(--ok)':selStat.pct>=70?'var(--warn)':'var(--bad)'):'var(--text-0)'};">${selStat?.pct!=null?selStat.pct+'%':'—'}</div><div class="q-stat__sub"><span>${selStat?.P??0}P · ${selStat?.A??0}A</span></div></div>
      <div class="q-stat" style="border-radius:0;border:0;padding:10px 12px;"><div class="q-stat__row"><span class="q-stat__label">Carga 7D</span></div><div class="q-stat__val" style="font-size:18px;">${selM.ac}<span class="u">UA</span></div><div class="q-stat__sub"><span>crónica: ${selM.cc}</span></div></div>
      <div class="q-stat" style="border-radius:0;border:0;padding:10px 12px;"><div class="q-stat__row"><span class="q-stat__label">ACWR</span></div><div class="q-stat__val" style="font-size:18px;color:${acZ.fg};">${selM.acwr!==null?selM.acwr:'—'}</div><div class="q-stat__sub"><span style="color:${acZ.fg};">${acZ.label}</span></div></div>
      <div class="q-stat" style="border-radius:0;border:0;padding:10px 12px;"><div class="q-stat__row"><span class="q-stat__label">Wellness</span></div><div class="q-stat__val" style="font-size:18px;color:${wellZone(selM.wellAvg).fg};">${selM.wellAvg!==null?selM.wellAvg:'—'}<span class="u">/5</span></div><div class="q-stat__sub"><span>7 días</span></div></div>
    </div>`;
    const _l7=selM.l7;const _maxL=Math.max(..._l7,1);
    const _sparkDays=Array.from({length:7},(_,i)=>{const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-6+i);return d.toISOString().split('T')[0];});
    const _DAY=['D','L','M','X','J','V','S'];
    const _spark=`<div style="padding:12px 18px;border-bottom:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">Carga últimos 7 días</div>
      <div style="display:flex;gap:3px;align-items:flex-end;height:52px;">
        ${_l7.map((v,i)=>{const h=_maxL>0?Math.max(Math.round(v/_maxL*40),v>0?3:0):0;const col=v?sparkColor(v,_maxL):'var(--bg-3)';const ds=_sparkDays[i];const dow=new Date(ds+'T12:00:00').getDay();return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="font-size:8.5px;color:var(--text-3);line-height:1;">${v?v:''}</div><div style="width:100%;background:${col};border-radius:3px 3px 0 0;height:${h}px;"></div><div style="font-size:8.5px;color:var(--text-3);line-height:1;">${_DAY[dow]}</div></div>`;}).join('')}
      </div>
    </div>`;
    const _att30=Array.from({length:30},(_,i)=>{const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-29+i);return d.toISOString().split('T')[0];});
    const _strip=`<div style="padding:12px 18px;border-bottom:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">Asistencia últimos 30 días</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;">
        ${_att30.map(ds=>{const s=cd.attendance[ds]?.[selPid];const col=!s?'var(--bg-3)':(s==='P'||s==='T')?'var(--ok)':s==='L'||s==='J'?'var(--warn)':'var(--bad)';return`<div title="${ds}: ${s||'—'}" style="width:13px;height:13px;border-radius:2px;background:${col};flex-shrink:0;cursor:default;"></div>`;}).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;">
        ${[['var(--ok)','Presente'],['var(--bad)','Ausente'],['var(--warn)','Licencia'],['var(--bg-3)','Sin registro']].map(([c,l])=>`<span style="display:flex;align-items:center;gap:4px;font-size:9.5px;color:var(--text-3);"><span style="width:8px;height:8px;border-radius:1.5px;background:${c};display:inline-block;flex-shrink:0;"></span>${l}</span>`).join('')}
      </div>
    </div>`;
    const _morphKeys=Object.keys(selAth?.morphology||{}).sort().reverse();
    const _anthrKeys=Object.keys(selAth?.anthropometry||{}).sort().reverse();
    const _lm=_morphKeys[0]?selAth.morphology[_morphKeys[0]]:null;
    const _la=_anthrKeys[0]?selAth.anthropometry[_anthrKeys[0]]:null;
    const _pAdip=_la?.masaAdip&&_lm?.weight?(_la.masaAdip/_lm.weight*100).toFixed(1):null;
    const _pMusc=_la?.masaMusc&&_lm?.weight?(_la.masaMusc/_lm.weight*100).toFixed(1):null;
    const _bodyDate=_la?.date||_lm?.date;
    const _bodyStats=[
      _lm?.weight!=null?{l:'Peso',v:_lm.weight,u:'kg',c:'var(--text-0)'}:null,
      _lm?.height!=null?{l:'Talla',v:_lm.height,u:'cm',c:'var(--text-0)'}:null,
      _la?.masaAdip!=null?{l:'M. Adiposa',v:_la.masaAdip,u:'kg',c:'var(--text-0)'}:null,
      _pAdip!=null?{l:'% Adiposa',v:_pAdip,u:'%',c:'var(--text-0)'}:null,
      _la?.zAdip!=null?{l:'Z-Adip',v:(_la.zAdip>0?'+':'')+_la.zAdip,u:'',c:_la.zAdip<-1.95?'var(--ok)':'var(--bad)'}:null,
      _la?.masaMusc!=null?{l:'M. Muscular',v:_la.masaMusc,u:'kg',c:'var(--text-0)'}:null,
      _pMusc!=null?{l:'% Muscular',v:_pMusc,u:'%',c:'var(--text-0)'}:null,
      _la?.zMusc!=null?{l:'Z-Musc',v:(_la.zMusc>0?'+':'')+_la.zMusc,u:'',c:_la.zMusc>1.75?'var(--ok)':'var(--warn)'}:null,
      _la?.sumSkinfolds!=null?{l:'Σ Pliegues',v:_la.sumSkinfolds,u:'mm',c:'var(--text-0)'}:null,
    ].filter(Boolean);
    const _body=_bodyStats.length?`<div style="padding:12px 18px;border-bottom:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">Composición corporal${_bodyDate?` <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-3);">· ${fmtDate(_bodyDate)}</span>`:''}</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">${_bodyStats.map(s=>`<div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:${s.c};">${s.v}${s.u?`<span style="font-size:9px;font-weight:400;color:var(--text-2);margin-left:1px;">${s.u}</span>`:''}</div><div style="font-size:9.5px;color:var(--text-3);margin-top:2px;white-space:nowrap;">${s.l}</div></div>`).join('')}</div>
    </div>`:'';
    const _jumpKeys=Object.keys(selAth?.jumpTests||{}).sort().reverse();
    const _lj=_jumpKeys[0]?selAth.jumpTests[_jumpKeys[0]]:null;
    const _rsi=_lj?.djHeight&&_lj?.djTc?Math.round((_lj.djHeight/100)/(_lj.djTc/1000)*100)/100:null;
    const _jumpStats=[
      _lj?.sj!=null?{l:'SJ',v:_lj.sj,u:'cm',c:'var(--text-0)'}:null,
      _lj?.cmj!=null?{l:'CMJ',v:_lj.cmj,u:'cm',c:'var(--accent)'}:null,
      _lj?.abk!=null?{l:'ABK',v:_lj.abk,u:'cm',c:'var(--text-0)'}:null,
      _rsi!=null?{l:'RSI',v:_rsi,u:'',c:_rsi>=2?'var(--ok)':_rsi>=1.5?'var(--warn)':'var(--bad)'}:null,
    ].filter(Boolean);
    const _jumps=_jumpStats.length?`<div style="padding:12px 18px;border-bottom:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">Saltos${_lj?.date?` <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-3);">· ${fmtDate(_lj.date)}</span>`:''}</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">${_jumpStats.map(s=>`<div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:${s.c};">${s.v}${s.u?`<span style="font-size:10px;font-weight:400;color:var(--text-2);margin-left:2px;">${s.u}</span>`:''}</div><div style="font-size:9.5px;color:var(--text-3);margin-top:2px;">${s.l}</div></div>`).join('')}</div>
    </div>`:'';
    const _fmsKeys=Object.keys(selAth?.fmsTests||{}).sort().reverse();
    const _lfms=_fmsKeys[0]?selAth.fmsTests[_fmsKeys[0]]:null;
    const _fmsMinBi=(l,r)=>l!=null&&r!=null?Math.min(l,r):l!=null?l:r!=null?r:null;
    const _fmsScores=_lfms?[_lfms.deepSquat,_fmsMinBi(_lfms.hurdleL,_lfms.hurdleR),_fmsMinBi(_lfms.lungeL,_lfms.lungeR),_fmsMinBi(_lfms.shoulderL,_lfms.shoulderR),_fmsMinBi(_lfms.aslrL,_lfms.aslrR),_lfms.trunkStab,_fmsMinBi(_lfms.rotaryL,_lfms.rotaryR)].filter(v=>v!=null):[];
    const _fmsTotal=_fmsScores.length?_fmsScores.reduce((a,b)=>a+b,0):null;
    const _fms=_fmsTotal!=null?`<div style="padding:12px 18px;">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">FMS${_lfms?.date?` <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-3);">· ${fmtDate(_lfms.date)}</span>`:''}</div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:22px;font-weight:700;color:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};">${_fmsTotal}</div><div style="font-size:9.5px;color:var(--text-3);">/ ${_fmsScores.length*3} pts</div></div>
        <div style="flex:1;height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${Math.round(_fmsTotal/(_fmsScores.length*3)*100)}%;background:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};border-radius:3px;"></div></div>
        <span style="font-size:11px;color:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};font-weight:600;">${_fmsTotal>=14?'Óptimo':_fmsTotal>=10?'Aceptable':'Revisar'}</span>
      </div>
    </div>`:'';
    // Injuries section
    let _injuries='';
    if(selKey){
      const sixMonthsAgo=new Date(TODAY+'T12:00:00');sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
      const cutoff=sixMonthsAgo.toISOString().split('T')[0];
      if(S.medInjuries[selKey]===undefined){
        loadPlayerInjuries(selKey);
        _injuries='<div style="padding:12px 18px;border-top:1px solid var(--line);"><div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:6px;">Lesiones</div><div style="font-size:11px;color:var(--text-3);">Cargando…</div></div>';
      } else {
        const playerInjs=Object.values(S.medInjuries[selKey]||{}).filter(inj=>inj.status==='activa'||inj.status==='en_rehab'||(inj.date&&inj.date>=cutoff)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
        if(playerInjs.length){
          const injRows=playerInjs.map(inj=>{
            const sc=injSevColor(inj.severity||1);
            const stCl=inj.status==='activa'?'var(--bad)':inj.status==='en_rehab'?'var(--warn)':'var(--ok)';
            const stLbl=inj.status==='activa'?'Activa':inj.status==='en_rehab'?'En rehab':'Recuperada';
            const typeStr=inj.type?' · <span style="font-weight:400;color:var(--text-2);">'+inj.type+'</span>':'';
            const dateStr=inj.date?'<span style="font-size:10px;color:var(--text-3);">'+fmtDate(inj.date)+'</span>':'';
            return'<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 10px;background:var(--bg-3);border-radius:var(--r-2);border-left:3px solid '+sc+';"><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:var(--text-0);">'+regionLabel(inj.region||'')+typeStr+'</div><div style="display:flex;align-items:center;gap:8px;margin-top:3px;"><span style="font-size:10px;color:'+stCl+';font-weight:600;">'+stLbl+'</span>'+dateStr+'</div></div><span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r-pill);background:'+sc+'20;color:'+sc+';flex-shrink:0;">N'+(inj.severity||1)+'</span></div>';
          }).join('');
          _injuries='<div style="padding:12px 18px;border-top:1px solid var(--line);"><div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px;">Lesiones activas / recientes</div><div style="display:flex;flex-direction:column;gap:6px;">'+injRows+'</div></div>';
        }
      }
    }
    _rpdDash=_hd+_kpi+_spark+_strip+_body+_jumps+_fms+_injuries;
    if(!_body&&!_jumps&&!_fms&&!_injuries)_rpdDash+=`<div style="padding:14px 18px;font-size:12px;color:var(--text-3);">Sin evaluaciones físicas registradas.</div>`;
  }
  const jugadoresTab=`<div class="q-rpd">${_rpdList}<div class="q-rpd-dash q-card" style="overflow-y:auto;">${_rpdDash}</div></div>`;
  // ── Por mes tab ──
  const monthly=getMonthly(cd.players,cd.attendance);
  const mesesTab=`<div class="q-card">${!monthly.length?`<div class="empty-state">Sin datos.</div>`:monthly.reverse().map((m,i)=>{
    const pctCol=m.avgPct!==null?(m.avgPct>=85?'var(--ok)':m.avgPct>=70?'var(--warn)':'var(--bad)'):'var(--text-2)';
    return`<div style="padding:10px 16px;border-bottom:${i<monthly.length-1?'1px solid var(--line)':'0'};display:flex;align-items:center;gap:14px;">
      <span style="font-size:13px;font-weight:500;flex:1;">${fmtMonth(m.month)}</span>
      <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-2);">${m.sessions} ses.</span>
      <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:${pctCol};">${m.avgPct!==null?m.avgPct+'%':'—'}</span>
      <div style="width:120px;height:4px;background:var(--bg-3);border-radius:99px;flex-shrink:0;"><div style="height:100%;width:${m.avgPct||0}%;background:${pctCol};border-radius:99px;"></div></div>
    </div>`;
  }).join('')}</div>`;
  // Assemble
  let tabContent='';
  if(currentSub==='semanal'){
    const isMob=window.innerWidth<900;
    tabContent=isMob?`<div>${dailyChart}${trendTable}${riskCard}${topCard}</div>`:`<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:14px;"><div>${dailyChart}${trendTable}</div><div>${riskCard}${topCard}</div></div>`;
  } else if(currentSub==='players'){
    tabContent=jugadoresTab;
  } else {
    tabContent=mesesTab;
  }
  return sectionHeader+alertBanner+kpiRow+subTabs+tabContent;
}
// ══════════════════════════════════════════════════════════════
// ██  MÉDICO / LESIONES
// ══════════════════════════════════════════════════════════════

// Body region SVG paths — viewBox "0 0 120 295"
const BM_FRONT={
  cabeza:       'M75,19 A15,18,0,1,0,45,19 A15,18,0,1,0,75,19Z',
  cuello:       'M54,37 L66,37 L67,50 L53,50Z',
  hombro_izq:   'M53,50 Q34,48 14,62 L20,72 Q32,68 42,70 L53,70Z',
  hombro_der:   'M67,50 Q86,48 106,62 L100,72 Q88,68 78,70 L67,70Z',
  pecho:        'M42,70 L78,70 L78,97 Q60,102 42,97Z',
  brazo_izq:    'M14,62 L27,70 L21,112 L8,108Z',
  brazo_der:    'M106,62 L93,70 L99,112 L112,108Z',
  codo_izq:     'M8,108 L21,112 L19,124 L6,120Z',
  codo_der:     'M112,108 L99,112 L101,124 L114,120Z',
  antebrazo_izq:'M6,120 L19,124 L17,163 L4,159Z',
  antebrazo_der:'M114,120 L101,124 L103,163 L116,159Z',
  muneca_izq:   'M4,159 L17,163 L15,187 Q9,193 5,188 Q3,179 7,173Z',
  muneca_der:   'M116,159 L103,163 L105,187 Q111,193 115,188 Q117,179 113,173Z',
  abdomen:      'M42,97 Q60,102 78,97 L78,125 L42,125Z',
  cadera_izq:   'M42,125 L60,125 L57,150 L38,150Z',
  cadera_der:   'M60,125 L78,125 L82,150 L63,150Z',
  cuad_izq:     'M38,150 L57,150 L55,210 L36,210Z',
  cuad_der:     'M63,150 L82,150 L84,210 L65,210Z',
  rodilla_izq:  'M36,210 L55,210 L53,228 L34,228Z',
  rodilla_der:  'M65,210 L84,210 L86,228 L67,228Z',
  tibial_izq:   'M34,228 L53,228 L51,270 L32,270Z',
  tibial_der:   'M67,228 L86,228 L88,270 L69,270Z',
  tobillo_izq:  'M32,270 L51,270 L50,282 L30,282Z',
  tobillo_der:  'M69,270 L88,270 L90,282 L70,282Z',
  pie_izq:      'M21,282 L51,282 L50,292 L19,292Z',
  pie_der:      'M69,282 L99,282 L101,292 L67,292Z',
};
const BM_BACK={
  cabeza:       'M75,19 A15,18,0,1,0,45,19 A15,18,0,1,0,75,19Z',
  cuello:       'M54,37 L66,37 L67,50 L53,50Z',
  hombro_izq:   'M53,50 Q34,48 14,62 L20,72 Q32,68 42,70 L53,70Z',
  hombro_der:   'M67,50 Q86,48 106,62 L100,72 Q88,68 78,70 L67,70Z',
  espalda_alta: 'M42,70 L78,70 L78,97 Q60,102 42,97Z',
  brazo_izq:    'M14,62 L27,70 L21,112 L8,108Z',
  brazo_der:    'M106,62 L93,70 L99,112 L112,108Z',
  codo_izq:     'M8,108 L21,112 L19,124 L6,120Z',
  codo_der:     'M112,108 L99,112 L101,124 L114,120Z',
  antebrazo_izq:'M6,120 L19,124 L17,163 L4,159Z',
  antebrazo_der:'M114,120 L101,124 L103,163 L116,159Z',
  muneca_izq:   'M4,159 L17,163 L15,187 Q9,193 5,188 Q3,179 7,173Z',
  muneca_der:   'M116,159 L103,163 L105,187 Q111,193 115,188 Q117,179 113,173Z',
  espalda_baja: 'M42,97 Q60,102 78,97 L78,125 L42,125Z',
  gluteo_izq:   'M42,125 L60,125 L57,152 L36,152Z',
  gluteo_der:   'M60,125 L78,125 L84,152 L63,152Z',
  isquio_izq:   'M36,152 L57,152 L55,210 L34,210Z',
  isquio_der:   'M63,152 L84,152 L86,210 L65,210Z',
  rodilla_izq:  'M34,210 L55,210 L53,228 L32,228Z',
  rodilla_der:  'M65,210 L86,210 L88,228 L67,228Z',
  tibial_izq:   'M32,228 L53,228 L51,270 L30,270Z',
  tibial_der:   'M67,228 L88,228 L90,270 L69,270Z',
  tobillo_izq:  'M30,270 L51,270 L50,282 L28,282Z',
  tobillo_der:  'M69,270 L90,270 L92,282 L70,282Z',
  pie_izq:      'M19,282 L51,282 L50,292 L17,292Z',
  pie_der:      'M69,282 L101,282 L103,292 L67,292Z',
};
// Silhouette outline — wider athletic figure (stroke on top of regions)
const BM_OUTLINE='M14,62 Q32,48 53,50 L54,37 L66,37 L67,50 Q88,48 106,62 L112,108 Q114,116 112,120 L110,161 Q113,175 118,183 Q122,187 121,191 Q117,195 113,187 L105,163 Q103,149 101,120 Q99,112 101,108 L92,70 L78,70 Q77,90 77,125 Q80,136 82,150 L84,210 Q86,219 84,228 L84,270 Q86,278 100,282 Q104,286 104,292 L67,292 Q68,284 70,280 L70,228 Q68,219 66,210 L63,150 Q60,130 57,150 L54,210 Q52,219 50,228 L50,280 Q51,284 53,292 L18,292 Q16,286 20,282 Q34,278 36,270 L36,228 Q34,219 36,210 L38,150 Q40,136 43,125 Q43,90 42,70 L28,70 L21,112 Q23,116 21,120 L17,163 Q13,187 8,191 Q4,193 1,187 Q4,179 8,173 L12,120 Q10,116 12,108 Z';

function injSevColor(sev){
  if(sev===3)return'var(--bad)';
  if(sev===2)return'var(--warn)';
  if(sev===1)return'var(--info)';
  return'transparent';
}

function buildBodyMapSVG(injMap,pathMap,clickable=false){
  const regions=Object.entries(pathMap).map(([id,d])=>{
    const inj=injMap[id]||{count:0,maxSev:0};
    const active=inj.maxSev>0;
    const col=injSevColor(inj.maxSev);
    const cnt=inj.count>0?' · '+inj.count+' lesión'+(inj.count!==1?'es':''):'';
    const lbl=regionLabel(id)+cnt;
    const isSelected=S.medRegion===id;
    const cls='bm-reg'+(active?' bm-reg--inj':'')+(clickable?' bm-reg--click':'')+(isSelected?' bm-reg--sel':'');
    let style='';
    if(active) style+='fill:'+col+';fill-opacity:0.75;';
    if(isSelected) style+='stroke:var(--accent);stroke-width:1.5;';
    const handler=clickable?' onclick="medRegionClick(\''+id+'\')"':'';
    return'<path d="'+d+'" class="'+cls+'" data-region="'+id+'" style="'+style+'"'+handler+'><title>'+lbl+'</title></path>';
  }).join('');
  return`<svg class="bm-svg" viewBox="0 0 120 295" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="21" rx="14" ry="17" class="bm-body-fill"/>
    <path d="${BM_OUTLINE}" class="bm-body-fill"/>
    ${regions}
    <ellipse cx="60" cy="21" rx="14" ry="17" class="bm-outline"/>
    <path d="${BM_OUTLINE}" class="bm-outline"/>
  </svg>`;
}

function buildInjMap(injuries,statusFilter){
  const map={};
  Object.values(injuries||{}).forEach(inj=>{
    if(!inj.region)return;
    if(statusFilter&&statusFilter!=='todas'&&inj.status!==statusFilter)return;
    if(!map[inj.region])map[inj.region]={count:0,maxSev:0};
    map[inj.region].count++;
    if((inj.severity||1)>map[inj.region].maxSev)map[inj.region].maxSev=inj.severity||1;
  });
  return map;
}

function buildCatInjMap(statusFilter){
  const all={};
  Object.values(S.medInjuries||{}).forEach(injuries=>{
    Object.values(injuries||{}).forEach(inj=>{
      if(!inj.region)return;
      if(statusFilter&&statusFilter!=='todas'&&inj.status!==statusFilter)return;
      if(!all[inj.region])all[inj.region]={count:0,maxSev:0};
      all[inj.region].count++;
      if((inj.severity||1)>all[inj.region].maxSev)all[inj.region].maxSev=inj.severity||1;
    });
  });
  return all;
}

async function loadMedical(){
  const tid=S.teamId,cid=S.cat;
  const cd=getCat();
  S.medInjuries={};
  setSyncBar('saving');
  try{
    await Promise.all(cd.players.map(async p=>{
      const key=athleteKey(tid,cid,p.id);
      const snap=await db.ref(`teams/${tid}/athletes/${key}/injuries`).once('value');
      S.medInjuries[key]=snap.exists()?snap.val():{};
    }));
    setSyncBar('ok');
  }catch(e){setSyncBar('error','Error al cargar lesiones');}
  render();
}

async function loadPlayerInjuries(key){
  const tid=key.split('__')[0];
  try{
    const snap=await db.ref(`teams/${tid}/athletes/${key}/injuries`).once('value');
    if(!S.medInjuries)S.medInjuries={};
    S.medInjuries[key]=snap.exists()?snap.val():{};
  }catch(e){
    if(!S.medInjuries)S.medInjuries={};
    S.medInjuries[key]={};
  }
  render();
}

function renderMedical(){
  const cd=getCat();
  const tid=S.teamId,cid=S.cat;
  const sf=S.medFilter||'activa';
  const injMap=buildCatInjMap(sf);

  // Flat list of injuries for cards panel
  const allInj=[];
  cd.players.forEach(p=>{
    const key=athleteKey(tid,cid,p.id);
    Object.entries(S.medInjuries[key]||{}).forEach(([k,inj])=>{
      if(sf!=='todas'&&inj.status!==sf)return;
      if(S.medRegion&&inj.region!==S.medRegion)return;
      allInj.push({...inj,_key:k,_ak:key,_player:p.name});
    });
  });
  allInj.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

  const flatAll=Object.values(S.medInjuries||{}).flatMap(i=>Object.values(i||{}));
  const activeCount=flatAll.filter(i=>i.status==='activa').length;
  const rehabCount=flatAll.filter(i=>i.status==='en_rehab').length;
  const affectedPids=new Set(
    Object.entries(S.medInjuries||{}).filter(([,injs])=>Object.values(injs||{}).some(i=>i.status==='activa')).map(([ak])=>ak)
  );

  const canEditMed=canEdit();
  const sevLegend=[{c:'var(--info)',l:'N1 · Molestia'},{c:'var(--warn)',l:'N2 · Subaguda'},{c:'var(--bad)',l:'N3 · Lesión'}];

  return`<div class="q-medical">
    <div class="q-medical__topbar">
      <div class="q-medical__legend">${sevLegend.map(({c,l})=>`<span class="bm-dot" style="background:${c}"></span><span>${l}</span>`).join('')}</div>
      <div class="q-medical__actions">
        <div class="q-tabs q-tabs--sm">
          <button class="q-tab${sf==='activa'?' active':''}" data-action="medfilter" data-val="activa">Activas</button>
          <button class="q-tab${sf==='todas'?' active':''}" data-action="medfilter" data-val="todas">Todas</button>
        </div>
        ${S.medRegion?`<button class="q-btn q-btn--ghost q-btn--sm" data-action="medclearregion">✕ ${regionLabel(S.medRegion)}</button>`:''}
        ${canEditMed?`<button class="q-btn q-btn--primary q-btn--sm" data-action="openinjuryform">+ Nueva lesión</button>`:''}
      </div>
    </div>

    <div class="q-stats" style="margin-bottom:16px;">
      <div class="q-stat"><div class="q-stat__val">${activeCount}</div><div class="q-stat__lbl">Lesiones activas</div></div>
      <div class="q-stat"><div class="q-stat__val">${rehabCount}</div><div class="q-stat__lbl">En rehabilitación</div></div>
      <div class="q-stat"><div class="q-stat__val">${affectedPids.size}</div><div class="q-stat__lbl">Atletas afectados</div></div>
      <div class="q-stat"><div class="q-stat__val">${cd.players.length}</div><div class="q-stat__lbl">En plantel</div></div>
    </div>

    <div class="q-bodymap-wrap">
      <div class="q-bodymap-views">
        <div class="q-bodymap-panel">
          <div class="q-bodymap-panel__label">FRONTAL</div>
          ${buildBodyMapSVG(injMap,BM_FRONT,true)}
        </div>
        <div class="q-bodymap-panel">
          <div class="q-bodymap-panel__label">POSTERIOR</div>
          ${buildBodyMapSVG(injMap,BM_BACK,true)}
        </div>
      </div>

      <div class="q-bodymap-list">
        <div class="q-bodymap-list__hdr">
          <span class="q-label">${S.medRegion?regionLabel(S.medRegion).toUpperCase():sf==='activa'?'LESIONES ACTIVAS':'TODAS LAS LESIONES'}</span>
          <span class="q-badge q-badge--neutral">${allInj.length}</span>
        </div>
        ${allInj.length===0?`<div class="q-empty" style="padding:24px 0;text-align:center;color:var(--text-2);font-size:13px;">Sin lesiones registradas${S.medRegion?' en esta región':''}</div>`:''}
        ${allInj.map(inj=>{
          const sc=injSevColor(inj.severity||1);
          const sl=['','N1','N2','N3'][inj.severity||1]||'N1';
          const stMap={activa:'Activa',en_rehab:'En rehab.',recuperada:'Recuperada'};
          return`<div class="q-inj-card">
            <div class="q-inj-card__row1">
              <span class="q-inj-card__player">${inj._player}</span>
              <span class="q-sev-badge" style="background:${sc}18;color:${sc};border:1px solid ${sc}40">${sl}</span>
            </div>
            <div class="q-inj-card__region">${regionLabel(inj.region||'')}</div>
            <div class="q-inj-card__meta">
              <span>${inj.type||'—'}</span><span>·</span>
              <span>${inj.mechanism||'—'}</span><span>·</span>
              <span class="q-inj-status--${inj.status||'activa'}">${stMap[inj.status]||inj.status||'Activa'}</span>
            </div>
            ${inj.notes?`<div class="q-inj-card__notes">${inj.notes}</div>`:''}
            <div class="q-inj-card__foot">
              <span class="q-inj-card__date">${fmtDate(inj.date)||'—'}</span>
              ${canEditMed?`<span>
                <button class="sm-btn" data-action="editinjury" data-ak="${inj._ak}" data-ikey="${inj._key}">Editar</button>
                <button class="sm-btn" style="color:var(--bad)" data-action="deleteinjury" data-ak="${inj._ak}" data-ikey="${inj._key}">Eliminar</button>
              </span>`:''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ${S.injForm!==null?renderInjuryModal():''}
  </div>`;
}

function renderInjuryModal(){
  const f=S.injForm||{};
  const isEdit=!!f.ikey;
  const d=f.data||{};
  const cd=getCat();
  const playerOpts=cd.players.map(p=>`<option value="${p.id}"${d._pid===p.id?' selected':''}>${p.name}</option>`).join('');
  const regionOpts=REGIONS_ALL.map(r=>`<option value="${r.id}"${d.region===r.id?' selected':''}>${r.label}</option>`).join('');
  const typeOpts=INJ_TYPES.map(t=>`<option value="${t}"${d.type===t?' selected':''}>${t}</option>`).join('');
  const mechOpts=INJ_MECHS.map(m=>`<option value="${m}"${d.mechanism===m?' selected':''}>${m}</option>`).join('');
  const sev=d.severity||1;
  return`<div class="q-modal-backdrop" data-action="closeinjuryform">
    <div class="q-modal" onclick="event.stopPropagation()">
      <div class="q-modal__header">
        <h3>${isEdit?'Editar lesión':'Nueva lesión'}</h3>
        <button class="q-modal__close" data-action="closeinjuryform">✕</button>
      </div>
      <div class="q-modal__body">
        ${!isEdit?`<div class="form-field"><label>Atleta</label><select id="inj-player"><option value="">— Seleccionar atleta —</option>${playerOpts}</select></div>`:''}
        <div class="form-grid-2">
          <div class="form-field"><label>Región corporal</label><select id="inj-region"><option value="">— Seleccionar región —</option>${regionOpts}</select></div>
          <div class="form-field"><label>Fecha</label><input type="date" id="inj-date" value="${d.date||TODAY}"></div>
        </div>
        <div class="form-grid-2">
          <div class="form-field"><label>Tipo de lesión</label><select id="inj-type"><option value="">— Tipo —</option>${typeOpts}</select></div>
          <div class="form-field"><label>Mecanismo</label><select id="inj-mech"><option value="">— Mecanismo —</option>${mechOpts}</select></div>
        </div>
        <div class="form-grid-2">
          <div class="form-field"><label>Severidad</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${[1,2,3].map(v=>{const c=injSevColor(v);const lv=['','N1 · Molestia','N2 · Subaguda','N3 · Lesión'][v];return`<button type="button" class="q-btn q-btn--ghost q-btn--sm inj-sev-btn${sev===v?' active':''}" data-action="injsev" data-val="${v}" style="${sev===v?`border-color:${c};color:${c};background:${c}18;`:''}">${lv}</button>`;}).join('')}
            </div>
          </div>
          <div class="form-field"><label>Estado</label>
            <select id="inj-status">
              <option value="activa"${d.status==='activa'||!d.status?' selected':''}>Activa</option>
              <option value="en_rehab"${d.status==='en_rehab'?' selected':''}>En rehabilitación</option>
              <option value="recuperada"${d.status==='recuperada'?' selected':''}>Recuperada</option>
            </select>
          </div>
        </div>
        <div class="form-field"><label>Notas clínicas</label><textarea id="inj-notes" rows="3" placeholder="Descripción, evolución, tratamiento...">${d.notes||''}</textarea></div>
      </div>
      <div class="q-modal__footer">
        <button class="q-btn q-btn--ghost" data-action="closeinjuryform">Cancelar</button>
        <button class="q-btn q-btn--primary" data-action="saveinjury">Guardar lesión</button>
      </div>
    </div>
  </div>`;
}

function medRegionClick(id){S.medRegion=S.medRegion===id?'':id;render();}

async function saveInjury(){
  const f=S.injForm;if(!f)return;
  const tid=S.teamId,cid=S.cat;
  let ak;
  if(f.ikey){ak=f.ak;}
  else{const pid=document.getElementById('inj-player')?.value;if(!pid){showAlert('Seleccioná un atleta');return;}ak=athleteKey(tid,cid,pid);}
  const region=document.getElementById('inj-region')?.value;
  if(!region){showAlert('Seleccioná una región');return;}
  const data={
    region,
    date:document.getElementById('inj-date')?.value||TODAY,
    type:document.getElementById('inj-type')?.value||'',
    mechanism:document.getElementById('inj-mech')?.value||'',
    severity:f.data?.severity||1,
    status:document.getElementById('inj-status')?.value||'activa',
    notes:document.getElementById('inj-notes')?.value||'',
  };
  const key=f.ikey||`inj_${Date.now()}`;
  setSyncBar('saving');
  try{
    await db.ref(`teams/${tid}/athletes/${ak}/injuries/${key}`).set(data);
    if(!S.medInjuries[ak])S.medInjuries[ak]={};
    S.medInjuries[ak][key]=data;
    setSyncBar('ok');S.injForm=null;render();
  }catch(e){setSyncBar('error',e.message||'Error al guardar');}
}

async function deleteInjury(ak,key){
  showConfirm('¿Eliminar esta lesión?', async()=>{
    const tid=ak.split('__')[0];
    setSyncBar('saving');
    try{
      await db.ref(`teams/${tid}/athletes/${ak}/injuries/${key}`).remove();
      if(S.medInjuries[ak])delete S.medInjuries[ak][key];
      setSyncBar('ok');render();
    }catch(e){setSyncBar('error',e.message||'Error al eliminar');}
  });
}

// ── ROSTER ────────────────────────────────────────────────────
function renderRoster(){
  const cd=getCat();
  const editable=canEdit();
  const rows=cd.players.map((p,i)=>{
    if(S.confirmDel===p.id)return`<div class="roster-row" style="border-color:#991b1b;"><span class="roster-name">${p.name}</span><button class="del-confirm-btn" data-action="confirmdel" data-pid="${p.id}">Eliminar</button><button class="sm-btn" data-action="canceldel">No</button></div>`;
    const key=athleteKey(S.teamId,S.cat,p.id);
    const hasProfile=S.athletes[key]&&(S.athletes[key].personal?.birthdate||Object.keys(S.athletes[key].morphology||{}).length||Object.keys(S.athletes[key].jumpTests||{}).length);
    return`<div class="roster-row"><span class="roster-num">${i+1}.</span><span class="roster-name">${p.name}</span>
      <button class="sm-btn" style="${hasProfile?'color:#60a5fa;border-color:#1e40af;':''}" data-action="openathlete" data-pid="${p.id}">📋 Ficha</button>
      ${editable?`<button class="sm-btn" data-action="startdel" data-pid="${p.id}">✕</button>`:''}
    </div>`;
  }).join('');
  return`${editable?`<div class="roster-add">
    <input type="text" class="roster-input" id="new-player" placeholder="Nombre del jugador">
    <button class="add-btn" data-action="addplayer">+ Agregar</button>
  </div>`:''}${rows}
  <p style="font-size:12px;color:var(--text3);text-align:center;margin-top:12px;">${cd.players.length} jugadores en el plantel</p>`;
}

// ── SEARCH ────────────────────────────────────────────────────
function openSearch(){S.prevView=S.view;S.prevTeamId=S.teamId;S.prevCat=S.cat;S.searchReturnView=S.view;S.searchReturnTeamId=S.teamId;S.view='search';S.searchQuery='';render();setTimeout(()=>{const i=document.getElementById('search-main');if(i){i.focus();i.setSelectionRange(999,999);}},50);}
function filterSearch(q){S.searchQuery=q;const el=document.getElementById('search-results');if(!el)return;el.innerHTML=renderSearchResults(q);el.querySelectorAll('[data-action]').forEach(e=>e.addEventListener('click',handleAction));}
function renderSearchResults(q){
  const ql=(q||'').toLowerCase().trim();
  const hl=(str)=>{
    if(!ql)return str;
    const idx=str.toLowerCase().indexOf(ql);
    if(idx<0)return str;
    return str.slice(0,idx)+`<mark>${str.slice(idx,idx+ql.length)}</mark>`+str.slice(idx+ql.length);
  };
  const BADGE={
    athlete:`<span class="q-search-badge" style="color:var(--accent);background:rgba(255,106,26,.12);border:1px solid rgba(255,106,26,.35);">ATLETA</span>`,
    team:`<span class="q-search-badge" style="color:var(--info);background:rgba(107,184,255,.12);border:1px solid rgba(107,184,255,.35);">EQUIPO</span>`,
    category:`<span class="q-search-badge" style="color:var(--info);background:rgba(107,184,255,.12);border:1px solid rgba(107,184,255,.35);">CATEGORÍA</span>`,
  };
  let athletes='',teamsHtml='',aCnt=0,tCnt=0;
  // Teams + categories
  Object.entries(S.teams).forEach(([tid,t])=>{
    if(ql&&t.name.toLowerCase().includes(ql)){
      tCnt++;
      const initials=t.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
      teamsHtml+=`<button class="q-search-row" data-action="openteam" data-tid="${tid}">
        <span class="q-search-av">${initials}</span>
        <span style="flex:1;min-width:0;"><div class="q-search-name">${hl(t.name)}</div><div class="q-search-sub">${t.sport||'Equipo'} · ${Object.keys(t.categories||{}).length} categorías</div></span>
        ${BADGE.team}
      </button>`;
    }
    Object.entries(t.categories||{}).forEach(([cid,c])=>{
      const color=c.color||CAT_PALETTE[0];
      const players=Array.isArray(c.players)?c.players:Object.values(c.players||[]);
      if(ql&&c.name.toLowerCase().includes(ql)){
        tCnt++;
        const initials=c.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
        teamsHtml+=`<button class="q-search-row" data-action="opencat" data-tid="${tid}" data-cid="${cid}">
          <span class="q-search-av" style="background:${color}22;border-color:${color}44;color:${color};">${initials}</span>
          <span style="flex:1;min-width:0;"><div class="q-search-name">${hl(c.name)}</div><div class="q-search-sub">${t.name} · ${players.length} atletas</div></span>
          ${BADGE.category}
        </button>`;
      }
      players.forEach(p=>{
        if(!ql||p.name.toLowerCase().includes(ql)){
          aCnt++;
          const initials=p.name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('').toUpperCase();
          const pos=p.position?` · ${p.position}`:'';
          athletes+=`<button class="q-search-row" data-action="openathlete" data-tid="${tid}" data-cid="${cid}" data-pid="${p.id}">
            <span class="q-search-av" style="background:${color}22;border-color:${color}44;color:${color};">${initials}</span>
            <span style="flex:1;min-width:0;"><div class="q-search-name">${hl(p.name)}</div><div class="q-search-sub">${t.name} · ${c.name}${pos}</div></span>
            ${BADGE.athlete}
          </button>`;
        }
      });
    });
  });
  const hasAny=aCnt>0||tCnt>0;
  if(!hasAny){
    return`<div style="padding:32px 18px;text-align:center;color:var(--text-2);font-size:13px;">${ql?`Sin resultados para "<strong>${q}</strong>"`:'Escribí para buscar atletas, equipos o categorías…'}</div>`;
  }
  let out='';
  if(aCnt>0)out+=`<div class="q-search-sec"><span>Atletas</span><span style="font-family:var(--font-mono);">${aCnt}</span></div>${athletes}`;
  if(tCnt>0)out+=`<div class="q-search-sec" style="margin-top:8px;"><span>Equipos · Categorías</span><span style="font-family:var(--font-mono);">${tCnt}</span></div>${teamsHtml}`;
  return out;
}
function renderSearch(){
  const q=S.searchQuery||'';
  const SVG_SEARCH=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-2);flex-shrink:0;"><path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.3-4.3"/></svg>`;
  return`<div class="q-search-overlay" data-action="cancelsearch">
    <div class="q-search-modal" onclick="event.stopPropagation()">
      <div class="q-search-irow">
        ${SVG_SEARCH}
        <input id="search-main" class="q-search-input" placeholder="Buscar atletas, equipos, categorías…" value="${q.replace(/"/g,'&quot;')}" oninput="filterSearch(this.value)">
        <span style="font:500 11px var(--font-mono);color:var(--text-2);background:var(--bg-3);border:1px solid var(--line-strong);padding:3px 7px;border-radius:4px;flex-shrink:0;">esc</span>
      </div>
      <div class="q-search-chips">
        <span style="color:var(--text-2);font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-right:4px;">Filtrar</span>
        <span class="q-search-chip on">Todo</span>
        <span class="q-search-chip">Atletas</span>
        <span class="q-search-chip">Equipos</span>
        <span class="q-search-chip">Categorías</span>
      </div>
      <div class="q-search-body" id="search-results">${renderSearchResults(q)}</div>
      <div class="q-search-foot">
        <span style="display:inline-flex;gap:5px;align-items:center;"><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
        <span style="display:inline-flex;gap:5px;align-items:center;"><kbd>↵</kbd> abrir</span>
        <span style="display:inline-flex;gap:5px;align-items:center;"><kbd>esc</kbd> cerrar</span>
        <span style="flex:1;"></span>
        <span style="color:var(--text-3);font-size:11px;">Powered by <b style="color:var(--accent);">Qoore</b></span>
      </div>
    </div>
  </div>`;
}
// ── ATHLETE VIEW ──────────────────────────────────────────────
function renderAthleteView(){
  const [tid,cid,pid]=S.athleteKey.split('__');
  const player=(S.teams[tid]?.categories?.[cid]?.players||(Array.isArray(S.teams[tid]?.categories?.[cid]?.players)?S.teams[tid].categories[cid].players:Object.values(S.teams[tid]?.categories?.[cid]?.players||[]))||[]).find(p=>p.id===pid)||{name:'Jugador'};
  const color=S.teams[tid]?.categories?.[cid]?.color||getCatColor(cid,tid);
  const a=getAthlete(S.athleteKey);
  const age=calcAge(a.personal?.birthdate);
  const initials=player.name.split(',').map(s=>s.trim()[0]).join('').toUpperCase().slice(0,2)||'?';
  const catName=S.teams[tid]?.categories?.[cid]?.name||'—';
  const teamName=S.teams[tid]?.name||'—';
  const tabs=[['perfil','Perfil'],['morfo','Morfología'],['antro','Antrop.'],['tests','Tests']];
  let content='';
  if(S.athleteTab==='perfil') content=renderAthletePerfil(a,tid,cid,pid);
  if(S.athleteTab==='morfo')  content=renderAthleteMorfo(a);
  if(S.athleteTab==='antro')  content=renderAthleteAntro(a,cid,tid);
  if(S.athleteTab==='tests')  content=renderAthleteTests(a);
  return`<div class="ath-header">
    <button class="back-btn" data-action="backfromathlete">← Volver</button>
    <div class="ath-avatar" style="background:${color};">${initials}</div>
    <div class="ath-name-block">
      <div class="ath-fullname">${player.name}</div>
      <div class="ath-sub">${teamName} · ${catName}${age?' · '+age+' años':''}</div>
    </div>
    <button class="sm-btn" style="flex-shrink:0;color:#60a5fa;border-color:#1e40af;" data-action="exportathletepdf">⬇ PDF</button>
  </div>
  <div class="tabs">${tabs.map(([t,l])=>`<button class="tab-btn${S.athleteTab===t?' active':''}" data-action="athletetab" data-tab="${t}">${l}</button>`).join('')}</div>
  <div class="wrap">${content}</div>`;
}

function renderAthletePerfil(a,tid,cid,pid){
  const player=(S.teams[tid]?.categories?.[cid]?.players||[]).find(p=>p.id===pid)||{name:''};
  const p=a.personal||{};
  const POSITIONS=['Base','Escolta','Alero','Ala-Pivot','Pivot'];
  const allCats=[];
  Object.entries(S.teams).forEach(([t,team])=>Object.entries(team.categories||{}).forEach(([c,cat])=>{if(!(t===tid&&c===cid))allCats.push({tid:t,cid:c,name:`${team.name} · ${cat.name}`});}));
  const antroEvals=Object.values(a.anthropometry||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const lastAntro=antroEvals[0];
  const hasZ=lastAntro&&lastAntro.zAdip!=null&&lastAntro.zMusc!=null;
  const zdiff=hasZ?Math.round((lastAntro.zMusc-lastAntro.zAdip)*100)/100:null;
  const th=getThresholds(cid,tid);
  const pc=hasZ?perfColor(lastAntro.zAdip,lastAntro.zMusc,zdiff,th):null;
  if(S.athleteForm==='perfil'){
    return`<div class="form-card">
      <div class="form-card-title">Datos del jugador <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
      <div class="form-field" style="margin-bottom:10px;"><label>Nombre completo</label><input type="text" id="af-playername" value="${player.name.replace(/"/g,'&quot;')}" placeholder="Apellido, Nombre"></div>
      <div class="form-grid-2">
        <div class="form-field"><label>Fecha de nacimiento</label><input type="date" id="af-birthdate" value="${p.birthdate||''}"></div>
        <div class="form-field"><label>Posición</label><select id="af-position"><option value="">—</option>${POSITIONS.map(pos=>`<option value="${pos}"${p.position===pos?' selected':''}>${pos}</option>`).join('')}</select></div>
        <div class="form-field"><label>Número</label><input type="number" id="af-number" value="${p.number||''}" min="0" max="99" placeholder="7"></div>
        <div class="form-field"><label>Lateralidad</label><select id="af-laterality"><option value="">—</option><option value="Diestro"${p.laterality==='Diestro'?' selected':''}>Diestro</option><option value="Zurdo"${p.laterality==='Zurdo'?' selected':''}>Zurdo</option><option value="Ambidiestro"${p.laterality==='Ambidiestro'?' selected':''}>Ambidiestro</option></select></div>
        <div class="form-field"><label>Teléfono</label><input type="tel" id="af-phone" value="${p.phone||''}" placeholder="+598 99 000 000"></div>
        <div class="form-field"><label>Documento</label><input type="text" id="af-documento" value="${p.documento||''}" placeholder="CI / Pasaporte"></div>
        <div class="form-field"><label>Mutualista</label><input type="text" id="af-mutualista" value="${p.mutualista||''}" placeholder="ASSE, Médica Uruguaya..."></div>
        <div class="form-field"><label>Notas</label><input type="text" id="af-notes" value="${p.notes||''}" placeholder="Observaciones..."></div>
      </div>
      <div class="form-row"><button class="save-btn" style="width:100%;" data-action="saveperfilform">Guardar</button></div>
    </div>`;
  }
  if(S.athleteForm==='transfer'){
    return`<div class="form-card" style="border-color:#d97706;">
      <div class="form-card-title" style="color:#d97706;">Transferir a otra categoría <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">Los datos de ficha se mantienen. Los registros de asistencia quedan como historial.</p>
      <div class="form-field"><label>Mover a</label>
        <select id="af-targetcat">${allCats.map(c=>`<option value="${c.tid}__${c.cid}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="form-row"><button class="save-btn" style="width:100%;background:#d97706;" data-action="confirmtransfer">Confirmar transferencia</button></div>
    </div>`;
  }
  return`
    ${hasZ?`<div style="background:${pc?.bg||'var(--bg2)'};border:1px solid ${pc?.fg||'var(--border)'}33;border-radius:12px;padding:12px 14px;margin-bottom:12px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Composición corporal — última eval.</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div><span style="font-size:12px;color:var(--text2);">Z adip </span><span style="font-size:22px;font-weight:800;color:${lastAntro.zAdip<th.zadip?'#86efac':'#fca5a5'};">${lastAntro.zAdip>0?'+':''}${lastAntro.zAdip}</span></div>
        <span style="font-size:18px;color:var(--text3);">·</span>
        <div><span style="font-size:12px;color:var(--text2);">Z musc </span><span style="font-size:22px;font-weight:800;color:${lastAntro.zMusc>th.zmuscle?'#86efac':'#fcd34d'};">${lastAntro.zMusc>0?'+':''}${lastAntro.zMusc}</span></div>
        <div style="margin-left:auto;text-align:right;"><div style="font-size:11px;color:var(--text3);">Diferencia Z</div><div style="font-size:26px;font-weight:900;color:${pc?.fg||'var(--text)'};">${zdiff>0?'+':''}${zdiff}</div></div>
      </div>
      <div style="margin-top:8px;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;display:inline-block;background:${pc?.fg+'22'};color:${pc?.fg};">${pc?.label} — ${pc?.sub}</div>
    </div>`:''}
    <div class="eval-card">
      <div class="eval-top"><span class="eval-date">Info personal</span><button class="sm-btn" data-action="editperfil">Editar</button></div>
      ${p.birthdate?`<div class="fold-row"><span class="fold-name">Nacimiento</span><span class="fold-val">${fmtDate(p.birthdate)} · ${calcAge(p.birthdate)} años</span></div>`:''}
      ${p.position?`<div class="fold-row"><span class="fold-name">Posición</span><span class="fold-val">${p.position}</span></div>`:''}
      ${p.number?`<div class="fold-row"><span class="fold-name">Número</span><span class="fold-val">#${p.number}</span></div>`:''}
      ${p.laterality?`<div class="fold-row"><span class="fold-name">Lateralidad</span><span class="fold-val">${p.laterality}</span></div>`:''}
      ${p.phone?`<div class="fold-row"><span class="fold-name">Teléfono</span><span class="fold-val">${p.phone}</span></div>`:''}
      ${p.documento?`<div class="fold-row"><span class="fold-name">Documento</span><span class="fold-val">${p.documento}</span></div>`:''}
      ${p.mutualista?`<div class="fold-row"><span class="fold-name">Mutualista</span><span class="fold-val">${p.mutualista}</span></div>`:''}
      ${p.notes?`<div class="fold-row"><span class="fold-name">Notas</span><span class="fold-val">${p.notes}</span></div>`:''}
      ${!p.birthdate&&!p.position&&!p.number&&!p.laterality&&!p.phone&&!p.documento&&!p.mutualista?`<div style="font-size:13px;color:var(--text3);">Sin datos. Tocá Editar.</div>`:''}
    </div>
    <button class="save-btn" style="width:100%;background:var(--bg2);color:#d97706;border:1px solid #92400e;margin-top:4px;" data-action="starttransfer">↔ Transferir a otra categoría</button>`;
}

function renderAthleteMorfo(a){
  const evals=Object.entries(a.morphology||{}).sort((x,y)=>y[0].localeCompare(x[0]));
  const editEv=S.editingEvalId?(a.morphology||{})[S.editingEvalId]:null;
  const _mV=(k)=>editEv?.[k]!=null?editEv[k]:'';
  const formHtml=S.athleteForm==='morfo'?`<div class="form-card">
    <div class="form-card-title">${editEv?'Editar':'Nueva'} evaluación morfológica <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
    <div class="form-grid-2">
      <div class="form-field"><label>Fecha</label><input type="date" id="af-date" value="${editEv?.date||TODAY}"></div>
      <div class="form-field"><label>Peso (kg)</label><input type="number" id="af-weight" placeholder="85.5" step="0.1" value="${_mV('weight')}"></div>
      <div class="form-field"><label>Talla (cm)</label><input type="number" id="af-height" placeholder="190" step="0.1" value="${_mV('height')}"></div>
      <div class="form-field"><label>Talla sentado</label><input type="number" id="af-sittingH" placeholder="100" step="0.1" value="${_mV('sittingH')}"></div>
      <div class="form-field"><label>Envergadura (cm)</label><input type="number" id="af-wingspan" placeholder="193" step="0.1" value="${_mV('wingspan')}"></div>
      <div class="form-field"><label>Alcance máx. (cm)</label><input type="number" id="af-reach" placeholder="242" step="0.1" value="${_mV('reach')}"></div>
    </div>
    <div class="form-row"><button class="save-btn" style="width:100%;" data-action="savemorfoform">Guardar</button></div>
  </div>`:`<button class="save-btn" style="width:100%;margin-bottom:12px;background:var(--bg2);color:var(--text);border:1px solid var(--border);" data-action="newmorfo">+ Nueva evaluación morfológica</button>`;
  const cards=evals.map(([id,ev],i)=>{
    const prev=evals[i+1]?evals[i+1][1]:null;
    return`<div class="eval-card">
      <div class="eval-top"><span class="eval-date">${fmtDate(ev.date||id.slice(0,10))}</span><button class="sm-btn" style="margin-left:auto;margin-right:4px;" data-action="editevalmorfo" data-evid="${id}">Editar</button><button class="eval-del" data-action="delevalmorpho" data-evid="${id}">Eliminar</button></div>
      <div class="eval-grid">
        ${ev.weight?`<div class="eval-cell"><div class="eval-cell-label">Peso (kg)</div><div class="eval-cell-val">${ev.weight}</div>${deltaHtml(ev.weight,prev?.weight)}</div>`:''}
        ${ev.height?`<div class="eval-cell"><div class="eval-cell-label">Talla (cm)</div><div class="eval-cell-val">${ev.height}</div>${deltaHtml(ev.height,prev?.height)}</div>`:''}
        ${ev.wingspan?`<div class="eval-cell"><div class="eval-cell-label">Envergadura</div><div class="eval-cell-val">${ev.wingspan}</div>${deltaHtml(ev.wingspan,prev?.wingspan)}</div>`:''}
        ${ev.sittingH?`<div class="eval-cell"><div class="eval-cell-label">T. Sentado</div><div class="eval-cell-val">${ev.sittingH}</div></div>`:''}
        ${ev.reach?`<div class="eval-cell"><div class="eval-cell-label">Alcance</div><div class="eval-cell-val">${ev.reach}</div></div>`:''}
      </div>
    </div>`;
  }).join('');
  return formHtml+(cards||`<div class="empty-state">Sin evaluaciones morfológicas.</div>`)+(evals.length>=2?`<div class="chart-card"><div class="chart-title">Evolución de peso<div class="chart-legend"><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#60a5fa;"></span>Peso (kg)</span></div></div><canvas id="chart-morfo" height="150"></canvas></div>`:'');
}

function renderAthleteAntro(a,catId,teamId){
  const cid=catId||S.cat, tid=teamId||S.teamId;
  const th=getThresholds(cid,tid);
  const evals=Object.entries(a.anthropometry||{}).sort((x,y)=>y[0].localeCompare(x[0]));
  const editAntro=S.editingEvalId&&S.athleteForm==='antro'?(a.anthropometry||{})[S.editingEvalId]:null;
  const _sf=(k)=>editAntro?.skinfolds?.[k]!=null?editAntro.skinfolds[k]:'';
  const _pe=(k)=>editAntro?.perimeters?.[k]!=null?editAntro.perimeters[k]:'';
  const _di=(k)=>editAntro?.diameters?.[k]!=null?editAntro.diameters[k]:'';
  const _aV=(k)=>editAntro?.[k]!=null?editAntro[k]:'';
  const formHtml=S.athleteForm==='antro'?`<div class="form-card">
    <div class="form-card-title">${editAntro?'Editar':'Nueva'} evaluación ISAK <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
    <div class="form-field" style="margin-bottom:8px;"><label>Fecha</label><input type="date" id="af-date" value="${editAntro?.date||TODAY}"></div>
    <div class="form-section-label">Pliegues cutáneos (mm)</div>
    <div class="form-grid-3">
      <div class="form-field"><label>Tríceps</label><input type="number" id="af-tri" step="0.1" placeholder="6" value="${_sf('triceps')}"></div>
      <div class="form-field"><label>Subescapular</label><input type="number" id="af-sub" step="0.1" placeholder="6.5" value="${_sf('subscapular')}"></div>
      <div class="form-field"><label>Supraespinal</label><input type="number" id="af-sup" step="0.1" placeholder="6" value="${_sf('supraspinal')}"></div>
      <div class="form-field"><label>Abdominal</label><input type="number" id="af-abd" step="0.1" placeholder="14" value="${_sf('abdominal')}"></div>
      <div class="form-field"><label>Muslo medial</label><input type="number" id="af-thigh" step="0.1" placeholder="9" value="${_sf('thigh')}"></div>
      <div class="form-field"><label>Pantorrilla</label><input type="number" id="af-calf" step="0.1" placeholder="6" value="${_sf('calf')}"></div>
    </div>
    <div class="form-grid-2" style="margin-top:8px;">
      <div class="form-field"><label>Σ Pliegues (mm) <span style="font-size:10px;color:var(--text3);">(manual)</span></label><input type="number" id="af-skinfoldSum" step="0.1" value="${_aV('skinfoldSum')}"></div>
      <div class="form-field"><label>IMO <span style="font-size:10px;color:var(--text3);">(manual)</span></label><input type="number" id="af-imoManual" step="0.01" value="${_aV('imoManual')}"></div>
    </div>
    <div class="form-section-label">Perímetros (cm)</div>
    <div class="form-grid-3">
      <div class="form-field"><label>Brazo relajado</label><input type="number" id="af-pArmR" step="0.1" value="${_pe('armR')}"></div>
      <div class="form-field"><label>Brazo flex.</label><input type="number" id="af-pArmF" step="0.1" value="${_pe('armF')}"></div>
      <div class="form-field"><label>Antebrazo</label><input type="number" id="af-pFore" step="0.1" value="${_pe('forearm')}"></div>
      <div class="form-field"><label>Tórax</label><input type="number" id="af-pChest" step="0.1" value="${_pe('chest')}"></div>
      <div class="form-field"><label>Cintura</label><input type="number" id="af-pWaist" step="0.1" value="${_pe('waist')}"></div>
      <div class="form-field"><label>Cadera</label><input type="number" id="af-pHips" step="0.1" value="${_pe('hips')}"></div>
      <div class="form-field"><label>Muslo (máx.)</label><input type="number" id="af-pThighU" step="0.1" value="${_pe('thighU')}"></div>
      <div class="form-field"><label>Muslo medial</label><input type="number" id="af-pThighM" step="0.1" value="${_pe('thighM')}"></div>
      <div class="form-field"><label>Pantorrilla</label><input type="number" id="af-pCalf" step="0.1" value="${_pe('calf')}"></div>
    </div>
    <div class="form-section-label">Diámetros (cm)</div>
    <div class="form-grid-3">
      <div class="form-field"><label>Biacromial</label><input type="number" id="af-dBiacr" step="0.1" value="${_di('biacr')}"></div>
      <div class="form-field"><label>Tórax transv.</label><input type="number" id="af-dChest" step="0.1" value="${_di('chest')}"></div>
      <div class="form-field"><label>Bi-iliocrest.</label><input type="number" id="af-dBiili" step="0.1" value="${_di('biili')}"></div>
      <div class="form-field"><label>Humeral</label><input type="number" id="af-dHum" step="0.1" value="${_di('hum')}"></div>
      <div class="form-field"><label>Femoral</label><input type="number" id="af-dFem" step="0.1" value="${_di('fem')}"></div>
    </div>
    <div class="form-section-label">Fraccionamiento D. Kerr</div>
    <div class="form-grid-3">
      <div class="form-field"><label>M. adiposa (kg)</label><input type="number" id="af-madipkg" step="0.01" value="${_aV('masaAdip')}"></div>
      <div class="form-field"><label>M. muscular (kg)</label><input type="number" id="af-mmuskg" step="0.01" value="${_aV('masaMusc')}"></div>
      <div class="form-field"><label>M. ósea (kg)</label><input type="number" id="af-moseakg" step="0.01" value="${_aV('masaOsea')}"></div>
    </div>
    <div class="form-grid-2" style="margin-top:8px;">
      <div class="form-field"><label>Z-score adiposa</label><input type="number" id="af-zadip" step="0.01" value="${_aV('zAdip')}"></div>
      <div class="form-field"><label>Z-score muscular</label><input type="number" id="af-zmusc" step="0.01" value="${_aV('zMusc')}"></div>
    </div>
    <div class="form-row"><button class="save-btn" style="width:100%;" data-action="saveantroform">Guardar</button></div>
  </div>`:`<button class="save-btn" style="width:100%;margin-bottom:12px;background:var(--bg2);color:var(--text);border:1px solid var(--border);" data-action="newantro">+ Nueva evaluación ISAK</button>`;
  const cards=evals.map(([id,ev],i)=>{
    const prev=evals[i+1]?evals[i+1][1]:null;
    const sf=ev.skinfolds||{};const pe=ev.perimeters||{};
    const vals=[sf.triceps,sf.subscapular,sf.supraspinal,sf.abdominal,sf.thigh,sf.calf].filter(v=>v!=null);
    const suma6=ev.skinfoldSum!=null?ev.skinfoldSum:(vals.length>0?Math.round(vals.reduce((a,b)=>a+b,0)*10)/10:null);
    const prevVals=prev?.skinfolds?[prev.skinfolds.triceps,prev.skinfolds.subscapular,prev.skinfolds.supraspinal,prev.skinfolds.abdominal,prev.skinfolds.thigh,prev.skinfolds.calf].filter(v=>v!=null):[];
    const prevS6=prev?.skinfoldSum!=null?prev.skinfoldSum:(prevVals.length>0?prevVals.reduce((a,b)=>a+b,0):null);
    const madip=ev.masaAdip??null,mmusc=ev.masaMusc??null,mosea=ev.masaOsea??null;
    const zadip=ev.zAdip??null,zmusc=ev.zMusc??null;
    const morphoEvals=Object.values(a.morphology||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
    const lastWeight=morphoEvals[0]?.weight||null;
    const pAdip=madip&&lastWeight?(madip/lastWeight*100).toFixed(1):null;
    const pMusc=mmusc&&lastWeight?(mmusc/lastWeight*100).toFixed(1):null;
    const imo=ev.imoManual!=null?ev.imoManual:(mmusc&&mosea?(mmusc/mosea).toFixed(2):null);
    const zdiff=zadip!==null&&zmusc!==null?Math.round((zmusc-zadip)*100)/100:null;
    const pc=(zadip!==null&&zmusc!==null)?perfColor(zadip,zmusc,zdiff,th):null;
    const s6pOk=suma6!==null&&suma6<th.s6p;
    const zadipOk=zadip!==null&&zadip<th.zadip;
    const zmuscOk=zmusc!==null&&zmusc>th.zmuscle;
    const imoOk=imo!==null&&parseFloat(imo)>th.imo;
    const hasFraction=madip!==null||mmusc!==null||zadip!==null||zmusc!==null||imo!==null;
    return`<div class="eval-card">
      <div class="eval-top">
        <span class="eval-date">${fmtDate(ev.date||id.slice(0,10))}</span>
        <span style="font-size:11px;color:var(--text3);">${th.label}</span>
        <button class="sm-btn" style="margin-left:auto;margin-right:4px;" data-action="editevalantro" data-evid="${id}">Editar</button><button class="eval-del" data-action="delevalantro" data-evid="${id}">Eliminar</button>
      </div>
      ${suma6!==null?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <div><span style="font-size:12px;color:var(--text2);">Σ6 pliegues</span><span style="font-size:22px;font-weight:700;color:${suma6<th.s6p?'#86efac':'#fca5a5'};margin-left:6px;">${suma6}</span><span style="font-size:12px;color:var(--text3);"> mm</span>${deltaHtml(suma6,prevS6)}<span style="margin-left:4px;">${checkIcon(suma6<th.s6p)}</span></div>
      </div>`:''}
      ${hasFraction?`<div style="background:var(--bg2);border-radius:10px;padding:10px 12px;margin-bottom:10px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Fraccionamiento D. Kerr</div>
        <div class="eval-grid-4">
          ${madip!==null?`<div class="eval-cell"><div class="eval-cell-label">M. Adiposa</div><div class="eval-cell-val">${madip}<span style="font-size:10px;color:var(--text3);">kg</span></div>${pAdip?`<div class="eval-delta" style="color:var(--text3);">${pAdip}%</div>`:''}</div>`:''}
          ${mmusc!==null?`<div class="eval-cell"><div class="eval-cell-label">M. Muscular</div><div class="eval-cell-val">${mmusc}<span style="font-size:10px;color:var(--text3);">kg</span></div>${pMusc?`<div class="eval-delta" style="color:var(--text3);">${pMusc}%</div>`:''}</div>`:''}
          ${zadip!==null?`<div class="eval-cell" style="${zadip<th.zadip?'background:#052e16;':'background:#2d0a0a;'}"><div class="eval-cell-label" style="color:var(--text3);">Z adiposa</div><div class="eval-cell-val" style="color:${zadip<th.zadip?'#86efac':'#fca5a5'};">${zadip>0?'+':''}${zadip}</div><div class="eval-delta">${checkIcon(zadip<th.zadip)}</div></div>`:''}
          ${zmusc!==null?`<div class="eval-cell" style="${zmusc>th.zmuscle?'background:#052e16;':'background:#1c1400;'}"><div class="eval-cell-label" style="color:var(--text3);">Z muscular</div><div class="eval-cell-val" style="color:${zmusc>th.zmuscle?'#86efac':'#fcd34d'};">${zmusc>0?'+':''}${zmusc}</div><div class="eval-delta">${checkIcon(zmusc>th.zmuscle)}</div></div>`:''}
        </div>
        ${zdiff!==null?`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
          <div style="font-size:12px;color:var(--text2);">Diferencia Z (musc − adip):</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;font-weight:800;color:${pc?.fg||'var(--text)'};">${zdiff>0?'+':''}${zdiff}</span>
            <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:${pc?.bg||'var(--bg3)'};color:${pc?.fg||'var(--text2)'};">${pc?.label||'—'}</span>
          </div>
        </div>${pc?.sub?`<div style="font-size:11px;color:var(--text3);margin-top:3px;text-align:right;">${pc.sub}</div>`:''}`:''}
        ${imo?`<div style="display:flex;align-items:center;gap:6px;margin-top:6px;"><span style="font-size:12px;color:var(--text2);">IMO:</span><span style="font-size:14px;font-weight:700;color:${parseFloat(imo)>th.imo?'#86efac':'#fcd34d'};">${imo}</span>${checkIcon(parseFloat(imo)>th.imo)}<span style="font-size:11px;color:var(--text3);">Umbral: >${th.imo}</span></div>`:''}
        <div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px;">
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${s6pOk?'#052e16':'#2d0a0a'};color:${s6pOk?'#86efac':'#fca5a5'};">Σ6P <${th.s6p}mm ${checkIcon(s6pOk)}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${zadipOk?'#052e16':'#2d0a0a'};color:${zadipOk?'#86efac':'#fca5a5'};">Z adip <${th.zadip} ${checkIcon(zadipOk)}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${zmuscOk?'#052e16':'#1c1400'};color:${zmuscOk?'#86efac':'#fcd34d'};">Z musc >${th.zmuscle} ${checkIcon(zmuscOk)}</span>
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${imoOk?'#052e16':'#1c1400'};color:${imoOk?'#86efac':'#fcd34d'};">IMO >${th.imo} ${checkIcon(imoOk)}</span>
          </div>
        </div>
      </div>`:''}
      <div class="form-section-label">Pliegues (mm)</div>
      <div class="form-grid-3">${[['Tríceps',sf.triceps],['Subesc.',sf.subscapular],['Supraes.',sf.supraspinal],['Abdom.',sf.abdominal],['Muslo',sf.thigh],['Pantorr.',sf.calf]].filter(([,v])=>v!=null).map(([l,v])=>`<div class="eval-cell"><div class="eval-cell-label">${l}</div><div class="eval-cell-val">${v}</div></div>`).join('')}</div>
      ${Object.values(pe).some(v=>v!=null)?`<div class="form-section-label">Perímetros (cm)</div><div class="form-grid-3">${[['Brazo R.',pe.armR],['Brazo F.',pe.armF],['Cintura',pe.waist],['Cadera',pe.hips],['Muslo',pe.thighU],['Pantorr.',pe.calf]].filter(([,v])=>v!=null).map(([l,v])=>`<div class="eval-cell"><div class="eval-cell-label">${l}</div><div class="eval-cell-val">${v}</div></div>`).join('')}</div>`:''}
    </div>`;
  }).join('');
  return formHtml+(cards||`<div class="empty-state">Sin evaluaciones.<br><span style="font-size:12px;">Ingresá datos del informe.</span></div>`)+(evals.length>=2?`<div class="chart-card"><div class="chart-title">Evolución antropométrica<div class="chart-legend"><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#fb923c;"></span>Σ6</span><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#fca5a5;"></span>Z adip</span><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#86efac;"></span>Z musc</span></div></div><canvas id="chart-antro" height="150"></canvas></div>`:'');
}

function renderAthleteTests(a){
  const sv=(d,s=13,sw=1.6)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden><path d="${d}"/></svg>`;
  // ── Jump data ──
  const evals=Object.entries(a.jumpTests||{}).sort((x,y)=>y[0].localeCompare(x[0]));
  const editJump=S.editingEvalId&&S.athleteForm==='tests'?(a.jumpTests||{})[S.editingEvalId]:null;
  const _jV=(k)=>editJump?.[k]!=null?editJump[k]:'';
  const formHtml=S.athleteForm==='tests'?`<div class="form-card">
    <div class="form-card-title">${editJump?'Editar':'Nueva'} evaluación de salto <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
    <div class="form-field" style="margin-bottom:8px;"><label>Fecha</label><input type="date" id="af-date" value="${editJump?.date||TODAY}"></div>
    <div class="form-section-label">Saltos (cm)</div>
    <div class="form-grid-3">
      <div class="form-field"><label>SJ (cm)</label><input type="number" id="af-sj" step="0.1" placeholder="35.0" value="${_jV('sj')}"></div>
      <div class="form-field"><label>CMJ (cm)</label><input type="number" id="af-cmj" step="0.1" placeholder="38.0" value="${_jV('cmj')}"></div>
      <div class="form-field"><label>ABK (cm)</label><input type="number" id="af-abk" step="0.1" placeholder="42.0" value="${_jV('abk')}"></div>
      <div class="form-field"><label>ABK Der. (cm)</label><input type="number" id="af-abkr" step="0.1" placeholder="44.0" value="${_jV('abkRight')}"></div>
      <div class="form-field"><label>ABK Izq. (cm)</label><input type="number" id="af-abkl" step="0.1" placeholder="43.0" value="${_jV('abkLeft')}"></div>
    </div>
    <div class="form-section-label">Drop Jump</div>
    <div class="form-grid-3">
      <div class="form-field"><label>Altura DJ (cm)</label><input type="number" id="af-djh" step="0.1" placeholder="36.0" value="${_jV('djHeight')}"></div>
      <div class="form-field"><label>TC (ms)</label><input type="number" id="af-djtc" step="1" placeholder="180" value="${_jV('djTc')}"></div>
      <div class="form-field"><label>RSI (auto)</label><input type="text" id="af-rsi-preview" readonly style="background:var(--bg3);color:var(--text3);" placeholder="—"></div>
    </div>
    <div class="form-field" style="margin-top:8px;"><label>Notas</label><input type="text" id="af-notes" placeholder="Condiciones, observaciones..." value="${_jV('notes')}"></div>
    <div class="form-row"><button class="save-btn" style="width:100%;" data-action="savetestsform">Guardar</button></div>
  </div>`:'';
  // ── KPI strip (latest eval) ──
  const lt=evals[0]?.[1],pv=evals[1]?.[1];
  const rsiLt=lt?.djHeight&&lt?.djTc?Math.round((lt.djHeight/100)/(lt.djTc/1000)*100)/100:null;
  const rsiPv=pv?.djHeight&&pv?.djTc?Math.round((pv.djHeight/100)/(pv.djTc/1000)*100)/100:null;
  const kpis=lt?[
    {l:'CMJ',v:lt.cmj,p:pv?.cmj,u:'cm',c:'var(--accent)'},
    {l:'SJ',v:lt.sj,p:pv?.sj,u:'cm',c:'var(--text-0)'},
    {l:'ABK',v:lt.abk,p:pv?.abk,u:'cm',c:'var(--text-0)'},
    {l:'DJ',v:lt.djHeight,p:pv?.djHeight,u:'cm',c:'var(--text-0)'},
    {l:'RSI',v:rsiLt,p:rsiPv,u:'',c:rsiLt>=2?'var(--ok)':rsiLt>=1.5?'var(--warn)':'var(--bad)'},
  ].filter(k=>k.v!=null):[];
  const kpiStrip=kpis.length?`<div class="q-stats" style="grid-template-columns:repeat(${kpis.length},1fr);margin-bottom:18px;">${kpis.map(k=>{const d=k.p!=null?Math.round((k.v-k.p)*10)/10:null;return`<div class="q-stat"><div class="q-stat__row"><span class="q-stat__label">${k.l}</span></div><div class="q-stat__val" style="color:${k.c};">${k.v}${k.u?`<span class="u">${k.u}</span>`:''}</div>${d!=null?`<div class="q-stat__sub"><span class="q-stat__delta ${d>0?'up':d<0?'down':'flat'}">${d>0?'+':''}${d}</span></div>`:''}</div>`;}).join('')}</div>`:'';
  // ── History cards ──
  const cards=evals.map(([id,ev],i)=>{
    const prev=evals[i+1]?.[1];
    const rsi=ev.djHeight&&ev.djTc?Math.round((ev.djHeight/100)/(ev.djTc/1000)*100)/100:null;
    const rz=rsiZone(rsi);
    const protos=[
      {l:'CMJ — Counter Movement Jump',v:ev.cmj,pv:prev?.cmj,c:'var(--accent)',u:'cm'},
      {l:'SJ — Squat Jump',v:ev.sj,pv:prev?.sj,c:'var(--text-0)',u:'cm'},
      {l:'ABK — Abalakov',v:ev.abk,pv:prev?.abk,c:'var(--text-0)',u:'cm'},
      {l:'ABK Der.',v:ev.abkRight,pv:prev?.abkRight,c:'var(--text-0)',u:'cm'},
      {l:'ABK Izq.',v:ev.abkLeft,pv:prev?.abkLeft,c:'var(--text-0)',u:'cm'},
      {l:'DJ 30 cm — Drop Jump',v:ev.djHeight,pv:prev?.djHeight,c:rz?rz.color:'var(--text-0)',u:'cm',note:rsi?`RSI: ${rsi} (${rz?.label||''})`:null},
    ].filter(p=>p.v!=null);
    const rows=protos.map(p=>{
      const d=p.pv!=null?Math.round((p.v-p.pv)*10)/10:null;
      const pct=Math.min(100,(p.v/55)*100);
      return`<div style="padding:10px 0;border-bottom:1px solid var(--line);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:12px;font-weight:500;color:var(--text-1);">${p.l}</span><div style="display:flex;align-items:baseline;gap:8px;"><span class="mono" style="font-size:15px;font-weight:500;color:${p.c};letter-spacing:-.02em;">${p.v}<span style="font-size:10px;color:var(--text-2);margin-left:2px;">${p.u}</span></span>${d!=null?`<span class="mono" style="font-size:10px;color:${d>0?'var(--ok)':d<0?'var(--bad)':'var(--text-2)'};">${d>0?'+':''}${d}</span>`:''}</div></div><div style="height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${p.c};border-radius:3px;opacity:.8;"></div></div>${p.note?`<div class="mono" style="font-size:10px;color:var(--text-3);margin-top:3px;">${p.note}</div>`:''}</div>`;
    }).join('');
    return`<div class="q-card" style="margin-bottom:12px;"><div class="q-card__h"><h3>${sv('M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3-2v4m8-4v4',12)} ${fmtDate(ev.date||id.slice(0,10))}</h3><div style="display:flex;gap:6px;">${ev.notes?`<span class="mono" style="font-size:10px;color:var(--text-2);padding:2px 6px;background:var(--bg-3);border-radius:3px;">${ev.notes}</span>`:''}<button class="q-btn q-btn--ghost q-btn--sm" data-action="editevaltests" data-evid="${id}">Editar</button><button class="q-btn q-btn--sm" style="color:var(--bad);border-color:rgba(255,77,94,.4);background:var(--bad-soft);" data-action="delevaltests" data-evid="${id}">Eliminar</button></div></div>${protos.length?`<div class="q-card__b" style="padding:4px 16px 12px;">${rows}</div>`:'<div class="q-card__b" style="color:var(--text-2);font-size:12px;">Sin datos.</div>'}</div>`;
  }).join('');
  const chartHtml=evals.length>=2?`<div class="q-card" style="margin-bottom:12px;"><div class="q-card__h"><h3>Evolución de saltos</h3><div class="chart-legend"><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#60a5fa;"></span>SJ</span><span class="chart-legend-item"><span class="chart-legend-dot" style="background:var(--accent);"></span>CMJ</span><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#f59e0b;"></span>ABK</span><span class="chart-legend-item"><span class="chart-legend-dot" style="background:#f472b6;"></span>RSI</span></div></div><div class="q-card__b"><canvas id="chart-tests" height="150"></canvas></div></div>`:'';
  // ── FMS ──
  const fmsEvals=Object.entries(a.fmsTests||{}).sort((x,y)=>y[0].localeCompare(x[0]));
  const minBi=(l,r)=>(l!=null&&r!=null)?Math.min(l,r):l!=null?l:r!=null?r:null;
  const fmsInfo=(ev)=>{const s=[ev.deepSquat,minBi(ev.hurdleL,ev.hurdleR),minBi(ev.lungeL,ev.lungeR),minBi(ev.shoulderL,ev.shoulderR),minBi(ev.aslrL,ev.aslrR),ev.trunkStab,minBi(ev.rotaryL,ev.rotaryR)];const valid=s.filter(v=>v!=null);return{sum:valid.reduce((a,b)=>a+b,0),completed:valid.length};};
  const editFms=S.editingEvalId&&S.athleteForm==='fms'?(a.fmsTests||{})[S.editingEvalId]:null;
  const _fV=(k)=>editFms?.[k]!=null?editFms[k]:'';
  const fsel=(id,val='')=>`<select id="${id}" style="width:100%;padding:4px 6px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;">${['','0','1','2','3'].map(n=>`<option value="${n}"${String(val)===n?' selected':''}>${n===''?'—':n}</option>`).join('')}</select>`;
  const fmsFormHtml=S.athleteForm==='fms'?`<div class="form-card">
    <div class="form-card-title">${editFms?'Editar':'Nueva'} evaluación FMS <button class="sm-btn" data-action="cancelathleteform">✕</button></div>
    <div class="form-field" style="margin-bottom:8px;"><label>Fecha</label><input type="date" id="fms-date" value="${editFms?.date||TODAY}"></div>
    <div class="form-section-label">Movimientos (0–3)</div>
    <div class="form-grid-2" style="margin-bottom:6px;">
      <div class="form-field"><label>Deep Squat</label>${fsel('fms-ds',_fV('deepSquat'))}</div>
      <div class="form-field"><label>Trunk Stability PU</label>${fsel('fms-ts',_fV('trunkStab'))}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 64px 64px;gap:4px 8px;align-items:center;margin-bottom:8px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">Bilateral (Izq./Der. → mínimo)</div>
      <div style="font-size:10px;color:var(--text3);text-align:center;">Izq.</div>
      <div style="font-size:10px;color:var(--text3);text-align:center;">Der.</div>
      <div style="font-size:12px;color:var(--text2);display:flex;align-items:center;">Hurdle Step</div><div>${fsel('fms-hsl',_fV('hurdleL'))}</div><div>${fsel('fms-hsr',_fV('hurdleR'))}</div>
      <div style="font-size:12px;color:var(--text2);display:flex;align-items:center;">Inline Lunge</div><div>${fsel('fms-lul',_fV('lungeL'))}</div><div>${fsel('fms-lur',_fV('lungeR'))}</div>
      <div style="font-size:12px;color:var(--text2);display:flex;align-items:center;">Shoulder Mobility</div><div>${fsel('fms-sml',_fV('shoulderL'))}</div><div>${fsel('fms-smr',_fV('shoulderR'))}</div>
      <div style="font-size:12px;color:var(--text2);display:flex;align-items:center;">ASLR</div><div>${fsel('fms-asl',_fV('aslrL'))}</div><div>${fsel('fms-asr',_fV('aslrR'))}</div>
      <div style="font-size:12px;color:var(--text2);display:flex;align-items:center;">Rotary Stability</div><div>${fsel('fms-rsl',_fV('rotaryL'))}</div><div>${fsel('fms-rsr',_fV('rotaryR'))}</div>
    </div>
    <div class="form-field" style="margin-top:4px;"><label>Notas</label><input type="text" id="fms-notes" placeholder="Observaciones..." value="${_fV('notes')}"></div>
    <div class="form-row"><button class="save-btn" style="width:100%;" data-action="savefmsform">Guardar</button></div>
  </div>`:'';
  // ── FMS latest eval ──
  const ltFms=fmsEvals[0]?.[1];
  let fmsLatestHtml='';
  if(ltFms){
    const pvFms=fmsEvals[1]?.[1];
    const {sum,completed}=fmsInfo(ltFms);
    const safe=sum>=14;
    const fc=safe?'var(--ok)':'var(--bad)';
    const pct=(sum/21)*360;
    const pvInfo=pvFms?fmsInfo(pvFms):null;
    const delta=pvInfo!=null?sum-pvInfo.sum:null;
    const sc=(s)=>s===0||s===1?'var(--bad)':s===2?'var(--warn)':'var(--ok)';
    const sl=(s)=>s===0?'Dolor':s===1?'Pobre':s===2?'Compensa':'Óptimo';
    const patterns=[
      {l:'Deep Squat',s:ltFms.deepSquat,note:''},
      {l:'Hurdle Step L/R',s:minBi(ltFms.hurdleL,ltFms.hurdleR),note:ltFms.hurdleL!=null?`${ltFms.hurdleL}/${ltFms.hurdleR}`:''},
      {l:'In-Line Lunge L/R',s:minBi(ltFms.lungeL,ltFms.lungeR),note:ltFms.lungeL!=null?`${ltFms.lungeL}/${ltFms.lungeR}`:''},
      {l:'Shoulder Mobility L/R',s:minBi(ltFms.shoulderL,ltFms.shoulderR),note:ltFms.shoulderL!=null?`${ltFms.shoulderL}/${ltFms.shoulderR}`:''},
      {l:'Active SLR L/R',s:minBi(ltFms.aslrL,ltFms.aslrR),note:ltFms.aslrL!=null?`${ltFms.aslrL}/${ltFms.aslrR}`:''},
      {l:'Trunk Stability Push-Up',s:ltFms.trunkStab,note:''},
      {l:'Rotary Stability L/R',s:minBi(ltFms.rotaryL,ltFms.rotaryR),note:ltFms.rotaryL!=null?`${ltFms.rotaryL}/${ltFms.rotaryR}`:''},
    ].filter(p=>p.s!=null);
    const fi='M4 21V4M4 4h13l-2 4 2 4H4',ci='m4 12 6 6L20 6';
    const flags=[];
    if(ltFms.deepSquat!=null&&ltFms.deepSquat<3)flags.push({l:`Deep Squat = ${ltFms.deepSquat} · movilidad tobillo`,s:'Plan A · 3x sem',c:'var(--warn)',i:fi});
    const lunge=minBi(ltFms.lungeL,ltFms.lungeR);
    if(lunge!=null&&lunge<3&&ltFms.lungeL!==ltFms.lungeR)flags.push({l:`Asimetría Lunge L${ltFms.lungeL}/R${ltFms.lungeR}`,s:'Trabajo unilateral · core anti-rotación',c:'var(--warn)',i:fi});
    if(ltFms.trunkStab!=null&&ltFms.trunkStab<3)flags.push({l:`Trunk Stability = ${ltFms.trunkStab}`,s:'Plank progresiones · dead bug',c:'var(--warn)',i:fi});
    const allScores=[ltFms.deepSquat,ltFms.hurdleL,ltFms.hurdleR,ltFms.lungeL,ltFms.lungeR,ltFms.shoulderL,ltFms.shoulderR,ltFms.aslrL,ltFms.aslrR,ltFms.trunkStab,ltFms.rotaryL,ltFms.rotaryR].filter(v=>v!=null);
    if(!allScores.includes(0))flags.push({l:'Sin dolor en ningún patrón',s:'Habilita carga libre',c:'var(--ok)',i:ci});
    const _fmsMob=window.innerWidth<900;
    fmsLatestHtml=`<div style="display:grid;grid-template-columns:${_fmsMob?'1fr':'180px 1fr'};gap:16px;align-items:start;margin-bottom:16px;">
      <div style="background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:16px 12px;text-align:center;">
        <div style="font-size:9.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:8px;">FMS Score · ${fmtDate(ltFms.date||fmsEvals[0][0].slice(0,10))}</div>
        <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(${fc} 0 ${pct}deg,var(--bg-3) 0);display:grid;place-items:center;margin:0 auto 12px;position:relative;">
          <div style="position:absolute;inset:10px;border-radius:50%;background:var(--bg-1);display:grid;place-items:center;">
            <div><div class="mono" style="font-size:34px;font-weight:500;letter-spacing:-.04em;color:${fc};line-height:1;">${sum}</div><div class="mono" style="font-size:10px;color:var(--text-2);">de 21</div></div>
          </div>
        </div>
        <div style="font-size:12px;font-weight:600;color:${fc};">${safe?'Sobre el umbral':'⚠ Zona riesgo'}</div>
        <div style="font-size:10.5px;color:var(--text-2);margin-top:4px;line-height:1.4;">Score &lt; 14 → 2× riesgo lesión</div>
        ${delta!=null?`<div class="mono" style="font-size:10px;color:${delta>0?'var(--ok)':delta<0?'var(--bad)':'var(--text-2)'};margin-top:8px;padding-top:8px;border-top:1px solid var(--line);">${delta>0?'+':''}${delta} vs eval anterior</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="q-card"><div class="q-card__h" style="padding:10px 14px;"><h3 style="font-size:12px;">Desglose · ${patterns.length} patrones</h3><div style="display:flex;gap:3px;">${[{l:'0',c:'var(--bad)'},{l:'1',c:'var(--bad)'},{l:'2',c:'var(--warn)'},{l:'3',c:'var(--ok)'}].map(s=>`<span class="mono" style="font-size:9px;color:${s.c};padding:1px 4px;border:1px solid ${s.c}55;border-radius:2px;">${s.l}</span>`).join('')}</div></div>
        <div>${patterns.map((p,i)=>`<div style="display:grid;grid-template-columns:20px 1fr auto auto;align-items:center;gap:8px;padding:8px 14px;border-bottom:${i<patterns.length-1?'1px solid var(--line)':'0'};"><span class="mono" style="font-size:9px;color:var(--text-3);">0${i+1}</span><div><div style="font-size:11.5px;font-weight:500;">${p.l}</div>${p.note?`<div style="font-size:9.5px;color:var(--text-2);">${p.note}</div>`:''}</div><div style="display:flex;gap:2px;">${[0,1,2,3].map(s=>`<div style="width:20px;height:20px;border-radius:3px;display:grid;place-items:center;font:600 10px var(--font-mono);background:${s===p.s?sc(s):'var(--bg-3)'};color:${s===p.s?'#fff':'var(--text-3)'};border:${s===p.s?'0':'1px solid var(--line)'};">${s}</div>`).join('')}</div><span style="font-size:10px;font-weight:600;color:${sc(p.s)};white-space:nowrap;min-width:55px;text-align:right;">${sl(p.s)}</span></div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:var(--bg-3);border-top:2px solid var(--line-strong);"><span style="font-size:11.5px;font-weight:600;">Total · ${completed} patrones</span><span class="mono" style="font-size:16px;font-weight:500;color:${safe?'var(--ok)':'var(--bad)'};">${sum} <span style="font-size:10px;color:var(--text-2);">/ 21</span></span></div></div></div>
        ${flags.length?`<div class="q-card"><div class="q-card__h" style="padding:10px 14px;"><h3 style="font-size:12px;">Banderas · trabajo correctivo</h3></div><div>${flags.map((ff,i)=>`<div style="padding:10px 14px;border-bottom:${i<flags.length-1?'1px solid var(--line)':'0'};display:flex;gap:8px;align-items:flex-start;"><span style="width:24px;height:24px;border-radius:5px;background:${ff.c}1f;color:${ff.c};display:grid;place-items:center;flex-shrink:0;">${sv(ff.i,12)}</span><div><div style="font-size:11.5px;font-weight:500;">${ff.l}</div><div style="font-size:10.5px;color:var(--text-2);">${ff.s}</div></div></div>`).join('')}</div></div>`:''}
      </div>
    </div>`;
  }
  const fmsOldCards=fmsEvals.slice(ltFms?1:0).map(([id,ev])=>{
    const {sum}=fmsInfo(ev);const safe=sum>=14;
    return`<div class="q-card" style="margin-bottom:8px;"><div class="q-card__h"><h3>${fmtDate(ev.date||id.slice(0,10))}</h3><div style="display:flex;gap:6px;align-items:center;"><span class="mono" style="font-size:11px;padding:2px 8px;border-radius:12px;background:${safe?'var(--ok-soft)':'var(--bad-soft)'};color:${safe?'var(--ok)':'var(--bad)'};">${sum}/21 — ${safe?'OK':'Riesgo'}</span><button class="q-btn q-btn--ghost q-btn--sm" data-action="editevalfms" data-evid="${id}">Editar</button><button class="q-btn q-btn--sm" style="color:var(--bad);border-color:rgba(255,77,94,.4);background:var(--bad-soft);" data-action="delevalfms" data-evid="${id}">Eliminar</button></div></div></div>`;
  }).join('');
  return`<div style="margin-bottom:8px;">
    <div class="q-section-h"><div class="q-section-h__l"><h2>Tests de Salto</h2><p>SJ · CMJ · ABK · Drop Jump</p></div><div class="q-section-h__r">${!editJump&&S.athleteForm!=='tests'?`<button class="q-btn q-btn--primary q-btn--sm" data-action="newtests">${sv('M12 5v14M5 12h14',12)} Nueva evaluación</button>`:''}</div></div>
    ${formHtml}${kpiStrip}${cards||`<div class="empty-state">Sin evaluaciones de salto.</div>`}${chartHtml}
  </div>
  <div style="padding-top:20px;border-top:1px solid var(--line);">
    <div class="q-section-h"><div class="q-section-h__l"><h2>FMS — Functional Movement Screen</h2><p>7 patrones de movimiento fundamental</p></div><div class="q-section-h__r">${!editFms&&S.athleteForm!=='fms'?`<button class="q-btn q-btn--primary q-btn--sm" data-action="newfmseval">${sv('M12 5v14M5 12h14',12)} Nueva evaluación</button>`:''}</div></div>
    ${fmsFormHtml}${ltFms?fmsLatestHtml:`<div class="empty-state">Sin evaluaciones FMS.</div>`}${fmsOldCards}
  </div>`;
}
function updateRsiPreview(){const h=parseFloat(document.getElementById('af-djh')?.value);const tc=parseFloat(document.getElementById('af-djtc')?.value);const el=document.getElementById('af-rsi-preview');if(el&&h&&tc)el.value=((h/100)/(tc/1000)).toFixed(2);else if(el)el.value='—';}

// ── CHARTS ────────────────────────────────────────────────────
const _charts={};
function mkChart(id,config){
  if(_charts[id]){_charts[id].destroy();}
  const canvas=document.getElementById(id);if(!canvas)return;
  const baseOpts={responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,titleColor:'#f1f5f9',bodyColor:'#94a3b8',padding:10}},scales:{x:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'#1e293b'}},y:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'#1e293b22'}}}};
  const merged={...config,options:{...baseOpts,...(config.options||{})}};
  if(config.options?.scales)merged.options.scales={...baseOpts.scales,...config.options.scales};
  _charts[id]=new Chart(canvas,merged);
}
function initCharts(){
  if(S.view!=='athlete'||!S.athleteKey||typeof Chart==='undefined')return;
  const a=getAthlete(S.athleteKey);
  const tab=S.athleteTab;
  if(tab==='morfo'){
    const evals=Object.values(a.morphology||{}).filter(e=>e.weight).sort((x,y)=>(x.date||'').localeCompare(y.date||''));
    if(evals.length<2)return;
    mkChart('chart-morfo',{type:'line',data:{labels:evals.map(e=>fmtDate(e.date)),datasets:[{label:'Peso (kg)',data:evals.map(e=>e.weight),borderColor:'#60a5fa',backgroundColor:'#60a5fa22',borderWidth:2,pointRadius:4,pointBackgroundColor:'#60a5fa',tension:0.3,fill:true}]}});
  }
  if(tab==='antro'){
    const evals=Object.values(a.anthropometry||{}).sort((x,y)=>(x.date||'').localeCompare(y.date||''));
    if(evals.length<2)return;
    const labels=evals.map(e=>fmtDate(e.date));const datasets=[];
    const hasS6=evals.some(e=>{const sf=e.skinfolds||{};return[sf.triceps,sf.subscapular,sf.supraspinal,sf.abdominal,sf.thigh,sf.calf].every(v=>v!=null);});
    if(hasS6)datasets.push({label:'Σ6',yAxisID:'y',data:evals.map(e=>{const sf=e.skinfolds||{};const v=[sf.triceps,sf.subscapular,sf.supraspinal,sf.abdominal,sf.thigh,sf.calf];return v.every(x=>x!=null)?Math.round(v.reduce((a,b)=>a+b,0)*10)/10:null;}),borderColor:'#fb923c',backgroundColor:'transparent',borderWidth:2,pointRadius:4,pointBackgroundColor:'#fb923c',tension:0.3,fill:false,spanGaps:true});
    if(evals.some(e=>e.zAdip!=null)){datasets.push({label:'Z adip',yAxisID:'y2',data:evals.map(e=>e.zAdip??null),borderColor:'#fca5a5',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],pointRadius:4,pointBackgroundColor:'#fca5a5',tension:0.3,fill:false,spanGaps:true});datasets.push({label:'Z musc',yAxisID:'y2',data:evals.map(e=>e.zMusc??null),borderColor:'#86efac',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],pointRadius:4,pointBackgroundColor:'#86efac',tension:0.3,fill:false,spanGaps:true});}
    if(!datasets.length)return;
    mkChart('chart-antro',{type:'line',data:{labels,datasets},options:{scales:{y:{position:'left',ticks:{color:'#fb923c',font:{size:10}},grid:{color:'#1e293b22'},title:{display:true,text:'Σ6 mm',color:'#fb923c',font:{size:10}}},y2:{position:'right',ticks:{color:'#94a3b8',font:{size:10}},grid:{display:false},title:{display:true,text:'Z-score',color:'#94a3b8',font:{size:10}}},x:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'#1e293b'}}}}});
  }
  if(tab==='tests'){
    const evals=Object.values(a.jumpTests||{}).sort((x,y)=>(x.date||'').localeCompare(y.date||''));
    if(evals.length<2)return;
    const labels=evals.map(e=>fmtDate(e.date));const datasets=[];
    if(evals.some(e=>e.sj!=null))datasets.push({label:'SJ',yAxisID:'y',data:evals.map(e=>e.sj??null),borderColor:'#60a5fa',backgroundColor:'transparent',borderWidth:2,pointRadius:4,pointBackgroundColor:'#60a5fa',tension:0.3,fill:false,spanGaps:true});
    if(evals.some(e=>e.cmj!=null))datasets.push({label:'CMJ',yAxisID:'y',data:evals.map(e=>e.cmj??null),borderColor:'#34d399',backgroundColor:'transparent',borderWidth:2,pointRadius:4,pointBackgroundColor:'#34d399',tension:0.3,fill:false,spanGaps:true});
    if(evals.some(e=>e.abk!=null))datasets.push({label:'ABK',yAxisID:'y',data:evals.map(e=>e.abk??null),borderColor:'#f59e0b',backgroundColor:'transparent',borderWidth:2,pointRadius:4,pointBackgroundColor:'#f59e0b',tension:0.3,fill:false,spanGaps:true});
    if(evals.some(e=>e.abkRight!=null))datasets.push({label:'ABK D.',yAxisID:'y',data:evals.map(e=>e.abkRight??null),borderColor:'#fb923c',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],pointRadius:4,pointBackgroundColor:'#fb923c',tension:0.3,fill:false,spanGaps:true});
    if(evals.some(e=>e.abkLeft!=null))datasets.push({label:'ABK I.',yAxisID:'y',data:evals.map(e=>e.abkLeft??null),borderColor:'#a78bfa',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],pointRadius:4,pointBackgroundColor:'#a78bfa',tension:0.3,fill:false,spanGaps:true});
    const rsiData=evals.map(e=>e.djHeight&&e.djTc?Math.round((e.djHeight/100)/(e.djTc/1000)*100)/100:null);
    if(rsiData.some(v=>v!=null))datasets.push({label:'RSI',yAxisID:'y2',data:rsiData,borderColor:'#f472b6',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],pointRadius:4,pointBackgroundColor:'#f472b6',tension:0.3,fill:false,spanGaps:true});
    if(!datasets.length)return;
    mkChart('chart-tests',{type:'line',data:{labels,datasets},options:{scales:{y:{position:'left',ticks:{color:'#94a3b8',font:{size:10}},grid:{color:'#1e293b22'},title:{display:true,text:'cm',color:'#94a3b8',font:{size:10}}},y2:{position:'right',ticks:{color:'#f472b6',font:{size:10}},grid:{display:false},title:{display:true,text:'RSI',color:'#f472b6',font:{size:10}}},x:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'#1e293b'}}}}});
  }
}

// ── EXPORTS ───────────────────────────────────────────────────
function exportAthletePDF(){
  const [tid,cid,pid]=S.athleteKey.split('__');
  const players=S.teams[tid]?.categories?.[cid]?.players||[];
  const player=players.find(p=>p.id===pid)||{name:'Jugador'};
  const a=getAthlete(S.athleteKey);const p=a.personal||{};
  const age=calcAge(p.birthdate);const th=getThresholds(cid,tid);
  const color=S.teams[tid]?.categories?.[cid]?.color||'#2563eb';
  const catName=S.teams[tid]?.categories?.[cid]?.name||'—';
  const teamName=S.teams[tid]?.name||'—';
  const morphoEvals=Object.values(a.morphology||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const antroEvals=Object.values(a.anthropometry||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const testEvals=Object.values(a.jumpTests||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const fmsEvalsP=Object.values(a.fmsTests||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const lm=morphoEvals[0]||{};const la=antroEvals[0]||{};const lt=testEvals[0]||{};const lf=fmsEvalsP[0]||{};
  const cd=S.teams[tid]?.categories?.[cid]||{};
  const met=calcMetrics(cd,pid);
  const attStats=getStats(cd.players||[],cd.attendance||{}).find(s=>s.id===pid)||{};
  const sf=la.skinfolds||{};const pe=la.perimeters||{};
  const sfVals=[sf.triceps,sf.subscapular,sf.supraspinal,sf.abdominal,sf.thigh,sf.calf].filter(v=>v!=null);
  const suma6=la.skinfoldSum!=null?la.skinfoldSum:(sfVals.length>0?sfVals.reduce((a,b)=>a+b,0).toFixed(1):'—');
  const imoP=la.imoManual!=null?la.imoManual:(la.masaMusc&&la.masaOsea?(la.masaMusc/la.masaOsea).toFixed(2):null);
  const zdiff=(la.zAdip!=null&&la.zMusc!=null)?(la.zMusc-la.zAdip).toFixed(2):'—';
  const pc=(la.zAdip!=null&&la.zMusc!=null)?perfColor(la.zAdip,la.zMusc,parseFloat(zdiff),th):null;
  const rsi=lt.djHeight&&lt.djTc?((lt.djHeight/100)/(lt.djTc/1000)).toFixed(2):'—';
  const az=acwrZone(met.acwr);
  const pAdip=la.masaAdip&&lm.weight?(la.masaAdip/lm.weight*100).toFixed(1):null;
  const pMusc=la.masaMusc&&lm.weight?(la.masaMusc/lm.weight*100).toFixed(1):null;
  const row=(l,v)=>`<tr><td style="padding:5px 8px;color:#555;font-size:13px;">${l}</td><td style="padding:5px 8px;font-weight:600;font-size:13px;">${v||'—'}</td></tr>`;
  const sec=(t)=>`<tr><td colspan="2" style="padding:10px 8px 4px;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.06em;border-top:1px solid #eee;">${t}</td></tr>`;
  const initials=player.name.split(',').map(s=>s.trim()[0]).join('').toUpperCase().slice(0,2)||'?';
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ficha — ${player.name}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#fff;padding:24px;max-width:680px;margin:0 auto}@media print{.no-print{display:none}}
  .header{display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid ${color}}.avatar{width:48px;height:48px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}.card{background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #e2e8f0}.card-title{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
  table{width:100%;border-collapse:collapse}.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}.footer{margin-top:20px;font-size:11px;color:#aaa;text-align:center}
  .print-btn{margin-bottom:16px;padding:8px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit}</style></head><body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  <div class="header"><div class="avatar">${initials}</div>
    <div><div style="font-size:22px;font-weight:700;">${player.name}</div><div style="font-size:13px;color:#666;margin-top:2px;">${teamName} · ${catName}${p.position?' · '+p.position:''}${age?' · '+age+' años':''}</div></div>
    <div style="margin-left:auto;font-size:12px;color:#999;">Generado: ${fmtDate(TODAY)}</div></div>
  <div class="grid">
    <div class="card"><div class="card-title">Datos personales</div><table>
      ${p.birthdate?row('Nacimiento',fmtDate(p.birthdate)+' · '+age+' años'):''}
      ${p.position?row('Posición',p.position):''}${p.number?row('Número','#'+p.number):''}${p.notes?row('Notas',p.notes):''}
    </table></div>
    <div class="card"><div class="card-title">Carga de entrenamiento</div><table>
      ${row('Asistencia',attStats.pct!=null?attStats.pct+'%':'—')}
      ${row('Carga aguda (7d)',met.ac+' UA')}
      ${row('ACWR',met.acwr!=null?`<span class="badge" style="background:${az.bg};color:${az.fg};">${met.acwr} — ${az.label}</span>`:'—')}
      ${row('Monotonía',met.monotony||'—')}${row('Wellness 7d',met.wellAvg||'—')}
    </table></div></div>
  ${lm.weight||lm.height?`<div class="card" style="margin-bottom:14px;"><div class="card-title">Morfología — ${fmtDate(lm.date)}</div><table><tr>
    ${lm.weight?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lm.weight}</div><div style="font-size:11px;color:#999;">kg</div></td>`:''}
    ${lm.height?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lm.height}</div><div style="font-size:11px;color:#999;">cm</div></td>`:''}
    ${lm.wingspan?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lm.wingspan}</div><div style="font-size:11px;color:#999;">enverg.</div></td>`:''}

  </tr></table></div>`:''}
  ${sfVals.length>0||la.zAdip!=null?`<div class="card" style="margin-bottom:14px;"><div class="card-title">Composición corporal — ${fmtDate(la.date)} · ${th.label}</div><table>
    ${sec('Pliegues ISAK')}${sfVals.length>0?row('Σ6 pliegues',suma6+' mm'+(suma6!=='—'&&parseFloat(suma6)<th.s6p?' ✓':' ✗')):''}
    ${[['Tríceps',sf.triceps],['Subescapular',sf.subscapular],['Supraespinal',sf.supraspinal],['Abdominal',sf.abdominal],['Muslo medial',sf.thigh],['Pantorrilla',sf.calf]].filter(([,v])=>v!=null).map(([l,v])=>row(l,v+' mm')).join('')}
    ${la.masaAdip!=null||la.masaMusc!=null?sec('Fraccionamiento D. Kerr'):''}
    ${la.masaAdip!=null?row('Masa adiposa',la.masaAdip+' kg'+(pAdip?' ('+pAdip+'%)':'')):''}
    ${la.masaMusc!=null?row('Masa muscular',la.masaMusc+' kg'+(pMusc?' ('+pMusc+'%)':'')):''}
    ${la.masaOsea!=null?row('Masa ósea',la.masaOsea+' kg'):''}
    ${la.zAdip!=null||la.zMusc!=null?sec('Z-scores Phantom'):''}
    ${la.zAdip!=null?row('Z adiposa',(la.zAdip>0?'+':'')+la.zAdip+(la.zAdip<th.zadip?' ✓':' ✗')):''}
    ${la.zMusc!=null?row('Z muscular',(la.zMusc>0?'+':'')+la.zMusc+(la.zMusc>th.zmuscle?' ✓':' ✗')):''}
    ${zdiff!=='—'?row('Diferencia Z',(parseFloat(zdiff)>0?'+':'')+zdiff+' — '+(pc?.label||'')):''}
    ${imoP?row('IMO',imoP+(parseFloat(imoP)>th.imo?' ✓':' ✗')+' (Umbral: >'+th.imo+')'):''}
  </table></div>`:''}
  ${lt.cmj!=null||lt.sj!=null||lt.abk!=null||rsi!=='—'?`<div class="card" style="margin-bottom:14px;"><div class="card-title">Tests de salto — ${fmtDate(lt.date)}</div><table><tr>
    ${lt.sj!=null?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lt.sj}</div><div style="font-size:11px;color:#999;">SJ (cm)</div></td>`:''}
    ${lt.cmj!=null?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lt.cmj}</div><div style="font-size:11px;color:#999;">CMJ (cm)</div></td>`:''}
    ${lt.abk!=null?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lt.abk}</div><div style="font-size:11px;color:#999;">ABK (cm)</div></td>`:''}
    ${lt.abkRight!=null?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lt.abkRight}</div><div style="font-size:11px;color:#999;">ABK D. (cm)</div></td>`:''}
    ${lt.abkLeft!=null?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${lt.abkLeft}</div><div style="font-size:11px;color:#999;">ABK I. (cm)</div></td>`:''}
    ${rsi!=='—'?`<td style="padding:5px 12px;text-align:center;"><div style="font-size:22px;font-weight:700;">${rsi}</div><div style="font-size:11px;color:#999;">RSI</div></td>`:''}
  </tr></table>${lt.notes?`<p style="font-size:12px;color:#666;margin-top:6px;padding:0 8px;">${lt.notes}</p>`:''}</div>`:''}
  ${(()=>{const hasLf=Object.keys(lf).length>0;if(!hasLf)return'';const minBiP=(l,r)=>(l!=null&&r!=null)?Math.min(l,r):l!=null?l:r!=null?r:null;const scoresP=[lf.deepSquat,minBiP(lf.hurdleL,lf.hurdleR),minBiP(lf.lungeL,lf.lungeR),minBiP(lf.shoulderL,lf.shoulderR),minBiP(lf.aslrL,lf.aslrR),lf.trunkStab,minBiP(lf.rotaryL,lf.rotaryR)];const validP=scoresP.filter(v=>v!=null);const completedP=validP.length;const sumP=validP.reduce((a,b)=>a+b,0);const maxP=completedP*3;const rowF=(l,v)=>v!=null?`<tr><td style="padding:4px 8px;color:#555;font-size:13px;">${l}</td><td style="padding:4px 8px;font-weight:600;font-size:13px;">${v}</td></tr>`:'';const rowFBi=(l,vl,vr)=>(vl!=null||vr!=null)?`<tr><td style="padding:4px 8px;color:#555;font-size:13px;">${l}</td><td style="padding:4px 8px;font-weight:600;font-size:13px;">${vl??'—'} / ${vr??'—'} <span style="font-size:11px;color:#888;">(min: ${minBiP(vl,vr)??'—'})</span></td></tr>`:'';return`<div class="card" style="margin-bottom:14px;"><div class="card-title">FMS — Functional Movement Screening — ${fmtDate(lf.date)}</div>${completedP>0?`<div style="margin-bottom:8px;"><span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:14px;font-weight:700;${completedP===7?`background:${sumP>14?'#dcfce7':'#fee2e2'};color:${sumP>14?'#16a34a':'#dc2626'};`:'background:#f1f5f9;color:#64748b;'}">${completedP===7?`${sumP}/21 — ${sumP>14?'Sin riesgo':'⚠ Riesgo de lesión'}`:`Incompleto — ${completedP} de 7 mov. · ${sumP}/${maxP} pts`}</span></div>`:''}<table>${rowF('Deep Squat',lf.deepSquat)}${rowFBi('Hurdle Step',lf.hurdleL,lf.hurdleR)}${rowFBi('Inline Lunge',lf.lungeL,lf.lungeR)}${rowFBi('Shoulder Mobility',lf.shoulderL,lf.shoulderR)}${rowFBi('ASLR',lf.aslrL,lf.aslrR)}${rowF('Trunk Stability PU',lf.trunkStab)}${rowFBi('Rotary Stability',lf.rotaryL,lf.rotaryR)}</table>${lf.notes?`<p style="font-size:12px;color:#666;margin-top:6px;padding:0 8px;">${lf.notes}</p>`:''}</div>`;})()}
  <div class="footer">Qoore · ${teamName} · ${TODAY}</div></body></html>`;
  const w=window.open('','_blank');w.document.write(html);w.document.close();
}

function exportCategoryCSV(){
  const cd=getCat();const stats=getStats(cd.players,cd.attendance);
  const rows=[['Jugador','Equipo','Categoría','Posición','Nacimiento','Edad','P','A','Total','%Asist','ACWR','Zona ACWR','CA (7d)','CC (4s)','Monotonía','Strain','Wellness','Peso kg','Talla cm','Σ6 pliegues','Z adiposa','Z muscular','Dif Z','Masa adip kg','Masa musc kg','SJ cm','CMJ cm','ABK cm','RSI']];
  stats.forEach(pl=>{
    const key=athleteKey(S.teamId,S.cat,pl.id);
    const a=S.athletes[key]||{};const pers=a.personal||{};
    const morphoEvals=Object.values(a.morphology||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
    const antroEvals=Object.values(a.anthropometry||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
    const testEvals=Object.values(a.jumpTests||{}).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
    const lm=morphoEvals[0]||{};const la=antroEvals[0]||{};const lt=testEvals[0]||{};
    const sf=la.skinfolds||{};
    const sfVals=[sf.triceps,sf.subscapular,sf.supraspinal,sf.abdominal,sf.thigh,sf.calf].filter(v=>v!=null);
    const suma6=sfVals.length>0?sfVals.reduce((a,b)=>a+b,0).toFixed(1):'';
    const met=calcMetrics(cd,pl.id);const az=acwrZone(met.acwr);
    const zdiff=(la.zAdip!=null&&la.zMusc!=null)?(la.zMusc-la.zAdip).toFixed(2):'';
    const rsi=lt.djHeight&&lt.djTc?((lt.djHeight/100)/(lt.djTc/1000)).toFixed(2):'';
    const age=calcAge(pers.birthdate);
    rows.push([pl.name,getTeam().name||'',getCatName(),'',pers.position||'',pers.birthdate||'',age!=null?age:'',pl.P,pl.A,pl.total,pl.pct!=null?pl.pct:'',met.acwr!=null?met.acwr:'',met.acwr!=null?az.label:'',met.ac,met.cc,met.monotony||'',met.strain||'',met.wellAvg||'',lm.weight||'',lm.height||'',suma6,la.zAdip!=null?la.zAdip:'',la.zMusc!=null?la.zMusc:'',zdiff,la.masaAdip!=null?la.masaAdip:'',la.masaMusc!=null?la.masaMusc:'',lt.sj!=null?lt.sj:'',lt.cmj!=null?lt.cmj:'',lt.abk!=null?lt.abk:'',rsi]);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`${getCatName()}_${TODAY}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function exportLoadsPDF(){
  const cd=getCat();const{from,to}=getFilterWindow();
  const filterLabel=S.loadFilter==='1d'?'Hoy':S.loadFilter==='7d'?'Últimos 7 días':S.loadFilter==='1m'?'Últimos 30 días':`${fmtDate(from)} al ${fmtDate(to)}`;
  const allM=cd.players.map(p=>({...calcMetrics(cd,p.id),id:p.id,name:p.name,periodLoad:calcPeriodLoad(cd,p.id,from,to)}));
  const acwrRisk=allM.filter(m=>m.acwr!==null&&m.acwr>1.5);
  const acwrLow=allM.filter(m=>m.acwr!==null&&m.acwr<0.8);
  const monoHigh=allM.filter(m=>m.monotony>2.0);
  const color=getCatColor();
  const rows=allM.map(m=>{const az=acwrZone(m.acwr);const mz=monoZone(m.monotony);const alerts=[];if(m.acwr>1.5)alerts.push('⚠ Riesgo');if(m.acwr!==null&&m.acwr<0.8)alerts.push('⚠ Subcarga');if(m.monotony>2.0)alerts.push('⚠ Monotonía');
    return`<tr><td style="padding:7px 10px;font-size:13px;font-weight:500;border-bottom:1px solid #f1f5f9;">${m.name}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.periodLoad>0?m.periodLoad:'—'}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.ac}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.cc}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.acwr!==null?`<span style="padding:2px 8px;border-radius:12px;background:${az.bg};color:${az.fg};font-weight:600;font-size:12px;">${m.acwr}</span>`:'—'}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;color:${mz.fg};">${m.monotony||'—'}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.strain||'—'}</td><td style="padding:7px 10px;text-align:center;border-bottom:1px solid #f1f5f9;">${m.wellAvg||'—'}</td><td style="padding:7px 10px;font-size:11px;color:#e53e3e;border-bottom:1px solid #f1f5f9;">${alerts.join(' · ')}</td></tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cargas — ${getCatName()}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#fff;padding:24px}@media print{.no-print{display:none}}table{width:100%;border-collapse:collapse;margin-top:16px}th{padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid ${color}}th:not(:first-child){text-align:center}.print-btn{margin-bottom:16px;padding:8px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit}.footer{margin-top:20px;font-size:11px;color:#aaa;text-align:center}</style></head><body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  <div style="display:flex;align-items:center;gap:12px;border-bottom:2px solid ${color};padding-bottom:12px;margin-bottom:16px;">
    <div style="width:40px;height:40px;border-radius:10px;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;">${getCatName().slice(0,2)}</div>
    <div><div style="font-size:20px;font-weight:700;">Cargas — ${getCatName()}</div><div style="font-size:13px;color:#666;">${getTeam().name} · ${filterLabel} · ${fmtDate(TODAY)}</div></div>
  </div>
  ${acwrRisk.length||acwrLow.length||monoHigh.length?`<div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#c53030;"><strong>⚠ Alertas</strong><ul style="padding-left:16px;margin-top:4px;">
    ${acwrRisk.map(m=>`<li>${m.name}: ACWR ${m.acwr} — Riesgo</li>`).join('')}
    ${acwrLow.map(m=>`<li>${m.name}: ACWR ${m.acwr} — Subcarga</li>`).join('')}
    ${monoHigh.map(m=>`<li>${m.name}: Monotonía ${m.monotony}</li>`).join('')}
  </ul></div>`:''}
  <table><thead><tr><th>Jugador</th><th>Carga período</th><th>CA (7d)</th><th>CC (4s)</th><th>ACWR</th><th>Monotonía</th><th>Strain</th><th>Wellness</th><th>Alertas</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="footer">Qoore · ${TODAY}</div></body></html>`;
  const w=window.open('','_blank');w.document.write(html);w.document.close();
}

// ── EXPORT PLAN PDF ───────────────────────────────────────────
function exportPlanPDF(planData, meta){
  // meta: { title, subtitle, teamName, catName, date, assigned }
  const blocks=Object.entries(planData.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const BLOCK_COLORS={'warmup':'#0891b2','strength':'#7c3aed','power':'#ea580c','cardio':'#16a34a','tactical':'#2563eb','cooldown':'#475569','custom':'#d97706'};
  function fmtSet(s){
    if(!s) return '<span style="color:#ccc;">—</span>';
    const type=s.type||'reps';
    const val=type==='time'?(s.time?s.time+'s':''):(s.reps||'');
    const w=s.weight?s.weight+' kg':'';
    const rir=s.rir?'RiR '+s.rir:'';
    const pct=s.pct?s.pct+'%RM':'';
    return [val,w,rir||pct].filter(Boolean).join('<br>');
  }
  const blocksHtml=blocks.map(([bid,block])=>{
    const items=Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    if(!items.length) return '';
    const maxSets=Math.max(...items.map(([,it])=>Object.keys(it.sets||{}).length),1);
    const color=BLOCK_COLORS[block.type||'custom']||'#d97706';
    const setHeaders=Array.from({length:maxSets},(_,i)=>`<th>Serie #${i+1}</th>`).join('');
    const itemRows=items.map(([,item],idx)=>{
      const sets=item.sets||{};
      const cells=Array.from({length:maxSets},(_,i)=>`<td>${fmtSet(sets[String(i)])}</td>`).join('');
      const videoUrl=(DEFAULT_EXERCISES[item.exId]||S.exercises?.personal?.[item.exId]||S.exercises?.global?.[item.exId])?.videoUrl;
      const videoLink=videoUrl?`<a class="vid-link" href="${videoUrl}" target="_blank">▶ Ver video</a>`:'';
      const rowBg=idx%2===1?'background:#fafafa;':'';
      return`<tr style="${rowBg}"><td class="ex-name">${item.exName||'Ejercicio'}${videoLink}</td>${cells}</tr>`;
    }).join('');
    return`<div class="block">
      <div class="block-head" style="border-left:4px solid ${color};">
        <span class="block-tag" style="background:${color}30;color:${color};">${(BLOCK_TYPES.find(b=>b.id===(block.type||'custom'))||{label:'BLOQUE'}).label}</span>
        <span class="block-name">${block.name||'Bloque'}</span>
      </div>
      <table>
        <thead><tr><th class="ex-col">Ejercicio</th>${setHeaders}</tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>`;
  }).join('');

  const infoLine=[meta.teamName,meta.catName,meta.date].filter(Boolean).join(' · ');
  const hasAssigned=meta.assigned&&meta.assigned!=='Sin asignar';
  const logoUrl=new URL('public/brand/logo-horizontal.png',window.location.href).href;

  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>${meta.title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#111;background:#fff;}
    .page{padding:28px 32px;}
    .print-btn{position:fixed;top:16px;right:16px;background:#f97316;color:#fff;border:none;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(249,115,22,.35);}
    @media print{.print-btn{display:none;}}
    /* Header */
    .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:2px solid #f97316;margin-bottom:18px;}
    .logo-img{height:36px;width:auto;display:block;}
    .meta-right{text-align:right;}
    .plan-title{font-size:18px;font-weight:800;color:#111;line-height:1.2;}
    .plan-sub{font-size:12px;color:#888;margin-top:4px;}
    /* Assigned */
    .assigned-row{margin-bottom:18px;}
    .assigned-badge{display:inline-flex;align-items:center;gap:6px;background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:5px 14px;font-size:12px;color:#c2410c;font-weight:500;}
    /* Blocks */
    .block{margin-bottom:22px;}
    .block-head{display:flex;align-items:center;gap:10px;margin-bottom:0;padding:9px 14px;background:#1e2530;border-radius:6px 6px 0 0;}
    .block-tag{font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.6px;text-transform:uppercase;background:rgba(255,255,255,.12);color:#fff;}
    .block-name{font-size:14px;font-weight:700;color:#fff;}
    /* Table */
    table{width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;overflow:hidden;}
    th{background:#f3f4f6;border:1px solid #e5e7eb;padding:7px 10px;text-align:center;font-weight:700;color:#f97316;font-size:11px;letter-spacing:.3px;}
    td{border:1px solid #e5e7eb;padding:8px 10px;vertical-align:middle;text-align:center;line-height:1.5;}
    .ex-col{text-align:left;width:36%;}
    .ex-name{text-align:left;font-weight:600;color:#111;vertical-align:middle;}
    .vid-link{display:inline-flex;align-items:center;gap:3px;margin-left:8px;font-size:10px;font-weight:600;color:#f97316;text-decoration:none;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:2px 7px;white-space:nowrap;vertical-align:middle;}
    /* Footer */
    .footer{margin-top:28px;padding-top:12px;border-top:1px solid #f0f0f0;font-size:11px;color:#bbb;display:flex;justify-content:space-between;align-items:center;}
    .footer-brand{font-weight:700;color:#f97316;}
    @page{margin:14mm 12mm;}
  </style></head><body>
  <button class="print-btn" onclick="window.print()">🖨 Guardar PDF</button>
  <div class="page">
    <div class="header">
      <img class="logo-img" src="${logoUrl}" alt="Qoore">
      <div class="meta-right">
        <div class="plan-title">${meta.title}</div>
        <div class="plan-sub">${infoLine||meta.subtitle||''}</div>
      </div>
    </div>
    ${hasAssigned?`<div class="assigned-row"><span class="assigned-badge">👥 ${meta.assigned}</span></div>`:''}
    ${blocksHtml}
    <div class="footer">
      <span><span class="footer-brand">Qoore</span>${meta.teamName?' · '+meta.teamName:''}${meta.catName?' · '+meta.catName:''}</span>
      <span>Generado el ${fmtDate(TODAY)}</span>
    </div>
  </div>
  </body></html>`;
  const w=window.open('','_blank');
  if(!w){showAlert('Habilitá las ventanas emergentes para exportar el PDF.');return;}
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),400);
}

// ── YOUTUBE HELPERS ───────────────────────────────────────────
function ytId(url){
  if(!url) return null;
  try{
    const u=new URL(url);
    if(u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0];
    if(u.searchParams.get('v')) return u.searchParams.get('v');
    if(u.pathname.includes('/shorts/')) return u.pathname.split('/shorts/')[1].split('?')[0];
  }catch(e){}
  return null;
}
function renderVideoModal(){
  let el=document.getElementById('app-video-modal');
  if(!el){el=document.createElement('div');el.id='app-video-modal';document.body.appendChild(el);}
  if(!S.videoModal){el.innerHTML='';return;}
  const vid=ytId(S.videoModal.url);
  if(!vid){el.innerHTML='';return;}
  el.innerHTML=`
    <div class="q-modal-backdrop" style="z-index:9980;" id="video-backdrop">
      <div class="q-modal" style="max-width:640px;padding:0;border-radius:14px;overflow:hidden;animation:q-pop-in .15s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line);">
          <span style="font-weight:600;font-size:14px;color:var(--text-0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${S.videoModal.title||'Video'}</span>
          <button id="video-close-btn" style="background:none;border:none;color:var(--text-2);cursor:pointer;font-size:20px;padding:2px 6px;border-radius:var(--r-1);flex-shrink:0;">✕</button>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;">
          <iframe id="yt-iframe"
            src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>`;
  document.getElementById('video-close-btn').onclick=closeVideoModal;
  document.getElementById('video-backdrop').onclick=e=>{if(e.target.id==='video-backdrop')closeVideoModal();};
}
function renderProgPickerModal(){
  let el=document.getElementById('app-prog-picker');
  if(!el){el=document.createElement('div');el.id='app-prog-picker';document.body.appendChild(el);}
  const grouped=Object.entries(S.programs||{}).map(([pid,p])=>{
    const days=Object.entries(p.days||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    return{pid,name:p.name,days};
  }).filter(g=>g.days.length);
  if(!grouped.length){el.innerHTML='';return;}
  const listHtml=grouped.map(g=>`
    <div style="margin-bottom:14px;">
      <div style="font-size:10px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;padding:0 2px;">${g.name}</div>
      ${g.days.map(([did,d])=>`
        <button class="q-prog-day-pick" data-action="pickprogday" data-pid="${g.pid}" data-did="${did}">
          <span style="font-size:13px;font-weight:500;color:var(--text-0);">${d.name}</span>
          <span style="font-size:11px;color:var(--text-2);">${Object.keys(d.blocks||{}).length} bloques</span>
        </button>`).join('')}
    </div>`).join('');
  el.innerHTML=`
    <div class="q-modal-backdrop" style="z-index:9990;" id="prog-picker-backdrop">
      <div class="q-modal" style="max-width:400px;padding:0;border-radius:14px;overflow:hidden;animation:q-pop-in .15s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);">
          <span style="font-weight:700;font-size:15px;">Cargar desde programa</span>
          <button id="prog-picker-close" style="background:none;border:none;color:var(--text-2);cursor:pointer;font-size:20px;padding:2px 6px;border-radius:var(--r-1);">✕</button>
        </div>
        <div style="padding:14px 18px;max-height:60vh;overflow-y:auto;">${listHtml}</div>
      </div>
    </div>`;
  document.getElementById('prog-picker-close').onclick=()=>{el.innerHTML='';};
  document.getElementById('prog-picker-backdrop').onclick=e=>{if(e.target.id==='prog-picker-backdrop')el.innerHTML='';};
  el.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',handleAction));
}
function closeProgPickerModal(){
  const el=document.getElementById('app-prog-picker');
  if(el) el.innerHTML='';
}

function closeVideoModal(){
  const iframe=document.getElementById('yt-iframe');
  if(iframe) iframe.src='';
  S.videoModal=null;
  renderVideoModal();
}

// ── UPGRADE MODAL ─────────────────────────────────────────────
function renderUpgradeModal(){
  let el=document.getElementById('app-upgrade-modal');
  if(!el){el=document.createElement('div');el.id='app-upgrade-modal';document.body.appendChild(el);}
  if(!S.upgradeModal){el.innerHTML='';return;}
  const {feature, currentTier}=S.upgradeModal;
  const neededTier=FEATURE_UPGRADE_TO[feature]||'pro';
  const neededCfg=TIER_CONFIG[neededTier]||TIER_CONFIG.pro;
  const currentCfg=TIER_CONFIG[currentTier]||TIER_CONFIG.free;
  const FEATURE_LABELS={
    maxTeams:'equipos',
    maxCategoriesPerTeam:'categorías por equipo',
    maxMembersPerTeam:'miembros del equipo',
    maxPlayersPerCategory:'jugadores por categoría',
    exportPDF:'exportar PDF',
    exportExcel:'exportar Excel',
    advancedStats:'estadísticas avanzadas',
    fullHistory:'historial completo',
    branding:'personalización de marca',
    dashboard:'dashboard avanzado',
  };
  const featureLabel=FEATURE_LABELS[feature]||feature;
  const isLimit=['maxTeams','maxCategoriesPerTeam','maxMembersPerTeam','maxPlayersPerCategory'].includes(feature);
  const msgLine=isLimit
    ? `Alcanzaste el límite de <strong>${featureLabel}</strong> del plan <strong>${currentCfg.label}</strong>.`
    : `La función <strong>${featureLabel}</strong> no está disponible en el plan <strong>${currentCfg.label}</strong>.`;
  const price=neededCfg.price?`desde $${neededCfg.price.monthly}/mes`:'';
  el.innerHTML=`
  <div class="q-modal-overlay" onclick="S.upgradeModal=null;renderUpgradeModal();">
    <div class="q-modal q-upgrade-modal" onclick="event.stopPropagation()">
      <div class="q-upgrade-modal__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <div class="q-upgrade-modal__title">Actualizar plan</div>
      <div class="q-upgrade-modal__body">${msgLine}<br>Actualizá al plan <strong>${neededCfg.label}</strong> ${price?`(${price})`:''}para desbloquear esta y más funciones.</div>
      <div class="q-upgrade-modal__tiers">
        ${['free','pro','elite'].map(tid=>{
          const tc=TIER_CONFIG[tid];
          const isCurrent=tid===currentTier;
          const isTarget=tid===neededTier;
          return `<div class="q-upgrade-tier${isCurrent?' q-upgrade-tier--current':''}${isTarget?' q-upgrade-tier--target':''}">
            <div class="q-upgrade-tier__name">${tc.label}</div>
            <div class="q-upgrade-tier__price">${tc.price?`$${tc.price.monthly}<span>/mes</span>`:'Gratis'}</div>
            ${isCurrent?'<div class="q-upgrade-tier__badge">Plan actual</div>':''}
            ${isTarget?'<div class="q-upgrade-tier__badge q-upgrade-tier__badge--target">Recomendado</div>':''}
          </div>`;
        }).join('')}
      </div>
      <div class="q-upgrade-modal__actions">
        <button class="q-upgrade-btn q-upgrade-btn--primary" onclick="S.upgradeModal=null;renderUpgradeModal();openProfile();">Ver planes</button>
        <button class="q-upgrade-btn q-upgrade-btn--ghost" onclick="S.upgradeModal=null;renderUpgradeModal();">Ahora no</button>
      </div>
    </div>
  </div>`;
}
function closeUpgradeModal(){S.upgradeModal=null;renderUpgradeModal();}

// ── SUBSCRIPTION MODAL ────────────────────────────────────────
function openSubscriptionModal(){S.subscriptionModal=true;renderSubscriptionModal();}
function renderSubscriptionModal(){
  let el=document.getElementById('app-sub-modal');
  if(!el){el=document.createElement('div');el.id='app-sub-modal';document.body.appendChild(el);}
  if(!S.subscriptionModal){el.innerHTML='';return;}
  const activeTierKey=S.betaMode?'beta':getEffectiveTier();
  const FEATURES=[
    {key:'maxTeams',          label:'Equipos',                   free:'1',      pro:'2',        elite:'Ilimitados'},
    {key:'maxCategoriesPerTeam',label:'Categorías por equipo',   free:'1',      pro:'3',        elite:'Ilimitadas'},
    {key:'maxPlayersPerCategory',label:'Jugadores por categoría',free:'10',     pro:'20',       elite:'Ilimitados'},
    {key:'maxMembersPerTeam', label:'Miembros del staff',        free:'2',      pro:'5',        elite:'Ilimitados'},
    {key:'exportPDF',         label:'Exportar PDF',              free:false,    pro:true,       elite:true},
    {key:'exportExcel',       label:'Exportar Excel',            free:false,    pro:true,       elite:true},
    {key:'advancedStats',     label:'Estadísticas avanzadas',    free:false,    pro:true,       elite:true},
    {key:'fullHistory',       label:'Historial completo',        free:false,    pro:true,       elite:true},
    {key:'branding',          label:'Marca personalizada',       free:false,    pro:false,      elite:true},
    {key:'dashboard',         label:'Dashboard avanzado',        free:false,    pro:false,      elite:true},
  ];
  const check=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  const cross=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  const tiers=[
    {key:'free',  label:'Free',  price:'Gratis',       sub:''},
    {key:'pro',   label:'Pro',   price:'$9',           sub:'/mes'},
    {key:'elite', label:'Elite', price:'$25',          sub:'/mes'},
  ];
  const betaBanner = S.betaMode
    ? `<div class="q-sub-beta-banner">Beta abierta — acceso Elite para todos, sin costo.</div>`
    : '';
  const cols=tiers.map(t=>{
    const isActive = S.betaMode ? t.key==='elite' : t.key===activeTierKey;
    return `<div class="q-sub-col${isActive?' q-sub-col--active':''}">
      <div class="q-sub-col__name">${t.label}</div>
      <div class="q-sub-col__price">${t.price}<span>${t.sub}</span></div>
      ${isActive?`<div class="q-sub-col__badge">${S.betaMode&&t.key==='elite'?'Beta':'Plan actual'}</div>`:'<div class="q-sub-col__badge" style="opacity:0">·</div>'}
    </div>`;
  }).join('');
  const rows=FEATURES.map((f,i)=>{
    const vals=[f.free, f.pro, f.elite];
    const cells=vals.map((v,j)=>{
      const isActive=S.betaMode?j===2:(tiers[j].key===activeTierKey);
      const cell = typeof v==='boolean' ? (v?check:cross) : `<span style="font-size:12px;font-weight:500;color:${isActive?'var(--text-0)':'var(--text-2)'}">${v}</span>`;
      return `<td class="q-sub-td${isActive?' q-sub-td--active':''}">${cell}</td>`;
    }).join('');
    return `<tr class="${i%2===0?'q-sub-tr--even':''}"><td class="q-sub-td q-sub-td--label">${f.label}</td>${cells}</tr>`;
  }).join('');
  el.innerHTML=`
  <div class="q-modal-overlay" onclick="S.subscriptionModal=null;renderSubscriptionModal();">
    <div class="q-modal q-sub-modal" onclick="event.stopPropagation()">
      <div class="q-sub-modal__head">
        <div class="q-sub-modal__title">Planes de suscripción</div>
        <button class="q-modal__close" onclick="S.subscriptionModal=null;renderSubscriptionModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      ${betaBanner}
      <div class="q-sub-cols">${cols}</div>
      <div class="q-sub-table-wrap">
        <table class="q-sub-table">
          <thead><tr><th class="q-sub-th q-sub-th--label">Función</th><th class="q-sub-th">Free</th><th class="q-sub-th">Pro</th><th class="q-sub-th">Elite</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="q-sub-footer">
        <button class="q-upgrade-btn q-upgrade-btn--ghost" onclick="S.subscriptionModal=null;renderSubscriptionModal();">Cerrar</button>
      </div>
    </div>
  </div>`;
}

// ── CUSTOM DIALOGS ────────────────────────────────────────────
function showConfirm(msg, cb){
  S.confirmModal={msg,cb};
  _renderConfirmOverlay();
}
function _renderConfirmOverlay(){
  let el=document.getElementById('app-confirm-overlay');
  if(!el){el=document.createElement('div');el.id='app-confirm-overlay';document.body.appendChild(el);}
  if(!S.confirmModal){el.innerHTML='';return;}
  el.innerHTML=`
    <div class="q-modal-backdrop" style="z-index:9990;">
      <div class="q-modal" style="max-width:360px;padding:0;border-radius:14px;overflow:hidden;animation:q-pop-in .15s ease;">
        <div style="padding:22px 22px 14px;font-size:14px;color:var(--text-1);line-height:1.6;">${S.confirmModal.msg}</div>
        <div style="padding:10px 22px 20px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="q-btn" id="confirm-cancel-btn" style="min-width:88px;">Cancelar</button>
          <button class="q-btn" id="confirm-ok-btn" style="min-width:88px;background:var(--bad);color:#fff;border-color:var(--bad);">Aceptar</button>
        </div>
      </div>
    </div>`;
  document.getElementById('confirm-cancel-btn').onclick=()=>{S.confirmModal=null;_renderConfirmOverlay();};
  document.getElementById('confirm-ok-btn').onclick=()=>{const cb=S.confirmModal?.cb;S.confirmModal=null;_renderConfirmOverlay();if(cb)cb();};
}
function showAlert(msg){
  let el=document.getElementById('app-toast');
  if(!el){el=document.createElement('div');el.id='app-toast';document.body.appendChild(el);}
  el.innerHTML=`<div class="q-toast">${msg}</div>`;
  clearTimeout(el._t);
  el._t=setTimeout(()=>{el.innerHTML='';},3500);
}

// ── EVENTS ────────────────────────────────────────────────────
// ── Logo upload ───────────────────────────────────────────────
function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 80; canvas.height = 80;
      const ctx = canvas.getContext('2d');
      // Cover crop
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 80, 80);
      S.pendingLogo = canvas.toDataURL('image/jpeg', 0.65);
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleSidebarSearch(val){S.searchQuery=val;if(val.length>1){if(S.view!=='search'){S.prevView=S.view;S.prevTeamId=S.teamId;S.prevCat=S.cat;S.searchReturnView=S.view;S.searchReturnTeamId=S.teamId;}S.view='search';render();}else if(val.length===0&&S.view==='search'){S.view=S.searchReturnView||S.prevView||'home';S.teamId=S.searchReturnTeamId||S.prevTeamId||S.teamId;render();}}
function attachEvents(){
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',handleAction));
  document.onkeydown=e=>{if(e.key==='Escape'&&S.videoModal){closeVideoModal();return;}if(e.key==='Escape'&&document.getElementById('app-prog-picker')?.innerHTML){closeProgPickerModal();return;}if(e.key==='Escape'&&S.view==='search'){S.view=S.searchReturnView||S.prevView||'home';S.teamId=S.searchReturnTeamId||S.prevTeamId||S.teamId;S.searchReturnView=null;S.searchReturnTeamId=null;const ssi=document.getElementById('sidebar-search-input');if(ssi){ssi.value='';S.searchQuery='';}render();}if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openSearch();}};
  const di=document.getElementById('date-input');
  if(di)di.addEventListener('change',e=>{S.date=e.target.value;loadSession();if(S.tab==='session'){loadSessionDraft();if(S.sessionSub==='plan'){S.sessionPlans={};loadSessionPlans().then(()=>render());return;}}render();});
  const durI=document.getElementById('dur-input');
  if(durI)durI.addEventListener('input',e=>{S.sessionDraft.duration=e.target.value;});
  document.querySelectorAll('.q-pdur-input').forEach(inp=>{
    inp.addEventListener('input',e=>{
      const pid=e.target.dataset.pid,val=parseInt(e.target.value);
      if(!isNaN(val)&&val>0)S.sessionDraft.playerDuration[pid]=val;
      else delete S.sessionDraft.playerDuration[pid];
    });
  });
  const ssi=document.getElementById('sidebar-search-input');
  if(ssi)ssi.addEventListener('keydown',e=>{if(e.key==='Escape'){ssi.value='';handleSidebarSearch('');ssi.blur();}});
  const ni=document.getElementById('new-player');
  if(ni)ni.addEventListener('keydown',e=>{if(e.key==='Enter')addPlayer();});
  const djh=document.getElementById('af-djh');
  if(djh)djh.addEventListener('input',updateRsiPreview);
  setTimeout(initCharts,80);
  updateMobTabBar();
}

async function handleAction(e){
  const el=e.currentTarget, a=el.dataset.action;
  e.stopPropagation();
  if(a==='cancelprofile'){S.profileView=false;render();}
  else if(a==='saveprofile'){
    S.userProfile={
      nombre:document.getElementById('pf-nombre')?.value.trim()||'',
      apellido:document.getElementById('pf-apellido')?.value.trim()||'',
      pais:document.getElementById('pf-pais')?.value||'',
      rol:document.getElementById('pf-rol')?.value||'',
      club:document.getElementById('pf-club')?.value.trim()||'',
      licencia:document.getElementById('pf-licencia')?.value.trim()||''
    };
    setSyncBar('saving');
    try{await db.ref(`users/${currentUser.uid}/profile`).set(S.userProfile);setSyncBar('ok');}catch(e){setSyncBar('error','Error al guardar el perfil');}
    render();
  }
  // NAVIGATION
  if(a==='home'){S.view='home';S.teamFormMode=null;S.catFormMode=null;render();}
  else if(a==='openteam'){S.teamId=el.dataset.tid;S.view='team';S.teamFormMode=null;S.catFormMode=null;render();}
  else if(a==='opencat'){if(el.dataset.tid)S.teamId=el.dataset.tid;S.cat=el.dataset.cid;S.lastCatTid=S.teamId;S.lastCatCid=S.cat;S.view='cat';S.tab='attend';S.date=TODAY;loadSession();loadSessionDraft();render();}
  else if(a==='backtoTeam'){S.view='team';S.catFormMode=null;S.teamFormMode=null;render();}
  else if(a==='backfromathlete'){
    if(S.prevView==='search'){S.view='search';render();}
    else if(S.prevCat){S.teamId=S.prevTeamId||S.teamId;S.cat=S.prevCat;S.view='cat';render();}
    else if(S.prevTeamId){S.teamId=S.prevTeamId;S.view='team';render();}
    else{S.view='home';render();}
    S.athleteForm=null;
  }
  else if(a==='tab'){S.tab=el.dataset.tab;if(S.tab==='attend')loadSession();if(S.tab==='session'){loadSessionDraft();S.sessionPlans={};loadSessionPlans().then(()=>render());return;}if(S.tab==='medico'){S.medInjuries={};S.medRegion='';loadMedical();return;}render();}
  else if(a==='reportsub'){S.reportSub=el.dataset.sub;render();}
  else if(a==='reportplayerpid'){S.reportPlayerPid=el.dataset.pid;render();}
  else if(a==='prevreportweek'){S.reportWeekOffset=(S.reportWeekOffset||0)-1;render();}
  else if(a==='nextreportweek'){S.reportWeekOffset=(S.reportWeekOffset||0)+1;render();}
  else if(a==='sessionsub'){S.sessionSub=el.dataset.sub;if(el.dataset.sub==='plan'){S.sessionPlans={};loadSessionPlans().then(()=>render());}else render();}
  else if(a==='rpemode'){S.rpeMode=el.dataset.mode;render();}
  else if(a==='sessiontype'){S.sessionDraft.sessionType=el.dataset.type;render();}
  else if(a==='cancelsearch'){S.view=S.searchReturnView||S.prevView||'home';S.teamId=S.searchReturnTeamId||S.prevTeamId||S.teamId;S.searchReturnView=null;S.searchReturnTeamId=null;render();}
  // ATTENDANCE
  else if(a==='setstatus'){S.sess[el.dataset.pid]=el.dataset.status;render();}
  else if(a==='setabsencereason'){S.absenceReasons[el.dataset.pid]=el.dataset.reason;render();}
  else if(a==='allp'){getCat().players.forEach(p=>S.sess[p.id]='P');render();}
  else if(a==='alla'){getCat().players.forEach(p=>S.sess[p.id]='A');render();}
  else if(a==='prevday'){const d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()-1);S.date=d.toISOString().split('T')[0];loadSession();if(S.tab==='session'){loadSessionDraft();if(S.sessionSub==='plan'){S.sessionPlans={};loadSessionPlans().then(()=>render());return;}}render();}
  else if(a==='nextday'){if(S.date>=TODAY)return;const d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()+1);S.date=d.toISOString().split('T')[0];loadSession();if(S.tab==='session'){loadSessionDraft();if(S.sessionSub==='plan'){S.sessionPlans={};loadSessionPlans().then(()=>render());return;}}render();}
  else if(a==='save'){await saveAttendance();}
  // SESSION
  else if(a==='teamrpe'){S.sessionDraft.teamRPE=parseInt(el.dataset.rpe);render();}
  else if(a==='expandrpe'){if(!S.rpeExpand)S.rpeExpand={};S.rpeExpand[el.dataset.pid]=true;render();}
  else if(a==='playerrpe'){const _pid=el.dataset.pid;S.sessionDraft.playerRPE[_pid]=parseInt(el.dataset.rpe);if(S.rpeExpand)delete S.rpeExpand[_pid];render();}
  else if(a==='wellness'){const pid=el.dataset.pid,key=el.dataset.key,val=parseInt(el.dataset.val);if(!S.wellnessDraft[pid])S.wellnessDraft[pid]={};S.wellnessDraft[pid][key]=val;render();}
  else if(a==='togglewellness'){S.wellnessExpanded[el.dataset.pid]=!S.wellnessExpanded[el.dataset.pid];render();}
  else if(a==='savesession'){const durI=document.getElementById('dur-input');if(durI)S.sessionDraft.duration=durI.value;await saveSessionDraft();render();const msg=document.getElementById('sess-save-msg');if(msg){msg.textContent='✓ Guardado';setTimeout(()=>{if(msg)msg.textContent='';},2500);}}
  // ROSTER
  else if(a==='addplayer'){await addPlayer();}
  else if(a==='startdel'){S.confirmDel=el.dataset.pid;render();}
  else if(a==='canceldel'){S.confirmDel=null;render();}
  else if(a==='confirmdel'){
    const pid=el.dataset.pid; const cd=getCat();
    cd.players=cd.players.filter(p=>p.id!==pid);
    const na={};Object.entries(cd.attendance).forEach(([d,r])=>{const c={...r};delete c[pid];na[d]=c;});cd.attendance=na;
    Object.values(cd.sessions||{}).forEach(sess=>{if(sess.playerRPE)delete sess.playerRPE[pid];if(sess.wellness)delete sess.wellness[pid];});
    S.confirmDel=null;await persistCat();render();
  }
  else if(a==='starteditm'){
    S.editingMember=el.dataset.uid;
    S.editMemberForm={
      role: el.dataset.role||'editor',
      permissions: JSON.parse(el.dataset.perms||'{}')
    };
    render();
  }
  else if(a==='canceleditm'){ S.editingMember=null; render(); }
  else if(a==='seditmerole'){
    S.editMemberForm.role=el.dataset.val;
    render();
  }
  else if(a==='seteditmperm'){
    if(!S.editMemberForm.permissions) S.editMemberForm.permissions={};
    S.editMemberForm.permissions[el.dataset.cid]=el.dataset.val;
    render();
  }
  else if(a==='savememberchanges'){
    const tid=el.dataset.tid, uid=el.dataset.uid;
    const {role, permissions}=S.editMemberForm;
    // Write ALL categories explicitly — unclicked ones default to 'edit' for editors
    // Omit 'none' (absence = no access in canView)
    const cats=Object.keys(S.teams[tid]?.categories||{});
    const explicit={};
    cats.forEach(cid=>{
      const p=(permissions||{})[cid]||'edit';
      if(p!=='none') explicit[cid]=p;
    });
    await updateMemberPermissions(tid, uid, role, explicit);
  }
  else if(a==='markread'){ await markNotifsRead(el.dataset.tid||S.teamId); render(); }
  else if(a==='copyinvlink'){
    const link=el.dataset.link;
    try{ await navigator.clipboard.writeText(link); showAlert('Link copiado ✓'); }
    catch(e){ showAlert('No se pudo copiar. Link: '+link); }
  }
  else if(a==='revokeinvite'){ await revokeInvite(el.dataset.tid||S.teamId, el.dataset.token); }
  else if(a==='resendtoinvite'){
    const tid=el.dataset.tid||S.teamId;
    const email=el.dataset.email;
    const role=el.dataset.role||'editor';
    const perms=JSON.parse(el.dataset.perms||'{}');
    // Find and revoke old token first
    const old=(S.teamInvites[tid]||[]).find(i=>i.invitedEmail===email);
    if(old) await db.ref().update({[`invitations/${old.token}/status`]:'revoked',[`teams/${tid}/pendingInvites/${old.token}`]:null});
    try{
      const token=await createInvitation(tid,email,role,perms);
      const link=`${window.location.origin}${window.location.pathname}?invite=${token}`;
      await loadTeamMembers(tid);
      render();
      try{ await navigator.clipboard.writeText(link); showAlert('Nueva invitación generada y copiada ✓'); }
      catch(e){ showAlert('Nueva invitación generada. No se pudo copiar automáticamente.'); }
    }catch(e){ showAlert('Error al regenerar invitación.'); }
  }
  // PERMISSIONS & INVITATIONS
  else if(a==='toggleaccess'){
    S.accessPanel=!S.accessPanel; S.inviteLink=null; S.inviteForm={role:'editor',permissions:{},email:''};
    if(S.accessPanel) await loadTeamMembers(S.teamId||el.dataset.tid);
    render();
  }
  else if(a==='setinviterole'){
    // Preserve typed email before re-render
    const emailEl=document.getElementById('inv-email');
    if(emailEl) S.inviteForm.email=emailEl.value;
    S.inviteForm.role=el.dataset.val;
    render();
  }
  else if(a==='setcatperm'){
    // Preserve typed email before re-render
    const emailEl=document.getElementById('inv-email');
    if(emailEl) S.inviteForm.email=emailEl.value;
    const cid=el.dataset.cid, val=el.dataset.val;
    if(!S.inviteForm.permissions) S.inviteForm.permissions={};
    S.inviteForm.permissions[cid]=val;
    render();
  }
  else if(a==='sendinvite'){
    const tid=el.dataset.tid||S.teamId;
    const _memberCheck=canInviteMember(tid);
    if(!_memberCheck.ok){S.upgradeModal={feature:'maxMembersPerTeam',currentTier:_memberCheck.tier};render();return;}
    const emailEl=document.getElementById('inv-email');
    if(emailEl) S.inviteForm.email=emailEl.value;
    const email=(S.inviteForm.email||'').trim();
    if(!email){showAlert('Ingresá el email del invitado.');return;}
    const {role,permissions}=S.inviteForm;
    // Filter out 'none' permissions
    const filteredPerms={};
    Object.entries(permissions||{}).forEach(([cid,p])=>{if(p!=='none')filteredPerms[cid]=p;});
    try{
      const token=await createInvitation(tid,email,role,filteredPerms);
      const link=`${window.location.origin}${window.location.pathname}?invite=${token}`;
      S.inviteLink=link;
      render();
    }catch(err){showAlert('Error al crear invitación: '+err.message);}
  }
  else if(a==='copyinvitelink'){
    if(S.inviteLink){
      try{await navigator.clipboard.writeText(S.inviteLink);showAlert('Link copiado al portapapeles ✓');}
      catch(e){showAlert('No se pudo copiar automáticamente.');}
    }
  }
  else if(a==='revokeaccess'){
    await revokeAccess(el.dataset.tid||S.teamId, el.dataset.muid);
  }
  else if(a==='acceptinvite'){ await acceptInvitation(); }
  else if(a==='dismissinvite'){
    S.pendingInvite=null; S.pendingInviteData=null; S.showInviteModal=false;
    window.history.replaceState({},'',window.location.pathname);
    render();
  }
  // TEAM MANAGEMENT
  else if(a==='newteam'){S.teamFormMode='new';S.editingTeamId=null;render();}
  else if(a==='editteam'){S.teamFormMode='edit';S.editingTeamId=S.teamId;render();}
  else if(a==='cancelteamform'){S.teamFormMode=null;S.editingTeamId=null;S.pendingLogo=null;render();}
  else if(a==='savenewteam'){
    const name=document.getElementById('tf-name')?.value.trim();
    const sport=document.getElementById('tf-sport')?.value||'Básquetbol';
    if(!name){showAlert('Ingresá un nombre para el equipo.');return;}
    const _teamCheck=canCreateTeam();
    if(!_teamCheck.ok){S.upgradeModal={feature:'maxTeams',currentTier:_teamCheck.tier};S.teamFormMode=null;render();return;}
    const tid='team_'+Date.now();
    const newTeam={name,sport,createdAt:TODAY,ownerId:currentUser.uid,categories:{},
      subscription:{tier:'free',status:'active',manualOverride:false,overrideReason:null,overrideBy:null}};
    if(S.pendingLogo) newTeam.logo=S.pendingLogo;
    S.pendingLogo=null;
    // Optimistically update in-memory state
    S.teams[tid]=newTeam;
    S.memberships[tid]={role:'owner',permissions:{},joinedAt:TODAY};
    // Close form immediately — don't wait on Firebase
    S.teamFormMode=null; S.teamId=tid; S.view='team'; render();
    // Write membership FIRST so the team write rule passes, then team data
    try {
      await db.ref(`users/${currentUser.uid}/memberships/${tid}`).set({role:'owner',permissions:{},joinedAt:TODAY});
      await db.ref(`teams/${tid}`).set(newTeam);
      setSyncBar('ok');
    } catch(e) {
      console.error('Error saving team:',e);
      setSyncBar('error','Error al crear el equipo');
      // Data stays in memory so the session works; will retry on next loadAll
    }
  }
  else if(a==='saveeditteam'){
    const name=document.getElementById('tf-name')?.value.trim();
    const sport=document.getElementById('tf-sport')?.value||'Básquetbol';
    if(!name){showAlert('Ingresá un nombre.');return;}
    const tid=S.editingTeamId||S.teamId;
    S.teams[tid].name=name; S.teams[tid].sport=sport;
    if(S.pendingLogo){S.teams[tid].logo=S.pendingLogo; S.pendingLogo=null;}
    // Close form immediately
    S.teamFormMode=null; S.editingTeamId=null; render();
    try { await persistTeam(tid); } catch(e){ setSyncBar('error','Error al guardar el equipo'); }
  }
  else if(a==='deleteteam'){
    const tid=el.dataset.tid;
    if(!isOwner(tid)){showAlert('Solo el dueño puede eliminar el equipo.');return;}
    const teamName=S.teams[tid]?.name||'este equipo';
    showConfirm(`¿Eliminar el equipo "${teamName}"? Esta acción no se puede deshacer.`, async()=>{
      delete S.teams[tid]; delete S.memberships[tid];
      S.view='home'; S.teamId=null; S.teamFormMode=null; S.accessPanel=false; render();
      try {
        await db.ref(`teams/${tid}`).remove();
        await db.ref(`users/${currentUser.uid}/memberships/${tid}`).remove();
      } catch(e){ console.error('Error deleting team:',e); setSyncBar('error','Error al eliminar el equipo'); }
    });
  }
  else if(a==='leaveteam'){
    const tid=el.dataset.tid;
    if(isOwner(tid)){showAlert('El dueño no puede salir del equipo. Eliminalo desde el formulario de edición.');return;}
    showConfirm('¿Salir de este equipo? Perderás el acceso.', async()=>{
      delete S.teams[tid]; delete S.memberships[tid];
      render();
      try{
        await db.ref(`users/${currentUser.uid}/memberships/${tid}`).remove();
        await db.ref(`teams/${tid}/memberIndex/${currentUser.uid}`).remove();
        await db.ref(`teams/${tid}/memberPermissions/${currentUser.uid}`).remove();
      }catch(e){console.error('Error leaving team:',e);setSyncBar('error','Error al salir del equipo');}
    });
  }
  // CATEGORY MANAGEMENT
  else if(a==='newcat'){S.catFormMode='new';S.editingCatId=null;render();}
  else if(a==='editcurrentcat'){S.catFormMode='edit';S.editingCatId=S.cat;S.view='team';render();}
  else if(a==='cancelcatform'){S.catFormMode=null;S.editingCatId=null;render();}
  else if(a==='savenewcat'){
    const name=document.getElementById('cf-name')?.value.trim();
    if(!name){showAlert('Ingresá un nombre para la categoría.');return;}
    const _catCheck=canCreateCategory();
    if(!_catCheck.ok){S.upgradeModal={feature:'maxCategoriesPerTeam',currentTier:_catCheck.tier};S.catFormMode=null;render();return;}
    const cid='cat_'+Date.now();
    const colorIdx=getCats().length%CAT_PALETTE.length;
    if(!S.teams[S.teamId].categories)S.teams[S.teamId].categories={};
    S.teams[S.teamId].categories[cid]={name,color:CAT_PALETTE[colorIdx],players:[],attendance:{},sessions:{}};
    S.catFormMode=null; render();
    try { await persistTeam(S.teamId); } catch(e){ setSyncBar('error','Error al crear la categoría'); }
  }
  else if(a==='saveeditcat'){
    const name=document.getElementById('cf-name')?.value.trim();
    if(!name){showAlert('Ingresá un nombre.');return;}
    const cid=S.editingCatId;
    if(S.teams[S.teamId].categories[cid])S.teams[S.teamId].categories[cid].name=name;
    S.catFormMode=null; S.editingCatId=null; render();
    try { await persistTeam(S.teamId); } catch(e){ setSyncBar('error','Error al guardar la categoría'); }
  }
  else if(a==='deletecat'){
    const tid=S.teamId;const cid=el.dataset.cid;
    if(!isOwner(tid)){showAlert('Solo el dueño puede eliminar categorías.');return;}
    const catName=S.teams[tid]?.categories?.[cid]?.name||'esta categoría';
    showConfirm(`¿Eliminar "${catName}"? Se perderán todos sus datos (asistencia, sesiones, atletas).`, async()=>{
      const prefix=`${tid}__${cid}__`;
      const athleteKeys=Object.keys(S.athletes).filter(k=>k.startsWith(prefix));
      athleteKeys.forEach(k=>delete S.athletes[k]);
      delete S.teams[tid].categories[cid];
      if(S.cat===cid)S.cat=null;
      S.catFormMode=null;S.editingCatId=null;render();
      try{
        await db.ref(`teams/${tid}/categories/${cid}`).remove();
        await Promise.all(athleteKeys.map(k=>db.ref(`teams/${tid}/athletes/${k}`).remove()));
      }catch(e){console.error('Error deleting cat:',e);setSyncBar('error','Error al eliminar la categoría');}
    });
  }
  // ATHLETE
  else if(a==='openathlete'){
    const tid=el.dataset.tid||S.teamId;
    const cid=el.dataset.cid||S.cat;
    const pid=el.dataset.pid;
    S.prevView=S.view;S.prevTeamId=S.teamId;S.prevCat=S.cat;
    S.teamId=tid;S.cat=cid;
    S.athleteKey=athleteKey(tid,cid,pid);
    S.athleteTab='perfil';S.athleteForm=null;S.view='athlete';render();
  }
  else if(a==='athletetab'){S.athleteTab=el.dataset.tab;S.athleteForm=null;render();}
  else if(a==='editperfil'){S.athleteForm='perfil';render();}
  else if(a==='newmorfo'){S.athleteForm='morfo';render();}
  else if(a==='newantro'){S.athleteForm='antro';render();}
  else if(a==='newtests'){S.athleteForm='tests';render();}
  else if(a==='newfmseval'){S.athleteForm='fms';render();}
  else if(a==='cancelathleteform'){S.athleteForm=null;S.editingEvalId=null;render();}
  else if(a==='starttransfer'){S.athleteForm='transfer';render();}
  else if(a==='saveperfilform'){
    const [tid,cid,pid]=S.athleteKey.split('__');
    const ath=getAthlete(S.athleteKey);
    ath.personal={birthdate:document.getElementById('af-birthdate')?.value||'',position:document.getElementById('af-position')?.value||'',number:document.getElementById('af-number')?.value||'',laterality:document.getElementById('af-laterality')?.value||'',phone:document.getElementById('af-phone')?.value||'',documento:document.getElementById('af-documento')?.value||'',mutualista:document.getElementById('af-mutualista')?.value||'',notes:document.getElementById('af-notes')?.value||''};
    const newName=document.getElementById('af-playername')?.value?.trim();
    if(newName&&S.teams[tid]?.categories?.[cid]){
      const players=S.teams[tid].categories[cid].players;
      const idx=players.findIndex(p=>p.id===pid);if(idx>=0)players[idx].name=newName;
      await persistCat(tid,cid);
    }
    S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='confirmtransfer'){
    const [oldTid,oldCid,pid]=S.athleteKey.split('__');
    const targetVal=document.getElementById('af-targetcat')?.value;
    if(!targetVal)return;
    const[newTid,newCid]=targetVal.split('__');
    const player=(S.teams[oldTid]?.categories?.[oldCid]?.players||[]).find(p=>p.id===pid);
    if(!player)return;
    const newPid=Date.now().toString();
    if(!S.teams[newTid].categories[newCid].players)S.teams[newTid].categories[newCid].players=[];
    S.teams[newTid].categories[newCid].players.push({id:newPid,name:player.name});
    const newKey=athleteKey(newTid,newCid,newPid);
    S.athletes[newKey]=JSON.parse(JSON.stringify(S.athletes[S.athleteKey]||{}));
    S.teams[oldTid].categories[oldCid].players=S.teams[oldTid].categories[oldCid].players.filter(p=>p.id!==pid);
    await persistCat(oldTid,oldCid);await persistCat(newTid,newCid);
    await saveAthlete(newKey);
    try{const _tid=S.athleteKey.split('__')[0];await db.ref(`teams/${_tid}/athletes/${S.athleteKey}`).remove();}catch(e){}
    delete S.athletes[S.athleteKey];
    S.teamId=newTid;S.cat=newCid;S.athleteKey=newKey;S.athleteForm=null;render();
  }
  else if(a==='savemorfoform'){
    const ath=getAthlete(S.athleteKey);const id=S.editingEvalId||Date.now().toString();S.editingEvalId=null;
    const g=k=>{const v=parseFloat(document.getElementById(k)?.value);return isNaN(v)?null:v;};
    const ev={date:document.getElementById('af-date')?.value||TODAY,weight:g('af-weight'),height:g('af-height'),sittingH:g('af-sittingH'),wingspan:g('af-wingspan'),reach:g('af-reach')};
    Object.keys(ev).forEach(k=>{if(ev[k]===null)delete ev[k];});
    ath.morphology[id]=ev;S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='saveantroform'){
    const ath=getAthlete(S.athleteKey);const id=S.editingEvalId||Date.now().toString();S.editingEvalId=null;
    const g=k=>{const v=parseFloat(document.getElementById(k)?.value);return isNaN(v)?null:v;};
    const ev={date:document.getElementById('af-date')?.value||TODAY,
      skinfolds:{triceps:g('af-tri'),subscapular:g('af-sub'),supraspinal:g('af-sup'),abdominal:g('af-abd'),thigh:g('af-thigh'),calf:g('af-calf')},
      perimeters:{armR:g('af-pArmR'),armF:g('af-pArmF'),forearm:g('af-pFore'),chest:g('af-pChest'),waist:g('af-pWaist'),hips:g('af-pHips'),thighU:g('af-pThighU'),thighM:g('af-pThighM'),calf:g('af-pCalf')},
      diameters:{biacr:g('af-dBiacr'),chestT:g('af-dChest'),biili:g('af-dBiili'),humer:g('af-dHum'),femor:g('af-dFem')},
      masaAdip:g('af-madipkg'),masaMusc:g('af-mmuskg'),masaOsea:g('af-moseakg'),zAdip:g('af-zadip'),zMusc:g('af-zmusc'),skinfoldSum:g('af-skinfoldSum'),imoManual:g('af-imoManual')};
    ['skinfolds','perimeters','diameters'].forEach(sec=>{Object.keys(ev[sec]).forEach(k=>{if(ev[sec][k]===null)delete ev[sec][k];});});
    ['masaAdip','masaMusc','masaOsea','zAdip','zMusc','skinfoldSum','imoManual'].forEach(k=>{if(ev[k]===null)delete ev[k];});
    ath.anthropometry[id]=ev;S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='savetestsform'){
    const ath=getAthlete(S.athleteKey);const id=S.editingEvalId||Date.now().toString();S.editingEvalId=null;
    const g=k=>{const v=parseFloat(document.getElementById(k)?.value);return isNaN(v)?null:v;};
    const ev={date:document.getElementById('af-date')?.value||TODAY,sj:g('af-sj'),cmj:g('af-cmj'),abk:g('af-abk'),abkRight:g('af-abkr'),abkLeft:g('af-abkl'),djHeight:g('af-djh'),djTc:g('af-djtc'),notes:document.getElementById('af-notes')?.value||''};
    Object.keys(ev).forEach(k=>{if(ev[k]===null||ev[k]==='')delete ev[k];});
    ath.jumpTests[id]=ev;S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='delevalmorpho'){const evid=el.dataset.evid;showConfirm('¿Eliminar esta evaluación?',async()=>{const ath=getAthlete(S.athleteKey);delete ath.morphology[evid];await saveAthlete(S.athleteKey);render();});}
  else if(a==='delevalantro'){const evid=el.dataset.evid;showConfirm('¿Eliminar esta evaluación?',async()=>{const ath=getAthlete(S.athleteKey);delete ath.anthropometry[evid];await saveAthlete(S.athleteKey);render();});}
  else if(a==='delevaltests'){const evid=el.dataset.evid;showConfirm('¿Eliminar esta evaluación?',async()=>{const ath=getAthlete(S.athleteKey);delete ath.jumpTests[evid];await saveAthlete(S.athleteKey);render();});}
  else if(a==='savefmsform'){
    const ath=getAthlete(S.athleteKey);const id=S.editingEvalId||Date.now().toString();S.editingEvalId=null;
    const gi=k=>{const v=parseInt(document.getElementById(k)?.value);return isNaN(v)?null:v;};
    const ev={date:document.getElementById('fms-date')?.value||TODAY,deepSquat:gi('fms-ds'),hurdleL:gi('fms-hsl'),hurdleR:gi('fms-hsr'),lungeL:gi('fms-lul'),lungeR:gi('fms-lur'),shoulderL:gi('fms-sml'),shoulderR:gi('fms-smr'),aslrL:gi('fms-asl'),aslrR:gi('fms-asr'),trunkStab:gi('fms-ts'),rotaryL:gi('fms-rsl'),rotaryR:gi('fms-rsr'),notes:document.getElementById('fms-notes')?.value||''};
    Object.keys(ev).forEach(k=>{if(ev[k]===null||ev[k]==='')delete ev[k];});
    ath.fmsTests[id]=ev;S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='delevalfms'){const evid=el.dataset.evid;showConfirm('¿Eliminar esta evaluación?',async()=>{const ath=getAthlete(S.athleteKey);delete ath.fmsTests[evid];await saveAthlete(S.athleteKey);render();});}
  else if(a==='editevalmorfo'){S.athleteForm='morfo';S.editingEvalId=el.dataset.evid;render();}
  else if(a==='editevalantro'){S.athleteForm='antro';S.editingEvalId=el.dataset.evid;render();}
  else if(a==='editevaltests'){S.athleteForm='tests';S.editingEvalId=el.dataset.evid;render();}
  else if(a==='editevalfms'){S.athleteForm='fms';S.editingEvalId=el.dataset.evid;render();}
  // LOAD FILTER
  else if(a==='loadfilter'){S.loadFilter=el.dataset.val;if(el.dataset.val!=='custom'){S.loadFrom='';S.loadTo='';}render();}
  else if(a==='applycustomfilter'){S.loadFrom=document.getElementById('load-from')?.value||TODAY;S.loadTo=document.getElementById('load-to')?.value||TODAY;render();}
  // EXPORTS
  else if(a==='exportathletepdf'){exportAthletePDF();}
  else if(a==='exportcategorycsv'){exportCategoryCSV();}
  else if(a==='exportloadspdf'){exportLoadsPDF();}
  // MÉDICO / LESIONES
  else if(a==='medfilter'){S.medFilter=el.dataset.val;render();}
  else if(a==='medclearregion'){S.medRegion='';render();}
  else if(a==='openinjuryform'){S.injForm={data:{severity:1,status:'activa',date:TODAY}};render();}
  else if(a==='closeinjuryform'){S.injForm=null;render();}
  else if(a==='injsev'){if(S.injForm){
    if(!S.injForm.data)S.injForm.data={};
    const pid=document.getElementById('inj-player')?.value;if(pid!==undefined)S.injForm.data._pid=pid;
    S.injForm.data.region=document.getElementById('inj-region')?.value||S.injForm.data.region||'';
    S.injForm.data.date=document.getElementById('inj-date')?.value||S.injForm.data.date||TODAY;
    S.injForm.data.type=document.getElementById('inj-type')?.value||S.injForm.data.type||'';
    S.injForm.data.mechanism=document.getElementById('inj-mech')?.value||S.injForm.data.mechanism||'';
    S.injForm.data.status=document.getElementById('inj-status')?.value||S.injForm.data.status||'activa';
    S.injForm.data.notes=document.getElementById('inj-notes')?.value||S.injForm.data.notes||'';
    S.injForm.data.severity=parseInt(el.dataset.val);
    render();
  }}
  else if(a==='saveinjury'){await saveInjury();}
  else if(a==='editinjury'){
    const ak=el.dataset.ak,ikey=el.dataset.ikey;
    const injData=S.medInjuries[ak]?.[ikey]||{};
    S.injForm={ak,ikey,data:{...injData}};render();
  }
  else if(a==='deleteinjury'){await deleteInjury(el.dataset.ak,el.dataset.ikey);}
  // ── MY EXERCISES LIBRARY ──────────────────────────────────────
  else if(a==='showvideo'){
    const exid=el.dataset.exid;
    const ex=S.exercises.personal[exid]||DEFAULT_EXERCISES[exid]||S.exercises.global[exid]||{};
    if(!ex.videoUrl)return;
    S.videoModal={url:ex.videoUrl,title:ex.name||'Video'};
    renderVideoModal();
  }
  else if(a==='newexlib'){S.exLibEdit={id:'__new',name:'',category:EX_CATEGORIES[0],videoUrl:''};render();}
  else if(a==='editexlib'){const _exid=el.dataset.exid;const _ex=S.exercises.personal[_exid]||{};S.exLibEdit={id:_exid,name:_ex.name||el.dataset.exname,category:_ex.category||el.dataset.excat||'Otro',videoUrl:_ex.videoUrl||''};render();}
  else if(a==='cancelexlibedit'){S.exLibEdit=null;render();}
  else if(a==='saveexlibedit'){
    const name=(document.getElementById('exlib-name')?.value||'').trim();
    const cat=document.getElementById('exlib-cat')?.value||'Otro';
    const videoUrl=(document.getElementById('exlib-video')?.value||'').trim();
    if(!name){showAlert('Ingresá un nombre.');return;}
    if(S.exLibEdit.id==='__new'){
      await savePersonalExercise(name,cat,videoUrl);
    } else {
      const id=S.exLibEdit.id;
      const upd={name,category:cat};
      if(videoUrl) upd.videoUrl=videoUrl; else upd.videoUrl=null;
      S.exercises.personal[id]={...S.exercises.personal[id],...upd};
      await db.ref(`users/${currentUser.uid}/exercises/${id}`).update(upd);
    }
    S.exLibEdit=null;render();
  }
  else if(a==='deleteexlib'){
    const id=el.dataset.exid;
    showConfirm('¿Eliminar este ejercicio de tu biblioteca?', async()=>{
      delete S.exercises.personal[id];
      await db.ref(`users/${currentUser.uid}/exercises/${id}`).remove();
      render();
    });
  }
  // ── PROGRAMS ──────────────────────────────────────────────────
  else if(a==='newprog'){S.programForm={mode:'new',name:''};render();}
  else if(a==='cancelprogform'){S.programForm=null;render();}
  else if(a==='saveprogform'){
    const name=document.getElementById('prog-name-input')?.value.trim();
    if(!name){showAlert('Ingresá un nombre para el programa.');return;}
    const pid=S.programForm.progId||'prog_'+Date.now();
    S.programForm=null;
    await saveProgram(pid,{name,createdAt:Date.now(),days:S.programs[pid]?.days||{}});
    render();
  }
  else if(a==='deleteprog'){
    const pid=el.dataset.pid;
    showConfirm('¿Eliminar este programa y todos sus días?', async()=>{
      await deleteProgram(pid);render();
    });
  }
  else if(a==='openprog'){S.programView={progId:el.dataset.pid};S.programForm=null;render();}
  else if(a==='backprograms'){S.programView=null;S.programForm=null;render();}
  else if(a==='newprogday'){S.programForm={mode:'newday',progId:el.dataset.pid,dayName:''};render();}
  else if(a==='savedayform'){
    const pid=el.dataset.pid;
    const name=document.getElementById('day-name-input')?.value.trim();
    if(!name){showAlert('Ingresá un nombre para el día.');return;}
    const did='day_'+Date.now();
    const days=S.programs[pid]?.days||{};
    const order=Object.keys(days).length;
    S.programForm=null;
    await saveProgramDay(pid,did,{name,order,blocks:{}});
    render();
  }
  else if(a==='deleteprogday'){
    const pid=el.dataset.pid, did=el.dataset.did;
    showConfirm('¿Eliminar este día?', async()=>{
      await deleteProgramDay(pid,did);render();
    });
  }
  else if(a==='openprogday'){
    S.programView={progId:el.dataset.pid,dayId:el.dataset.did};S.programForm=null;render();
  }
  else if(a==='backprogdetail'){S.programView={progId:el.dataset.pid};S.programForm=null;render();}
  // ── PLAN (session) ────────────────────────────────────────────
  else if(a==='newplan'){
    S.planForm={mode:'new',name:'',assignedToAll:false,assignedTo:{}};render();
  }
  else if(a==='cancelplanform'){S.planForm=null;render();}
  else if(a==='plantoggleall'){
    if(S.planForm){S.planForm.assignedToAll=!S.planForm.assignedToAll;if(S.planForm.assignedToAll)S.planForm.assignedTo={};render();}
  }
  else if(a==='plantoggleplayer'){
    if(S.planForm&&!S.planForm.assignedToAll){
      const pid=el.dataset.pid;
      if(S.planForm.assignedTo[pid])delete S.planForm.assignedTo[pid];else S.planForm.assignedTo[pid]=true;
      render();
    }
  }
  else if(a==='saveplanform'){
    const name=document.getElementById('planform-name')?.value.trim()||'Plan';
    const planId=S.planForm.planId||'plan_'+Date.now();
    const data={name,assignedToAll:S.planForm.assignedToAll,assignedTo:S.planForm.assignedTo||{},createdAt:S.planForm.planId?S.sessionPlans[planId]?.createdAt||Date.now():Date.now()};
    S.planForm=null;
    await saveSessionPlan(planId,data);
    render();
  }
  else if(a==='editplanmeta'){
    const planId=el.dataset.planid;
    const plan=S.sessionPlans[planId];
    if(!plan)return;
    S.planForm={mode:'edit',planId,name:plan.name||'',assignedToAll:plan.assignedToAll||false,assignedTo:{...(plan.assignedTo||{})}};render();
  }
  else if(a==='deleteplan'){
    const planId=el.dataset.planid;
    showConfirm('¿Eliminar este plan?', async()=>{
      await deleteSessionPlan(planId);render();
    });
  }
  else if(a==='exportplanpdf'){
    const ctx=el.dataset.ctx;
    if(ctx==='session'){
      const planId=el.dataset.planid;
      const plan=S.sessionPlans[planId];
      if(!plan)return;
      const cd=getCat();
      const t=S.teams[S.lastCatTid];
      const assignedNames=plan.assignedToAll?'Toda la categoría':Object.keys(plan.assignedTo||{}).map(pid=>{const p=cd.players.find(pl=>pl.id===pid);return p?p.name:'';}).filter(Boolean).join(', ')||'Sin asignar';
      exportPlanPDF(plan,{title:plan.name||'Plan',subtitle:'Plan de sesión',teamName:t?.meta?.name||'',catName:cd.name||'',date:S.sessionDate||'',assigned:assignedNames});
    } else {
      const pid=el.dataset.pid, did=el.dataset.did;
      const prog=S.programs[pid];
      const day=prog?.days?.[did];
      if(!day)return;
      const dayBlocks=Object.entries(day.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
      exportPlanPDF({blocks:Object.fromEntries(dayBlocks)},{title:day.name||'Día',subtitle:prog.name||'Programa',teamName:'',catName:'',date:'',assigned:''});
    }
  }
  else if(a==='newplanfromprogram'){
    if(!Object.keys(S.programs||{}).length){showAlert('No tenés programas guardados. Creá uno desde la sección Programas.');return;}
    renderProgPickerModal();
  }
  else if(a==='pickprogday'){
    const pid=el.dataset.pid, did=el.dataset.did;
    const day=S.programs[pid]?.days?.[did];
    if(!day)return;
    closeProgPickerModal();
    const planId='plan_'+Date.now();
    const planData={name:day.name,assignedToAll:false,assignedTo:{},createdAt:Date.now(),blocks:JSON.parse(JSON.stringify(day.blocks||{}))};
    await saveSessionPlan(planId,planData);
    render();
  }
  // ── BLOCKS ────────────────────────────────────────────────────
  else if(a==='addblock'){
    const ctx=el.dataset.ctx, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    const bid='blk_'+Date.now();
    const blockData={name:'Nuevo bloque',type:'custom',order:0,items:{}};
    if(ctx==='session'){
      const existing=S.sessionPlans[planId]?.blocks||{};
      blockData.order=Object.keys(existing).length;
      await addBlockToPlan(planId,bid,blockData);
    } else {
      const existing=S.programs[pid]?.days?.[did]?.blocks||{};
      blockData.order=Object.keys(existing).length;
      await saveBlockToDay(pid,did,bid,blockData);
    }
    S.planEditBlock={blockId:bid,planId:planId||null,progId:pid||null,dayId:did||null};
    render();
  }
  else if(a==='editblockname'){
    S.planEditBlock={blockId:el.dataset.bid,planId:el.dataset.planid||null,progId:el.dataset.pid||null,dayId:el.dataset.did||null};
    render();
  }
  else if(a==='cancelblockname'){S.planEditBlock=null;render();}
  else if(a==='saveblockname'){
    const name=document.getElementById('block-name-input')?.value.trim()||'Bloque';
    const ctx=el.dataset.ctx, bid=el.dataset.bid, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    S.planEditBlock=null;
    if(ctx==='session'){
      await updateBlockInPlan(planId,bid,{name});
    } else {
      await saveBlockToDay(pid,did,bid,{name});
    }
    render();
  }
  else if(a==='deleteblock'){
    const ctx=el.dataset.ctx, bid=el.dataset.bid, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    showConfirm('¿Eliminar este bloque y todos sus ejercicios?', async()=>{
      if(ctx==='session') await deleteBlockFromPlan(planId,bid);
      else await deleteBlockFromDay(pid,did,bid);
      render();
    });
  }
  else if(a==='toggleblock'){
    const key=el.dataset.colkey;
    S.planCollapsed[key]=!S.planCollapsed[key];render();
  }
  // ── EXERCISES ─────────────────────────────────────────────────
  else if(a==='addexercise'){
    S.exPicker={ctx:el.dataset.ctx,planId:el.dataset.planid||null,progId:el.dataset.pid||null,dayId:el.dataset.did||null,blockId:el.dataset.bid};
    S.exPickerQuery='';S.exPickerTab='global';
    render();
  }
  else if(a==='closeexpicker'){S.exPicker=null;S.exPickerAddForm=null;S.exPickerQuery='';render();}
  else if(a==='expickertab'){S.exPickerTab=el.dataset.tab;S.exPickerAddForm=null;const m=document.getElementById('ex-picker-modal');if(m)m.remove();renderExPickerModal();}
  else if(a==='pickexercise'){
    const exId=el.dataset.exid, exName=el.dataset.exname;
    const picker=S.exPicker;
    if(!picker)return;
    S.exPicker=null;
    const iid='item_'+Date.now();
    const itemData={exId,exName,order:0,sets:{'0':{reps:'',weight:'',notes:''}}};
    if(picker.ctx==='session'){
      const existing=S.sessionPlans[picker.planId]?.blocks?.[picker.blockId]?.items||{};
      itemData.order=Object.keys(existing).length;
      await addItemToBlock(picker.planId,picker.blockId,iid,itemData);
    } else {
      const day=S.programs[picker.progId]?.days?.[picker.dayId];
      if(!day?.blocks?.[picker.blockId])return;
      const existing=day.blocks[picker.blockId].items||{};
      itemData.order=Object.keys(existing).length;
      if(!day.blocks[picker.blockId].items) day.blocks[picker.blockId].items={};
      day.blocks[picker.blockId].items[iid]=itemData;
      await dayItemRef(picker.progId,picker.dayId,picker.blockId,iid).set(itemData);
    }
    render();
  }
  else if(a==='removeitem'){
    const ctx=el.dataset.ctx, bid=el.dataset.bid, iid=el.dataset.iid, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    if(ctx==='session') await deleteItemFromBlock(planId,bid,iid);
    else await deleteItemFromDay(pid,did,bid,iid);
    render();
  }
  else if(a==='savenewpersonalex'){
    const name=S.exPickerQuery?.trim();
    S.exPickerAddForm={name:name||'',category:EX_CATEGORIES[0]};
    const m=document.getElementById('ex-picker-modal');if(m)m.remove();
    renderExPickerModal();
  }
  else if(a==='canceladdex'){
    S.exPickerAddForm=null;
    const m=document.getElementById('ex-picker-modal');if(m)m.remove();
    renderExPickerModal();
  }
  else if(a==='confirmaddex'){
    const name=(document.getElementById('ex-add-name')?.value||'').trim();
    const cat=document.getElementById('ex-add-cat')?.value||'Otro';
    if(!name){showAlert('Ingresá un nombre para el ejercicio.');return;}
    await savePersonalExercise(name,cat);
    S.exPickerAddForm=null;S.exPickerTab='personal';S.exPickerQuery='';
    const m=document.getElementById('ex-picker-modal');if(m)m.remove();
    renderExPickerModal();
  }
  // ── SETS ──────────────────────────────────────────────────────
  else if(a==='editsetcell'){
    S.planEditSet={ctx:el.dataset.ctx,planId:el.dataset.planid||null,progId:el.dataset.pid||null,dayId:el.dataset.did||null,blockId:el.dataset.bid,itemId:el.dataset.iid,setIdx:parseInt(el.dataset.sidx)};
    render();
  }
  else if(a==='settypetoggle'){
    if(S.planEditSet){
      const i=S.planEditSet.setIdx;
      S.planEditSet.draft_reps=document.getElementById('set-reps-'+i)?.value||'';
      S.planEditSet.draft_time=document.getElementById('set-time-'+i)?.value||'';
      S.planEditSet.draft_weight=document.getElementById('set-weight-'+i)?.value||'';
      S.planEditSet.draft_rir=document.getElementById('set-rir-'+i)?.value||'';
      S.planEditSet.draft_pct=document.getElementById('set-pct-'+i)?.value||'';
      S.planEditSet.editType=el.dataset.val;
      render();
    }
  }
  else if(a==='savesetcell'){
    const ctx=el.dataset.ctx, bid=el.dataset.bid, iid=el.dataset.iid, sidx=parseInt(el.dataset.sidx);
    const planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    const type=el.dataset.settype||'reps';
    const g=id=>document.getElementById(id+sidx)?.value.trim()||'';
    const setData={type,reps:g('set-reps-'),time:g('set-time-'),weight:g('set-weight-'),rir:g('set-rir-'),pct:g('set-pct-')};
    S.planEditSet=null;
    if(ctx==='session'){
      await saveSetInItem(planId,bid,iid,sidx,setData);
    } else {
      const item=S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items?.[iid];
      if(item){if(!item.sets)item.sets={};item.sets[String(sidx)]=setData;}
      await db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}/blocks/${bid}/items/${iid}/sets/${sidx}`).update(setData);
    }
    render();
  }
  else if(a==='addset'){
    const ctx=el.dataset.ctx, bid=el.dataset.bid, iid=el.dataset.iid, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    let sets;
    if(ctx==='session'){
      sets=S.sessionPlans[planId]?.blocks?.[bid]?.items?.[iid]?.sets||{};
    } else {
      sets=S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items?.[iid]?.sets||{};
    }
    const nextIdx=Object.keys(sets).length;
    const t0=sets['0']||{};
    const newSet=(t0.reps||t0.time||t0.weight)?{...t0}:{type:'reps',reps:'',time:'',weight:'',rir:'',pct:''};
    if(ctx==='session'){
      await saveSetInItem(planId,bid,iid,nextIdx,newSet);
    } else {
      const item=S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items?.[iid];
      if(item){if(!item.sets)item.sets={};item.sets[String(nextIdx)]=newSet;}
      await db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}/blocks/${bid}/items/${iid}/sets/${nextIdx}`).set(newSet);
    }
    render();
  }
  else if(a==='removelastset'){
    const ctx=el.dataset.ctx, bid=el.dataset.bid, iid=el.dataset.iid, planId=el.dataset.planid, pid=el.dataset.pid, did=el.dataset.did;
    let sets;
    if(ctx==='session'){
      sets=S.sessionPlans[planId]?.blocks?.[bid]?.items?.[iid]?.sets||{};
    } else {
      sets=S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items?.[iid]?.sets||{};
    }
    const keys=Object.keys(sets).map(Number).sort((a,b)=>b-a);
    if(!keys.length)return;
    const lastIdx=keys[0];
    if(ctx==='session'){
      delete S.sessionPlans[planId].blocks[bid].items[iid].sets[String(lastIdx)];
      await planSetRef(planId,bid,iid,lastIdx).remove();
    } else {
      const item=S.programs[pid]?.days?.[did]?.blocks?.[bid]?.items?.[iid];
      if(item?.sets) delete item.sets[String(lastIdx)];
      await db.ref(`users/${currentUser.uid}/programs/${pid}/days/${did}/blocks/${bid}/items/${iid}/sets/${lastIdx}`).remove();
    }
    render();
  }
}