/**
 * @file error.ts
 * @description 에러 처리 유틸리티 함수
 *
 * 에러 타입 판별 및 사용자 친화적 메시지 변환을 위한 유틸리티 함수들입니다.
 *
 * 주요 기능:
 * - 네트워크 에러 감지
 * - 오프라인 상태 감지
 * - 에러 타입 판별
 * - 사용자 친화적 에러 메시지 생성
 */

/**
 * 에러 타입
 */
export type ErrorCategory = 'network' | 'server' | 'client' | 'timeout' | 'unknown';

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
  /** 에러 카테고리 */
  category: ErrorCategory;
  /** 사용자 친화적 메시지 */
  message: string;
  /** 원본 에러 메시지 (개발용) */
  originalMessage?: string;
  /** 재시도 가능 여부 */
  retryable: boolean;
}

/**
 * 네트워크가 오프라인 상태인지 확인
 * @returns 오프라인 여부
 */
export function isOffline(): boolean {
  if (typeof window === 'undefined') {
    return false; // 서버 사이드에서는 항상 온라인으로 간주
  }
  return !navigator.onLine;
}

/**
 * 에러가 네트워크 에러인지 확인
 * @param error 에러 객체
 * @returns 네트워크 에러 여부
 */
export function isNetworkError(error: unknown): boolean {
  if (isOffline()) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError'
    );
  }

  return false;
}

/**
 * 에러가 타임아웃 에러인지 확인
 * @param error 에러 객체
 * @returns 타임아웃 에러 여부
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'AbortError' ||
      error.message.includes('timeout') ||
      error.message.includes('타임아웃')
    );
  }
  return false;
}

/**
 * 에러가 서버 에러인지 확인
 * @param error 에러 객체
 * @returns 서버 에러 여부
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    return statusCode !== undefined && statusCode >= 500;
  }
  return false;
}

/**
 * 에러 정보 추출 및 사용자 친화적 메시지 생성
 * @param error 에러 객체
 * @returns 에러 정보
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  // 오프라인 상태 확인
  if (isOffline()) {
    return {
      category: 'network',
      message: '인터넷 연결이 끊어졌습니다. 네트워크 연결을 확인해주세요.',
      retryable: true,
    };
  }

  // 네트워크 에러
  if (isNetworkError(error)) {
    return {
      category: 'network',
      message: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
      originalMessage: error instanceof Error ? error.message : String(error),
      retryable: true,
    };
  }

  // 타임아웃 에러
  if (isTimeoutError(error)) {
    return {
      category: 'timeout',
      message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      originalMessage: error instanceof Error ? error.message : String(error),
      retryable: true,
    };
  }

  // 서버 에러
  if (isServerError(error)) {
    return {
      category: 'server',
      message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      originalMessage: error instanceof Error ? error.message : String(error),
      retryable: true,
    };
  }

  // 기타 에러
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Rate Limit 에러 확인
  if (errorMessage.includes('429') || errorMessage.includes('호출 제한')) {
    return {
      category: 'server',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      originalMessage: errorMessage,
      retryable: true,
    };
  }

  return {
    category: 'unknown',
    message: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    originalMessage: errorMessage,
    retryable: false,
  };
}

