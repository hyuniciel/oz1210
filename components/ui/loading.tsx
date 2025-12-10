/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 재사용 가능한 로딩 스피너 컴포넌트입니다.
 * 다양한 크기와 색상 변형을 지원합니다.
 *
 * @dependencies
 * - lucide-react: Loader2 아이콘
 * - tailwindcss: 애니메이션 스타일
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  /** 크기 변형 */
  size?: 'sm' | 'md' | 'lg';
  /** 색상 변형 */
  variant?: 'primary' | 'secondary' | 'muted';
  /** 텍스트 표시 여부 */
  showText?: boolean;
  /** 커스텀 텍스트 */
  text?: string;
  /** 전체 화면 중앙 정렬 */
  fullScreen?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
};

/**
 * 로딩 스피너 컴포넌트
 */
export function Loading({
  size = 'md',
  variant = 'primary',
  showText = false,
  text = '로딩 중...',
  fullScreen = false,
  className,
}: LoadingProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant],
        )}
      />
      {showText && (
        <p className={cn('text-sm', variantClasses[variant])}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

