
const RANKS=['학회장','부학회장','임원진','학회원'];


const LOG_CATS=['회의록','작업 기록','결정 사항','공지','기타'];
window.studyBadges = function(studies){
  if(!studies||!studies.length) return '<span class="badge b-gy" style="font-size:10px;">스터디 없음</span>';
  return studies.map(s=>s==='포토샵 스터디'?'<span class="badge b-ye" style="font-size:10px;">📷 포토샵</span>':'<span class="badge b-bl" style="font-size:10px;">✏️ 일러스트</span>').join(' ');
}
const LC_CLS={'회의록':'lc-m','작업 기록':'lc-w','결정 사항':'lc-d','공지':'lc-n','기타':'lc-e'};
const DB={ groups:[], studies:[], files:[], teamLogs:[], notifications:[], excuses:[], 
  currentUser:null,
  currentSem:'2026 2학기',
  semesters:['2025 1학기','2025 2학기','2026 1학기','2026 2학기'],
  calY:new Date().getFullYear(), calM:new Date().getMonth(),
  calEvents:[
    {id:1,date:'2026-09-05',title:'OT',type:'bl'},
    {id:2,date:'2026-09-12',title:'1차 세미나',type:'bl'},
    {id:3,date:'2026-09-19',title:'2차 세미나',type:'bl'},
    {id:4,date:'2026-09-26',title:'3차 세미나',type:'bl'},
    {id:5,date:'2026-10-03',title:'개교기념일',type:'re'},
    {id:6,date:'2026-10-10',title:'중간 발표',type:'gr'},
    {id:7,date:'2026-11-07',title:'포트폴리오 마감',type:'ye'},
    {id:8,date:'2026-12-05',title:'최종 발표',type:'gr'},
  ],
  users:[
    {id:1,name:'김민준',email:'admin@dif.kr',pw:'1234',studentId:'20210001',dept:'디자인학과',group:'1조',studies:[],rank:'학회장',status:'active',avatar:'김'},
    {id:2,name:'이서연',email:'member@dif.kr',pw:'1234',studentId:'20210042',dept:'시각디자인학과',group:'메인 프로젝트 - 2조',studies:['포토샵 스터디'],rank:'학회원',status:'active',avatar:'이'},
    {id:3,name:'박지호',email:'park@dif.kr',pw:'1234',studentId:'20220015',dept:'산업디자인학과',group:'메인 프로젝트 - 2조',studies:['일러스트 스터디'],rank:'부학회장',status:'active',avatar:'박'},
    {id:4,name:'최수아',email:'choi@dif.kr',pw:'1234',studentId:'20220033',dept:'디자인학과',group:'메인 프로젝트 - 3조',studies:['포토샵 스터디','일러스트 스터디'],rank:'임원진',status:'active',avatar:'최'},
    {id:5,name:'정우진',email:'jung@dif.kr',pw:'1234',studentId:'20230018',dept:'시각디자인학과',group:'메인 프로젝트 - 3조',studies:['일러스트 스터디'],rank:'학회원',status:'active',avatar:'정'},
    {id:6,name:'한나라',email:'han@dif.kr',pw:'1234',studentId:'20230056',dept:'디자인학과',group:'메인 프로젝트 - 4조',studies:['포토샵 스터디'],rank:'학회원',status:'active',avatar:'한'},
    {id:7,name:'오태양',email:'oh@dif.kr',pw:'1234',studentId:'20240011',dept:'산업디자인학과',group:'메인 프로젝트 - 4조',studies:[],rank:'학회원',status:'active',avatar:'오'},
    {id:8,name:'강예린',email:'kang@dif.kr',pw:'1234',studentId:'20210077',dept:'시각디자인학과',group:'메인 프로젝트 - 5조',studies:['포토샵 스터디','일러스트 스터디'],rank:'임원진',status:'active',avatar:'강'},
    {id:9,name:'신재원',email:'shin@dif.kr',pw:'1234',studentId:'20220091',dept:'디자인학과',group:'1조',studies:['일러스트 스터디'],rank:'학회원',status:'pending',avatar:'신'},
  ],
  assignments:[
    {id:1,title:'1차 브랜딩 리서치',description:'레퍼런스 수집 및 분석 보고서 제출',deadline:'2026-10-10',createdBy:1,group:'전체',submissions:[]},
    {id:2,title:'포트폴리오 초안',description:'개인 포트폴리오 PDF 초안 제출',deadline:'2026-11-07',createdBy:1,group:'전체',submissions:[
      {userId:2,submittedAt:'2026-11-01 14:32',file:'이서연_포트폴리오.pdf'},
      {userId:5,submittedAt:'2026-11-02 09:11',file:'정우진_포트폴리오.pdf'},
    ]},
    {id:3,title:'포토샵 실습 과제',description:'레이어 합성 실습 결과물 PSD 제출',deadline:'2026-09-30',createdBy:1,group:'study:포토샵 스터디',submissions:[
      {userId:2,submittedAt:'2026-09-28 20:00',file:'실습_이서연.psd'},
      {userId:6,submittedAt:'2026-09-29 11:30',file:'실습_한나라.psd'},
    ]},
    {id:4,title:'메인 1조 1차 시안',description:'1조 프로젝트 비주얼 시안 제출',deadline:'2026-10-25',createdBy:1,group:'1조',submissions:[]},
  ],
  attendance:[
    {id:1,date:'2026-09-05',code:'DIF001',title:'OT',records:[]},
    {id:2,date:'2026-09-12',code:'DIF002',title:'1차 세미나',records:[
      {userId:1,status:'출석'},{userId:2,status:'출석'},{userId:3,status:'출석'},
      {userId:4,status:'출석'},{userId:5,status:'지각'},{userId:6,status:'출석'},
      {userId:7,status:'결석'},{userId:8,status:'출석'},
    ]},
    {id:3,date:'2026-09-19',code:'DIF003',title:'2차 세미나',records:[
      {userId:1,status:'출석'},{userId:2,status:'출석'},{userId:3,status:'사유',note:'개인 사정'},
      {userId:4,status:'출석'},{userId:5,status:'출석'},{userId:6,status:'결석'},
      {userId:7,status:'출석'},{userId:8,status:'출석'},
    ]},
    {id:4,date:'2026-09-26',code:'DIF004',title:'3차 세미나',records:[]},
  ],
  excuses:[
    {id:1,userId:3,sessionId:3,date:'2026-09-19',reason:'개인 사정으로 불참합니다.',status:'approved',submittedAt:'2026-09-18'},
  ],
  todayCode:'',
  files:[
    {id:1,name:'DIF_브랜딩가이드라인_v1.pdf',type:'PDF',group:'1조',uploaderId:1,assignId:null,uploadedAt:'2026-09-10',sizeMB:2.4,storagePath:'documents/DIF_브랜딩가이드라인_v1.pdf',category:'documents'},
    {id:2,name:'포트폴리오_이서연.pdf',type:'PDF',group:'1조',uploaderId:2,assignId:2,uploadedAt:'2026-11-01',sizeMB:8.1,storagePath:'reports/포트폴리오_이서연.pdf',category:'reports'},
  ],
  teamLogs:[
    {id:1,title:'OT 회의록',category:'회의록',group:'전체',content:'2026년 2학기 DIF OT.\n- 학기 일정 공유\n- 그룹 배정 완료\n- 과제 일정 안내',authorId:1,createdAt:'2026-09-05'},
    {id:2,title:'포토샵 스터디 1회차',category:'작업 기록',group:'전체',content:'레이어 기초 실습 완료.\n다음 회차: 색보정 기법 학습 예정.',authorId:2,createdAt:'2026-09-12'},
    {id:3,title:'10월 일정 공지',category:'공지',group:'전체',content:'중간 발표: 10/10\n포트폴리오 마감: 11/7',authorId:1,createdAt:'2026-09-26'},
  ],
  notifications:[],
  fFilter:{team:'',type:'',search:''},
  mFilter:{search:'',group:'',rank:'',study:''},
};

// ─── UTILS ───────────────────────────────────────────────
window.toast = function(msg,type=''){const t=document.getElementById('toast');t.textContent=msg;t.className='toast show'+(type?' '+type:'');setTimeout(()=>t.className='toast',2800);}
window.fmt = function(d){if(!d)return'—';const dt=new Date(d);return dt.getFullYear()+'.'+String(dt.getMonth()+1).padStart(2,'0')+'.'+String(dt.getDate()).padStart(2,'0');}
window.dUntil = function(ds){const n=new Date();n.setHours(0,0,0,0);return Math.ceil((new Date(ds)-n)/86400000);}
window.rCls = function(r){return r==='학회장'?'r-chief':r==='부학회장'?'r-vp':r==='임원진'?'r-exec':'r-member';}
window.canMng = function(u){return['학회장','부학회장','임원진'].includes(u.rank);}
window.isAdmin = function(u){return['학회장','부학회장'].includes(u.rank);}
window.esc = function(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
window.avC = function(id){return'av'+(id%4);}
window.closeModal = function(){document.getElementById('modal-root').innerHTML='';}
window.openModal = function(html){const ov=document.createElement('div');ov.className='m-ov';ov.innerHTML=html;ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});document.getElementById('modal-root').appendChild(ov);}
window.gOpts = function(sel){return (DB?.groups||[]).map(g=>`<option ${sel===g?'selected':''}>${esc(g)}</option>`).join('');}
window.rOpts = function(sel){return RANKS.map(r=>`<option ${sel===r?'selected':''}>${r}</option>`).join('');}

// ─── AUTH ─────────────────────────────────────────────────
window.switchAuthTab = function(t){
  document.querySelectorAll('.auth-tab').forEach((el,i)=>el.classList.toggle('active',(i===0&&t==='login')||(i===1&&t==='register')));
  document.getElementById('tab-login').style.display=t==='login'?'':'none';
  document.getElementById('tab-register').style.display=t==='register'?'':'none';
}
window.doLogin = function(){
  const e=document.getElementById('login-email').value.trim();
  const p=document.getElementById('login-pw').value;
  const u=(DB?.users||[]).find(x=>x.email===e&&x.pw===p&&x.status==='active');
  if(!u)return toast('이메일 또는 비밀번호가 올바르지 않습니다.','err');
  DB.currentUser=u; initApp();
}
window.doRegister = function(){
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const sid=document.getElementById('reg-sid').value.trim();
  const dept=document.getElementById('reg-dept').value.trim();
  const pw=document.getElementById('reg-pw').value;
  if(!name||!email||!sid||!dept||!pw)return toast('모든 항목을 입력해주세요.','err');
  if(pw.length<6)return toast('비밀번호는 6자리 이상이어야 합니다.','err');
  if((DB?.users||[]).find(u=>u.email===email))return toast('이미 사용 중인 이메일입니다.','err');
  DB.users.push({id:Date.now(),name,email,pw,studentId:sid,dept,group:'',studies:[],rank:'학회원',status:'pending',avatar:name[0]});
  toast('계정이 생성되었습니다. 운영진 승인 후 이용 가능합니다.','ok');
  switchAuthTab('login');
}
window.doLogout = function(){DB.currentUser=null;document.getElementById('app').style.display='none';document.getElementById('auth-screen').style.display='flex';}

// ─── INIT ─────────────────────────────────────────────────
window.attSetupState = window.attSetupState || { title: '', targetGroup: '전체' };
window.initApp = function(){ if(!DB.groups) DB.groups=[]; if(!DB.studies) DB.studies=[];
  const u=DB.currentUser;
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('sidebar-avatar').textContent=u.avatar;
  document.getElementById('sidebar-name').textContent=u.name;
  document.getElementById('sidebar-role').textContent=u.rank;
  updateSemUI();
  const now=new Date();
  document.getElementById('today-date').textContent=(now.getMonth()+1)+'월 '+now.getDate()+'일';
  if(canMng(u)){
    document.getElementById('admin-nav').style.display='';
    document.getElementById('all-sub-tab').style.display='';
    document.getElementById('asg-admin-tb').style.display='';
    document.getElementById('add-member-btn').style.display='';
  }
  goPage('dashboard');
}

// ─── SEMESTER ─────────────────────────────────────────────
window.updateSemUI = function(){
  const s=DB.currentSem;
  document.getElementById('sem-label').textContent=s;
  document.getElementById('sidebar-sem').textContent=s;
  const sub=document.getElementById('s-sem-sub');if(sub)sub.textContent=s;
  renderSemList();
}
window.toggleSemDrop = function(){
  const dd=document.getElementById('sem-dd');
  const v=dd.style.display!=='none';
  dd.style.display=v?'none':'';
  if(!v){renderSemList();setTimeout(()=>document.addEventListener('click',closeSemDrop,{once:true}),10);}
}
window.closeSemDrop = function(e){
  const dd=document.getElementById('sem-dd');const btn=document.getElementById('sem-btn');
  if(dd&&!dd.contains(e.target)&&btn&&!btn.contains(e.target))dd.style.display='none';
}
window.renderSemList = function(){
  document.getElementById('sem-list').innerHTML=DB.semesters.map(s=>
    `<div class="sem-opt ${s===DB.currentSem?'active':''}" onclick="selectSem('${s}')">
      <span>${s}</span>${s===DB.currentSem?'<span style="color:var(--blue);font-size:12px;">✓</span>':''}
    </div>`).join('');
  document.getElementById('sem-add-row').style.display=canMng(DB.currentUser)?'':'none';
}
window.selectSem = function(s){
  DB.currentSem=s;document.getElementById('sem-dd').style.display='none';
  updateSemUI();if(document.getElementById('page-dashboard').classList.contains('active'))renderDashboard();
  toast('"'+s+'"으로 변경되었습니다.','ok');
}
window.addSemester = function(){
  const v=document.getElementById('new-sem-inp').value.trim();
  if(!v)return toast('학기명을 입력해주세요.','err');
  if(DB.semesters.includes(v))return toast('이미 존재하는 학기입니다.','err');
  DB.semesters.push(v);renderSemList();document.getElementById('new-sem-inp').value='';
  toast('"'+v+'" 학기가 추가되었습니다.','ok');
}

// ─── NAV ──────────────────────────────────────────────────
window.goPage = function(page){
  if(document.getElementById('admin-nav')) document.getElementById('admin-nav').style.display = canMng(DB.currentUser) ? '' : 'none';
  document.querySelectorAll('.ni').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  const nb=document.querySelector('.ni[onclick="goPage(\''+page+'\')"]');if(nb)nb.classList.add('active');
  const titles={dashboard:'대시보드',attendance:'출석체크',assignments:'과제 관리',members:'학회원 명단',profile:'내 프로필',files:'작업물 보관함',teamlog:'팀 로그',notify:'알림 보내기',admin:'관리자 설정'};
  document.getElementById('page-title').textContent=titles[page]||page;
  if(page==='dashboard')renderDashboard();
  if(page==='attendance') { if(typeof window.renderAttendance === 'function') window.renderAttendance(); else renderAttendance(); }
  if(page==='assignments') { if(typeof window.renderAssignments === 'function') window.renderAssignments('ongoing'); else renderAssignments('ongoing'); }
  if(page==='members')renderMembers();
  if(page==='profile')renderProfile();
  if(page==='files')renderFiles();
  if(page==='teamlog')renderLogs();
  if(page==='notify')renderNotify();
  if(page==='admin')renderAdmin();
}

// ─── DASHBOARD ────────────────────────────────────────────
window.renderDashboard = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  } updateNotifyBadge(); 
  if (!DB || !DB.currentUser || !DB.groups) {
    if(document.getElementById('page-dashboard')) {
        document.getElementById('page-dashboard').innerHTML = '<div class="spinner" style="text-align:center; padding: 2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  const u=DB.currentUser;
  const active=(DB?.users||[]).filter(x=>x.status==='active');
  if(document.getElementById('s-total')) document.getElementById('s-total').textContent=active.length;
  const today=new Date().toISOString().split('T')[0];
  const tA=(DB?.attendance||[]).find(a=>a.date===today);
  if(tA&&(tA?.records||[]).length>0){
    const att=(tA?.records||[]).filter(r=>r.status==='출석').length;
    if(document.getElementById('s-att')) document.getElementById('s-att').textContent=Math.round(att/active.length*100)+'%';
    if(document.getElementById('s-att-sub')) document.getElementById('s-att-sub').textContent=att+'/'+active.length+'명 출석';
  }else{if(document.getElementById('s-att')) document.getElementById('s-att').textContent='—';if(document.getElementById('s-att-sub')) document.getElementById('s-att-sub').textContent='출석 정보 없음';}
  const now=new Date();now.setHours(0,0,0,0);
  const ongoing=(DB?.assignments||[]).filter(a=>new Date(a.deadline)>=now);
  if(document.getElementById('s-ongoing')) document.getElementById('s-ongoing').textContent=ongoing.length;
  const myOver=(DB?.assignments||[]).filter(a=>new Date(a.deadline)<now&&!(a.submissions||[]).find(s=>s.userId===u.id));
  if(document.getElementById('s-overdue')) document.getElementById('s-overdue').textContent=myOver.length;
  if(document.getElementById('s-overdue-sub')) document.getElementById('s-overdue-sub').textContent=myOver.length>0?myOver.length+'개 미제출':'모두 제출 완료';
  // 임박 과제
  const up=ongoing.filter(a=>dUntil(a.deadline)<=7).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
  document.getElementById('dash-asg').innerHTML=up.length===0?'<div class="empty" style="padding:1rem 0;"><p>마감 임박 과제 없음 🎉</p></div>':
    up.map(a=>{const d=dUntil(a.deadline);const s=(a.submissions||[]).find(x=>x.userId===u.id);
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--gray-100);">
      <div><div style="font-size:13px;font-weight:500;">${esc(a.title)}</div><div class="tm">${esc(a.group)}</div></div>
      ${s?'<span class="badge b-gr">제출완료</span>':`<span style="font-size:12px;font-weight:600;color:var(--red);">D-${d}</span>`}
    </div>`;}).join('');
  // 최근 출석
  const myAtt=(DB?.attendance||[]).filter(a=>a.records.length>0).slice(-4).reverse();
  document.getElementById('dash-att').innerHTML=myAtt.length===0?'<div class="empty" style="padding:1rem 0;"><p>출석 기록 없음</p></div>':
    myAtt.map(a=>{const r=a.records.find(x=>x.userId===u.id);const st=r?r.status:'—';
    const bc=st==='출석'?'b-gr':st==='지각'?'b-ye':st==='사유'?'b-bl':st==='결석'?'b-re':'b-gy';
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--gray-100);">
      <div><div style="font-size:13px;font-weight:500;">${esc(a.title)}</div><div class="tm">${fmt(a.date)}</div></div>
      <span class="badge ${bc}">${st}</span>
    </div>`;}).join('');
  renderCalendar();
  // 팀 현황
  const teamHTML=(DB.groups||[]).map(g=>{const ms=active.filter(m=>m.group===g);
    return`<div style="background:var(--gray-50);border-radius:var(--r-md);padding:.85rem;">
      <div style="font-size:11px;font-weight:600;color:var(--gray-700);margin-bottom:3px;">프로젝트 ${esc(g)}</div>
      <div style="font-size:22px;font-weight:700;color:var(--blue);">${ms.length}<span style="font-size:12px;font-weight:400;color:var(--gray-500);">명</span></div>
    </div>`;}).join('');
  const psCount=active.filter(m=>m.studies&&m.studies.includes('포토샵 스터디')).length;
  const ilCount=active.filter(m=>m.studies&&m.studies.includes('일러스트 스터디')).length;
  const studyHTML=`<div style="background:var(--yellow-light);border-radius:var(--r-md);padding:.85rem;">
    <div style="font-size:11px;font-weight:600;color:#8a6800;margin-bottom:3px;">📷 포토샵 스터디</div>
    <div style="font-size:22px;font-weight:700;color:var(--yellow-dark);">${psCount}<span style="font-size:12px;font-weight:400;color:var(--gray-500);">명</span></div>
  </div>
  <div style="background:var(--blue-light);border-radius:var(--r-md);padding:.85rem;">
    <div style="font-size:11px;font-weight:600;color:var(--blue-dark);margin-bottom:3px;">✏️ 일러스트 스터디</div>
    <div style="font-size:22px;font-weight:700;color:var(--blue);">${ilCount}<span style="font-size:12px;font-weight:400;color:var(--gray-500);">명</span></div>
  </div>`;
  document.getElementById('dash-teams').innerHTML=`<div style="margin-bottom:.5rem;font-size:12px;font-weight:600;color:var(--gray-600);">프로젝트 조</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.65rem;margin-bottom:.85rem;">${teamHTML}</div><div style="margin-bottom:.5rem;font-size:12px;font-weight:600;color:var(--gray-600);">스터디</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem;">${studyHTML}</div>`;
  const fl=document.getElementById('dash-files');if(fl)fl.textContent='파일 '+(DB?.files||[]).length+'개 보관 중';
  const ll=document.getElementById('dash-logs');if(ll)ll.textContent='로그 '+(DB?.teamLogs||[]).length+'건';
  const nc=document.getElementById('dash-notify-card');if(nc)nc.style.display=isAdmin(u)?'':'none';
}

// ─── CALENDAR ─────────────────────────────────────────────
window.calMove = function(dir){
  DB.calM+=dir;if(DB.calM>11){DB.calM=0;DB.calY++;}if(DB.calM<0){DB.calM=11;DB.calY--;}
  renderCalendar();
}
window.renderCalendar = function(){
  const u=DB.currentUser;const canEdit=canMng(u);
  document.getElementById('cal-hint').style.display=canEdit?'':'none';
  const y=DB.calY,m=DB.calM;
  document.getElementById('cal-title').textContent=y+'년 '+(m+1)+'월';
  const days=['일','월','화','수','목','금','토'];
  document.getElementById('cal-hd').innerHTML=days.map((d,i)=>`<div class="cal-dh ${i===0?'cal-sun':i===6?'cal-sat':''}">${d}</div>`).join('');
  const first=new Date(y,m,1).getDay();
  const lastDay=new Date(y,m+1,0).getDate();
  const today=new Date().toISOString().split('T')[0];
  let total=first+lastDay;if(total%7)total+=7-total%7;
  let cells='';
  for(let i=0;i<total;i++){
    let day,isOther=false,dStr;
    if(i<first){day=new Date(y,m,0).getDate()-first+i+1;isOther=true;const pm=m===0?12:m;const py=m===0?y-1:y;dStr=`${py}-${String(pm).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
    else if(i>=first+lastDay){day=i-first-lastDay+1;isOther=true;const nm=m===11?1:m+2;const ny=m===11?y+1:y;dStr=`${ny}-${String(nm).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
    else{day=i-first+1;dStr=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
    const isToday=dStr===today;const dow=i%7;
    const evs=(DB?.calEvents||[]).filter(e=>e.date===dStr);
    const cls=['cal-d',isOther?'other':'',isToday?'today':'',dow===0?'cal-sun':dow===6?'cal-sat':'',canEdit&&!isOther?'editable':''].filter(Boolean).join(' ');
    const click=canEdit&&!isOther?`onclick="openCalModal('${dStr}')"`:''
    cells+=`<div class="${cls}" ${click}><div class="cal-dn">${day}</div>${evs.map(e=>`<div class="cal-ev ce-${e.type}" title="${esc(e.title)}">${esc(e.title)}</div>`).join('')}</div>`;
  }
  document.getElementById('cal-body').innerHTML=cells;
}
window.openCalModal = function(dateStr){
  const evs=(DB?.calEvents||[]).filter(e=>e.date===dateStr);
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">📅 ${fmt(dateStr)} 일정 관리</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    ${evs.length>0?`<div style="margin-bottom:.85rem;"><div class="fl" style="margin-bottom:.4rem;">등록된 일정</div>
    ${evs.map(e=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:.38rem .6rem;background:var(--gray-50);border-radius:var(--r-sm);margin-bottom:3px;">
      <span style="font-size:13px;">${esc(e.title)}</span>
      <button class="btn btn-d btn-sm" onclick="delCalEv(${e.id},'${dateStr}')">삭제</button>
    </div>`).join('')}</div><div class="dv"></div>`:''}
    <div class="fg"><label class="fl">일정 추가</label><input id="cal-new-title" class="fc" placeholder="일정 제목"></div>
    <div class="fg"><label class="fl">색상</label>
      <select id="cal-new-type" class="fc">
        <option value="bl">파란색 (세미나)</option>
        <option value="ye">노란색 (마감)</option>
        <option value="re">빨간색 (중요)</option>
        <option value="gr">초록색 (행사)</option>
      </select>
    </div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button><button class="btn btn-p" onclick="addCalEv('${dateStr}')">추가</button></div>
  </div>`);
}
window.addCalEv = function(dateStr){
  const title=document.getElementById('cal-new-title').value.trim();
  const type=document.getElementById('cal-new-type').value;
  if(!title)return toast('일정 제목을 입력해주세요.','err');
  DB.calEvents.push({id:Date.now(),date:dateStr,title,type});
  closeModal();renderCalendar();toast('일정이 추가되었습니다.','ok');
}
window.delCalEv = function(id,dateStr){
  DB.calEvents=(DB?.calEvents||[]).filter(e=>e.id!==id);closeModal();openCalModal(dateStr);renderCalendar();
}

// ─── ATTENDANCE ───────────────────────────────────────────
window.renderAttendance = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  const u=DB.currentUser;
  const today=new Date().toISOString().split('T')[0];
  const tA=(DB?.attendance||[]).find(a=>a.date===today);
  // 운영진 패널
  const ap=document.getElementById('att-admin-panel');
  if(canMng(u)){
    ap.style.display='';
    const code=DB.todayCode||(tA?tA.code:'');
    ap.innerHTML=`<div class="card"><div class="c-hd"><div class="c-title">⚙️ 출석 코드 관리 (운영진)</div></div>
      <div style="display:flex;gap:7px;margin-bottom:.85rem; align-items: center;">
        <input id="setup-title" class="fc" style="max-width:150px;" placeholder="세미나명" value="${esc(window.attSetupState.title)}" onchange="window.attSetupState.title=this.value">
        <select id="setup-target" class="fc" style="max-width:120px;" onchange="window.attSetupState.targetGroup=this.value">
          <option value="전체" ${window.attSetupState.targetGroup==='전체'?'selected':''}>전체 학회원</option>
          ${(DB?.groups||[]).map(g=>`<option ${window.attSetupState.targetGroup===g?'selected':''}>${esc(g)}</option>`).join('')}
        </select>
        <input id="att-code-inp" class="fc" style="max-width:120px;" placeholder="코드" value="${esc(code)}">
        <button class="btn btn-p" onclick="setTodayCode()">설정</button>
        <button class="btn btn-o" onclick="openAttStatusModal()">현황</button>
      </div>`:''}
    </div>`;
    // 사유 불참 대기 패널
    renderExcusePanel();
  }else{ap.style.display='none';document.getElementById('att-excuse-panel').innerHTML='';}

  // 학회원 패널
  const myRec=tA?(tA?.records||[]).find(r=>r.userId===u.id):null;
  const myEx=(DB?.excuses||[]).find(r=>r.userId===u.id&&r.date===today);
  const mp=document.getElementById('att-member-panel');
  mp.innerHTML=`<div class="card"><div class="c-hd"><div class="c-title">✅ 오늘의 출석체크</div><div class="c-sub">${fmt(today)}</div></div>
    ${myRec
      ?`<div class="al al-ok"><span>✅</span><div>오늘 출석 완료! 상태: <strong>${myRec.status}</strong>${myRec.note?' — '+esc(myRec.note):''}</div></div>`
      :myEx
        ?myEx.status==='pending'
          ?`<div class="al al-w"><span>⏳</span><div>사유 불참 신청 검토 중입니다. 사유: ${esc(myEx.reason)}</div></div>`
          :myEx.status==='approved'
            ?`<div class="al al-ok"><span>✅</span><div>사유 불참으로 처리되었습니다.</div></div>`
            :`<div class="al al-e"><span>❌</span><div>사유 불참 신청이 반려되었습니다.</div></div>`
        :DB.todayCode
          ?`<div>
            <div class="al al-i"><span>ℹ️</span><div>출석 코드를 입력하거나, 불참 사유가 있으면 아래에서 신청하세요.</div></div>
            <div style="display:flex;gap:7px;margin-bottom:.85rem;">
              <input id="att-code-member" class="fc" style="max-width:200px;" placeholder="출석 코드">
              <button class="btn btn-p" onclick="submitAttCode()">출석 확인</button>
            </div>
            <button class="btn btn-o" onclick="openExcuseModal('${today}')">📋 사유 불참 신청</button>
          </div>`
          :`<div>
            <div class="al al-w"><span>⏳</span><div>아직 출석 코드가 설정되지 않았습니다.</div></div>
            <button class="btn btn-o" onclick="openExcuseModal('${today}')">📋 사유 불참 신청</button>
          </div>`
    }
  </div>`;
  const eb=document.getElementById('export-att-btn');if(eb)eb.style.display=isAdmin(u)?'':'none';
  // 히스토리
  const tbody=document.getElementById('att-history');
  const hist=DB.attendance.slice().reverse();
  if(!hist.length){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--gray-500);padding:2rem;">기록 없음</td></tr>';return;}
  tbody.innerHTML=hist.map(a=>{
    const r=a.records.find(x=>x.userId===u.id);const st=r?r.status:'—';
    const cls=st==='출석'?'as-ok':st==='지각'?'as-lt':st==='사유'?'as-ex':st==='결석'?'as-ab':'as-nn';
    return`<tr><td>${fmt(a.date)}</td><td>${esc(a.title)}</td><td><span class="${cls}">${st}</span></td>
    <td><code style="background:var(--gray-100);padding:1px 6px;border-radius:3px;font-size:11px;">${a.code}</code></td>
    <td>${r&&r.note?esc(r.note):'—'}</td></tr>`;
  }).join('');
}
window.renderExcusePanel = function(){
  const pending=(DB?.excuses||[]).filter(r=>r.status==='pending');
  const ep=document.getElementById('att-excuse-panel');
  if(!pending.length){ep.innerHTML='';return;}
  ep.innerHTML=`<div class="card"><div class="c-hd"><div class="c-title">📋 사유 불참 신청 대기 (${pending.length}건)</div></div>
    ${pending.map(r=>{
      const u2=(DB?.users||[]).find(x=>x.id===r.userId);
      const s=(DB?.attendance||[]).find(x=>x.id===r.sessionId)||{title:'—',date:r.date};
      return`<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:.58rem 0;border-bottom:1px solid var(--gray-100);gap:7px;">
        <div>
          <div style="font-size:13px;font-weight:500;">${u2?esc(u2.name):'—'} <span class="tm">— ${esc(s.title)} (${fmt(s.date||r.date)})</span></div>
          <div class="tm">${esc(r.reason)}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn btn-p btn-sm" onclick="processExcuse('${r.id}','approved')">승인</button>
          <button class="btn btn-d btn-sm" onclick="processExcuse('${r.id}','rejected')">반려</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
window.setTodayCode = function(){
  const code=document.getElementById('att-code-inp').value.trim().toUpperCase();
  if(!code)return toast('코드를 입력해주세요.','err');
  const today=new Date().toISOString().split('T')[0];
  DB.todayCode=code;
  let tA=(DB?.attendance||[]).find(a=>a.date===today);
  if(!tA){const d=new Date();tA={id:(DB?.attendance||[]).length+1,date:today,code,title:(d.getMonth()+1)+'월 '+d.getDate()+'일 세미나',records:[]};DB.attendance.push(tA);}
  else tA.code=code;
  toast('출석 코드 설정 완료: '+code,'ok');renderAttendance();
}
window.submitAttCode = function(){
  const code=document.getElementById('att-code-member').value.trim().toUpperCase();
  if(!code)return toast('코드를 입력해주세요.','err');
  const today=new Date().toISOString().split('T')[0];
  const tA=(DB?.attendance||[]).find(a=>a.date===today && a.code===code);
  if(!tA)return toast('출석 코드가 올바르지 않습니다.','err');
  const u = DB.currentUser;
  if((tA?.records||[]).find(r=>r.userId===u.id)) return toast('이미 출석체크 되었습니다.','err');
  tA.records.push({userId:u.id,status:'출석',time:new Date().toLocaleTimeString().slice(0,8)});
  toast('출석 완료! ✅','ok');renderAttendance();
}
window.openExcuseModal = function(date){
  const tA=(DB?.attendance||[]).find(a=>a.date===date);
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">📋 사유 불참 신청</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="al al-i"><span>ℹ️</span><div>사유 불참 신청은 임원진이 검토 후 승인합니다. 승인 시 '사유' 처리됩니다.</div></div>
    <div class="fg"><label class="fl">날짜</label><input class="fc" value="${fmt(date)}" disabled></div>
    <div class="fg"><label class="fl">불참 사유</label><textarea id="excuse-reason" class="fc" rows="4" placeholder="불참 사유를 상세히 입력해주세요..."></textarea></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="submitExcuse('${date}',${tA?tA.id:null})">신청</button></div>
  </div>`);
}
window.submitExcuse = function(date,sessionId){
  const reason=document.getElementById('excuse-reason').value.trim();
  if(!reason)return toast('사유를 입력해주세요.','err');
  if((DB?.excuses||[]).find(r=>r.userId===DB.currentUser.id&&r.date===date))return toast('이미 사유 불참 신청이 존재합니다.','err');
  DB.excuses.push({id:(DB?.excuses||[]).length+1,userId:DB.currentUser.id,sessionId,date,reason,status:'pending',submittedAt:date});
  closeModal();toast('사유 불참 신청이 제출되었습니다.','ok');renderAttendance();
}
window.processExcuse = function(rid,decision){
  const r=(DB?.excuses||[]).find(x=>x.id===rid);if(!r)return;
  r.status=decision;
  if(decision==='approved'){
    const s=(DB?.attendance||[]).find(a=>a.id===r.sessionId);
    if(s){const ex=s.records.find(rec=>rec.userId===r.userId);
      if(ex)ex.status='사유';else s.records.push({userId:r.userId,status:'사유',note:r.reason});}
  }
  toast(decision==='approved'?'사유 불참 승인 처리되었습니다.':'사유 불참 신청이 반려되었습니다.',decision==='approved'?'ok':'err');
  renderAttendance();
}
window.openAttStatusModal = function(){
  const today=new Date().toISOString().split('T')[0];
  const tA=(DB?.attendance||[]).find(a=>a.date===today);
  if (!tA) return toast('진행 중인 출석체크가 없습니다.', 'err');
  const active=(DB?.users||[]).filter(u=>u.status==='active');
  const rows=active.map(m=>{const r=tA?(tA?.records||[]).find(x=>x.userId===m.id):null;const st=r?r.status:'미출석';
  const cls=st==='출석'?'as-ok':st==='지각'?'as-lt':st==='사유'?'as-ex':st==='결석'?'as-ab':'as-nn';
  const mng = canMng(DB.currentUser);
  const stCell = mng ? `<span class="${cls}" style="cursor:pointer;" onclick="toggleAttStatus('${m.id}')">${st}</span>` : `<span class="${cls}">${st}</span>`;
  const timeStr = r?.time ? r.time : '-';
  return `<tr><td>${esc(m.name)}</td><td>${esc(m.group||'소속 없음')}</td><td>${stCell}</td><td class="tm">${timeStr}</td></tr>`;}).join('');
  openModal(`<div class="modal" style="max-width:520px;"><div class="m-hd"><div class="m-title">${esc(tA.title || '오늘의 세미나')} 출석 현황</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd"><div class="tw"><table><thead><tr><th>이름</th><th>그룹</th><th>상태</th><th>체크시간</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button></div></div>`);
}

// ─── ASSIGNMENTS ──────────────────────────────────────────
let curAsgTab='ongoing';
window.switchAsgTab = function(tab,btn){curAsgTab=tab;document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');renderAssignments(tab);}
window.renderAssignments = function(tab){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  if (!DB || !DB.assignments) {
    if (document.getElementById('asg-content')) {
      document.getElementById('asg-content').innerHTML = '<div class="spinner" style="text-align:center; padding: 2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  const u=DB.currentUser;const now=new Date();now.setHours(0,0,0,0);
  const el=document.getElementById('asg-content');
  if(tab==='all'&&canMng(u)){renderAllSub(el);return;}
  let asgns=(DB?.assignments||[]).filter(a=>{const dl=new Date(a.deadline);const sub=(a.submissions||[]).find(s=>s.userId===u.id);
    if(tab==='ongoing')return dl>=now&&!sub;if(tab==='submitted')return!!sub;if(tab==='overdue')return dl<now&&!sub;return true;});
  if(!canMng(u))asgns=asgns.filter(a=>a.group==='전체'||a.group===u.group);
  if(!asgns.length){const msgs={ongoing:'진행 중인 과제가 없습니다',submitted:'제출 완료한 과제가 없습니다',overdue:'마감 지난 미제출 과제가 없습니다'};
    el.innerHTML=`<div class="empty"><div class="empty-icon">📋</div><h3>과제 없음</h3><p>${msgs[tab]||''}</p></div>`;return;}
  el.innerHTML=asgns.map(a=>{const sub=(a.submissions||[]).find(s=>s.userId===u.id);const d=dUntil(a.deadline);
    const cnt=(a.submissions||[]).length;const elig=(DB?.users||[]).filter(x=>x.status==='active'&&(a.group==='전체'||x.group===a.group)).length;
    return`<div class="ai">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:7px;">
        <div><div style="font-size:14px;font-weight:600;">${esc(a.title)}</div>
          <div class="tm" style="margin-top:2px;">${esc(a.description)}</div>
          <div style="margin-top:4px;display:flex;gap:4px;">
            <span class="badge b-gy">${esc(a.group)}</span>
            ${sub?'<span class="badge b-gr">✓ 제출 완료</span>':''}
            ${d<0?'<span class="badge b-re">마감됨</span>':''}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          ${d>0?`<div style="font-size:13px;font-weight:600;color:var(--red);">D-${d}</div>`:'<div class="tm">마감됨</div>'}
          <div class="tm">${fmt(a.deadline)}</div>
          ${canMng(u)?`<div class="tm">${cnt}/${elig}명 제출</div>`:''}
        </div>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;">
        ${!sub&&d>0?`<button class="btn btn-p btn-sm" onclick="openSubmitModal('\${a.id}')">제출하기</button>`:''}
        ${sub?`<button class="btn btn-o btn-sm" disabled>✓ 제출완료</button>`:''}
        ${canMng(u)?`<button class="btn btn-o btn-sm" onclick="viewSubs('\${a.id}')">제출 현황</button>
          <button class="btn btn-d btn-sm" onclick="delAsg('\${a.id}')">삭제</button>`:''}
      </div>
    </div>`;}).join('');
}
window.renderAllSub = function(el){
  const now=new Date();now.setHours(0,0,0,0);
  el.innerHTML=(DB?.assignments||[]).map(a=>{
    const elig=(DB?.users||[]).filter(u=>u.status==='active'&&(a.group==='전체'||u.group===a.group));
    const pct=Math.round((a.submissions||[]).length/(elig.length||1)*100);
    return`<div class="card" style="margin-bottom:1rem;">
      <div class="c-hd"><div><div class="c-title">${esc(a.title)}</div><div class="c-sub">${esc(a.group)} · 마감 ${fmt(a.deadline)}</div></div>
        <div style="text-align:right;"><div style="font-size:18px;font-weight:700;color:var(--blue);">${(a.submissions||[]).length}/${elig.length}명</div><div class="tm">${pct}%</div></div>
      </div>
      <div class="prog" style="margin-bottom:.75rem;"><div class="pb ${pct>=80?'pb-gr':pct>=50?'pb-bl':'pb-re'}" style="width:${pct}%"></div></div>
      <div style="display:flex;gap:3px;flex-wrap:wrap;">
        ${elig.map(m=>{const s=(a.submissions||[]).find(x=>x.userId===m.id);return`<span class="badge ${s?'b-gr':'b-re'}">${esc(m.name)}</span>`;}).join('')}
      </div>
    </div>`;}).join('');
}
window.openSubmitModal = function(id){const a=(DB?.assignments||[]).find(x=>x.id===id);
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">과제 제출 — ${esc(a.title)}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="al al-i"><span>ℹ️</span><div>서버 배포 후 실제 파일 업로드가 가능합니다. 현재는 파일명으로 기록합니다.</div></div>
    <div class="fg"><label class="fl">파일명</label><input id="sub-file" class="fc" placeholder="홍길동_과제.pdf"></div>
    <div class="fg"><label class="fl">메모</label><textarea id="sub-memo" class="fc" rows="3" placeholder="전달사항"></textarea></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="doSubmit('\${id}')">제출</button></div>
  </div>`);
}
window.doSubmit = function(id){
  const file=document.getElementById('sub-file').value.trim();
  if(!file)return toast('파일명을 입력해주세요.','err');
  (DB?.assignments||[]).find(x=>x.id===id).submissions.push({userId:DB.currentUser.id,submittedAt:new Date().toLocaleString('ko'),file});
  closeModal();toast('과제가 제출되었습니다! ✅','ok');renderAssignments(curAsgTab);
}
window.viewSubs = function(id){
  const a=(DB?.assignments||[]).find(x=>x.id===id);
  const elig=(DB?.users||[]).filter(u=>u.status==='active'&&(a.group==='전체'||u.group===a.group));
  const rows=elig.map(m=>{const s=(a.submissions||[]).find(x=>x.userId===m.id);
  return`<tr><td>${esc(m.name)}</td><td>${esc(m.group)}</td>
    <td><span class="${s?'as-ok':'as-ab'}">${s?'제출':'미제출'}</span></td>
    <td>${s?esc(s.file):'—'}</td><td>${s?esc(s.submittedAt):'—'}</td></tr>`;}).join('');
  openModal(`<div class="modal" style="max-width:580px;"><div class="m-hd"><div class="m-title">제출 현황 — ${esc(a.title)}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd"><div class="tw"><table><thead><tr><th>이름</th><th>그룹</th><th>상태</th><th>파일</th><th>제출일시</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button></div></div>`);
}
window.openNewAsgModal = function(){
  const d=new Date();d.setDate(d.getDate()+7);const def=d.toISOString().split('T')[0];
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">+ 새 과제 추가</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">과제명</label><input id="na-title" class="fc"></div>
    <div class="fg"><label class="fl">설명</label><textarea id="na-desc" class="fc" rows="3"></textarea></div>
    <div class="fg"><label class="fl">대상 그룹</label>
      <select id="na-group" class="fc"><option value="전체">전체</option>${(DB?.groups||[]).map(g=>`<option>${esc(g)}</option>`).join('')}</select></div>
    <div class="fg"><label class="fl">마감일</label><input type="date" id="na-deadline" class="fc" value="${def}"></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="createAsg()">추가</button></div>
  </div>`);
}
window.createAsg = function(){
  const title=document.getElementById('na-title').value.trim();
  const deadline=document.getElementById('na-deadline').value;
  if(!title||!deadline)return toast('과제명과 마감일을 입력해주세요.','err');
  DB.assignments.push({id:(DB?.assignments||[]).length+1,title,description:document.getElementById('na-desc').value,deadline,createdBy:DB.currentUser.id,group:document.getElementById('na-group').value,submissions:[]});
  closeModal();toast('과제가 추가되었습니다.','ok');renderAssignments(curAsgTab);
}
window.delAsg = async function(id) {
  if(!confirm('과제를 삭제하시겠습니까?'))return;
  try { await deleteDoc(doc(db, "assignments", id)); await fetchFirestoreData(); toast('삭제되었습니다.','ok'); renderAssignments(window.curAsgTab); } catch(e) { toast('오류', 'err'); }
}

// ─── MEMBERS ──────────────────────────────────────────────
window.renderMembers = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  let ms=(DB?.users||[]).filter(u=>u.status==='active');
  const f=DB.mFilter;
  if(f.search)ms=ms.filter(m=>m.name.includes(f.search)||m.studentId.includes(f.search)||m.dept.includes(f.search));
  if(f.group)ms=ms.filter(m=>m.group===f.group);
  if(f.rank)ms=ms.filter(m=>m.rank===f.rank);
  if(f.study==='스터디 없음')ms=ms.filter(m=>!m.studies||m.studies.length===0);
  else if(f.study)ms=ms.filter(m=>m.studies&&m.studies.includes(f.study));
  document.getElementById('member-cnt').textContent=ms.length+'명';
  const u=DB.currentUser;const tbody=document.getElementById('member-tbody');
  if(!ms.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--gray-500);padding:2rem;">검색 결과가 없습니다.</td></tr>';return;}
  tbody.innerHTML=ms.map(m=>`<tr>
    <td><div class="av ${avC(m.id)}">${esc(m.avatar)}</div></td>
    <td><strong>${esc(m.name)}</strong></td>
    <td style="font-family:monospace;font-size:12px;">${m.studentId}</td>
    <td>${esc(m.dept)}</td>
    <td><span class="badge b-bl" style="font-size:11px;">${esc(m.group||'—')}</span></td>
    <td><div style="display:flex;gap:3px;flex-wrap:wrap;">${studyBadges(m.studies)}</div></td>
    <td><span class="rank ${rCls(m.rank)}">${m.rank}</span>${isAdmin(DB.currentUser) ? `<button class="btn btn-o btn-sm" onclick="openMemberModal('${m.id}')" style="margin-left:8px;">편집</button>` : ''}</td>
    <td><span class="badge b-gr">활동 중</span></td>
    <td style="white-space:nowrap;">
      <button class="btn btn-o btn-sm" onclick="viewMemberProfile('${m.id}')">프로필</button>
      ${canMng(u)&&m.id!==u.id?`<button class="btn btn-o btn-sm" onclick="openMemberModal('${m.id}')" style="margin-left:3px;">편집</button>
      <button class="btn btn-d btn-sm" onclick="delMember('\${m.id}')" style="margin-left:3px;">삭제</button>`:''}
    </td>
  </tr>`).join('');
}
window.filterM = function(k,v){DB.mFilter[k]=v;renderMembers();}
window.old_openMemberModal = function(userId){
  const m=userId?(DB?.users||[]).find(u=>u.id===userId):null;
  openModal(`<div class="modal" style="max-width:500px;"><div class="m-hd"><div class="m-title">${m?'학회원 편집':'학회원 추가'}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">이름 *</label><input id="em-name" class="fc" value="${m?esc(m.name):''}"></div>
    <div class="fg"><label class="fl">이메일</label><input id="em-email" class="fc" value="${m?m.email:''}" ${m?'disabled':''}></div>
    <div class="fg"><label class="fl">학번 *</label><input id="em-sid" class="fc" value="${m?m.studentId:''}"></div>
    <div class="fg"><label class="fl">학과</label><input id="em-dept" class="fc" value="${m?esc(m.dept):''}"></div>
    <div class="fg"><label class="fl">프로젝트 조</label>
      <select id="em-group" class="fc"><option value="">— 미지정 —</option>${(DB?.groups||[]).map(g=>`<option ${m&&m.group===g?'selected':''}>${esc(g)}</option>`).join('')}</select></div>
    <div class="fg"><label class="fl">스터디 참가 (중복 선택 가능)</label>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
          <input type="checkbox" id="em-study-ps" value="포토샵 스터디" ${m&&m.studies&&m.studies.includes('포토샵 스터디')?'checked':''}>포토샵 스터디</label>
        <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
          <input type="checkbox" id="em-study-il" value="일러스트 스터디" ${m&&m.studies&&m.studies.includes('일러스트 스터디')?'checked':''}>일러스트 스터디</label>
      </div>
    </div>
    <div class="fg"><label class="fl">직급</label>
      <select id="em-rank" class="fc">${RANKS.map(r=>`<option ${m&&m.rank===r?'selected':''}>${r}</option>`).join('')}</select></div>
    ${!m?`<div class="fg"><label class="fl">임시 비밀번호</label><input id="em-pw" class="fc" value="1234"></div>`:''}
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="saveMember('\${userId||'null'}')">${m?'저장':'추가'}</button></div>
  </div>`);
}
window.old_saveMember = function(userId){
  const name=document.getElementById('em-name').value.trim();
  const sid=document.getElementById('em-sid').value.trim();
  const dept=document.getElementById('em-dept').value.trim();
  const group=document.getElementById('em-group').value;
  const rank=document.getElementById('em-rank').value;
  const studies=[];
  if(document.getElementById('em-study-ps')?.checked)studies.push('포토샵 스터디');
  if(document.getElementById('em-study-il')?.checked)studies.push('일러스트 스터디');
  if(!name||!sid)return toast('이름과 학번은 필수입니다.','err');
  if(userId&&userId!=='null'){
    const m=(DB?.users||[]).find(u=>u.id===userId);
    Object.assign(m,{name,studentId:sid,dept,group,studies,rank,avatar:name[0]});
    toast(name+'의 정보가 수정되었습니다.','ok');
  }else{
    const email=document.getElementById('em-email').value.trim();
    const pw=document.getElementById('em-pw').value||'1234';
    if(!email)return toast('이메일을 입력해주세요.','err');
    DB.users.push({id:Date.now(),name,email,pw,studentId:sid,dept,group,studies,rank,status:'active',avatar:name[0]});
    toast(name+' 학회원이 추가되었습니다.','ok');
  }
  closeModal();renderMembers();
}
window.delMember = function(id){
  const m=(DB?.users||[]).find(u=>u.id===id);
  if(!confirm(m.name+' 학회원을 삭제하시겠습니까?'))return;
  m.status='inactive';toast(m.name+'이 명단에서 삭제되었습니다.','');renderMembers();
}
window.viewMemberProfile = function(id){
  const m=(DB?.users||[]).find(u=>u.id===id);
  const att=getAttStats(id);const asg=getAsgStats(id,m.group);
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">${esc(m.name)} 프로필</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div style="text-align:center;margin-bottom:1.2rem;">
      <div class="av ${avC(m.id)}" style="width:60px;height:60px;font-size:20px;margin:0 auto .65rem;">${esc(m.avatar)}</div>
      <div style="font-size:17px;font-weight:700;">${esc(m.name)}</div>
      <div style="display:flex;gap:5px;justify-content:center;margin-top:4px;">
        <span class="rank ${rCls(m.rank)}">${m.rank}</span>${isAdmin(DB.currentUser) ? `<button class="btn btn-o btn-sm" onclick="openMemberModal('${m.id}')" style="margin-left:8px;">편집</button>` : ''}
        <span class="badge b-gy">${esc(m.group||'—')}</span>
      </div>
    </div>
    <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.85rem;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;font-size:13px;">
        <div class="tm">학번</div><div>${m.studentId}</div>
        <div class="tm">학과</div><div>${esc(m.dept)}</div>
        <div class="tm">이메일</div><div style="font-size:12px;">${m.email}</div>
        <div class="tm">스터디</div><div>${studyBadges(m.studies)}</div>
        <div class="tm">출석률</div><div style="font-weight:600;color:var(--blue);">${att.rate}%</div>
        <div class="tm">제출률</div><div style="font-weight:600;color:var(--green);">${asg.rate}%</div>
      </div>
    </div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button></div>
  </div>`);
}

// ─── PROFILE ──────────────────────────────────────────────
window.getAttStats = function(uid){
  const sessions=(DB?.attendance||[]).filter(a=>a.records.length>0);
  let att=0,late=0,ex=0,abs=0;
  sessions.forEach(s=>{const r=s.records.find(x=>x.userId===uid);if(r){if(r.status==='출석')att++;else if(r.status==='지각')late++;else if(r.status==='사유')ex++;else abs++;}});
  return{total:sessions.length,att,late,ex,abs,rate:sessions.length?Math.round(att/sessions.length*100):0};
}
window.getAsgStats = function(uid,group){
  const elig=(DB?.assignments||[]).filter(a=>a.group==='전체'||a.group===group);
  const sub=elig.filter(a=>(a.submissions||[]).find(s=>s.userId===uid)).length;
  return{total:elig.length,submitted:sub,rate:elig.length?Math.round(sub/elig.length*100):0};
}
window.renderProfile = function(){
  const u=DB.currentUser;
  document.getElementById('prof-av').textContent=u.avatar;
  document.getElementById('prof-name').textContent=u.name;
  document.getElementById('prof-rank').textContent=u.rank;
  document.getElementById('prof-rank').className='rank '+rCls(u.rank);
  document.getElementById('prof-group').textContent=(u.group||'조 미지정');
  const studyEl=document.getElementById('prof-study');if(studyEl)studyEl.innerHTML=studyBadges(u.studies);
  document.getElementById('prof-dept').textContent=u.dept+' · '+u.studentId;
  document.getElementById('prof-email').textContent=u.email;
  const att=getAttStats(u.id);
  document.getElementById('prof-att').innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:.85rem;text-align:center;">
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--green);">${att.att}</div><div class="tm">출석</div></div>
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:#f57c00;">${att.late}</div><div class="tm">지각</div></div>
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--blue);">${att.ex}</div><div class="tm">사유</div></div>
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--red);">${att.abs}</div><div class="tm">결석</div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;"><span style="font-size:13px;font-weight:500;">출석률</span><span style="font-size:13px;font-weight:700;color:var(--blue);">${att.rate}%</span></div>
    <div class="prog"><div class="pb pb-bl" style="width:${att.rate}%"></div></div>
    <div class="tm" style="margin-top:4px;">전체 ${att.total}회 중 ${att.att}회 출석</div>`;
  const asg=getAsgStats(u.id,u.group);
  document.getElementById('prof-asg').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.85rem;text-align:center;">
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--green);">${asg.submitted}</div><div class="tm">제출 완료</div></div>
      <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--red);">${asg.total-asg.submitted}</div><div class="tm">미제출</div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;"><span style="font-size:13px;font-weight:500;">제출률</span><span style="font-size:13px;font-weight:700;color:var(--green);">${asg.rate}%</span></div>
    <div class="prog"><div class="pb pb-gr" style="width:${asg.rate}%"></div></div>
    <div class="tm" style="margin-top:4px;">전체 ${asg.total}개 중 ${asg.submitted}개 제출</div>`;
}
window.openEditProfileModal = function(){
  const u=DB.currentUser;
  openModal(`<div class="modal"><div class="m-hd"><div class="m-title">프로필 수정</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">이름</label><input id="ep-name" class="fc" value="${esc(u.name)}"></div>
    <div class="fg"><label class="fl">학과</label><input id="ep-dept" class="fc" value="${esc(u.dept)}"></div>
    <div class="fg"><label class="fl">현재 비밀번호</label><input type="password" id="ep-cur" class="fc"></div>
    <div class="fg"><label class="fl">새 비밀번호 (변경 시)</label><input type="password" id="ep-new" class="fc"></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="saveProfile()">저장</button></div>
  </div>`);
}
window.saveProfile = function(){
  const u=DB.currentUser;
  const name=document.getElementById('ep-name').value.trim();
  const dept=document.getElementById('ep-dept').value.trim();
  const newPw=document.getElementById('ep-new').value;
  if(!name)return toast('이름을 입력해주세요.','err');
  if(newPw){if(document.getElementById('ep-cur').value!==u.pw)return toast('현재 비밀번호가 올바르지 않습니다.','err');if(newPw.length<6)return toast('비밀번호는 6자 이상이어야 합니다.','err');u.pw=newPw;}
  u.name=name;u.dept=dept;u.avatar=name[0];
  closeModal();toast('프로필이 저장되었습니다.','ok');initApp();goPage('profile');
}

// ─── FILES ────────────────────────────────────────────────
window.renderFiles = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  let files=[...DB.files];const f=DB.fFilter;
  if(f.team)files=files.filter(x=>x.group===f.team);
  if(f.type)files=files.filter(x=>x.type===f.type);
  if(f.search)files=files.filter(x=>x.name.toLowerCase().includes(f.search.toLowerCase()));
  document.getElementById('fs-total').textContent=(DB?.files||[]).length;
  document.getElementById('fs-pdf').textContent=(DB?.files||[]).filter(f=>f.type==='PDF').length;
  document.getElementById('fs-psd').textContent=(DB?.files||[]).filter(f=>f.type==='PSD'||f.type==='AI').length;
  document.getElementById('fs-size') && (document.getElementById('fs-size').textContent=(DB?.files||[]).reduce((s,f)=>s+f.sizeMB,0).toFixed(1));
  const linkedEl=document.getElementById('fs-linked');if(linkedEl)linkedEl.textContent=(DB?.files||[]).filter(f=>f.storagePath).length;
  const tbody=document.getElementById('file-tbody');
  if(!files.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--gray-500);padding:2rem;">파일이 없습니다.</td></tr>';return;}
  tbody.innerHTML=files.map(file=>{
    const up=(DB?.users||[]).find(u=>u.id===file.uploaderId);
    const as=file.assignId?(DB?.assignments||[]).find(a=>a.id===file.assignId):null;
    const fc={'PDF':'fi-pdf','PSD':'fi-psd','AI':'fi-ai','PNG':'fi-png'}[file.type]||'fi-etc';
    const canDel=DB.currentUser.id===file.uploaderId||isAdmin(DB.currentUser);
    return`<tr>
      <td><div class="fi ${fc}">${file.type}</div></td>
      <td style="font-size:13px;font-weight:500;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(file.name)}">${esc(file.name)}</td>
      <td><span class="cat-folder">${esc(file.category||'—')}</span></td>
      <td><span class="badge b-gy" style="font-size:10px;">${esc(file.group)}</span></td>
      <td>${up?esc(up.name):'—'}</td>
      <td>${as?`<span class="badge b-bl" style="font-size:10px;">${esc(as.title)}</span>`:'—'}</td>
      <td class="tm">${fmt(file.uploadedAt)}</td>
      <td class="tm">${file.sizeMB.toFixed(1)}MB</td>
      <td style="white-space:nowrap;">
        ${file.storagePath
          ? `<button class="btn btn-o btn-sm" onclick="downloadFile('\${file.id}')">⬇ 다운로드</button>`
          : `<span class="tm">경로 없음</span>`}
        ${canDel?`<button class="btn btn-d btn-sm" onclick="delFile('\${file.id}')" style="margin-left:3px;">삭제</button>`:''}
      </td>
    </tr>`;}).join('');
}
window.fF = function(k,v){DB.fFilter[k]=v;renderFiles();}

// ─── SUPABASE STORAGE CONFIG ──────────────────────────────
const SB_CFG={url:'',anonKey:'',client:null,ready:false};
const SB_BUCKET='dif-files';
const SB_CATEGORIES=['attendance','documents','events','promotion','reports','backup'];

window.openStorageConfigModal = function(){
  openModal(`<div class="modal" style="max-width:520px;">
    <div class="m-hd"><div class="m-title">&#9881; Supabase Storage &#49444;&#51221;</div><button class="m-x" onclick="closeModal()">&#x2715;</button></div>
    <div class="m-bd">
      <div class="al al-i" style="margin-bottom:1rem;"><span>&#8505;&#65039;</span><div>
        <a href="https://supabase.com/dashboard" target="_blank" style="color:var(--blue);">supabase.com/dashboard</a>
        &#8594; &#54532;&#47196;&#51116;&#53944; &#49120;&#53469; &#8594; Settings &#8594; API &#50640;&#49436; &#54869;&#51064;&#54616;&#49464;&#50836;.
      </div></div>
      <div class="api-key-input">
        <div class="fg"><label class="fl">Project URL</label>
          <input id="sb-url" class="fc" placeholder="https://xxxx.supabase.co" style="font-family:monospace;font-size:12px;"></div>
        <div class="fg" style="margin-bottom:0;"><label class="fl">Anon Key (public)</label>
          <input id="sb-key" class="fc" placeholder="eyJhbGci..." style="font-family:monospace;font-size:12px;"></div>
      </div>
      <div class="al al-w"><span>&#9888;&#65039;</span><div>Anon Key&#45716; &#44277;&#44060; &#53ค;&#51077;&#45768;&#45796;. Supabase RLS &#51221;&#52293;&#51004;&#47196; &#51217;&#44540;&#51012; &#51228;&#54620;&#54616;&#49464;&#50836;.</div></div>
      <details style="margin-top:.5rem;">
        <summary style="font-size:13px;font-weight:500;cursor:pointer;color:var(--blue);">&#128203; Supabase &#48260;&#53637; &#49444;&#51221; &#48169;&#48277;</summary>
        <ol style="font-size:12px;line-height:1.9;margin-top:.75rem;padding-left:1.2rem;color:var(--gray-700);">
          <li>Supabase Dashboard &#51217;&#49549; &#8594; &#54532;&#47196;&#51216;&#53944; &#49120;&#53469;</li>
          <li>Storage &#8594; New Bucket &#8594; &#51060;&#47492;: <strong>dif-files</strong> &#47784;&#46300;: Public</li>
          <li>&#48260;&#53637; &#45236; &#54ดอ&#45908; &#49373;&#49457;: attendance / documents / events / promotion / reports / backup</li>
          <li>Settings &#8594; API &#8594; Project URL &#48143; anon key &#48373;&#49324;</li>
          <li>&#50948; &#46160; &#44049; &#51077;&#47141; &#54980; &#51200;&#51109;</li>
        </ol>
      </details>
    </div>
    <div class="m-ft">
      <button class="btn btn-o" onclick="closeModal()">&#52712;&#49548;</button>
      <button class="btn btn-p" onclick="saveStorageConfig()">&#51200;&#51109; &#48143; &#50672;&#44208;</button>
    </div>
  </div>`);
}

window.saveStorageConfig = function(){
  const url=document.getElementById('sb-url').value.trim();
  const key=document.getElementById('sb-key').value.trim();
  if(!url||!key)return toast('Project URL과 Anon Key를 모두 입력해주세요.','err');
  if(!url.startsWith('https://'))return toast('올바른 Supabase URL을 입력해주세요.','err');
  SB_CFG.url=url;SB_CFG.anonKey=key;
  try{
    SB_CFG.client=supabase.createClient(url,key);
    SB_CFG.ready=true;
    const banner=document.getElementById('storage-config-banner');
    if(banner)banner.style.display='none';
    const btn=document.getElementById('upload-btn');
    if(btn)btn.disabled=false;
    closeModal();
    toast('Supabase Storage 연결 완료! ✅','ok');
  }catch(e){toast('Supabase 연결 실패: '+e.message,'err');}
}

// 업로드 모달 — PDF 전용
window.openUploadModal = function(){
  if(!SB_CFG.ready)return toast('먼저 Supabase 설정을 완료해주세요.','warn');
  openModal(`<div class="modal" style="max-width:480px;">
    <div class="m-hd"><div class="m-title">&#8679; PDF 파일 업로드</div><button class="m-x" onclick="closeModal()">&#x2715;</button></div>
    <div class="m-bd">
      <div class="al al-i"><span>&#8505;&#65039;</span><div>PDF 파일만 업로드 가능합니다. Supabase Storage <strong>dif-files</strong> 버킷에 저장됩니다.</div></div>
      <div class="fg"><label class="fl">PDF 파일 선택 *</label>
        <input type="file" id="uf-inp" class="fc" accept=".pdf,application/pdf" onchange="validatePDF(this)"></div>
      <div id="uf-preview" style="display:none;background:var(--gray-50);border-radius:var(--r-sm);padding:.6rem;margin-bottom:.85rem;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">&#128196;</span>
          <div><div style="font-size:13px;font-weight:500;" id="uf-name"></div><div class="tm" id="uf-size"></div></div>
        </div>
      </div>
      <div id="uf-error" class="al al-e" style="display:none;"><span>&#10060;</span><div id="uf-error-msg"></div></div>
      <div class="fg"><label class="fl">카테고리 (저장 폴더) *</label>
        <select id="uf-cat" class="fc">
          <option value="documents">documents - 일반 문서</option>
          <option value="reports">reports - 보고서/포트폴리오</option>
          <option value="attendance">attendance - 출석 관련</option>
          <option value="events">events - 행사 자료</option>
          <option value="promotion">promotion - 홍보물</option>
          <option value="backup">backup - 백업</option>
        </select>
      </div>
      <div class="fg"><label class="fl">프로젝트 조</label>
        <select id="uf-group" class="fc"><option value="전체">전체</option>${(DB?.groups||[]).map(g=>`<option>${esc(g)}</option>`).join('')}</select></div>
      <div class="fg"><label class="fl">과제 연결 (선택)</label>
        <select id="uf-asg" class="fc"><option value="">연결 안 함</option>${(DB?.assignments||[]).map(a=>`<option value="${a.id}">${esc(a.title)}</option>`).join('')}</select></div>
      <div id="upload-progress-wrap" style="display:none;margin-top:.75rem;">
        <div class="tm" id="upload-progress-label">업로드 중...</div>
        <div class="upload-progress"><div class="upload-progress-bar" id="upload-progress-bar" style="width:0%"></div></div>
      </div>
    </div>
    <div class="m-ft">
      <button class="btn btn-o" onclick="closeModal()">취소</button>
      <button class="btn btn-p" id="do-upload-btn" onclick="doUpload()">업로드</button>
    </div>
  </div>`);
}

window.validatePDF = function(inp){
  const errBox=document.getElementById('uf-error');
  const errMsg=document.getElementById('uf-error-msg');
  const preview=document.getElementById('uf-preview');
  const uploadBtn=document.getElementById('do-upload-btn');
  if(!inp.files||!inp.files[0]){if(preview)preview.style.display='none';return;}
  const file=inp.files[0];
  const ext=file.name.split('.').pop().toLowerCase();
  // PDF 검증 — 확장자 + MIME 이중 확인
  if(ext!=='pdf'||!file.type.includes('pdf')){
    if(errBox)errBox.style.display='flex';
    if(errMsg)errMsg.textContent='PDF 파일만 업로드 가능합니다. (현재: .'+ext+' / '+file.type+')';
    if(preview)preview.style.display='none';
    if(uploadBtn)uploadBtn.disabled=true;
    inp.value='';return;
  }
  if(errBox)errBox.style.display='none';
  if(preview)preview.style.display='';
  const nameEl=document.getElementById('uf-name');if(nameEl)nameEl.textContent=file.name;
  const sizeEl=document.getElementById('uf-size');if(sizeEl)sizeEl.textContent=(file.size/1024/1024).toFixed(2)+' MB';
  if(uploadBtn)uploadBtn.disabled=false;
}

async function doUpload(){
  const inp=document.getElementById('uf-inp');
  if(!inp||!inp.files||!inp.files[0])return toast('파일을 선택해주세요.','err');
  const file=inp.files[0];
  // 최종 PDF 이중 검증
  if(!file.name.toLowerCase().endsWith('.pdf')||!file.type.includes('pdf'))
    return toast('PDF 파일만 업로드 가능합니다.','err');
  const category=document.getElementById('uf-cat').value;
  const group=document.getElementById('uf-group').value;
  const asgId=document.getElementById('uf-asg').value;
  const ts=Date.now();
  const safeName=file.name.replace(/[^a-zA-Z0-9가-힣._-]/g,'_');
  const storagePath=category+'/'+ts+'_'+safeName;
  const progWrap=document.getElementById('upload-progress-wrap');
  const progBar=document.getElementById('upload-progress-bar');
  const progLabel=document.getElementById('upload-progress-label');
  const uploadBtn=document.getElementById('do-upload-btn');
  if(progWrap)progWrap.style.display='';
  if(uploadBtn)uploadBtn.disabled=true;
  if(progBar)progBar.style.width='30%';
  if(progLabel)progLabel.textContent='업로드 중...';
  try{
    const {error}=await SB_CFG.client.storage.from(SB_BUCKET).upload(storagePath,file,{
      contentType:'application/pdf',upsert:false,
    });
    if(error)throw error;
    if(progBar)progBar.style.width='80%';
    if(progLabel)progLabel.textContent='메타데이터 저장 중...';
    const today=new Date().toISOString().split('T')[0];
    DB.files.push({
      id:Date.now(),name:file.name,type:'PDF',group,
      uploaderId:DB.currentUser.id,
      assignId:asgId?parseInt(asgId):null,
      uploadedAt:today,
      sizeMB:parseFloat((file.size/1024/1024).toFixed(2)),
      storagePath,category,
    });
    if(progBar)progBar.style.width='100%';
    if(progLabel)progLabel.textContent='완료!';
    setTimeout(()=>{closeModal();toast(file.name+' 업로드 완료! ✅','ok');renderFiles();},600);
  }catch(e){
    if(progWrap)progWrap.style.display='none';
    if(uploadBtn)uploadBtn.disabled=false;
    toast('업로드 실패: '+e.message,'err');
  }
}

// 다운로드 — Supabase signed URL (1시간 유효, 권한 체크)
async function downloadFile(fileId){
  const f=(DB?.files||[]).find(x=>x.id===fileId);
  if(!f||!f.storagePath)return toast('파일 경로를 찾을 수 없습니다.','err');
  if(!SB_CFG.ready)return toast('Supabase가 연결되지 않았습니다.','warn');
  const u=DB.currentUser;
  // 권한: 학회원은 본인 업로드 파일만 다운로드 가능
  if(!canMng(u)&&f.uploaderId!==u.id)
    return toast('타인의 파일은 다운로드할 수 없습니다. 운영진에게 문의하세요.','err');
  try{
    toast('다운로드 링크 생성 중...','');
    const {data,error}=await SB_CFG.client.storage.from(SB_BUCKET).createSignedUrl(f.storagePath,3600);
    if(error)throw error;
    const a=document.createElement('a');a.href=data.signedUrl;a.download=f.name;a.click();
    toast(f.name+' 다운로드 시작!','ok');
  }catch(e){toast('다운로드 실패: '+e.message,'err');}
}


async function delFile(id){
  const f=(DB?.files||[]).find(x=>x.id===id);
  if(!f)return;
  if(!canMng(DB.currentUser))return toast('운영진만 파일을 삭제할 수 있습니다.','err');
  if(!confirm('"'+f.name+'"을 삭제하시겠습니까?'))return;
  // Supabase Storage에서 파일 삭제
  if(SB_CFG.ready&&f.storagePath){
    try{
      const {error}=await SB_CFG.client.storage.from(SB_BUCKET).remove([f.storagePath]);
      if(error)throw error;
    }catch(e){
      if(!confirm('Storage 삭제 실패: '+e.message+'\n\n목록에서만 제거할까요?'))return;
    }
  }
  DB.files.splice((DB?.files||[]).findIndex(x=>x.id===id),1);
  toast('파일이 삭제되었습니다.','');renderFiles();
}
window.exportFileCSV = function(){
  const h=['파일명','카테고리','그룹','업로더','과제','업로드일','용량(MB)','저장 경로'];
  const r=(DB?.files||[]).map(f=>{const up=(DB?.users||[]).find(u=>u.id===f.uploaderId);const as=f.assignId?(DB?.assignments||[]).find(a=>a.id===f.assignId):null;return[f.name,f.category||'—',f.group,up?up.name:'',as?as.title:'',f.uploadedAt,f.sizeMB.toFixed(1),f.storagePath||'—'];});
  dlCSV([h,...r],'DIF_작업물목록.csv');
}

// ─── TEAM LOG ─────────────────────────────────────────────
window.renderLogs = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  let logs=[...DB.teamLogs];
  const gf=document.getElementById('log-gf')?.value||'';
  const cf=document.getElementById('log-cf')?.value||'';
  if(gf)logs=logs.filter(l=>l.group===gf||(gf===''||l.group==='전체'));
  if(cf)logs=logs.filter(l=>l.category===cf);
  logs=logs.slice().reverse();
  const el=document.getElementById('log-content');
  if(!logs.length){el.innerHTML='<div class="empty"><div class="empty-icon">📝</div><h3>로그 없음</h3><p>아직 작성된 로그가 없습니다.</p></div>';return;}
  el.innerHTML=logs.map(log=>{
    const auth=(DB?.users||[]).find(u=>u.id===log.authorId);
    const canEdit=DB.currentUser.id===log.authorId||isAdmin(DB.currentUser);
    return`<div class="lc">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:5px;gap:7px;">
        <div style="flex:1;">
          <span class="log-cat ${LC_CLS[log.category]||'lc-e'}">${log.category}</span>
          <span class="badge b-gy" style="margin-left:4px;">${esc(log.group)}</span>
          <div style="font-size:14px;font-weight:600;margin-top:3px;">${esc(log.title)}</div>
          <div class="tm">${auth?esc(auth.name):'—'} · ${fmt(log.createdAt)}</div>
        </div>
        ${canEdit?`<div style="display:flex;gap:3px;flex-shrink:0;">
          <button class="btn btn-o btn-sm" onclick="openLogModal('\${log.id}')">수정</button>
          <button class="btn btn-d btn-sm" onclick="delLog('\${log.id}')">삭제</button>
        </div>`:''}
      </div>
      <div style="font-size:13px;color:var(--gray-700);line-height:1.7;white-space:pre-wrap;">${esc(log.content)}</div>
    </div>`;}).join('');
}
window.openLogModal = function(id){ if(id === 'null') id = null;
  const e=id?(DB?.teamLogs||[]).find(l=>l.id===id):null;
  openModal(`<div class="modal" style="max-width:540px;"><div class="m-hd"><div class="m-title">${e?'로그 수정':'+ 새 로그 작성'}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">제목</label><input id="lg-title" class="fc" value="${e?esc(e.title):''}"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:.85rem;">
      <div class="fg" style="margin-bottom:0;"><label class="fl">카테고리</label>
        <select id="lg-cat" class="fc">${LOG_CATS.map(c=>`<option ${e&&e.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="fg" style="margin-bottom:0;"><label class="fl">그룹</label>
        <select id="lg-group" class="fc"><option value='전체' ${e&&e.group==='전체'?'selected':''}>전체</option>${(DB?.groups||[]).map(g=>`<option ${e&&e.group===g?'selected':''}>${esc(g)}</option>`).join('')}</select></div>
    </div>
    <div class="fg"><label class="fl">내용</label><textarea id="lg-content" class="fc" rows="8">${e?esc(e.content):''}</textarea></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="saveLog('\${id||'null'}')">${e?'저장':'작성'}</button></div>
  </div>`);
}
window.saveLog = function(id){
  const title=document.getElementById('lg-title').value.trim();
  const content=document.getElementById('lg-content').value.trim();
  if(!title||!content)return toast('제목과 내용을 입력해주세요.','err');
  const cat=document.getElementById('lg-cat').value;const group=document.getElementById('lg-group').value;
  if(id&&id!=='null'){const l=(DB?.teamLogs||[]).find(x=>x.id===id);Object.assign(l,{title,category:cat,group,content});}
  else DB.teamLogs.push({id:Date.now(),title,category:cat,group,content,authorId:DB.currentUser.id,createdAt:new Date().toISOString().split('T')[0]});
  closeModal();toast(id&&id!=='null'?'로그가 수정되었습니다.':'로그가 작성되었습니다. ✅','ok');renderLogs();
}
window.delLog = async function(id) {
  if(!confirm('로그를 삭제하시겠습니까?'))return;
  try { await deleteDoc(doc(db, "teamLogs", id)); await fetchFirestoreData(); toast('삭제되었습니다.','ok'); renderLogs(); } catch(e) { toast('오류', 'err'); }
}

window.exportLogCSV = function() {
  const h=['제목','카테고리','그룹','작성자','날짜','내용'];
  const r=(DB?.teamLogs||[]).map(l=>{const a=(DB?.users||[]).find(u=>u.id===l.authorId);return[l.title,l.category,l.group,a?a.name:'',l.createdAt,l.content.replace(/\n/g,' ')];});
  dlCSV([h,...r],'DIF_팀로그_백업.csv');toast('팀 로그 백업 파일이 다운로드됩니다.','ok');
};
// ─── NOTIFY ───────────────────────────────────────────────
window.renderNotify = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }renderNSPanel();renderAbPanel();renderNotiLog();updateNotifyBadge();}
window.renderNSPanel = function(){
  const now=new Date();now.setHours(0,0,0,0);
  const active=(DB?.assignments||[]).filter(a=>new Date(a.deadline)>=now);
  const el=document.getElementById('notify-ns');
  if(!active.length){el.innerHTML='<div class="empty" style="padding:1rem 0;"><p>진행 중인 과제가 없습니다.</p></div>';return;}
  el.innerHTML=active.map(a=>{
    const elig=(DB?.users||[]).filter(u=>u.status==='active'&&(a.group==='전체'||u.group===a.group));
    const ns=elig.filter(m=>!(a.submissions||[]).find(s=>s.userId===m.id));
    return`<div class="ni-item">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;">${esc(a.title)}</div>
        <div class="tm">마감 ${fmt(a.deadline)} · 미제출 ${ns.length}명</div>
        ${ns.length>0?`<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;">${ns.map(m=>`<span class="badge b-re" style="font-size:10px;">${esc(m.name)}</span>`).join('')}</div>`:'<span class="badge b-gr">모두 제출</span>'}
      </div>
      ${ns.length>0?`<button class="btn btn-p btn-sm" onclick="sendNSNotify('\${a.id}')" style="flex-shrink:0;">알림</button>`:''}
    </div>`;}).join('');
}
window.renderAbPanel = function(){
  const el=document.getElementById('notify-ab');
  const sessions=(DB?.attendance||[]).filter(s=>s.records.length>0).slice(-3).reverse();
  if(!sessions.length){el.innerHTML='<div class="empty" style="padding:1rem 0;"><p>출석 기록 없음</p></div>';return;}
  el.innerHTML=sessions.map(s=>{
    const targets=s.records.filter(r=>r.status==='지각'||r.status==='결석');
    return`<div class="ni-item">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;">${esc(s.title)} <span class="tm">${fmt(s.date)}</span></div>
        <div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;">${targets.length===0?'<span class="badge b-gr">이상 없음</span>':
          targets.map(r=>{const u=(DB?.users||[]).find(x=>x.id===r.userId);return u?`<span class="badge ${r.status==='지각'?'b-ye':'b-re'}" style="font-size:10px;">${esc(u.name)}(${r.status})</span>`:''}).join('')}</div>
      </div>
      ${targets.length>0?`<button class="btn btn-p btn-sm" onclick="sendAbNotify('\${s.id}')" style="flex-shrink:0;">알림</button>`:''}
    </div>`;}).join('');
}
window.renderNotiLog = function(){
  const el=document.getElementById('notify-log');
  if(!(DB?.notifications||[]).length){el.innerHTML='<div class="empty" style="padding:1rem 0;"><p>발송 내역이 없습니다.</p></div>';return;}
  el.innerHTML=DB.notifications.slice().reverse().slice(0,20).map(n=>
    `<div class="nl-item"><div>${n.type==='submit'?'📋':n.type==='absence'?'📅':'✉️'}</div>
    <div style="flex:1;"><div style="font-weight:500;font-size:13px;">${esc(n.title)}</div>
    <div class="tm">${esc(n.message)}</div>
    <div style="font-size:11px;color:var(--gray-500);">${esc(n.sentAt)} · ${esc(n.senderName)}</div></div></div>`).join('');
  if(typeof renderAdminSettings === 'function') renderAdminSettings();
}
window.addNoti = function(type,title,message){
  const n=new Date();const t=n.getFullYear()+'.'+String(n.getMonth()+1).padStart(2,'0')+'.'+String(n.getDate()).padStart(2,'0')+' '+String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
  DB.notifications.push({type,title,message,sentAt:t,senderName:DB.currentUser.name});updateNotifyBadge();
}
window.updateNotifyBadge = function(){const b=document.getElementById('nav-notify-badge');if(b)b.textContent=(DB?.notifications||[]).length>0?(DB?.notifications||[]).length:'';}
window.sendNSNotify = function(id){
  const a=(DB?.assignments||[]).find(x=>x.id===id);
  const elig=(DB?.users||[]).filter(u=>u.status==='active'&&(a.group==='전체'||u.group===a.group));
  const ns=elig.filter(m=>!(a.submissions||[]).find(s=>s.userId===m.id));
  if(!ns.length)return toast('미제출자가 없습니다.','');
  addNoti('submit','[미제출 알림] '+a.title,'수신: '+ns.map(m=>m.name).join(', ')+' — 마감: '+fmt(a.deadline));
  toast(ns.length+'명에게 미제출 알림을 전송했습니다.','ok');renderNotify();
}
window.sendAbNotify = function(sid){
  const s=(DB?.attendance||[]).find(x=>x.id===sid);
  const targets=s.records.filter(r=>r.status==='지각'||r.status==='결석');
  if(!targets.length)return toast('알림 대상이 없습니다.','');
  const names=targets.map(r=>{const u=(DB?.users||[]).find(x=>x.id===r.userId);return u?u.name+'('+r.status+')':''}).filter(Boolean).join(', ');
  addNoti('absence','[출석 알림] '+s.title,'수신: '+names);
  toast(targets.length+'명에게 알림을 전송했습니다.','ok');renderNotify();
}
window.sendCustom = function(){
  const target=document.getElementById('notify-target').value;
  const message=document.getElementById('notify-msg').value.trim();
  if(!message)return toast('알림 내용을 입력해주세요.','err');
  const tl=target==='all'?'전체 학회원':target;
  // 수신자 수 계산
  let recvCount=0;
  if(target==='all')recvCount=(DB?.users||[]).filter(u=>u.status==='active').length;
  else if(target==='포토샵 스터디 참가자')recvCount=(DB?.users||[]).filter(u=>u.status==='active'&&u.studies&&u.studies.includes('포토샵 스터디')).length;
  else if(target==='일러스트 스터디 참가자')recvCount=(DB?.users||[]).filter(u=>u.status==='active'&&u.studies&&u.studies.includes('일러스트 스터디')).length;
  else recvCount=(DB?.users||[]).filter(u=>u.status==='active'&&u.group===target).length;
  addNoti('custom','[공지] '+tl,message.length>60?message.slice(0,60)+'...':message);
  document.getElementById('notify-msg').value='';
  toast(tl+' '+recvCount+'명에게 알림을 전송했습니다.','ok');renderNotiLog();
}
window.clearNotify = function(){if(!confirm('발송 내역을 모두 삭제하시겠습니까?'))return;DB.notifications=[];updateNotifyBadge();renderNotiLog();}
window.previewKakao = function(){
  const message=document.getElementById('notify-msg').value.trim()||'(내용을 입력해주세요)';
  const target=document.getElementById('notify-target').value;
  const tl=target==='all'?'전체 학회원':target;
  const now=new Date();const ts='오후 '+(now.getHours()>12?now.getHours()-12:now.getHours())+':'+String(now.getMinutes()).padStart(2,'0');
  openModal(`<div class="modal" style="max-width:360px;"><div class="m-hd"><div class="m-title">💬 카카오톡 미리보기</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="kk">
      <div style="font-size:13px;font-weight:700;color:#3c1e1e;">DIF 공식 채널</div>
      <div class="kk-b">
        <div style="font-size:11px;color:#888;margin-bottom:3px;">📢 [DIF] ${esc(tl)} 알림</div>
        <div style="font-size:13px;line-height:1.6;">${esc(message)}</div>
        <div style="font-size:10px;color:#999;margin-top:6px;text-align:right;">${ts}</div>
      </div>
    </div>
    <div class="al al-w" style="margin-top:.85rem;"><span>⚠️</span><div>실제 카카오톡 전송은 카카오 비즈니스 API 연동이 필요합니다.</div></div>
  </div>
  <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button></div>
  </div>`);
}

// ─── ADMIN ────────────────────────────────────────────────
window.renderAdmin = function(){
  if (!DB || !DB.currentUser) {
    const app = document.getElementById('app');
    if (app) {
       const cnt = document.querySelector('.content');
       if(cnt) cnt.innerHTML = '<div class="spinner" style="text-align:center; padding: 3rem; font-size:1.2rem;">데이터 로딩 중...</div>';
    }
    return;
  }
  const pending=(DB?.users||[]).filter(u=>u.status==='pending');
  document.getElementById('admin-pending').innerHTML=!pending.length?'<div class="empty" style="padding:1rem 0;"><p>승인 대기 없음</p></div>':
    pending.map(m=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--gray-100);">
      <div><div style="font-size:13px;font-weight:500;">${esc(m.name)}</div><div class="tm">${esc(m.dept)}</div></div>
      <div style="display:flex;gap:4px;"><button class="btn btn-p btn-sm" onclick="approveMember('${m.id}')">승인</button><button class="btn btn-d btn-sm" onclick="rejectMember('${m.id}')">거절</button></div>
    </div>`).join('');
  const active=(DB?.users||[]).filter(u=>u.status==='active');
  document.getElementById('admin-ranks').innerHTML=active.map(m=>
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid var(--gray-100);">
      <span style="font-size:13px;">${esc(m.name)}</span><span class="rank ${rCls(m.rank)}">${m.rank}</span>${isAdmin(DB.currentUser) ? `<button class="btn btn-o btn-sm" onclick="openMemberModal('${m.id}')" style="margin-left:8px;">편집</button>` : ''}
    </div>`).join('');
  const now=new Date();now.setHours(0,0,0,0);
  const asgns=(DB?.assignments||[]).filter(a=>new Date(a.deadline)>=now);
  document.getElementById('admin-ns').innerHTML=!asgns.length?'<div class="empty" style="padding:1rem 0;"><p>진행 중인 과제 없음</p></div>':
    asgns.map(a=>{
      const elig=(DB?.users||[]).filter(u=>u.status==='active'&&(a.group==='전체'||u.group===a.group));
      const ns=elig.filter(m=>!(a.submissions||[]).find(s=>s.userId===m.id));
      return`<div style="padding:.65rem 0;border-bottom:1px solid var(--gray-100);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
          <div style="font-size:13px;font-weight:600;">${esc(a.title)}</div>
          <span class="badge ${ns.length===0?'b-gr':'b-re'}">${ns.length===0?'모두 제출':ns.length+'명 미제출'}</span>
        </div>
        ${ns.length>0?`<div style="display:flex;flex-wrap:wrap;gap:3px;">${ns.map(m=>`<span class="badge b-re" style="font-size:11px;">${esc(m.name)}</span>`).join('')}</div>`:''}
      </div>`;}).join('');
}
window.approveMember = function(id){const m=(DB?.users||[]).find(u=>u.id===id);m.status='active';toast(m.name+' 승인 완료.','ok');renderAdmin();}
window.rejectMember = function(id){if(!confirm('거절하시겠습니까?'))return;DB.users.splice((DB?.users||[]).findIndex(u=>u.id===id),1);toast('거절되었습니다.','');renderAdmin();}

// ─── CSV ──────────────────────────────────────────────────
window.exportAttCSV = function(){
  const active=(DB?.users||[]).filter(u=>u.status==='active');
  const sessions=DB.attendance;
  const h=['이름','학번','그룹','직급',...sessions.map(s=>s.title+'('+fmt(s.date)+')'),'출석','지각','사유','결석','출석률(%)'];
  const rows=active.map(m=>{
    let att=0,late=0,ex=0,abs=0;
    const sts=sessions.map(s=>{const r=s.records.find(x=>x.userId===m.id);const st=r?r.status:(s.records.length>0?'결석':'—');
      if(st==='출석')att++;else if(st==='지각')late++;else if(st==='사유')ex++;else if(st==='결석')abs++;return st;});
    const total=sessions.filter(s=>s.records.length>0).length;
    return[m.name,m.studentId,m.group,m.rank,...sts,att,late,ex,abs,total>0?Math.round(att/total*100):0];
  });
  dlCSV([h,...rows],'DIF_출석명부.csv');toast('출석 명부 CSV가 다운로드됩니다.','ok');
}
window.dlCSV = function(rows,filename){
  const BOM='\uFEFF';
  const csv=BOM+rows.map(row=>row.map(c=>{const s=String(c==null?'':c);return(s.includes(',')||s.includes('"')||s.includes('\n'))?'"'+s.replace(/"/g,'""')+'"':s;}).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// ─── BADGES ───────────────────────────────────────────────
window.updateBadges = function(){
  if(!DB.currentUser)return;const u=DB.currentUser;
  const today=new Date().toISOString().split('T')[0];
  const tA=(DB?.attendance||[]).find(a=>a.date===today);
  const myRec=tA?(tA?.records||[]).find(r=>r.userId===u.id):null;
  document.getElementById('nav-att-badge').textContent=(!myRec&&DB.todayCode)?'!':'';
  const now=new Date();now.setHours(0,0,0,0);
  const myP=(DB?.assignments||[]).filter(a=>new Date(a.deadline)>=now&&!(a.submissions||[]).find(s=>s.userId===u.id)&&(a.group==='전체'||a.group===u.group)).length;
  document.getElementById('nav-asg-badge').textContent=myP>0?myP:'';
}
setInterval(updateBadges,5000);

window.updateNotifyBadge = function() {
  const u = DB.currentUser; if (!u) return;
  const unreadExists = (DB.notifications || []).some(n => n.userId === u.id && !n.read);
  const badge = document.getElementById('top-noti-badge');
  if (badge) badge.style.display = unreadExists ? 'block' : 'none';
};

window.openMyNotiModal = function() {
  const u = DB.currentUser; if (!u) return;
  const myNotis = (DB.notifications || []).filter(n => n.userId === u.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const html = `
    <div class="modal-bg" onclick="closeModal()">
      <div class="modal fc" style="max-width: 450px;" onclick="event.stopPropagation()">
        <h3>내 알림</h3>
        <div class="log-list mt1" style="max-height: 60vh; overflow-y: auto;">
          ${myNotis.length > 0 ? myNotis.map(n => `
            <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200); ${!n.read ? 'background-color: #f0f7ff;' : ''}">
              <div style="font-size: 13px; margin-bottom: 4px;">${esc(n.message)}</div>
              <div class="tm" style="font-size: 11px;">${new Date(n.createdAt).toLocaleString()}</div>
            </div>
          `).join('') : '<div class="tm" style="text-align: center; padding: 2rem;">도착한 알림이 없습니다.</div>'}
        </div>
        <button class="btn btn-o mt1" style="width: 100%;" onclick="closeModal()">닫기</button>
      </div>
    </div>`;
  document.getElementById('modal-root').innerHTML = html;
  myNotis.forEach(n => n.read = true);
  updateNotifyBadge();
};

window.renderAdminGroups = function() {
  const container = document.getElementById('admin-groups');
  if (!container) return;
  container.innerHTML = (DB?.groups || []).map(g => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border-bottom:1px solid #eee;">
      <span>${esc(g)}</span>
      <div>
        <button class="btn btn-o btn-sm" onclick="editGroup('${esc(g)}')">수정</button>
        <button class="btn btn-o btn-sm" style="color:var(--red); border-color:var(--red);" onclick="deleteGroup('${esc(g)}')">삭제</button>
      </div>
    </div>`).join('');
};

window.addGroup = function() {
  const inp = document.getElementById('new-group-inp');
  const val = inp ? inp.value.trim() : '';
  if (!val) return toast('추가할 조/그룹 이름을 입력해주세요.', 'err');
  if (!DB.groups) DB.groups = [];
  if (DB.groups.includes(val)) return toast('이미 존재하는 그룹명입니다.', 'err');
  DB.groups.push(val);
  toast('새 그룹이 추가되었습니다.', 'ok');
  if (inp) inp.value = '';
  if(typeof renderAdminGroups === 'function') renderAdminGroups();
};

window.editGroup = function(oldName) {
  const newName = prompt(`'${oldName}'의 새로운 그룹명을 입력하세요:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  const trimmedName = newName.trim();
  if ((DB?.groups || []).includes(trimmedName)) return toast('이미 존재하는 그룹명입니다.', 'err');
  const idx = DB.groups.indexOf(oldName);
  if (idx !== -1) DB.groups[idx] = trimmedName;
  (DB?.users || []).forEach(u => { if (u.group === oldName) u.group = trimmedName; });
  toast(`'${oldName}'이(가) '${trimmedName}'(으)로 일괄 변경되었습니다.`, 'ok');
  if(typeof renderAdminGroups === 'function') renderAdminGroups();
  if (document.getElementById('page-members')?.classList.contains('active')) {
    if (typeof renderMembers === 'function') renderMembers();
  }
};
