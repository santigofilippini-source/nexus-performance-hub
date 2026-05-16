// ── render-medical.js — Módulo Médico/Lesiones ──
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


const BM_FRONT={
  cabeza:       'M75,19 A15,18,0,1,0,45,19 A15,18,0,1,0,75,19Z',
  cuello:       'M54,37 L66,37 L67,50 L53,50Z',
  hombro_izq:   'M53,50 Q34,48 14,62 L28,70 Q38,69 42,70 L53,70Z',
  hombro_der:   'M67,50 Q86,48 106,62 L92,70 Q82,69 78,70 L67,70Z',
  pecho:        'M42,70 L78,70 L78,97 Q60,103 42,97Z',
  brazo_izq:    'M14,62 L28,70 L21,112 L8,108Z',
  brazo_der:    'M106,62 L92,70 L99,112 L112,108Z',
  codo_izq:     'M8,108 L21,112 L19,124 L6,120Z',
  codo_der:     'M112,108 L99,112 L101,124 L114,120Z',
  antebrazo_izq:'M6,120 L19,124 L17,163 L4,159Z',
  antebrazo_der:'M114,120 L101,124 L103,163 L116,159Z',
  muneca_izq:   'M4,159 L17,163 L15,187 Q9,193 5,188 Q3,179 7,173Z',
  muneca_der:   'M116,159 L103,163 L105,187 Q111,193 115,188 Q117,179 113,173Z',
  abdomen:      'M42,97 Q60,103 78,97 L78,125 L42,125Z',
  cadera_izq:   'M42,125 L60,125 L57,150 L38,150 Q40,136 42,125Z',
  cadera_der:   'M60,125 L78,125 Q80,136 82,150 L63,150 L60,125Z',
  cuad_izq:     'M38,150 L57,150 L54,210 L36,210Z',
  cuad_der:     'M63,150 L82,150 L84,210 L66,210Z',
  rodilla_izq:  'M36,210 L54,210 Q52,219 50,228 L36,228 Q34,219 36,210Z',
  rodilla_der:  'M66,210 L84,210 Q86,219 84,228 L70,228 Q68,219 66,210Z',
  tibial_izq:   'M36,228 L50,228 L50,270 L36,270Z',
  tibial_der:   'M70,228 L84,228 L84,270 L70,270Z',
  tobillo_izq:  'M36,270 L50,270 L53,282 L20,282 Q34,278 36,270Z',
  tobillo_der:  'M70,270 L84,270 Q86,278 100,282 L70,282 L70,270Z',
  pie_izq:      'M20,282 L53,282 L53,292 L18,292Z',
  pie_der:      'M70,282 L100,282 Q104,286 104,292 L67,292Z',
};
const BM_BACK={
  cabeza:       'M75,19 A15,18,0,1,0,45,19 A15,18,0,1,0,75,19Z',
  cuello:       'M54,37 L66,37 L67,50 L53,50Z',
  hombro_izq:   'M53,50 Q34,48 14,62 L28,70 Q38,69 42,70 L53,70Z',
  hombro_der:   'M67,50 Q86,48 106,62 L92,70 Q82,69 78,70 L67,70Z',
  espalda_alta: 'M42,70 L78,70 L78,97 Q60,103 42,97Z',
  brazo_izq:    'M14,62 L28,70 L21,112 L8,108Z',
  brazo_der:    'M106,62 L92,70 L99,112 L112,108Z',
  codo_izq:     'M8,108 L21,112 L19,124 L6,120Z',
  codo_der:     'M112,108 L99,112 L101,124 L114,120Z',
  antebrazo_izq:'M6,120 L19,124 L17,163 L4,159Z',
  antebrazo_der:'M114,120 L101,124 L103,163 L116,159Z',
  muneca_izq:   'M4,159 L17,163 L15,187 Q9,193 5,188 Q3,179 7,173Z',
  muneca_der:   'M116,159 L103,163 L105,187 Q111,193 115,188 Q117,179 113,173Z',
  espalda_baja: 'M42,97 Q60,103 78,97 L78,125 L42,125Z',
  gluteo_izq:   'M42,125 L60,125 L57,152 L36,152 Q39,138 42,125Z',
  gluteo_der:   'M60,125 L78,125 Q80,138 84,152 L63,152 L60,125Z',
  isquio_izq:   'M36,152 L57,152 L54,210 L36,210Z',
  isquio_der:   'M63,152 L84,152 L84,210 L66,210Z',
  rodilla_izq:  'M36,210 L54,210 Q52,219 50,228 L36,228 Q34,219 36,210Z',
  rodilla_der:  'M66,210 L84,210 Q86,219 84,228 L70,228 Q68,219 66,210Z',
  tibial_izq:   'M36,228 L50,228 L50,270 L36,270Z',
  tibial_der:   'M70,228 L84,228 L84,270 L70,270Z',
  tobillo_izq:  'M36,270 L50,270 L53,282 L20,282 Q34,278 36,270Z',
  tobillo_der:  'M70,270 L84,270 Q86,278 100,282 L70,282 L70,270Z',
  pie_izq:      'M20,282 L53,282 L53,292 L18,292Z',
  pie_der:      'M70,282 L100,282 Q104,286 104,292 L67,292Z',
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

