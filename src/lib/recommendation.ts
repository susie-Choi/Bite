import {
  Product,
  RecommendedProduct,
  StoreId,
  SituationId,
  FilterOptions,
} from "@/types";
import { products } from "@/data/products";

const REASON_TAG_MAP: Record<string, string> = {
  light_breakfast: "아침 추천",
  hearty_meal: "든든한 한 끼",
  late_night: "야식 추천",
  on_the_go: "바로 먹기 좋음",
  with_alcohol: "술 안주",
  budget_friendly: "가성비",
};

/**
 * Rule-based 추천 점수 계산
 */
function calculateScore(
  product: Product,
  storeId: StoreId,
  situationId: SituationId,
  filters: FilterOptions
): number {
  let score = 0;

  // 매장 매칭 (필수 조건이지만 점수도 부여)
  if (product.storeId === storeId) {
    score += 10;
  } else {
    return -1; // 다른 매장 상품은 제외
  }

  // 상황 매칭
  if (product.situations.includes(situationId)) {
    score += 8;
  }

  // 가격 필터
  if (filters.maxPrice !== null) {
    if (product.priceYen !== null && product.priceYen <= filters.maxPrice) {
      score += 3;
    } else if (product.priceYen !== null && product.priceYen > filters.maxPrice) {
      score -= 5; // 예산 초과 감점
    }
  }

  // 조리 조건 매칭
  if (filters.cooking !== null) {
    if (product.cooking === filters.cooking) {
      score += 3;
    } else if (filters.cooking === "none" && product.cooking !== "none") {
      score -= 3; // 조리 불가 상황에서 조리 필요 상품 감점
    }
  }

  // 이동 중 상황에서 휴대성 보너스
  if (situationId === "on_the_go" && product.portable) {
    score += 4;
  }

  // 가성비 상황에서 저가 보너스
  if (situationId === "budget_friendly" && product.priceYen !== null) {
    if (product.priceYen <= 200) score += 3;
    else if (product.priceYen <= 350) score += 2;
  }

  return score;
}

/**
 * 추천 상품 리스트를 반환합니다.
 */
export function getRecommendations(
  storeId: StoreId,
  situationId: SituationId,
  filters: FilterOptions = { maxPrice: null, cooking: null }
): RecommendedProduct[] {
  const scored = products
    .map((product) => ({
      product,
      score: calculateScore(product, storeId, situationId, filters),
    }))
    .filter(({ score }) => score > 0)
    // 예산 초과 상품 필터링
    .filter(({ product }) => {
      if (filters.maxPrice === null) return true;
      if (product.priceYen === null) return true;
      return product.priceYen <= filters.maxPrice;
    })
    // 조리 조건 엄격 필터링
    .filter(({ product }) => {
      if (filters.cooking === null) return true;
      if (filters.cooking === "none") return product.cooking === "none";
      return true; // microwave/hot_water 선택 시에는 모든 상품 포함 (감점은 했음)
    })
    .sort((a, b) => {
      // 점수 내림차순, 동점 시 랜덤
      if (b.score !== a.score) return b.score - a.score;
      return Math.random() - 0.5;
    });

  return scored.map(({ product, score }, index) => ({
    ...product,
    score,
    rank: index + 1,
    reasonTag:
      REASON_TAG_MAP[situationId] || product.tags[0] || "추천",
  }));
}

/**
 * ID로 상품을 조회합니다.
 */
export function getProductById(productId: string): Product | undefined {
  return products.find((p) => p.id === productId);
}
