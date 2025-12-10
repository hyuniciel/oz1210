import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Supabase 클라이언트 생성 (Supabase 공식 문서 패턴)
 *
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * Supabase 공식 문서 패턴을 따르면서 Clerk 통합을 유지합니다:
 * - JWT 템플릿 불필요 (2025년 4월 이후 권장 방식)
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 * - async 함수로 구현하여 Server Component에서 await 사용 가능
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server'
 *
 * import { createSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function addItem(name: string) {
 *   const supabase = await createSupabaseClient();
 *   const { data, error } = await supabase.from('items').insert({ name });
 *   return { data, error };
 * }
 * ```
 */
export async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken() ?? null;
    },
  });
}

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (동기 버전)
 *
 * @deprecated Use `createSupabaseClient()` instead. This function is kept for backward compatibility.
 * For new code, use the async `createSupabaseClient()` function which follows Supabase official patterns.
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken() ?? null;
    },
  });
}
