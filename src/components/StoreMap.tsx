"use client";

import Image from "next/image";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Store } from "@/types";

interface StoreMapProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
}

// 오사카 중심 좌표 (난바~우메다 중간)
const OSAKA_CENTER = { lat: 34.678, lng: 135.502 };

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
      {stores.map((store) => (
        <AdvancedMarker
          key={store.id}
          position={{ lat: store.lat, lng: store.lng }}
          onClick={() => onStoreSelect(store)}
          title={`${store.nameKo} (${store.typeLabel})`}
        >
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-white bg-white p-0.5 shadow-md transition-transform hover:scale-110"
            aria-hidden="true"
          >
            <Image
              src={store.image}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-md object-contain"
            />
          </div>
        </AdvancedMarker>
      ))}
    </Map>
  );
}

export default function StoreMap({ stores, onStoreSelect }: StoreMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // API 키가 없으면 실제 지도와 같은 높이의 폴백 UI를 표시한다.
  if (!apiKey) {
    return (
      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-surface-subtle">
        <p className="px-5 text-center text-sm text-text-tertiary">
          지도를 표시하려면 Google Maps API 키가 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <APIProvider apiKey={apiKey}>
          <MapContent stores={stores} onStoreSelect={onStoreSelect} />
        </APIProvider>
      </div>

      <p className="mt-2 px-1 text-xs text-text-tertiary">
        지도에서 매장 로고를 누르면 해당 매장을 선택할 수 있어요.
      </p>
    </div>
  );
}
