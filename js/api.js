// Supabase 설정 및 초기화
// 프로젝트 설정에 맞게 YOUR_SUPABASE_URL과 YOUR_ANON_KEY를 교체해주세요.
const SUPABASE_URL = 'https://fwuiikhbzxwhxxxdrhaz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0lLh_FgNd-9llsLe3MtvcQ_shBLmYrr';

if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.error('Supabase CDN is not loaded properly.');
}

window.API = {
  /**
   * 1. Data Fetcher
   * 앱 실행(initApp) 시 전체 데이터를 불러와 로컬 DB 객체에 맵핑합니다.
   */
  fetchInitialData: async function() {
    try {
      const [
        { data: users, error: err1 },
        { data: attendance, error: err2 },
        { data: assignments, error: err3 },
        { data: team_logs, error: err4 },
        { data: notifications, error: err5 },
        { data: cal_events, error: err6 }
      ] = await Promise.all([
        window.supabaseClient.from('users').select('*'),
        window.supabaseClient.from('attendance').select('*'),
        window.supabaseClient.from('assignments').select('*'),
        window.supabaseClient.from('team_logs').select('*'),
        window.supabaseClient.from('notifications').select('*'),
        window.supabaseClient.from('cal_events').select('*')
      ]);

      // Supabase 데이터를 로컬 구조체에 할당 (에러가 없는 경우에만)
      DB.users = (users || []).map(u => ({ ...u, studentId: u.student_id, group: u.group_name }));
      DB.attendance = (attendance || []).map(a => ({ ...a, targetGroup: a.target_group }));
      DB.assignments = (assignments || []).map(a => ({
        ...a,
        id: a.id,
        title: a.title,
        date: a.date,
        deadline: a.deadline,
        group: a.group_name || a.group || '전체',
        desc: a.desc_text || a.desc || '',
        formUrl: a.form_url || a.formUrl || '',
        submitCode: a.submit_code || a.submitCode || '',
        submissions: Array.isArray(a.submissions) ? a.submissions : []
      }));
      DB.teamLogs = (team_logs || []).map(l => ({ ...l, group: l.group_name }));
      DB.notifications = (notifications || []).map(n => ({ ...n, userId: n.user_id, isRead: n.is_read, senderName: n.sender_name }));
      DB.calEvents = cal_events || [];

      console.log('✅ Supabase 데이터 Fetch 성공');
    } catch (err) {
      console.error('❌ Supabase 데이터 Fetch 실패:', err);
      toast('데이터를 불러오는데 실패했습니다.', 'err');
    }
  },

  /**
   * 2. Realtime Subscription
   * 데이터베이스 변경 시 화면을 자동 갱신합니다.
   */
  setupRealtime: function() {
    if (window.realtimeChannel || !window.supabaseClient) return;
    
    window.realtimeChannel = window.supabaseClient
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
        // 실시간 변경 시 데이터만 조용히 갱신
        if (typeof window.API.fetchInitialData === 'function') await window.API.fetchInitialData();
        const activePage = document.querySelector('.page.active');
        if (activePage) {
          const pageId = activePage.id.replace('page-', '');
          if (typeof window.goPage === 'function') window.goPage(pageId);
        }
      })
      .subscribe();
  },

  /**
   * 3. CRUD Helpers
   * 각 기능별로 Supabase에 데이터를 쓰거나 수정하는 헬퍼 함수들입니다.
   * 비동기 처리(async/await)이므로 호출부도 리팩토링이 필요합니다.
   */
  
  insertUser: async function(userData) {
    // map to supabase schema
    const dataToInsert = { ...userData, student_id: userData.studentId, group_name: userData.group };
    delete dataToInsert.studentId; delete dataToInsert.group;
    const { data, error } = await window.supabaseClient.from('users').insert([dataToInsert]).select();
    if (error) throw error;
    return data;
  },

  updateUser: async function(userId, updateData) {
    const dataToUpdate = { ...updateData };
    if(dataToUpdate.studentId !== undefined) { dataToUpdate.student_id = dataToUpdate.studentId; delete dataToUpdate.studentId; }
    if(dataToUpdate.group !== undefined) { dataToUpdate.group_name = dataToUpdate.group; delete dataToUpdate.group; }
    
    const { data, error } = await window.supabaseClient.from('users').update(dataToUpdate).eq('id', userId).select();
    if (error) throw error;
    return data;
  },

  addAttendance: async function(attData) {
    const dataToInsert = { ...attData, target_group: attData.targetGroup };
    delete dataToInsert.targetGroup;
    const { data, error } = await window.supabaseClient.from('attendance').insert([dataToInsert]).select();
    if (error) throw error;
    return data;
  },
  
  updateAttendanceRecords: async function(attId, records) {
    const { data, error } = await window.supabaseClient.from('attendance').update({ records }).eq('id', attId).select();
    if (error) throw error;
    return data;
  },

  addAssignment: async function(asgData) {
    const dataToInsert = { ...asgData, group_name: asgData.group, desc_text: asgData.desc };
    delete dataToInsert.group; delete dataToInsert.desc;
    const { data, error } = await window.supabaseClient.from('assignments').insert([dataToInsert]).select();
    if (error) throw error;
    return data;
  },
  
  submitAssignment: async function(asgId, submissionsArray) {
    const { data, error } = await window.supabaseClient.from('assignments').update({ submissions: submissionsArray }).eq('id', asgId).select();
    if (error) throw error;
    return data;
  },

  addTeamLog: async function(logData) {
    const dataToInsert = { ...logData, group_name: logData.group };
    delete dataToInsert.group;
    const { data, error } = await window.supabaseClient.from('team_logs').insert([dataToInsert]).select();
    if (error) throw error;
    return data;
  },

  addCalEvent: async function(eventData) {
    const { data, error } = await window.supabaseClient.from('cal_events').insert([eventData]).select();
    if (error) throw error;
    return data;
  },
  
  deleteCalEvent: async function(eventId) {
    const { error } = await window.supabaseClient.from('cal_events').delete().eq('id', eventId);
    if (error) throw error;
    return true;
  }
};
