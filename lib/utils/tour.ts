/**
 * @file tour.ts
 * @description 관광지 관련 유틸리티 함수
 *
 * 관광지 데이터를 처리하고 포맷팅하는 유틸리티 함수들입니다.
 *
 * 주요 기능:
 * - 관광 타입 ID를 타입명으로 변환
 * - 주소 포맷팅
 * - 텍스트 말줄임표 처리
 */

/**
 * 관광 타입 ID와 타입명 매핑
 */
const CONTENT_TYPE_MAP: Record<string, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
} as const;

/**
 * 관광 타입 ID를 타입명으로 변환
 * @param contentTypeId 관광 타입 ID (예: "12", "14")
 * @returns 관광 타입명 (예: "관광지", "문화시설")
 */
export function getContentTypeName(contentTypeId: string): string {
  return CONTENT_TYPE_MAP[contentTypeId] || '기타';
}

/**
 * 관광 타입 ID를 타입명과 색상 정보로 반환
 * @param contentTypeId 관광 타입 ID
 * @returns 타입명과 색상 클래스
 */
export function getContentTypeInfo(contentTypeId: string): {
  name: string;
  colorClass: string;
} {
  const name = getContentTypeName(contentTypeId);
  
  // 타입별 색상 클래스 (Tailwind CSS)
  const colorMap: Record<string, string> = {
    '12': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', // 관광지
    '14': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', // 문화시설
    '15': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', // 축제/행사
    '25': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', // 여행코스
    '28': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', // 레포츠
    '32': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', // 숙박
    '38': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', // 쇼핑
    '39': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', // 음식점
  };

  return {
    name,
    colorClass: colorMap[contentTypeId] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };
}

/**
 * 주소 포맷팅
 * @param addr1 기본 주소
 * @param addr2 상세 주소
 * @returns 포맷팅된 주소 문자열
 */
export function formatAddress(addr1?: string, addr2?: string): string {
  if (!addr1 && !addr2) {
    return '주소 정보 없음';
  }
  
  if (addr1 && addr2) {
    return `${addr1} ${addr2}`;
  }
  
  return addr1 || addr2 || '';
}

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 * @param text 원본 텍스트
 * @param maxLength 최대 길이
 * @returns 잘린 텍스트 (필요시 ... 추가)
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.slice(0, maxLength)}...`;
}

/**
 * HTML 태그 제거 및 텍스트 정리
 * @param html HTML 문자열
 * @returns 순수 텍스트
 */
export function stripHtmlTags(html: string): string {
  if (!html) {
    return '';
  }
  
  // 간단한 HTML 태그 제거
  return html.replace(/<[^>]*>/g, '').trim();
}

