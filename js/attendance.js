window.renderAttendance = function() {
  if (!DB || !DB.currentUser) return;
  const u = DB.currentUser;
  const isOfficer = isAdmin(u) || canMng(u);
  const today = new Date().toISOString().split('T')[0];
  const tA = (DB?.attendance || []).find(a => a.date === today);

  // 1. 관리자 출석 코드 발급 패널
  const ap = document.getElementById('att-admin-panel');
  if (ap) {
    if (isOfficer) {
      ap.style.display = 'block';
      ap.innerHTML = `
        <div class="card" style="margin-bottom:1rem; padding:1.25rem;">
          <div class="c-hd"><div class="c-title" style="display:flex;align-items:center;gap:6px;"><i data-lucide="settings" style="width:16px;height:16px;"></i> 출석 코드 관리 (운영진)</div></div>
          <div style="display:flex;gap:7px;margin-top:.75rem;align-items:center;flex-wrap:wrap;">
            <input id="setup-title" class="fc" style="max-width:160px;" placeholder="세미나/스터디명" value="${esc(window.attSetupState?.title || '')}">
            <select id="setup-target" class="fc" style="max-width:140px;">
              <option value="전체">전체</option>
              ${(DB.groups || []).map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
              ${(DB.studies || []).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
            </select>
            <input id="att-code-inp" class="fc" style="max-width:120px;text-transform:uppercase;" placeholder="코드 입력" value="${tA ? esc(tA.code || '') : ''}">
            <button class="btn btn-p" onclick="setTodayCode()">설정</button>
          </div>
        </div>`;
    } else {
      ap.style.display = 'none';
    }
  }

  // 2. 학회원 출석체크 패널
  const mp = document.getElementById('att-member-panel');
  if (mp) {
    const myRec = tA ? (tA.records || []).find(r => String(r.uid) === String(u.id) || String(r.userId) === String(u.id)) : null;
    const isTarget = tA && (tA.target_group === '전체' || tA.target_group === u.group || (Array.isArray(u.studies) && u.studies.includes(tA.target_group)));

    if (!tA || !tA.code) {
      mp.innerHTML = `<div class="card" style="padding:1.5rem;text-align:center;color:var(--gray-500);margin-bottom:1rem;">현재 진행 중인 출석체크가 없습니다.</div>`;
    } else if (!isTarget) {
      mp.innerHTML = `<div class="card" style="padding:1.5rem;text-align:center;color:var(--gray-500);margin-bottom:1rem;">오늘은 귀하의 출석 대상 세션이 아닙니다.</div>`;
    } else if (myRec && myRec.status === '출석') {
      mp.innerHTML = `<div class="card" style="padding:1.5rem;text-align:center;color:var(--green);font-weight:bold;margin-bottom:1rem;"><i data-lucide="check-circle" style="width:20px;height:20px;vertical-align:-4px;margin-right:6px;"></i> 오늘 출석 완료되었습니다! (${myRec.time || '인증됨'})</div>`;
    } else {
      mp.innerHTML = `
        <div class="card" style="padding:1.25rem;margin-bottom:1rem;">
          <div class="c-hd"><div class="c-title">✅ 오늘의 출석체크 (${esc(tA.title)})</div></div>
          <div style="display:flex;gap:7px;margin-top:.75rem;">
            <input id="my-att-code" class="fc" style="max-width:200px;text-transform:uppercase;" placeholder="출석 코드 입력">
            <button class="btn btn-p" onclick="submitAttCode()">출석 인증</button>
          </div>
        </div>`;
    }
  }

  // 3. 출석체크 현황 리스트 (임원진 전용 권한 제어)
  const histContainer = document.getElementById('att-history');
  if (histContainer) {
    let sessions = (DB.attendance || []).slice().reverse();
    if (!isOfficer) {
      histContainer.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--gray-500);">출석 현황 리스트 열람 권한이 없습니다.</td></tr>';
      return;
    }

    if (sessions.length === 0) {
      histContainer.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;">출석 세션 기록이 없습니다.</td></tr>';
    } else {
      histContainer.innerHTML = sessions.map(a => {
        const records = Array.isArray(a.records) ? a.records : [];
        let att = 0, late = 0, abs = 0;
        records.forEach(r => {
          if (r.status === '출석') att++;
          else if (r.status === '지각') late++;
          else abs++;
        });

        return `
          <tr>
            <td><strong>${esc(a.title)}</strong></td>
            <td>${fmt(a.date)}</td>
            <td><span class="badge b-gy">${esc(a.target_group || '전체')}</span></td>
            <td><span style="color:var(--green)">출석 ${att}</span> / <span style="color:var(--yellow-dark)">지각 ${late}</span> / <span style="color:var(--red)">결석 ${abs}</span> (총 ${records.length}명)</td>
            <td>
              <button class="btn btn-o btn-sm" onclick="openAttDetailModal('${a.id}')">상세보기</button>
              <button class="btn btn-d btn-sm" style="margin-left:4px;" onclick="deleteAttendanceSession('${a.id}')">삭제</button>
            </td>
          </tr>`;
      }).join('');
    }
  }
  if (window.lucide) window.lucide.createIcons();
};

window.setTodayCode = async function() {
  const code = document.getElementById('att-code-inp')?.value.trim().toUpperCase();
  const title = document.getElementById('setup-title')?.value.trim() || '정기 세미나';
  const target = document.getElementById('setup-target')?.value || '전체';
  if (!code) return toast('출석 코드를 입력해주세요.', 'err');

  const today = new Date().toISOString().split('T')[0];
  let targetUsers = (DB.users || []).filter(u => u.status === 'active');
  if (target !== '전체') {
    targetUsers = targetUsers.filter(u => u.group === target || (Array.isArray(u.studies) && u.studies.includes(target)));
  }

  const records = targetUsers.map(u => ({ uid: u.id, name: u.name, group: u.group, status: '미출석', time: '-' }));

  try {
    const { error } = await window.supabaseClient.from('attendance').insert([{
      date: today, title, target_group: target, code, records
    }]);
    if (error) throw error;

    toast('출석 세션이 설정되었습니다.', 'ok');
    if (window.API) await window.API.fetchInitialData();
    renderAttendance();
  } catch (err) {
    toast('세션 생성 실패: ' + err.message, 'err');
  }
};

window.submitAttCode = async function() {
  const code = document.getElementById('my-att-code')?.value.trim().toUpperCase();
  if (!code) return toast('코드를 입력해주세요.', 'err');
  const today = new Date().toISOString().split('T')[0];
  const tA = (DB.attendance || []).find(a => a.date === today);

  if (!tA || tA.code !== code) return toast('출석 코드가 일치하지 않습니다.', 'err');

  const u = DB.currentUser;
  let records = Array.isArray(tA.records) ? [...tA.records] : [];
  let myIdx = records.findIndex(r => String(r.uid) === String(u.id));

  const nowTime = new Date().toTimeString().slice(0, 5);
  if (myIdx >= 0) {
    records[myIdx].status = '출석';
    records[myIdx].time = nowTime;
  } else {
    records.push({ uid: u.id, name: u.name, group: u.group, status: '출석', time: nowTime });
  }

  try {
    const { error } = await window.supabaseClient.from('attendance').update({ records }).eq('id', tA.id);
    if (error) throw error;
    toast('출석 체크가 완료되었습니다! ✅', 'ok');
    if (window.API) await window.API.fetchInitialData();
    renderAttendance();
  } catch (err) {
    toast('출석 처리 실패: ' + err.message, 'err');
  }
};

window.openAttDetailModal = function(sessionId) {
  const a = (DB.attendance || []).find(x => String(x.id) === String(sessionId));
  if (!a) return;

  const records = Array.isArray(a.records) ? a.records : [];
  const rows = records.map(r => `
    <tr>
      <td>${esc(r.name)}</td>
      <td>${esc(r.group || '—')}</td>
      <td>
        <select class="fc" style="padding:2px 6px; font-size:12px; width:auto;" onchange="updateMemberAttStatus('${a.id}', '${r.uid}', this.value)">
          <option value="출석" ${r.status==='출석'?'selected':''}>출석</option>
          <option value="지각" ${r.status==='지각'?'selected':''}>지각</option>
          <option value="결석" ${r.status==='결석'?'selected':''}>결석</option>
          <option value="공결" ${r.status==='공결'?'selected':''}>공결</option>
          <option value="미출석" ${r.status==='미출석'?'selected':''}>미출석</option>
        </select>
      </td>
      <td class="tm">${r.time || '-'}</td>
    </tr>
  `).join('');

  openModal(`
    <div class="modal fc" style="max-width:600px;" onclick="event.stopPropagation()">
      <h3>[${esc(a.title)}] 출결 상세 관리</h3>
      <div style="max-height:50vh; overflow-y:auto; margin:1rem 0;">
        <table class="tb">
          <thead><tr><th>이름</th><th>소속</th><th>상태 변경</th><th>체크시간</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="btn btn-o" style="width:100%;" onclick="closeModal()">닫기</button>
    </div>
  `);
};

window.updateMemberAttStatus = async function(sessionId, uid, newStatus) {
  const a = (DB.attendance || []).find(x => String(x.id) === String(sessionId));
  if (!a) return;

  let records = Array.isArray(a.records) ? [...a.records] : [];
  const rec = records.find(r => String(r.uid) === String(uid));
  if (rec) rec.status = newStatus;

  try {
    const { error } = await window.supabaseClient.from('attendance').update({ records }).eq('id', sessionId);
    if (error) throw error;
    toast(`상태가 '${newStatus}'(으)로 변경되었습니다.`, 'ok');
    if (window.API) await window.API.fetchInitialData();
    renderAttendance();
  } catch (err) {
    toast('상태 변경 실패: ' + err.message, 'err');
  }
};

window.deleteAttendanceSession = async function(sessionId) {
  if (!confirm('정말로 이 출석체크 기록을 완전히 삭제하시겠습니까?')) return;
  try {
    const { error } = await window.supabaseClient.from('attendance').delete().eq('id', sessionId);
    if (error) throw error;
    toast('출석 기록이 삭제되었습니다.', 'ok');
    if (window.API) await window.API.fetchInitialData();
    renderAttendance();
  } catch (err) {
    toast('삭제 실패: ' + err.message, 'err');
  }
};

window.sendAttendanceWarning = async function() {
  const users = (DB.users || []).filter(u => u.status === 'active');
  const attHistory = DB.attendance || [];
  const targets = [];

  users.forEach(u => {
    let penalty = 0;
    attHistory.forEach(att => {
      const r = (att.records || []).find(x => String(x.uid) === String(u.id));
      if (r && (r.status === '지각' || r.status === '결석' || r.status === '미출석')) penalty++;
    });
    if (penalty >= 3) targets.push({ ...u, penalty });
  });

  if (!targets.length) return toast('3회 이상 누적자가 없습니다.', 'ok');

  const names = targets.map(t => `${t.name}(${t.penalty}회)`).join(', ');
  if (!confirm(`다음 인원에게 경고 알림을 발송하시겠습니까?\n대상: ${names}`)) return;

  try {
    const payloads = targets.map(t => ({
      user_id: t.id,
      title: '⚠️ [출결 경고] 출석 기준 미달 안내',
      message: `지각/결석이 총 ${t.penalty}회 누적되었습니다. 사유서 제출 바랍니다.`,
      sender_name: '운영진'
    }));

    await window.supabaseClient.from('notifications').insert(payloads);
    toast(`${targets.length}명에게 경고 알림을 전송했습니다.`, 'ok');
  } catch (err) {
    toast('알림 발송 실패: ' + err.message, 'err');
  }
};
