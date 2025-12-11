# 검색 기능 (MVP 2.3) 구현 계획

## 현재 상태 분석

### 이미 구현된 기능
1. **검색창 UI** (`components/Navbar.tsx`)
   - 데스크톱 검색창 (헤더에 고정)
   - 모바일 검색창 (햄버거 메뉴 내)
   - 검색 아이콘 표시
   - 엔터 키로 검색 실행
   - URL 파라미터로 keyword 전달

2. **검색 API 연동** (`app/page.tsx`)
   - `searchKeyword()` API 호출 (keyword가 있을 때)
   - 검색 결과를 TourList 컴포넌트로 전달
   - 필터와 검색 조합 지원 (areaCode, contentTypeId)

3. **검색 결과 표시** (`components/tour-list.tsx`)
   - TourCard 컴포넌트로 검색 결과 표시
   - 빈 상태 처리 (EmptyState 컴포넌트)

### 미구현/개선 필요 항목
1. **검색 결과 개수 표시**
   - 현재: 검색 결과 개수가 표시되지 않음
   - 개선: 검색 결과 개수 표시 (예: "검색 결과: 15개")

2. **검색 키워드 하이라이트**
   - 현재: 검색 키워드가 결과에서 강조되지 않음
   - 개선: 검색 키워드를 하이라이트하여 표시 (선택 사항)

3. **검색 상태 표시**
   - 현재: 검색 중 로딩 상태가 명확하지 않음
   - 개선: 검색 중 로딩 인디케이터 표시

4. **검색 결과 없음 메시지 개선**
   - 현재: EmptyState 컴포넌트로 처리되지만 검색 키워드가 표시되지 않음
   - 개선: 검색 키워드를 포함한 안내 메시지

5. **검색창 개선**
   - 현재 URL 파라미터와 동기화되지 않음 (검색 후 검색창이 비어있음)
   - 개선: URL 파라미터의 keyword를 검색창에 표시

## 구현 계획

### 1. 검색 결과 개수 표시

#### 1.1 검색 결과 개수 표시 컴포넌트
- **파일**: `app/page.tsx` 또는 별도 컴포넌트
- **구현 내용**:
  - 검색 키워드가 있을 때 검색 결과 개수 표시
  - 형식: "검색 결과: N개" 또는 "'{keyword}' 검색 결과: N개"
  - TourList 위에 배치

#### 1.2 검색 결과 개수 계산
- **파일**: `app/page.tsx`
- **구현 내용**:
  - `searchKeyword()` API 응답에서 `totalCount` 사용
  - 또는 `tours.length` 사용 (현재 페이지 기준)

### 2. 검색창 URL 파라미터 동기화

#### 2.1 Navbar 컴포넌트 수정
- **파일**: `components/Navbar.tsx`
- **구현 내용**:
  - `useSearchParams`로 URL의 keyword 파라미터 읽기
   - 검색창 value를 URL 파라미터와 동기화
   - 검색 후에도 검색 키워드가 검색창에 유지되도록 처리

#### 2.2 검색창 초기값 설정
- **파일**: `components/Navbar.tsx`
- **구현 내용**:
  - 컴포넌트 마운트 시 URL 파라미터에서 keyword 읽기
  - 검색창 초기값으로 설정

### 3. 검색 결과 없음 메시지 개선

#### 3.1 EmptyState 컴포넌트 수정
- **파일**: `components/tour-list.tsx` 또는 `app/page.tsx`
- **구현 내용**:
  - 검색 키워드를 포함한 안내 메시지
  - 예: "'{keyword}'에 대한 검색 결과가 없습니다."
  - 검색 키워드가 없을 때는 기존 메시지 유지

### 4. 검색 중 로딩 상태 표시

#### 4.1 검색 로딩 상태 관리
- **파일**: `app/page.tsx`
- **구현 내용**:
  - 검색 중 로딩 상태는 이미 TourList의 isLoading prop으로 처리됨
  - 검색창에 로딩 인디케이터 추가 (선택 사항)

### 5. 검색 키워드 하이라이트 (선택 사항)

#### 5.1 검색 키워드 하이라이트 함수
- **파일**: `lib/utils/search.ts` (새로 생성)
- **구현 내용**:
  - 텍스트에서 검색 키워드를 찾아 하이라이트
  - HTML 태그로 감싸서 스타일 적용
  - 예: `<mark>{keyword}</mark>`

#### 5.2 TourCard 컴포넌트에 하이라이트 적용
- **파일**: `components/tour-card.tsx`
- **구현 내용**:
  - 관광지명, 주소, 개요에서 검색 키워드 하이라이트
  - `dangerouslySetInnerHTML` 사용 또는 별도 컴포넌트

## 구현 세부사항

### 검색 결과 개수 표시 코드

```tsx
// app/page.tsx
{keyword && (
  <div className="mb-4 text-sm text-muted-foreground">
    <span className="font-medium">'{keyword}'</span> 검색 결과: {tours.length}개
  </div>
)}
```

### Navbar 검색창 URL 동기화 코드

```tsx
// components/Navbar.tsx
import { useSearchParams } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get('keyword') || '';
  const [searchQuery, setSearchQuery] = useState(keywordFromUrl);

  // URL 파라미터 변경 시 검색창 동기화
  useEffect(() => {
    setSearchQuery(keywordFromUrl);
  }, [keywordFromUrl]);

  // ... 나머지 코드
}
```

### 검색 결과 없음 메시지 개선 코드

```tsx
// app/page.tsx
<TourList
  tours={tours}
  petInfoMap={petInfoMap}
  isLoading={false}
  error={error}
  emptyMessage={
    keyword
      ? `"${keyword}"에 대한 검색 결과가 없습니다.`
      : '관광지를 찾을 수 없습니다.'
  }
/>
```

### 검색 키워드 하이라이트 함수 (선택 사항)

```typescript
// lib/utils/search.ts
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

## 검증 체크리스트

- [ ] 검색 결과 개수 표시 확인
- [ ] 검색창 URL 파라미터 동기화 확인
- [ ] 검색 후 검색 키워드가 검색창에 유지되는지 확인
- [ ] 검색 결과 없음 메시지에 검색 키워드 포함 확인
- [ ] 검색 + 필터 조합 정상 작동 확인
  - [ ] 키워드 + 지역 필터
  - [ ] 키워드 + 타입 필터
  - [ ] 키워드 + 모든 필터 동시 적용
- [ ] 검색 중 로딩 상태 확인
- [ ] 검색 키워드 하이라이트 확인 (선택 사항)
- [ ] 모바일/데스크톱 반응형 동작 확인
- [ ] 기존 기능 정상 작동 확인
- [ ] 타입 안정성 확인
- [ ] 린트 오류 확인

## 주의사항

1. **하위 호환성**: 기존 검색 기능이 정상 작동해야 함
2. **성능**: 검색 키워드 하이라이트는 성능에 영향을 주지 않아야 함
3. **접근성**: 하이라이트된 텍스트가 스크린 리더에서도 읽기 가능해야 함
4. **XSS 방지**: 검색 키워드 하이라이트 시 XSS 공격 방지

## 선택 사항

- **검색 히스토리**: 최근 검색어 저장 및 표시
- **자동완성**: 검색어 자동완성 기능
- **검색 제안**: 검색 결과 없을 때 검색어 제안
- **검색 필터**: 검색 범위 선택 (관광지명, 주소, 설명)

