"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { trackEvent, getDecisionTimeMs } from "@/lib/analytics";
import { getCompanionProducts, getProductById } from "@/lib/recommendation";
import { getCurrentTrip, recordChoiceForCurrentTrip } from "@/lib/tripStorage";
import {
  getAvailabilityLabel,
  getAvailabilityTone,
  getVerificationLabel,
  hasPlaceholderImageOnly,
} from "@/lib/productTrust";
import { CookingMethod, Product, StoreId, SituationId } from "@/types";

const TASTE_BASIS_LABEL: Record<string, string> = {
  team_tasting: "팀이 직접 시식한 평가",
  official_description: "공식 상품 설명 기반 요약",
  review_research: "여러 리뷰를 조사한 요약",
};

function ProductDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const storeId = (searchParams.get("store") || "life_namba") as StoreId;
  const situationId = (searchParams.get("situation") || "hearty_meal") as SituationId;
  const rank = parseInt(searchParams.get("rank") || "1");
  const entrySource = searchParams.get("source") || "recommendation";

  const product = getProductById(productId);
  const companionProducts = useMemo(
    () => getCompanionProducts(productId, 2),
    [productId]
  );
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (product) {
      trackEvent("product_detail_view", {
        product_id: product.id,
        rank,
        store_id: storeId,
        situation_id: situationId,
        entry_source: entrySource,
      });
    }
  }, [product, rank, storeId, situationId, entrySource]);

  useEffect(() => {
    if (product && companionProducts.length > 0) {
      trackEvent("companion_product_view", {
        product_id: product.id,
        result_count: companionProducts.length,
      });
    }
  }, [product, companionProducts.length]);

  if (!product) {
    return (
      <div className="page-container flex flex-col items-center justify-center pt-20 text-center">
        <span className="text-4xl">😢</span>
        <p className="mt-4 font-semibold text-text">상품을 찾을 수 없어요.</p>
        <button
          onClick={() => router.push("/")}
          className="btn-secondary mt-6 !w-auto"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const noPhotoYet = hasPlaceholderImageOnly(product);
  const primaryImageKind = product.images[0]?.kind;
  const productImageAlt = noPhotoYet
    ? `${product.nameKo} 이미지 준비 중`
    : primaryImageKind === "package_front"
      ? `${product.nameKo} 패키지 정면`
      : `${product.nameKo} 공식 상품 참고 이미지`;

  const handleChoiceClick = () => {
    trackEvent("choice_click", {
      product_id: product.id,
      rank,
      store_id: storeId,
      situation_id: situationId,
      price: product.priceYen || 0,
    });
    setShowChoice(true);

    const currentTrip = getCurrentTrip();
    const savedChoice = recordChoiceForCurrentTrip({
      productId: product.id,
      storeId,
      situationId,
    });
    const decisionTime = getDecisionTimeMs();
    trackEvent("choice_confirm", {
      product_id: product.id,
      decision_time_ms: decisionTime || 0,
      rank,
      trip_attached: Boolean(savedChoice),
      destination_id: currentTrip?.destinationId,
    });

    router.push(
      `/product/${product.id}/complete?store=${storeId}&situation=${situationId}&rank=${rank}`
    );
  };

  const handlePackageMatchFeedback = (value: "matched" | "not_matched") => {
    trackEvent("package_match_feedback", { product_id: product.id, value });
  };

  const handleCompanionClick = (companion: Product, position: number) => {
    trackEvent("companion_product_click", {
      source_product_id: product.id,
      target_product_id: companion.id,
      position,
      store_id: companion.storeId,
    });
    router.push(
      `/product/${companion.id}?store=${companion.storeId}&situation=${situationId}&rank=0&source=companion`
    );
  };

  const cookingLabels: Record<CookingMethod, string> = {
    none: "조리 필요 없음 ✓",
    microwave: "전자레인지 필요",
    hot_water: "뜨거운 물 필요",
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-white/90 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-text-secondary"
          aria-label="뒤로 가기"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          목록
        </button>
      </div>

      {/* Product Image: 패키지 식별을 위해 object-contain, 잘리지 않게 여백 확보 */}
      <div className="relative aspect-square w-full bg-surface-subtle">
        <Image
          src={product.image}
          alt={productImageAlt}
          fill
          className="object-contain p-6"
          sizes="430px"
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
          }}
        />
        {noPhotoYet && (
          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-2 text-center text-xs text-white">
            실제 상품 사진을 아직 확보하지 못했습니다. 매장에서는 아래 정보로 상품을 확인해주세요.
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 px-5 pb-32 pt-5">
        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityTone(
              product.availabilityScope
            )}`}
          >
            {getAvailabilityLabel(product.availabilityScope)}
          </span>
          <span className="inline-flex items-center rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-secondary ring-1 ring-black/5">
            {getVerificationLabel(product.verificationStatus)}
          </span>
        </div>

        {/* Name & Price */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text">{product.nameKo}</h1>
            <p className="mt-0.5 text-sm text-text-tertiary">
              {product.nameJa}
            </p>
            {product.manufacturer && (
              <p className="mt-0.5 text-xs text-text-tertiary">
                제조·판매: {product.manufacturer}
              </p>
            )}
          </div>
          {product.priceYen && (
            <p className="text-xl font-bold text-primary-600">
              ¥{product.priceYen.toLocaleString()}
              {product.taxIncluded && (
                <span className="ml-1 text-xs font-normal text-text-tertiary">
                  (세금 포함)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          {product.descriptionKo}
        </p>

        {/* 매장에서 상품을 찾을 때 도움이 되는 식별 정보 */}
        <div className="mt-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-4">
          <p className="text-xs font-semibold text-primary-700">
            매장에서 이 상품 찾을 때
          </p>
          <p className="mt-1.5 text-sm text-text">
            일본어 정식 명칭 <span className="font-semibold">「{product.nameJa}」</span>을
            진열대 라벨과 비교하세요. {noPhotoYet
              ? "사진을 확보하기 전까지 상품명과 제조사를 함께 확인해주세요."
              : primaryImageKind === "package_front"
                ? "위 사진의 포장 색상과 정면 라벨도 함께 확인하면 더 쉽게 찾을 수 있어요."
                : "위 공식 이미지의 용기와 음식 구성을 함께 확인하면 더 쉽게 찾을 수 있어요."}
          </p>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-3 rounded-2xl bg-surface-subtle p-4">
          <DetailRow
            label="맛 특징"
            value={product.tasteSummary}
          />
          <DetailRow
            label="설명 근거"
            value={TASTE_BASIS_LABEL[product.tasteBasis]}
          />
          <DetailRow
            label="포만감"
            value={
              "●".repeat(product.fullness) +
              "○".repeat(5 - product.fullness) +
              ` (${product.fullness}/5)`
            }
          />
          {product.spicy > 0 && (
            <DetailRow
              label="매운맛"
              value={"🌶️".repeat(product.spicy) + ` (${product.spicy}/5)`}
            />
          )}
          <DetailRow label="조리" value={cookingLabels[product.cooking]} />
          <DetailRow
            label="휴대"
            value={product.portable ? "이동 중 섭취 가능" : "앉아서 먹기 권장"}
          />
          <DetailRow label="추천 상황" value={product.tags.join(", ")} />
          {product.allergyInfo && (
            <DetailRow label="알레르기" value={product.allergyInfo} />
          )}
          <DetailRow
            label="정보 확인일"
            value={`${product.verifiedAt} 공식 사이트 기준`}
          />
        </div>

        {/* Source link */}
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-primary-600 underline"
        >
          공식 출처 페이지에서 확인하기 ↗
        </a>

        {/* Companion products */}
        {companionProducts.length > 0 && (
          <section className="mt-7" aria-labelledby="companion-heading">
            <h2 id="companion-heading" className="text-base font-bold text-text">
              같이 고르기 좋은 상품
            </h2>
            <p className="mt-1 text-xs text-text-tertiary">
              같은 매장에서 함께 확인할 수 있는 검증 상품이에요.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {companionProducts.map((companion, index) => (
                <button
                  key={companion.id}
                  type="button"
                  onClick={() => handleCompanionClick(companion, index + 1)}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 text-left transition-colors active:bg-surface-subtle"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
                    <Image
                      src={companion.image}
                      alt={companion.nameKo}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {companion.nameKo}
                    </p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {companion.category}
                    </p>
                    {companion.priceYen && (
                      <p className="mt-1 text-sm font-semibold text-primary-600">
                        ¥{companion.priceYen.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="text-text-tertiary" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Package match feedback */}
        {!noPhotoYet && (
          <div className="mt-5 rounded-xl bg-surface-subtle p-3">
            <p className="text-xs font-medium text-text-secondary">
              이 사진이 매장 진열대 상품과 일치했나요?
            </p>
            <div className="mt-2 flex gap-2">
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() => handlePackageMatchFeedback("matched")}
              >
                맞았어요
              </button>
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() => handlePackageMatchFeedback("not_matched")}
              >
                달랐어요
              </button>
            </div>
          </div>
        )}

        {/* Mock notice */}
        {product.isMock && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-700">
            가격·판매 범위는 체인 공식 사이트 기준이며 이 지점의 실제 취급 여부와 다를 수 있습니다.
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-mobile -translate-x-1/2 border-t bg-white/95 px-5 pb-6 pt-4 backdrop-blur-sm">
        <button
          onClick={handleChoiceClick}
          disabled={showChoice}
          className="btn-primary"
        >
          {showChoice ? "선택 완료! ✓" : "이거 살래요"}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex-shrink-0 text-xs font-medium text-text-tertiary">
        {label}
      </span>
      <span className="text-right text-sm text-text">{value}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container flex items-center justify-center pt-20">
          <p className="text-text-tertiary">로딩 중...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
