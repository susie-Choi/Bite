"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { stores } from "@/data/stores";
import { Store } from "@/types";
import { trackEvent, markSessionStart } from "@/lib/analytics";
import StoreMap from "@/components/StoreMap";

function StoreCard({ store, onClick }: { store: Store; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card flex w-full items-center gap-4 text-left"
      aria-label={`${store.nameKo} 선택`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle">
        <span className="text-2xl" role="img" aria-hidden="true">
          {store.type === "supermarket" ? "🏬" : "🏪"}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-text">{store.nameKo}</p>
        <p className="text-sm text-text-secondary">{store.typeLabel}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">{store.address}</p>
      </div>
      <svg
        className="h-5 w-5 text-text-tertiary"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    markSessionStart();
    trackEvent("home_view", { source: "direct" });
  }, []);

  const handleStoreSelect = (store: Store) => {
    trackEvent("store_select", {
      store_id: store.id,
      store_type: store.type,
    });
    router.push(`/situation?store=${store.id}`);
  };

  return (
    <div className="page-container flex flex-col">
      {/* Hero */}
      <div className="relative -mx-5 h-56 overflow-hidden">
        <Image
          src="/images/meal.jpeg"
          alt="여행지에서 즐기는 간편한 한 끼"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-text">여행한끼</h1>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          여행지 마트에서, 오늘 뭐 먹지?
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          지금 있는 매장에서 실패 없는 한 끼를 골라드려요.
        </p>
      </div>

      {/* Store Selection */}
      <section className="mt-8" aria-labelledby="store-heading">
        <h2 id="store-heading" className="section-title">
          난바에서 지원하는 매장이에요
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          지도 또는 목록에서 현재 방문한 매장을 선택하세요.
        </p>

        <div className="mt-4">
          <StoreMap stores={stores} onStoreSelect={handleStoreSelect} />
        </div>

        <div className="mt-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-stone-200" />
          <span className="text-xs text-text-tertiary">매장 목록</span>
          <span className="h-px flex-1 bg-stone-200" />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onClick={() => handleStoreSelect(store)}
            />
          ))}
        </div>

        <p className="mt-4 rounded-xl bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-700">
          현재 위치나 실시간 재고를 표시하는 지도가 아니며, 여행한끼가 추천 정보를 제공하는 MVP 테스트 매장입니다.
        </p>
      </section>

      {/* Footer note */}
      <p className="mt-auto pt-8 text-center text-xs text-text-tertiary">
        team 118
      </p>
    </div>
  );
}
