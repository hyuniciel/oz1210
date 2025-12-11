/**
 * @file areas.ts
 * @description 기본 지역 목록 상수
 *
 * 에러 발생 시 fallback으로 사용할 기본 지역 목록입니다.
 * 한국관광공사 API의 지역 코드와 일치하도록 작성되었습니다.
 */

import type { AreaCode } from '@/lib/types/tour';

/**
 * 기본 지역 목록 (에러 처리용)
 * 주요 시/도 지역 코드 및 이름
 */
export const DEFAULT_AREAS: AreaCode[] = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
];

