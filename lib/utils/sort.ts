/**
 * @file sort.ts
 * @description 관광지 정렬 유틸리티 함수
 *
 * 관광지 목록을 다양한 기준으로 정렬하는 함수들입니다.
 * API가 정렬을 지원하지 않을 경우 클라이언트 사이드에서 정렬을 수행합니다.
 */

import type { TourItem } from '@/lib/types/tour';

/**
 * 관광지를 최신순으로 정렬 (modifiedtime 기준 내림차순)
 * @param tours 관광지 목록
 * @returns 정렬된 관광지 목록
 */
export function sortToursByLatest(tours: TourItem[]): TourItem[] {
  return [...tours].sort((a, b) => {
    const timeA = new Date(a.modifiedtime || 0).getTime();
    const timeB = new Date(b.modifiedtime || 0).getTime();
    return timeB - timeA; // 내림차순 (최신순)
  });
}

/**
 * 관광지를 이름순으로 정렬 (title 기준 오름차순, 가나다순)
 * @param tours 관광지 목록
 * @returns 정렬된 관광지 목록
 */
export function sortToursByName(tours: TourItem[]): TourItem[] {
  return [...tours].sort((a, b) => {
    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB, 'ko'); // 한국어 오름차순 정렬
  });
}

/**
 * 정렬 옵션에 따라 관광지 목록 정렬
 * @param tours 관광지 목록
 * @param sortOption 정렬 옵션 ('latest' | 'name')
 * @returns 정렬된 관광지 목록
 */
export function sortTours(
  tours: TourItem[],
  sortOption: 'latest' | 'name' = 'latest',
): TourItem[] {
  switch (sortOption) {
    case 'name':
      return sortToursByName(tours);
    case 'latest':
    default:
      return sortToursByLatest(tours);
  }
}

