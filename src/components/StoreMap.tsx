"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Store, StoreId } from "@/types";

interface StoreMapProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
}

// 난바 매장의 실제 좌표
const storeCoordinates: Record<StoreId, { lat: number; lng: number }> = {
  life_namba: { lat: 34.6595, lng: 135.5013 }, // Central Square LIFE Namba
  lawson_namba: { lat: 34.6612, lng: 135.5018 }, // Lawson Naniwa Minatomachi
};

// 난바 중심 좌표
const NAMBA_CENTER = { lat: 34.6603, lng: 135.5016 };

function MapContent({ stores, onStoreSelect }: StoreMapProps) {
  return (
    <Map
      defaultCenter={NAMBA_CENTER}
      defaultZoom={16}
      gestureHandling="cooperative"
      disableDefaultUI={true}
      zoomControl={true}
      mapId="namba-store-map"
      className="h-full w-full rounded-2xl"
    >
      {stores.map((store) => {
        const position = storeCoordinates[store.id];
        const isSupermarket = store.type === "supermarket";

        return (
          <AdvancedMarker
            key={store.id}
            position={position}
            onClick={() => onStoreSelect(store)}
            title={`${store.nameKo} (${store.typeLabel})`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-sm font-bold text-white shadow-lg ${
                  isSupermarket ? "bg-blue-600" : "bg-red-500"
                }`}
              >
                {isSupermarket ? "M" : "C"}
              </div>
              <div className="mt-1 whitespace-nowrap rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-text shadow-md">
                {store.nameKo}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}

export default function StoreMap({ stores, onStoreSelect }: StoreMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // API 키가 없으면 폴백 UI
  if (!apiKey) {
    return (
      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-surface-subtle">
        <p className="text-sm text-text-tertiary">
          지도를 표시하려면 Google Maps API 키가 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-56 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <APIProvider apiKey={apiKey}>
          <MapContent stores={stores} onStoreSelect={onStoreSelect} />
        </APIProvider>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
          마트
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
          편의점
        </span>
        <span className="ml-auto text-text-tertiary">마커를 눌러 선택</span>
      </div>
    </div>
  );
}
