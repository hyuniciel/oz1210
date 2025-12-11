/**
 * @file infinite-scroll-trigger.tsx
 * @description 무한 스크롤 트리거 컴포넌트
 *
 * Intersection Observer를 사용하여 사용자가 목록 하단에 도달했을 때
 * 자동으로 다음 페이지를 로드하는 트리거 컴포넌트입니다.
 *
 * 주요 기능:
 * - 뷰포트 진입 감지
 * - 자동 로드 트리거
 * - 로딩 상태 표시
 * - 접근성 지원
 */

'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

/**
 * InfiniteScrollTrigger 컴포넌트의 Props
 */
export interface InfiniteScrollTriggerProps {
  /** 다음 페이지 로드 함수 */
  onLoadMore: () => void | Promise<void>;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** 로딩 중 여부 */
  isLoading: boolean;
}

/**
 * 무한 스크롤 트리거 컴포넌트
 * 목록 하단에 배치하여 사용자가 스크롤할 때 자동으로 다음 페이지를 로드합니다.
 */
export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 더 불러올 데이터가 없거나 로딩 중이면 옵저버 설정하지 않음
    if (!hasMore || isLoading) {
      return;
    }

    const triggerElement = triggerRef.current;
    if (!triggerElement) {
      return;
    }

    // Intersection Observer 설정
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 뷰포트에 진입했고, 로딩 중이 아니고, 더 불러올 데이터가 있으면 로드
        if (entry.isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      {
        root: null, // 뷰포트를 기준으로 감지
        rootMargin: '100px', // 뷰포트 하단 100px 전에 미리 로드
        threshold: 0.1, // 10% 이상 보이면 트리거
      },
    );

    observer.observe(triggerElement);

    // 클린업 함수
    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading]);

  return (
    <div
      ref={triggerRef}
      className="flex items-center justify-center py-8"
      aria-label={hasMore ? '더 불러오기' : '모든 데이터 로드 완료'}
      role="status"
      aria-live="polite"
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <Loading text="더 불러오는 중..." showText />
        </div>
      ) : !hasMore ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm">더 이상 불러올 데이터가 없습니다</p>
        </div>
      ) : null}
    </div>
  );
}

