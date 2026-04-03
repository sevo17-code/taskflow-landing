let todos = JSON.parse(localStorage.getItem('tf3-todos') || '[]');
let kanban = JSON.parse(localStorage.getItem('tf3-kanban') || 'null') || {
  todo:[
    {id:'k1',title:'Design the homepage layout',tag:'design',priority:'high'},
    {id:'k2',title:'Research competitor analysis',tag:'content',priority:'medium'},
  ],
  inprogress:[
    {id:'k3',title:'Build authentication system',tag:'dev',priority:'high'},
    {id:'k4',title:'Create brand logo variants',tag:'design',priority:'low'},
  ],
  done:[
    {id:'k5',title:'Set up project repository',tag:'dev',priority:'medium'},
  ]
};
const LANG_KEY='tf3-lang';
const PAGE_KEY='tf3-page';
const BASE_TITLE='TaskFlow — Task Management';
let filter='all', isAr=localStorage.getItem(LANG_KEY)==='ar';
let currentPage=localStorage.getItem(PAGE_KEY) || 'todo';
let dur={work:25,short:5,long:15}, sessions=4, session=1;
let mode='work', timeLeft=25*60, totalTime=25*60;
let running=false, interval=null, history=[];
const CIRCUM=2*Math.PI*113;

function applyLanguage(){
  document.body.classList.toggle('ar',isAr);
  document.documentElement.lang=isAr?'ar':'en';
  document.documentElement.dir=isAr?'rtl':'ltr';
  document.querySelectorAll('.en').forEach(e=>e.style.display=isAr?'none':'');
  document.querySelectorAll('.ar').forEach(e=>e.style.display=isAr?'':'none');
  document.getElementById('lang-label').textContent=isAr?'English':'العربية';
  updateLocalizedFields();
}

function updateLocalizedFields(){
  const todoInput=document.getElementById('todo-input');
  if(todoInput){
    todoInput.placeholder=isAr?todoInput.dataset.placeholderAr:todoInput.dataset.placeholderEn;
  }

  document.querySelectorAll('#todo-priority option').forEach(option=>{
    const en=option.dataset.en || option.textContent;
    const ar=option.dataset.ar || option.textContent;
    option.textContent=isAr?`${ar} — ${en}`:`${en} — ${ar}`;
  });
}

function toggleLang(){
  isAr=!isAr;
  localStorage.setItem(LANG_KEY,isAr?'ar':'en');
  applyLanguage();
  renderTodos();
  renderKanban();
  renderPomoDots();
}

function switchPage(name){
  currentPage=name;
  localStorage.setItem(PAGE_KEY,name);
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  const pages=['todo','kanban','pomodoro'];
  const i=pages.indexOf(name);
  document.querySelectorAll('.nav-item').forEach((n,idx)=>n.classList.toggle('active',idx===i));
  document.querySelectorAll('.mob-item').forEach((n,idx)=>n.classList.toggle('active',idx===i));
}

function saveTodos(){localStorage.setItem('tf3-todos',JSON.stringify(todos));}

function renderTodos(){
  const list=document.getElementById('todo-list');
  let items=todos;
  if(filter==='pending') items=todos.filter(t=>!t.done);
  if(filter==='done') items=todos.filter(t=>t.done);
  if(filter==='high') items=todos.filter(t=>t.priority==='high');
  if(!items.length){
    list.innerHTML=`<div class="empty"><div class="empty-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4c4566" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div><p>${isAr?'لا توجد مهام بعد':'No tasks yet — add one above'}</p></div>`;
  } else {
    const checkSvg=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const trashSvg=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>`;
    const pLabel={high:isAr?'عالية':'High',medium:isAr?'متوسطة':'Medium',low:isAr?'منخفضة':'Low'};
    list.innerHTML=items.map(t=>`
      <div class="todo-item${t.done?' done':''}">
        <div class="todo-check${t.done?' checked':''}" onclick="toggleTodo('${t.id}')">${t.done?checkSvg:''}</div>
        <span class="todo-text">${t.text}</span>
        <span class="pb ${t.priority}">${pLabel[t.priority]}</span>
        <button class="todo-del" onclick="deleteTodo('${t.id}')">${trashSvg}</button>
      </div>`).join('');
  }
  document.getElementById('stat-total').textContent=todos.length;
  document.getElementById('stat-done').textContent=todos.filter(t=>t.done).length;
  document.getElementById('stat-pending').textContent=todos.filter(t=>!t.done).length;
  document.getElementById('stat-high').textContent=todos.filter(t=>t.priority==='high'&&!t.done).length;
  document.getElementById('todo-badge').textContent=todos.filter(t=>!t.done).length;
}

function setFilter(f,el){
  filter=f;
  document.querySelectorAll('.fp').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderTodos();
}

function openAddTodo(){
  document.getElementById('todo-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('todo-input').focus(),100);
}

function addTodo(){
  const input=document.getElementById('todo-input');
  const priority=document.getElementById('todo-priority').value;
  const text=input.value.trim();
  if(!text) return;
  todos.unshift({id:Date.now()+'',text,priority,done:false});
  saveTodos();renderTodos();
  input.value='';
  closeModal('todo-overlay');
  toast(isAr?'تمت إضافة المهمة':'Task added','success');
}

function toggleTodo(id){
  const t=todos.find(t=>t.id===id);
  if(t){t.done=!t.done;saveTodos();renderTodos();}
}

function deleteTodo(id){
  todos=todos.filter(t=>t.id!==id);
  saveTodos();renderTodos();
  toast(isAr?'تم حذف المهمة':'Task deleted','del');
}

document.getElementById('todo-input').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo();});

function saveKanban(){localStorage.setItem('tf3-kanban',JSON.stringify(kanban));}

const colCfg={
  todo:{en:'To Do',ar:'للتنفيذ',dot:'ind-t'},
  inprogress:{en:'In Progress',ar:'جاري التنفيذ',dot:'ind-p'},
  done:{en:'Done',ar:'مكتمل',dot:'ind-d'}
};
const tagCfg={design:'Design',dev:'Dev',content:'Content',bug:'Bug'};
let dragId=null,dragCol=null;

function renderKanban(){
  const arrowSvg=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
  const trashSvg=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>`;
  const plusSvg=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
  const board=document.getElementById('kanban-board');
  board.innerHTML=Object.entries(colCfg).map(([col,cfg])=>`
    <div class="k-col" id="kcol-${col}"
      ondragover="event.preventDefault();document.getElementById('kcol-${col}').classList.add('drag-over')"
      ondragleave="document.getElementById('kcol-${col}').classList.remove('drag-over')"
      ondrop="dropCard(event,'${col}')">
      <div class="k-col-head">
        <div class="k-col-title"><div class="k-ind ${cfg.dot}"></div><span>${isAr?cfg.ar:cfg.en}</span></div>
        <div class="k-count">${kanban[col].length}</div>
      </div>
      <div class="k-cards">
        ${kanban[col].map(card=>`
          <div class="k-card" draggable="true" id="kc-${card.id}"
            ondragstart="dragId='${card.id}';dragCol='${col}';this.classList.add('dragging')"
            ondragend="this.classList.remove('dragging')">
            <div class="k-tag tg-${card.tag}">${tagCfg[card.tag]}</div>
            <div class="k-card-title">${card.title}</div>
            <div class="k-card-foot">
              <div class="k-pri">
                <div class="k-pri-dot" style="background:${card.priority==='high'?'var(--red2)':card.priority==='medium'?'var(--yellow2)':'var(--green2)'}"></div>
                <span style="color:${card.priority==='high'?'var(--red2)':card.priority==='medium'?'var(--yellow2)':'var(--green2)'}">${card.priority}</span>
              </div>
              <div class="k-actions">
                ${col!=='done'?`<button class="k-ab" onclick="moveCard('${card.id}','${col}')">${arrowSvg}</button>`:''}
                <button class="k-ab del" onclick="delCard('${card.id}','${col}')">${trashSvg}</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <button class="k-add-btn" onclick="openKAdd('${col}')">${plusSvg} ${isAr?'إضافة بطاقة':'Add card'}</button>
      <div class="k-add-form" id="kform-${col}">
        <input class="k-add-input" id="kinput-${col}" placeholder="${isAr?'عنوان البطاقة...':'Card title...'}" onkeydown="if(event.key==='Enter')submitCard('${col}')">
        <div class="k-add-row">
          <select class="k-sel" id="ktag-${col}"><option value="dev">Dev</option><option value="design">Design</option><option value="content">Content</option><option value="bug">Bug</option></select>
          <select class="k-sel" id="kpri-${col}"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select>
          <button class="btn btn-primary btn-sm" onclick="submitCard('${col}')">${plusSvg}</button>
        </div>
      </div>
    </div>`).join('');
}

function dropCard(e,toCol){
  e.preventDefault();
  document.querySelectorAll('.k-col').forEach(c=>c.classList.remove('drag-over'));
  if(!dragId||!dragCol) return;
  const card=kanban[dragCol].find(c=>c.id===dragId);
  if(!card) return;
  kanban[dragCol]=kanban[dragCol].filter(c=>c.id!==dragId);
  kanban[toCol].push(card);
  dragId=null;dragCol=null;
  saveKanban();renderKanban();
}

function moveCard(id,fromCol){
  const cols=['todo','inprogress','done'];
  const toCol=cols[cols.indexOf(fromCol)+1];
  if(!toCol) return;
  const card=kanban[fromCol].find(c=>c.id===id);
  if(!card) return;
  kanban[fromCol]=kanban[fromCol].filter(c=>c.id!==id);
  kanban[toCol].push(card);
  saveKanban();renderKanban();
  toast(isAr?'تم نقل البطاقة':'Card moved forward','info');
}

function delCard(id,col){
  kanban[col]=kanban[col].filter(c=>c.id!==id);
  saveKanban();renderKanban();
  toast(isAr?'تم الحذف':'Card deleted','del');
}

function openKAdd(col){
  document.querySelectorAll('.k-add-form').forEach(f=>f.classList.remove('open'));
  document.getElementById('kform-'+col).classList.add('open');
  setTimeout(()=>document.getElementById('kinput-'+col).focus(),100);
}

function submitCard(col){
  const input=document.getElementById('kinput-'+col);
  const title=input.value.trim();
  if(!title) return;
  kanban[col].push({id:'k'+Date.now(),title,tag:document.getElementById('ktag-'+col).value,priority:document.getElementById('kpri-'+col).value});
  saveKanban();renderKanban();
  toast(isAr?'تمت إضافة البطاقة':'Card added','success');
}

const playSvg=`<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
const pauseSvg=`<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

function updatePomoUI(){
  const m=Math.floor(timeLeft/60).toString().padStart(2,'0');
  const s=(timeLeft%60).toString().padStart(2,'0');
  document.getElementById('pomo-time').textContent=`${m}:${s}`;
  document.title=running?`${m}:${s} — TaskFlow`:BASE_TITLE;
  document.getElementById('ring-fill').style.strokeDashoffset=CIRCUM*(timeLeft/totalTime);
}

function setPomoMode(m,el){
  mode=m; running=false; clearInterval(interval);
  document.getElementById('pomo-main').innerHTML=playSvg;
  document.querySelectorAll('.pomo-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  timeLeft=dur[m]*60; totalTime=timeLeft;
  updatePomoUI();
  const labels={work:{en:'FOCUS',ar:'تركيز'},short:{en:'SHORT BREAK',ar:'استراحة قصيرة'},long:{en:'LONG BREAK',ar:'استراحة طويلة'}};
  document.getElementById('pomo-mode-lbl').innerHTML=`<span class="en"${isAr?' style="display:none"':''}>${labels[m].en}</span><span class="ar"${!isAr?' style="display:none"':''}>${labels[m].ar}</span>`;
}

function togglePomo(){
  if(running){
    running=false; clearInterval(interval);
    document.getElementById('pomo-main').innerHTML=playSvg;
  } else {
    running=true;
    document.getElementById('pomo-main').innerHTML=pauseSvg;
    interval=setInterval(()=>{
      if(timeLeft<=0){
        clearInterval(interval); running=false;
        document.getElementById('pomo-main').innerHTML=playSvg;
        history.push(mode); renderPomoDots();
        if(mode==='work'){
          session++;
          document.getElementById('pomo-session').textContent=`Session #${session}`;
          toast(isAr?'انتهى وقت التركيز! استرح':'Focus done! Take a break','success');
          const next=session%sessions===0?'long':'short';
          setTimeout(()=>setPomoMode(next,document.getElementById('tab-'+next)),600);
        } else {
          toast(isAr?'انتهت الاستراحة! وقت التركيز':'Break over! Time to focus','info');
          setTimeout(()=>setPomoMode('work',document.getElementById('tab-work')),600);
        }
        return;
      }
      timeLeft--; updatePomoUI();
    },1000);
  }
}

function resetPomo(){
  running=false; clearInterval(interval);
  document.getElementById('pomo-main').innerHTML=playSvg;
  timeLeft=dur[mode]*60; totalTime=timeLeft; updatePomoUI();
}

function skipPomo(){
  timeLeft=1; updatePomoUI();
  if(!running) togglePomo();
}

function updateDur(m,v){
  dur[m]=parseInt(v);
  document.getElementById('val-'+m).textContent=v;
  if(mode===m&&!running){timeLeft=dur[m]*60;totalTime=timeLeft;updatePomoUI();}
}

function updateSessions(v){sessions=parseInt(v);document.getElementById('val-sessions').textContent=v;}

function renderPomoDots(){
  const el=document.getElementById('pomo-dots');
  if(!history.length){
    el.innerHTML=`<span style="font-size:12px;color:var(--w4)"><span class="en"${isAr?' style="display:none"':''}>No sessions yet</span><span class="ar"${!isAr?' style="display:none"':''}>لا توجد جلسات بعد</span></span>`;
    return;
  }
  const wSvg=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path></svg>`;
  const bSvg=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path></svg>`;
  el.innerHTML=history.slice(-20).map(h=>`<div class="pomo-dot ${h==='work'?'work':'brk'}" title="${h}">${h==='work'?wSvg:bSvg}</div>`).join('');
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.getElementById('todo-overlay').addEventListener('click',e=>{if(e.target.id==='todo-overlay')closeModal('todo-overlay');});

let toastTimer=null;
function toast(msg,type='success'){
  const t=document.getElementById('toast');
  const colors={success:'#10b981',del:'#ef4444',info:'#a78bfa'};
  const icons={
    success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${colors.success}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    del:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${colors.del}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>`,
    info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${colors.info}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
  };
  document.getElementById('toast-icon').outerHTML=`<span id="toast-icon">${icons[type]||icons.success}</span>`;
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    closeModal('todo-overlay');
    document.querySelectorAll('.k-add-form').forEach(f=>f.classList.remove('open'));
  }
  if(e.key===' '&&document.getElementById('page-pomodoro').classList.contains('active')&&e.target.tagName!=='INPUT'){
    e.preventDefault(); togglePomo();
  }
});

renderTodos();
renderKanban();
applyLanguage();
switchPage(currentPage);
updatePomoUI();
