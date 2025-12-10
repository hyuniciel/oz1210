/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 한국관광공사 KorService2 API를 호출하는 타입 안전한 클라이언트입니다.
 * Server Component와 Client Component 모두에서 사용 가능합니다.
 *
 * 주요 기능:
 * - 지역코드 조회 (areaCode2)
 * - 지역 기반 관광지 목록 조회 (areaBasedList2)
 * - 키워드 검색 (searchKeyword2)
 * - 관광지 상세 정보 조회 (detailCommon2, detailIntro2, detailImage2)
 * - 반려동물 동반 정보 조회 (detailPetTour2)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 자동 처리 (serviceKey, MobileOS, MobileApp, _type)
 * - 에러 처리 및 재시도 로직 (최대 3회, 지수 백오프)
 * - 타입 안전한 API 응답 처리
 *
 * @dependencies
 * - lib/types/tour.ts: API 타입 정의
 */

import type {
  AreaCode,
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaBasedListResult,
  KeywordSearchResult,
  ApiListResponse,
  ApiDetailResponse,
} from '@/lib/types/tour';

/**
 * API Base URL
 */
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'MyTrip',
  _type: 'json',
} as const;

/**
 * API 요청 타임아웃 (밀리초)
 */
const REQUEST_TIMEOUT = 10000; // 10초

/**
 * 재시도 설정
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: [1000, 2000, 4000], // 지수 백오프: 1초, 2초, 4초
} as const;

/**
 * 커스텀 에러 클래스
 */
export class TourApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public resultCode?: string,
  ) {
    super(message);
    this.name = 'TourApiError';
  }
}

/**
 * 환경변수에서 API 키 가져오기
 * 서버 사이드: TOUR_API_KEY 우선, 없으면 NEXT_PUBLIC_TOUR_API_KEY
 * 클라이언트 사이드: NEXT_PUBLIC_TOUR_API_KEY만 사용
 */
function getServiceKey(): string {
  // 서버 사이드 (Node.js 환경)
  if (typeof window === 'undefined') {
    return (
      process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY || ''
    );
  }
  // 클라이언트 사이드
  return process.env.NEXT_PUBLIC_TOUR_API_KEY || '';
}

/**
 * 공통 파라미터와 커스텀 파라미터를 병합하여 쿼리 문자열 생성
 */
function buildQueryParams(
  customParams: Record<string, string | number | undefined>,
): string {
  const serviceKey = getServiceKey();
  if (!serviceKey) {
    throw new TourApiError('API 키가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    ...COMMON_PARAMS,
    serviceKey,
    ...Object.fromEntries(
      Object.entries(customParams)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)]),
    ),
  });

  return params.toString();
}

/**
 * API 에러 처리 및 사용자 친화적 메시지 변환
 */
function handleApiError(
  response: Response,
  body?: { response?: { header?: { resultCode?: string; resultMsg?: string } } },
): never {
  const statusCode = response.status;
  let message = `API 요청 실패 (${statusCode})`;

  if (body?.response?.header) {
    const { resultCode, resultMsg } = body.response.header;
    message = resultMsg || message;
    throw new TourApiError(message, statusCode, resultCode);
  }

  if (statusCode === 429) {
    throw new TourApiError('API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  if (statusCode >= 500) {
    throw new TourApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', statusCode);
  }

  throw new TourApiError(message, statusCode);
}

/**
 * 재시도 로직이 포함된 API 요청
 */
async function retryRequest<T>(
  url: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 4xx 클라이언트 에러는 재시도하지 않음
      if (response.status >= 400 && response.status < 500) {
        const body = await response.json().catch(() => ({}));
        handleApiError(response, body);
      }
      // 5xx 서버 에러는 재시도
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // API 응답 헤더 확인
    if (data.response?.header?.resultCode !== '0000') {
      handleApiError(response, data);
    }

    return data as T;
  } catch (error) {
    // AbortError (타임아웃) 또는 네트워크 에러
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('fetch'))
    ) {
      // 재시도 가능한 에러
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = RETRY_CONFIG.backoffMs[retryCount] || 4000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryRequest<T>(url, options, retryCount + 1);
      }
      throw new TourApiError(
        '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
      );
    }

    // 이미 처리된 TourApiError는 그대로 throw
    if (error instanceof TourApiError) {
      throw error;
    }

    // 기타 에러
    throw new TourApiError(
      `예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * API 응답에서 항목 배열 추출 (단일 항목 또는 배열 처리)
 */
function extractItems<T>(response: ApiListResponse<T> | ApiDetailResponse<T>): T[] {
  const items = response.response.body.items.item;
  return Array.isArray(items) ? items : [items];
}

/**
 * 지역코드 조회
 * @param params 선택 파라미터 (numOfRows, pageNo)
 * @returns 지역코드 목록
 */
export async function getAreaCode(params?: {
  numOfRows?: number;
  pageNo?: number;
}): Promise<AreaCode[]> {
  const queryParams = buildQueryParams({
    numOfRows: params?.numOfRows || 100,
    pageNo: params?.pageNo || 1,
  });

  const url = `${BASE_URL}/areaCode2?${queryParams}`;
  const response = await retryRequest<ApiListResponse<AreaCode>>(url);

  return extractItems(response);
}

/**
 * 지역 기반 관광지 목록 조회
 * @param params 필수: areaCode, 선택: contentTypeId, numOfRows, pageNo, sigunguCode
 * @returns 관광지 목록 및 페이지네이션 정보
 */
export async function getAreaBasedList(params: {
  areaCode: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  sigunguCode?: string;
}): Promise<AreaBasedListResult> {
  const queryParams = buildQueryParams({
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    numOfRows: params.numOfRows || 20,
    pageNo: params.pageNo || 1,
    sigunguCode: params.sigunguCode,
  });

  const url = `${BASE_URL}/areaBasedList2?${queryParams}`;
  const response = await retryRequest<ApiListResponse<TourItem>>(url);

  const items = extractItems(response);
  const body = response.response.body;

  return {
    items,
    totalCount: body.totalCount,
    pageNo: body.pageNo,
    numOfRows: body.numOfRows,
  };
}

/**
 * 키워드 검색
 * @param params 필수: keyword, 선택: areaCode, contentTypeId, numOfRows, pageNo
 * @returns 검색 결과 목록
 */
export async function searchKeyword(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<KeywordSearchResult> {
  const queryParams = buildQueryParams({
    keyword: params.keyword,
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    numOfRows: params.numOfRows || 20,
    pageNo: params.pageNo || 1,
  });

  const url = `${BASE_URL}/searchKeyword2?${queryParams}`;
  const response = await retryRequest<ApiListResponse<TourItem>>(url);

  const items = extractItems(response);
  const body = response.response.body;

  return {
    items,
    totalCount: body.totalCount,
  };
}

/**
 * 관광지 상세 정보 조회 (공통 정보)
 * @param params 필수: contentId
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(params: {
  contentId: string;
}): Promise<TourDetail> {
  const queryParams = buildQueryParams({
    contentId: params.contentId,
  });

  const url = `${BASE_URL}/detailCommon2?${queryParams}`;
  const response = await retryRequest<ApiDetailResponse<TourDetail>>(url);

  const items = extractItems(response);
  if (items.length === 0) {
    throw new TourApiError('관광지 정보를 찾을 수 없습니다.');
  }

  return items[0];
}

/**
 * 관광지 운영 정보 조회
 * @param params 필수: contentId, contentTypeId
 * @returns 관광지 운영 정보
 */
export async function getDetailIntro(params: {
  contentId: string;
  contentTypeId: string;
}): Promise<TourIntro> {
  const queryParams = buildQueryParams({
    contentId: params.contentId,
    contentTypeId: params.contentTypeId,
  });

  const url = `${BASE_URL}/detailIntro2?${queryParams}`;
  const response = await retryRequest<ApiDetailResponse<TourIntro>>(url);

  const items = extractItems(response);
  if (items.length === 0) {
    throw new TourApiError('운영 정보를 찾을 수 없습니다.');
  }

  return items[0];
}

/**
 * 관광지 이미지 목록 조회
 * @param params 필수: contentId, 선택: imageYN, subImageYN
 * @returns 이미지 목록
 */
export async function getDetailImage(params: {
  contentId: string;
  imageYN?: string;
  subImageYN?: string;
}): Promise<TourImage[]> {
  const queryParams = buildQueryParams({
    contentId: params.contentId,
    imageYN: params.imageYN || 'Y',
    subImageYN: params.subImageYN || 'Y',
  });

  const url = `${BASE_URL}/detailImage2?${queryParams}`;
  const response = await retryRequest<ApiListResponse<TourImage>>(url);

  return extractItems(response);
}

/**
 * 반려동물 동반 정보 조회
 * @param params 필수: contentId
 * @returns 반려동물 동반 정보 (없으면 null)
 */
export async function getDetailPetTour(params: {
  contentId: string;
}): Promise<PetTourInfo | null> {
  const queryParams = buildQueryParams({
    contentId: params.contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${queryParams}`;

  try {
    const response = await retryRequest<ApiDetailResponse<PetTourInfo>>(url);
    const items = extractItems(response);

    if (items.length === 0) {
      return null;
    }

    return items[0];
  } catch (error) {
    // 반려동물 정보가 없는 경우 null 반환 (에러가 아닌 정상 케이스)
    if (error instanceof TourApiError && error.resultCode === '0003') {
      return null;
    }
    throw error;
  }
}

