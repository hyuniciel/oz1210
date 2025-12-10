/**
 * @file toast.ts
 * @description 토스트 알림 유틸리티 함수
 *
 * sonner를 사용한 토스트 알림 편의 함수입니다.
 * 성공, 에러, 정보, 경고 메시지를 쉽게 표시할 수 있습니다.
 *
 * @dependencies
 * - sonner: toast 함수
 */

import { toast as sonnerToast } from 'sonner';

/**
 * 성공 토스트 메시지 표시
 */
export function toastSuccess(message: string, description?: string) {
  return sonnerToast.success(message, {
    description,
    duration: 3000,
  });
}

/**
 * 에러 토스트 메시지 표시
 */
export function toastError(message: string, description?: string) {
  return sonnerToast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * 정보 토스트 메시지 표시
 */
export function toastInfo(message: string, description?: string) {
  return sonnerToast.info(message, {
    description,
    duration: 3000,
  });
}

/**
 * 경고 토스트 메시지 표시
 */
export function toastWarning(message: string, description?: string) {
  return sonnerToast.warning(message, {
    description,
    duration: 4000,
  });
}

/**
 * 로딩 토스트 메시지 표시 (수동으로 닫아야 함)
 */
export function toastLoading(message: string) {
  return sonnerToast.loading(message);
}

/**
 * 기본 toast 함수 (sonner의 toast 직접 사용)
 */
export const toast = sonnerToast;

