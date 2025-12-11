# 버그 리포트: BUG-FS-001

## 버그 정보

- **버그 ID**: BUG-FS-001
- **제목**: 검색 시 기존 필터가 유지되지 않음
- **우선순위**: High
- **발견 날짜**: 2025-12-11
- **발견자**: 코드 분석
- **상태**: 수정 완료

## 버그 설명

### 상황
사용자가 필터(지역, 관광 타입 등)를 적용한 상태에서 검색창에 키워드를 입력하고 검색을 실행하면, 기존에 적용된 필터가 모두 초기화되고 검색 키워드만 URL에 추가됩니다.

### 예상 동작
검색 시 기존에 적용된 필터(지역, 관광 타입, 정렬 등)를 유지하면서 검색 키워드만 추가되어야 합니다.

### 실제 동작
검색 실행 시 기존 필터가 모두 제거되고 검색 키워드만 URL에 추가됩니다.

## 재현 단계

1. 홈페이지에서 지역 필터를 "부산"으로 선택
2. 관광 타입 필터를 "음식점"으로 선택
3. 검색창에 "해변"을 입력하고 검색 실행
4. URL 확인: `/?keyword=해변` (기존 필터가 사라짐)

## 환경 정보

- **브라우저**: 모든 브라우저
- **디바이스**: 모든 디바이스
- **네트워크 상태**: 정상

## 버그 분석

### 원인 분석
`components/Navbar.tsx`의 `handleSearch` 함수에서 검색 실행 시 기존 URL 파라미터를 무시하고 `keyword`만 URL에 추가하는 방식으로 구현되어 있었습니다.

```typescript
// 문제가 있던 코드
router.push(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
```

### 관련 파일
- `components/Navbar.tsx` - 검색 핸들러 함수 (line 31-37)

## 수정 내용

### 수정 방법
`updateFilterParams` 유틸리티 함수를 사용하여 기존 필터를 유지하면서 `keyword`만 업데이트하도록 수정했습니다.

### 수정된 코드
```typescript
// 수정 전
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    router.push(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
    setIsMobileMenuOpen(false);
  }
};

// 수정 후
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    // 기존 필터를 유지하면서 keyword만 업데이트
    const newParams = updateFilterParams(searchParams, {
      keyword: searchQuery.trim(),
      page: 1, // 검색 시 첫 페이지로 리셋
    });
    router.push(`/?${newParams.toString()}`);
    setIsMobileMenuOpen(false);
  }
};
```

### 수정 날짜
2025-12-11

## 재테스트 결과

### 재테스트 날짜
2025-12-11

### 재테스트 환경
- **브라우저**: Chrome (최신 버전)
- **디바이스**: 데스크톱
- **네트워크 상태**: 정상

### 재테스트 결과
- [x] 통과
- [ ] 실패 (재현됨)
- [ ] 부분 통과

### 재테스트 메모
수정 후 검색 시 기존 필터가 정상적으로 유지되는 것을 확인했습니다. 예: 부산 + 음식점 필터 적용 후 "해변" 검색 시 URL이 `/?areaCode=6&contentTypeId=39&keyword=해변`으로 올바르게 생성됩니다.

