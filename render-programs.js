// ── render-programs.js — Biblioteca, Programas, Planes, ExPicker ──
function renderBibliotecaHub(){
  const progCount=Object.keys(S.programs||{}).length;
  const myExCount=Object.keys(S.exercises?.personal||{}).length;
  const qExCount=Object.keys(S.exercises?.qoore||{}).length;
  const svg=(d)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const card=(icon,title,sub,action)=>`
    <div onclick="${action}" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg-card);border-radius:14px;border:1px solid var(--line);cursor:pointer;margin-bottom:10px;">
      <div style="width:42px;height:42px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:14px;color:var(--text);">${title}</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${sub}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>`;
  return `<div class="wrap" style="padding-top:20px;">
    <h2 style="font-size:17px;font-weight:700;margin-bottom:16px;color:var(--text);">Biblioteca</h2>
    ${card(svg('M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z'),'Programas',`${progCount} programa${progCount!==1?'s':''}`,"S.view='programs';S.programView=null;render();")}
    ${card(svg('M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'),'Mis ejercicios',`${myExCount} ejercicio${myExCount!==1?'s':''}`,"S.view='myexercises';render();")}
    ${card(svg('M13 2L3 14h9l-1 8 10-12h-9l1-8z'),'Ejercicios Qoore',`${qExCount} disponibles`,"S.view='qooreexercises';render();")}
  </div>`;
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

  // SVG helpers
  const svgChevronDown=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  const svgChevronRight=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  const svgFolder=`<svg width="15" height="15" viewBox="0 0 24 24" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  const svgFolderGray=`<svg width="15" height="15" viewBox="0 0 24 24" fill="var(--bg-3)" stroke="var(--text-3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  const svgEdit=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const svgDupe=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const svgTrash=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

  // Group by folder — merge Firebase folder names with program-derived folders
  const folderMap={};
  progs.forEach(([pid,p])=>{const f=p.folder||'';if(!folderMap[f])folderMap[f]=[];folderMap[f].push([pid,p]);});
  const namedFolders=[...new Set([
    ...Object.keys(S.programFolderNames||{}).filter(f=>f),
    ...Object.keys(folderMap).filter(f=>f)
  ])].sort((a,b)=>a.localeCompare(b));
  const hasUncategorized=!!(folderMap['']?.length);

  // Program card
  const progCard=([pid,p])=>{
    const days=Object.values(p.days||{});
    return `<div class="q-card q-prog-card" data-action="openprog" data-pid="${pid}" style="cursor:pointer;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">📋</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:15px;color:var(--text);">${p.name||'Sin nombre'}</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${days.length} ${days.length===1?'rutina':'rutinas'}</div>
        </div>
        <button class="q-icon-btn" data-action="editprog" data-pid="${pid}" title="Editar" onclick="event.stopPropagation();">${svgEdit}</button>
        <button class="q-icon-btn" data-action="duplicateprog" data-pid="${pid}" title="Duplicar" onclick="event.stopPropagation();">${svgDupe}</button>
        <button class="q-icon-btn" data-action="deleteprog" data-pid="${pid}" title="Eliminar" onclick="event.stopPropagation();" style="color:var(--bad);opacity:.7;">${svgTrash}</button>
      </div>
      ${days.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">`+
        Object.entries(p.days||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0)).map(([did,d])=>
          `<span class="q-day-chip" data-action="openprogday" data-pid="${pid}" data-did="${did}" onclick="event.stopPropagation();">${d.name||'Día'}</span>`
        ).join('')+`</div>`:''}
    </div>`;
  };

  // Folder section
  const folderSection=(folderName,folderProgs,isUncategorized=false)=>{
    const collapsed=S.collapsedFolders?.[folderName]===true;
    const isRenaming=!isUncategorized&&S.renamingFolder===folderName;
    const esc=folderName.replace(/"/g,'&quot;');
    const header=isRenaming
      ?`<div style="display:flex;align-items:center;gap:8px;flex:1;" onclick="event.stopPropagation();">
          ${svgFolder}
          <input type="text" id="folder-rename-input" value="${esc}" class="q-input" style="flex:1;height:30px;font-size:13px;padding:0 8px;">
          <button class="q-btn q-btn--primary" style="height:30px;font-size:12px;padding:0 12px;" data-action="savefoldername" data-folder="${esc}" onclick="event.stopPropagation();">Guardar</button>
          <button class="q-btn" style="height:30px;font-size:12px;padding:0 10px;" data-action="cancelfoldername" onclick="event.stopPropagation();">✕</button>
        </div>`
      :`<div style="display:flex;align-items:center;gap:8px;flex:1;">
          ${collapsed?svgChevronRight:svgChevronDown}
          ${isUncategorized?svgFolderGray:svgFolder}
          <span style="font-weight:600;font-size:13px;color:${isUncategorized?'var(--text-2)':'var(--text)'};">${isUncategorized?'Sin carpeta':folderName}</span>
          <span style="font-size:11px;color:var(--text-3);background:var(--bg-3);padding:1px 7px;border-radius:99px;font-weight:500;">${(folderMap[folderName]||[]).length}</span>
          <div style="flex:1;"></div>
          ${!isUncategorized?`<button class="q-icon-btn" data-action="renamefolder" data-folder="${esc}" title="Renombrar" onclick="event.stopPropagation();" style="opacity:.5;">${svgEdit}</button>
          <button class="q-icon-btn" data-action="deletefolder" data-folder="${esc}" title="Eliminar carpeta" onclick="event.stopPropagation();" style="opacity:.5;color:var(--bad);">${svgTrash}</button>`:''}
        </div>`;
    return`<div style="margin-bottom:4px;">
      <div data-action="${isRenaming?'':'togglefolder'}" data-folder="${esc}"
           style="display:flex;align-items:center;gap:8px;padding:8px 6px;cursor:${isRenaming?'default':'pointer'};border-radius:8px;transition:background .15s;" onmouseenter="if(!${isRenaming})this.style.background='var(--bg-2)';" onmouseleave="this.style.background='transparent';">
        ${header}
      </div>
      ${!collapsed?`<div style="display:flex;flex-direction:column;gap:10px;padding-left:8px;margin-bottom:12px;">${
        folderProgs.length
          ? folderProgs.map(progCard).join('')
          : `<div style="padding:20px 16px;text-align:center;color:var(--text-3);font-size:13px;border:1px dashed var(--line);border-radius:10px;">Carpeta vacía — asigná un programa acá al crearlo o editarlo</div>`
      }</div>`:''}
    </div>`;
  };

  // Build main content
  let mainContent='';
  if(!progs.length&&!form){
    mainContent=`<div class="q-empty-state"><div style="font-size:36px;margin-bottom:12px;">📋</div><div style="font-weight:600;margin-bottom:4px;">Sin programas todavía</div><div style="font-size:13px;color:var(--text-2);">Creá tu primer programa de entrenamiento</div></div>`;
  } else {
    mainContent=namedFolders.map(f=>folderSection(f,folderMap[f]||[])).join('');
    if(hasUncategorized) mainContent+=folderSection('',folderMap[''],true);
  }

  // Get all folder names for the form dropdown
  const allFolders=namedFolders;
  const formHtml=form?`<div class="q-card" style="margin-bottom:16px;">
    <div class="q-card__h"><h3>${form.mode==='edit'?'Editar programa':'Nuevo programa'}</h3></div>
    <div class="q-card__b" style="padding:12px 16px;">
      <div class="form-field" style="margin-bottom:10px;"><label>Nombre del programa</label>
        <input type="text" id="prog-name-input" value="${(form.name||'').replace(/"/g,'&quot;')}" placeholder="ej: Hipertrofia 4 días" class="q-input">
      </div>
      <div class="form-field" style="margin-bottom:12px;"><label>Carpeta</label>
        <select id="prog-folder-select" class="q-input" onchange="document.getElementById('prog-folder-new').style.display=this.value==='__new__'?'block':'none';">
          <option value="" ${!form.folder?'selected':''}>Sin carpeta</option>
          ${allFolders.map(f=>`<option value="${f.replace(/"/g,'&quot;')}" ${form.folder===f?'selected':''}>${f}</option>`).join('')}
          <option value="__new__">+ Nueva carpeta...</option>
        </select>
        <input type="text" id="prog-folder-new" placeholder="Nombre de la carpeta" class="q-input" style="display:none;margin-top:6px;">
      </div>
      <div style="display:flex;gap:8px;">
        <button class="q-btn q-btn--primary" data-action="saveprogform">Guardar</button>
        <button class="q-btn" data-action="cancelprogform">Cancelar</button>
      </div>
    </div>
  </div>`:'';

  const templateCards=Object.entries(DEFAULT_PROGRAMS).map(([tid,tpl])=>{
    const dayCount=Object.keys(tpl.days||{}).length;
    const dayChips=Object.values(tpl.days||{}).sort((a,b)=>(a.order||0)-(b.order||0))
      .map(d=>`<span class="q-day-chip">${d.name||'Día'}</span>`).join('');
    return `<div class="q-card q-prog-card">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#f97316,#fb923c);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">⚡</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:15px;color:var(--text);">${tpl.name||'Plantilla'}</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${dayCount} ${dayCount===1?'rutina':'rutinas'} · Plantilla</div>
        </div>
        <button class="q-btn q-btn--primary" style="font-size:12px;padding:6px 12px;" data-action="usetemplate" data-tid="${tid}">+ Copiar a mis programas</button>
      </div>
      ${dayChips?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">${dayChips}</div>`:''}
    </div>`;
  }).join('');
  const templatesSection=templateCards?`
    <div style="margin-top:24px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Plantillas</div>
      <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;">Rutinas de ejemplo listas para usar. Copiá la que quieras a tus programas y personalizala como necesites.</div>
      <div style="display:flex;flex-direction:column;gap:10px;">${templateCards}</div>
    </div>`:'';

  const newFolderFormHtml=S.newFolderForm?`<div class="q-card" style="margin-bottom:16px;">
    <div class="q-card__b" style="padding:12px 16px;">
      <div style="display:flex;align-items:center;gap:8px;">
        ${svgFolder}
        <input type="text" id="new-folder-input" placeholder="Nombre de la carpeta" class="q-input" style="flex:1;">
        <button class="q-btn q-btn--primary" style="white-space:nowrap;" data-action="savenewfolder">Crear carpeta</button>
        <button class="q-btn" data-action="cancelnewfolder">✕</button>
      </div>
    </div>
  </div>`:'';

  return`<div class="wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text);">Programas</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">Tus rutinas reutilizables — disponibles en cualquier equipo</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="q-btn q-btn--ghost" data-action="shownewfolderform">${svgFolder} Nueva carpeta</button>
        <button class="q-btn q-btn--primary" data-action="newprog">+ Nuevo programa</button>
      </div>
    </div>
    ${newFolderFormHtml}
    ${formHtml}
    ${mainContent}
    ${templatesSection}
  </div>`;
}

function renderProgramDetail(){
  const pid=S.programView.progId;
  const prog=S.programs[pid];
  if(!prog) return renderProgramsList();
  const days=Object.entries(prog.days||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const form=S.programForm;
  const dayFormHtml=(form?.mode==='newday'||form?.mode==='editday')?`<div class="q-card" style="margin-bottom:10px;">
    <div class="q-card__b" style="padding:12px 16px;">
      <div class="form-field"><label>${form.mode==='editday'?'Editar rutina':'Nueva rutina'}</label>
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
        <button class="q-icon-btn" data-action="editprogday" data-pid="${pid}" data-did="${did}" onclick="event.stopPropagation();" title="Editar nombre"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="q-icon-btn" data-action="deleteprogday" data-pid="${pid}" data-did="${did}" onclick="event.stopPropagation();" style="color:var(--bad);opacity:.7;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
      </div>
    </div>`;
  }).join('');
  return`<div class="wrap">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="q-btn" data-action="backprograms" style="padding:6px 10px;">← Volver</button>
      <div style="flex:1;">
        <div style="font-size:18px;font-weight:700;">${prog.name}</div>
        <div style="font-size:12px;color:var(--text-2);">${days.length} ${days.length===1?'rutina':'rutinas'}</div>
      </div>
      <button class="q-btn q-btn--primary" data-action="newprogday" data-pid="${pid}">+ Agregar rutina</button>
    </div>
    ${dayFormHtml}
    <div style="display:flex;flex-direction:column;gap:8px;">${dayCards||`<div class="q-empty-state">Agregá rutinas a este programa</div>`}</div>
  </div>`;
}

function renderProgramDayEditor(){
  const pid=S.programView.progId, did=S.programView.dayId;
  const prog=S.programs[pid];
  const day=prog?.days?.[did];
  if(!day) return renderProgramDetail();
  const blocks=Object.entries(day.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const blocksHtml=blocks.map(([bid,block],i)=>renderPlanBlock(bid,block,{progId:pid,dayId:did,blockIdx:i,blockCount:blocks.length})).join('');
  return`<div class="wrap">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="q-btn" data-action="backprogdetail" data-pid="${pid}" style="padding:6px 10px;">← ${prog.name}</button>
      <div style="flex:1;">
        <div style="font-size:17px;font-weight:700;">${day.name}</div>
        <div style="font-size:12px;color:var(--text-2);">${blocks.length} bloques</div>
      </div>
      <button class="q-icon-btn" data-action="exportplanpdf" data-ctx="prog" data-pid="${pid}" data-did="${did}" title="Exportar PDF"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
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
  const editFormHtml=editForm?`<div class="q-modal-overlay" onclick="if(event.target===this){S.exLibEdit=null;render();}">
    <div class="q-modal" onclick="event.stopPropagation()" style="max-width:420px;width:90%;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="margin:0;font-size:16px;font-weight:700;">${editForm.id==='__new'?'Nuevo ejercicio':'Editar ejercicio'}</h3>
        <button class="q-modal__close" data-action="cancelexlibedit">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-field"><label>Nombre</label>
          <input type="text" id="exlib-name" class="q-input" value="${editForm.name||''}" placeholder="Nombre del ejercicio" autofocus>
        </div>
        <div class="form-field"><label>Categoría</label>
          <select id="exlib-cat" class="q-input" style="padding:6px 10px;">
            ${EX_CATEGORIES.map(c=>`<option value="${c}"${editForm.category===c?' selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-field"><label>Video de YouTube <span style="font-weight:400;color:var(--text-2);">(opcional)</span></label>
          <input type="url" id="exlib-video" class="q-input" value="${editForm.videoUrl||''}" placeholder="https://youtube.com/watch?v=...">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
          <button class="q-btn" data-action="cancelexlibedit">Cancelar</button>
          <button class="q-btn q-btn--primary" data-action="saveexlibedit">Guardar</button>
        </div>
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
              <button class="q-icon-btn" data-action="editexlib" data-exid="${ex.id}" title="Editar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="q-icon-btn" data-action="deleteexlib" data-exid="${ex.id}" title="Eliminar" style="color:var(--bad);opacity:.7;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
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
    ${listHtml}
  </div>
  ${editFormHtml}`;
}

// ── QOORE EXERCISE LIBRARY (read-only, can copy to personal) ──
function openQooreExercises(){S.view='qooreexercises';render();}

function renderQooreExercises(){
  const all={...DEFAULT_EXERCISES,...(S.exercises.global||{})};
  const grouped={};
  Object.entries(all).forEach(([id,ex])=>{
    const cat=ex.category||'Otro';
    if(!grouped[cat]) grouped[cat]=[];
    grouped[cat].push({id,...ex});
  });
  const total=Object.keys(all).length;
  const cards=Object.entries(grouped).sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,items])=>`
    <div class="q-card" style="margin-bottom:10px;">
      <div class="q-card__h"><h3>${cat} <span style="font-size:12px;font-weight:400;color:var(--text-2);">${items.length} ejercicios</span></h3></div>
      <div>
        ${items.map(ex=>{
          const hasVideo=ex.videoUrl&&ytId(ex.videoUrl);
          const alreadySaved=Object.values(S.exercises.personal||{}).some(e=>e.name===ex.name);
          return`<div class="q-ex-lib-row">
            <span style="font-size:13px;color:var(--text-0);">${ex.name}</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${hasVideo?`<button class="q-icon-btn" data-action="showvideo" data-exid="${ex.id}" title="Ver video" style="font-size:11px;padding:3px 8px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--accent);">▶ Video</button>`:''}
              <button class="q-icon-btn" data-action="copyqooreex" data-exid="${ex.id}" title="${alreadySaved?'Ya está en tu biblioteca':'Copiar a Mis ejercicios'}" style="font-size:11px;padding:3px 8px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:${alreadySaved?'var(--text-3)':'var(--text-1)'};${alreadySaved?'cursor:default;opacity:.5;':''}">
                ${alreadySaved?'✓ Copiado':'+ Copiar'}
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
  return`<div class="wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div>
        <div style="font-size:18px;font-weight:700;">Ejercicios Qoore</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${total} ejercicios incluidos con la app · solo lectura</div>
      </div>
    </div>
    ${cards}
  </div>`;
}


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
    const isMinimized=!!S.planMinimized[planId];
    const chevronDown=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    const chevronUp=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
    return`<div class="q-plan-card">
      <div class="q-plan-card__head">
        <button class="q-plan-collapse-btn" data-action="toggleplan" data-planid="${planId}" title="${isMinimized?'Expandir':'Colapsar'}">${isMinimized?chevronDown:chevronUp}</button>
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
          <button class="q-plan-btn q-plan-btn--ghost" data-action="copyplantoprog" data-planid="${planId}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar a programas
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
      ${isMinimized?'':`<div class="q-plan-blocks">${blocks.map(([bid,block],i)=>renderPlanBlock(bid,block,{planId,blockIdx:i,blockCount:blocks.length})).join('')}</div>
      ${editable?`<button class="q-btn q-btn--ghost q-add-block-btn" data-action="addblock" data-ctx="session" data-planid="${planId}">+ Agregar bloque</button>`:''}`}
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

function renderSessionLogs(){
  const tid=S.teamId,cid=S.cat,date=S.date;
  const cd=getCat();
  const plans=Object.entries(S.sessionPlans||{});
  const workoutLog=S.teams[tid]?.categories?.[cid]?.sessions?.[date]?.workoutLog||{};
  if(!plans.length){
    return`<div class="q-empty-state"><div style="font-size:32px;margin-bottom:8px;">📋</div><div style="font-weight:600;">Sin planes para este día</div><div style="font-size:13px;color:var(--text-2);margin-top:4px;">Creá un plan para poder ver registros.</div></div>`;
  }
  const html=plans.map(([planId,plan])=>{
    const loggedPids=Object.keys(workoutLog).filter(pid=>workoutLog[pid]?.[planId]);
    const blocks=Object.entries(plan.blocks||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
    const headHtml=`<div class="q-plan-card__head">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:15px;color:var(--text-0);">${plan.name||'Plan sin nombre'}</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${loggedPids.length?loggedPids.length+' registro'+(loggedPids.length!==1?'s':''):'Sin registros todavía'}</div>
      </div>
    </div>`;
    if(!loggedPids.length) return`<div class="q-plan-card" style="margin-bottom:12px;">${headHtml}</div>`;
    const playerRows=loggedPids.map(pid=>{
      const player=cd.players.find(p=>p.id===pid);
      const pLog=workoutLog[pid][planId];
      const itemsHtml=blocks.flatMap(([bid,block])=>{
        const bInfo=blockTypeInfo(block.type);
        return Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0)).map(([iid,item])=>{
          const loggedSets=pLog?.[bid]?.[iid]||{};
          const setsStr=Object.entries(loggedSets).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([idx,l])=>{
            const parts=[];
            if(l.reps) parts.push(l.reps+' reps');
            if(l.weight) parts.push(l.weight+'kg');
            return parts.length?`S${parseInt(idx)+1}: ${parts.join(' · ')}`:null;
          }).filter(Boolean).join('  ·  ');
          if(!setsStr) return null;
          return`<div class="q-logs-item">
            <span class="q-logs-item-block" style="color:${bInfo.color};">${bInfo.label}</span>
            <span class="q-logs-item-name">${item.exName||'Ejercicio'}</span>
            <span class="q-logs-item-sets">${setsStr}</span>
          </div>`;
        }).filter(Boolean);
      }).join('');
      if(!itemsHtml) return'';
      return`<div class="q-logs-player-row">
        <div class="q-logs-player-name">${player?.name||pid}</div>
        ${itemsHtml}
      </div>`;
    }).filter(Boolean).join('');
    return`<div class="q-plan-card" style="margin-bottom:12px;">${headHtml}${playerRows}</div>`;
  }).join('');
  return`<div style="padding-top:4px;">${html}</div>`;
}

function renderPlanBlock(bid, block, ctx){
  const typeInfo=blockTypeInfo(block.type||'custom');
  const collapseKey=`${ctx.planId||ctx.progId+'_'+ctx.dayId}__${bid}`;
  const collapsed=S.planCollapsed[collapseKey];
  const items=Object.entries(block.items||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
  const isSession=!!ctx.planId;
  const editable=isSession?canEdit():true;
  const blockIdx=ctx.blockIdx??-1;
  const blockCount=ctx.blockCount??1;
  const editingBlockName=S.planEditBlock&&S.planEditBlock.blockId===bid&&
    ((isSession&&S.planEditBlock.planId===ctx.planId)||(ctx.progId&&S.planEditBlock.progId===ctx.progId));
  const blockHeader=editingBlockName?
    `<div style="display:flex;flex-wrap:wrap;gap:8px;flex:1;align-items:center;">
      <select id="block-type-input" class="q-input" style="font-size:12px;padding:4px 6px;width:auto;">
        ${BLOCK_TYPES.map(t=>`<option value="${t.id}"${(block.type||'custom')===t.id?' selected':''}>${t.label}</option>`).join('')}
      </select>
      <input type="text" id="block-name-input" value="${block.name||''}" class="q-input" style="flex:1;min-width:100px;font-size:13px;padding:4px 8px;" placeholder="Nombre del bloque">
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
        ${_hasVideo?`<button class="q-icon-btn" data-action="showvideo" data-exid="${item.exId}" title="Ver video" style="padding:2px 6px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--accent);margin-left:6px;vertical-align:middle;"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>`:''}
        <button class="q-icon-btn" data-action="saveextolib" data-exid="${item.exId}" data-exname="${(item.exName||'').replace(/"/g,'&quot;')}" title="Guardar en mi biblioteca" style="padding:2px 6px;border-radius:var(--r-pill);background:var(--bg-4);border:1px solid var(--line);color:var(--text-2);margin-left:4px;vertical-align:middle;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>
      </td>
      ${setCells}
      ${editable?`<td class="q-set-cell q-set-actions">
        <button class="q-set-pill q-set-pill--add" data-action="addset" ${ctxAttrs} data-iid="${iid}" title="Agregar serie">+ Serie</button>
        ${setCount>1?`<button class="q-set-pill q-set-pill--rem" data-action="removelastset" ${ctxAttrs} data-iid="${iid}" title="Quitar última serie">− Serie</button>`:''}
        <button class="q-icon-btn" data-action="removeitem" ${ctxAttrs} data-iid="${iid}" title="Eliminar ejercicio" style="color:var(--bad);opacity:.7;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
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
        ${editable&&!editingBlockName&&blockCount>1?`<button class="q-icon-btn" data-action="moveblock" data-dir="-1" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Mover arriba" ${blockIdx===0?'disabled style="opacity:.25;cursor:default;"':''}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button><button class="q-icon-btn" data-action="moveblock" data-dir="1" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Mover abajo" ${blockIdx===blockCount-1?'disabled style="opacity:.25;cursor:default;"':''}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></button>`:''}
        <button class="q-icon-btn" data-action="toggleblock" data-colkey="${collapseKey}">${collapsed?`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`}</button>
        ${editable&&!editingBlockName?`<button class="q-icon-btn" data-action="editblockname" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Renombrar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
        ${editable?`<button class="q-icon-btn" data-action="deleteblock" data-ctx="${isSession?'session':'prog'}" data-planid="${ctx.planId||''}" data-pid="${ctx.progId||''}" data-did="${ctx.dayId||''}" data-bid="${bid}" title="Eliminar bloque" style="color:var(--bad);opacity:.7;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>`:''}
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

