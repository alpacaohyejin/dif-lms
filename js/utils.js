// 전역 DB 안전 초기화
window.DB = window.DB || {
  currentUser: null,
  users: [],
  attendance: [],
  assignments: [],
  groups: [],
  semesters: ['2026-2', '2026-1'],
  currentSem: '2026-2',
  notifications: []
};

// 권한 판별 헬퍼
window.isAdmin = function(u) {
  if (!u) return false;
  return ['학회장', '부학회장', '운영진', '관리자', 'admin'].includes(u.rank);
};

// 아바타 배경색 헬퍼
window.avC = function(name) {
  if (!name) return '#2563eb';
  const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#4f46e5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// HTML 이스케이프 헬퍼
window.esc = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

window.toast = function(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  
  // Convert common emojis to Lucide icons
  let parsedMsg = msg
    .replace(/✅/g, '<i data-lucide="check-circle" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"></i>')
    .replace(/❌/g, '<i data-lucide="x-circle" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"></i>')
    .replace(/⚠️/g, '<i data-lucide="alert-triangle" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"></i>')
    .replace(/⏳/g, '<i data-lucide="clock" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"></i>');
    
  t.innerHTML = parsedMsg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.className = 'toast', 2800);
};

window.fmt = function(dStr) {
  if(!dStr) return '';
  const d = new Date(dStr);
  return `${d.getMonth()+1}/${d.getDate()}`;
};

window.dUntil = function(dStr) {
  const dl = new Date(dStr);
  dl.setHours(23, 59, 59, 999);
  const now = new Date();
  const diff = dl - now;
  if(diff < 0) return '마감됨';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return d > 0 ? `D-${d}` : `${h}시간 후`;
};

window.rCls = function(r) {
  return r==='출석'?'b-gr':r==='결석'?'b-re':r==='지각'?'b-ye':'b-gy';
};

window.canMng = function(u) {
  return u && (u.rank === '학회장' || u.rank === '부학회장' || u.rank === '임원진');
};

window.isAdmin = function(u) {
  return u && (u.rank === '학회장' || u.rank === '부학회장');
};

window.esc = function(s) {
  if (!s) return '';
  return String(s).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
};

window.studyBadges = function(studies) {
  if (!studies || !studies.length) return '<span class="badge b-gy" style="font-size:10px;">스터디 없음</span>';
  return studies.map(s => {
    if (s === '포토샵 기초') return '<span class="badge b-ye" style="font-size:10px; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="camera" style="width:12px;height:12px;"></i> 포토샵 기초</span>';
    if (s === '포토샵 심화+AI') return '<span class="badge b-bl" style="font-size:10px; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="bot" style="width:12px;height:12px;"></i> 포토샵 심화+AI</span>';
    if (s === '블렌더 스터디') return '<span class="badge b-gr" style="font-size:10px; display:inline-flex; align-items:center; gap:3px;"><i data-lucide="box" style="width:12px;height:12px;"></i> 블렌더 스터디</span>';
    return `<span class="badge b-gy" style="font-size:10px;">${esc(s)}</span>`;
  }).join(' ');
};

window.avC = function(n) {
  const h = Array.from(n||'').reduce((a,c)=>a+c.charCodeAt(0),0)%5;
  return ['#4ade80','#60a5fa','#f472b6','#fbbf24','#c084fc'][h];
};

window.openModal = function(html) {
  const divCount = (html.match(/<div/g) || []).length;
  const closeDivCount = (html.match(/<\/div>/g) || []).length;
  if (divCount > closeDivCount) {
    html += '</div>'.repeat(divCount - closeDivCount);
  }
  
  const ov = document.createElement('div');
  ov.className = 'm-ov';
  ov.innerHTML = html;
  ov.addEventListener('click', e => {
    if(e.target === ov) closeModal();
  });
  document.getElementById('modal-root').appendChild(ov);
};

window.closeModal = function() {
  document.getElementById('modal-root').innerHTML = '';
};

window.dlCSV = function(h, rows, fn) {
  let c = '\uFEFF' + h.join(',') + '\n';
  rows.forEach(r => {
    c += r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
  });
  const u = URL.createObjectURL(new Blob([c], {type: 'text/csv;charset=utf-8;'}));
  const l = document.createElement('a'); l.href = u; l.download = fn; l.click(); URL.revokeObjectURL(u);
};

