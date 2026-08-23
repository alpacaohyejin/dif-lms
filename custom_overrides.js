

// override login
window.doLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;
  if (!email || !pw) return toast('이메일과 비밀번호를 입력해주세요.', 'err');

  try {
      const q = query(collection(db, "users"), where("id", "==", email));
      const qEmail = query(collection(db, "users"), where("email", "==", email));
      
      let usersSnap = await getDocs(q);
      if (usersSnap.empty) usersSnap = await getDocs(qEmail);

      if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          const userData = userDoc.data();
          if (userData.pw === pw) {
              if (userData.status === 'pending') {
                  toast('가입 승인 대기 중입니다. 임원진에게 문의하세요.', 'warn');
              } else {
                  // Map to new UI format
                  DB.currentUser = {
                      firebaseId: userDoc.id,
                      id: userDoc.id,
                      name: userData.name,
                      email: userData.id || userData.email,
                      pw: userData.pw,
                      studentId: userData.studentId,
                      dept: userData.major || userData.dept || '-',
                      group: userData.group || '',
                      studies: userData.studies || (userData.study ? [userData.study] : []),
                      rank: userData.role,
                      status: userData.status,
                      avatar: userData.name ? userData.name[0] : '👤'
                  };
                  toast('환영합니다! 로그인 되었습니다.', 'ok');
try { initApp(); } catch(e) { console.warn("initApp err:", e); }
              }
          } else {
              toast('비밀번호가 일치하지 않습니다.', 'err');
          }
      } else {
          if ((email === 'admin@dif.kr' || email === 'member@dif.kr') && pw === '1234') {
              const isAdmin = email === 'admin@dif.kr';
              const newUserData = {
                  id: email,
                  email: email,
                  name: isAdmin ? '학회장(테스트)' : '학회원(테스트)',
                  pw: '1234',
                  role: isAdmin ? '학회장' : '학회원',
                  status: 'active',
                  studentId: isAdmin ? '20200000' : '20210000',
                  major: '디자인학과',
                  group: '메인 프로젝트 - 1조',
                  studies: ['포토샵 스터디']
              };
              const newUserRef = await addDoc(collection(db, "users"), newUserData);
              DB.currentUser = {
                  firebaseId: newUserRef.id,
                  ...newUserData,
                  avatar: newUserData.name[0],
                  dept: newUserData.major,
                  rank: newUserData.role
              };
              toast('테스트 계정이 자동 생성되어 로그인 되었습니다.', 'ok');
try { initApp(); } catch(e) { console.warn("initApp err:", e); }
              return;
          }
          toast('존재하지 않는 계정입니다.', 'err');
      }
  } catch (error) {
      console.error(error);
      toast('로그인 중 오류가 발생했습니다: ' + error.message, 'err');
  }
};

window.doLogout = function() {
    DB.currentUser = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    toast('로그아웃 되었습니다.', '');
};

// override register
window.doRegister = async function() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const sid = document.getElementById('reg-sid').value.trim();
  const dept = document.getElementById('reg-dept').value.trim();
  const pw = document.getElementById('reg-pw').value;
  if (!name || !email || !sid || !pw) return toast('모든 필수 항목을 입력해주세요.', 'err');
  if (pw.length < 6) return toast('비밀번호는 6자 이상이어야 합니다.', 'err');

  try {
      const newUser = {
          id: email,
          email: email,
          pw: pw,
          name: name,
          studentId: sid,
          major: dept,
          dept: dept,
          role: '학회원',
          status: 'pending'
      };
      await addDoc(collection(db, "users"), newUser);
      toast('회원가입 신청이 완료되었습니다! 임원진 승인 후 로그인 가능합니다.', 'ok');
      switchAuthTab('login');
  } catch (error) {
      console.error(error);
      toast('가입 신청 중 오류가 발생했습니다.', 'err');
  }
};

// Override submitAttCode to use Firebase
window.submitAttCode = async function() {
    const code = document.getElementById('att-code-member').value.trim().toUpperCase();
    if(!code) return toast('코드를 입력해주세요.', 'err');
    
    // In our new DB logic, todayCode comes from the current session. Let's find today's session
    const today = new Date().toISOString().split('T')[0];
    const tA = DB.attendance.find(a => a.date === today);
    if (!tA) return toast('오늘 출석 세션이 없습니다.', 'err');
    if (code !== tA.code) return toast('출석 코드가 올바르지 않습니다.', 'err');

    try {
        const newRecord = {
            userId: DB.currentUser.id,
            date: today,
            status: '출석',
            title: tA.title,
            code: tA.code,
            timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, "attendance_records"), newRecord);
        toast('출석 완료! ✅', 'ok');
        await fetchFirestoreData();
        renderAttendance();
    } catch(e) {
        console.error(e);
        toast('출석 처리 중 오류 발생', 'err');
    }
};

// Override setTodayCode for Admin
window.setTodayCode = async function() {
    const code = document.getElementById('att-code-inp').value.trim().toUpperCase();
    if(!code) return toast('코드를 입력해주세요.', 'err');
    const today = new Date().toISOString().split('T')[0];
    
    // We add a dummy record to establish the session code in Firebase
    try {
        await addDoc(collection(db, "attendance_records"), {
            userId: 'admin',
            date: today,
            title: (new Date().getMonth()+1)+'월 '+new Date().getDate()+'일 세미나',
            code: code,
            status: 'admin_setup' // just to hold the code
        });
        toast('출석 코드 설정 완료: ' + code, 'ok');
        await fetchFirestoreData();
        renderAttendance();
    } catch(e) {
        console.error(e);
        toast('오류 발생', 'err');
    }
};

// Override processExcuse
window.processExcuse = async function(rid, decision) {
    // find excuse in DB
    const r = DB.excuses.find(x => x.id === rid);
    if(!r) return;
    try {
        await updateDoc(doc(db, "attendance_records", rid), {
            status: decision === 'approved' ? '출석' : '결석'
        });
        toast(decision==='approved'?'사유 불참 승인 처리되었습니다.':'사유 불참 신청이 반려되었습니다.',decision==='approved'?'ok':'err');
        await fetchFirestoreData();
        renderAttendance();
    } catch(e) {
        console.error(e);
        toast('오류 발생', 'err');
    }
};

// Override createAsg
window.createAsg = async function() {
    const title = document.getElementById('na-title').value.trim();
    const deadline = document.getElementById('na-deadline').value;
    const formLink = document.getElementById('na-formLink') ? document.getElementById('na-formLink').value.trim() : '';
    const vCode = document.getElementById('na-vCode') ? document.getElementById('na-vCode').value.trim() : '';
    
    if(!title||!deadline) return toast('과제명과 마감일을 입력해주세요.', 'err');
    
    try {
        const newTask = {
            title: title,
            description: document.getElementById('na-desc').value,
            deadline: deadline,
            group: document.getElementById('na-group').value,
            formLink: formLink,
            verificationCode: vCode,
            submissions: [],
            status: 'pending'
        };
        await addDoc(collection(db, "assignments"), newTask);
        closeModal();
        toast('과제가 추가되었습니다.', 'ok');
        await fetchFirestoreData();
        renderAssignments(typeof curAsgTab !== 'undefined' ? curAsgTab : 'ongoing');
    } catch(e) {
        console.error(e);
        toast('오류 발생', 'err');
    }
};

window.delAsg = async function(id) {
    if(!confirm('과제를 삭제하시겠습니까?')) return;
    try {
        await deleteDoc(doc(db, "assignments", id));
        DB.assignments = DB.assignments.filter(a => a.id !== id);
        toast('삭제되었습니다.', 'ok');
        renderAssignments(typeof curAsgTab !== 'undefined' ? curAsgTab : 'ongoing');
    } catch (e) {
        console.error(e);
        toast('과제 삭제 중 오류가 발생했습니다.', 'err');
    }
};

// Override openNewAsgModal to include formLink and vCode
window.openNewAsgModal = function() {
    const d=new Date();d.setDate(d.getDate()+7);const def=d.toISOString().split('T')[0];
const allTargets = ['전체','프로젝트','포토샵 기초반 스터디','포토샵 심화반 스터디','블렌더 스터디'];
    openModal(`<div class="modal"><div class="m-hd"><div class="m-title">+ 새 과제 추가</div><button class="m-x" onclick="closeModal()">✕</button></div>
    <div class="m-bd">
      <div class="fg"><label class="fl">과제명</label><input id="na-title" class="fc"></div>
      <div class="fg"><label class="fl">설명</label><textarea id="na-desc" class="fc" rows="2"></textarea></div>
      <div class="fg"><label class="fl">대상 그룹</label>
        <select id="na-group" class="fc"><option value="전체">전체</option>${allTargets.map(g=>`<option>${esc(g)}</option>`).join('')}</select></div>
      <div class="fg"><label class="fl">마감일</label><input type="date" id="na-deadline" class="fc" value="${def}"></div>
      <div class="fg"><label class="fl">제출 폼 주소 (구글 폼)</label><input id="na-formLink" class="fc" placeholder="https://forms.gle/..."></div>
      <div class="fg"><label class="fl">제출 인증 코드 (제출 완료시 보여질 코드)</label><input id="na-vCode" class="fc" placeholder="예: 제출완료123"></div>
    </div>
    <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="createAsg()">추가</button></div>
    </div>`);
};

// Override openSubmitModal and doSubmit for Google form logic
window.openSubmitModal = function(id) {
    const a = DB.assignments.find(x => x.id === id);
    if(a.formLink) {
        window.open(a.formLink, '_blank');
        openModal(`<div class="modal"><div class="m-hd"><div class="m-title">과제 제출 인증 — ${esc(a.title)}</div><button class="m-x" onclick="closeModal()">✕</button></div>
        <div class="m-bd">
          <div class="al al-i"><span>ℹ️</span><div>구글 폼에 제출을 완료한 후, 화면에 표시된 <strong>인증 코드</strong>를 입력해주세요.</div></div>
          <div class="fg"><label class="fl">인증 코드</label><input id="sub-code" class="fc" placeholder="인증 코드 입력"></div>
        </div>
        <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="doSubmitCode('${id}')">인증하기</button></div>
        </div>`);
    } else {
        // Fallback to original
        openModal(`<div class="modal"><div class="m-hd"><div class="m-title">과제 제출 — ${esc(a.title)}</div><button class="m-x" onclick="closeModal()">✕</button></div>
        <div class="m-bd">
          <div class="al al-i"><span>ℹ️</span><div>서버 배포 후 실제 파일 업로드가 가능합니다. 현재는 파일명으로 기록합니다.</div></div>
          <div class="fg"><label class="fl">파일명</label><input id="sub-file" class="fc" placeholder="홍길동_과제.pdf"></div>
        </div>
        <div class="m-ft"><button class="btn btn-o" onclick="closeModal()">취소</button><button class="btn btn-p" onclick="doSubmit('${id}')">제출</button></div>
        </div>`);
    }
};

window.doSubmitCode = async function(id) {
    const code = document.getElementById('sub-code').value.trim();
    const a = DB.assignments.find(x => x.id === id);
    if(!code) return toast('인증 코드를 입력해주세요.', 'err');
    if(code !== a.verificationCode) return toast('인증 코드가 일치하지 않습니다.', 'err');
    
    try {
        // We need to update the task document to add the submission
        const taskRef = doc(db, "tasks", a.firebaseId);
        const newSubs = [...a.submissions, {
            userId: DB.currentUser.id,
            timestamp: new Date().toLocaleString('ko'),
            file: '구글폼 제출 완료'
        }];
        await updateDoc(taskRef, { submissions: newSubs });
        closeModal();
        toast('과제 제출이 인증되었습니다! ✅', 'ok');
        await fetchFirestoreData();
        renderAssignments(typeof curAsgTab !== 'undefined' ? curAsgTab : 'ongoing');
    } catch(e) {
        console.error(e);
        toast('인증 처리 중 오류가 발생했습니다.', 'err');
    }
};

window.doSubmit = async function(id) {
    const file = document.getElementById('sub-file').value.trim();
    if(!file) return toast('파일명을 입력해주세요.', 'err');
    const a = DB.assignments.find(x => x.id === id);
    try {
        const taskRef = doc(db, "tasks", a.firebaseId);
        const newSubs = [...a.submissions, {
            userId: DB.currentUser.id,
            timestamp: new Date().toLocaleString('ko'),
            file: file
        }];
        await updateDoc(taskRef, { submissions: newSubs });
        closeModal();
        toast('과제가 제출되었습니다! ✅', 'ok');
        await fetchFirestoreData();
        renderAssignments(typeof curAsgTab !== 'undefined' ? curAsgTab : 'ongoing');
    } catch(e) {
        console.error(e);
        toast('제출 중 오류 발생', 'err');
    }
};

// Wait for DOM
document.addEventListener("DOMContentLoaded", async () => {
    // Initial UI state
    document.getElementById('app').style.display = 'none';
    
    // If not logged in, show auth screen
    if (!DB.currentUser) {
        document.getElementById('auth-screen').style.display = 'flex';
    }

    // Real-time listener for tasks, users, etc can be setup here, or we just rely on fetchFirestoreData
    await fetchFirestoreData();
});

window.renderAdminSettings = function() {
    const gEl = document.getElementById('admin-groups');
    if(gEl) {
        gEl.innerHTML = (DB.groups||[]).map(g => `<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>${esc(g)}</span>
            <button class="btn btn-d btn-sm" onclick="delGroup('${g}')">삭제</button>
        </div>`).join('');
    }
    const sEl = document.getElementById('admin-studies');
    if(sEl) {
        sEl.innerHTML = (DB.studies||[]).map(s => `<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>${esc(s)}</span>
            <button class="btn btn-d btn-sm" onclick="delStudy('${s}')">삭제</button>
        </div>`).join('');
    }
};

window.addStudy = async function() {
    const val = document.getElementById('new-study-inp').value.trim();
    if(!val) return toast('스터디 이름을 입력하세요.', 'err');
    if(DB.studies.includes(val)) return toast('이미 존재하는 스터디입니다.', 'err');
    DB.studies.push(val);
    document.getElementById('new-study-inp').value = '';
    renderAdminSettings();
    saveSettings();
}

window.delStudy = async function(val) {
    if(!confirm(val + ' 스터디를 삭제하시겠습니까?')) return;
    DB.studies = DB.studies.filter(x => x !== val);
    renderAdminSettings();
    saveSettings();
}

async function saveSettings() {
    try {
        await setDoc(doc(db, 'settings', 'general'), {
            groups: DB.groups,
            studies: DB.studies
        }, { merge: true });
        toast('설정이 저장되었습니다.', 'ok');
    } catch(e) {
        console.error(e);
        toast('설정 저장 실패', 'err');
    }
}

window.addGroup = async function() {
    const val = document.getElementById('new-group-inp').value.trim();
    if(!val) return toast('조 이름을 입력하세요.', 'err');
    if(DB.groups.includes(val)) return toast('이미 존재하는 조입니다.', 'err');
    DB.groups.push(val);
    document.getElementById('new-group-inp').value = '';
    renderAdminSettings();
    await saveSettings();
};

window.delGroup = async function(val) {
    if(!confirm('${val} 조를 삭제하시겠습니까?')) return;
    DB.groups = DB.groups.filter(g => g !== val);
    renderAdminSettings();
    await saveSettings();
};

window.addStudy = async function() {
    const val = document.getElementById('new-study-inp').value.trim();
    if(!val) return toast('스터디 이름을 입력하세요.', 'err');
    if(DB.studies.includes(val)) return toast('이미 존재하는 스터디입니다.', 'err');
    DB.studies.push(val);
    document.getElementById('new-study-inp').value = '';
    renderAdminSettings();
    await saveSettings();
};

window.delStudy = async function(val) {
    if(!confirm('${val} 스터디를 삭제하시겠습니까?')) return;
    DB.studies = DB.studies.filter(s => s !== val);
    renderAdminSettings();
    await saveSettings();
};


window.renderAdminSettings = function() {
    const gEl = document.getElementById('admin-groups');
    if(gEl) {
        gEl.innerHTML = (DB.groups||[]).map(g => `<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>${esc(g)}</span>
            <button class="btn btn-d btn-sm" onclick="delGroup('${g}')">삭제</button>
        </div>`).join('');
    }
    const sEl = document.getElementById('admin-studies');
    if(sEl) {
        sEl.innerHTML = (DB.studies||[]).map(s => `<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>${esc(s)}</span>
            <button class="btn btn-d btn-sm" onclick="delStudy('${s}')">삭제</button>
        </div>`).join('');
    }
};

window.addStudy = async function() {
    const val = document.getElementById('new-study-inp').value.trim();
    if(!val) return toast('스터디 이름을 입력하세요.', 'err');
    if(DB.studies.includes(val)) return toast('이미 존재하는 스터디입니다.', 'err');
    DB.studies.push(val);
    document.getElementById('new-study-inp').value = '';
    renderAdminSettings();
    saveSettings();
}

window.delStudy = async function(val) {
    if(!confirm(val + ' 스터디를 삭제하시겠습니까?')) return;
    DB.studies = DB.studies.filter(x => x !== val);
    renderAdminSettings();
    saveSettings();
}

window.openMemberModal = function(userId) {
  if(!isAdmin(DB.currentUser)) return toast('권한이 없습니다.', 'err');
  const m = userId && userId !== 'null' ? DB.users.find(u => u.id === userId) : null;
  const studiesHTML = (DB.studies || []).map((s, idx) => `
    <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
      <input type="checkbox" id="em-study-${idx}" value="${esc(s)}" ${m && m.studies && m.studies.includes(s) ? 'checked' : ''}>${esc(s)}
    </label>
  `).join('');

  openModal(`<div class="modal" style="max-width:500px;"><div class="m-hd"><div class="m-title">${m ? '학회원 편집' : '학회원 추가'}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">이름 *</label><input id="em-name" class="fc" value="${m ? esc(m.name) : ''}"></div>
    <div class="fg"><label class="fl">이메일</label><input id="em-email" class="fc" value="${m ? esc(m.email) : ''}" ${m ? 'disabled' : ''}></div>
    <div class="fg"><label class="fl">학번 *</label><input id="em-sid" class="fc" value="${m ? esc(m.studentId) : ''}"></div>
    <div class="fg"><label class="fl">학과</label><input id="em-dept" class="fc" value="${m ? esc(m.dept) : ''}"></div>
    <div class="fg"><label class="fl">프로젝트 조</label>
      <select id="em-group" class="fc"><option value="">— 미지정 —</option>${DB.groups.map(g => `<option ${m && m.group === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select></div>
    <div class="fg"><label class="fl">스터디 참가 (중복 선택 가능)</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;" id="em-studies-container">
        ${studiesHTML}
      </div>
    </div>
    <div class="fg"><label class="fl">직급</label>
      <select id="em-rank" class="fc">${RANKS.map(r => `<option ${m && m.rank === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
    ${!m ? `<div class="fg"><label class="fl">임시 비밀번호</label><input id="em-pw" class="fc" placeholder="미입력시 1234"></div>` : ''}
  </div>
  <div class="m-ft">
    <button class="btn btn-o" onclick="closeModal()">취소</button>
    <button class="btn btn-p" onclick="saveMember('${userId || 'null'}')">저장</button>
  </div></div>`);
};

window.saveMember = async function(userId) {
    const name = document.getElementById('em-name').value.trim();
    const sid = document.getElementById('em-sid').value.trim();
    const dept = document.getElementById('em-dept').value.trim();
    const group = document.getElementById('em-group').value;
    const rank = document.getElementById('em-rank').value;
    
    const studies = [];
    (DB.studies||[]).forEach((s, idx) => {
        const chk = document.getElementById(`em-study-${idx}`);
        if(chk && chk.checked) studies.push(s);
    });

    if(!name || !sid) return toast('이름과 학번은 필수입니다.', 'err');

    try {
        if(userId && userId !== 'null') {
            const m = DB.users.find(u => u.id === userId);
            if(!m) return toast('학회원을 찾을 수 없습니다.', 'err');

            await updateDoc(doc(db, "users", m.firebaseId), {
                name: name,
                studentId: sid,
                major: dept,
                group: group,
                studies: studies,
                role: rank
            });
            Object.assign(m, {name, studentId: sid, dept, group, studies, rank, avatar: name[0]});
            toast(name + '의 정보가 수정되었습니다.', 'ok'); closeModal(); renderMembers();
        } else {
            const email = document.getElementById('em-email').value.trim();
            const pw = document.getElementById('em-pw').value || '1234';
            if(!email) return toast('이메일을 입력해주세요.', 'err');

            const newUserRef = await addDoc(collection(db, "users"), {
                name, email, id: email, pw, studentId: sid, major: dept, group, studies, role: rank, status: 'active'
            });
            DB.users.push({
                id: newUserRef.id,
                firebaseId: newUserRef.id,
                name, email, pw, studentId: sid, dept, group, studies, rank, avatar: name[0], status: 'active'
            });
            toast('새 학회원이 추가되었습니다.', 'ok'); closeModal(); renderMembers();
        }
        closeModal();
        renderMembers();
        if(document.getElementById('admin-groups')) renderAdminSettings();
    } catch(e) {
        console.error(e);
        toast('오류 발생: ' + e.message, 'err');
    }
};


window.submitExcuse = async function(date, sessionId) {
    const reason = document.getElementById('excuse-reason').value.trim();
    if(!reason) return toast('사유를 입력해주세요.', 'err');
    if(DB.excuses.find(r => r.userId === DB.currentUser.id && r.date === date)) return toast('이미 사유 불참 신청이 존재합니다.', 'err');
    try {
        await addDoc(collection(db, "attendance_records"), {
            userId: DB.currentUser.id,
            date: date,
            reason: reason,
            status: 'pending',
            title: (new Date(date).getMonth()+1)+'월 '+new Date(date).getDate()+'일 세미나'
        });
        closeModal();
        toast('사유 불참 신청이 제출되었습니다.', 'ok');
        await fetchFirestoreData();
        renderAttendance();
    } catch(e) {
        console.error(e);
        toast('오류 발생: ' + e.message, 'err');
    }
};

window.toggleAttStatus = async function(userId) {
    const today = new Date().toISOString().split('T')[0];
    const tA = DB.attendance.find(a => a.date === today);
    if(!tA) return toast('오늘의 출석 세션이 없습니다.', 'err');
    const r = tA.records.find(x => x.userId === userId);
    const states = ['미출석', '출석', '지각', '결석', '사유'];
    const cur = r ? r.status : '미출석';
    const next = states[(states.indexOf(cur) + 1) % states.length];
    
    try {
        if(r) {
            const attDoc = await getDocs(query(collection(db, "attendance_records"), where("date", "==", today), where("userId", "==", userId)));
            if(!attDoc.empty) {
                await updateDoc(doc(db, "attendance_records", attDoc.docs[0].id), { status: next });
            }
        } else {
            await addDoc(collection(db, "attendance_records"), {
                date: today,
                userId: userId,
                status: next,
                title: tA.title,
                code: tA.code
            });
        }
        await fetchFirestoreData();
        openAttStatusModal(); 
    } catch(e) { 
        console.error(e); 
        toast('오류 발생: ' + e.message, 'err'); 
    }
};

window.saveProfile = async function() {
    const u = DB.currentUser;
    const name = document.getElementById('ep-name').value.trim();
    const dept = document.getElementById('ep-dept').value.trim();
    const newPw = document.getElementById('ep-new').value;
    if(!name) return toast('이름을 입력해주세요.', 'err');
    
    try {
        const updateData = { name: name, major: dept };
        if(newPw) {
            if(document.getElementById('ep-cur').value !== u.pw) return toast('현재 비밀번호가 올바르지 않습니다.', 'err');
            if(newPw.length < 6) return toast('비밀번호는 6자 이상이어야 합니다.', 'err');
            updateData.pw = newPw;
        }
        if (u.firebaseId) {
            await updateDoc(doc(db, "users", u.firebaseId), updateData);
        }
        u.name = name;
        u.dept = dept;
        u.avatar = name[0];
        if(newPw) u.pw = newPw;
        closeModal();
        toast('프로필이 저장되었습니다.', 'ok');
        initApp();
        goPage('profile');
    } catch(e) {
        console.error(e);
        toast('프로필 저장 중 오류 발생: ' + e.message, 'err');
    }
};

window.attAdminDate = new Date().toISOString().split('T')[0];
window.attMoveDate = function(dir) {
    const d = new Date(window.attAdminDate);
    d.setDate(d.getDate() + dir);
    window.attAdminDate = d.toISOString().split('T')[0];
    renderAttendance();
};

window.attAdminView = window.attAdminView || 'detail';
window.attSetView = function(view, date) {
    window.attAdminView = view;
    if(date) window.attAdminDate = date;
    renderAttendance();
};

window.renderAttendance = function() {
  const u = DB.currentUser;
  const mng = canMng(u);
  document.getElementById('att-admin-panel').style.display = mng ? 'block' : 'none';
  const exportBtn = document.getElementById('export-att-btn');
  if(exportBtn) exportBtn.style.display = mng ? '' : 'none';
  
  if (mng) {
      const allTargets = ['전체','프로젝트','포토샵 기초반 스터디','포토샵 심화반 스터디','블렌더 스터디'];
      const today = new Date().toISOString().split('T')[0];
      const tA = DB.attendance.find(a => a.date === today);
      const curTarget = tA ? (tA.targetGroup || '전체') : '전체';
      const targetOpts = allTargets.map(t => `<option ${curTarget===t?'selected':''}>${esc(t)}</option>`).join('');
      
      document.getElementById('att-admin-panel').innerHTML = `
        <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--r-lg);padding:1.5rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <div><div style="font-size:13px;font-weight:600;margin-bottom:5px;">오늘 출석 대상 (${today})</div>
            <select id="att-target-inp" class="fc" style="width:140px;">${targetOpts}</select>
          </div>
          <div style="flex:1;"><div style="font-size:13px;font-weight:600;margin-bottom:5px;">세미나/스터디명</div>
            <input type="text" id="att-title-inp" class="fc" value="${tA?esc(tA.title):''}" placeholder="예: 1차 세미나">
          </div>
          <div style="flex:1;"><div style="font-size:13px;font-weight:600;margin-bottom:5px;">출석 코드 (영문/숫자)</div>
            <div style="display:flex;gap:5px;">
              <input type="text" id="att-code-inp" class="fc" style="text-transform:uppercase;" value="${tA?tA.code:''}">
              <button class="btn btn-p" onclick="setTodayCode()">설정</button>
            </div>
          </div>
        </div>`;
        
      if(window.attAdminView === 'summary') {
          const html = DB.attendance.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => {
              const target = a.targetGroup || '전체';
              let members = DB.users.filter(x => x.status === 'active');
              if (target !== '전체') {
                  members = members.filter(m => {
                      if (target === '프로젝트') return m.group && m.group !== '미배정';
                      return (m.group === target) || (m.studies && m.studies.includes(target));
                  });
              }
              const total = members.length;
              let att=0, late=0, abs=0, exc=0;
              members.forEach(m => {
                  const r = a.records.find(x => x.userId === m.id);
                  const st = r ? r.status : '미출석';
                  if(st==='출석') att++;
                  else if(st==='지각') late++;
                  else if(st==='결석' || st==='미출석') abs++;
                  else if(st==='사유') exc++;
              });
              
              return `<tr>
                <td>${fmt(a.date)}</td>
                <td><span class="badge b-gy">${target}</span></td>
                <td>${esc(a.title)}</td>
                <td>${total}</td>
                <td><span style="color:var(--green);font-weight:bold;">${att}</span></td>
                <td><span style="color:var(--yellow-dark);font-weight:bold;">${late}</span></td>
                <td><span style="color:var(--red);font-weight:bold;">${abs}</span></td>
                <td><button class="btn btn-p btn-sm" onclick="attSetView('detail', '${a.date}')">상세 관리</button></td>
              </tr>`;
          }).join('');
          
          document.querySelector('#page-attendance .c-title').innerHTML = `출석체크 요약 현황`;
          document.getElementById('att-history').innerHTML = html;
          document.querySelector('#page-attendance thead').innerHTML = `<tr><th>날짜</th><th>대상</th><th>세미나명</th><th>총원</th><th>출석</th><th>지각</th><th>결석/미출석</th><th>관리</th></tr>`;
      } else {
          const viewDate = window.attAdminDate;
          const vA = DB.attendance.find(a => a.date === viewDate);
          const targetGroup = vA ? (vA.targetGroup || '전체') : '전체';
          
          let members = DB.users.filter(x => x.status === 'active');
          if (targetGroup !== '전체') {
              members = members.filter(m => {
                  if (targetGroup === '프로젝트') return m.group && m.group !== '미배정';
                  return (m.group === targetGroup) || (m.studies && m.studies.includes(targetGroup));
              });
          }
          
          document.querySelector('#page-attendance .c-title').innerHTML = `
            상세 출석 현황 
            <span style="font-size:14px;font-weight:bold;margin:0 10px;">${viewDate} (${targetGroup})</span>
            <button class="btn btn-o btn-sm" style="padding:2px 8px;" onclick="attSetView('summary')">요약으로 돌아가기</button>`;
          
          const tbody = document.getElementById('att-history');
          if(members.length === 0) {
              tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">대상자가 없습니다.</td></tr>';
          } else {
              tbody.innerHTML = members.map(m => {
                  const r = vA ? vA.records.find(x => x.userId === m.id) : null;
                  const st = r ? r.status : '미출석';
                  const cls = st === '출석' ? 'b-gr' : st === '지각' ? 'b-ye' : st === '사유' ? 'b-bl' : st === '결석' ? 'b-re' : 'b-gy';
                  const stCell = `<span class="badge ${cls}" style="cursor:pointer;" onclick="toggleAttStatusAdmin('${viewDate}', '${m.id}')">${st}</span>`;
                  return `<tr><td>${esc(m.name)}</td><td>${esc(m.group)}</td><td>${stCell}</td><td>${r && r.code ? r.code : '-'}</td><td>${r && r.note ? r.note : ''}</td></tr>`;
              }).join('');
          }
          document.querySelector('#page-attendance thead').innerHTML = `<tr><th>이름</th><th>소속</th><th>상태</th><th>입력 코드</th><th>비고</th></tr>`;
      }
  } else {
      const today = new Date().toISOString().split('T')[0];
      const tA = DB.attendance.find(a => a.date === today);
      const isTarget = tA && (tA.targetGroup === '전체' || u.group === tA.targetGroup || (u.studies && u.studies.includes(tA.targetGroup)));
      
      const titleEl = document.querySelector('#page-attendance .c-title');
      if(titleEl) titleEl.textContent = '내 출석 기록';
      
      if(isTarget) {
          document.getElementById('att-member-panel').innerHTML = `
            <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--r-lg);padding:1.5rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;">
              <div style="flex:1;"><div style="font-size:13px;font-weight:600;margin-bottom:5px;">오늘 출석 대상: ${tA.targetGroup}</div>
              <div style="display:flex;gap:5px;"><input type="text" id="att-code-member" class="fc" placeholder="코드 입력" style="text-transform:uppercase;"><button class="btn btn-p" onclick="submitAttCode()">출석 확인</button></div></div>
            </div>`;
      } else {
          document.getElementById('att-member-panel').innerHTML = `
            <div style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--r-lg);padding:1.5rem;margin-bottom:1rem;text-align:center;color:var(--gray-500);">
              오늘은 귀하의 출석 대상일이 아닙니다.
            </div>`;
      }
      
      const tbody = document.getElementById('att-history');
      const myRecs = DB.attendance.filter(a => a.records.some(r => r.userId === u.id));
      if(!myRecs.length) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">기록 없음</td></tr>';
      else {
          tbody.innerHTML = myRecs.map(a => {
              const r = a.records.find(x => x.userId === u.id);
              const cls = r.status === '출석' ? 'b-gr' : r.status === '지각' ? 'b-ye' : r.status === '사유' ? 'b-bl' : 'b-re';
              return `<tr><td>${fmt(a.date)}</td><td>${esc(a.title)}</td><td><span class="badge ${cls}">${r.status}</span></td><td>${r.code||'-'}</td><td>${r.note||'-'}</td></tr>`;
          }).join('');
      }
      document.querySelector('#page-attendance thead').innerHTML = `<tr><th>날짜</th><th>세미나명</th><th>상태</th><th>코드</th><th>비고</th></tr>`;
  }
};

window.setTodayCode = async function() {
    const code = document.getElementById('att-code-inp').value.trim().toUpperCase();
    const target = document.getElementById('att-target-inp').value;
    if(!code) return toast('코드를 입력해주세요.', 'err');
    
    const today = new Date().toISOString().split('T')[0];
    try {
        const q = query(collection(db, "attendance_records"), where("date", "==", today));
        const snap = await getDocs(q);
        if(!snap.empty) {
            await updateDoc(doc(db, "attendance_records", snap.docs[0].id), { code: code, targetGroup: target });
        } else {
            await addDoc(collection(db, "attendance_records"), { date: today, code: code, targetGroup: target, title: (new Date().getMonth()+1)+'월 '+new Date().getDate()+'일 세미나' });
        }
        await fetchFirestoreData();
        toast('출석 코드 설정 완료', 'ok');
        renderAttendance();
    } catch(e) { toast('오류: ' + e.message, 'err'); }
};

window.submitAttCode = async function() {
    const code = document.getElementById('att-code-member').value.trim().toUpperCase();
    if(!code) return toast('코드를 입력해주세요.', 'err');
    const today = new Date().toISOString().split('T')[0];
    const tA = DB.attendance.find(a => a.date === today);
    if(!tA || code !== tA.code) return toast('출석 코드가 올바르지 않습니다.', 'err');
    
    try {
        const q = query(collection(db, "attendance_records"), where("date", "==", today), where("userId", "==", DB.currentUser.id));
        const snap = await getDocs(q);
        if(!snap.empty) {
            if(snap.docs[0].data().status === '출석') return toast('이미 출석체크가 되어있습니다.', 'err');
            await updateDoc(doc(db, "attendance_records", snap.docs[0].id), { status: '출석', enteredCode: code });
        } else {
            await addDoc(collection(db, "attendance_records"), {
                date: today,
                userId: DB.currentUser.id,
                status: '출석',
                enteredCode: code,
                title: tA.title,
                targetGroup: tA.targetGroup
            });
        }
        await fetchFirestoreData();
        toast('출석 완료! ✅', 'ok');
        renderAttendance();
    } catch(e) { toast('오류: ' + e.message, 'err'); }
};

window.toggleAttStatusAdmin = async function(date, userId) {
    const tA = DB.attendance.find(a => a.date === date);
    if(!tA) return toast('해당 날짜의 세션이 없습니다.', 'err');
    const r = tA.records.find(x => x.userId === userId);
    const states = ['미출석', '출석', '지각', '결석', '사유'];
    const cur = r ? r.status : '미출석';
    const next = states[(states.indexOf(cur) + 1) % states.length];
    
    try {
        if(r) {
            const q = query(collection(db, "attendance_records"), where("date", "==", date), where("userId", "==", userId));
            const snap = await getDocs(q);
            if(!snap.empty) {
                await updateDoc(doc(db, "attendance_records", snap.docs[0].id), { status: next });
            }
        } else {
            await addDoc(collection(db, "attendance_records"), {
                date: date,
                userId: userId,
                status: next,
                title: tA.title,
                code: tA.code,
                targetGroup: tA.targetGroup
            });
        }
        await fetchFirestoreData();
        renderAttendance();
    } catch(e) { toast('오류: ' + e.message, 'err'); }
};

window.renderAssignments = function(tab) {
    if(!tab) tab = window.curAsgTab || 'ongoing';
    window.curAsgTab = tab;
    const u = DB.currentUser;
    const isMng = canMng(u);
    
    // Hide 'Add New Assignment' button for non-managers
    const addBtnEl = document.getElementById('asg-admin-tb');
    if (addBtnEl) addBtnEl.style.display = isMng ? 'block' : 'none';
    
    const now = new Date();
    const arr = DB.assignments.filter(a => {
        const pass = new Date(a.deadline) < now;
        if(tab === 'ongoing') return !pass;
        if(tab === 'past') return pass;
        if(tab === 'mine') return true;
        return true;
    }).sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
    
    let html = '';
    if(arr.length === 0) {
        html = '<div class="empty">과제가 없습니다.</div>';
    } else {
        html = arr.map(a => {
            const isOver = new Date(a.deadline) < now;
            const sub = a.submissions.find(s => s.userId === u.id);
            const badge = isOver ? '<span class="badge b-gy">마감됨</span>' : '<span class="badge b-ye">진행 중</span>';
            const sBadge = sub ? '<span class="badge b-gr">제출 완료</span>' : (isOver ? '<span class="badge b-re">미제출</span>' : '<span class="badge b-ye">제출 대기</span>');
            const dBtn = isMng ? '<button class="btn btn-d btn-sm" onclick="event.stopPropagation(); delAsg(\''+a.id+'\')" style="margin-left:5px;">삭제</button>' : '';
            return '<div class="card asg-card" onclick="openSubmitModal(\''+a.id+'\')">' +
              '<div class="c-hd">' +
                '<div>' + badge + ' <span style="font-size:15px;font-weight:700;margin-left:5px;">' + esc(a.title) + '</span></div>' +
                '<div>' + sBadge + '</div>' +
              '</div>' +
              '<div class="asg-meta">' +
                '<span class="ic">📅</span> 마감: ' + fmt(a.deadline) + ' | <span class="ic">👥</span> 대상: ' + esc(a.group) +
              '</div>' +
              (isMng ? '<div style="margin-top:10px;text-align:right;"><button class="btn btn-o btn-sm" onclick="event.stopPropagation(); viewSubs(\''+a.id+'\')">제출 현황</button>'+dBtn+'</div>' : '') +
            '</div>';
        }).join('');
    }
    document.getElementById('asg-list').innerHTML = html;
};

// Fix 6: Notification Logic (Internal UI)
window.myNotifications = [];
window.openMyNotiModal = async function() {
    const notis = DB.notifications || [];
    const html = notis.length === 0 ? '<div class="empty">알림이 없습니다.</div>' : notis.map(n => 
      '<div style="padding:10px;border-bottom:1px solid #eee;background:' + (n.read ? '#fff' : '#f0f8ff') + ';">' +
        '<div style="font-weight:bold;margin-bottom:3px;">' + esc(n.title) + '</div>' +
        '<div style="font-size:13px;color:#444;">' + esc(n.body) + '</div>' +
        '<div style="font-size:11px;color:#888;margin-top:3px;">' + new Date(n.time).toLocaleString() + '</div>' +
      '</div>'
    ).join('');
    
    document.getElementById('modal-root').innerHTML = 
      '<div class="modal-bg" onclick="closeModal()">' +
        '<div class="modal fc" onclick="event.stopPropagation()" style="max-width:400px;max-height:80vh;display:flex;flex-direction:column;">' +
          '<div class="c-hd"><div class="c-title">내 알림</div><button class="btn-lo" onclick="closeModal()">✕</button></div>' +
          '<div style="overflow-y:auto;flex:1;">' + html + '</div>' +
        '</div>' +
      '</div>';
      
    const unread = notis.filter(n => !n.read);
    for(let n of unread) {
        n.read = true;
        window.markNotiRead(n.id);
    }
    document.getElementById('top-noti-badge').style.display = 'none';
};

window.sendNSNotify = async function() {
    const asgId = document.getElementById('ns-asg').value;
    const asg = DB.assignments.find(a => a.id === asgId);
    if(!asg) return toast('과제를 선택해주세요.', 'err');
    const u = DB.currentUser;
    const active = DB.users.filter(x => x.status === 'active');
    
    let cnt = 0;
    for(let m of active) {
        if(asg.group !== '전체') {
    if (asg.group === '프로젝트') {
        if(!m.group || m.group === '미배정') continue;
    } else {
        if(m.group !== asg.group && !(m.studies && m.studies.includes(asg.group))) continue;
    }
}
        const sub = asg.submissions.find(s => s.userId === m.id);
        if(!sub) {
            sendInternalNoti(m.id, '과제 미제출 알림', "\'" + asg.title + "\' 과제가 미제출 상태입니다!");
            cnt++;
        }
    }
    toast(cnt + '명에게 알림을 발송했습니다.', 'ok');
};

window.sendAbNotify = async function() {
    const date = document.getElementById('ab-date').value;
    const tA = DB.attendance.find(a => a.date === date);
    if(!tA) return toast('해당 날짜의 출석 정보가 없습니다.', 'err');
    const u = DB.currentUser;
    const active = DB.users.filter(x => x.status === 'active');
    
    let cnt = 0;
    for(let m of active) {
        if(tA.targetGroup && tA.targetGroup !== '전체') {
    if (tA.targetGroup === '프로젝트') {
        if(!m.group || m.group === '미배정') continue;
    } else {
        if(m.group !== tA.targetGroup && !(m.studies && m.studies.includes(tA.targetGroup))) continue;
    }
}
        const r = tA.records.find(x => x.userId === m.id);
        if(!r || (r.status !== '출석' && r.status !== '사유')) {
            sendInternalNoti(m.id, '결석/미출석 알림', date + " 세미나/스터디 출석이 확인되지 않았습니다.");
            cnt++;
        }
    }
    toast(cnt + '명에게 알림을 발송했습니다.', 'ok');
};

window.renameGroup = async function(oldName) {
        const v = document.getElementById('grp-name-' + oldName).value.trim();
        if(!v || v === oldName) return;
        const idx = DB.groups.indexOf(oldName);
        if(idx !== -1) {
            DB.groups[idx] = v;
            try { await setDoc(doc(db, 'settings', 'system'), { groups: DB.groups }, { merge: true }); renderAdmin(); toast('수정되었습니다.', 'ok'); } catch(e) { toast('오류', 'err'); }
        }
    };
