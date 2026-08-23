const fs = require('fs');
let code = fs.readFileSync('custom_overrides.js', 'utf8');

const settingsCode = `
window.renderAdminSettings = function() {
    const gEl = document.getElementById('admin-groups');
    if(gEl) {
        gEl.innerHTML = DB.groups.map(g => \`<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>\${esc(g)}</span>
            <button class="btn btn-d btn-sm" onclick="delGroup('\${g}')">삭제</button>
        </div>\`).join('');
    }
    const sEl = document.getElementById('admin-studies');
    if(sEl) {
        sEl.innerHTML = DB.studies.map(s => \`<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-100);">
            <span>\${esc(s)}</span>
            <button class="btn btn-d btn-sm" onclick="delStudy('\${s}')">삭제</button>
        </div>\`).join('');
    }
};

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
    if(!confirm('\${val} 조를 삭제하시겠습니까?')) return;
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
    if(!confirm('\${val} 스터디를 삭제하시겠습니까?')) return;
    DB.studies = DB.studies.filter(s => s !== val);
    renderAdminSettings();
    await saveSettings();
};
`;

if(!code.includes('window.renderAdminSettings')) {
    code += settingsCode;
    fs.writeFileSync('custom_overrides.js', code);
    console.log('Appended settings functions to custom_overrides.js');
}
