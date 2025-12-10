/**
 * @file content-types.ts
 * @description 관광 타입 상수 정의
 *
 * 한국관광공사 API의 관광 타입 ID와 타입명을 정의합니다.
 * lib/utils/tour.ts의 CONTENT_TYPE_MAP과 일치하도록 작성되었습니다.
 */

/**
 * 관광 타입 정보
 */
export interface ContentType {
  /** 관광 타입 ID (API에서 사용) */
  id: string;
  /** 관광 타입명 (한글) */
  name: string;
  /** 표시용 레이블 */
  label: string;
}

/**
 * 관광 타입 목록
 * lib/utils/tour.ts의 CONTENT_TYPE_MAP과 일치
 */
export const CONTENT_TYPES: ContentType[] = [
  { id: '12', name: '관광지', label: '관광지' },
  { id: '14', name: '문화시설', label: '문화시설' },
  { id: '15', name: '축제/행사', label: '축제/행사' },
  { id: '25', name: '여행코스', label: '여행코스' },
  { id: '28', name: '레포츠', label: '레포츠' },
  { id: '32', name: '숙박', label: '숙박' },
  { id: '38', name: '쇼핑', label: '쇼핑' },
  { id: '39', name: '음식점', label: '음식점' },
] as const;

/**
 * 관광 타입 ID로 타입 정보 찾기
 * @param id 관광 타입 ID
 * @returns 관광 타입 정보 또는 undefined
 */
export function getContentTypeById(id: string): ContentType | undefined {
  return CONTENT_TYPES.find((type) => type.id === id);
}

/**
 * 모든 관광 타입 ID 배열
 */
export const CONTENT_TYPE_IDS = CONTENT_TYPES.map((type) => type.id) as readonly string[];

