# 네이버 지도 연동 (MVP 2.2) 구현 계획

## 현재 상태 분석

### 현재 구현 상태
- 지도 영역 플레이스홀더: `app/page.tsx`에 지도 영역이 준비되어 있음 (209-218줄)
- 레이아웃 구조: 데스크톱 분할 레이아웃 준비됨
- 좌표 데이터: TourItem에 `mapx`, `mapy` 필드 포함됨

### 미구현 항목
- 네이버 지도 컴포넌트 생성
- Naver Maps API 초기화
- 마커 표시 및 인포윈도우
- 지도-리스트 연동
- 반응형 레이아웃 (모바일 탭 전환)

## 구현 계획

### 1. Naver Maps API 설정

#### 1.1 환경변수 확인
- **파일**: `.env` 또는 환경변수 설정
- **필수 환경변수**:
  - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`: 네이버 클라우드 플랫폼 Maps API Client ID
  - 또는 `NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID`: NCP Key ID (ncpKeyId 파라미터용)

#### 1.2 Next.js 설정 확인
- **파일**: `next.config.ts`
- **구현 내용**:
  - 네이버 지도 스크립트 외부 도메인 허용 (필요 시)
  - CSP (Content Security Policy) 설정 (필요 시)

### 2. 네이버 지도 컴포넌트 생성

#### 2.1 `components/naver-map.tsx` 생성
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - Client Component로 구현 (`'use client'`)
  - Naver Maps API 스크립트 동적 로드
  - 지도 초기화 및 컨테이너 설정
  - 지도 인스턴스 관리 (useRef 사용)

#### 2.2 Naver Maps API 스크립트 로드
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - `useEffect`에서 스크립트 동적 로드
  - 스크립트 중복 로드 방지
  - 로딩 상태 관리
  - 에러 처리

#### 2.3 지도 초기화
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 지도 컨테이너 설정
  - 초기 중심 좌표 설정 (선택된 지역 또는 관광지 목록 중심)
  - 초기 줌 레벨 설정
  - 지도 타입 설정 (일반 지도)

### 3. 좌표 변환 유틸리티

#### 3.1 좌표 변환 함수 생성
- **파일**: `lib/utils/map.ts` (새로 생성)
- **구현 내용**:
  - KATEC 좌표계 → WGS84 좌표계 변환
  - `mapx` (경도), `mapy` (위도)를 `/10000000`으로 나누어 변환
  - 네이버 지도 좌표 객체 생성 (`naver.maps.LatLng`)

### 4. 마커 표시 기능

#### 4.1 마커 생성 및 표시
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 관광지 목록을 받아서 마커 생성
  - 각 관광지의 좌표를 변환하여 마커 배치
  - 마커 인스턴스 관리 (Map 또는 배열로 저장)
  - 관광지 데이터와 마커 매핑

#### 4.2 마커 클릭 이벤트 처리
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 마커 클릭 시 인포윈도우 표시
  - 인포윈도우 내용:
    - 관광지명
    - 주소 (간단히)
    - "상세보기" 버튼 (상세페이지로 이동)
  - 인포윈도우 스타일링

#### 4.3 관광 타입별 마커 색상 구분 (선택 사항)
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 관광 타입별로 다른 색상의 마커 사용
  - 커스텀 마커 이미지 또는 아이콘 사용
  - `lib/utils/tour.ts`의 `getContentTypeInfo()` 활용

### 5. 지도-리스트 연동

#### 5.1 리스트 항목 클릭 시 지도 이동
- **파일**: `app/page.tsx`, `components/naver-map.tsx`
- **구현 내용**:
  - TourCard 컴포넌트에 클릭 이벤트 추가 (또는 기존 Link 활용)
  - 선택된 관광지 ID를 상태로 관리
  - NaverMap 컴포넌트에 선택된 관광지 ID 전달
  - 해당 마커로 지도 이동 및 강조

#### 5.2 마커 클릭 시 리스트 항목 강조
- **파일**: `components/naver-map.tsx`, `components/tour-list.tsx`
- **구현 내용**:
  - 마커 클릭 시 선택된 관광지 ID를 부모 컴포넌트로 전달
  - TourList 컴포넌트에 선택된 관광지 ID 전달
  - 해당 카드에 강조 스타일 적용

#### 5.3 리스트 항목 호버 시 마커 강조 (선택 사항)
- **파일**: `components/tour-card.tsx`, `components/naver-map.tsx`
- **구현 내용**:
  - TourCard에 onMouseEnter/onMouseLeave 이벤트 추가
  - 호버 시 해당 마커 강조 (애니메이션 또는 색상 변경)

### 6. 지도 컨트롤

#### 6.1 줌 인/아웃 버튼
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 줌 인/아웃 버튼 UI 추가
  - `map.setZoom()` 사용하여 줌 레벨 변경
  - 현재 줌 레벨 표시 (선택 사항)

#### 6.2 지도 유형 선택
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 일반 지도 / 스카이뷰 토글 버튼
  - `map.setMapTypeId()` 사용하여 지도 타입 변경
  - 현재 지도 타입 표시

#### 6.3 현재 위치 버튼 (선택 사항)
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - Geolocation API 사용하여 현재 위치 가져오기
  - 현재 위치로 지도 이동
  - 현재 위치 마커 표시

### 7. 반응형 레이아웃

#### 7.1 데스크톱 레이아웃
- **파일**: `app/page.tsx`
- **구현 내용**:
  - 리스트(좌측 50%) + 지도(우측 50%) 분할 레이아웃
  - 지도는 sticky로 고정 (스크롤 시에도 보이도록)
  - 이미 구현되어 있음 (209-218줄)

#### 7.2 모바일 레이아웃
- **파일**: `app/page.tsx`
- **구현 내용**:
  - 탭 형태로 리스트/지도 전환
  - Tabs 컴포넌트 사용 (shadcn/ui)
  - 기본 탭: 리스트 뷰
  - 지도 탭: 지도 뷰

### 8. 성능 최적화

#### 8.1 지도 지연 로딩
- **파일**: `app/page.tsx`
- **구현 내용**:
  - `dynamic` import 사용하여 지도 컴포넌트 지연 로딩
  - `ssr: false` 옵션 사용 (클라이언트 사이드에서만 렌더링)

#### 8.2 마커 최적화
- **파일**: `components/naver-map.tsx`
- **구현 내용**:
  - 관광지 목록 변경 시에만 마커 업데이트
  - 불필요한 마커 재생성 방지
  - 메모리 누수 방지 (컴포넌트 언마운트 시 마커 제거)

## 구현 세부사항

### Naver Maps API 스크립트 로드

```typescript
// components/naver-map.tsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID}`;
  script.async = true;
  script.onload = () => {
    // 지도 초기화
  };
  document.head.appendChild(script);

  return () => {
    // 정리
  };
}, []);
```

### 좌표 변환 함수

```typescript
// lib/utils/map.ts
export function convertKATECToWGS84(mapx: string, mapy: string): { lat: number; lng: number } {
  const lng = parseFloat(mapx) / 10000000;
  const lat = parseFloat(mapy) / 10000000;
  return { lat, lng };
}
```

### 마커 생성 예시

```typescript
// components/naver-map.tsx
const markers = tours.map((tour) => {
  const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
  const position = new naver.maps.LatLng(lat, lng);
  
  const marker = new naver.maps.Marker({
    position,
    map,
    title: tour.title,
  });

  // 인포윈도우
  const infoWindow = new naver.maps.InfoWindow({
    content: `
      <div>
        <h3>${tour.title}</h3>
        <p>${tour.addr1}</p>
        <a href="/places/${tour.contentid}">상세보기</a>
      </div>
    `,
  });

  naver.maps.Event.addListener(marker, 'click', () => {
    infoWindow.open(map, marker);
    onMarkerClick?.(tour.contentid);
  });

  return marker;
});
```

### 모바일 탭 전환

```tsx
// app/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="list" className="lg:hidden">
  <TabsList>
    <TabsTrigger value="list">목록</TabsTrigger>
    <TabsTrigger value="map">지도</TabsTrigger>
  </TabsList>
  <TabsContent value="list">
    <TourList ... />
  </TabsContent>
  <TabsContent value="map">
    <NaverMap ... />
  </TabsContent>
</Tabs>
```

## 검증 체크리스트

- [ ] Naver Maps API 스크립트 로드 확인
- [ ] 지도 초기화 및 표시 확인
- [ ] 좌표 변환 함수 구현 및 테스트
- [ ] 마커 표시 확인
- [ ] 마커 클릭 시 인포윈도우 표시 확인
- [ ] 리스트 항목 클릭 시 지도 이동 확인
- [ ] 마커 클릭 시 리스트 항목 강조 확인
- [ ] 지도 컨트롤 (줌, 지도 타입) 확인
- [ ] 데스크톱 분할 레이아웃 확인
- [ ] 모바일 탭 전환 확인
- [ ] 성능 최적화 확인 (지연 로딩, 마커 최적화)
- [ ] 에러 처리 확인 (API 로드 실패, 좌표 없음 등)
- [ ] 타입 안정성 확인
- [ ] 린트 오류 확인

## 주의사항

1. **Naver Maps API 버전**: NCP Maps API v3 사용 (구 버전 아님)
2. **파라미터 이름**: `ncpKeyId` 사용 (구 `ncpClientId` 아님)
3. **좌표 변환**: KATEC 좌표계를 WGS84로 변환 필수
4. **SSR**: 지도 컴포넌트는 클라이언트 사이드에서만 렌더링
5. **성능**: 마커가 많을 경우 성능 고려 (클러스터링은 향후 구현)
6. **접근성**: 지도 컨트롤에 키보드 네비게이션 지원

## 선택 사항

- **마커 클러스터링**: 마커가 많을 경우 클러스터링 적용
- **지도 범위 자동 조정**: 모든 마커가 보이도록 지도 범위 자동 조정
- **마커 애니메이션**: 마커 클릭 시 애니메이션 효과
- **지도 스타일 커스터마이징**: 지도 스타일 변경

