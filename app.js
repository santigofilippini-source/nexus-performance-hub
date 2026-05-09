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

// ── State ─────────────────────────────────────────────────────
let currentUser = null;
let S = {
  view:'home', teams:{}, teamId:null, cat:null,
  tab:'attend', date:TODAY,
  sess:{}, absenceReasons:{}, sessionDraft:{duration:'',teamRPE:null,playerRPE:{},sessionType:null},
  wellnessDraft:{}, wellnessExpanded:{}, sessionSub:'load', rpeMode:'team',
  reportSub:'semanal', reportWeekOffset:0, confirmDel:null, editId:null,
  loadFilter:'7d', loadFrom:'', loadTo:'',
  athletes:{}, athleteKey:null, athleteTab:'perfil', athleteForm:null, editingEvalId:null,
  prevView:'home', prevTeamId:null, prevCat:null,
  lastCatTid:null, lastCatCid:null, statsPeriod:7,
  searchQuery:'',
  // Team/category forms
  editingTeamId:null, editingCatId:null,
  teamFormMode:null, catFormMode:null, // 'new'|'edit'
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
  editMemberForm:{}     // {role, permissions} draft for member being edited
};

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
function doLogout(){if(confirm('¿Cerrar sesión?'))auth.signOut();}

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
    logo.innerHTML = '<img src="data:image/png;base64,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" style="width:30px;height:30px;object-fit:contain;">';
    logo.style.background = 'var(--accent)';
    logo.style.padding = '';
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

function sidebarOpenTeam(tid){S.teamId=tid;S.view='team';S.teamFormMode=null;S.catFormMode=null;render();}
function sidebarOpenCat(tid,cid){S.teamId=tid;S.cat=cid;S.lastCatTid=tid;S.lastCatCid=cid;S.view='cat';S.tab='attend';S.date=TODAY;loadSession();loadSessionDraft();render();}
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
  nav.innerHTML=h;
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
    await db.ref(`teams/${tid}`).set(clean);
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
    if(inv.status!=='pending'){ alert('Esta invitación ya fue usada.'); S.pendingInvite=null; return; }
    if(new Date()>new Date(inv.expiresAt)){ alert('Esta invitación expiró (7 días).'); S.pendingInvite=null; return; }
    // Hard block: invitation must match the logged-in user's email
    if(inv.invitedEmail && inv.invitedEmail!==currentUser.email?.toLowerCase()){
      alert(`Esta invitación es para ${inv.invitedEmail}.\nEstás logueado como ${currentUser.email}.\n\nPor favor cerrá sesión e ingresá con la cuenta correcta.`);
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
    alert(`✓ Te uniste a "${inv.teamName}" como ${role==='editor'?'Editor':'Lector'}.`);
  } catch(e){ console.error('Error accepting invite:',e); alert('Error al aceptar la invitación.'); }
}

async function revokeAccess(tid, memberUid){
  if(!confirm('¿Quitar acceso a este usuario?')) return;
  try {
    await db.ref(`users/${memberUid}/memberships/${tid}`).remove();
    await db.ref(`teams/${tid}/memberIndex/${memberUid}`).remove();
    await db.ref(`teams/${tid}/memberPermissions/${memberUid}`).remove();
    S.editingMember=null;
    await loadTeamMembers(tid);
    render();
  } catch(e){ alert('Error al quitar acceso.'); }
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
  } catch(e){ alert('Error al actualizar permisos.'); }
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
  if(!confirm('¿Revocar esta invitación? El link dejará de funcionar.')) return;
  try {
    await db.ref().update({
      [`invitations/${token}/status`]:'revoked',
      [`teams/${tid}/pendingInvites/${token}`]:null
    });
    S.teamInvites[tid]=(S.teamInvites[tid]||[]).filter(i=>i.token!==token);
    render();
  } catch(e){ alert('Error al revocar.'); }
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
      <div style="text-align:center;margin-bottom:8px;"><img src="data:image/png;base64,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" style="width:44px;height:44px;object-fit:contain;"></div>
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
  return rpe*sess.duration;
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
  S.sessionDraft={duration:ex.duration||'',teamRPE:ex.teamRPE??null,playerRPE:{...(ex.playerRPE||{})},sessionType:ex.sessionType||null};
  S.wellnessDraft={};
  const w=ex.wellness||{};
  cd.players.forEach(p=>{S.wellnessDraft[p.id]=w[p.id]?{...w[p.id]}:null;});
  S.wellnessExpanded={};
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
  cd.sessions[S.date]={
    duration:S.sessionDraft.duration?parseInt(S.sessionDraft.duration):ex.duration,
    teamRPE:S.sessionDraft.teamRPE!==null?S.sessionDraft.teamRPE:ex.teamRPE,
    sessionType:S.sessionDraft.sessionType!==null?S.sessionDraft.sessionType:(ex.sessionType||null),
    playerRPE,wellness
  };
  await persistCat();
}
async function addPlayer(){
  const inp=document.getElementById('new-player');
  if(!inp||!inp.value.trim())return;
  getCat().players.push({id:Date.now().toString(),name:inp.value.trim()});
  await persistCat();render();
}

function handleMobTab(tab){
  if(tab==='home'){S.view='home';S.teamFormMode=null;S.catFormMode=null;render();return;}
  const catTab={att:'attend',ses:'session',met:'metrics',more:'roster'}[tab];
  if(!catTab)return;
  const tid=S.lastCatTid||S.teamId;
  const cid=S.lastCatCid||S.cat;
  if(tid&&cid){
    S.teamId=tid;S.cat=cid;S.view='cat';S.tab=catTab;
    if(catTab==='attend')loadSession();
    if(catTab==='session')loadSessionDraft();
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
  if(S.view==='home')   body.innerHTML=renderHome();
  else if(S.view==='team') body.innerHTML=renderTeamView();
  else if(S.view==='cat')  body.innerHTML=renderCatHeader()+renderCat();
  updateHeader();
  attachEvents();
}

// ── HOME: Teams list ──────────────────────────────────────────
function renderHome(){
  const teamIds=Object.keys(S.teams);
  const cards=teamIds.map(tid=>{
    const t=getTeam(tid);
    const cats=getCats(tid);
    const totalPlayers=cats.reduce((a,cid)=>{const c=t.categories[cid];return a+(Array.isArray(c.players)?c.players.length:Object.keys(c.players||{}).length);},0);
    const color=t.color||CAT_PALETTE[teamIds.indexOf(tid)%CAT_PALETTE.length];
    const lastDates=cats.map(cid=>Object.keys(t.categories[cid].attendance||{}).sort().pop()).filter(Boolean).sort();
    const lastDate=lastDates[lastDates.length-1];
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
    const _nonOwner=role==='editor'||role==='viewer';
    return`<button class="team-card" data-action="openteam" data-tid="${tid}" style="--c:${color};${_nonOwner?'margin-bottom:0;border-radius:14px 14px 0 0;':''}">
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${color};border-radius:2px 0 0 2px;"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          ${t.logo?`<img src="${t.logo}" style="width:36px;height:36px;border-radius:9px;object-fit:cover;flex-shrink:0;">`:`<div style="width:36px;height:36px;border-radius:9px;background:${color}33;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><img src=\"data:image/png;base64,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\" style=\"width:28px;height:28px;object-fit:contain;\"></div>`}
          <div>
            <div style="font-size:17px;font-weight:600;color:var(--text);">${t.name}</div>
            <div style="margin-top:2px;display:flex;gap:5px;align-items:center;"><span class="sport-badge">${t.sport||'Deporte'}</span>${rolePill}</div>
          </div>
      </div>
      <div style="display:flex;gap:10px;font-size:12px;color:var(--text2);flex-wrap:wrap;">
        <span>${cats.length} categoría${cats.length!==1?'s':''}</span>
        <span>${totalPlayers} jugadores</span>
        ${lastDate?`<span>Última: ${fmtDate(lastDate)}</span>`:'<span>Sin registros</span>'}
      </div>
    </button>${_nonOwner?`<button style="width:100%;padding:6px 10px;font-size:12px;color:#fca5a5;background:var(--bg2);border:1px solid var(--border);border-top:none;margin-bottom:10px;border-radius:0 0 14px 14px;cursor:pointer;font-family:var(--font);" data-action="leaveteam" data-tid="${tid}">↩ Salir del equipo</button>`:''}`;
  }).join('');

  const empty=!teamIds.length?`<div class="empty-state" style="padding:60px 20px;">
    <div style="margin-bottom:16px;"><img src="data:image/png;base64,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" style="width:80px;height:80px;object-fit:contain;"></div>
    <div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;">Bienvenido a Qoore</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:24px;">Creá tu primer equipo o pedile al Admin que te invite a uno existente.</div>
  </div>`:'';

  return`<div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-size:13px;font-weight:600;color:var(--text2);">MIS EQUIPOS</div>
      <button class="add-btn" data-action="newteam">+ Nuevo equipo</button>
    </div>
    ${S.teamFormMode?renderTeamForm():''}
    ${cards}${empty}
  </div>`;
}

function renderTeamForm(){
  const isEdit=S.teamFormMode==='edit';
  const tid=S.editingTeamId;
  const t=isEdit?getTeam(tid):{name:'',sport:'Básquetbol'};
  const logoPreview = (S.pendingLogo||t.logo) ? `<img src="${S.pendingLogo||t.logo}" class="logo-preview">` : `<div style="width:64px;height:64px;border-radius:12px;background:var(--bg3);display:flex;align-items:center;justify-content:center;"><img src=\"data:image/png;base64,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\" style=\"width:52px;height:52px;object-fit:contain;\"></div>`;
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
  const map={attend:renderAttend,session:renderSession,metrics:renderMetrics,reports:renderReports,roster:renderRoster};
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
      <button class="b${S.sessionSub==='load'?' on p':''}" data-action="sessionsub" data-sub="load">Carga RPE</button>
      <button class="b${S.sessionSub==='wellness'?' on p':''}" data-action="sessionsub" data-sub="wellness">Wellness</button>
    </div>
  </div>
  ${S.sessionSub==='load'?renderSessionLoad():renderSessionWellness()}`;
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
        const ua=rpeVal!==null&&dur?rpeVal*dur:null;
        const pill=rpeVal!==null
          ?`<span style="width:38px;height:38px;border-radius:8px;display:grid;place-items:center;font:700 20px var(--font-mono);background:${RPE_BG[rpeVal]}22;color:${RPE_BG[rpeVal]};border:1.5px solid ${RPE_BG[rpeVal]}55;">${rpeVal}</span>${ua!==null?`<span style="font-size:11px;font-family:var(--font-mono);color:var(--text-2);">${ua} UA</span>`:''}`
          :`<span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">—</span>`;
        const btn=editable?`<button style="font-size:11px;padding:5px 12px;border-radius:6px;border:1px solid var(--line);background:var(--bg-3);color:var(--text-1);cursor:pointer;" data-action="expandrpe" data-pid="${p.id}">${rpeVal!==null?'Cambiar':'Elegir'}</button>`:'';
        return`<div class="q-ind-row" style="justify-content:space-between;">
          <div class="q-ind-ath"><span class="av">${initials}</span><span class="nm">${p.name}</span></div>
          <div style="display:flex;align-items:center;gap:8px;">${pill}${btn}</div>
        </div>`;
      }
      const btns=Array.from({length:11},(_,i)=>`<button class="b${rpeVal===i?' sel':''}"${rpeVal===i?` style="background:${RPE_BG[i]}22;color:${RPE_BG[i]};border-color:${RPE_BG[i]};"`:''}${editable?` data-action="playerrpe" data-pid="${p.id}" data-rpe="${i}"`:' disabled'}>${i}</button>`).join('');
      return`<div class="q-ind-row">
        <div class="q-ind-ath"><span class="av">${initials}</span><span class="nm">${p.name}</span></div>
        <div class="q-ind-rpe">${btns}</div>
        <span style="font-size:12px;font-family:var(--font-mono);color:${rpeVal!==null?RPE_BG[rpeVal]:'var(--text-2)'};min-width:64px;text-align:right;">${rpeVal!==null?`RPE ${rpeVal}${dur?' · '+rpeVal*dur+' UA':''}`:''}</span>
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
  const arCounts={};cd.players.forEach(p=>{const rc={};Object.values(cd.attendance).forEach(d=>{if(d?.[p.id]==='A'&&d?.absenceReasons?.[p.id]){const r=d.absenceReasons[p.id];rc[r]=(rc[r]||0)+1;}});arCounts[p.id]=rc;});
  const COL='minmax(0,1fr) 70px 60px 60px 90px 60px';
  const jugadoresTab=`<div class="q-card">
    <div style="display:grid;grid-template-columns:${COL};gap:12px;padding:9px 16px;background:var(--bg-1);border-bottom:1px solid var(--line);font-size:10.5px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;font-weight:600;">
      <span>Atleta</span><span>Pres.</span><span>Aus.</span><span>Total</span><span>% Asist.</span><span>Racha</span>
    </div>
    ${!stats.length?`<div class="empty-state">Sin jugadores.</div>`:stats.map((p,i)=>{
      const rc=arCounts[p.id]||{};const rcKeys=Object.keys(rc);
      const _arBadge='font-size:10px;padding:2px 7px;border-radius:12px;background:var(--bad-soft);color:var(--bad);border:.5px solid var(--bad);font-weight:500;';
      const reasonBadges=rcKeys.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;">${rcKeys.map(k=>{const rd=ABSENCE_REASONS.find(r=>r.id===k);return rd?`<span style="${_arBadge}">${rd.icon} ${rd.label} ×${rc[k]}</span>`:''}).join('')}</div>`:'';
      const pctCol=p.pct!==null?(p.pct>=85?'var(--ok)':p.pct>=70?'var(--warn)':'var(--bad)'):'var(--text-2)';
      return`<div style="padding:10px 16px;border-bottom:${i<stats.length-1?'1px solid var(--line)':'0'};">
        <div style="display:grid;grid-template-columns:${COL};gap:12px;align-items:center;">
          <span style="font-weight:500;font-size:13px;">${p.name}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--ok);">${p.P}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--bad);">${p.A}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-2);">${p.total}</span>
          <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:${pctCol};">${p.pct!==null?p.pct+'%':'—'}</span>
          <span style="font-family:var(--font-mono);font-size:12px;color:${p.consec>=ALERT_N?'var(--bad)':'var(--text-2)'};">${p.consec>=ALERT_N?'⚠ '+p.consec:'—'}</span>
        </div>
        ${reasonBadges}
        ${p.pct!==null?`<div style="height:3px;background:var(--bg-3);border-radius:99px;margin-top:6px;"><div style="height:100%;width:${p.pct}%;background:${pctCol};border-radius:99px;"></div></div>`:''}
      </div>`;
    }).join('')}
  </div>`;
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
function openSearch(){S.prevView=S.view;S.prevTeamId=S.teamId;S.prevCat=S.cat;S.view='search';S.searchQuery='';render();setTimeout(()=>{const i=document.getElementById('search-main');if(i){i.focus();i.setSelectionRange(999,999);}},50);}
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

function handleSidebarSearch(val){S.searchQuery=val;if(val.length>1){S.view='search';render();}else if(val.length===0&&S.view==='search'){S.view='home';render();}}
function attachEvents(){
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',handleAction));
  document.onkeydown=e=>{if(e.key==='Escape'&&S.view==='search'){S.view=S.prevView||'home';S.teamId=S.prevTeamId||S.teamId;render();}if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openSearch();}};
  const di=document.getElementById('date-input');
  if(di)di.addEventListener('change',e=>{S.date=e.target.value;loadSession();if(S.tab==='session')loadSessionDraft();render();});
  const durI=document.getElementById('dur-input');
  if(durI)durI.addEventListener('input',e=>{S.sessionDraft.duration=e.target.value;});
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
  else if(a==='tab'){S.tab=el.dataset.tab;if(S.tab==='attend')loadSession();if(S.tab==='session')loadSessionDraft();render();}
  else if(a==='reportsub'){S.reportSub=el.dataset.sub;render();}
  else if(a==='prevreportweek'){S.reportWeekOffset=(S.reportWeekOffset||0)-1;render();}
  else if(a==='nextreportweek'){S.reportWeekOffset=(S.reportWeekOffset||0)+1;render();}
  else if(a==='sessionsub'){S.sessionSub=el.dataset.sub;render();}
  else if(a==='rpemode'){S.rpeMode=el.dataset.mode;render();}
  else if(a==='sessiontype'){S.sessionDraft.sessionType=el.dataset.type;render();}
  else if(a==='cancelsearch'){S.view=S.prevView||'home';S.teamId=S.prevTeamId||S.teamId;render();}
  // ATTENDANCE
  else if(a==='setstatus'){S.sess[el.dataset.pid]=el.dataset.status;render();}
  else if(a==='setabsencereason'){S.absenceReasons[el.dataset.pid]=el.dataset.reason;render();}
  else if(a==='allp'){getCat().players.forEach(p=>S.sess[p.id]='P');render();}
  else if(a==='alla'){getCat().players.forEach(p=>S.sess[p.id]='A');render();}
  else if(a==='prevday'){const d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()-1);S.date=d.toISOString().split('T')[0];loadSession();if(S.tab==='session')loadSessionDraft();render();}
  else if(a==='nextday'){if(S.date>=TODAY)return;const d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()+1);S.date=d.toISOString().split('T')[0];loadSession();if(S.tab==='session')loadSessionDraft();render();}
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
    try{ await navigator.clipboard.writeText(link); alert('Link copiado ✓'); }
    catch(e){ prompt('Copiá este link:',link); }
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
      try{ await navigator.clipboard.writeText(link); alert(`Nueva invitación generada y copiada ✓\n\nLink: ${link}`); }
      catch(e){ prompt('Nueva invitación generada. Copiá el link:',link); }
    }catch(e){ alert('Error al regenerar invitación.'); }
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
    const emailEl=document.getElementById('inv-email');
    if(emailEl) S.inviteForm.email=emailEl.value;
    const email=(S.inviteForm.email||'').trim();
    if(!email){alert('Ingresá el email del invitado.');return;}
    const {role,permissions}=S.inviteForm;
    // Filter out 'none' permissions
    const filteredPerms={};
    Object.entries(permissions||{}).forEach(([cid,p])=>{if(p!=='none')filteredPerms[cid]=p;});
    try{
      const token=await createInvitation(tid,email,role,filteredPerms);
      const link=`${window.location.origin}${window.location.pathname}?invite=${token}`;
      S.inviteLink=link;
      render();
    }catch(err){alert('Error al crear invitación: '+err.message);}
  }
  else if(a==='copyinvitelink'){
    if(S.inviteLink){
      try{await navigator.clipboard.writeText(S.inviteLink);alert('Link copiado al portapapeles ✓');}
      catch(e){prompt('Copiá este link:',S.inviteLink);}
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
    if(!name){alert('Ingresá un nombre para el equipo.');return;}
    const tid='team_'+Date.now();
    const newTeam={name,sport,createdAt:TODAY,ownerId:currentUser.uid,categories:{}};
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
    if(!name){alert('Ingresá un nombre.');return;}
    const tid=S.editingTeamId||S.teamId;
    S.teams[tid].name=name; S.teams[tid].sport=sport;
    if(S.pendingLogo){S.teams[tid].logo=S.pendingLogo; S.pendingLogo=null;}
    // Close form immediately
    S.teamFormMode=null; S.editingTeamId=null; render();
    try { await persistTeam(tid); } catch(e){ setSyncBar('error','Error al guardar el equipo'); }
  }
  else if(a==='deleteteam'){
    const tid=el.dataset.tid;
    if(!isOwner(tid)){alert('Solo el dueño puede eliminar el equipo.');return;}
    if(!confirm(`¿Eliminar el equipo "${S.teams[tid]?.name}"? Esta acción no se puede deshacer.`))return;
    // Update state and close form immediately
    delete S.teams[tid]; delete S.memberships[tid];
    S.view='home'; S.teamId=null; S.teamFormMode=null; S.accessPanel=false; render();
    // Then clean up Firebase
    try {
      await db.ref(`teams/${tid}`).remove();
      await db.ref(`users/${currentUser.uid}/memberships/${tid}`).remove();
    } catch(e){ console.error('Error deleting team:',e); setSyncBar('error','Error al eliminar el equipo'); }
  }
  else if(a==='leaveteam'){
    const tid=el.dataset.tid;
    if(isOwner(tid)){alert('El dueño no puede salir del equipo. Eliminalo desde el formulario de edición.');return;}
    if(!confirm('¿Estás seguro que querés salir de este equipo? Perderás el acceso.'))return;
    // Optimistic update
    delete S.teams[tid]; delete S.memberships[tid];
    render();
    // Firebase cleanup
    try{
      await db.ref(`users/${currentUser.uid}/memberships/${tid}`).remove();
      await db.ref(`teams/${tid}/memberIndex/${currentUser.uid}`).remove();
      await db.ref(`teams/${tid}/memberPermissions/${currentUser.uid}`).remove();
    }catch(e){console.error('Error leaving team:',e);setSyncBar('error','Error al salir del equipo');}
  }
  // CATEGORY MANAGEMENT
  else if(a==='newcat'){S.catFormMode='new';S.editingCatId=null;render();}
  else if(a==='editcurrentcat'){S.catFormMode='edit';S.editingCatId=S.cat;S.view='team';render();}
  else if(a==='cancelcatform'){S.catFormMode=null;S.editingCatId=null;render();}
  else if(a==='savenewcat'){
    const name=document.getElementById('cf-name')?.value.trim();
    if(!name){alert('Ingresá un nombre para la categoría.');return;}
    const cid='cat_'+Date.now();
    const colorIdx=getCats().length%CAT_PALETTE.length;
    if(!S.teams[S.teamId].categories)S.teams[S.teamId].categories={};
    S.teams[S.teamId].categories[cid]={name,color:CAT_PALETTE[colorIdx],players:[],attendance:{},sessions:{}};
    S.catFormMode=null; render();
    try { await persistTeam(S.teamId); } catch(e){ setSyncBar('error','Error al crear la categoría'); }
  }
  else if(a==='saveeditcat'){
    const name=document.getElementById('cf-name')?.value.trim();
    if(!name){alert('Ingresá un nombre.');return;}
    const cid=S.editingCatId;
    if(S.teams[S.teamId].categories[cid])S.teams[S.teamId].categories[cid].name=name;
    S.catFormMode=null; S.editingCatId=null; render();
    try { await persistTeam(S.teamId); } catch(e){ setSyncBar('error','Error al guardar la categoría'); }
  }
  else if(a==='deletecat'){
    const tid=S.teamId;const cid=el.dataset.cid;
    if(!isOwner(tid)){alert('Solo el dueño puede eliminar categorías.');return;}
    const catName=S.teams[tid]?.categories?.[cid]?.name||'esta categoría';
    if(!confirm(`¿Eliminar "${catName}"? Se perderán todos sus datos (asistencia, sesiones, atletas).`))return;
    // Optimistic update
    const prefix=`${tid}__${cid}__`;
    const athleteKeys=Object.keys(S.athletes).filter(k=>k.startsWith(prefix));
    athleteKeys.forEach(k=>delete S.athletes[k]);
    delete S.teams[tid].categories[cid];
    if(S.cat===cid)S.cat=null;
    S.catFormMode=null;S.editingCatId=null;render();
    // Firebase cleanup
    try{
      await db.ref(`teams/${tid}/categories/${cid}`).remove();
      await Promise.all(athleteKeys.map(k=>db.ref(`teams/${tid}/athletes/${k}`).remove()));
    }catch(e){console.error('Error deleting cat:',e);setSyncBar('error','Error al eliminar la categoría');}
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
  else if(a==='delevalmorpho'){if(confirm('¿Eliminar?')){const ath=getAthlete(S.athleteKey);delete ath.morphology[el.dataset.evid];await saveAthlete(S.athleteKey);render();}}
  else if(a==='delevalantro'){if(confirm('¿Eliminar?')){const ath=getAthlete(S.athleteKey);delete ath.anthropometry[el.dataset.evid];await saveAthlete(S.athleteKey);render();}}
  else if(a==='delevaltests'){if(confirm('¿Eliminar?')){const ath=getAthlete(S.athleteKey);delete ath.jumpTests[el.dataset.evid];await saveAthlete(S.athleteKey);render();}}
  else if(a==='savefmsform'){
    const ath=getAthlete(S.athleteKey);const id=S.editingEvalId||Date.now().toString();S.editingEvalId=null;
    const gi=k=>{const v=parseInt(document.getElementById(k)?.value);return isNaN(v)?null:v;};
    const ev={date:document.getElementById('fms-date')?.value||TODAY,deepSquat:gi('fms-ds'),hurdleL:gi('fms-hsl'),hurdleR:gi('fms-hsr'),lungeL:gi('fms-lul'),lungeR:gi('fms-lur'),shoulderL:gi('fms-sml'),shoulderR:gi('fms-smr'),aslrL:gi('fms-asl'),aslrR:gi('fms-asr'),trunkStab:gi('fms-ts'),rotaryL:gi('fms-rsl'),rotaryR:gi('fms-rsr'),notes:document.getElementById('fms-notes')?.value||''};
    Object.keys(ev).forEach(k=>{if(ev[k]===null||ev[k]==='')delete ev[k];});
    ath.fmsTests[id]=ev;S.athleteForm=null;await saveAthlete(S.athleteKey);render();
  }
  else if(a==='delevalfms'){if(confirm('¿Eliminar?')){const ath=getAthlete(S.athleteKey);delete ath.fmsTests[el.dataset.evid];await saveAthlete(S.athleteKey);render();}}
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
}