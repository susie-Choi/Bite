"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { getRecommendations } from "@/lib/recommendation";
import { situations } from "@/data/situations";
import { getAvailabilityLabel, getAvailabilityTone, hasPlaceholderImageOnly } from "@/lib/productTrust";
import {
  StoreId,
  SituationId,
  CookingMethod,
  MaxPrice,
  RecommendedProduct,
} from "@/types";

function ProductCard({
  product,
  onClick,
}: {
  product: RecommendedProduct;
  onClick: () => void;
}) {
  const cookingLabel: Record<CookingMethod, string> = {
    none: "바로 먹기",
    microwave: "전자레인지",
    hot_water: "뜨거운 물",
  };
  const noPhotoYet = hasPlaceholderImageOnly(product);

  return (
    <button
      onClick={onClick}
      className="card flex w-full gap-3 text-left"
      aria-label={`${product.nameKo} 상세 보기`}
    >
      {/* Image: 패키지 식별을 위해 object-contain 사용, 잘리지 않도록 */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
        <Image
          src={product.image}
          alt={`${product.nameKo} 패키지`}
          fill
          className="object-contain p-2"
          sizes="96px"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
          }}
        />
        {noPhotoYet && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
            실제 사진 준비 중
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text leading-tight">
              {product.nameKo}
            </p>
            <span className="chip chip-active flex-shrink-0 !px-2 !py-0.5 !text-xs">
              {product.reasonTag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-tertiary">{product.nameJa}</p>
          {product.manufacturer && (
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              {product.manufacturer}
            </p>
          )}
          <p className="mt-1 text-xs text-text-secondary line-clamp-1">
            {product.tasteSummary}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {product.priceYen && (
            <span className="font-semibold text-primary-600">
              ¥{product.priceYen.toLocaleString()}
            </span>
          )}
          <span>포만감 {"●".repeat(product.fullness)}{"○".repeat(5 - product.fullness)}</span>
          <span>{cookingLabel[product.cooking]}</span>
        </div>
        <span
          className={`mt-1.5 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getAvailabilityTone(
            product.availabilityScope
          )}`}
        >
          {getAvailabilityLabel(product.availabilityScope)}
        </span>
      </div>
    </button>
  );
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = (searchParams.get("store") || "life_namba") as StoreId;
  const situationId = (searchParams.get("situation") ||
    "hearty_meal") as SituationId;
  const maxPriceParam = searchParams.get("maxPrice");
  const cookingParam = searchParams.get("cooking");

  const maxPrice = maxPriceParam
    ? (parseInt(maxPriceParam) as MaxPrice)
    : null;
  const cooking = (cookingParam as CookingMethod) || null;

  const situation = situations.find((s) => s.id === situationId);

  const recommendations = useMemo(
    () => getRecommendations(storeId, situationId, { maxPrice, cooking }),
    [storeId, situationId, maxPrice, cooking]
  );

  useEffect(() => {
    trackEvent("recommendation_view", {
      store_id: storeId,
      situation_id: situationId,
      result_count: recommendations.length,
    });
  }, [storeId, situationId, recommendations.length]);

  const handleCardClick = (product: RecommendedProduct) => {
    trackEvent("recommendation_card_click", {
      product_id: product.id,
      rank: product.rank,
      store_id: storeId,
      situation_id: situationId,
    });
    router.push(
      `/product/${product.id}?store=${storeId}&situation=${situationId}&rank=${product.rank}`
    );
  };

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center pt-20 text-center">
        <span className="text-4xl">🤔</span>
        <p className="mt-4 font-semibold text-text">
          조건에 딱 맞는 상품을 찾지 못했어요.
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          가격 또는 조리 조건을 조금 넓혀보세요.
        </p>
        <button
          onClick={() => router.back()}
          className="btn-secondary mt-6 !w-auto"
        >
          조건 다시 선택하기
        </button>
      </div>
    );
  }

  return (
    <div className="page-container pt-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-text-secondary"
        aria-label="뒤로 가기"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        상황 선택
      </button>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">
          {situation?.emoji} {situation?.label}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {recommendations.length}개의 추천 상품
        </p>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleCardClick(product)}
          />
        ))}
      </div>

      {/* Data trust notice */}
      <p className="mt-6 text-center text-xs text-text-tertiary">
        가격·판매 범위는 체인 공식 사이트 기준이며 지점별 실제 취급 여부와 다를 수 있습니다.
        상품 사진은 아직 실제 패키지 사진이 아닌 준비 중 상태입니다.
      </p>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container flex items-center justify-center pt-20">
          <p className="text-text-tertiary">추천을 준비하고 있어요...</p>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
