/**
 * @file app/tasks/page.tsx
 * @description Clerk + Supabase 통합 예제 페이지 (Tasks)
 *
 * 이 페이지는 Clerk 공식 문서의 예제를 기반으로 작성되었습니다.
 * Clerk 세션 토큰을 사용하여 Supabase RLS 정책으로 보호된 데이터에 접근합니다.
 *
 * 주요 기능:
 * 1. 사용자별 작업 목록 조회 (RLS 정책으로 자신의 작업만 표시)
 * 2. 새 작업 추가 (RLS 정책으로 자신의 작업만 추가 가능)
 *
 * 핵심 구현 로직:
 * - useClerkSupabaseClient()를 사용하여 Clerk 토큰이 포함된 Supabase 클라이언트 생성
 * - RLS 정책이 auth.jwt()->>'sub'로 Clerk user ID를 확인하여 데이터 접근 제어
 *
 * @dependencies
 * - @clerk/nextjs: useSession, useUser hooks
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/clerk-client: useClerkSupabaseClient hook
 */

"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  name: string;
  user_id: string;
  created_at?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Clerk hooks
  const { user } = useUser();
  const { session } = useSession();

  // Create Supabase client with Clerk session token
  const supabase = useClerkSupabaseClient();

  // Load tasks when user is available
  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tasks").select();

        if (error) {
          console.error("Error loading tasks:", error);
          return;
        }

        setTasks(data || []);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, supabase]);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        name: name.trim(),
      });

      if (error) {
        console.error("Error creating task:", error);
        alert(`작업 생성 실패: ${error.message}`);
        return;
      }

      // Reload tasks
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select();

      if (!fetchError && data) {
        setTasks(data);
      }

      setName("");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("작업 생성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">작업 관리</h1>
          <p className="text-gray-600 dark:text-gray-400">
            작업을 관리하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">작업 관리</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Clerk + Supabase 통합 예제입니다. RLS 정책으로 보호된 데이터에
          접근합니다.
        </p>

        {loading && <p className="text-gray-500">로딩 중...</p>}

        {!loading && tasks.length > 0 && (
          <div className="space-y-2 mb-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg dark:border-gray-700"
              >
                <p className="font-medium">{task.name}</p>
                {task.created_at && (
                  <p className="text-sm text-gray-500 mt-1">
                    생성일: {new Date(task.created_at).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-gray-500 mb-6">작업이 없습니다.</p>
        )}

        <form onSubmit={createTask} className="flex gap-2">
          <Input
            type="text"
            name="name"
            placeholder="새 작업 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "추가 중..." : "추가"}
          </Button>
        </form>
      </div>
    </div>
  );
}

