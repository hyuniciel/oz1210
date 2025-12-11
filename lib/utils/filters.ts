/**
 * @file filters.ts
 * @description 필터 전용 로직 유틸리티 함수
 *
 * 필터 파라미터 파싱, 빌드, 상태 관리를 위한 유틸리티 함수들입니다.
 * 필터 관련 로직을 중앙화하여 재사용성과 유지보수성을 향상시킵니다.
 *
 * 주요 기능:
 * - 필터 파라미터 타입 정의
 * - URL 파라미터 파싱 및 빌드
 * - 필터 상태 관리 (병합, 리셋)
 * - 필터 기본값 관리
 */

/**
 * 필터 파라미터 인터페이스
 */
export interface FilterParams {
  /** 지역 코드 (기본값: '1' - 서울) */
  areaCode?: string;
  /** 관광 타입 ID */
  contentTypeId?: string;
  /** 정렬 옵션 ('latest' | 'name') */
  sort?: 'latest' | 'name';
  /** 반려동물 동반 가능 여부 */
  petFriendly?: boolean;
  /** 반려동물 크기 배열 (소형견, 중형견, 대형견) */
  petSize?: string[];
  /** 검색 키워드 */
  keyword?: string;
  /** 페이지 번호 */
  page?: number;
}

/**
 * 필터 기본값 상수
 */
export const DEFAULT_FILTERS = {
  areaCode: '1', // 서울
  sort: 'latest' as const,
  page: 1,
} as const;

/**
 * URL 파라미터를 FilterParams 객체로 파싱
 * @param params URLSearchParams 또는 Record<string, string | undefined>
 * @returns FilterParams 객체
 */
export function parseFilterParams(
  params: URLSearchParams | Record<string, string | undefined>,
): FilterParams {
  const getParam = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || undefined;
    }
    return params[key];
  };

  const areaCode = getParam('areaCode') || DEFAULT_FILTERS.areaCode;
  const contentTypeId = getParam('contentTypeId');
  const sort = (getParam('sort') as 'latest' | 'name') || DEFAULT_FILTERS.sort;
  const petFriendly = getParam('petFriendly') === 'true';
  const petSize = getParam('petSize')
    ? getParam('petSize')!.split(',').filter(Boolean)
    : undefined;
  const keyword = getParam('keyword');
  const page = getParam('page') ? parseInt(getParam('page')!, 10) : DEFAULT_FILTERS.page;

  return {
    areaCode,
    contentTypeId,
    sort,
    petFriendly: petFriendly || undefined,
    petSize,
    keyword,
    page,
  };
}

/**
 * FilterParams 객체를 URLSearchParams로 변환
 * @param filters FilterParams 객체
 * @param options 옵션 (keepDefaults: 기본값도 URL에 포함할지 여부)
 * @returns URLSearchParams 객체
 */
export function buildFilterParams(
  filters: Partial<FilterParams>,
  options?: { keepDefaults?: boolean },
): URLSearchParams {
  const params = new URLSearchParams();
  const { keepDefaults = false } = options || {};

  // areaCode 처리
  if (filters.areaCode) {
    if (keepDefaults || filters.areaCode !== DEFAULT_FILTERS.areaCode) {
      params.set('areaCode', filters.areaCode);
    }
  }

  // contentTypeId 처리
  if (filters.contentTypeId) {
    params.set('contentTypeId', filters.contentTypeId);
  }

  // sort 처리
  if (filters.sort) {
    if (keepDefaults || filters.sort !== DEFAULT_FILTERS.sort) {
      params.set('sort', filters.sort);
    }
  }

  // petFriendly 처리
  if (filters.petFriendly) {
    params.set('petFriendly', 'true');
  }

  // petSize 처리 (배열을 쉼표로 구분된 문자열로 변환)
  if (filters.petSize && filters.petSize.length > 0) {
    params.set('petSize', filters.petSize.join(','));
  }

  // keyword 처리
  if (filters.keyword) {
    params.set('keyword', filters.keyword);
  }

  // page 처리
  if (filters.page && filters.page !== DEFAULT_FILTERS.page) {
    params.set('page', filters.page.toString());
  }

  return params;
}

/**
 * 필터 파라미터 병합 (기존 파라미터 유지하면서 일부만 업데이트)
 * @param current 현재 필터 파라미터
 * @param updates 업데이트할 필터 파라미터
 * @returns 병합된 FilterParams 객체
 */
export function mergeFilterParams(
  current: FilterParams,
  updates: Partial<FilterParams>,
): FilterParams {
  return {
    ...current,
    ...updates,
    // petSize는 배열이므로 특별 처리
    petSize:
      updates.petSize !== undefined
        ? updates.petSize.length > 0
          ? updates.petSize
          : undefined
        : current.petSize,
  };
}

/**
 * 필터를 기본값으로 리셋 (keyword는 유지)
 * @param current 현재 필터 파라미터
 * @returns 리셋된 FilterParams 객체
 */
export function resetFilterParams(current: FilterParams): FilterParams {
  return {
    ...DEFAULT_FILTERS,
    keyword: current.keyword, // keyword는 유지
  };
}

/**
 * 필터 파라미터 업데이트를 URL 쿼리 파라미터로 변환
 * (기존 파라미터와 병합하여 새로운 URL 생성)
 * @param current 현재 URLSearchParams
 * @param updates 업데이트할 필터 파라미터
 * @returns 업데이트된 URLSearchParams
 */
export function updateFilterParams(
  current: URLSearchParams,
  updates: Partial<FilterParams>,
): URLSearchParams {
  // 현재 파라미터를 FilterParams로 파싱
  const currentFilters = parseFilterParams(current);

  // 업데이트 병합
  const mergedFilters = mergeFilterParams(currentFilters, updates);

  // URLSearchParams로 변환 (기본값 제거)
  return buildFilterParams(mergedFilters, { keepDefaults: false });
}

/**
 * 필터 파라미터를 쿼리 문자열로 변환
 * @param filters FilterParams 객체
 * @param options 옵션
 * @returns 쿼리 문자열 (앞의 '?' 제외)
 */
export function buildFilterQueryString(
  filters: Partial<FilterParams>,
  options?: { keepDefaults?: boolean },
): string {
  return buildFilterParams(filters, options).toString();
}

