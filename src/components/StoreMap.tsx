import { Store, StoreId } from "@/types";

interface StoreMapProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
}

const markerPositions: Record<StoreId, { left: string; top: string }> = {
  life_namba: { left: "29%", top: "61%" },
  lawson_namba: { left: "68%", top: "39%" },
};

export default function StoreMap({ stores, onStoreSelect }: StoreMapProps) {
  return (
    <div>
      <div
        className="relative h-52 overflow-hidden rounded-3xl border border-stone-200 bg-[#f4f1ea] shadow-sm"
        role="group"
        aria-label="오사카 난바 추천 지원 매장 지도"
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 390 208"
          preserveAspectRatio="none"
        >
          <rect width="390" height="208" fill="#F4F1EA" />
          <path d="M0 39H390M0 164H390" stroke="#E3DED3" strokeWidth="10" />
          <path d="M72 0V208M307 0V208" stroke="#E3DED3" strokeWidth="12" />
          <path d="M0 97L390 121" stroke="#FFFFFF" strokeWidth="18" />
          <path d="M165 0L192 208" stroke="#FFFFFF" strokeWidth="15" />
          <path d="M0 97L390 121" stroke="#D6D0C5" strokeWidth="1.5" strokeDasharray="7 6" />
          <path d="M165 0L192 208" stroke="#D6D0C5" strokeWidth="1.5" strokeDasharray="7 6" />
          <rect x="218" y="26" width="55" height="31" rx="5" fill="#E5E7DF" />
          <rect x="91" y="130" width="47" height="28" rx="5" fill="#E5E7DF" />
          <rect x="245" y="145" width="72" height="31" rx="5" fill="#E5E7DF" />
          <path d="M344 0V208" stroke="#BBD9E8" strokeWidth="35" opacity=".8" />
          <text x="16" y="25" fill="#78716C" fontSize="11" fontWeight="600">오사카 · 난바</text>
          <text x="319" y="195" fill="#6F9EB7" fontSize="9">도톤보리 방향</text>
        </svg>

        <div className="absolute left-3 top-9 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-sm backdrop-blur">
          추천 정보 제공 매장 2곳
        </div>

        {stores.map((store) => {
          const position = markerPositions[store.id];
          const isSupermarket = store.type === "supermarket";

          return (
            <button
              key={store.id}
              type="button"
              onClick={() => onStoreSelect(store)}
              className="group absolute -translate-x-1/2 -translate-y-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200"
              style={position}
              aria-label={`${store.nameKo}, ${store.typeLabel} 선택`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-white text-lg text-white shadow-lg transition-transform group-active:scale-90 ${
                  isSupermarket ? "bg-blue-600" : "bg-red-500"
                }`}
                aria-hidden="true"
              >
                {isSupermarket ? "M" : "C"}
              </span>
              <span className="absolute left-1/2 top-12 w-max max-w-32 -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-text shadow-md">
                {store.nameKo}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
          마트
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
          편의점
        </span>
        <span className="ml-auto text-text-tertiary">아이콘을 눌러 선택</span>
      </div>
    </div>
  );
}
