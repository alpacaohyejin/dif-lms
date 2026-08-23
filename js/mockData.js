window.MOCK_DATA = {
    semesters: [
        { id: '2026-2', name: '2026년 2학기', current: true },
        { id: '2026-1', name: '2026년 1학기', current: false }
    ],
    users: [
        { id: 'admin', pw: 'admin', name: '이임원', studentId: '20230001', major: '시각디자인과', role: '임원진', group: '1조', study: '포토샵' },
        { id: 'user1', pw: 'user1', name: '홍길동', studentId: '20240001', major: '컴퓨터공학과', role: '학회원', group: '1조', study: '일러스트' },
        { id: 'user2', pw: 'user2', name: '김디프', studentId: '20250001', major: '경영학과', role: '학회원', group: '2조', study: '포토샵' }
    ],
    tasks: [
        { id: 1, title: 'UI/UX 기획서 제출', deadline: '2026-08-06', group: '1조', type: 'project' },
        { id: 2, title: '포토샵 1주차 과제', deadline: '2026-08-10', group: '포토샵', type: 'study' },
        { id: 3, title: '전체 공통 과제', deadline: '2026-08-15', group: '전체', type: 'common' }
    ],
    notices: [
        { id: 1, title: '[공지] 이번 주 정규 세션 장소 변경 안내', date: '2026-08-01', author: '이임원' },
        { id: 2, title: '[필독] 2학기 회비 납부 안내', date: '2026-08-02', author: '이임원' }
    ],
    events: [
        { title: '정규 세션', start: '2026-08-06' },
        { title: '기획서 마감', start: '2026-08-06', color: 'red' }
    ]
};
