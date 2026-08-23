window.renderDashboard = function() {
  const u = DB.currentUser;
  if (!u) return;

  const d = new Date().toISOString().split('T')[0];
  const tA = (DB?.attendance||[]).find(a => a.date === d);
  let attMsg = '출석 정보 없음';
  let attR = '—';
  let attC = '';
  if (tA) {
    const r = tA.records.find(x => String(x.userId) === String(u.id));
    if (r) {
      attMsg = '인증 완료';
      attR = r.status;
      attC = r.status === '출석' ? 'gr' : (r.status === '결석' ? 're' : (r.status === '지각' ? 'ye' : 'bl'));
    } else {
      attMsg = '인증 전';
      attR = '진행중';
    }
  }
  
  // 1. s-total
  const tEl = document.getElementById('s-total');
  if(tEl) tEl.textContent = (DB.users||[]).filter(x=>x.status==='active').length;
  const tSub = document.getElementById('s-sem-sub');
  if(tSub) tSub.textContent = DB.currentSem;

  // 2. s-att
  const aEl = document.getElementById('s-att');
  if(aEl) {
    aEl.textContent = attR;
    aEl.className = 'sv ' + attC;
  }
  const aSub = document.getElementById('s-att-sub');
  if(aSub) aSub.textContent = attMsg;

  // 3. s-ongoing
  const ong = document.getElementById('s-ongoing');
  if(ong) ong.textContent = (DB?.assignments||[]).filter(a => (new Date(a.deadline).setHours(23,59,59,999) >= new Date())).length;
  
  // 4. s-overdue
  const ovd = document.getElementById('s-overdue');
  if(ovd) ovd.textContent = (DB?.assignments||[]).filter(a => (new Date(a.deadline).setHours(23,59,59,999) < new Date()) && !(a.submissions||[]).find(s=>String(s.userId)===String(u.id))).length;

  // 5. dash-teams (스터디 참가 현황)
  const dt = document.getElementById('dash-teams');
  if(dt) {
    dt.innerHTML = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:.5rem;">' +
      (DB?.studies||[]).map(st => {
        const count = (DB?.users||[]).filter(x => x.status === 'active' && (x.studies||[]).includes(st)).length;
        return '<div style="background:var(--gray-50); padding:.5rem; border-radius:6px; text-align:center;">' +
          '<div style="font-size:12px; color:var(--gray-600); margin-bottom:4px;">' + esc(st) + '</div>' +
          '<div style="font-size:18px; font-weight:700;">' + count + '명</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }
  
  // 6. dash-asg
  const da = document.getElementById('dash-asg');
  if (da) {
    const now = new Date();
    const in7 = (DB?.assignments||[]).filter(a => {
        const dl = new Date(a.deadline);
        dl.setHours(23,59,59,999);
        const diff = (dl - now) / (1000*60*60*24);
        return diff >= 0 && diff <= 7;
    });
    da.innerHTML = in7.map(a => '<div class="asg-item" style="padding:.5rem;border-bottom:1px solid var(--gray-200);">' + esc(a.title) + ' <span class="badge b-ye" style="float:right;">D-' + Math.floor((new Date(a.deadline) - now)/(1000*60*60*24)) + '</span></div>').join('');
    if(!in7.length) da.innerHTML = '<div class="empty" style="padding:1rem;">마감 임박 과제가 없습니다.</div>';
  }
  
  // 7. dash-att 
  const datt = document.getElementById('dash-att');
  if (datt) {
    const myAttHistory = (DB.attendance || []).filter(a => {
      const isTarget = a.target_group === '전체' ||
        a.target_group === u.group ||
        (Array.isArray(u.studies) && u.studies.includes(a.target_group)) ||
        (Array.isArray(a.records) && a.records.some(r => String(r.uid) === String(u.id) || String(r.userId) === String(u.id)));
      return isTarget;
    }).slice(-5).reverse();
    
    datt.innerHTML = myAttHistory.map(a => {
      const r = (a.records||[]).find(x => String(x.uid)===String(u.id) || String(x.userId)===String(u.id));
      const st = r ? r.status : '미출석';
      let tmStr = '';
      if (r && r.timestamp) {
        const t = new Date(r.timestamp);
        tmStr = `<div style="font-size:11px; color:var(--gray-500); margin-top:2px;">${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')} 인증</div>`;
      }
      
      const stColor = st === '출석' ? 'green' : (st === '결석' ? 'red' : (st === '지각' ? 'yellow-dark' : (st === '사유' ? 'blue' : 'gray-500')));
      
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:.65rem; border-bottom:1px solid var(--gray-100);">
          <div>
            <div style="font-size:13px; font-weight:600; color:var(--gray-800);">${esc(a.title)}</div>
            <div style="font-size:11px; color:var(--gray-500); margin-top:3px;">${fmt(a.date)} · ${esc(a.target_group || '전체')} 대상</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px; font-weight:700; color:var(--${stColor});">${st}</div>
            ${tmStr}
          </div>
        </div>
      `;
    }).join('');
    
    if(!myAttHistory.length) datt.innerHTML = '<div class="empty" style="padding:1rem;">출석 기록이 없습니다.</div>';
  }
  
  if (typeof renderCalendar === 'function') renderCalendar();
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
};
// --- Members ---
window.renderMembers = function() {
  const tbody = document.getElementById('member-tbody');
  const u = DB.currentUser;
  let arr = DB.users;
  const f = DB.mFilter || { name: '', group: '', rank: '', status: '', study: '' };
  
  if (f.name) arr = arr.filter(x => x.name.includes(f.name));
  if (f.group) arr = arr.filter(x => x.group === f.group);
  if (f.rank) arr = arr.filter(x => x.rank === f.rank);
  if (f.status) arr = arr.filter(x => x.status === f.status);
  if (f.study) arr = arr.filter(x => (x.studies||[]).includes(f.study));
  
  const cnt = document.getElementById('member-cnt');
  if(cnt) cnt.textContent = arr.length + '명';
  
  if(!tbody) return;
  if(!arr.length) { tbody.innerHTML = '<tr><td colspan="9" class="empty">조건에 맞는 학회원이 없습니다.</td></tr>'; return; }
  
  tbody.innerHTML = arr.map(m => `<tr>
    <td><div class="av" style="background:var(--gray-100); display:flex; align-items:center; justify-content:center; border-radius:50%; width:32px; height:32px;"><i data-lucide="circle-user" class="w-5 h-5 text-gray-500"></i></div></td>
    <td><strong>${esc(m.name)}</strong></td>
    <td style="font-family:monospace;font-size:12px;">${esc(m.studentId)}</td>
    <td>${esc(m.dept)}</td>
    <td><span class="badge b-bl" style="font-size:11px;">${esc(m.group||'—')}</span></td>
    <td><div style="display:flex;gap:3px;flex-wrap:wrap;">${studyBadges(m.studies)}</div></td>
    <td><span class="rank ${typeof rCls === 'function' ? rCls(m.rank) : 'r-member'}">${esc(m.rank)}</span></td>
    <td><span class="badge ${m.status==='active'?'b-gr':'b-re'}">${m.status==='active'?'활동 중':'비활성'}</span></td>
    <td style="white-space:nowrap;">
      <button class="btn btn-o btn-sm" onclick="viewMemberProfile('${m.id}')">프로필</button>
      ${canMng(u) ? `<button class="btn btn-o btn-sm" onclick="openMemberModal('${m.id}')" style="margin-left:3px;">편집</button>
      <button class="btn btn-d btn-sm" onclick="delMember('${m.id}')" style="margin-left:3px;">삭제</button>` : ''}
    </td>
  </tr>`).join('');
};

window.filterM = function(key, val) {
  if (!DB.mFilter) DB.mFilter = {};
  DB.mFilter[key] = val;
  renderMembers();
};

window.openMemberModal = function(id) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  let m = id ? (DB.users||[]).find(x => String(x.id) === String(id)) : null;
  let isNew = !m;
  if (isNew) {
    m = { name: '', email: '', studentId: '', dept: '', group: '', rank: '학회원', status: 'active', studies: [] };
  }
  let html = `<div class="modal fc" onclick="event.stopPropagation()">
      <h3>${isNew ? '새 학회원 추가' : '학회원 정보 수정'}</h3>
      <div class="fg"><label class="fl">이름</label><input type="text" id="em-name" class="fc" value="${esc(m.name||'')}"></div>
      <div class="fg"><label class="fl">이메일</label><input type="email" id="em-email" class="fc" value="${esc(m.email||'')}"></div>
      <div class="fg"><label class="fl">학번</label><input type="text" id="em-sid" class="fc" value="${esc(m.studentId||'')}"></div>
      <div class="fg"><label class="fl">학과</label><input type="text" id="em-dept" class="fc" value="${esc(m.dept||'')}"></div>
      <div class="fg"><label class="fl">소속 조</label>
          <select id="em-group" class="fc">
              <option value="">— 미지정 —</option>
              ${(DB.groups||[]).map(g => `<option ${m.group === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
          </select>
      </div>
      <div class="fg"><label class="fl">스터디 (다중 선택)</label>
          <select id="em-study" class="fc" multiple>
              ${(DB.studies||[]).map(s => `<option ${(m.studies||[]).includes(s) ? 'selected' : ''}>${esc(s)}</option>`).join('')}
          </select>
      </div>
      <div class="fg"><label class="fl">직급</label>
          <select id="em-rank" class="fc">
              ${RANKS.map(r => `<option ${m.rank === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
      </div>
      <div class="fg"><label class="fl">상태</label>
          <select id="em-status" class="fc">
              ${['active', 'pending', 'inactive'].map(st => `<option ${m.status === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
      </div>
      <div class="fr mt1">
          <button class="btn btn-p" onclick="saveMember('${isNew ? '' : m.id}')">저장</button>
          <button class="btn btn-o" onclick="closeModal()">취소</button>
      </div>
  </div>`;
  openModal(html);
};

window.saveMember = async function(id) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const name = document.getElementById('em-name')?.value.trim();
  const group = document.getElementById('em-group')?.value.trim();
  const rank = document.getElementById('em-rank')?.value.trim();
  const status = document.getElementById('em-status')?.value.trim();
  const studentId = document.getElementById('em-sid')?.value.trim();
  const dept = document.getElementById('em-dept')?.value.trim();
  const email = document.getElementById('em-email')?.value.trim();
  
  const opts = document.getElementById('em-study')?.options;
  let studies = [];
  if(opts) {
      for(let i=0; i<opts.length; i++) {
          if(opts[i].selected) studies.push(opts[i].value);
      }
  }
  
  let u = id ? (DB.users||[]).find(x => String(x.id) === String(id)) : null;
  if (u) {
      const updates = {};
      if(name) updates.name = name;
      if(group!==undefined) updates.group = group;
      if(rank) updates.rank = rank;
      if(status) updates.status = status;
      if(studentId!==undefined) updates.studentId = studentId;
      if(dept!==undefined) updates.dept = dept;
      if(email!==undefined) updates.email = email;
      updates.studies = studies;
      
      if(window.API) {
        try { await window.API.updateUser(u.id, updates); } catch(e) { return toast('수정 오류', 'err'); }
      } else {
        Object.assign(u, updates);
      }
      toast('학회원 정보가 수정되었습니다.', 'ok');
  } else {
      if(!name) return toast('이름을 입력해주세요.', 'err');
      const newId = String(Date.now());
      const newEmail = email || `${newId}@dif.kr`;
      const newUser = { id: newId, name, email: newEmail, pw: '1234', studentId: studentId || '20260000', dept: dept || '미지정', group: group || '미지정', rank: rank || '학회원', status: status || 'active', avatar: name[0] || '학', studies };
      
      if(window.API) {
        try { await window.API.insertUser(newUser); } catch(e) { return toast('생성 오류', 'err'); }
      } else {
        DB.users.push(newUser);
      }
      toast('새 학회원이 추가되었습니다.', 'ok');
  }
  closeModal();
  renderMembers();
};

window.delMember = function(id) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(!confirm('정말 이 학회원을 비활성화/삭제 처리하시겠습니까?')) return;
  const m = (DB.users||[]).find(x => String(x.id) === String(id));
  if(m) m.status = 'inactive';
  toast('삭제(비활성화) 처리되었습니다.', 'ok');
  renderMembers();
};

window.viewMemberProfile = function(id) {
  const m = (DB.users||[]).find(x => String(x.id) === String(id));
  if(!m) return;
  const html = `<div class="modal fc" onclick="event.stopPropagation()">
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
      <div class="av" style="background:var(--gray-100); display:flex; align-items:center; justify-content:center; border-radius:50%; width:60px; height:60px;"><i data-lucide="circle-user" class="w-10 h-10 text-gray-500" style="width:40px;height:40px;color:var(--gray-500);"></i></div>
      <div>
        <h3>${esc(m.name)} <span class="badge b-gy" style="font-size:12px;">${esc(m.rank)}</span></h3>
        <div class="tm" style="font-size:14px;">${esc(m.dept)} (${esc(m.studentId)})</div>
      </div>
    </div>
    <div style="font-size:14px; margin-bottom:1rem; line-height:1.6;">
      <div>소속 조: <strong>${esc(m.group)}</strong></div>
      <div>스터디: ${studyBadges(m.studies)}</div>
      <div>이메일: ${esc(m.email)}</div>
      <div>상태: ${m.status==='active'?'<span style="color:var(--green)">활동 중</span>':'<span style="color:var(--red)">비활성/대기</span>'}</div>
    </div>
    <button class="btn btn-o mt1" style="width:100%;" onclick="closeModal()">닫기</button>
  </div>`;
  openModal(html);
};

// 출석 통계 계산 헬퍼
function getProfileAttStats(uid) {
  const sessions = (DB?.attendance || []).filter(a => (a.records || []).length > 0);
  let att = 0, late = 0, ex = 0, abs = 0;
  sessions.forEach(s => {
    const r = (s.records || []).find(x => String(x.userId) === String(uid));
    if (r) {
      if (r.status === '출석') att++;
      else if (r.status === '지각') late++;
      else if (r.status === '사유') ex++;
      else abs++;
    } else {
      abs++;
    }
  });
  const total = sessions.length;
  return { total, att, late, ex, abs, rate: total ? Math.round((att / total) * 100) : 0 };
}

// 과제 통계 계산 헬퍼
function getProfileAsgStats(uid, group) {
  const elig = (DB?.assignments || []).filter(a => a.group === '전체' || a.group === group);
  const sub = elig.filter(a => (a.submissions || []).find(s => String(s.userId) === String(uid))).length;
  const total = elig.length;
  return { total, submitted: sub, rate: total ? Math.round((sub / total) * 100) : 0 };
}

// 프로필 페이지 렌더링 함수
window.renderProfile = function() {
  const u = DB.currentUser;
  if (!u) return;

  const avEl = document.getElementById('prof-av');
  if (avEl) {
    avEl.innerHTML = `<i data-lucide="circle-user-round" class="w-16 h-16 text-gray-600" style="width:64px;height:64px;color:var(--gray-600);"></i>`;
    avEl.style.background = 'transparent';
  }
  
  const nameEl = document.getElementById('prof-name');
  if (nameEl) nameEl.textContent = u.name;

  const rankEl = document.getElementById('prof-rank');
  if (rankEl) {
    rankEl.textContent = u.rank;
    rankEl.className = 'rank ' + (typeof rCls === 'function' ? rCls(u.rank) : 'r-member');
  }

  const groupEl = document.getElementById('prof-group');
  if (groupEl) groupEl.textContent = u.group || '미지정';

  const studyEl = document.getElementById('prof-study');
  if (studyEl) studyEl.innerHTML = studyBadges(u.studies);

  const deptEl = document.getElementById('prof-dept');
  if (deptEl) deptEl.textContent = `${u.dept || '학과 미지정'} · ${u.studentId || ''}`;

  const emailEl = document.getElementById('prof-email');
  if (emailEl) emailEl.textContent = u.email;

  // 출석 통계 바인딩
  const attStats = getProfileAttStats(u.id);
  const attEl = document.getElementById('prof-att');
  if (attEl) {
    attEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:.85rem;text-align:center;">
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--green);">${attStats.att}</div><div class="tm">출석</div></div>
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:#f57c00;">${attStats.late}</div><div class="tm">지각</div></div>
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--blue);">${attStats.ex}</div><div class="tm">사유</div></div>
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--red);">${attStats.abs}</div><div class="tm">결석</div></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;"><span style="font-size:13px;font-weight:500;">출석률</span><span style="font-size:13px;font-weight:700;color:var(--blue);">${attStats.rate}%</span></div>
      <div class="prog"><div class="pb pb-bl" style="width:${attStats.rate}%"></div></div>
      <div class="tm" style="margin-top:4px;">전체 ${attStats.total}회 중 ${attStats.att}회 출석</div>
    `;
  }

  // 과제 통계 바인딩
  const asgStats = getProfileAsgStats(u.id, u.group);
  const asgEl = document.getElementById('prof-asg');
  if (asgEl) {
    asgEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.85rem;text-align:center;">
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--green);">${asgStats.submitted}</div><div class="tm">제출 완료</div></div>
        <div style="background:var(--gray-50);border-radius:var(--r-md);padding:.6rem;"><div style="font-size:20px;font-weight:700;color:var(--red);">${asgStats.total - asgStats.submitted}</div><div class="tm">미제출</div></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;"><span style="font-size:13px;font-weight:500;">제출률</span><span style="font-size:13px;font-weight:700;color:var(--green);">${asgStats.rate}%</span></div>
      <div class="prog"><div class="pb pb-gr" style="width:${asgStats.rate}%"></div></div>
      <div class="tm" style="margin-top:4px;">전체 ${asgStats.total}개 중 ${asgStats.submitted}개 제출</div>
    `;
  }
};

window.openEditProfileModal = function() {
  const u = DB.currentUser;
  const html = `<div class="modal fc" onclick="event.stopPropagation()">
    <h3>내 정보 수정</h3>
    <div class="fg"><label class="fl">이름</label><input type="text" id="ep-name" class="fc" value="${esc(u.name||'')}"></div>
    <div class="fg"><label class="fl">학과</label><input type="text" id="ep-dept" class="fc" value="${esc(u.dept||'')}"></div>
    <div class="fg"><label class="fl">아바타 글자</label><input type="text" id="ep-avatar" class="fc" maxlength="2" value="${esc(u.avatar||'')}"></div>
    <div class="fg"><label class="fl">비밀번호</label><input type="password" id="ep-pw" class="fc" placeholder="변경할 비밀번호 입력"></div>
    <div class="fr mt1">
      <button class="btn btn-p" onclick="saveProfile()">저장</button>
      <button class="btn btn-o" onclick="closeModal()">취소</button>
    </div>
  </div>`;
  openModal(html);
};

window.saveProfile = async function() {
  const nm = document.getElementById('ep-name')?.value.trim();
  const dp = document.getElementById('ep-dept')?.value.trim();
  const av = document.getElementById('ep-avatar')?.value.trim();
  const pw = document.getElementById('ep-pw')?.value.trim();
  const u = DB.currentUser;
  
  const updates = {};
  if(nm) updates.name = nm;
  if(dp) updates.dept = dp;
  if(av) updates.avatar = av;
  if(pw) updates.pw = pw;
  
  if(window.API && Object.keys(updates).length > 0) {
    try { await window.API.updateUser(u.id, updates); } catch(e) { return toast('프로필 수정 오류', 'err'); }
  } else {
    Object.assign(u, updates);
  }
  
  toast('프로필이 업데이트되었습니다.', 'ok');
  closeModal();
  renderProfile();
  
  const sName = document.getElementById('sidebar-name');
  if(sName) sName.textContent = updates.name || u.name;
  const sAv = document.getElementById('sidebar-avatar');
  if(sAv) sAv.textContent = updates.avatar || (updates.name ? updates.name.substring(0,2) : (u.avatar || u.name.substring(0,2)));
};

window.renderAdminGroups = function() {
  const gc = document.getElementById('admin-groups');
  if(!gc) return;
  gc.innerHTML = (DB?.groups||[]).map(g => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem;border-bottom:1px solid var(--gray-200);">
    <span>${esc(g)}</span>
    <div>
      <button class="btn btn-o" style="padding:.2rem .4rem;font-size:11px;" onclick="editGroup('${esc(g)}')">수정</button>
      <button class="btn btn-o" style="padding:.2rem .4rem;font-size:11px;" onclick="deleteGroup('${esc(g)}')">삭제</button>
    </div>
  </div>`).join('');
};

window.addGroup = function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const ng = document.getElementById('new-group-inp').value.trim();
  if(!ng) return toast('그룹명을 입력하세요.', 'err');
  if(DB.groups.includes(ng)) return toast('이미 존재하는 그룹입니다.', 'err');
  DB.groups.push(ng);
  document.getElementById('new-group-inp').value = '';
  toast('조/그룹이 추가되었습니다.', 'ok');
  renderAdminGroups();
};

window.editGroup = function(oldName) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const newName = prompt('새로운 조/그룹 이름을 입력하세요:', oldName);
  if(!newName || newName.trim() === '' || newName === oldName) return;
  const n = newName.trim();
  if(DB.groups.includes(n)) return toast('이미 존재하는 그룹명입니다.', 'err');
  const idx = DB.groups.indexOf(oldName);
  if(idx > -1) {
    DB.groups[idx] = n;
    (DB.users||[]).forEach(u => { if(u.group === oldName) u.group = n; });
    toast('그룹명이 변경되었습니다.', 'ok');
    renderAdminGroups();
  }
};

window.deleteGroup = function(gName) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(!confirm(`[${gName}] 조를 정말 삭제하시겠습니까? 소속된 학회원들은 '미지정'으로 변경됩니다.`)) return;
  DB.groups = DB.groups.filter(g => g !== gName);
  (DB.users||[]).forEach(u => { if(u.group === gName) u.group = '미지정'; });
  toast('삭제 완료.', 'ok');
  renderAdminGroups();
};

window.renderAdminStudies = function() {
  const sc = document.getElementById('admin-studies');
  if (!sc) return;
  sc.innerHTML = (DB?.studies || []).map(s => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:.5rem; border-bottom:1px solid var(--gray-200);">
      <span>${esc(s)}</span>
      <div>
        <button class="btn btn-o btn-sm" style="color:var(--red); border-color:var(--red); padding:.2rem .4rem; font-size:11px;" onclick="deleteStudy('${esc(s)}')">삭제</button>
      </div>
    </div>`).join('');
};

window.addStudy = function() {
  if (!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const inp = document.getElementById('new-study-inp');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return toast('스터디 이름을 입력해주세요.', 'err');
  if (!DB.studies) DB.studies = [];
  if (DB.studies.includes(val)) return toast('이미 존재하는 스터디입니다.', 'err');
  DB.studies.push(val);
  inp.value = '';
  toast('새 스터디가 추가되었습니다.', 'ok');
  renderAdminStudies();
};

window.deleteStudy = function(studyName) {
  if (!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if (!confirm(`'${studyName}' 스터디를 삭제하시겠습니까?`)) return;
  DB.studies = (DB.studies || []).filter(s => s !== studyName);
  toast('스터디가 삭제되었습니다.', 'ok');
  renderAdminStudies();
};

window.renderAdmin = function() {
  const u = DB.currentUser;
  if (!isAdmin(u)) return;

  // 1. 승인 대기자 렌더링
  const pd = document.getElementById('admin-pending');
  if (pd) {
    const pUsers = (DB.users || []).filter(x => x.status === 'pending');
    if (!pUsers.length) {
      pd.innerHTML = '<div class="empty" style="padding:1rem;">가입 대기 중인 인원이 없습니다.</div>';
    } else {
      pd.innerHTML = pUsers.map(user => `
        <div class="card" style="margin-bottom:.5rem; padding:.75rem;">
          <div style="font-weight:600;">${esc(user.name)} (${esc(user.dept)} ${esc(user.studentId)})</div>
          <div class="tm" style="font-size:12px;">${esc(user.email)}</div>
          <div class="fr mt1" style="gap:5px;">
            <button class="btn btn-p btn-sm" onclick="approveMember('${user.id}')">가입 승인</button>
            <button class="btn btn-o btn-sm" onclick="rejectMember('${user.id}')">거절</button>
          </div>
        </div>`).join('');
    }
  }

  // 2. 직급 현황 렌더링
  const ar = document.getElementById('admin-ranks');
  if (ar) {
    const active = (DB.users || []).filter(x => x.status === 'active');
    ar.innerHTML = active.map(m => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:.45rem 0; border-bottom:1px solid var(--gray-100);">
        <span style="font-size:13px;">${esc(m.name)}</span>
        <span class="rank ${typeof rCls === 'function' ? rCls(m.rank) : 'r-member'}">${esc(m.rank)}</span>
      </div>`).join('');
  }

  // 3. 미제출자 명단 렌더링
  const ans = document.getElementById('admin-ns');
  if (ans) {
    const now = new Date();
    const activeAsg = (DB.assignments || []).filter(a => new Date(a.deadline).setHours(23,59,59,999) >= now);
    if (!activeAsg.length) {
      ans.innerHTML = '<div class="empty" style="padding:1rem;">진행 중인 과제가 없습니다.</div>';
    } else {
      ans.innerHTML = activeAsg.map(a => {
        const elig = (DB.users || []).filter(m => m.status === 'active' && (a.group === '전체' || m.group === a.group));
        const ns = elig.filter(m => !(a.submissions || []).find(s => String(s.userId) === String(m.id)));
        return `
          <div style="padding:.65rem 0; border-bottom:1px solid var(--gray-100);">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <div style="font-size:13px; font-weight:600;">${esc(a.title)}</div>
              <span class="badge ${ns.length === 0 ? 'b-gr' : 'b-re'}">${ns.length === 0 ? '모두 제출' : ns.length + '명 미제출'}</span>
            </div>
            ${ns.length > 0 ? `<div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:4px;">${ns.map(m => `<span class="badge b-re" style="font-size:11px;">${esc(m.name)}</span>`).join('')}</div>` : ''}
          </div>`;
      }).join('');
    }
  }

  // 4. 프로젝트 조 및 스터디 목록 렌더링
  renderAdminGroups();
  renderAdminStudies();
};

window.approveMember = async function(id) {
  if(!isAdmin(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(window.API) {
    try { await window.API.updateUser(id, { status: 'active' }); } catch(e) { return toast('승인 오류', 'err'); }
  } else {
    const u = (DB.users||[]).find(x => String(x.id) === String(id));
    if(u) u.status = 'active';
  }
  toast('가입이 승인되었습니다.', 'ok');
  renderAdmin();
};

window.rejectMember = async function(id) {
  if(!isAdmin(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(window.API && window.supabaseClient) {
    try { await window.supabaseClient.from('users').delete().eq('id', id); } catch(e) { return toast('삭제 오류', 'err'); }
  } else {
    DB.users = (DB.users||[]).filter(x => String(x.id) !== String(id));
  }
  toast('거절/삭제되었습니다.', 'ok');
  renderAdmin();
};

// --- Logs ---
window.renderLogs = function() {
  const el = document.getElementById('log-content');
  if(!(DB?.teamLogs||[]).length) {
    el.innerHTML = '<div class="empty">작성된 팀 로그가 없습니다.</div>';
    return;
  }
  el.innerHTML = (DB.teamLogs.slice().reverse()).map(lg => {
    return `<div class="card asg-item" style="margin-bottom:1rem; cursor:pointer;" onclick="openLogModal('${lg.id}')">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;">
        <div>
          <span class="badge ${LC_CLS[lg.cat]||'b-gy'}">${esc(lg.cat)}</span>
          <strong style="margin-left:5px;">${esc(lg.title)}</strong>
        </div>
        <div class="tm" style="font-size:12px;">${fmt(lg.date)}</div>
      </div>
      <div style="font-size:13px; color:var(--gray-600); margin-bottom:.5rem; max-height:40px; overflow:hidden;">${esc(lg.content)}</div>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--gray-500);">
        <span>대상: ${esc(lg.group)}</span>
        <span>작성자: ${esc(lg.author)}</span>
      </div>
      ${canMng(DB.currentUser) || lg.author === DB.currentUser.name ? `<button class="btn btn-o" style="padding:.2rem .4rem; font-size:11px; float:right; margin-top:-20px;" onclick="event.stopPropagation(); delLog('${lg.id}')">삭제</button>` : ''}
    </div>`;
  }).join('');
};

window.openLogModal = function(id) {
  const lg = (DB?.teamLogs||[]).find(x => String(x.id) === String(id));
  let isNew = !lg;
  let html = '';
  if (isNew) {
    html = `<div class="modal fc" onclick="event.stopPropagation()">
      <h3>새 팀 로그 작성</h3>
      <div class="fg"><label class="fl">분류</label><select id="nl-cat" class="fc">
        ${LOG_CATS.map(c=>`<option>${esc(c)}</option>`).join('')}
      </select></div>
      <div class="fg"><label class="fl">대상 그룹 (관련 조/스터디)</label><select id="nl-group" class="fc">
        <option>전체</option>
        ${(DB?.groups||[]).map(g=>`<option>${esc(g)}</option>`).join('')}
        <optgroup label="스터디">
          ${(DB?.studies||[]).map(s=>`<option>${esc(s)}</option>`).join('')}
        </optgroup>
      </select></div>
      <div class="fg"><label class="fl">제목</label><input type="text" id="nl-title" class="fc"></div>
      <div class="fg"><label class="fl">내용</label><textarea id="nl-content" class="fc" rows="5"></textarea></div>
      <div class="fr mt1"><button class="btn btn-p" onclick="saveLog()">저장</button><button class="btn btn-o" onclick="closeModal()">취소</button></div>
    </div>`;
  } else {
    html = `<div class="modal fc" onclick="event.stopPropagation()">
      <h3>${esc(lg.title)}</h3>
      <div style="margin-bottom:1rem;">
        <span class="badge ${LC_CLS[lg.cat]||'b-gy'}">${esc(lg.cat)}</span> 
        <span class="tm" style="font-size:12px; margin-left:10px;">${fmt(lg.date)} | 작성자: ${esc(lg.author)} | 대상: ${esc(lg.group)}</span>
      </div>
      <div style="background:var(--gray-50); padding:1rem; border-radius:8px; white-space:pre-wrap; font-size:14px; line-height:1.6;">${esc(lg.content)}</div>
      <button class="btn btn-o mt1" style="width:100%;" onclick="closeModal()">닫기</button>
    </div>`;
  }
  openModal(html);
};

window.saveLog = async function() {
  const t = document.getElementById('nl-title').value.trim();
  const c = document.getElementById('nl-content').value.trim();
  const cat = document.getElementById('nl-cat').value;
  const g = document.getElementById('nl-group').value;
  if(!t || !c) return toast('제목과 내용을 입력하세요.', 'err');
  
  const logData = { title: t, content: c, cat, group: g, author: DB.currentUser.name, date: new Date().toISOString().split('T')[0] };
  
  if (window.API) {
    try { await window.API.addTeamLog(logData); } catch(e) { return toast('저장 오류', 'err'); }
  } else {
    DB.teamLogs.push({ id: Date.now(), ...logData });
  }
  toast('팀 로그가 저장되었습니다.', 'ok');
  closeModal();
  renderLogs();
};

window.delLog = async function(id) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(!confirm('이 로그를 삭제하시겠습니까?')) return;
  
  if(window.API && window.supabaseClient) {
    try { await window.supabaseClient.from('team_logs').delete().eq('id', id); } catch(e) { return toast('삭제 오류', 'err'); }
  } else {
    DB.teamLogs = (DB.teamLogs||[]).filter(x => String(x.id) !== String(id));
  }
  toast('로그가 삭제되었습니다.', 'ok');
  renderLogs();
};

window.exportLogCSV = function() {
  const h = ['분류', '제목', '내용', '대상그룹', '작성자', '작성일'];
  const rows = (DB?.teamLogs||[]).map(l => [l.cat, l.title, l.content, l.group, l.author, l.date]);
  dlCSV(h, rows, 'teamlogs.csv');
};

// --- Notifications ---
window.renderNotify = function() {
  const el = document.getElementById('notify-log');
  if(!(DB?.notifications||[]).length) { el.innerHTML = '<div class="empty">발송 내역이 없습니다.</div>'; return; }
  el.innerHTML = DB.notifications.slice().reverse().slice(0, 20).map(n => 
    `<div style="padding:.5rem;border-bottom:1px solid var(--gray-200);">
       <div style="font-weight:600;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
         <span>[${esc(n.type)}] ${esc(n.title)}</span>
         <button class="btn btn-o" style="padding:2px 6px; font-size:10px;" onclick="deleteNotification('${n.id}')">삭제</button>
       </div>
       <div style="font-size:12px;color:var(--gray-600);">${esc(n.message)}</div>
       <div style="font-size:10px;color:var(--gray-500);text-align:right;">${esc(n.sentAt)} (${esc(n.senderName)})</div>
     </div>`
  ).join('');
};

window.openMyNotiModal = function() {
  const u = DB.currentUser; if (!u) return;
  const myNotis = (DB.notifications || []).filter(n => String(n.userId) === String(u.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const html = `
    <div class="modal fc" style="max-width: 450px;" onclick="event.stopPropagation()">
        <h3>내 알림</h3>
        <div class="log-list mt1" style="max-height: 60vh; overflow-y: auto;">
          ${myNotis.length > 0 ? myNotis.map(n => `
            <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200); background: ${n.read ? 'transparent' : 'rgba(251, 191, 36, 0.1)'};">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${esc(n.title)}</div>
              <div style="font-size: 13px; color: var(--gray-600); margin-bottom: 6px;">${esc(n.message)}</div>
              <div style="font-size: 11px; color: var(--gray-500);">${new Date(n.createdAt).toLocaleString()}</div>
            </div>
          `).join('') : '<div class="tm" style="text-align: center; padding: 2rem;">도착한 알림이 없습니다.</div>'}
        </div>
        <button class="btn btn-o mt1" style="width: 100%;" onclick="closeModal()">닫기</button>
      </div>`;
  openModal(html);
  myNotis.forEach(n => n.read = true);
  updateNotifyBadge();
};

window.sendNSNotify = async function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  
  const users = (DB.users||[]).filter(x => x.status === 'active');
  const payload = users.map(u => ({
    user_id: u.id, type: '미제출 촉구', title: '과제 제출 확인 요청', 
    message: '아직 제출하지 않은 과제가 있습니다. 기한 내 제출바랍니다.', 
    sender_name: DB.currentUser.name
  }));
  
  if(window.API && window.supabaseClient) {
    try { await window.supabaseClient.from('notifications').insert(payload); } catch(e) { return toast('발송 오류', 'err'); }
  } else {
    payload.forEach(p => DB.notifications.push({...p, id: Date.now()+Math.random(), userId: p.user_id, sentAt: new Date().toLocaleString(), read: false}));
  }
  
  toast('미제출자 시스템 알림이 일괄 발송되었습니다.', 'ok');
  updateNotifyBadge(); renderNotify();
};

window.sendAbNotify = async function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  
  const users = (DB.users||[]).filter(x => x.status === 'active');
  const payload = users.map(u => ({
    user_id: u.id, type: '결석자 경고', title: '출석 상태 확인 요청', 
    message: '오늘 세션에 결석 처리되었습니다. 사유서 제출바랍니다.', 
    sender_name: DB.currentUser.name
  }));
  
  if(window.API && window.supabaseClient) {
    try { await window.supabaseClient.from('notifications').insert(payload); } catch(e) { return toast('발송 오류', 'err'); }
  } else {
    payload.forEach(p => DB.notifications.push({...p, id: Date.now()+Math.random(), userId: p.user_id, sentAt: new Date().toLocaleString(), read: false}));
  }
  
  toast('결석자 시스템 알림이 일괄 발송되었습니다.', 'ok');
  updateNotifyBadge(); renderNotify();
};

window.sendCustom = async function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const msg = document.getElementById('notify-msg').value.trim();
  const tgt = document.getElementById('notify-target').value;
  if(!msg) return toast('메시지를 입력하세요.', 'err');
  document.getElementById('notify-msg').value = '';
  
  let users = (DB.users||[]).filter(x => x.status === 'active');
  if(tgt !== 'all') {
    users = users.filter(x => x.group === tgt || (x.studies||[]).includes(tgt));
  }
  
  const payload = users.map(u => ({
    user_id: u.id, type: '일반 공지', title: '관리자 공지', 
    message: msg, sender_name: DB.currentUser.name
  }));
  
  if(window.API && window.supabaseClient) {
    try { await window.supabaseClient.from('notifications').insert(payload); } catch(e) { return toast('발송 오류', 'err'); }
  } else {
    payload.forEach(p => DB.notifications.push({...p, id: Date.now()+Math.random(), userId: p.user_id, sentAt: new Date().toLocaleString(), read: false}));
  }
  
  toast(`${tgt === 'all' ? '전체' : tgt} 학회원에게 알림이 발송되었습니다.`, 'ok');
  updateNotifyBadge(); renderNotify();
};

window.clearAllNotifications = window.clearNotify = async function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if (!confirm('전체 알림 발송 내역을 모두 삭제하시겠습니까? (복구 불가)')) return;

  try {
    if(window.API && window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('notifications')
        .delete()
        .neq('id', 0); // 모든 행 삭제

      if (error) throw error;
    }

    DB.notifications = [];
    toast('모든 알림 내역이 삭제되었습니다.', 'ok');

    if (window.API && typeof window.API.fetchInitialData === 'function') await window.API.fetchInitialData();
    if (typeof updateNotifyBadge === 'function') updateNotifyBadge();
    if (typeof renderNotify === 'function') renderNotify();
  } catch (err) {
    console.error('clearAllNotifications error:', err);
    toast('알림 일괄 삭제 실패: ' + err.message, 'err');
  }
};

window.deleteNotification = async function(notiId) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if (!confirm('이 알림 내역을 삭제하시겠습니까?')) return;

  try {
    if(window.API && window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('notifications')
        .delete()
        .eq('id', notiId);

      if (error) throw error;
    }

    if (Array.isArray(DB.notifications)) {
      DB.notifications = DB.notifications.filter(n => String(n.id) !== String(notiId));
    }
    toast('알림이 삭제되었습니다.', 'ok');

    if (window.API && typeof window.API.fetchInitialData === 'function') await window.API.fetchInitialData();
    if (typeof updateNotifyBadge === 'function') updateNotifyBadge();
    if (typeof renderNotify === 'function') renderNotify();
  } catch (err) {
    console.error('deleteNotification error:', err);
    toast('알림 삭제 실패: ' + err.message, 'err');
  }
};

window.updateNotifyBadge = function() {
  const u = DB.currentUser;
  const b = document.getElementById('nav-notify-badge');
  const tb = document.getElementById('top-noti-badge');
  if (!u) return;
  
  if (b) b.textContent = (DB?.notifications||[]).length > 0 ? (DB?.notifications||[]).length : '';
  
  if (tb) {
    const unread = (DB.notifications || []).filter(n => String(n.userId) === String(u.id) && !n.read).length;
    if (unread > 0) {
      tb.style.display = 'inline-block';
      tb.textContent = unread;
    } else {
      tb.style.display = 'none';
    }
  }
};

// --- Files (Dummy UI only) ---
window.renderFiles = function() {
  document.getElementById('file-content').innerHTML = '<div class="empty">파일 스토리지 기능은 이 데모에서 비활성화되어 있습니다.</div>';
};
window.openStorageConfigModal = function() {};
window.saveStorageConfig = function() {};
window.openUploadModal = function() {};
window.validatePDF = function() {};
window.doUpload = function() {};
window.downloadFile = function() {};
window.delFile = function() {};
window.exportFileCSV = function() {};

// ─── CALENDAR FUNCTIONS ───────────────────────────────────
window.calMove = function(dir) {
  DB.calM += dir;
  if (DB.calM > 11) { DB.calM = 0; DB.calY++; }
  if (DB.calM < 0) { DB.calM = 11; DB.calY--; }
  renderCalendar();
};

window.renderCalendar = function() {
  const u = DB.currentUser;
  const canEdit = canMng(u);
  
  const hint = document.getElementById('cal-hint');
  if (hint) hint.style.display = canEdit ? 'inline-block' : 'none';

  const y = DB.calY, m = DB.calM;
  const calTitle = document.getElementById('cal-title');
  if (calTitle) calTitle.textContent = `${y}년 ${m + 1}월`;

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const calHd = document.getElementById('cal-hd');
  if (calHd) {
    calHd.innerHTML = days.map((d, i) => `<div class="cal-dh ${i === 0 ? 'cal-sun' : i === 6 ? 'cal-sat' : ''}">${d}</div>`).join('');
  }

  const first = new Date(y, m, 1).getDay();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  let total = first + lastDay;
  if (total % 7) total += 7 - (total % 7);

  let cells = '';
  for (let i = 0; i < total; i++) {
    let day, isOther = false, dStr;
    if (i < first) {
      day = new Date(y, m, 0).getDate() - first + i + 1;
      isOther = true;
      const pm = m === 0 ? 12 : m;
      const py = m === 0 ? y - 1 : y;
      dStr = `${py}-${String(pm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (i >= first + lastDay) {
      day = i - first - lastDay + 1;
      isOther = true;
      const nm = m === 11 ? 1 : m + 2;
      const ny = m === 11 ? y + 1 : y;
      dStr = `${ny}-${String(nm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else {
      day = i - first + 1;
      dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const isToday = dStr === today;
    const dow = i % 7;
    const evs = (DB?.calEvents || []).filter(e => e.date === dStr);
    const cls = ['cal-d', isOther ? 'other' : '', isToday ? 'today' : '', dow === 0 ? 'cal-sun' : dow === 6 ? 'cal-sat' : '', canEdit && !isOther ? 'editable' : ''].filter(Boolean).join(' ');
    const click = canEdit && !isOther ? `onclick="openCalModal('${dStr}')"` : '';

    cells += `<div class="${cls}" ${click}>
      <div class="cal-dn">${day}</div>
      ${evs.map(e => `<div class="cal-ev ce-${e.type}" title="${esc(e.title)}">${esc(e.title)}</div>`).join('')}
    </div>`;
  }

  const calBody = document.getElementById('cal-body');
  if (calBody) calBody.innerHTML = cells;
};

window.openCalModal = function(dateStr) {
  const evs = (DB?.calEvents || []).filter(e => e.date === dateStr);
  openModal(`<div class="modal" onclick="event.stopPropagation()">
    <div class="m-hd"><div class="m-title" style="display:flex;align-items:center;gap:6px;"><i data-lucide="calendar" style="width:16px;height:16px;"></i> ${fmt(dateStr)} 일정 관리</div><button class="m-x" onclick="closeModal()">✕</button></div>
    <div class="m-bd">
      ${evs.length > 0 ? `<div style="margin-bottom:.85rem;"><div class="fl" style="margin-bottom:.4rem;">등록된 일정</div>
      ${evs.map(e => `<div style="display:flex;align-items:center;justify-content:space-between;padding:.38rem .6rem;background:var(--gray-50);border-radius:var(--r-sm);margin-bottom:3px;">
        <span style="font-size:13px;">${esc(e.title)}</span>
        <button class="btn btn-d btn-sm" onclick="delCalEv('${e.id}','${dateStr}')">삭제</button>
      </div>`).join('')}</div><div class="dv"></div>` : ''}
      <div class="fg"><label class="fl">일정 추가</label><input id="cal-new-title" class="fc" placeholder="일정 제목"></div>
      <div class="fg"><label class="fl">색상</label>
        <select id="cal-new-type" class="fc">
          <option value="bl">파란색 (정기모임)</option>
          <option value="ye">노란색 (스터디)</option>
          <option value="re">빨간색 (기타)</option>
          <option value="gr">초록색 (행사/성과발표)</option>
        </select>
      </div>
    </div>
    <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">닫기</button><button class="btn btn-p" onclick="addCalEv('${dateStr}')">추가</button></div>
  </div>`);
};

window.addCalEv = async function(dateStr) {
  const title = document.getElementById('cal-new-title').value.trim();
  const type = document.getElementById('cal-new-type').value;
  if (!title) return toast('일정 제목을 입력해주세요.', 'err');
  
  const evData = { date: dateStr, title, type };
  if(window.API) {
    try { await window.API.addCalEvent(evData); } catch(e) { return toast('추가 오류', 'err'); }
  } else {
    if (!DB.calEvents) DB.calEvents = [];
    DB.calEvents.push({ id: Date.now(), ...evData });
  }
  closeModal();
  renderCalendar();
  toast('일정이 추가되었습니다.', 'ok');
};

window.delCalEv = async function(id, dateStr) {
  if(window.API) {
    try { await window.API.deleteCalEvent(id); } catch(e) { return toast('삭제 오류', 'err'); }
  } else {
    DB.calEvents = (DB?.calEvents || []).filter(e => String(e.id) !== String(id));
  }
  closeModal();
  openCalModal(dateStr);
  renderCalendar();
};
