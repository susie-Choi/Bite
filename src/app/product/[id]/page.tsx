"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { trackEvent, getDecisionTimeMs } from "@/lib/analytics";
import { getProductById } from "@/lib/recommendation";
import { CookingMethod, StoreId, SituationId } from "@/types";

function ProductDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const storeId = (searchParams.get("store") || "life_namba") as StoreId;
  const situationId = (searchParams.get("situation") || "hearty_meal") as SituationId;
  const rank = parseInt(searchParams.get("rank") || "1");

  const product = getProductById(productId);
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (product) {
      trackEvent("product_detail_view", {
        product_id: product.id,
        rank,
        store_id: storeId,
        situation_id: situationId,
      });
    }
  }, [product, rank, storeId, situationId]);

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

  const handleChoiceClick = () => {
    trackEvent("choice_click", {
      product_id: product.id,
      rank,
      store_id: storeId,
      situation_id: situationId,
      price: product.priceYen || 0,
    });
    setShowChoice(true);

    const decisionTime = getDecisionTimeMs();
    trackEvent("choice_confirm", {
      product_id: product.id,
      decision_time_ms: decisionTime || 0,
      rank,
    });

    // Navigate to completion page
    router.push(
      `/product/${product.id}/complete?store=${storeId}&situation=${situationId}&rank=${rank}`
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          목록
        </button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-surface-subtle">
        <Image
          src={product.image}
          alt={product.nameKo}
          fill
          className="object-cover"
          sizes="430px"
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 px-5 pb-32 pt-5">
        {/* Name & Price */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text">{product.nameKo}</h1>
            <p className="mt-0.5 text-sm text-text-tertiary">
              {product.nameJa}
            </p>
          </div>
          {product.priceYen && (
            <p className="text-xl font-bold text-primary-600">
              ¥{product.priceYen.toLocaleString()}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          {product.descriptionKo}
        </p>

        {/* Details */}
        <div className="mt-6 space-y-3 rounded-2xl bg-surface-subtle p-4">
          <DetailRow label="맛 특징" value={product.tasteSummary} />
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
              value={
                "🌶️".repeat(product.spicy) + ` (${product.spicy}/5)`
              }
            />
          )}
          <DetailRow label="조리" value={cookingLabels[product.cooking]} />
          <DetailRow
            label="휴대"
            value={product.portable ? "이동 중 섭취 가능" : "앉아서 먹기 권장"}
          />
          <DetailRow
            label="추천 상황"
            value={product.tags.join(", ")}
          />
          {product.allergyInfo && (
            <DetailRow label="알레르기" value={product.allergyInfo} />
          )}
        </div>

        {/* Mock notice */}
        {product.isMock && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-700">
            MVP 추천 데이터이며 실제 매장 가격·취급 여부와 다를 수 있습니다.
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
