"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { stores } from "@/data/stores";
import { products } from "@/data/products";
import { Store } from "@/types";
import { trackEvent, markSessionStart } from "@/lib/analytics";
import StoreMap from "@/components/StoreMap";

/** 검증된 상품을 하나 이상 보유해 실제 추천을 제공할 수 있는 매장만 홈에 노출한다. */
const availableStoreIds = new Set(
  products
    .filter((product) => product.verificationStatus === "verified")
    .map((product) => product.storeId)
);

const availableStores = stores.filter((store) => availableStoreIds.has(store.id));

function StoreGridItem({
  store,
  onClick,
}: {
  store: Store;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-surface-subtle p-3 text-center transition-all active:scale-95 active:bg-primary-50"
      aria-label={`${store.nameKo} 선택`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1">
        <Image
          src={store.image}
          alt={store.nameKo}
          width={36}
          height={36}
          className="object-contain"
        />
      </div>
      <p className="text-xs font-semibold leading-tight text-text">
        {store.nameKo.replace("세븐일레븐", "세븐").replace("패밀리마트", "패밀마")}
      </p>
      <p className="text-[10px] text-text-tertiary">{store.typeLabel}</p>
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
      <div className="relative -mx-5 h-48 overflow-hidden">
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
      <div className="mt-3">
        <h1 className="text-2xl font-bold text-text">여행한끼</h1>
        <p className="mt-1.5 text-base leading-relaxed text-text-secondary">
          여행지 마트에서, 오늘 뭐 먹지?
        </p>
      </div>

      {/* Map */}
      <section className="mt-6" aria-labelledby="store-heading">
        <h2 id="store-heading" className="sr-only">
          매장 선택
        </h2>

        <StoreMap stores={availableStores} onStoreSelect={handleStoreSelect} />

        {/* Store Grid - 3 columns */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {availableStores.map((store) => (
            <StoreGridItem
              key={store.id}
              store={store}
              onClick={() => handleStoreSelect(store)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <p className="mt-auto pt-8 text-center text-xs text-text-tertiary">
        team 118
      </p>
    </div>
  );
}
