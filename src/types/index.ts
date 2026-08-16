// ─── Store ───────────────────────────────────────────────
export type StoreId = "life_namba" | "lawson_namba";
export type StoreType = "supermarket" | "convenience";

export interface Store {
  id: StoreId;
  nameKo: string;
  nameEn: string;
  type: StoreType;
  typeLabel: string;
  address: string;
  image: string;
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

// ─── Product ─────────────────────────────────────────────
export interface Product {
  id: string;
  storeId: StoreId;
  nameKo: string;
  nameJa: string;
  category: string;
  priceYen: number | null;
  fullness: 1 | 2 | 3 | 4 | 5;
  spicy: 0 | 1 | 2 | 3 | 4 | 5;
  cooking: CookingMethod;
  portable: boolean;
  situations: SituationId[];
  tags: string[];
  image: string;
  descriptionKo: string;
  tasteSummary: string;
  allergyInfo?: string;
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
  | "stock_fake_door_view";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;
