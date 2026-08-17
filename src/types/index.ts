// ─── Store ───────────────────────────────────────────────
export type StoreId =
  | "life_namba"
  | "lawson_namba"
  | "seven_shinsaibashi"
  | "familymart_dotonbori"
  | "life_tennoji"
  | "lawson_tsutenkaku"
  | "seven_umeda"
  | "life_shinsekai";

export type StoreType = "supermarket" | "convenience";

export interface Store {
  id: StoreId;
  nameKo: string;
  nameEn: string;
  type: StoreType;
  typeLabel: string;
  address: string;
  image: string;
  lat: number;
  lng: number;
}

// ─── Situation ───────────────────────────────────────────
export type SituationId =
  | "light_breakfast"
  | "hearty_meal"
  | "late_night"
  | "on_the_go"
  | "with_alcohol"
  | "budget_friendly";

export interface Situation {
  id: SituationId;
  label: string;
  emoji: string;
  description: string;
}

// ─── Filter ──────────────────────────────────────────────
export type CookingMethod = "none" | "microwave" | "hot_water";
export type MaxPrice = 500 | 700 | 1000 | null;

export interface FilterOptions {
  maxPrice: MaxPrice;
  cooking: CookingMethod | null;
}

// ─── Product Trust / Provenance ───────────────────────────
/**
 * 이 상품 정보가 실제로 어느 범위까지 확인되었는지를 나타낸다.
 * - chain_catalog: 체인 공식 사이트에 등록된 상품(전국/지역 카탈로그). 이 지점 취급 여부는 미확인.
 * - regional: 공식 사이트에 특정 지역(간사이 등) 판매로 명시된 상품.
 * - store_observed: 팀이 해당 지점에서 실제로 확인(구매/촬영)한 상품.
 */
export type AvailabilityScope = "chain_catalog" | "regional" | "store_observed";

/**
 * 상품 데이터 자체의 검증 단계.
 * - verified: 실재 SKU이며 공식 출처(URL)로 이름/가격을 확인함.
 * - needs_review: 후보로 수집했으나 사람 검수가 끝나지 않음. 추천에 노출하지 않음.
 * - retired: 과거 실재했으나 판매 종료/가격 변경 등으로 더 이상 신뢰할 수 없음.
 */
export type VerificationStatus = "verified" | "needs_review" | "retired";

/** 이미지가 실제 패키지 사진인지, 아직 자리표시자인지 구분한다. */
export type ImageKind =
  | "package_front"
  | "product_reference"
  | "shelf"
  | "back_label"
  | "placeholder";

export interface ProductImage {
  kind: ImageKind;
  src: string;
  /** 이미지 출처 URL. 팀이 직접 촬영한 경우 "team_photo"로 표기. */
  sourceUrl: string;
  /** 재배포/사용 권리 확인 상태. 확인 전에는 절대 "cleared"로 표기하지 않는다. */
  rights: "team_photo" | "cleared_official" | "pending_review";
}

// ─── Product ─────────────────────────────────────────────
export interface Product {
  id: string;
  storeId: StoreId;
  nameKo: string;
  nameJa: string;
  category: string;
  manufacturer?: string;
  priceYen: number | null;
  /** 세금 포함 여부. 공식 사이트 표기 기준. */
  taxIncluded?: boolean;
  fullness: 1 | 2 | 3 | 4 | 5;
  spicy: 0 | 1 | 2 | 3 | 4 | 5;
  cooking: CookingMethod;
  portable: boolean;
  situations: SituationId[];
  tags: string[];
  /** 하위 호환용 대표 이미지 경로. images[0]의 src와 동일해야 한다. */
  image: string;
  images: ProductImage[];
  descriptionKo: string;
  tasteSummary: string;
  /** tasteSummary의 근거. 출처 없는 주관적 서술을 방지하기 위해 필수로 둔다. */
  tasteBasis: "team_tasting" | "official_description" | "review_research";
  allergyInfo?: string;

  availabilityScope: AvailabilityScope;
  /** 상품/가격 정보를 확인한 공식 출처 URL. */
  sourceUrl: string;
  /** 위 정보를 마지막으로 확인한 날짜 (YYYY-MM-DD). */
  verifiedAt: string;
  verificationStatus: VerificationStatus;

  /**
   * @deprecated verificationStatus를 사용한다. 기존 코드 호환을 위해 유지하며
   * verificationStatus !== "verified"와 항상 동일한 값을 가져야 한다.
   */
  isMock: boolean;
}

// ─── Recommendation ──────────────────────────────────────
export interface RecommendedProduct extends Product {
  score: number;
  rank: number;
  reasonTag: string;
}

// ─── Analytics ───────────────────────────────────────────
export type AnalyticsEvent =
  | "home_view"
  | "store_select"
  | "situation_view"
  | "situation_select"
  | "filter_apply"
  | "recommendation_request"
  | "recommendation_view"
  | "recommendation_card_click"
  | "product_detail_view"
  | "choice_click"
  | "choice_confirm"
  | "choice_complete_view"
  | "stock_check_click"
  | "stock_fake_door_view"
  | "stock_feedback"
  | "package_match_feedback"
  | "visit_start"
  | "nearby_search_click"
  | "nearby_search_result"
  | "nearby_search_error"
  | "store_info_click"
  | "companion_product_view"
  | "companion_product_click"
  | "nps_submit"
  | "share_click"
  | "share_complete"
  | "web_vital"
  | "app_error"
  | "error_retry";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;
