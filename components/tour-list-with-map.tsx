/**
 * @file tour-list-with-map.tsx
 * @description 관광지 목록과 지도를 함께 표시하는 컴포넌트
 *
 * 모바일에서는 탭으로 전환하고, 데스크톱에서는 분할 레이아웃으로 표시합니다.
 * 지도-리스트 연동 기능을 포함합니다.
 *
 * 주요 기능:
 * - 반응형 레이아웃 (모바일: 탭, 데스크톱: 분할)
 * - 지도-리스트 연동 (선택된 관광지 강조)
 *
 * @dependencies
 * - components/tour-list: TourList 컴포넌트
 * - components/naver-map: NaverMap 컴포넌트
 * - components/ui/tabs: Tabs 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TourList } from '@/components/tour-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfiniteTours } from '@/hooks/use-infinite-tours';
import type { TourItem, PetTourInfo } from '@/lib/types/tour';

// 네이버 지도 컴포넌트 지연 로딩
const NaverMap = dynamic(() => import('@/components/naver-map').then((mod) => ({ default: mod.NaverMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-lg border bg-muted/50 flex items-center justify-center">
      <div className="text-sm text-muted-foreground">지도 로딩 중...</div>
    </div>
  ),
});

interface TourListWithMapProps {
  /** 초기 관광지 목록 */
  tours: TourItem[];
  /** 초기 반려동물 정보 Map */
  petInfoMap?: Map<string, PetTourInfo | null>;
  /** 초기 전체 개수 */
  initialTotalCount: number;
  /** 에러 상태 */
  error?: Error | null;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 검색 키워드 (검색 결과 개수 표시용) */
  keyword?: string;
}

/**
 * 관광지 목록과 지도를 함께 표시하는 컴포넌트
 */
export function TourListWithMap({
  tours: initialTours,
  petInfoMap: initialPetInfoMap = new Map(),
  initialTotalCount,
  error,
  emptyMessage,
  keyword,
}: TourListWithMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTourId = searchParams.get('selectedTourId') || undefined;
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  // 무한 스크롤 Hook 사용
  const {
    tours,
    petInfoMap,
    loadMore,
    reset,
    isLoading: isLoadingMore,
    hasMore,
    error: loadMoreError,
  } = useInfiniteTours({
    initialTours,
    initialTotalCount,
    initialPetInfoMap,
  });

  // 필터/검색 변경 감지하여 초기화
  useEffect(() => {
    const areaCode = searchParams.get('areaCode') || '1';
    const contentTypeId = searchParams.get('contentTypeId') || undefined;
    const currentKeyword = searchParams.get('keyword') || undefined;
    const petFriendly = searchParams.get('petFriendly') === 'true';
    const petSize = searchParams.get('petSize')
      ? searchParams.get('petSize')!.split(',').filter(Boolean)
      : undefined;
    const sort = (searchParams.get('sort') as 'latest' | 'name') || 'latest';

    // 초기 데이터로 리셋 (필터/검색이 변경되었을 때)
    reset({
      initialTours,
      initialTotalCount,
      initialPetInfoMap,
    });
  }, [
    searchParams.get('areaCode'),
    searchParams.get('contentTypeId'),
    searchParams.get('keyword'),
    searchParams.get('petFriendly'),
    searchParams.get('petSize'),
    searchParams.get('sort'),
    reset,
    initialTours,
    initialTotalCount,
    initialPetInfoMap,
  ]);

  // 에러 처리 (초기 에러 또는 로드 에러)
  const displayError = error || loadMoreError;

  // 마커 클릭 시 선택된 관광지 ID를 URL에 추가
  const handleMarkerClick = (tourId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('selectedTourId', tourId);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // 리스트 항목 클릭 시 선택된 관광지 ID를 URL에 추가
  const handleTourClick = (tourId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('selectedTourId', tourId);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* 모바일: 탭 형태 */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'map')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="list" className="flex-1">
              목록 ({tours.length})
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1">
              지도
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-0">
            {/* 검색 키워드 및 결과 개수 표시 */}
            {keyword && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  &quot;{keyword}&quot; 검색 결과: {tours.length}개
                </h2>
              </div>
            )}
            <TourList
              tours={tours}
              petInfoMap={petInfoMap}
              error={displayError}
              emptyMessage={emptyMessage}
              selectedTourId={selectedTourId}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
            />
          </TabsContent>
          <TabsContent value="map" className="mt-0">
            <div className="h-[400px] rounded-lg overflow-hidden">
              <NaverMap
                tours={tours}
                selectedTourId={selectedTourId}
                onMarkerClick={handleMarkerClick}
                className="h-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 데스크톱: 분할 레이아웃 */}
      <div className="hidden lg:flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* 관광지 목록 섹션 */}
        <div className="flex-1 lg:w-1/2">
          {/* 검색 키워드 및 결과 개수 표시 */}
          {keyword && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                &quot;{keyword}&quot; 검색 결과: {tours.length}개
              </h2>
            </div>
          )}
          <TourList
            tours={tours}
            petInfoMap={petInfoMap}
            error={displayError}
            emptyMessage={emptyMessage}
            selectedTourId={selectedTourId}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        </div>

        {/* 네이버 지도 섹션 */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="sticky top-20">
            <NaverMap
              tours={tours}
              selectedTourId={selectedTourId}
              onMarkerClick={handleMarkerClick}
              className="h-[600px]"
            />
          </div>
        </div>
      </div>
    </>
  );
}

