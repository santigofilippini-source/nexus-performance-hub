// ── render-athlete.js — Portal del Atleta ──
// ── Onboarding overlay ────────────────────────────────────────
const _OBD_STEPS=[
  {
    svg:`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    title:'¡Bienvenido a Qoore!',
    body:'Tu entrenador te conectó a esta plataforma. Desde acá vas a poder ver tus rutinas, registrar sesiones y seguir tu progreso en tiempo real.'
  },
  {
    svg:`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    title:'Tu día de hoy',
    body:'En <b>Hoy</b> completás el check-in diario de bienestar antes de entrenar. También aparece un resumen de tu rutina del día.'
  },
  {
    svg:`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="4" height="4" rx="1.5"/><rect x="18" y="10" width="4" height="4" rx="1.5"/><rect x="5.5" y="8" width="2.5" height="8" rx="1"/><rect x="16" y="8" width="2.5" height="8" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    title:'Tus rutinas',
    body:'En <b>Rutinas</b> están los ejercicios de la sesión. Marcá cada bloque como completo y registrá el peso que levantás.'
  },
  {
    svg:`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>`,
    title:'Asistencia',
    body:'En <b>Asistencia</b> podés ver tu historial mes a mes. Se registra automáticamente al completar una rutina.'
  },
  {
    svg:`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l4-5 4 3 4-6 4-2"/><path d="M15 7h4v4"/></svg>`,
    title:'Tu progreso',
    body:'En <b>Progreso</b> encontrás tus métricas de carga, bienestar y evaluaciones. Tu coach carga los datos desde su panel.'
  }
];
function renderOnboardingOverlay(step){
  const s=_OBD_STEPS[step]||_OBD_STEPS[0];
  const dots=_OBD_STEPS.map((_,i)=>`<span class="ap-obd-dot${i===step?' on':''}"></span>`).join('');
  const isFirst=step===0, isLast=step===_OBD_STEPS.length-1;
  return `<div class="ap-obd-card">
    <button class="ap-obd-skip" onclick="skipOnboarding()">Saltar</button>
    <div class="ap-obd-icon">${s.svg}</div>
    <div class="ap-obd-title">${s.title}</div>
    <div class="ap-obd-body">${s.body}</div>
    <div class="ap-obd-dots">${dots}</div>
    <div class="ap-obd-actions">
      ${!isFirst?`<button class="ap-obd-back" onclick="prevOnboarding()">Atrás</button>`:'<span></span>'}
      ${isLast
        ?`<button class="ap-obd-next" onclick="completeOnboarding()">¡Empezar!</button>`
        :`<button class="ap-obd-next" onclick="nextOnboarding()">Siguiente →</button>`
      }
    </div>
  </div>`;
}
function _updateObd(){
  const ol=document.getElementById('ap-onboarding-overlay');
  if(ol) ol.innerHTML=renderOnboardingOverlay(S.onboardingStep);
}
function nextOnboarding(){ if(S.onboardingStep<_OBD_STEPS.length-1){S.onboardingStep++;_updateObd();} }
function prevOnboarding(){ if(S.onboardingStep>0){S.onboardingStep--;_updateObd();} }
function skipOnboarding(){ completeOnboarding(); }
function completeOnboarding(){
  S.onboardingDone=true; S.onboardingStep=null;
  localStorage.setItem(`ap_obd_${currentUser.uid}`,'1');
  const ol=document.getElementById('ap-onboarding-overlay');
  if(ol) ol.remove();
}
function replayOnboarding(){
  document.getElementById('ap-profile-modal')?.remove();
  S.onboardingDone=false; S.onboardingStep=0;
  localStorage.removeItem(`ap_obd_${currentUser.uid}`);
  let ol=document.getElementById('ap-onboarding-overlay');
  if(!ol){ol=document.createElement('div');ol.id='ap-onboarding-overlay';document.body.appendChild(ol);}
  ol.innerHTML=renderOnboardingOverlay(0);
}

// ── ATHLETE PORTAL ────────────────────────────────────────────

function renderAthletePortal(ctx){
  const tab=S.athletePortalTab||'today';
  initAthleteCheckin(ctx);
  let content='';
  if(tab==='today')      content=renderAthleteToday(ctx);
  else if(tab==='routines')   content=renderAthleteRoutines(ctx);
  else if(tab==='attendance') content=renderAthleteAttendance(ctx);
  else if(tab==='progress')   content=renderAthleteProgress(ctx);
  const tabs=[
    {id:'today',      label:'Hoy',        svg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`},
    {id:'routines',   label:'Rutinas',    svg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="4" height="4" rx="1.5"/><rect x="18" y="10" width="4" height="4" rx="1.5"/><rect x="5.5" y="8" width="2.5" height="8" rx="1"/><rect x="16" y="8" width="2.5" height="8" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`},
    {id:'attendance', label:'Asistencia', svg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>`},
    {id:'progress',   label:'Progreso',   svg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l4-5 4 3 4-6 4-2"/><path d="M15 7h4v4"/></svg>`},
  ];
  const tabNav=tabs.map(t=>
    `<button class="ap-nav-btn${tab===t.id?' on':''}" data-action="aptab" data-tab="${t.id}">
      <span class="ap-nav-icon">${t.svg}</span>
      <span>${t.label}</span>
    </button>`
  ).join('');
  return`<div class="ap-layout">
    <div class="ap-body">${content}</div>
    <nav class="ap-nav">${tabNav}</nav>
  </div>`;
}

function renderAthleteToday(ctx){
  const{tid,catId,pid}=ctx;
  const ci=S.athleteCheckin||{};
  const sess=S.teams[tid]?.categories?.[catId]?.sessions?.[TODAY]||{};
  const savedW=sess.wellness?.[pid];
  const lastDate=getAthleteLastSessionDate(ctx);
  const lastSessRPE=S.teams[tid]?.categories?.[catId]?.sessions?.[TODAY]?.playerRPE?.[pid]??null;

  const _n=new Date();
  const _dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const _mes=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dateStr=`${_dias[_n.getDay()]} ${_n.getDate()} de ${_mes[_n.getMonth()]}`;

  // Today's routine banner
  const todayPlans=Object.entries(sess.plans||{}).filter(([,p])=>p.assignedToAll||p.assignedTo?.[pid]);
  let routineBanner='';
  if(todayPlans.length){
    const planItems=todayPlans.map(([,plan])=>{
      const blockCount=Object.keys(plan.blocks||{}).length;
      const exCount=Object.values(plan.blocks||{}).reduce((a,b)=>a+Object.keys(b.items||{}).length,0);
      return`<div class="ap-today-plan">
        <div class="ap-today-plan__name">${plan.name||'Plan de entrenamiento'}</div>
        <div class="ap-today-plan__meta">${blockCount} bloque${blockCount!==1?'s':''} · ${exCount} ejercicio${exCount!==1?'s':''}</div>
      </div>`;
    }).join('');
    const dumbbell=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="4" height="4" rx="1.5"/><rect x="18" y="10" width="4" height="4" rx="1.5"/><rect x="5.5" y="8" width="2.5" height="8" rx="1"/><rect x="16" y="8" width="2.5" height="8" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    routineBanner=`<div class="ap-today-banner">
      <div class="ap-today-banner__head">${dumbbell}<span>Entrenamiento de hoy</span></div>
      ${planItems}
      <button class="ap-today-banner__btn" data-action="aptab" data-tab="routines">Ver rutina completa →</button>
    </div>`;
  }

  // Wellness rows
  const allWFilled=W_KEYS.every(k=>ci[k]!=null);
  const wVals=W_KEYS.map(k=>ci[k]).filter(v=>v!=null);
  const avgW=allWFilled?(wVals.reduce((a,b)=>a+b,0)/5).toFixed(1):null;
  const avgColor=avgW?wellColor(Math.round(parseFloat(avgW))):'var(--text-2)';
  const wellRows=W_KEYS.map(k=>{
    const v=ci[k];
    const btns=[1,2,3,4,5].map(n=>{
      const sel=v===n;const nc=wellColor(n);
      return`<button class="ap-wb${sel?' sel':''}" style="${sel?`background:${nc};border-color:${nc};`:`border-color:${nc};color:${nc};`}" data-action="apwellness" data-key="${k}" data-val="${n}">${n}</button>`;
    }).join('');
    const tip=v!=null?`<span class="ap-well-tip">${W_TIPS[k][v-1]}</span>`:'';
    return`<div class="ap-well-row">
      <span class="ap-well-label">${W_SVGS[k]} ${W_LABELS[k]}</span>
      <div class="ap-well-btns">${btns}</div>${tip}
    </div>`;
  }).join('');
  const savedWBadge=savedW?`<span style="font-size:11px;color:var(--ok);font-weight:600;">✓ Registrado</span>`:'';

  // RPE last session
  const rpeVal=ci.rpe;
  const rpeBtns=Array.from({length:11},(_,i)=>{
    const sel=rpeVal===i;
    return`<button class="ap-rpe-btn${sel?' sel':''}" ${sel?`style="background:${RPE_BG[i]}22;color:${RPE_BG[i]};border-color:${RPE_BG[i]};"`:''}data-action="aprpe" data-rpe="${i}" data-date="${ci.rpeDate||TODAY}">${i}</button>`;
  }).join('');
  const rpeDescription=rpeVal!=null?`<div style="text-align:center;font-size:12px;color:${RPE_BG[rpeVal]};margin-top:6px;font-weight:600;">${RPE_LABELS[rpeVal]}</div>`:'';
  const rpeSavedBadge=lastSessRPE!=null?`<span style="font-size:11px;color:var(--ok);font-weight:600;">✓ Registrado</span>`:'';

  // Duration last session — free numeric input
  const lastSessDuration=S.teams[tid]?.categories?.[catId]?.sessions?.[TODAY]?.playerDuration?.[pid]??null;
  const durSavedBadge=lastSessDuration!=null?`<span style="font-size:11px;color:var(--ok);font-weight:600;">✓ Registrado</span>`:'';
  const durInputVal=ci.sessionDuration!=null?ci.sessionDuration:'';

  const pushBanner=typeof Notification!=='undefined'&&Notification.permission==='default'&&!VAPID_PUBLIC_KEY.startsWith('PASTE')
    ?`<div class="ap-push-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span>Activá las notificaciones para no perderte nada</span><button class="ap-push-btn" onclick="requestPushPermission()">Activar</button></div>`:'';
  return`<div style="padding-top:4px;">
    ${pushBanner}
    <div style="padding:10px 16px 2px;font-size:12px;color:var(--text-2);">${dateStr}</div>
    ${routineBanner}
    <div class="ap-well-card">
      <div class="ap-well-card__h">
        <h3>Cómo me siento hoy</h3>
        <div style="display:flex;align-items:center;gap:8px;">
          ${allWFilled?`<span style="font-size:14px;font-weight:700;font-family:var(--font-mono);color:${avgColor};">${avgW}/5</span>`:''}
          ${savedWBadge}
        </div>
      </div>
      <div class="ap-well-card__b">${wellRows}</div>
    </div>
    <div class="ap-well-card">
      <div class="ap-well-card__h">
        <h3>RPE — Sesión de hoy</h3>
        <div style="display:flex;align-items:center;gap:8px;">${rpeSavedBadge}</div>
      </div>
      <div class="ap-well-card__b">
        <div class="ap-rpe-grid">${rpeBtns}</div>${rpeDescription}
      </div>
    </div>
    <div class="ap-well-card">
      <div class="ap-well-card__h">
        <h3>Duración — Sesión de hoy</h3>
        <div style="display:flex;align-items:center;gap:8px;">${durSavedBadge}</div>
      </div>
      <div class="ap-well-card__b">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 16px 4px;">
          <input type="number" min="1" max="480" placeholder="ej. 73" value="${durInputVal}"
            oninput="setAthleteDuration(this.value)"
            style="width:96px;height:48px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg-3);color:var(--text-1);font-size:24px;font-weight:700;text-align:center;padding:0 8px;">
          <span style="font-size:15px;color:var(--text-2);font-weight:600;">min</span>
        </div>
      </div>
    </div>
    <div style="padding:0 16px 16px;">
      <button class="q-btn q-btn--primary" style="width:100%;padding:12px;" data-action="savetodaycheckin">Guardar check-in</button>
    </div>
  </div>`;
}

function toggleAthleteSwitch(swKey, planId, date){
  const lsKey=`ap_sw_${swKey}`;
  const wasDone=localStorage.getItem(lsKey)==='1';
  localStorage.setItem(lsKey, wasDone?'0':'1');
  const blockEl=document.querySelector(`[data-swkey="${swKey}"]`);
  if(blockEl) blockEl.classList.toggle('ap-block--done',!wasDone);
  const chk=blockEl?.querySelector('input[type=checkbox]');
  if(chk) chk.checked=!wasDone;
  const ctx=getAthleteCtx();
  if(!ctx) return;
  const{tid,catId}=ctx;
  const plan=S.teams[tid]?.categories?.[catId]?.sessions?.[date]?.plans?.[planId];
  if(!plan) return;
  const blocks=Object.entries(plan.blocks||{});
  const totalBlocks=blocks.length;
  const doneBlocks=blocks.filter(([bid])=>localStorage.getItem(`ap_sw_${date}_${planId}_${bid}`)==='1').length;
  const pct=totalBlocks>0?Math.round(doneBlocks/totalBlocks*100):0;
  const wrap=document.getElementById(`ap-progress-${planId}`);
  if(!wrap) return;
  const info=wrap.querySelector('.ap-progress-info');
  const fill=wrap.querySelector('.ap-progress-fill');
  const btn=document.getElementById(`ap-complete-${planId}`);
  if(info) info.innerHTML=`<span>${doneBlocks}/${totalBlocks} bloques</span><span class="ap-progress-pct">${pct}%</span>`;
  if(fill) fill.style.width=pct+'%';
  if(btn){ btn.disabled=pct<100; btn.textContent=pct<100?`Completar rutina · ${pct}%`:'✓ Completar rutina'; }
}

function openVideoById(vid){
  S.videoModal={url:`https://www.youtube.com/watch?v=${vid}`};
  renderVideoModal();
}

function renderAthleteRoutines(ctx){
  const{tid,catId,pid}=ctx;
  const sessions=S.teams[tid]?.categories?.[catId]?.sessions||{};
  const offset=S.athleteRoutineDayOffset||0;
  const d=new Date(TODAY+'T12:00:00');
  d.setDate(d.getDate()+offset);
  const date=d.toISOString().split('T')[0];
  const isToday=date===TODAY,isFuture=date>TODAY;
  const DAY_NAMES=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const dateLabel=`${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${MES[d.getMonth()]}`;
  const svgL=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
  const svgR=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;
  const todayDot=!isToday?`<button class="ap-day-nav__today" data-action="aproutineday" data-dir="${-offset}" title="Volver a hoy">Hoy</button>`:'';
  const navBar=`<div class="ap-day-nav">
    <button class="ap-day-nav__btn" data-action="aproutineday" data-dir="-1">${svgL}</button>
    <div class="ap-day-nav__center">
      <span class="ap-day-nav__date">${dateLabel}</span>
      ${isToday?`<span class="ap-day-nav__badge">HOY</span>`:isFuture?`<span class="ap-day-nav__badge ap-day-nav__badge--dim">Próximo</span>`:`<span class="ap-day-nav__badge ap-day-nav__badge--dim">Pasado</span>`}
    </div>
    <button class="ap-day-nav__btn" data-action="aproutineday" data-dir="1">${svgR}</button>
  </div>${todayDot?`<div style="display:flex;justify-content:center;padding:0 0 4px;">${todayDot}</div>`:''}`;
  const myPlans=sessions[date]?.plans?Object.entries(sessions[date].plans).filter(([,plan])=>plan.assignedToAll||plan.assignedTo?.[pid]):[];
  if(!myPlans.length){
    return`<div style="padding-top:8px;">${navBar}<div class="q-empty-state" style="padding:32px 20px;">
      <div style="font-size:32px;margin-bottom:10px;">📋</div>
      <div style="font-weight:600;margin-bottom:4px;">${isToday?'Sin rutina hoy':isFuture?'Sin rutina asignada':'Sin rutina este día'}</div>
      <div style="font-size:13px;color:var(--text-2);">Tu coach no asignó planes para este día.</div>
    </div></div>`;
  }
  const cards=myPlans.map(([planId,plan])=>{
    const blocks=Object.entries(plan.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    const existingLog=sessions[date]?.workoutLog?.[pid]?.[planId]||null;
    const isLogging=S.athleteLogMode?.date===date&&S.athleteLogMode?.planId===planId;
    const blocksHtml=blocks.map(([bid,block])=>{
      const bInfo=blockTypeInfo(block.type);
      const collapseKey=`${date}_${bid}`;
      const isCollapsed=S.athleteCollapsed[collapseKey]!==false;
      const items=Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
      const exHtml=items.map(([iid,item])=>{
        const sets=Object.values(item.sets||{}).sort((a,b)=>(a.order||0)-(b.order||0));
        const setStr=formatAthleteSetStr(sets);
        const _vidUrl=(DEFAULT_EXERCISES[item.exId]||S.exercises.personal[item.exId]||S.exercises.global[item.exId])?.videoUrl;
        const _vid=_vidUrl?ytId(_vidUrl):null;
        const thumbHtml=_vid?`<img class="ap-ex-thumb" src="https://img.youtube.com/vi/${_vid}/mqdefault.jpg" onclick="openVideoById('${_vid}')" onerror="this.style.display='none'">`:'';
        return`<div class="ap-exercise">
          ${thumbHtml}
          <div class="ap-ex-top">
            <span class="ap-exercise-name">${item.exName||'Ejercicio'}</span>
          </div>
          ${setStr?`<div class="ap-ex-detail">${setStr}</div>`:''}
        </div>`;
      }).join('');
      const swKey=`${date}_${planId}_${bid}`;
      const isDoneBlock=localStorage.getItem(`ap_sw_${swKey}`)==='1';
      const chevron=`<svg class="ap-block-chevron${isCollapsed?'':' open'}" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
      const countBadge=isCollapsed?`<span class="ap-block-count">${items.length} ejercicio${items.length!==1?'s':''}</span>`:'';
      return`<div class="ap-block${isDoneBlock?' ap-block--done':''}" data-swkey="${swKey}">
        <div class="ap-block-head" data-action="aptoggleblock" data-bkey="${collapseKey}" style="color:${bInfo.color};">
          <span>${bInfo.label}${block.name&&block.name!==bInfo.label?' · '+block.name:''}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <label class="ap-switch" onclick="event.preventDefault();event.stopPropagation();toggleAthleteSwitch('${swKey}','${planId}','${date}');">
              <input type="checkbox" ${isDoneBlock?'checked':''}>
              <span class="ap-switch-track"></span>
            </label>
            ${countBadge}${chevron}
          </div>
        </div>
        ${isCollapsed?'':exHtml}
      </div>`;
    }).join('');
    const totalBlocks=blocks.length;
    const doneBlocks=blocks.filter(([bid2])=>localStorage.getItem(`ap_sw_${date}_${planId}_${bid2}`)==='1').length;
    const pct=totalBlocks>0?Math.round(doneBlocks/totalBlocks*100):0;
    const loggedBadge=existingLog&&!isLogging?`<span style="font-size:10px;background:#052e16;color:#22c55e;padding:2px 8px;border-radius:20px;font-weight:600;flex-shrink:0;">✓ Reg.</span>`:'';
    const editBtnHtml=existingLog?`<div class="ap-plan-log-bar"><button class="ap-log-edit-btn" data-action="aplogsession" data-date="${date}" data-planid="${planId}">✏ Editar registro</button></div>`:'';
    const logBtn=isToday&&!isLogging
      ?`<div class="ap-progress-wrap" id="ap-progress-${planId}">
          ${editBtnHtml}
          <div class="ap-progress-info">
            <span>${doneBlocks}/${totalBlocks} bloques</span>
            <span class="ap-progress-pct">${pct}%</span>
          </div>
          <div class="ap-progress-track"><div class="ap-progress-fill" style="width:${pct}%"></div></div>
          <button class="ap-complete-btn" id="ap-complete-${planId}" ${pct<100?'disabled':''} data-action="aplogsession" data-date="${date}" data-planid="${planId}">
            ${pct<100?`Completar rutina · ${pct}%`:'✓ Completar rutina'}
          </button>
        </div>`
      :'';
    return`<div class="ap-plan-card">
      <div class="ap-plan-head">
        <span class="ap-plan-name">${plan.name||'Plan de entrenamiento'}</span>
        <div style="display:flex;align-items:center;gap:6px;">${loggedBadge}</div>
      </div>
      ${isLogging?renderAthleteLogForm(blocks,date,planId,existingLog):blocksHtml+logBtn}
    </div>`;
  }).join('');
  return`<div style="padding-top:8px;">${navBar}${cards}</div>`;
}

function renderAthleteLogForm(blocks,date,planId,existingLog){
  const blocksHtml=blocks.map(([bid,block])=>{
    const bInfo=blockTypeInfo(block.type);
    const items=Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    if(!items.length) return'';
    const itemsHtml=items.map(([iid,item])=>{
      const sets=Object.values(item.sets||{}).sort((a,b)=>(a.order||0)-(b.order||0));
      if(!sets.length) return'';
      const setStr=formatAthleteSetStr(sets);
      const setsHtml=sets.map((s,idx)=>{
        const ex=existingLog?.[bid]?.[iid]?.[idx]||{};
        const isTime=s.type==='time';
        const weightInput=`<label class="ap-log-label">kg<input type="number" id="aplog_${bid}_${iid}_${idx}_weight" class="ap-log-input" inputmode="decimal" value="${ex.weight||s.weight||''}" placeholder="—"></label>`;
        const repsInput=isTime
          ?`<span class="ap-log-time-badge">${s.time?s.time+'s':'—'}</span>`
          :`<label class="ap-log-label">reps<input type="number" id="aplog_${bid}_${iid}_${idx}_reps" class="ap-log-input ap-log-input--sm" inputmode="numeric" value="${ex.reps||s.reps||''}" placeholder="—"></label>`;
        return`<div class="ap-log-set-row">
          <span class="ap-log-set-num">S${idx+1}</span>
          ${repsInput}
          ${weightInput}
        </div>`;
      }).join('');
      return`<div class="ap-log-item">
        <div class="ap-log-item-name">${item.exName||'Ejercicio'}</div>
        ${setStr?`<div class="ap-log-item-prescribed">${setStr} · prescripto</div>`:''}
        <div class="ap-log-sets">${setsHtml}</div>
      </div>`;
    }).join('');
    return`<div class="ap-block">
      <div class="ap-block-head" style="color:${bInfo.color};cursor:default;">
        <span>${bInfo.label}${block.name&&block.name!==bInfo.label?' · '+block.name:''}</span>
      </div>
      ${itemsHtml}
    </div>`;
  }).join('');
  return`${blocksHtml}
  <div class="ap-log-actions">
    <button class="ap-log-cancel-btn" data-action="apcancellog">Cancelar</button>
    <button class="ap-log-later-btn" data-action="apsavelog" data-date="${date}" data-planid="${planId}" data-later="1">Completar luego</button>
    <button class="ap-log-save-btn" data-action="apsavelog" data-date="${date}" data-planid="${planId}">Completar ✓</button>
  </div>`;
}

async function saveAthleteWorkoutLog(ctx,date,planId){
  const{tid,catId,pid}=ctx;
  const plan=S.teams[tid]?.categories?.[catId]?.sessions?.[date]?.plans?.[planId];
  if(!plan){showAlert('No se encontró el plan.');return;}
  const base=`teams/${tid}/categories/${catId}/sessions/${date}/workoutLog/${pid}/${planId}`;
  const updates={};
  const logCache={};
  Object.entries(plan.blocks||{}).forEach(([bid,block])=>{
    Object.entries(block.items||{}).forEach(([iid,item])=>{
      const sets=Object.values(item.sets||{}).sort((a,b)=>(a.order||0)-(b.order||0));
      sets.forEach((s,idx)=>{
        const isTime=s.type==='time';
        const wEl=document.getElementById(`aplog_${bid}_${iid}_${idx}_weight`);
        const rEl=!isTime?document.getElementById(`aplog_${bid}_${iid}_${idx}_reps`):null;
        const weight=wEl?.value.trim();
        const reps=rEl?.value.trim();
        const entry={};
        if(!isTime&&reps) entry.reps=reps;
        if(weight) entry.weight=weight;
        if(Object.keys(entry).length){
          updates[`${base}/${bid}/${iid}/${idx}`]=entry;
          if(!logCache[bid]) logCache[bid]={};
          if(!logCache[bid][iid]) logCache[bid][iid]={};
          logCache[bid][iid][idx]=entry;
        }
      });
    });
  });
  if(!Object.keys(updates).length){showAlert('Ingresá al menos un dato para guardar.');return;}
  try{
    await db.ref().update(updates);
    const catData=S.teams[tid].categories[catId];
    if(!catData.sessions) catData.sessions={};
    if(!catData.sessions[date]) catData.sessions[date]={};
    if(!catData.sessions[date].workoutLog) catData.sessions[date].workoutLog={};
    if(!catData.sessions[date].workoutLog[pid]) catData.sessions[date].workoutLog[pid]={};
    catData.sessions[date].workoutLog[pid][planId]=logCache;
    const _pName=S.teams[tid]?.categories?.[catId]?.sessions?.[date]?.plans?.[planId]?.name||'una rutina';
    const _pls=Object.values(S.teams[tid]?.categories?.[catId]?.players||{});
    const _pName2=_pls.find(p=>p.id===pid)?.name||'Un atleta';
    sendPushNotif({tid,notifyStaff:true,title:'Registro de entrenamiento',body:`${_pName2} completó ${_pName}.`,url:'/'});
    showAlert('✓ Registro guardado');
    S.athleteLogMode=null;
    render();
  }catch(e){showAlert('Error al guardar: '+e.message);}
}

function renderAthleteAttendance(ctx){
  const{tid,catId,pid}=ctx;
  const att=S.teams[tid]?.categories?.[catId]?.attendance||{};
  const sess=S.teams[tid]?.categories?.[catId]?.sessions||{};

  // ── Calendar ──────────────────────────────────────────────
  const offset=S.athleteCalOffset||0;
  const now=new Date();
  const calDate=new Date(now.getFullYear(),now.getMonth()+offset,1);
  const year=calDate.getFullYear(),month=calDate.getMonth();
  const MNAMES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const firstDow=calDate.getDay();
  const startOffset=firstDow===0?6:firstDow-1;
  const daysInMonth=new Date(year,month+1,0).getDate();

  const dhHtml=['L','M','X','J','V','S','D'].map(d=>`<div class="ap-cal-dh">${d}</div>`).join('');
  let cells='';
  for(let i=0;i<startOffset;i++) cells+=`<div class="ap-cal-day ap-cal-day--empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const status=att[ds]?.[pid];
    const hasW=!!sess[ds]?.wellness?.[pid];
    const isToday=ds===TODAY, isFuture=ds>TODAY;
    let dotCls='';
    if(status==='P'||status==='T') dotCls='ap-cal-dot--present';
    else if(status==='A') dotCls='ap-cal-dot--absent';
    else if(status==='L'||status==='J') dotCls='ap-cal-dot--justified';
    cells+=`<div class="ap-cal-day${isToday?' ap-cal-day--today':''}${isFuture?' ap-cal-day--future':''}">
      <span class="ap-cal-num">${d}</span>
      <span class="ap-cal-dot${dotCls?' '+dotCls:''}"></span>
      ${hasW&&!isFuture?`<span class="ap-cal-wdot"></span>`:''}
    </div>`;
  }
  const canNext=offset<0;
  const prevBtn=`<button class="ap-cal-nbtn" data-action="aptogglecalmonth" data-dir="-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>`;
  const nextBtn=`<button class="ap-cal-nbtn${!canNext?' ap-cal-nbtn--dim':''}" data-action="aptogglecalmonth" data-dir="1"${!canNext?' disabled':''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>`;
  const calHtml=`<div class="ap-cal">
    <div class="ap-cal-nav">${prevBtn}<span class="ap-cal-title">${MNAMES[month]} ${year}</span>${nextBtn}</div>
    <div class="ap-cal-grid">${dhHtml}${cells}</div>
    <div class="ap-cal-legend">
      <span class="ap-cal-leg"><span class="ap-cal-dot ap-cal-dot--present"></span>Presente</span>
      <span class="ap-cal-leg"><span class="ap-cal-dot ap-cal-dot--absent"></span>Ausente</span>
      <span class="ap-cal-leg"><span class="ap-cal-dot ap-cal-dot--justified"></span>Justificado</span>
      <span class="ap-cal-leg"><span class="ap-cal-wdot" style="position:static;display:inline-block;"></span>Check-in</span>
    </div>
  </div>`;

  // ── Stats for displayed month ──────────────────────────────
  const statusLabel={P:'Presente',T:'Presente',A:'Ausente',L:'Lesión',J:'Justificado'};
  const monthRows=[];
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(ds>TODAY) break;
    const status=att[ds]?.[pid];
    if(status) monthRows.push({date:ds,status});
  }
  const presentCount=monthRows.filter(r=>r.status==='P'||r.status==='T').length;
  const total=monthRows.length;
  const pct=total>0?Math.round(presentCount/total*100):null;
  const pctColor=pct===null?'var(--text-2)':pct>=85?'var(--ok)':pct>=70?'#eab308':'var(--bad)';
  const summaryHtml=total>0?`<div style="display:flex;gap:10px;padding:12px 16px;">
    <div style="flex:1;background:var(--bg-2);border-radius:var(--r-2);padding:10px 14px;border:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;">Asistencia</div>
      <div style="font-size:24px;font-weight:700;font-family:var(--font-mono);color:${pctColor};margin-top:2px;">${pct!==null?pct+'%':'—'}</div>
    </div>
    <div style="flex:1;background:var(--bg-2);border-radius:var(--r-2);padding:10px 14px;border:1px solid var(--line);">
      <div style="font-size:10px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;">Sesiones</div>
      <div style="font-size:24px;font-weight:700;font-family:var(--font-mono);color:var(--text-0);margin-top:2px;">${presentCount}<span style="font-size:14px;color:var(--text-2);">/${total}</span></div>
    </div>
  </div>`:'';
  const attRows=[...monthRows].reverse().map(({date,status})=>
    `<div class="ap-att-row">
      <span class="ap-att-date">${fmtDate(date)}</span>
      <span class="ap-att-badge ap-att-${status}">${statusLabel[status]||status}</span>
    </div>`
  ).join('');
  return`<div style="padding-top:8px;">${calHtml}${summaryHtml}${attRows?`<div class="ap-att-list">${attRows}</div>`:''}</div>`;
}

function renderAthleteProgressReport(ctx){
  const{tid,catId,pid}=ctx;
  const cat=S.teams[tid]?.categories?.[catId]||{};
  const cd={players:Object.values(cat.players||{}),attendance:cat.attendance||{},sessions:cat.sessions||{}};
  const player=cd.players.find(p=>p.id===pid)||{id:pid,name:''};
  const selM=calcMetrics(cd,pid);
  const stats=getStats([player],cd.attendance);
  const selStat=stats[0]||{pct:null,P:0,A:0};
  const acZ=acwrZone(selM.acwr);
  // KPI row
  const _kpi=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line);border-top:1px solid var(--line);margin-bottom:10px;">
    <div class="q-stat" style="border-radius:0;border:0;padding:10px 8px;"><div class="q-stat__row"><span class="q-stat__label" style="font-size:9px;">Asistencia</span></div><div class="q-stat__val" style="font-size:17px;color:${selStat.pct!=null?(selStat.pct>=85?'var(--ok)':selStat.pct>=70?'var(--warn)':'var(--bad)'):'var(--text-0)'};">${selStat.pct!=null?selStat.pct+'%':'—'}</div><div class="q-stat__sub" style="font-size:10px;"><span>${selStat.P??0}P · ${selStat.A??0}A</span></div></div>
    <div class="q-stat" style="border-radius:0;border:0;padding:10px 8px;"><div class="q-stat__row"><span class="q-stat__label" style="font-size:9px;">Carga 7D</span></div><div class="q-stat__val" style="font-size:17px;">${selM.ac}<span class="u" style="font-size:10px;">UA</span></div><div class="q-stat__sub" style="font-size:10px;"><span>crónica: ${selM.cc}</span></div></div>
    <div class="q-stat" style="border-radius:0;border:0;padding:10px 8px;"><div class="q-stat__row"><span class="q-stat__label" style="font-size:9px;">ACWR</span></div><div class="q-stat__val" style="font-size:17px;color:${acZ.fg};">${selM.acwr!==null?selM.acwr:'—'}</div><div class="q-stat__sub" style="font-size:10px;"><span style="color:${acZ.fg};">${acZ.label}</span></div></div>
    <div class="q-stat" style="border-radius:0;border:0;padding:10px 8px;"><div class="q-stat__row"><span class="q-stat__label" style="font-size:9px;">Wellness</span></div><div class="q-stat__val" style="font-size:17px;color:${wellZone(selM.wellAvg).fg};">${selM.wellAvg!==null?selM.wellAvg:'—'}<span class="u" style="font-size:10px;">/5</span></div><div class="q-stat__sub" style="font-size:10px;"><span>7 días</span></div></div>
  </div>`;
  // 7-day load sparkline
  const _l7=selM.l7;const _maxL=Math.max(..._l7,1);
  const _sparkDays=Array.from({length:7},(_,i)=>{const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-6+i);return d.toISOString().split('T')[0];});
  const _DAY=['D','L','M','X','J','V','S'];
  const _spark=`<div class="ap-chart-card" style="margin-bottom:10px;">
    <h3 style="margin-bottom:10px;">Carga últimos 7 días</h3>
    <div style="display:flex;gap:3px;align-items:flex-end;height:56px;">
      ${_l7.map((v,i)=>{const h=_maxL>0?Math.max(Math.round(v/_maxL*44),v>0?3:0):0;const col=v?sparkColor(v,_maxL):'var(--bg-3)';const dow=new Date(_sparkDays[i]+'T12:00:00').getDay();return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="font-size:8px;color:var(--text-3);">${v||''}</div><div style="width:100%;background:${col};border-radius:3px 3px 0 0;height:${h}px;"></div><div style="font-size:8px;color:var(--text-3);">${_DAY[dow]}</div></div>`;}).join('')}
    </div>
  </div>`;
  // 30-day attendance strip
  const _att30=Array.from({length:30},(_,i)=>{const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-29+i);return d.toISOString().split('T')[0];});
  const _strip=`<div class="ap-chart-card" style="margin-bottom:10px;">
    <h3 style="margin-bottom:10px;">Asistencia últimos 30 días</h3>
    <div style="display:flex;flex-wrap:wrap;gap:3px;">
      ${_att30.map(ds=>{const s=cd.attendance[ds]?.[pid];const col=!s?'var(--bg-3)':(s==='P'||s==='T')?'var(--ok)':s==='L'||s==='J'?'var(--warn)':'var(--bad)';return`<div title="${ds}: ${s||'—'}" style="width:13px;height:13px;border-radius:2px;background:${col};flex-shrink:0;"></div>`;}).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;">
      ${[['var(--ok)','Presente'],['var(--bad)','Ausente'],['var(--warn)','Licencia'],['var(--bg-3)','Sin registro']].map(([c,l])=>`<span style="display:flex;align-items:center;gap:4px;font-size:9.5px;color:var(--text-3);"><span style="width:8px;height:8px;border-radius:1.5px;background:${c};display:inline-block;flex-shrink:0;"></span>${l}</span>`).join('')}
    </div>
  </div>`;
  // Body composition
  const selAth=getAthlete(athleteKey(tid,catId,pid));
  const _morphKeys=Object.keys(selAth?.morphology||{}).sort().reverse();
  const _anthrKeys=Object.keys(selAth?.anthropometry||{}).sort().reverse();
  const _lm=_morphKeys[0]?selAth.morphology[_morphKeys[0]]:null;
  const _la=_anthrKeys[0]?selAth.anthropometry[_anthrKeys[0]]:null;
  const _pAdip=_la?.masaAdip&&_lm?.weight?(_la.masaAdip/_lm.weight*100).toFixed(1):null;
  const _pMusc=_la?.masaMusc&&_lm?.weight?(_la.masaMusc/_lm.weight*100).toFixed(1):null;
  const _bodyDate=_la?.date||_lm?.date;
  const _bodyStats=[
    _lm?.weight!=null?{l:'Peso',v:_lm.weight,u:'kg'}:null,
    _lm?.height!=null?{l:'Talla',v:_lm.height,u:'cm'}:null,
    _la?.masaAdip!=null?{l:'M. Adiposa',v:_la.masaAdip,u:'kg'}:null,
    _pAdip!=null?{l:'% Adiposa',v:_pAdip,u:'%'}:null,
    _la?.masaMusc!=null?{l:'M. Muscular',v:_la.masaMusc,u:'kg'}:null,
    _pMusc!=null?{l:'% Muscular',v:_pMusc,u:'%'}:null,
    _la?.sumSkinfolds!=null?{l:'Σ Pliegues',v:_la.sumSkinfolds,u:'mm'}:null,
  ].filter(Boolean);
  const _body=_bodyStats.length?`<div class="ap-chart-card" style="margin-bottom:10px;">
    <h3>Composición corporal${_bodyDate?` <span style="font-weight:400;font-size:11px;color:var(--text-3);">· ${fmtDate(_bodyDate)}</span>`:''}</h3>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">${_bodyStats.map(s=>`<div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-0);">${s.v}<span style="font-size:9px;font-weight:400;color:var(--text-2);margin-left:1px;">${s.u}</span></div><div style="font-size:9.5px;color:var(--text-3);margin-top:2px;white-space:nowrap;">${s.l}</div></div>`).join('')}</div>
  </div>`:'';
  // Jumps
  const _jumpKeys=Object.keys(selAth?.jumpTests||{}).sort().reverse();
  const _lj=_jumpKeys[0]?selAth.jumpTests[_jumpKeys[0]]:null;
  const _rsi=_lj?.djHeight&&_lj?.djTc?Math.round((_lj.djHeight/100)/(_lj.djTc/1000)*100)/100:null;
  const _jumpStats=[
    _lj?.sj!=null?{l:'SJ',v:_lj.sj,u:'cm',c:'var(--text-0)'}:null,
    _lj?.cmj!=null?{l:'CMJ',v:_lj.cmj,u:'cm',c:'var(--accent)'}:null,
    _lj?.abk!=null?{l:'ABK',v:_lj.abk,u:'cm',c:'var(--text-0)'}:null,
    _rsi!=null?{l:'RSI',v:_rsi,u:'',c:_rsi>=2?'var(--ok)':_rsi>=1.5?'var(--warn)':'var(--bad)'}:null,
  ].filter(Boolean);
  const _jumps=_jumpStats.length?`<div class="ap-chart-card" style="margin-bottom:10px;">
    <h3>Saltos${_lj?.date?` <span style="font-weight:400;font-size:11px;color:var(--text-3);">· ${fmtDate(_lj.date)}</span>`:''}</h3>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">${_jumpStats.map(s=>`<div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:${s.c};">${s.v}${s.u?`<span style="font-size:10px;font-weight:400;color:var(--text-2);margin-left:2px;">${s.u}</span>`:''}</div><div style="font-size:9.5px;color:var(--text-3);margin-top:2px;">${s.l}</div></div>`).join('')}</div>
  </div>`:'';
  // FMS
  const _fmsKeys=Object.keys(selAth?.fmsTests||{}).sort().reverse();
  const _lfms=_fmsKeys[0]?selAth.fmsTests[_fmsKeys[0]]:null;
  const _fmsMinBi=(l,r)=>l!=null&&r!=null?Math.min(l,r):l!=null?l:r!=null?r:null;
  const _fmsScores=_lfms?[_lfms.deepSquat,_fmsMinBi(_lfms.hurdleL,_lfms.hurdleR),_fmsMinBi(_lfms.lungeL,_lfms.lungeR),_fmsMinBi(_lfms.shoulderL,_lfms.shoulderR),_fmsMinBi(_lfms.aslrL,_lfms.aslrR),_lfms.trunkStab,_fmsMinBi(_lfms.rotaryL,_lfms.rotaryR)].filter(v=>v!=null):[];
  const _fmsTotal=_fmsScores.length?_fmsScores.reduce((a,b)=>a+b,0):null;
  const _fms=_fmsTotal!=null?`<div class="ap-chart-card" style="margin-bottom:10px;">
    <h3>FMS${_lfms?.date?` <span style="font-weight:400;font-size:11px;color:var(--text-3);">· ${fmtDate(_lfms.date)}</span>`:''}</h3>
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="text-align:center;"><div style="font-family:var(--font-mono);font-size:22px;font-weight:700;color:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};">${_fmsTotal}</div><div style="font-size:9.5px;color:var(--text-3);">/ ${_fmsScores.length*3} pts</div></div>
      <div style="flex:1;height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${Math.round(_fmsTotal/(_fmsScores.length*3)*100)}%;background:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};border-radius:3px;"></div></div>
      <span style="font-size:11px;color:${_fmsTotal>=14?'var(--ok)':_fmsTotal>=10?'var(--warn)':'var(--bad)'};font-weight:600;">${_fmsTotal>=14?'Óptimo':_fmsTotal>=10?'Aceptable':'Revisar'}</span>
    </div>
  </div>`:'';
  // Injuries
  const injKey=athleteKey(tid,catId,pid);
  let _injuries='';
  if(S.medInjuries[injKey]===undefined){
    loadPlayerInjuries(injKey);
    _injuries=`<div class="ap-chart-card" style="margin-bottom:10px;"><h3>Lesiones</h3><div style="font-size:11px;color:var(--text-3);">Cargando…</div></div>`;
  } else {
    const sixMonthsAgo=new Date(TODAY+'T12:00:00');sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
    const cutoff=sixMonthsAgo.toISOString().split('T')[0];
    const playerInjs=Object.values(S.medInjuries[injKey]||{}).filter(inj=>inj.status==='activa'||inj.status==='en_rehab'||(inj.date&&inj.date>=cutoff)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    if(playerInjs.length){
      const injRows=playerInjs.map(inj=>{
        const sc=injSevColor(inj.severity||1);
        const stCl=inj.status==='activa'?'var(--bad)':inj.status==='en_rehab'?'var(--warn)':'var(--ok)';
        const stLbl=inj.status==='activa'?'Activa':inj.status==='en_rehab'?'En rehab':'Recuperada';
        const typeStr=inj.type?` · <span style="font-weight:400;color:var(--text-2);">${inj.type}</span>`:'';
        const dateStr=inj.date?`<span style="font-size:10px;color:var(--text-3);">${fmtDate(inj.date)}</span>`:'';
        return`<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 10px;background:var(--bg-3);border-radius:var(--r-2);border-left:3px solid ${sc};"><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:var(--text-0);">${regionLabel(inj.region||'')}${typeStr}</div><div style="display:flex;align-items:center;gap:8px;margin-top:3px;"><span style="font-size:10px;color:${stCl};font-weight:600;">${stLbl}</span>${dateStr}</div></div><span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r-pill);background:${sc}20;color:${sc};flex-shrink:0;">N${inj.severity||1}</span></div>`;
      }).join('');
      _injuries=`<div class="ap-chart-card" style="margin-bottom:10px;"><h3>Lesiones activas / recientes</h3><div style="display:flex;flex-direction:column;gap:6px;">${injRows}</div></div>`;
    }
  }
  return _kpi+_spark+_strip+_body+_jumps+_fms+_injuries;
}

function buildAthleteWeightHistory(tid,catId,pid){
  const sessions=S.teams[tid]?.categories?.[catId]?.sessions||{};
  const exMap={};
  Object.entries(sessions).forEach(([date,sess])=>{
    const pidLog=sess?.workoutLog?.[pid];
    if(!pidLog) return;
    Object.entries(pidLog).forEach(([planId,planLog])=>{
      Object.entries(planLog).forEach(([bid,blockLog])=>{
        Object.entries(blockLog).forEach(([iid,setLog])=>{
          const item=sess?.plans?.[planId]?.blocks?.[bid]?.items?.[iid];
          if(!item) return;
          const exKey=item.exId||item.exName;
          const exName=item.exName||String(exKey);
          let maxW=null;
          Object.values(setLog).forEach(entry=>{
            const w=parseFloat(entry.weight);
            if(!isNaN(w)&&w>0&&(maxW===null||w>maxW)) maxW=w;
          });
          if(maxW===null) return;
          if(!exMap[exKey]) exMap[exKey]={name:exName,dates:[]};
          const exist=exMap[exKey].dates.find(d=>d.date===date);
          if(!exist) exMap[exKey].dates.push({date,maxW});
          else if(maxW>exist.maxW) exist.maxW=maxW;
        });
      });
    });
  });
  Object.values(exMap).forEach(ex=>ex.dates.sort((a,b)=>a.date.localeCompare(b.date)));
  return exMap;
}

function renderAthleteProgress(ctx){
  const{tid,catId,pid}=ctx;
  const sessions=S.teams[tid]?.categories?.[catId]?.sessions||{};
  const wellData=[];
  for(let i=29;i>=0;i--){
    const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);
    const date=d.toISOString().split('T')[0];
    const w=sessions[date]?.wellness?.[pid];
    if(w) wellData.push({date,wellness:w});
  }
  const wellSection=wellData.length?`
    <div style="padding:4px 16px 4px;font-size:12px;color:var(--text-2);">Promedio últimos 30 días</div>
    <div class="ap-well-stats">${W_KEYS.map(k=>{
      const vals=wellData.map(d=>d.wellness[k]).filter(v=>v!=null);
      const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):null;
      const color=avg?wellColor(Math.round(parseFloat(avg))):'var(--text-2)';
      return`<div class="ap-well-stat"><div class="ap-well-stat__icon">${W_SVGS[k]}</div><div class="ap-well-stat__label">${W_LABELS[k]}</div><div class="ap-well-stat__val" style="color:${color};">${avg||'—'}</div></div>`;
    }).join('')}</div>
    <div class="ap-chart-card"><h3>Evolución del wellness</h3><canvas id="chart-athlete-wellness" height="160"></canvas></div>`
    :`<div style="padding:16px 16px 0;font-size:12px;color:var(--text-2);text-align:center;">Sin check-ins de wellness aún.</div>`;
  const exMap=buildAthleteWeightHistory(tid,catId,pid);
  const exList=Object.entries(exMap).sort((a,b)=>b[1].dates.length-a[1].dates.length);
  if(!S.athleteProgressEx||!exMap[S.athleteProgressEx]) S.athleteProgressEx=exList[0]?.[0]||null;
  const selKey=S.athleteProgressEx;
  const weightSection=exList.length
    ?`<div class="ap-chart-card" style="margin-top:10px;">
        <h3>Historial de pesos</h3>
        <select class="ap-ex-select" onchange="S.athleteProgressEx=this.value;initAthleteWeightChart();">
          ${exList.map(([key,ex])=>`<option value="${key}"${key===selKey?' selected':''}>${ex.name} (${ex.dates.length} sesión${ex.dates.length!==1?'es':''})</option>`).join('')}
        </select>
        <canvas id="chart-athlete-weight" height="160" style="margin-top:14px;"></canvas>
      </div>`
    :`<div class="ap-chart-card" style="margin-top:10px;text-align:center;padding:20px 16px;">
        <div style="font-size:28px;margin-bottom:8px;">🏋️</div>
        <div style="font-size:13px;color:var(--text-2);">Registrá pesos en tus rutinas para ver el historial aquí.</div>
      </div>`;
  const reportSection=renderAthleteProgressReport(ctx);
  return`<div style="padding-top:8px;">${reportSection}${wellSection}${weightSection}</div>`;
}

function initAthleteChart(){
  const ctx=getAthleteCtx();
  if(!ctx||typeof Chart==='undefined') return;
  const{tid,catId,pid}=ctx;
  const sessions=S.teams[tid]?.categories?.[catId]?.sessions||{};
  const data=[];
  for(let i=29;i>=0;i--){
    const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()-i);
    const date=d.toISOString().split('T')[0];
    const w=sessions[date]?.wellness?.[pid];
    if(w){
      const vals=W_KEYS.map(k=>w[k]).filter(v=>v!=null);
      if(vals.length===5) data.push({date,avg:Math.round(vals.reduce((a,b)=>a+b,0)/5*10)/10});
    }
  }
  if(data.length<2) return;
  mkChart('chart-athlete-wellness',{
    type:'line',
    data:{
      labels:data.map(d=>fmtDate(d.date)),
      datasets:[{
        label:'Wellness',data:data.map(d=>d.avg),
        borderColor:'#FF6A1A',backgroundColor:'#FF6A1A22',
        borderWidth:2,pointRadius:3,pointBackgroundColor:'#FF6A1A',tension:0.3,fill:true
      }]
    },
    options:{plugins:{legend:{display:false}},scales:{y:{min:1,max:5}}}
  });
}

function initAthleteWeightChart(){
  const ctx=getAthleteCtx();
  if(!ctx||typeof Chart==='undefined') return;
  const{tid,catId,pid}=ctx;
  const exMap=buildAthleteWeightHistory(tid,catId,pid);
  const exList=Object.entries(exMap).sort((a,b)=>b[1].dates.length-a[1].dates.length);
  if(!exList.length) return;
  const selKey=S.athleteProgressEx||exList[0][0];
  const ex=exMap[selKey];
  if(!ex||!ex.dates.length) return;
  mkChart('chart-athlete-weight',{
    type:'line',
    data:{
      labels:ex.dates.map(d=>fmtDate(d.date)),
      datasets:[{
        label:'Peso máx (kg)',
        data:ex.dates.map(d=>d.maxW),
        borderColor:'#FF6A1A',backgroundColor:'#FF6A1A22',
        borderWidth:2,pointRadius:4,pointBackgroundColor:'#FF6A1A',tension:0.2,fill:true
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{y:{title:{display:true,text:'kg',color:'#888'},ticks:{color:'#888'}}}
    }
  });
}

async function saveAthleteCheckin(ctx){
  const{tid,catId,pid}=ctx;
  if(!catId||!pid){showAlert('Tu cuenta no tiene una categoría o jugador asignado. Pedile al entrenador que te reenvíe la invitación con categoría asignada.');return;}
  const ci=S.athleteCheckin||{};
  const{sleep,fatigue,soreness,stress,mood,rpe,rpeDate,sessionDuration}=ci;
  const sessionBase=`teams/${tid}/categories/${catId}/sessions`;
  const updates={};
  if(W_KEYS.every(k=>ci[k]!=null)){
    updates[`${sessionBase}/${TODAY}/wellness/${pid}`]={sleep,fatigue,soreness,stress,mood};
  }
  if(rpe!=null&&rpeDate){
    updates[`${sessionBase}/${rpeDate}/playerRPE/${pid}`]=rpe;
  }
  if(sessionDuration!=null&&rpeDate){
    updates[`${sessionBase}/${rpeDate}/playerDuration/${pid}`]=sessionDuration;
  }
  if(!Object.keys(updates).length){showAlert('Completá el wellness o el RPE para guardar.');return;}
  try{
    await db.ref().update(updates);
    // Update local cache
    const catData=S.teams[tid].categories[catId];
    if(!catData.sessions) catData.sessions={};
    if(updates[`${sessionBase}/${TODAY}/wellness/${pid}`]){
      if(!catData.sessions[TODAY]) catData.sessions[TODAY]={};
      if(!catData.sessions[TODAY].wellness) catData.sessions[TODAY].wellness={};
      catData.sessions[TODAY].wellness[pid]={sleep,fatigue,soreness,stress,mood};
    }
    if(rpe!=null&&rpeDate){
      if(!catData.sessions[rpeDate]) catData.sessions[rpeDate]={};
      if(!catData.sessions[rpeDate].playerRPE) catData.sessions[rpeDate].playerRPE={};
      catData.sessions[rpeDate].playerRPE[pid]=rpe;
    }
    if(sessionDuration!=null&&rpeDate){
      if(!catData.sessions[rpeDate]) catData.sessions[rpeDate]={};
      if(!catData.sessions[rpeDate].playerDuration) catData.sessions[rpeDate].playerDuration={};
      catData.sessions[rpeDate].playerDuration[pid]=sessionDuration;
    }
    showAlert('✓ Check-in guardado');
    S.athleteCheckin=null; // re-init from saved on next render
    render();
  }catch(e){devErr(e);showAlert('Error al guardar check-in.');}
}
