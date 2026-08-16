"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { situations } from "@/data/situations";
import { trackEvent } from "@/lib/analytics";
import {
  SituationId,
  CookingMethod,
  MaxPrice,
  StoreId,
} from "@/types";

function SituationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = (searchParams.get("store") || "life_namba") as StoreId;

  const [selectedSituation, setSelectedSituation] =
    useState<SituationId | null>(null);
  const [maxPrice, setMaxPrice] = useState<MaxPrice>(null);
  const [cooking, setCooking] = useState<CookingMethod | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    trackEvent("situation_view", { store_id: storeId });
  }, [storeId]);

  const handleSituationSelect = (situationId: SituationId) => {
    setSelectedSituation(situationId);
    trackEvent("situation_select", {
      store_id: storeId,
      situation_id: situationId,
    });
  };

  const handleSubmit = () => {
    if (!selectedSituation) return;

    if (maxPrice || cooking) {
      trackEvent("filter_apply", {
        max_price: maxPrice || 0,
        cooking: cooking || "any",
      });
    }

    trackEvent("recommendation_request", {
      store_id: storeId,
      situation_id: selectedSituation,
    });

    const params = new URLSearchParams({
      store: storeId,
      situation: selectedSituation,
    });
    if (maxPrice) params.set("maxPrice", maxPrice.toString());
    if (cooking) params.set("cooking", cooking);

    router.push(`/recommendations?${params.toString()}`);
  };

  const priceOptions: { value: MaxPrice; label: string }[] = [
    { value: null, label: "상관없음" },
    { value: 500, label: "500엔 이하" },
    { value: 700, label: "700엔 이하" },
    { value: 1000, label: "1,000엔 이하" },
  ];

  const cookingOptions: { value: CookingMethod | null; label: string }[] = [
    { value: null, label: "상관없음" },
    { value: "none", label: "조리 필요 없음" },
    { value: "microwave", label: "전자레인지 가능" },
    { value: "hot_water", label: "뜨거운 물 가능" },
  ];

  return (
    <div className="page-container flex flex-col pt-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 self-start text-sm text-text-secondary"
        aria-label="뒤로 가기"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        매장 선택
      </button>

      {/* Title */}
      <h1 className="text-xl font-bold text-text">지금 어떤 상황인가요?</h1>
      <p className="mt-1 text-sm text-text-secondary">
        상황에 맞는 상품을 추천해드릴게요
      </p>

      {/* Situation Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {situations.map((situation) => (
          <button
            key={situation.id}
            onClick={() => handleSituationSelect(situation.id)}
            className={`flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all ${
              selectedSituation === situation.id
                ? "border-primary-500 bg-primary-50"
                : "border-transparent bg-surface-subtle active:bg-surface-muted"
            }`}
            aria-pressed={selectedSituation === situation.id}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {situation.emoji}
            </span>
            <span className="mt-2 text-sm font-semibold text-text">
              {situation.label}
            </span>
            <span className="mt-0.5 text-xs text-text-tertiary">
              {situation.description}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Toggle */}
      {selectedSituation && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-6 flex items-center gap-1 self-start text-sm font-medium text-primary-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          {showFilters ? "조건 닫기" : "조건 추가하기"}
        </button>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 space-y-5 rounded-2xl bg-surface-subtle p-4">
          {/* Price Filter */}
          <div>
            <p className="mb-2 text-sm font-semibold text-text">최대 가격</p>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setMaxPrice(opt.value)}
                  className={`chip ${
                    maxPrice === opt.value ? "chip-active" : "chip-inactive"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Filter */}
          <div>
            <p className="mb-2 text-sm font-semibold text-text">조리 조건</p>
            <div className="flex flex-wrap gap-2">
              {cookingOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setCooking(opt.value)}
                  className={`chip ${
                    cooking === opt.value ? "chip-active" : "chip-inactive"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-8">
        <button
          onClick={handleSubmit}
          disabled={!selectedSituation}
          className="btn-primary"
        >
          추천 보기
        </button>
      </div>
    </div>
  );
}

export default function SituationPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container flex items-center justify-center pt-20">
          <p className="text-text-tertiary">로딩 중...</p>
        </div>
      }
    >
      <SituationContent />
    </Suspense>
  );
}
