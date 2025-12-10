/**
 * @file pet.ts
 * @description 반려동물 관련 유틸리티 함수
 *
 * 반려동물 동반 여행 정보를 처리하고 포맷팅하는 유틸리티 함수들입니다.
 *
 * 주요 기능:
 * - 반려동물 동반 가능 여부 확인
 * - 크기 제한 레이블 변환
 * - 입장 가능 장소 레이블 변환
 */

import type { PetTourInfo } from '@/lib/types/tour';

/**
 * 반려동물 동반 가능 여부 확인
 * @param petInfo 반려동물 정보
 * @returns 동반 가능 여부 (true/false)
 */
export function isPetFriendly(petInfo: PetTourInfo | null): boolean {
  if (!petInfo) {
    return false;
  }
  // chkpetleash가 'Y'이면 동반 가능
  return petInfo.chkpetleash === 'Y';
}

/**
 * 반려동물 크기 제한 레이블 변환
 * @param size 크기 제한 문자열
 * @returns 사용자 친화적인 레이블
 */
export function getPetSizeLabel(size?: string): string {
  if (!size) {
    return '제한 없음';
  }

  const sizeMap: Record<string, string> = {
    '소형': '소형견',
    '중형': '중형견',
    '대형': '대형견',
    '소형견': '소형견',
    '중형견': '중형견',
    '대형견': '대형견',
    '소': '소형견',
    '중': '중형견',
    '대': '대형견',
  };

  // 정확한 매칭 시도
  if (sizeMap[size]) {
    return sizeMap[size];
  }

  // 부분 매칭 시도
  const lowerSize = size.toLowerCase();
  for (const [key, value] of Object.entries(sizeMap)) {
    if (lowerSize.includes(key.toLowerCase())) {
      return value;
    }
  }

  // 매칭되지 않으면 원본 반환
  return size;
}

/**
 * 입장 가능 장소 레이블 변환
 * @param place 입장 가능 장소 문자열
 * @returns 사용자 친화적인 레이블
 */
export function getPetPlaceLabel(place?: string): string {
  if (!place) {
    return '정보 없음';
  }

  const placeMap: Record<string, string> = {
    '실내': '실내 가능',
    '실외': '실외 가능',
    '실내외': '실내/실외 가능',
    '실내,실외': '실내/실외 가능',
    '실외,실내': '실내/실외 가능',
  };

  // 정확한 매칭 시도
  if (placeMap[place]) {
    return placeMap[place];
  }

  // 부분 매칭 시도
  const lowerPlace = place.toLowerCase();
  if (lowerPlace.includes('실내') && lowerPlace.includes('실외')) {
    return '실내/실외 가능';
  }
  if (lowerPlace.includes('실내')) {
    return '실내 가능';
  }
  if (lowerPlace.includes('실외')) {
    return '실외 가능';
  }

  // 매칭되지 않으면 원본 반환
  return place;
}

/**
 * 반려동물 크기가 필터 조건과 일치하는지 확인
 * @param petInfo 반려동물 정보
 * @param filterSizes 필터링할 크기 배열 (예: ['소형', '중형'])
 * @returns 일치 여부
 */
export function matchesPetSizeFilter(
  petInfo: PetTourInfo | null,
  filterSizes: string[],
): boolean {
  if (!petInfo || !isPetFriendly(petInfo)) {
    return false;
  }

  if (filterSizes.length === 0) {
    return true; // 크기 필터가 없으면 모든 크기 허용
  }

  const petSize = petInfo.chkpetsize;
  if (!petSize) {
    return false; // 크기 정보가 없으면 필터링에서 제외
  }

  // 필터 크기와 일치하는지 확인
  return filterSizes.some((filterSize) => {
    const normalizedPetSize = petSize.toLowerCase();
    const normalizedFilterSize = filterSize.toLowerCase();
    return (
      normalizedPetSize.includes(normalizedFilterSize) ||
      normalizedFilterSize.includes(normalizedPetSize)
    );
  });
}

/**
 * 반려동물 정보 요약 텍스트 생성
 * @param petInfo 반려동물 정보
 * @returns 요약 텍스트 (예: "소형견 가능, 실내/실외")
 */
export function getPetInfoSummary(petInfo: PetTourInfo | null): string {
  if (!petInfo || !isPetFriendly(petInfo)) {
    return '';
  }

  const parts: string[] = [];

  // 크기 정보
  if (petInfo.chkpetsize) {
    parts.push(getPetSizeLabel(petInfo.chkpetsize));
  }

  // 입장 가능 장소
  if (petInfo.chkpetplace) {
    parts.push(getPetPlaceLabel(petInfo.chkpetplace));
  }

  return parts.join(', ');
}

