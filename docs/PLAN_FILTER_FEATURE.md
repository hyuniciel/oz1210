# Phase 2: 필터 기능 구현 계획

## 목표
사용자가 지역, 관광 타입, 정렬 옵션을 선택하여 관광지 목록을 필터링할 수 있는 기능을 구현합니다.

## 구현 파일

### 1. `components/tour-filters.tsx` 생성

#### 기능
- 지역 필터 (시/도 선택)
- 관광 타입 필터 (다중 선택 가능)
- 정렬 옵션 (최신순, 이름순)
- URL 쿼리 파라미터 기반 상태 관리
- 필터 변경 시 페이지 리로드

#### 구현 내용

**1.1 기본 구조**
- Client Component로 구현 (`'use client'`)
- Next.js의 `useRouter`와 `useSearchParams` 사용
- URL 쿼리 파라미터와 동기화된 상태 관리

**1.2 지역 필터**
- `getAreaCode()` API로 지역 목록 로드 (Server Component에서 미리 로드하거나 Client Component에서 로드)
- shadcn/ui `Select` 컴포넌트 사용
- 옵션:
  - "전체" (areaCode 없음 또는 빈 문자열)
  - 각 시/도 (서울: "1", 부산: "6", 경기: "31" 등)
- 기본값: 서울 ("1")
- URL 파라미터: `areaCode`

**1.3 관광 타입 필터**
- 관광 타입 목록 (하드코딩 또는 상수로 정의):
  - 관광지 (12)
  - 문화시설 (14)
  - 축제/행사 (15)
  - 여행코스 (25)
  - 레포츠 (28)
  - 숙박 (32)
  - 쇼핑 (38)
  - 음식점 (39)
- shadcn/ui `Checkbox` 컴포넌트 사용 (다중 선택)
- "전체" 옵션 (모든 타입 선택 해제)
- URL 파라미터: `contentTypeId` (단일 값, 첫 번째 선택된 값만 사용)

**1.4 정렬 옵션**
- shadcn/ui `Select` 컴포넌트 사용
- 옵션:
  - 최신순 (modifiedtime DESC) - 기본값
  - 이름순 (title ASC)
- URL 파라미터: `sort` (예: "latest", "name")
- 클라이언트 사이드 정렬 또는 API 파라미터로 처리 (API가 정렬을 지원하는지 확인 필요)

**1.5 필터 상태 관리**
- `useSearchParams()`로 현재 URL 파라미터 읽기
- 필터 변경 시 `router.push()`로 URL 업데이트
- 필터 초기값을 URL 파라미터에서 읽어서 표시
- 필터 리셋 버튼 (모든 필터를 기본값으로 초기화)

**1.6 UI/UX**
- 반응형 디자인:
  - 모바일: 세로 배치, 필터 섹션 접기/펼치기 가능
  - 데스크톱: 가로 배치
- 필터 레이블 및 아이콘 표시
- 필터 변경 시 로딩 인디케이터 (선택 사항)
- 필터 적용된 개수 표시 (선택 사항)

**1.7 반려동물 필터 (MVP 2.5 - 선택 사항)**
- 토글 버튼 (Switch 컴포넌트)
- 크기별 필터는 향후 구현 (현재는 동반 가능 여부만)
- URL 파라미터: `petFriendly` (boolean)

### 2. `app/page.tsx` 업데이트

#### 2.1 필터 파라미터 읽기
- `searchParams`에서 필터 파라미터 읽기:
  - `areaCode` (기본값: "1")
  - `contentTypeId` (선택 사항)
  - `sort` (기본값: "latest")
  - `petFriendly` (선택 사항, MVP 2.5)

#### 2.2 API 호출에 필터 적용
- `getAreaBasedList()` 또는 `searchKeyword()` 호출 시 필터 파라미터 전달
- 필터 조합 처리 (AND 조건)
- 필터 변경 시 `pageNo`를 1로 리셋

#### 2.3 필터 컴포넌트 통합
- `TourFilters` 컴포넌트를 필터 섹션에 배치
- 지역 목록을 Server Component에서 미리 로드하여 props로 전달 (선택 사항)

### 3. 유틸리티 함수

#### 3.1 `lib/utils/filters.ts` 생성 (선택 사항)
- `buildFilterParams()` - 필터 상태를 URL 쿼리 파라미터로 변환
- `parseFilterParams()` - URL 쿼리 파라미터를 필터 상태로 변환
- `resetFilters()` - 필터를 기본값으로 리셋

### 4. 타입 정의

#### 4.1 필터 타입 (선택 사항)
- `lib/types/filters.ts` 생성:
  - `FilterState` 인터페이스
  - `SortOption` 타입
  - `ContentType` 타입

## 구현 순서

1. **필터 컴포넌트 기본 구조 생성**
   - `components/tour-filters.tsx` 생성
   - 기본 레이아웃 및 스타일링
   - Client Component 설정

2. **지역 필터 구현**
   - `getAreaCode()` API 호출 (또는 Server Component에서 전달)
   - Select 컴포넌트로 지역 선택
   - URL 파라미터 동기화

3. **관광 타입 필터 구현**
   - 관광 타입 상수 정의
   - Checkbox 그룹으로 다중 선택
   - URL 파라미터 동기화 (첫 번째 값만)

4. **정렬 옵션 구현**
   - Select 컴포넌트로 정렬 선택
   - URL 파라미터 동기화

5. **필터 상태 관리**
   - useSearchParams로 현재 상태 읽기
   - router.push로 URL 업데이트
   - 필터 리셋 기능

6. **app/page.tsx 통합**
   - 필터 파라미터 읽기
   - API 호출에 필터 적용
   - TourFilters 컴포넌트 배치

7. **반응형 디자인 및 UX 개선**
   - 모바일 레이아웃 최적화
   - 필터 접기/펼치기 기능
   - 로딩 상태 표시

8. **테스트 및 검증**
   - 필터 조합 테스트
   - URL 파라미터 동기화 확인
   - 반응형 디자인 확인

## 참고사항

- Next.js 15의 `useSearchParams`는 `use()` 훅을 사용하거나 Suspense로 감싸야 할 수 있음
- 필터 변경 시 페이지 전체 리로드가 발생하므로, Server Component에서 자동으로 재렌더링됨
- 관광 타입 필터는 다중 선택이지만, API는 단일 contentTypeId만 지원하므로 첫 번째 선택된 값만 사용
- 정렬 기능은 API가 지원하지 않을 수 있으므로, 클라이언트 사이드 정렬을 고려해야 함
- 반려동물 필터는 MVP 2.5 기능이므로 우선순위가 낮음
- 필터 상태는 URL에 저장되므로, 북마크/공유 시 필터 상태가 유지됨

## 기술 스택

- **UI 컴포넌트**: shadcn/ui (Select, Checkbox, Button)
- **상태 관리**: Next.js useSearchParams, useRouter
- **스타일링**: Tailwind CSS v4
- **타입**: TypeScript

