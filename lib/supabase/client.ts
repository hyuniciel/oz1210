import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (공개 데이터용)
 *
 * 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * Clerk 인증이 필요한 경우 `useClerkSupabaseClient()` hook을 사용하세요.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   const { data } = await supabase.from('public_table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
