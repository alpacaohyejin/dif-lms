window.switchAuthTab = function(t) {
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-register');
  if (loginTab) loginTab.style.display = t === 'login' ? 'block' : 'none';
  if (regTab) regTab.style.display = t === 'register' ? 'block' : 'none';
  
  const tabs = document.querySelectorAll('.auth-tab');
  if(tabs.length >= 2) {
    tabs[0].className = 'auth-tab ' + (t === 'login' ? 'active' : '');
    tabs[1].className = 'auth-tab ' + (t === 'register' ? 'active' : '');
  }
};

window.showApp = function() {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen') || document.getElementById('app');
  if (authScreen) authScreen.style.display = 'none';
  if (appScreen) appScreen.style.display = 'block';
};

window.showAuth = function() {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen') || document.getElementById('app');
  if (authScreen) authScreen.style.display = 'flex';
  if (appScreen) appScreen.style.display = 'none';
};

window.doLogout = function() {
  if(confirm('로그아웃 하시겠습니까?')) {
    DB.currentUser = null;
    sessionStorage.removeItem('dif_user_session');
    localStorage.removeItem('dif_user');
    showAuth();
  }
};

window.handleLogin = async function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const idInput = document.getElementById('login-email') || document.getElementById('login-id');
  const pwInput = document.getElementById('login-password') || document.getElementById('login-pw');

  if (!idInput || !pwInput) return alert('로그인 입력 필드를 찾을 수 없습니다.');
  const inputId = idInput.value.trim();
  const inputPw = pwInput.value.trim();

  if (!inputId || !inputPw) return toast('아이디와 비밀번호를 입력해주세요.', 'err');

  try {
    let user = (DB.users || []).find(u => 
      (u.email === inputId || String(u.studentId) === inputId || String(u.student_id) === inputId) && 
      (u.pw === inputPw || u.password === inputPw)
    );

    if (!user && window.supabaseClient) {
      const { data, error } = await window.supabaseClient
        .from('users')
        .select('*')
        .or(`email.eq.${inputId},student_id.eq.${inputId}`);

      if (!error && data && data.length > 0) {
        const found = data.find(d => d.password === inputPw || d.pw === inputPw);
        if (found) {
          user = { ...found, studentId: found.student_id, group: found.group_name };
        }
      }
    }

    if (!user) return toast('아이디 또는 비밀번호가 일치하지 않습니다.', 'err');
    if (user.status === 'pending') return alert('가입 승인 대기 중인 계정입니다.');
    if (user.status === 'inactive') return alert('비활성화된 계정입니다.');

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      pw: user.pw || user.password,
      studentId: user.studentId || user.student_id,
      dept: user.dept,
      group: user.group || user.group_name || '미지정',
      rank: user.rank || '학회원',
      status: user.status || 'active',
      avatar: user.avatar || (user.name ? user.name[0] : '학'),
      studies: Array.isArray(user.studies) ? user.studies : []
    };

    DB.currentUser = formattedUser;
    sessionStorage.setItem('dif_user_session', JSON.stringify(formattedUser));
    localStorage.setItem('dif_user', JSON.stringify(formattedUser));
    
    toast(`${formattedUser.name}님 환영합니다!`, 'ok');
    initApp();
  } catch (err) {
    console.error('Login error:', err);
    toast('로그인 오류: ' + err.message, 'err');
  }
};
window.doLogin = window.handleLogin;

window.doRegister = async function() {
  const name = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const sid = document.getElementById('reg-sid')?.value.trim();
  const dept = document.getElementById('reg-dept')?.value.trim();
  const pw = document.getElementById('reg-pw')?.value;

  if(!name || !email || !sid || !pw) return toast('모든 필수 항목을 입력해주세요.', 'err');

  const newUser = {
    name, email, password: pw, pw, student_id: sid, dept: dept || '미지정',
    group_name: '미지정', rank: '학회원', status: 'pending', studies: []
  };

  try {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('users').insert([newUser]);
      if (error) throw error;
    }
    toast('가입 신청 완료! 운영진 승인 후 이용 가능합니다.', 'ok');
    switchAuthTab('login');
  } catch(err) {
    toast('가입 신청 실패: ' + err.message, 'err');
  }
};

window.initApp = function() {
  const u = DB.currentUser;
  if (!u) { showAuth(); return; }

  showApp();

  const sName = document.getElementById('sidebar-name');
  if(sName) sName.textContent = u.name;
  const sRole = document.getElementById('sidebar-role');
  if(sRole) sRole.textContent = u.rank;
  const sAv = document.getElementById('sidebar-avatar');
  if(sAv) {
    sAv.innerHTML = `<i data-lucide="circle-user-round" class="w-8 h-8 text-white" style="width:32px;height:32px;color:white;"></i>`;
    sAv.style.background = 'transparent';
  }

  const adminNav = document.getElementById('admin-nav');
  if(adminNav) adminNav.style.display = isAdmin(u) ? 'block' : 'none';

  goPage('dashboard');
  if (typeof updateNotifyBadge === 'function') updateNotifyBadge();
  if (typeof updateSemUI === 'function') updateSemUI();
};

window.goPage = function(page) {
  const u = DB.currentUser;
  if(!u) return;

  document.querySelectorAll('.ni').forEach(e => {
    const oc = e.getAttribute('onclick');
    if (oc && oc.includes(`goPage('${page}')`)) e.classList.add('active');
    else e.classList.remove('active');
  });

  document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
  const targetPage = document.getElementById(`page-${page}`);
  if(targetPage) targetPage.classList.add('active');

  const titles = { dashboard: '대시보드', attendance: '출석체크', assignments: '과제 관리', members: '학회원 명단', profile: '내 프로필', files: '작업물 보관함', teamlog: '팀 로그', notify: '알림 보내기', admin: '관리자 설정' };
  const pt = document.getElementById('page-title');
  if(pt) pt.textContent = titles[page] || '대시보드';

  if (page === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
  if (page === 'attendance' && typeof renderAttendance === 'function') renderAttendance();
  if (page === 'assignments' && typeof renderAssignments === 'function') renderAssignments('ongoing');
  if (page === 'members' && typeof renderMembers === 'function') renderMembers();
  if (page === 'profile' && typeof renderProfile === 'function') renderProfile();
  if (page === 'files' && typeof renderFiles === 'function') renderFiles();
  if (page === 'teamlog' && typeof renderLogs === 'function') renderLogs();
  if (page === 'notify' && typeof renderNotify === 'function') renderNotify();
  if (page === 'admin' && typeof renderAdmin === 'function') renderAdmin();

  if (window.lucide) window.lucide.createIcons();
};

// 안전한 세션 체크 1회 보장
let isChecked = false;
window.checkSession = async function() {
  if (isChecked) return;
  isChecked = true;

  try {
    if (window.API && typeof window.API.fetchInitialData === 'function') {
      await window.API.fetchInitialData();
    }
    if (window.API && typeof window.API.setupRealtime === 'function') {
      window.API.setupRealtime();
    }

    const savedUser = sessionStorage.getItem('dif_user_session') || localStorage.getItem('dif_user');
    if (savedUser) {
      const uObj = JSON.parse(savedUser);
      const freshUser = (DB.users || []).find(u => String(u.id) === String(uObj.id)) || uObj;
      DB.currentUser = freshUser;
      initApp();
    } else {
      showAuth();
    }
  } catch (err) {
    console.error('Init error:', err);
    showAuth();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSession);
} else {
  checkSession();
}
