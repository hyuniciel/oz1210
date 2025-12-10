/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 개별 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 클릭 시 상세페이지로 이동합니다.
 *
 * 주요 기능:
 * - 관광지 정보 표시 (이미지, 제목, 주소, 타입, 개요)
 * - 호버 효과 및 인터랙션
 * - 반응형 디자인
 *
 * 핵심 구현 로직:
 * - Next.js Image 컴포넌트로 이미지 최적화
 * - Link 컴포넌트로 상세페이지 이동
 * - 관광 타입 뱃지 표시
 *
 * @dependencies
 * - next/image: Image 컴포넌트
 * - next/link: Link 컴포넌트
 * - lib/types/tour: TourItem 타입
 * - lib/utils/tour: 관광 타입 변환 유틸리티
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import type { TourItem } from '@/lib/types/tour';
import { getContentTypeInfo, formatAddress, truncateText, stripHtmlTags } from '@/lib/utils/tour';
import { cn } from '@/lib/utils';

export interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 카드 컴포넌트
 */
export function TourCard({ tour, className }: TourCardProps) {
  const { name: typeName, colorClass } = getContentTypeInfo(tour.contenttypeid);
  const address = formatAddress(tour.addr1, tour.addr2);
  // overview는 상세 정보 API에서만 제공되므로 목록에서는 표시하지 않음

  // 이미지 URL 결정 (firstimage2 우선, 없으면 firstimage, 없으면 기본 이미지)
  const imageUrl = tour.firstimage2 || tour.firstimage || '/placeholder-tour.jpg';

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        'group block h-full',
        'bg-white dark:bg-gray-800',
        'rounded-xl shadow-md',
        'border border-gray-200 dark:border-gray-700',
        'overflow-hidden',
        'hover:shadow-xl hover:scale-[1.02]',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className,
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        {/* 관광 타입 뱃지 (이미지 위에 오버레이) */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              colorClass,
            )}
          >
            {typeName}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-4 space-y-3">
        {/* 관광지명 */}
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{address}</span>
        </div>

        {/* 전화번호 (있는 경우) */}
        {tour.tel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `tel:${tour.tel}`;
              }}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {tour.tel}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

