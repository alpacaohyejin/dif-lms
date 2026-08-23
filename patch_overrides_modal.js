const fs = require('fs');
let code = fs.readFileSync('custom_overrides.js', 'utf8');

const newCode = `

window.renderAdminSettings = function() {
    const gEl = document.getElementById('admin-groups');
    if(gEl) {
        gEl.innerHTML = DB.groups.map(g => {
            const members = DB.users.filter(u => u.status === 'active' && u.group === g);
            const memberNames = members.map(m => esc(m.name)).join(', ');
            return \`<div style="padding:.5rem 0;border-bottom:1px solid var(--gray-100);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-weight:600;">\${esc(g)}</span>
                    <button class="btn btn-d btn-sm" onclick="delGroup('\${g}')">삭제</button>
                </div>
                <div class="tm" style="font-size:12px;">조원: \${memberNames || '없음'}</div>
            </div>\`;
        }).join('');
    }
    const sEl = document.getElementById('admin-studies');
    if(sEl) {
        sEl.innerHTML = DB.studies.map(s => \`<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>\${esc(s)}</span>
            <button class="btn btn-d btn-sm" onclick="delStudy('\${s}')">삭제</button>
        </div>\`).join('');
    }
};

window.openMemberModal = function(userId) {
  const m = userId && userId !== 'null' ? DB.users.find(u => u.id === userId) : null;
  const studiesHTML = DB.studies.map((s, idx) => \`
    <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;">
      <input type="checkbox" id="em-study-\${idx}" value="\${esc(s)}" \${m && m.studies && m.studies.includes(s) ? 'checked' : ''}>\${esc(s)}
    </label>
  \`).join('');

  openModal(\`<div class="modal" style="max-width:500px;"><div class="m-hd"><div class="m-title">\${m ? '학회원 편집' : '학회원 추가'}</div><button class="m-x" onclick="closeModal()">✕</button></div>
  <div class="m-bd">
    <div class="fg"><label class="fl">이름 *</label><input id="em-name" class="fc" value="\${m ? esc(m.name) : ''}"></div>
    <div class="fg"><label class="fl">이메일</label><input id="em-email" class="fc" value="\${m ? esc(m.email) : ''}" \${m ? 'disabled' : ''}></div>
    <div class="fg"><label class="fl">학번 *</label><input id="em-sid" class="fc" value="\${m ? esc(m.studentId) : ''}"></div>
    <div class="fg"><label class="fl">학과</label><input id="em-dept" class="fc" value="\${m ? esc(m.dept) : ''}"></div>
    <div class="fg"><label class="fl">프로젝트 조</label>
      <select id="em-group" class="fc"><option value="">— 미지정 —</option>\${DB.groups.map(g => \`<option \${m && m.group === g ? 'selected' : ''}>\${esc(g)}</option>\`).join('')}</select></div>
    <div class="fg"><label class="fl">스터디 참가 (중복 선택 가능)</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;" id="em-studies-container">
        \${studiesHTML}
      </div>
    </div>
    <div class="fg"><label class="fl">직급</label>
      <select id="em-rank" class="fc">\${RANKS.map(r => \`<option \${m && m.rank === r ? 'selected' : ''}>\${r}</option>\`).join('')}</select></div>
    \${!m ? \`<div class="fg"><label class="fl">임시 비밀번호</label><input id="em-pw" class="fc" placeholder="미입력시 1234"></div>\` : ''}
  </div>
  <div class="m-ft">
    <button class="btn btn-o" onclick="closeModal()">취소</button>
    <button class="btn btn-p" onclick="saveMember('\${userId || 'null'}')">저장</button>
  </div></div>\`);
};

window.saveMember = async function(userId) {
    const name = document.getElementById('em-name').value.trim();
    const sid = document.getElementById('em-sid').value.trim();
    const dept = document.getElementById('em-dept').value.trim();
    const group = document.getElementById('em-group').value;
    const rank = document.getElementById('em-rank').value;
    
    const studies = [];
    DB.studies.forEach((s, idx) => {
        const chk = document.getElementById(\`em-study-\${idx}\`);
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
            toast(name + '의 정보가 수정되었습니다.', 'ok');
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
            toast('새 학회원이 추가되었습니다.', 'ok');
        }
        closeModal();
        renderMembers();
        if(document.getElementById('admin-groups')) renderAdminSettings();
    } catch(e) {
        console.error(e);
        toast('오류 발생: ' + e.message, 'err');
    }
};

`;

code += newCode;
fs.writeFileSync('custom_overrides.js', code);
console.log('Appended modal functions to custom_overrides.js');
