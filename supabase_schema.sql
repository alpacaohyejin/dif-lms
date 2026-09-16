-- 1. users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pw TEXT NOT NULL,
  student_id TEXT,
  dept TEXT,
  group_name TEXT,
  rank TEXT,
  status TEXT DEFAULT 'pending',
  avatar TEXT,
  studies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  target_group TEXT,
  code TEXT,
  records JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT,
  deadline TIMESTAMPTZ,
  group_name TEXT,
  desc_text TEXT,
  submissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. team_logs
CREATE TABLE team_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  cat TEXT,
  group_name TEXT,
  author TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  sender_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. Migration: users 컬럼 보강 및 마이그레이션
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS sid TEXT DEFAULT '';

-- 기존에 student_id로 데이터가 들어가 있다면 sid로 복사
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'student_id'
  ) THEN
    UPDATE public.users SET sid = student_id WHERE sid IS NULL OR sid = '';
  END IF;
END $$;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS major TEXT DEFAULT '';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT '학회원';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "group" TEXT DEFAULT '전체';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '활동중';

-- PostgREST 스키마 캐시 강제 리로드
NOTIFY pgrst, 'reload schema';
-- 8. 비활성화된 기존 회원 즉시 복구 (상태 초기화 버그 픽스용)
-- status가 비어있거나 NULL, 또는 비활성화 상태인 학회원들을 모두 '활동중'으로 복구
UPDATE public.users 
SET status = '활동중' 
WHERE status IS NULL OR status = '' OR status = '비활성' OR status = '비활성화';

-- 9. users 테이블의 가능한 모든 승인/상태 컬럼을 활동/승인 상태로 업데이트 (강제 복구 픽스)
DO $$
BEGIN
  -- 1. status 컬럼 업데이트
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='status') THEN
    UPDATE public.users SET status = '활동중';
  END IF;

  -- 2. state 컬럼이 있다면 업데이트
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='state') THEN
    UPDATE public.users SET state = '활동중';
  END IF;

  -- 3. approved 컬럼이 있다면 true로 승인 처리
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='approved') THEN
    UPDATE public.users SET approved = true;
  END IF;

  -- 4. is_active 컬럼이 있다면 true로 활성화
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='is_active') THEN
    UPDATE public.users SET is_active = true;
  END IF;
END $$;

-- 10. users 테이블에 프로젝트 조와 스터디 컬럼 추가 및 기존 데이터 마이그레이션
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS project_group TEXT DEFAULT '미지정';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS study_group TEXT DEFAULT '스터디 없음';

-- 기존 group 컬럼에 저장된 값이 있다면 적절히 복사
UPDATE public.users 
SET project_group = "group" 
WHERE ("group" LIKE '%프로젝트%' OR "group" LIKE '%조%') AND (project_group IS NULL OR project_group = '미지정');

UPDATE public.users 
SET study_group = "group" 
WHERE "group" LIKE '%스터디%' AND (study_group IS NULL OR study_group = '스터디 없음');

-- PostgREST 캐시 갱신
-- PostgREST 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 11. users 테이블의 sid 및 password에 섞인 앞뒤 공백과 개행문자 일괄 제거 (로그인 버그 방지)
UPDATE public.users 
SET 
  sid = TRIM(BOTH FROM sid),
  password = TRIM(BOTH FROM password)
WHERE sid IS NOT NULL;

-- 12. 특정 계정(gaintmt02) 복구 쿼리
-- email 컬럼이 없다면 생성
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';

-- 해당 계정의 공백 및 비밀번호를 안전한 문자열 '000000'으로 확정 업데이트
UPDATE public.users 
SET 
  password = '000000',
  status = '활동중'
WHERE 
  sid ILIKE '%gaintmt02%' 
  OR email ILIKE '%gaintmt02%' 
  OR name ILIKE '%gaintmt02%';

-- 현재 DB에 어떻게 저장되어 있는지 결과 확인
SELECT id, name, sid, email, password, status 
FROM public.users 
WHERE sid ILIKE '%gaintmt02%' OR email ILIKE '%gaintmt02%';
