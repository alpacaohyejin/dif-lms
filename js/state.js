const RANKS = ['학회장', '부학회장', '임원진', '학회원'];
const LOG_CATS = ['회의록', '작업 기록', '결정 사항', '공지', '기타'];
const LC_CLS = { '회의록': 'lc-m', '작업 기록': 'lc-w', '결정 사항': 'lc-d', '공지': 'lc-n', '기타': 'lc-e' };

window.attSetupState = { title: '', targetGroup: '전체' };

const DB = { 
  groups: [], 
  studies: ['포토샵 기초', '포토샵 심화+AI', '블렌더 스터디'], 
  files: [], 
  teamLogs: [], 
  notifications: [], 
  excuses: [], 
  currentUser: null,
  currentSem: '2026 2학기',
  semesters: ['2025 1학기', '2025 2학기', '2026 1학기', '2026 2학기'],
  calY: new Date().getFullYear(), 
  calM: new Date().getMonth(),
  calEvents: [
    {id: 1, date: '2026-09-05', title: 'OT', type: 'bl'},
    {id: 2, date: '2026-09-12', title: '1차 세미나', type: 'bl'},
    {id: 3, date: '2026-09-19', title: '2차 세미나', type: 'bl'},
    {id: 4, date: '2026-09-26', title: '3차 세미나', type: 'bl'},
    {id: 5, date: '2026-10-03', title: '개교기념일', type: 're'},
    {id: 6, date: '2026-10-10', title: '중간 발표', type: 'gr'},
    {id: 7, date: '2026-11-07', title: '포트폴리오 마감', type: 'ye'},
    {id: 8, date: '2026-12-05', title: '최종 발표', type: 'gr'},
  ],
  users: [
    {id: 1, name: '김민준', email: 'admin@dif.kr', pw: '1234', studentId: '20210001', dept: '디자인학과', group: '1조', studies: [], rank: '학회장', status: 'active', avatar: '김'},
    {id: 2, name: '이서연', email: 'member@dif.kr', pw: '1234', studentId: '20210042', dept: '시각디자인학과', group: '메인 프로젝트 - 2조', studies: ['포토샵 기초'], rank: '임원진', status: 'active', avatar: '이'},
    {id: 3, name: '박지훈', email: 'test1@dif.kr', pw: '1234', studentId: '20220123', dept: '산업디자인학과', group: '3조', studies: ['블렌더 스터디'], rank: '학회원', status: 'active', avatar: '박'}
  ],
  assignments: [
    {id: 1, title: '디자인 씽킹 리서치', date: '2026-08-10', deadline: '2026-08-17', group: '전체', desc: '주제 선정 및 문제 정의 기획서 제출', 
      submissions: [{userId: 1, date: '2026-08-15', file: 'research_team1.pdf', text: '제출합니다.'}]
    },
    {id: 2, title: 'UI/UX 프로토타이핑', date: '2026-08-15', deadline: '2026-08-22', group: '메인 프로젝트 - 2조', desc: '피그마 프로토타입 링크 제출', submissions: []}
  ],
  attendance: [
    {id: 1, date: '2026-08-20', title: 'OT 및 팀 빌딩', targetGroup: '전체', code: 'DIF26',
      records: [
        {userId: 1, status: '출석'}, {userId: 2, status: '출석'}, {userId: 3, status: '사유', note: '개인 사정'}
      ]
    }
  ],
  mFilter: { name: '', group: '', rank: '', status: '', study: '' }
};
