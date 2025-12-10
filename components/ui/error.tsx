/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 에러 메시지를 표시하고 재시도 기능을 제공하는 컴포넌트입니다.
 * 다양한 에러 타입에 맞는 아이콘과 메시지를 표시합니다.
 *
 * @dependencies
 * - components/ui/alert: Alert 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - lucide-react: 아이콘
 */

'use client';

import { AlertCircle, WifiOff, ServerOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorType = 'network' | 'server' | 'client' | 'unknown';

export interface ErrorProps {
  /** 에러 메시지 */
  message?: string;
  /** 에러 타입 */
  type?: ErrorType;
  /** 재시도 버튼 표시 여부 */
  showRetry?: boolean;
  /** 재시도 콜백 함수 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
}

const errorConfig: Record<
  ErrorType,
  { icon: typeof AlertCircle; title: string; defaultMessage: string }
> = {
  network: {
    icon: WifiOff,
    title: '네트워크 오류',
    defaultMessage: '인터넷 연결을 확인해주세요.',
  },
  server: {
    icon: ServerOff,
    title: '서버 오류',
    defaultMessage: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  client: {
    icon: AlertCircle,
    title: '오류 발생',
    defaultMessage: '요청을 처리하는 중 오류가 발생했습니다.',
  },
  unknown: {
    icon: AlertTriangle,
    title: '알 수 없는 오류',
    defaultMessage: '예상치 못한 오류가 발생했습니다.',
  },
};

/**
 * 에러 메시지 컴포넌트
 */
export function Error({
  message,
  type = 'unknown',
  showRetry = false,
  onRetry,
  retryText = '다시 시도',
  className,
}: ErrorProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Alert variant="destructive" className={cn('', className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message || config.defaultMessage}
        {showRetry && onRetry && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              {retryText}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

