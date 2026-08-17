"use client";

import Image from "next/image";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Store } from "@/types";
import { GeoPoint, getDistanceMeters } from "@/lib/geo";

interface StoreMapProps {
  stores: Store[];
  onStoreSelect: (store: Store) => void;
  userLocation?: GeoPoint | null;
}

// 오사카 중심 좌표 (난바~우메다 중간)
const OSAKA_CENTER = { lat: 34.678, lng: 135.502 };
const MAX_LOCATION_FOCUS_DISTANCE_METERS = 50_000;

function MapContent({ stores, onStoreSelect, userLocation }: StoreMapProps) {
  const showUserLocation = Boolean(
    userLocation &&
      stores.some(
        (store) =>
          getDistanceMeters(userLocation, { lat: store.lat, lng: store.lng }) <=
          MAX_LOCATION_FOCUS_DISTANCE_METERS
      )
  );
  const mapCenter = showUserLocation && userLocation ? userLocation : OSAKA_CENTER;
  const mapKey = showUserLocation && userLocation
    ? `${userLocation.lat.toFixed(4)}-${userLocation.lng.toFixed(4)}`
    : "osaka";

  return (
    <Map
      key={mapKey}
      defaultCenter={mapCenter}
      defaultZoom={showUserLocation ? 14 : 13}
      gestureHandling="cooperative"
      disableDefaultUI={true}
      zoomControl={true}
      mapId="osaka-store-map"
      className="h-full w-full rounded-2xl"
    >
      {showUserLocation && userLocation && (
        <AdvancedMarker position={userLocation} title="현재 위치">
          <div
            className="h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md ring-2 ring-blue-500/25"
            aria-hidden="true"
          />
        </AdvancedMarker>
      )}

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

export default function StoreMap({
  stores,
  onStoreSelect,
  userLocation = null,
}: StoreMapProps) {
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
          <MapContent
            stores={stores}
            onStoreSelect={onStoreSelect}
            userLocation={userLocation}
          />
        </APIProvider>
      </div>

      <p className="mt-2 px-1 text-xs text-text-tertiary">
        {userLocation
          ? "파란 점은 현재 위치이며, 매장 로고를 누르면 바로 선택할 수 있어요."
          : "지도에서 매장 로고를 누르면 해당 매장을 선택할 수 있어요."}
      </p>
    </div>
  );
}
