/**
 * @file app/instruments/page.tsx
 * @description Supabase 공식 문서 예제 페이지 (Instruments)
 *
 * 이 페이지는 Supabase 공식 문서의 예제를 기반으로 작성되었습니다.
 * Supabase에서 데이터를 조회하여 표시하는 기본적인 사용법을 보여줍니다.
 *
 * 주요 기능:
 * 1. Supabase에서 instruments 테이블 데이터 조회
 * 2. Server Component에서 직접 데이터 fetching
 * 3. Suspense를 사용한 로딩 상태 처리
 *
 * 핵심 구현 로직:
 * - createClient()를 async 함수로 호출하여 Supabase 클라이언트 생성
 * - Server Component에서 직접 데이터 fetching (클라이언트 사이드 렌더링 불필요)
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/server: createClient 함수
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs} - Supabase 공식 문서
 */

import { createSupabaseClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createSupabaseClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    console.error("Error fetching instruments:", error);
    return (
      <div className="text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="text-gray-500">
        <p>데이터가 없습니다.</p>
        <p className="text-sm mt-2">
          Supabase SQL Editor에서 다음 SQL을 실행하여 테이블을 생성하세요:
        </p>
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
          {`-- Create the table
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert some sample data
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello');

-- Enable RLS
alter table instruments enable row level security;

-- Create RLS policy
create policy "public can read instruments"
on public.instruments for select
to anon using (true);`}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: { id: number; name: string }) => (
          <li
            key={instrument.id}
            className="p-4 border rounded-lg dark:border-gray-700"
          >
            {instrument.name}
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>참고:</strong> 이 데이터는 Supabase에서 직접 조회되었습니다.
          Server Component에서 데이터를 fetching하므로 클라이언트 사이드 JavaScript가
          필요하지 않습니다.
        </p>
      </div>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase 예제: Instruments</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Supabase 공식 문서의 예제를 기반으로 작성된 페이지입니다.
        </p>

        <Suspense fallback={<div>악기 목록을 불러오는 중...</div>}>
          <InstrumentsData />
        </Suspense>
      </div>
    </div>
  );
}

