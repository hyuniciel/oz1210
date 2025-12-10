/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩, 빈 상태, 에러 상태를 처리합니다.
 *
 * 주요 기능:
 * - 그리드 레이아웃으로 관광지 카드 표시
 * - 로딩 상태 (Skeleton UI)
 * - 빈 상태 처리
 * - 에러 상태 처리
 *
 * 핵심 구현 로직:
 * - 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열)
 * - TourCard 컴포넌트 재사용
 * - 상태별 UI 표시
 *
 * @dependencies
 * - components/tour-card: TourCard 컴포넌트
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - components/ui/error: Error 컴포넌트
 * - lib/types/tour: TourItem 타입
 */

import { Search } from 'lucide-react';
import type { TourItem } from '@/lib/types/tour';
import { TourCard } from '@/components/tour-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Error } from '@/components/ui/error';

export interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 에러 재시도 콜백 */
  onRetry?: () => void;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
}

/**
 * 관광지 목록 스켈레톤 컴포넌트
 */
function TourListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* 이미지 스켈레톤 */}
          <Skeleton className="w-full aspect-video" />
          {/* 정보 영역 스켈레톤 */}
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">
        {message || '관광지를 찾을 수 없습니다'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        다른 검색어나 필터를 시도해보세요.
      </p>
    </div>
  );
}

/**
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage,
}: TourListProps) {
  // 에러 상태
  if (error) {
    return (
      <Error
        message="관광지 목록을 불러오는 중 오류가 발생했습니다."
        type="server"
        showRetry={!!onRetry}
        onRetry={onRetry}
      />
    );
  }

  // 로딩 상태
  if (isLoading) {
    return <TourListSkeleton />;
  }

  // 빈 상태
  if (tours.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // 목록 표시
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

