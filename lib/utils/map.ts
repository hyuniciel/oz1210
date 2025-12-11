/**
 * @file map.ts
 * @description 지도 관련 유틸리티 함수
 *
 * 네이버 지도 연동을 위한 좌표 변환 및 지도 관련 유틸리티 함수들입니다.
 *
 * 주요 기능:
 * - KATEC 좌표계 → WGS84 좌표계 변환
 * - 네이버 지도 좌표 객체 생성
 */

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 * 한국관광공사 API는 KATEC 좌표계를 사용하며, 정수형으로 저장됨
 * 
 * @param mapx 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns WGS84 좌표계의 위도(lat)와 경도(lng)
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string,
): { lat: number; lng: number } {
  const lng = parseFloat(mapx) / 10000000;
  const lat = parseFloat(mapy) / 10000000;
  return { lat, lng };
}

/**
 * 관광지 목록의 중심 좌표 계산
 * 모든 관광지의 좌표를 평균하여 중심 좌표를 구함
 * 
 * @param tours 관광지 목록
 * @returns 중심 좌표 (위도, 경도)
 */
export function calculateCenter(
  tours: Array<{ mapx: string; mapy: string }>,
): { lat: number; lng: number } | null {
  if (tours.length === 0) {
    return null;
  }

  const coordinates = tours.map((tour) => convertKATECToWGS84(tour.mapx, tour.mapy));
  
  const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
  const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;

  return { lat: avgLat, lng: avgLng };
}

/**
 * 관광지 목록의 경계 좌표 계산 (지도 범위 자동 조정용)
 * 
 * @param tours 관광지 목록
 * @returns 경계 좌표 (남서쪽, 북동쪽)
 */
export function calculateBounds(
  tours: Array<{ mapx: string; mapy: string }>,
): { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } } | null {
  if (tours.length === 0) {
    return null;
  }

  const coordinates = tours.map((tour) => convertKATECToWGS84(tour.mapx, tour.mapy));
  
  const lats = coordinates.map((coord) => coord.lat);
  const lngs = coordinates.map((coord) => coord.lng);

  return {
    sw: {
      lat: Math.min(...lats),
      lng: Math.min(...lngs),
    },
    ne: {
      lat: Math.max(...lats),
      lng: Math.max(...lngs),
    },
  };
}

