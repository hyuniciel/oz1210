/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 컴포넌트입니다.
 * 필터 상태는 URL 쿼리 파라미터로 관리되어 북마크/공유 시에도 유지됩니다.
 *
 * 주요 기능:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터 (다중 선택)
 * - 정렬 옵션 (최신순, 이름순)
 * - 필터 리셋 기능
 *
 * 핵심 구현 로직:
 * - Client Component로 구현하여 필터 인터랙션 처리
 * - Next.js 15의 useSearchParams와 useRouter 사용
 * - URL 쿼리 파라미터와 동기화된 상태 관리
 *
 * @dependencies
 * - next/navigation: useSearchParams, useRouter
 * - components/ui/select: Select 컴포넌트
 * - components/ui/checkbox: Checkbox 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - lib/constants/content-types: CONTENT_TYPES
 * - lib/types/tour: AreaCode
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Tag, ArrowUpDown, X, Heart, ChevronDown, Filter } from 'lucide-react';
import type { AreaCode } from '@/lib/types/tour';
import { CONTENT_TYPES } from '@/lib/constants/content-types';
import { DEFAULT_AREAS } from '@/lib/constants/areas';
import { getAreaCode } from '@/lib/api/tour-api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getPetSizeLabel } from '@/lib/utils/pet';
import {
  parseFilterParams,
  updateFilterParams,
  resetFilterParams,
  DEFAULT_FILTERS,
  type FilterParams,
} from '@/lib/utils/filters';

/**
 * 반려동물 크기 필터 옵션
 */
const PET_SIZES = [
  { id: '소형견', label: '소형견', value: '소형견' },
  { id: '중형견', label: '중형견', value: '중형견' },
  { id: '대형견', label: '대형견', value: '대형견' },
] as const;

export interface TourFiltersProps {
  /** 지역 목록 (선택 사항, 없으면 Client Component에서 로드) */
  areas?: AreaCode[];
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 활성 필터 정보 타입
 */
interface ActiveFilter {
  /** 필터 키 ('areaCode', 'contentTypeId', 'sort', 'petFriendly') */
  key: string;
  /** 표시할 레이블 */
  label: string;
  /** 필터 값 */
  value: string;
  /** 사용자에게 표시할 값 */
  displayValue: string;
}

/**
 * 관광지 필터 컴포넌트
 */
export function TourFilters({ areas: areasProp, className }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 접기/펼치기 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 지역 목록 로드 상태 관리 (Client Component에서 로드할 때 사용)
  const [areasState, setAreasState] = useState<AreaCode[]>(areasProp || []);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areasError, setAreasError] = useState<Error | null>(null);

  // 지역 목록 (props가 있으면 사용, 없으면 state 사용)
  const areas = areasProp || areasState;

  // 현재 필터 값 읽기 (필터 유틸리티 함수 사용)
  const filterParams = parseFilterParams(searchParams);
  const currentAreaCode = filterParams.areaCode || '1'; // 기본값: 서울
  const currentContentTypeId = filterParams.contentTypeId || '';
  const currentSort = filterParams.sort || 'latest';
  const currentPetFriendly = filterParams.petFriendly || false;
  const currentPetSize = filterParams.petSize || [];
  const keyword = filterParams.keyword || '';

  // 관광 타입 필터 상태 (체크박스용)
  const selectedTypeIds = currentContentTypeId
    ? [currentContentTypeId]
    : [];

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;

    // 지역 필터: 기본값("1")과 다르면 카운트
    if (currentAreaCode !== '1') count++;

    // 관광 타입 필터: 선택되면 카운트
    if (currentContentTypeId) count++;

    // 정렬 필터: 기본값("latest")과 다르면 카운트
    if (currentSort !== 'latest') count++;

    // 반려동물 필터: 활성화되면 카운트
    if (currentPetFriendly) count++;

    // 반려동물 크기 필터: 선택되면 카운트 (반려동물 필터 활성화 시에만)
    if (currentPetFriendly && currentPetSize.length > 0) count++;

    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  /**
   * 활성 필터 정보 추출 함수
   */
  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    // 지역 필터: 기본값("1")과 다르면 추가
    if (currentAreaCode !== '1') {
      const area = areas.find((a) => a.code === currentAreaCode);
      filters.push({
        key: 'areaCode',
        label: '지역',
        value: currentAreaCode,
        displayValue: area?.name || '알 수 없음',
      });
    }

    // 관광 타입 필터: 선택되면 추가
    if (currentContentTypeId) {
      const type = CONTENT_TYPES.find((t) => t.id === currentContentTypeId);
      filters.push({
        key: 'contentTypeId',
        label: '관광 타입',
        value: currentContentTypeId,
        displayValue: type?.label || '알 수 없음',
      });
    }

    // 정렬 필터: 기본값("latest")과 다르면 추가
    if (currentSort !== 'latest') {
      filters.push({
        key: 'sort',
        label: '정렬',
        value: currentSort,
        displayValue: currentSort === 'name' ? '이름순' : '최신순',
      });
    }

    // 반려동물 필터: 활성화되면 추가
    if (currentPetFriendly) {
      filters.push({
        key: 'petFriendly',
        label: '반려동물',
        value: 'true',
        displayValue: '동반 가능',
      });
    }

    // 반려동물 크기 필터: 선택되면 추가
    if (currentPetSize.length > 0) {
      filters.push({
        key: 'petSize',
        label: '반려동물 크기',
        value: currentPetSize.join(','),
        displayValue: currentPetSize.map(getPetSizeLabel).join(', '),
      });
    }

    return filters;
  };

  const activeFilters = getActiveFilters();

  /**
   * 개별 필터 제거 핸들러 (필터 유틸리티 함수 사용)
   */
  const handleRemoveFilter = (filterKey: string) => {
    const updates: Partial<FilterParams> = {};

    switch (filterKey) {
      case 'areaCode':
        updates.areaCode = DEFAULT_FILTERS.areaCode; // 기본값으로 리셋
        break;
      case 'contentTypeId':
        updates.contentTypeId = undefined;
        break;
      case 'sort':
        updates.sort = DEFAULT_FILTERS.sort; // 기본값 'latest'로 리셋
        break;
      case 'petFriendly':
        updates.petFriendly = false;
        updates.petSize = undefined; // 반려동물 필터 해제 시 크기 필터도 해제
        break;
      case 'petSize':
        updates.petSize = undefined;
        break;
    }

    updateParams(updates);
  };

  // Client Component에서 지역 목록 로드 (areas prop이 없을 때만)
  useEffect(() => {
    // areas prop이 있으면 로드하지 않음
    if (areasProp && areasProp.length > 0) {
      return;
    }

    // 이미 로드된 경우 다시 로드하지 않음
    if (areasState.length > 0 && !areasError) {
      return;
    }

    const loadAreas = async () => {
      setIsLoadingAreas(true);
      setAreasError(null);

      try {
        const loadedAreas = await getAreaCode({ numOfRows: 100 });
        setAreasState(loadedAreas);
      } catch (err) {
        console.error('지역 목록 로드 실패:', err);
        setAreasError(
          err instanceof Error
            ? err
            : new Error('지역 목록을 불러올 수 없습니다.'),
        );
        // 기본 지역 목록 사용
        setAreasState(DEFAULT_AREAS);
      } finally {
        setIsLoadingAreas(false);
      }
    };

    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 모바일/데스크톱 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDesktop = e.matches;
      setIsMobile(!isDesktop);
      // 데스크톱이면 항상 펼침
      if (isDesktop) {
        setIsOpen(true);
      }
    };

    // 초기 상태 설정
    handleResize(mediaQuery);

    // 리사이즈 이벤트 리스너 추가
    mediaQuery.addEventListener('change', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  /**
   * URL 파라미터 업데이트 함수 (필터 유틸리티 함수 사용)
   */
  const updateParams = (updates: Partial<FilterParams>) => {
    // 필터 변경 시 page를 1로 리셋
    const updatesWithPageReset = {
      ...updates,
      page: DEFAULT_FILTERS.page,
    };

    const newParams = updateFilterParams(searchParams, updatesWithPageReset);
    router.push(`/?${newParams.toString()}`);
  };

  /**
   * 지역 필터 변경 핸들러
   */
  const handleAreaChange = (value: string) => {
    updateParams({
      areaCode: value === 'all' ? DEFAULT_FILTERS.areaCode : value,
    });
  };

  /**
   * 관광 타입 필터 변경 핸들러
   */
  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      // 선택: 첫 번째 선택된 타입만 URL에 반영
      updateParams({ contentTypeId: typeId });
    } else {
      // 해제: 파라미터 제거
      updateParams({ contentTypeId: undefined });
    }
  };

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 전체 선택: 첫 번째 타입 선택
      updateParams({ contentTypeId: CONTENT_TYPES[0].id });
    } else {
      // 전체 해제
      updateParams({ contentTypeId: undefined });
    }
  };

  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  /**
   * 반려동물 필터 변경 핸들러
   */
  const handlePetFriendlyChange = (checked: boolean) => {
    if (checked) {
      updateParams({ petFriendly: true });
    } else {
      // 반려동물 필터 해제 시 크기 필터도 함께 해제
      updateParams({ petFriendly: false, petSize: undefined });
    }
  };

  /**
   * 반려동물 크기 필터 변경 핸들러
   */
  const handlePetSizeChange = (sizeValue: string, checked: boolean) => {
    const currentSizes = currentPetSize;
    let newSizes: string[];

    if (checked) {
      // 추가: 중복 방지
      newSizes = [...new Set([...currentSizes, sizeValue])];
    } else {
      // 제거
      newSizes = currentSizes.filter((size) => size !== sizeValue);
    }

    // URL 파라미터 업데이트
    updateParams({
      petSize: newSizes.length > 0 ? newSizes : undefined,
    });
  };

  /**
   * 필터 리셋 핸들러 (필터 유틸리티 함수 사용)
   */
  const handleReset = () => {
    const resetFilters = resetFilterParams(filterParams);
    const params = updateFilterParams(new URLSearchParams(), resetFilters);
    router.push(`/?${params.toString()}`);
  };

  // 전체 선택 상태 확인
  const isAllSelected = selectedTypeIds.length === CONTENT_TYPES.length;

  // 필터 컨텐츠 (공통)
  const filterContent = (
    <div className="space-y-4">
      {/* 활성 필터 뱃지 섹션 */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {filter.label}: {filter.displayValue}
              </span>
              <button
                onClick={() => handleRemoveFilter(filter.key)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                aria-label={`${filter.label} 필터 제거`}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 필터 컨트롤 */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* 지역 필터 */}
        <div className="flex flex-col gap-2 flex-1">
          <label
            htmlFor="area-filter"
            className="text-sm font-medium flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            지역
          </label>
          {isLoadingAreas ? (
            <Skeleton className="h-10 w-full" />
          ) : areasError && areas.length === 0 ? (
            <div className="text-sm text-destructive p-2 border rounded-md">
              지역 목록을 불러올 수 없습니다. 기본 지역만 사용 가능합니다.
            </div>
          ) : (
            <Select
              value={currentAreaCode}
              onValueChange={handleAreaChange}
              disabled={areas.length === 0}
            >
              <SelectTrigger
                id="area-filter"
                className={cn(
                  'w-full',
                  currentAreaCode !== '1' &&
                    'border-primary bg-primary/5 dark:bg-primary/10',
                )}
                aria-label="지역 선택"
              >
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

      {/* 관광 타입 필터 */}
      <div className="flex flex-col gap-2 flex-1">
        <label
          htmlFor="type-filter-all"
          className="text-sm font-medium flex items-center gap-2"
        >
          <Tag className="h-4 w-4" aria-hidden="true" />
          관광 타입
        </label>
        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
          {/* 전체 선택 체크박스 */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={(checked) =>
                handleSelectAll(checked === true)
              }
            />
            <label
              htmlFor="select-all"
              className="text-sm cursor-pointer select-none"
            >
              전체 선택
            </label>
          </div>
          {/* 개별 타입 체크박스 */}
          {CONTENT_TYPES.map((type) => {
            const isChecked = selectedTypeIds.includes(type.id);
            return (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type.id, checked === true)
                  }
                />
                <label
                  htmlFor={`type-${type.id}`}
                  className="text-sm cursor-pointer select-none"
                >
                  {type.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div className="flex flex-col gap-2 flex-1">
        <label
          htmlFor="sort-filter"
          className="text-sm font-medium flex items-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
          정렬
        </label>
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger
            id="sort-filter"
            className={cn(
              'w-full',
              currentSort !== 'latest' &&
                'border-primary bg-primary/5 dark:bg-primary/10',
            )}
            aria-label="정렬 선택"
          >
            <SelectValue placeholder="정렬 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="name">이름순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 반려동물 동반 가능 필터 */}
      <div className="flex flex-col gap-2 flex-1">
        <label
          htmlFor="pet-friendly-filter"
          className="text-sm font-medium flex items-center gap-2"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          반려동물
        </label>
        <div
          className={cn(
            'flex items-center gap-3 p-3 border rounded-md bg-card transition-colors',
            currentPetFriendly &&
              'border-primary bg-primary/5 dark:bg-primary/10',
          )}
        >
          <Switch
            id="pet-friendly-filter"
            checked={currentPetFriendly}
            onCheckedChange={handlePetFriendlyChange}
            aria-label="반려동물 동반 가능 필터"
          />
          <label
            htmlFor="pet-friendly-filter"
            className="text-sm cursor-pointer select-none flex items-center gap-1"
          >
            <span>🐾</span>
            <span>동반 가능</span>
          </label>
        </div>
      </div>

      {/* 반려동물 크기 필터 (반려동물 필터 활성화 시에만 표시) */}
      {currentPetFriendly && (
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>크기</span>
          </label>
          <div className="flex flex-col gap-2 border rounded-md p-2 transition-all duration-300">
            {PET_SIZES.map((size) => {
              const isChecked = currentPetSize.includes(size.value);
              return (
                <div key={size.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`pet-size-${size.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlePetSizeChange(size.value, checked === true)
                    }
                    aria-label={`${size.label} 필터`}
                  />
                  <label
                    htmlFor={`pet-size-${size.id}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {size.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 필터 리셋 버튼 */}
      <div className="flex items-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full md:w-auto"
          aria-label="필터 리셋"
        >
          <X className="h-4 w-4 mr-2" aria-hidden="true" />
          리셋
        </Button>
      </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-4 md:p-6',
        className,
      )}
    >
      {/* 데스크톱 필터 요약 정보 */}
      {!isMobile && activeFilterCount > 0 && (
        <div className="mb-4 text-sm text-muted-foreground">
          {activeFilterCount}개 필터 적용 중
        </div>
      )}

      {isMobile ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:hidden justify-between mb-4"
              aria-label={isOpen ? '필터 접기' : '필터 펼치기'}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>필터</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {filterContent}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        filterContent
      )}
    </div>
  );
}

