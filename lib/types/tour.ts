/**
 * @file tour.ts
 * @description 한국관광공사 공공 API 타입 정의
 *
 * 한국관광공사 KorService2 API의 요청/응답 타입을 정의합니다.
 * 모든 타입은 API 응답 구조를 기반으로 작성되었습니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목
 * - TourDetail: 관광지 상세 정보
 * - TourIntro: 관광지 운영 정보
 * - TourImage: 관광지 이미지 정보
 * - PetTourInfo: 반려동물 동반 정보
 * - AreaCode: 지역코드 정보
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  /** 콘텐츠 ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠 타입 ID (12: 관광지, 14: 문화시설 등) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 (시/도 + 시/군/구) */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode?: string;
  /** 시군구코드 */
  sigungucode?: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 (원본) */
  firstimage?: string;
  /** 대표이미지2 (썸네일) */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일시 */
  modifiedtime?: string;
  /** 생성일시 */
  createdtime?: string;
  /** 개요 (간단한 설명) */
  overview?: string;
}

/**
 * 지역코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 순번 */
  rnum?: number;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 * TourItem을 확장하여 추가 정보 포함
 */
export interface TourDetail extends TourItem {
  /** 우편번호 */
  zipcode?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문, HTML 포함 가능) */
  overview?: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * contenttypeid별로 다른 필드를 가질 수 있음
 */
export interface TourIntro {
  /** 콘텐츠 ID */
  contentid: string;
  /** 콘텐츠 타입 ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 여부 */
  chkbabycarriage?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 신용카드 가능 여부 */
  chkcreditcard?: string;
  /** 이용요금 */
  usefee?: string;
  /** 할인정보 */
  discountinfo?: string;
  /** 기타 정보 */
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠 ID */
  contentid: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 작은 이미지 URL */
  smallimageurl: string;
  /** 이미지명 */
  imgname?: string;
  /** 이미지 순번 */
  imgnum?: string;
}

/**
 * 반려동물 동반 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  /** 콘텐츠 ID */
  contentid: string;
  /** 콘텐츠 타입 ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 (Y/N) */
  chkpetleash?: string;
  /** 애완동물 크기 제한 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
}

/**
 * API 응답 헤더
 */
export interface ApiResponseHeader {
  /** 결과 코드 */
  resultCode: string;
  /** 결과 메시지 */
  resultMsg: string;
}

/**
 * API 응답 본문 (목록 조회)
 */
export interface ApiListResponseBody<T> {
  /** 응답 항목들 */
  items: {
    /** 단일 항목 또는 배열 */
    item: T | T[];
  };
  /** 전체 개수 */
  totalCount: number;
  /** 페이지 번호 */
  pageNo: number;
  /** 페이지당 항목 수 */
  numOfRows: number;
}

/**
 * API 응답 본문 (상세 조회)
 */
export interface ApiDetailResponseBody<T> {
  /** 응답 항목 */
  items: {
    /** 단일 항목 */
    item: T;
  };
}

/**
 * API 전체 응답 구조 (목록)
 */
export interface ApiListResponse<T> {
  response: {
    header: ApiResponseHeader;
    body: ApiListResponseBody<T>;
  };
}

/**
 * API 전체 응답 구조 (상세)
 */
export interface ApiDetailResponse<T> {
  response: {
    header: ApiResponseHeader;
    body: ApiDetailResponseBody<T>;
  };
}

/**
 * 지역 기반 목록 조회 결과
 */
export interface AreaBasedListResult {
  /** 관광지 목록 */
  items: TourItem[];
  /** 전체 개수 */
  totalCount: number;
  /** 페이지 번호 */
  pageNo: number;
  /** 페이지당 항목 수 */
  numOfRows: number;
}

/**
 * 키워드 검색 결과
 */
export interface KeywordSearchResult {
  /** 관광지 목록 */
  items: TourItem[];
  /** 전체 개수 */
  totalCount: number;
}

