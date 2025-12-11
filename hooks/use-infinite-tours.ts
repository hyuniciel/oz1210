/**
 * @file use-infinite-tours.ts
 * @description 무한 스크롤을 위한 관광지 목록 관리 Hook
 *
 * 관광지 목록의 무한 스크롤 상태를 관리하는 커스텀 Hook입니다.
 * 초기 데이터를 받아서 관리하고, 추가 페이지를 로드하는 기능을 제공합니다.
 *
 * 주요 기능:
 * - 초기 데이터 관리
 * - 추가 페이지 로드
 * - 필터/검색 변경 시 초기화
 * - 로딩 및 에러 상태 관리
 */

'use client';

import { useState, useCallback } from 'react';
import { loadMoreTours, type LoadMoreToursParams } from '@/actions/load-tours';
import type { TourItem, PetTourInfo } from '@/lib/types/tour';

/**
 * useInfiniteTours Hook의 파라미터
 */
export interface UseInfiniteToursParams {
  /** 초기 관광지 목록 */
  initialTours: TourItem[];
  /** 초기 전체 개수 */
  initialTotalCount: number;
  /** 초기 반려동물 정보 Map */
  initialPetInfoMap?: Map<string, PetTourInfo | null>;
}

/**
 * useInfiniteTours Hook의 반환값
 */
export interface UseInfiniteToursReturn {
  /** 누적된 모든 관광지 목록 */
  tours: TourItem[];
  /** 반려동물 정보 Map */
  petInfoMap: Map<string, PetTourInfo | null>;
  /** 다음 페이지 로드 함수 */
  loadMore: () => Promise<void>;
  /** 초기화 함수 (필터/검색 변경 시 사용) */
  reset: (newData: UseInfiniteToursParams) => void;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** 에러 상태 */
  error: Error | null;
}

/**
 * 무한 스크롤을 위한 관광지 목록 관리 Hook
 * @param params 초기 데이터
 * @returns 관광지 목록 및 제어 함수들
 */
export function useInfiniteTours(
  params: UseInfiniteToursParams,
): UseInfiniteToursReturn {
  const { initialTours, initialTotalCount, initialPetInfoMap = new Map() } = params;

  // 상태 관리
  const [allTours, setAllTours] = useState<TourItem[]>(initialTours);
  const [petInfoMap, setPetInfoMap] = useState<Map<string, PetTourInfo | null>>(
    initialPetInfoMap,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 더 불러올 데이터가 있는지 확인
  const numOfRows = 20;
  const hasMore = currentPage * numOfRows < totalCount;

  /**
   * 다음 페이지 로드
   */
  const loadMore = useCallback(async () => {
    // 이미 로딩 중이거나 더 불러올 데이터가 없으면 중단
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 현재 URL 파라미터에서 필터 정보 가져오기
      const searchParams = new URLSearchParams(window.location.search);
      const areaCode = searchParams.get('areaCode') || '1';
      const contentTypeId = searchParams.get('contentTypeId') || undefined;
      const keyword = searchParams.get('keyword') || undefined;
      const petFriendly = searchParams.get('petFriendly') === 'true';
      const petSize = searchParams.get('petSize')
        ? searchParams.get('petSize')!.split(',').filter(Boolean)
        : undefined;
      const sort = (searchParams.get('sort') as 'latest' | 'name') || 'latest';

      const loadParams: LoadMoreToursParams = {
        pageNo: currentPage + 1,
        areaCode,
        contentTypeId,
        keyword,
        petFriendly,
        petSize,
        sort,
      };

      const result = await loadMoreTours(loadParams);

      // 새 항목 추가
      setAllTours((prev) => [...prev, ...result.items]);

      // 반려동물 정보 Map 업데이트 (배열을 Map으로 변환)
      setPetInfoMap((prev) => {
        const newMap = new Map(prev);
        // result.petInfoMap은 배열 형태이므로 Map으로 변환
        const petInfoMapFromArray = new Map(result.petInfoMap);
        petInfoMapFromArray.forEach((petInfo, contentId) => {
          newMap.set(contentId, petInfo);
        });
        return newMap;
      });

      // 페이지 및 전체 개수 업데이트
      setCurrentPage(result.hasMore ? currentPage + 1 : currentPage + 1);
      setTotalCount(result.totalCount);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      console.error('[useInfiniteTours] 페이지 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, hasMore]);

  /**
   * 초기화 함수 (필터/검색 변경 시 호출)
   */
  const reset = useCallback((newData: UseInfiniteToursParams) => {
    setAllTours(newData.initialTours);
    setPetInfoMap(newData.initialPetInfoMap || new Map());
    setCurrentPage(1);
    setTotalCount(newData.initialTotalCount);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    tours: allTours,
    petInfoMap,
    loadMore,
    reset,
    isLoading,
    hasMore,
    error,
  };
}

