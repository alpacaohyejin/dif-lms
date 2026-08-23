

window.fetchFirestoreData = async function() {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        DB.users = usersSnap.docs.map(doc => {
            const data = doc.data();
            return {
                firebaseId: doc.id,
                id: doc.id,
                name: data.name,
                email: data.id || data.email,
                pw: data.pw,
                studentId: data.studentId,
                dept: data.major || data.dept || '-',
                group: data.group || '',
                studies: data.studies || (data.study ? [data.study] : []),
                rank: data.role,
                status: data.status,
                avatar: data.name ? data.name[0] : '👤'
            };
        });

        if (DB.currentUser) {
            DB.currentUser = DB.users.find(u => u.firebaseId === DB.currentUser.firebaseId) || null;
        }

        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.groups) DB.groups = data.groups;
            if (data.studies) DB.studies = data.studies;
        }

        const asgSnap = await getDocs(collection(db, 'assignments'));
        DB.assignments = asgSnap.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));

        const attSnap = await getDocs(collection(db, 'attendance_records'));
        const allAtt = attSnap.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
        
        const sessions = {};
        allAtt.forEach(att => {
            if (!sessions[att.date]) {
                sessions[att.date] = {
    firebaseId: att.firebaseId,
    id: att.date,
    date: att.date,
    code: att.code || '',
    targetGroup: att.targetGroup || '전체',
    title: att.title || '세미나',
    records: []
};
            }
            if(att.code && !sessions[att.date].code) sessions[att.date].code = att.code;
if(att.targetGroup && sessions[att.date].targetGroup === '전체') sessions[att.date].targetGroup = att.targetGroup;
if (att.status) {
                sessions[att.date].records.push({
                    userId: att.userId,
                    status: att.status,
note: att.reason || '',
code: att.enteredCode || ''
                });
            }
        });
        DB.attendance = Object.values(sessions).sort((a,b) => new Date(a.date) - new Date(b.date));

        const todayStr = new Date().toISOString().split('T')[0];
        if (sessions[todayStr]) {
            DB.todayCode = sessions[todayStr].code || '';
        } else {
            DB.todayCode = '';
        }

        DB.excuses = allAtt.filter(att => att.status === 'pending' || att.status === '사유').map(att => ({
            firebaseId: att.firebaseId,
            id: att.firebaseId,
            userId: att.userId,
            sessionId: att.date,
            date: att.date,
            reason: att.reason || '사유 불참',
            status: att.status === 'pending' ? 'pending' : 'approved',
            submittedAt: att.date
        }));

        const tasksSnap = await getDocs(collection(db, 'tasks'));
        DB.assignments = tasksSnap.docs.map(doc => {
            const data = doc.data();
            return {
                firebaseId: doc.id,
                id: doc.id,
                title: data.title,
                description: data.description || '',
                deadline: data.deadline,
                createdBy: 'admin',
                group: data.group || '전체',
                formLink: data.formLink || '',
                verificationCode: data.verificationCode || '',
                submissions: (data.submissions || []).map(sub => ({
                    userId: sub.userId,
                    submittedAt: sub.timestamp || '',
                    file: sub.file || '구글폼 제출'
                }))
            };
        });

        const noticesSnap = await getDocs(collection(db, 'notices'));
        const oldNotices = noticesSnap.docs.map(doc => ({
            firebaseId: doc.id,
            id: doc.id,
            title: doc.data().title,
            category: '공지',
            group: doc.data().target || '전체',
            content: doc.data().content || '',
            authorId: 'admin',
            createdAt: doc.data().date ? doc.data().date.split('T')[0] : ''
        }));
        DB.teamLogs = oldNotices;

        const eventsSnap = await getDocs(collection(db, 'events'));
        DB.calEvents = eventsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                firebaseId: doc.id,
                id: doc.id,
                date: data.date,
                title: data.title,
                type: data.type || 'bl'
            };
        });
    
        if (!DB.groups) DB.groups = [];
        if (!DB.studies) DB.studies = [];
        if (!DB.users) DB.users = [];
        if (!DB.assignments) DB.assignments = [];
        if (!DB.attendance) DB.attendance = [];
        if (!DB.files) DB.files = [];
        if (!DB.teamLogs) DB.teamLogs = [];
        if (!DB.notifications) DB.notifications = [];
        if (!DB.excuses) DB.excuses = [];
        if (!DB.calEvents) DB.calEvents = [];

    } catch (e) {
        console.error('Fetch Error:', e);
    }
};


window.markNotiRead = async function(id) {
    try { await updateDoc(doc(db, "notifications", id), { read: true }); } catch(e){}
};
window.sendInternalNoti = async function(userId, title, body) {
    try {
        await addDoc(collection(db, "notifications"), {
            userId: userId,
            title: title,
            body: body,
            time: Date.now(),
            read: false
        });
    } catch(e) { console.error("Noti err:", e); }
};
