/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 관광지 목록을 네이버 지도에 마커로 표시하는 컴포넌트입니다.
 * Naver Maps JavaScript API v3 (NCP)를 사용합니다.
 *
 * 주요 기능:
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우 표시
 * - 지도-리스트 연동 (마커 클릭 시 콜백)
 * - 지도 컨트롤 (줌, 지도 타입)
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (SSR 불가)
 * - Naver Maps API 스크립트 동적 로드
 * - 좌표 변환 (KATEC → WGS84)
 * - 마커 및 인포윈도우 관리
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - lib/utils/map: 좌표 변환 유틸리티
 * - lib/types/tour: TourItem 타입
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { convertKATECToWGS84, calculateCenter, calculateBounds } from '@/lib/utils/map';
import type { TourItem } from '@/lib/types/tour';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Naver Maps API 타입 선언
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: {
          center: naver.maps.LatLng;
          zoom: number;
          mapTypeControl?: boolean;
          mapTypeControlOptions?: {
            position: naver.maps.Position;
          };
        }) => naver.maps.Map;
        LatLng: new (lat: number, lng: number) => naver.maps.LatLng;
        LatLngBounds: new (sw: naver.maps.LatLng, ne: naver.maps.LatLng) => naver.maps.LatLngBounds;
        Marker: new (options: {
          position: naver.maps.LatLng;
          map: naver.maps.Map;
          title?: string;
          icon?: {
            content: string;
            anchor: naver.maps.Point;
          };
        }) => naver.maps.Marker;
        InfoWindow: new (options: {
          content: string;
        }) => naver.maps.InfoWindow;
        Point: new (x: number, y: number) => naver.maps.Point;
        Event: {
          addListener: (
            target: naver.maps.Marker,
            event: string,
            handler: () => void,
          ) => void;
        };
        Position: {
          TOP_RIGHT: naver.maps.Position;
        };
        MapTypeId: {
          NORMAL: string;
          SATELLITE: string;
        };
      };
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace naver.maps {
    interface Map {
      setCenter(center: LatLng): void;
      setZoom(zoom: number): void;
      setMapTypeId(typeId: string): void;
      fitBounds(bounds: LatLngBounds): void;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface LatLng {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface LatLngBounds {}
    interface Marker {
      setMap(map: Map | null): void;
    }
    interface InfoWindow {
      open(map: Map, marker: Marker): void;
      close(): void;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Point {}
    type Position = string;
  }
}

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID (리스트에서 클릭한 항목) */
  selectedTourId?: string;
  /** 마커 클릭 시 콜백 */
  onMarkerClick?: (tourId: string) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedTourId,
  onMarkerClick,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowsRef = useRef<naver.maps.InfoWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');

  // Naver Maps API 스크립트 로드
  useEffect(() => {
    // 환경변수 확인 (NCP Key ID 또는 Client ID)
    const ncpKeyId =
      process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID ||
      process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    
    if (!ncpKeyId) {
      setError('네이버 지도 API 키가 설정되지 않았습니다. NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID 또는 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정해주세요.');
      setIsLoading(false);
      return;
    }

    // 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      initializeMap();
      return;
    }

    // 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${ncpKeyId}`;
    script.async = true;
    script.onload = () => {
      initializeMap();
    };
    script.onerror = () => {
      setError('네이버 지도 API를 불러올 수 없습니다.');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // 정리: 마커 및 인포윈도우 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
    };
  }, []);

  // 지도 초기화
  const initializeMap = () => {
    if (!mapRef.current || !window.naver?.maps) {
      return;
    }

    try {
      // 중심 좌표 계산
      const center = calculateCenter(tours);
      const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.9780); // 서울 시청

      // 지도 생성
      const map = new window.naver.maps.Map(mapRef.current, {
        center: center ? new window.naver.maps.LatLng(center.lat, center.lng) : defaultCenter,
        zoom: tours.length > 0 ? 12 : 10,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      });

      mapInstanceRef.current = map;
      setIsLoading(false);

      // 마커 생성
      createMarkers(map);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화할 수 없습니다.');
      setIsLoading(false);
    }
  };

  // 마커 생성
  const createMarkers = (map: naver.maps.Map) => {
    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    if (tours.length === 0) {
      return;
    }

    tours.forEach((tour) => {
      try {
        const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
        const position = new window.naver.maps.LatLng(lat, lng);

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: tour.title,
          icon: {
            content: `
              <div style="
                background-color: #3b82f6;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `,
            anchor: new window.naver.maps.Point(12, 12),
          },
        });

        // 인포윈도우 생성
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                ${tour.title}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                ${tour.addr1 || '주소 정보 없음'}
              </p>
              <a 
                href="/places/${tour.contentid}" 
                style="
                  display: inline-block;
                  padding: 6px 12px;
                  background-color: #3b82f6;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 14px;
                "
                onmouseover="this.style.backgroundColor='#2563eb'"
                onmouseout="this.style.backgroundColor='#3b82f6'"
              >
                상세보기
              </a>
            </div>
          `,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
          // 다른 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => iw.close());
          
          // 인포윈도우 열기
          infoWindow.open(map, marker);
          
          // 콜백 호출
          onMarkerClick?.(tour.contentid);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`마커 생성 실패 (${tour.contentid}):`, err);
        }
      }
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (tours.length > 1) {
      const bounds = calculateBounds(tours);
      if (bounds) {
        const sw = new window.naver.maps.LatLng(bounds.sw.lat, bounds.sw.lng);
        const ne = new window.naver.maps.LatLng(bounds.ne.lat, bounds.ne.lng);
        const boundsObj = new window.naver.maps.LatLngBounds(sw, ne);
        map.fitBounds(boundsObj);
      }
    }
  };

  // 관광지 목록 변경 시 마커 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && window.naver?.maps) {
      createMarkers(mapInstanceRef.current);
    }
  }, [tours, onMarkerClick]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!selectedTourId || !mapInstanceRef.current) {
      return;
    }

    const tour = tours.find((t) => t.contentid === selectedTourId);
    if (!tour) {
      return;
    }

    const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
    const position = new window.naver.maps.LatLng(lat, lng);

    // 지도 이동
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);

    // 해당 마커의 인포윈도우 열기
    const markerIndex = tours.findIndex((t) => t.contentid === selectedTourId);
    if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
      infoWindowsRef.current.forEach((iw) => iw.close());
      infoWindowsRef.current[markerIndex].open(
        mapInstanceRef.current,
        markersRef.current[markerIndex],
      );
    }
  }, [selectedTourId, tours]);

  // 지도 타입 변경
  const handleMapTypeChange = () => {
    if (!mapInstanceRef.current) {
      return;
    }

    const newType = mapType === 'normal' ? 'satellite' : 'normal';
    mapInstanceRef.current.setMapTypeId(
      newType === 'satellite'
        ? window.naver.maps.MapTypeId.SATELLITE
        : window.naver.maps.MapTypeId.NORMAL,
    );
    setMapType(newType);
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>지도 로드 실패</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
          <Loading text="지도 로딩 중..." showText />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px] lg:min-h-[600px] rounded-lg"
        style={{ minHeight: '400px' }}
      />
      {/* 지도 타입 토글 버튼 (커스텀) */}
      {!isLoading && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleMapTypeChange}
            className="px-3 py-2 bg-white dark:bg-gray-800 rounded-md shadow-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label={`지도 타입 변경 (현재: ${mapType === 'normal' ? '일반' : '위성'})`}
          >
            {mapType === 'normal' ? '위성' : '일반'}
          </button>
        </div>
      )}
    </div>
  );
}

