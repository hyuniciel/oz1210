-- Tasks 테이블 생성
-- Clerk + Supabase 통합 예제를 위한 테이블
-- RLS 정책으로 사용자가 자신의 작업만 조회/생성할 수 있도록 제한

CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- Row Level Security (RLS) 활성화
-- 개발 단계에서는 비활성화할 수 있으나, 프로덕션에서는 활성화 필수
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 작업만 조회 가능
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = (user_id)::text
);

-- INSERT 정책: 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = (user_id)::text
);

-- UPDATE 정책: 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = (user_id)::text
)
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = (user_id)::text
);

-- DELETE 정책: 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = (user_id)::text
);

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

