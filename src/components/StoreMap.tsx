"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Store } from "@/types";

interface StoreMapProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
}

// 오사카 중심 좌표 (난바~우메다 중간)
const OSAKA_CENTER = { lat: 34.6780, lng: 135.5020 };

function MapContent({ stores, onStoreSelect }: StoreMapProps) {
  return (
    <Map
      defaultCenter={OSAKA_CENTER}
      defaultZoom={13}
      gestureHandling="cooperative"
      disableDefaultUI={true}
      zoomControl={true}
      mapId="osaka-store-map"
      className="h-full w-full rounded-2xl"
    >
      {stores.map((store) => {
        const isSupermarket = store.type === "supermarket";

        return (
          <AdvancedMarker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            onClick={() => onStoreSelect(store)}
            title={`${store.nameKo} (${store.typeLabel})`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-xs font-bold text-white shadow-lg ${
                  isSupermarket ? "bg-blue-600" : "bg-red-500"
                }`}
              >
                {isSupermarket ? "M" : "C"}
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
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-surface-subtle">
        <p className="text-sm text-text-tertiary">
          지도를 표시하려면 Google Maps API 키가 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-48 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <APIProvider apiKey={apiKey}>
          <MapContent stores={stores} onStoreSelect={onStoreSelect} />
        </APIProvider>
      </div>

      {/* 범례 */}
      <div className="mt-2 flex items-center gap-x-4 px-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
          마트
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
          편의점
        </span>
      </div>
    </div>
  );
}
