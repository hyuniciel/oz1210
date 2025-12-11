/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * My Trip 프로젝트의 홈페이지입니다.
 * 관광지 목록, 필터, 검색, 지도 기능을 제공합니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 지역/타입 필터
 * - 키워드 검색
 * - 네이버 지도 연동 (향후 구현)
 *
 * 핵심 구현 로직:
 * - Server Component로 구현하여 초기 로딩 최적화
 * - URL 쿼리 파라미터를 통한 검색/필터 상태 관리
 * - 반응형 레이아웃 (모바일 우선)
 *
 * @dependencies
 * - Next.js 15 App Router (Server Component)
 * - Tailwind CSS v4
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAreaCode, getAreaBasedList, searchKeyword, getDetailPetTour } from '@/lib/api/tour-api';
import { TourList } from '@/components/tour-list';
import { TourFilters } from '@/components/tour-filters';
import { sortTours } from '@/lib/utils/sort';
import { isPetFriendly, matchesPetSizeFilter } from '@/lib/utils/pet';
import { parseFilterParams } from '@/lib/utils/filters';
import type { TourItem, PetTourInfo } from '@/lib/types/tour';
import { Loading } from '@/components/ui/loading';

/**
 * 페이지 메타데이터
 * layout.tsx에 기본 메타데이터가 설정되어 있으므로
 * 필요시 여기서 오버라이드 가능
 */
export const metadata: Metadata = {
  title: '홈',
  description: '전국 관광지 정보를 검색하고 지도에서 확인하세요',
};

interface HomePageProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    page?: string;
    petFriendly?: string;
    petSize?: string;
  }>;
}

/**
 * 홈페이지 컴포넌트
 * Server Component로 구현하여 초기 로딩 최적화
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  // URL 쿼리 파라미터 읽기 (Next.js 15에서는 Promise로 받음)
  const params = await searchParams;
  
  // 필터 파라미터 파싱 (필터 유틸리티 함수 사용)
  const filterParams = parseFilterParams(params);
  const keyword = filterParams.keyword;
  const areaCode = filterParams.areaCode || '1'; // 기본값: 서울
  const contentTypeId = filterParams.contentTypeId;
  const sort = filterParams.sort || 'latest'; // 기본값: 최신순
  const page = filterParams.page || 1;
  const petFriendly = filterParams.petFriendly || false; // 반려동물 필터
  const petSize = filterParams.petSize || []; // 반려동물 크기 필터

  // 지역 목록 로드
  let areas: Awaited<ReturnType<typeof getAreaCode>> = [];
  try {
    areas = await getAreaCode({ numOfRows: 100 });
  } catch (err) {
    console.error('지역 목록 조회 오류:', err);
  }

  // 관광지 데이터 가져오기
  let tours: TourItem[] = [];
  const petInfoMap: Map<string, PetTourInfo | null> = new Map();
  let error: Error | null = null;

  try {
    if (keyword) {
      // 키워드 검색
      const searchResult = await searchKeyword({
        keyword,
        areaCode: areaCode !== '1' ? areaCode : undefined, // 전체 지역이 아니면 필터 적용
        contentTypeId,
        numOfRows: 20,
        pageNo: page,
      });
      tours = searchResult.items;
    } else {
      // 지역 기반 목록 조회
      const listResult = await getAreaBasedList({
        areaCode,
        contentTypeId,
        numOfRows: 20,
        pageNo: page,
      });
      tours = listResult.items;
    }

    // 반려동물 필터가 활성화된 경우, 각 관광지에 대해 반려동물 정보 조회
    if (petFriendly && tours.length > 0) {
      console.log(`[Pet Filter] 반려동물 정보 조회 시작: ${tours.length}개 관광지`);
      
      // 병렬로 반려동물 정보 조회 (최대 20개)
      const petInfoPromises = tours.slice(0, 20).map(async (tour) => {
        try {
          const petInfo = await getDetailPetTour({ contentId: tour.contentid });
          return { contentId: tour.contentid, petInfo };
        } catch (err) {
          // 일부 관광지의 반려동물 정보 조회 실패 시에도 계속 진행
          console.warn(`[Pet Filter] 반려동물 정보 조회 실패 (${tour.contentid}):`, err);
          return { contentId: tour.contentid, petInfo: null };
        }
      });

      const petInfoResults = await Promise.allSettled(petInfoPromises);
      
      // 결과를 Map에 저장
      petInfoResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          petInfoMap.set(result.value.contentId, result.value.petInfo);
        }
      });

      console.log(`[Pet Filter] 반려동물 정보 조회 완료: ${petInfoMap.size}개`);
      
      // 반려동물 동반 가능한 관광지만 필터링
      tours = tours.filter((tour) => {
        const petInfo = petInfoMap.get(tour.contentid);
        const isPet = isPetFriendly(petInfo || null);
        
        // 크기 필터가 선택된 경우 추가 필터링
        if (petSize.length > 0) {
          return isPet && matchesPetSizeFilter(petInfo || null, petSize);
        }
        
        return isPet;
      });

      console.log(`[Pet Filter] 필터링 후 관광지 수: ${tours.length}개`);
    }

    // 정렬 적용 (클라이언트 사이드)
    tours = sortTours(tours, sort as 'latest' | 'name');
  } catch (err) {
    error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
    console.error('관광지 목록 조회 오류:', err);
  }

  return (
    <section className="w-full">
      {/* 메인 컨테이너 - 반응형 설정 */}
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
        {/* 필터 섹션 영역 */}
        <div className="mb-6 md:mb-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <Loading text="필터 로딩 중..." showText />
              </div>
            }
          >
            <TourFilters areas={areas} />
          </Suspense>
        </div>

        {/* 메인 콘텐츠 영역 - 데스크톱: 리스트 + 지도 분할, 모바일: 탭 전환 */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* 관광지 목록 섹션 */}
          {/* TODO: 향후 tour-list 컴포넌트 배치 */}
          <div className="flex-1 lg:w-1/2">
            {/* 검색 키워드 표시 (있는 경우) */}
            {keyword && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  검색 결과: &quot;{keyword}&quot;
                </h2>
              </div>
            )}

            {/* 관광지 목록 컴포넌트 */}
            <TourList
              tours={tours}
              petInfoMap={petInfoMap}
              error={error}
              emptyMessage={
                petFriendly
                  ? '반려동물 동반 가능한 관광지를 찾을 수 없습니다.'
                  : keyword
                    ? `"${keyword}"에 대한 검색 결과가 없습니다.`
                    : '관광지를 찾을 수 없습니다.'
              }
            />
          </div>

          {/* 네이버 지도 섹션 */}
          {/* TODO: 향후 naver-map 컴포넌트 배치 */}
          <div className="hidden lg:block lg:w-1/2">
            {/* 지도 컴포넌트가 여기에 배치됩니다 */}
            <div className="sticky top-20 h-[600px] rounded-lg border bg-muted/50 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">
                지도 영역 (향후 구현)
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 지도 탭 (향후 구현) */}
        {/* TODO: 모바일에서는 탭 형태로 리스트/지도 전환 */}
      </div>
    </section>
  );
}
