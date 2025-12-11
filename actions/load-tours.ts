/**
 * @file load-tours.ts
 * @description 관광지 목록 추가 로드를 위한 Server Action
 *
 * 무한 스크롤을 위해 다음 페이지의 관광지 목록을 로드하는 Server Action입니다.
 * 필터, 검색, 반려동물 필터링, 정렬을 모두 지원합니다.
 *
 * 주요 기능:
 * - 페이지네이션 지원 (pageNo 파라미터)
 * - 필터 및 검색 파라미터 처리
 * - 반려동물 필터링 및 크기 필터링
 * - 클라이언트 사이드 정렬
 */

'use server';

import { getAreaBasedList, searchKeyword, getDetailPetTour } from '@/lib/api/tour-api';
import { sortTours } from '@/lib/utils/sort';
import { isPetFriendly, matchesPetSizeFilter } from '@/lib/utils/pet';
import type { TourItem, PetTourInfo } from '@/lib/types/tour';

/**
 * 추가 페이지 로드 파라미터 인터페이스
 */
export interface LoadMoreToursParams {
  /** 페이지 번호 */
  pageNo: number;
  /** 지역 코드 */
  areaCode?: string;
  /** 관광 타입 ID */
  contentTypeId?: string;
  /** 검색 키워드 */
  keyword?: string;
  /** 반려동물 동반 가능 여부 */
  petFriendly?: boolean;
  /** 반려동물 크기 배열 */
  petSize?: string[];
  /** 정렬 옵션 */
  sort?: 'latest' | 'name';
}

/**
 * 추가 페이지 로드 결과 인터페이스
 */
export interface LoadMoreToursResult {
  /** 관광지 목록 */
  items: TourItem[];
  /** 반려동물 정보 Map (JSON 직렬화 가능한 형태) */
  petInfoMap: Array<[string, PetTourInfo | null]>;
  /** 전체 개수 */
  totalCount: number;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
}

/**
 * 추가 페이지의 관광지 목록을 로드하는 Server Action
 * @param params 로드 파라미터
 * @returns 관광지 목록 및 페이지네이션 정보
 */
export async function loadMoreTours(
  params: LoadMoreToursParams,
): Promise<LoadMoreToursResult> {
  const {
    pageNo,
    areaCode = '1',
    contentTypeId,
    keyword,
    petFriendly = false,
    petSize = [],
    sort = 'latest',
  } = params;

  const numOfRows = 20; // 페이지당 항목 수

  try {
    let tours: TourItem[] = [];
    let totalCount = 0;
    const petInfoMap = new Map<string, PetTourInfo | null>();

    // API 호출
    if (keyword) {
      // 키워드 검색
      const searchResult = await searchKeyword({
        keyword,
        areaCode: areaCode !== '1' ? areaCode : undefined,
        contentTypeId,
        numOfRows,
        pageNo,
      });
      tours = searchResult.items;
      totalCount = searchResult.totalCount;
    } else {
      // 지역 기반 목록 조회
      const listResult = await getAreaBasedList({
        areaCode,
        contentTypeId,
        numOfRows,
        pageNo,
      });
      tours = listResult.items;
      totalCount = listResult.totalCount;
    }

    // 반려동물 필터가 활성화된 경우, 각 관광지에 대해 반려동물 정보 조회
    if (petFriendly && tours.length > 0) {
      console.log(`[Load More] 반려동물 정보 조회 시작: ${tours.length}개 관광지`);

      // 병렬로 반려동물 정보 조회
      const petInfoPromises = tours.map(async (tour) => {
        try {
          const petInfo = await getDetailPetTour({ contentId: tour.contentid });
          return { contentId: tour.contentid, petInfo };
        } catch (err) {
          // 일부 관광지의 반려동물 정보 조회 실패 시에도 계속 진행
          console.warn(`[Load More] 반려동물 정보 조회 실패 (${tour.contentid}):`, err);
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

      console.log(`[Load More] 반려동물 정보 조회 완료: ${petInfoMap.size}개`);

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

      console.log(`[Load More] 필터링 후 관광지 수: ${tours.length}개`);
    }

    // 정렬 적용 (클라이언트 사이드)
    tours = sortTours(tours, sort);

    // 더 불러올 데이터가 있는지 확인
    const hasMore = pageNo * numOfRows < totalCount;

    // Map을 배열로 변환하여 직렬화 가능하게 만듦
    const petInfoMapArray: Array<[string, PetTourInfo | null]> = Array.from(petInfoMap.entries());

    return {
      items: tours,
      petInfoMap: petInfoMapArray,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error('[Load More] 관광지 목록 조회 오류:', error);
    throw new Error('관광지 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

