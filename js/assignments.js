window.switchAsgTab = function(t, btn) {
  document.querySelectorAll('#page-assignments .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    // 버튼 인자가 넘어오지 않았을 때 텍스트 기준으로 fallback 활성화
    const buttons = document.querySelectorAll('#page-assignments .tab-btn');
    buttons.forEach(b => {
      if ((t === 'ongoing' && b.textContent.includes('진행')) ||
          (t === 'submitted' && b.textContent.includes('제출')) ||
          (t === 'overdue' && b.textContent.includes('마감')) ||
          (t === 'all' && b.textContent.includes('전체'))) {
        b.classList.add('active');
      }
    });
  }
  renderAssignments(t);
};

window.renderAssignments = function(tab = 'ongoing') {
  if(!DB || !DB.currentUser) return;
  const u = DB.currentUser;
  const now = new Date();
  const el = document.getElementById('asg-content');

  const isAdmin = u && (
    u.rank === '학회장' || 
    u.rank === '부학회장' || 
    u.rank === '운영진' || 
    u.rank === '관리자' || 
    u.rank === 'admin' ||
    u.group === '운영진'
  );

  const headerContainer = document.getElementById('asg-header-container');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="asg-header flex justify-between items-center mb-4" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h2 class="text-xl font-bold" style="margin:0; font-size:1.25rem;">과제 관리</h2>
          <p class="text-sm text-gray-500" style="margin:0; font-size:0.875rem; color:var(--gray-500); margin-top:4px;">진행 중인 과제와 제출 현황을 확인합니다.</p>
        </div>
        ${isAdmin ? `<button class="btn btn-p btn-primary" onclick="typeof openCreateAsgModal === 'function' ? openCreateAsgModal() : openNewAsgModal()">+ 과제 등록</button>` : ''}
      </div>
    `;
  }

  const allSubTab = document.getElementById('all-sub-tab');
  if (allSubTab) allSubTab.style.display = isAdmin ? 'inline-block' : 'none';
  
  if(tab === 'all' && isAdmin) { renderAllSub(el); return; }
  
  window.isPastDeadline = function(deadlineStr) {
    if (!deadlineStr) return false;
    // 시간 정보가 없는 YYYY-MM-DD 포맷인 경우 해당 일자 23:59:59까지 유효하도록 처리
    const dlDate = deadlineStr.length <= 10 ? new Date(`${deadlineStr}T23:59:59`) : new Date(deadlineStr);
    return new Date() > dlDate;
  };
  
  let asgns = (DB?.assignments||[]).filter(a => {
    const sub = (a.submissions||[]).find(s => String(s.userId) === String(u.id) || String(s.uid) === String(u.id));
    const isPast = window.isPastDeadline(a.deadline);
    if(tab === 'ongoing') return !isPast && !sub;
    if(tab === 'submitted') return !!sub;
    if(tab === 'overdue') return isPast && !sub;
    return true;
  });
  
  if(!isAdmin) asgns = asgns.filter(a => a.group === '전체' || a.group === u.group);
  
  if(!asgns.length) {
    const msgs = {ongoing:'진행 중인 과제가 없습니다', submitted:'제출 완료한 과제가 없습니다', overdue:'마감 지난 미제출 과제가 없습니다'};
    el.innerHTML = `<div class="empty">${msgs[tab]}</div>`;
    return;
  }
  
  el.innerHTML = asgns.map(a => {
    const sub = (a.submissions||[]).find(s => String(s.userId) === String(u.id) || String(s.uid) === String(u.id));
    let badge = '', bCls = '';
    const isPast = window.isPastDeadline(a.deadline);
    
    if(sub) { badge = '제출 완료'; bCls = 'b-gr'; }
    else if(isPast) { badge = '미제출 (마감)'; bCls = 'b-re'; }
    else { badge = '진행 중'; bCls = 'b-bl'; }
    
    let parsedDesc = a.desc || '';
    let formUrl = a.formUrl || a.form_url || '';
    let submitCode = a.submitCode || a.submit_code || '';
    try {
      const obj = JSON.parse(a.desc);
      if (obj.text) parsedDesc = obj.text;
      if (obj.formUrl) formUrl = obj.formUrl;
      if (obj.submitCode) submitCode = obj.submitCode;
    } catch (e) {
      // It's just plain text
    }

    return `<div class="card asg-item" style="margin-bottom:1rem; cursor:default; position:relative;">
      <div class="c-hd">
        <div class="c-title">${esc(a.title)}</div>
        <div class="c-sub">${fmt(a.date)} ~ ${fmt(a.deadline)} (${dUntil(a.deadline)}) <span class="badge ${bCls}">${badge}</span></div>
      </div>
      <div style="font-size:14px; margin-bottom:.5rem;">${esc(parsedDesc).replace(/\n/g, '<br>')}</div>
      ${formUrl ? `<a href="${esc(formUrl)}" target="_blank" class="btn btn-o btn-sm" style="display:inline-block; margin-bottom:1rem; align-items:center;"><i data-lucide="link" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;"></i> 과제 제출 구글 폼 바로가기</a>` : ''}
      <div class="tm" style="margin-bottom:1rem;">대상: ${esc(a.group)}</div>
      
      ${sub ? `<div class="mt1" style="color:var(--green); font-weight:bold; display:flex; align-items:center;"><i data-lucide="check-circle" style="width:16px;height:16px;margin-right:4px;"></i> 제출 완료 (${fmt(sub.submittedAt || sub.date)})</div>` 
            : (!isPast ? `<div class="mt1" style="display:flex; gap:5px; align-items:center;">
                 <input type="text" id="code-${a.id}" class="fc" placeholder="제출 확인 코드 입력" style="max-width:200px; margin:0;">
                 <button class="btn btn-p" onclick="doSubmitAsg('${a.id}')">제출 완료하기</button>
               </div>` : `<div class="mt1" style="color:var(--red); font-weight:bold; display:flex; align-items:center;"><i data-lucide="x-circle" style="width:16px;height:16px;margin-right:4px;"></i> 제출 기한 마감</div>`)}
               
      ${isAdmin ? `<button class="btn btn-o" style="padding:.2rem .4rem; font-size:11px; position:absolute; bottom:1rem; right:1rem;" onclick="event.stopPropagation(); delAsg('${a.id}')">삭제</button>` : ''}
    </div>`;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
};

window.renderAllSub = function(el) {
  let html = '<div class="card" style="margin-bottom:1rem;"><div class="c-hd"><div class="c-title">전체 제출 현황 (관리자)</div></div>';
  (DB?.assignments||[]).forEach(a => {
    const st = getAsgStats(a);
    html += `<div style="padding:.5rem 0; border-bottom:1px solid var(--gray-200);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div><strong>${esc(a.title)}</strong> <span class="tm" style="font-size:12px;">${fmt(a.deadline)} 마감</span></div>
        <div style="font-size:13px;"><span style="color:var(--green)">제출 ${st.sub}</span> / <span style="color:var(--red)">미제출 ${st.unsub}</span></div>
      </div>
      <button class="btn btn-o mt1" style="font-size:12px; padding:.3rem .5rem;" onclick="viewAsgSubmissions('${a.id}')">제출 현황 보기</button>
    </div>`;
  });
  el.innerHTML = html + '</div>';
};

window.doSubmitAsg = async function(asgId) {
  const a = (DB?.assignments||[]).find(x => String(x.id) === String(asgId));
  if (!a) return;
  const input = document.getElementById(`code-${asgId}`);
  const code = input ? input.value.trim() : '';
  if (!code) return toast('확인 코드를 입력해주세요.', 'err');

  let submitCode = a.submitCode || a.submit_code || '';
  try {
    const obj = JSON.parse(a.desc);
    if (obj.submitCode) submitCode = obj.submitCode;
  } catch (e) {}

  if (submitCode && code !== submitCode) {
    return toast('제출 확인 코드가 일치하지 않습니다. 구글 폼 제출 후 안내된 코드를 확인하세요.', 'err');
  }

  const u = DB.currentUser;
  const newSub = {
    userId: u.id,
    uid: u.id,
    name: u.name,
    studentId: u.studentId || '',
    dept: u.dept || '',
    group: u.group || '',
    submittedAt: new Date().toISOString(),
    status: '제출완료'
  };

  const updatedSubmissions = [...(a.submissions||[]), newSub];

  try {
    const { error } = await window.supabaseClient
      .from('assignments')
      .update({ submissions: updatedSubmissions })
      .eq('id', asgId);
    if (error) throw error;
    toast('과제 제출이 완료되었습니다!', 'ok');
    
    if (window.API && typeof window.API.fetchInitialData === 'function') {
      await window.API.fetchInitialData();
    }
    if (typeof renderAssignments === 'function') renderAssignments();
    if (typeof renderDashboard === 'function') renderDashboard();
  } catch (err) {
    console.error('doSubmitAsg error:', err);
    toast('과제 제출 실패: ' + err.message, 'err');
  }
};

window.viewAsgSubmissions = function(id) {
  const a = (DB?.assignments||[]).find(x => String(x.id) === String(id));
  if(!a) return;
  let targetUsers = (DB.users||[]).filter(u => u.status === 'active');
  if(a.group !== '전체') targetUsers = targetUsers.filter(u => u.group === a.group);
  
  let h = `<div class="modal fc" style="max-width:700px;" onclick="event.stopPropagation()">
    <h3>[${esc(a.title)}] 제출 현황</h3>
    <div style="max-height:60vh; overflow-y:auto;" class="mt1">
    <table class="tb" style="margin:0;"><thead><tr><th>조/소속</th><th>이름</th><th>상태</th><th>제출 시각</th></tr></thead><tbody>`;
  
  targetUsers.forEach(u => {
    const s = (a.submissions||[]).find(x => String(x.userId) === String(u.id) || String(x.uid) === String(u.id));
    const submittedAt = s && (s.submittedAt || s.date) ? new Date(s.submittedAt || s.date).toLocaleString() : '—';
    h += `<tr>
      <td>${esc(u.group)}</td>
      <td>${esc(u.name)}</td>
      <td><span class="badge ${s?'b-gr':'b-re'}">${s?'제출완료':'미제출'}</span></td>
      <td class="tm">${submittedAt}</td>
    </tr>`;
  });
  
  h += `</tbody></table></div>
    <button class="btn btn-o mt1" style="width:100%;" onclick="closeModal()">닫기</button>
  </div>`;
  openModal(h);
  if (window.lucide) window.lucide.createIcons();
};

window.openNewAsgModal = function() {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  
  const groups = DB.groups || [];
  const studies = DB.studies || [];
  let groupHtml = '<option value="전체">전체 (정기 과제)</option>';
  if (groups.length > 0) {
    groupHtml += '<optgroup label="조 / 프로젝트">';
    groups.forEach(g => { groupHtml += `<option value="${esc(g)}">${esc(g)}</option>`; });
    groupHtml += '</optgroup>';
  }
  if (studies.length > 0) {
    groupHtml += '<optgroup label="스터디">';
    studies.forEach(s => { groupHtml += `<option value="${esc(s)}">${esc(s)}</option>`; });
    groupHtml += '</optgroup>';
  }

  const h = `<div class="modal fc" onclick="event.stopPropagation()">
    <h3>새 과제 등록</h3>
    <div class="fg"><label class="fl">과제명</label><input type="text" id="na-title" class="fc"></div>
    <div class="fg"><label class="fl">마감일</label><input type="date" id="na-deadline" class="fc"></div>
    <div class="fg"><label class="fl">대상 그룹</label><select id="na-group" class="fc">${groupHtml}</select></div>
    <div class="fg"><label class="fl">구글 폼 링크 (URL)</label><input type="text" id="na-url" class="fc" placeholder="https://forms.gle/..."></div>
    <div class="fg"><label class="fl">제출 확인 비밀코드</label><input type="text" id="na-code" class="fc" placeholder="예: dif_week1"></div>
    <div class="fg"><label class="fl">과제 안내문</label><textarea id="na-desc" class="fc" rows="3"></textarea></div>
    <div class="fr mt1"><button class="btn btn-p" onclick="createAsg()">등록</button><button class="btn btn-o" onclick="closeModal()">취소</button></div>
  </div>`;
  openModal(h);
};
window.openCreateAsgModal = window.openNewAsgModal;

window.createAsg = async function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');

  const titleInput = document.getElementById('asg-title') || document.getElementById('na-title');
  const deadlineInput = document.getElementById('asg-deadline') || document.getElementById('na-deadline');
  const groupSelect = document.getElementById('asg-target-group') || document.getElementById('na-group');
  const descInput = document.getElementById('asg-desc') || document.getElementById('asg-desc-text') || document.getElementById('na-desc');
  const formUrlInput = document.getElementById('asg-form-url') || document.getElementById('na-url');
  const submitCodeInput = document.getElementById('asg-submit-code') || document.getElementById('na-code');

  const title = titleInput ? titleInput.value.trim() : '';
  const deadline = deadlineInput ? deadlineInput.value.trim() : '';
  const groupName = groupSelect ? groupSelect.value : '전체';
  const descText = descInput ? descInput.value.trim() : '';
  const formUrl = formUrlInput ? formUrlInput.value.trim() : '';
  const submitCode = submitCodeInput ? submitCodeInput.value.trim() : '';

  if (!title) return toast('과제 제목을 입력해주세요.', 'err');
  if (!deadline) return toast('마감 기한을 설정해주세요.', 'err');

  const today = typeof getTodayStr === 'function' ? getTodayStr() : new Date().toISOString().slice(0, 10);

  const payload = {
    title: title,
    date: today,
    deadline: deadline,
    group_name: groupName,
    desc_text: descText,
    desc: descText,
    form_url: formUrl,
    submit_code: submitCode,
    submissions: []
  };

  try {
    const { data, error } = await window.supabaseClient
      .from('assignments')
      .insert([payload])
      .select();

    if (error) {
      console.error('Supabase createAsg error:', error);
      throw error;
    }

    toast('과제가 성공적으로 등록되었습니다!', 'ok');
    
    // 모달 닫기 및 폼 초기화
    if (typeof closeCreateAsgModal === 'function') {
      closeCreateAsgModal();
    } else if (typeof closeModal === 'function') {
      closeModal();
    } else {
      const modal = document.getElementById('create-asg-modal');
      if (modal) modal.style.display = 'none';
    }

    if (window.API && typeof window.API.fetchInitialData === 'function') {
      await window.API.fetchInitialData();
    }
    if (typeof renderAssignments === 'function') renderAssignments();
    if (typeof renderDashboard === 'function') renderDashboard();
  } catch (err) {
    console.error('createAsg exception:', err);
    toast('과제 등록 실패: ' + (err.message || '데이터베이스 오류'), 'err');
  }
};

window.delAsg = async function(id) {
  if(!canMng(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  if(!confirm('정말 이 과제를 삭제하시겠습니까?')) return;
  
  if(window.supabaseClient) {
    try {
      await window.supabaseClient.from('assignments').delete().eq('id', id);
    } catch (err) {
      return toast('과제 삭제 실패', 'err');
    }
  }
  
  toast('과제가 삭제되었습니다.', 'ok');
  if (window.API && typeof window.API.fetchInitialData === 'function') {
    await window.API.fetchInitialData();
  }
  renderAssignments('ongoing');
};

window.getAsgStats = function(a) {
  let u = (DB.users||[]).filter(x => x.status === 'active');
  if(a.group !== '전체') u = u.filter(x => x.group === a.group);
  let sub = 0;
  u.forEach(x => { if((a.submissions||[]).find(s => String(s.userId) === String(x.id) || String(s.uid) === String(x.id))) sub++; });
  return { sub, unsub: u.length - sub };
};
