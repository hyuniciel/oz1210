# Client Component에서 지역 목록 로드 구현 계획

## 현재 상태 분석

### 현재 구현 방식
- **Server Component 방식** (현재 사용 중)
  - `app/page.tsx`에서 `getAreaCode()` 호출하여 지역 목록 로드
  - 지역 목록을 `TourFilters` 컴포넌트에 props로 전달
  - 장점: 초기 로딩 시 지역 목록이 이미 준비되어 있음
  - 단점: Server Component에서만 사용 가능

### 구현할 방식
- **Client Component 방식** (대안)
  - `TourFilters` 컴포넌트 내부에서 `useEffect`로 `getAreaCode()` 호출
  - 로딩 상태 및 에러 상태 관리
  - 장점: 컴포넌트가 독립적으로 동작, 재사용성 향상
  - 단점: 클라이언트에서 추가 API 호출 발생

## 구현 계획

### 1. TourFilters 컴포넌트 수정

#### 1.1 areas prop을 선택 사항으로 변경
- **파일**: `components/tour-filters.tsx`
- **변경 사항**:
  - `TourFiltersProps` 인터페이스에서 `areas` prop을 optional로 변경
  - `areas?: AreaCode[]` 형태로 수정
  - areas가 없으면 Client Component에서 로드하도록 처리

#### 1.2 지역 목록 로드 상태 관리
- **파일**: `components/tour-filters.tsx`
- **구현 내용**:
  - `useState`로 지역 목록 상태 관리 (`areasState`)
  - `useState`로 로딩 상태 관리 (`isLoadingAreas`)
  - `useState`로 에러 상태 관리 (`areasError`)

#### 1.3 useEffect로 지역 목록 로드
- **파일**: `components/tour-filters.tsx`
- **구현 내용**:
  - `useEffect`에서 `getAreaCode()` 호출
  - areas prop이 없을 때만 로드 (조건부 실행)
  - 컴포넌트 마운트 시 한 번만 실행 (의존성 배열: `[]`)

#### 1.4 로딩 상태 UI
- **파일**: `components/tour-filters.tsx`
- **구현 내용**:
  - 지역 필터 영역에 로딩 인디케이터 표시
  - Skeleton UI 또는 Loading 컴포넌트 사용
  - 로딩 중에는 Select 컴포넌트 비활성화

#### 1.5 에러 처리 UI
- **파일**: `components/tour-filters.tsx`
- **구현 내용**:
  - 에러 발생 시 에러 메시지 표시
  - 기본 지역 목록 사용 (하드코딩) 또는 재시도 버튼
  - 사용자 친화적인 에러 메시지

### 2. 기본 지역 목록 상수 정의 (에러 처리용)

#### 2.1 기본 지역 목록 생성
- **파일**: `lib/constants/areas.ts` (새로 생성) 또는 `components/tour-filters.tsx` 내부
- **구현 내용**:
  - 주요 지역 코드 및 이름 하드코딩
  - 에러 발생 시 fallback으로 사용
  - 예: 서울(1), 부산(6), 경기(31), 인천(2), 대구(4) 등

### 3. app/page.tsx 수정 (선택 사항)

#### 3.1 areas prop 전달 제거 (선택 사항)
- **파일**: `app/page.tsx`
- **변경 사항**:
  - `getAreaCode()` 호출 제거 또는 유지 (성능 최적화를 위해 유지 가능)
  - `TourFilters`에 areas prop 전달하지 않으면 Client Component에서 로드
  - 또는 두 방식 모두 지원 (areas가 있으면 사용, 없으면 로드)

## 구현 세부사항

### 지역 목록 로드 로직 예시

```typescript
// TourFilters 컴포넌트 내부
const [areasState, setAreasState] = useState<AreaCode[]>([]);
const [isLoadingAreas, setIsLoadingAreas] = useState(false);
const [areasError, setAreasError] = useState<Error | null>(null);

useEffect(() => {
  // areas prop이 있으면 로드하지 않음
  if (areas && areas.length > 0) {
    setAreasState(areas);
    return;
  }

  // Client Component에서 로드
  const loadAreas = async () => {
    setIsLoadingAreas(true);
    setAreasError(null);
    
    try {
      const loadedAreas = await getAreaCode({ numOfRows: 100 });
      setAreasState(loadedAreas);
    } catch (err) {
      console.error('지역 목록 로드 실패:', err);
      setAreasError(err instanceof Error ? err : new Error('지역 목록을 불러올 수 없습니다.'));
      // 기본 지역 목록 사용
      setAreasState(DEFAULT_AREAS);
    } finally {
      setIsLoadingAreas(false);
    }
  };

  loadAreas();
}, [areas]); // areas prop이 변경되면 재실행
```

### 로딩 상태 UI 예시

```tsx
{/* 지역 필터 */}
<div className="flex flex-col gap-2 flex-1">
  <label htmlFor="area-filter" className="text-sm font-medium flex items-center gap-2">
    <MapPin className="h-4 w-4" aria-hidden="true" />
    지역
  </label>
  {isLoadingAreas ? (
    <Skeleton className="h-10 w-full" />
  ) : areasError ? (
    <div className="text-sm text-destructive">
      지역 목록을 불러올 수 없습니다.
    </div>
  ) : (
    <Select value={currentAreaCode} onValueChange={handleAreaChange}>
      {/* ... */}
    </Select>
  )}
</div>
```

### 기본 지역 목록 상수 예시

```typescript
// lib/constants/areas.ts 또는 components/tour-filters.tsx 내부
export const DEFAULT_AREAS: AreaCode[] = [
  { code: '1', name: '서울' },
  { code: '6', name: '부산' },
  { code: '31', name: '경기' },
  { code: '2', name: '인천' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '7', name: '대전' },
  { code: '8', name: '울산' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
];
```

## 검증 체크리스트

- [ ] `TourFiltersProps` 인터페이스에서 `areas` prop을 optional로 변경
- [ ] 지역 목록 로드 상태 관리 (useState)
- [ ] useEffect로 지역 목록 로드 로직 구현
- [ ] areas prop이 있을 때는 로드하지 않도록 조건부 처리
- [ ] 로딩 상태 UI 구현 (Skeleton 또는 Loading 컴포넌트)
- [ ] 에러 처리 UI 구현
- [ ] 기본 지역 목록 상수 정의 (에러 처리용)
- [ ] 에러 발생 시 기본 지역 목록 사용
- [ ] 기존 기능 정상 작동 확인 (areas prop 전달 시)
- [ ] Client Component 로드 기능 정상 작동 확인
- [ ] 타입 안정성 확인
- [ ] 린트 오류 확인

## 주의사항

1. **하위 호환성**: 기존 코드(Server Component에서 areas 전달)와의 호환성 유지
2. **성능**: areas prop이 있으면 Client Component에서 로드하지 않도록 처리
3. **에러 처리**: 네트워크 오류 시 사용자에게 친화적인 메시지 표시
4. **로딩 상태**: 로딩 중에도 필터 UI가 깨지지 않도록 처리
5. **기본 지역 목록**: 에러 발생 시 최소한의 지역 목록이라도 제공

## 선택 사항

- **캐싱**: 지역 목록을 localStorage에 캐싱하여 재사용
- **재시도**: 에러 발생 시 재시도 버튼 제공
- **점진적 로딩**: 필수 지역만 먼저 로드하고 나머지는 지연 로드

