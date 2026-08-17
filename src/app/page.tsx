"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { stores } from "@/data/stores";
import { products } from "@/data/products";
import { Store, Trip } from "@/types";
import { trackEvent, markSessionStart, trackVisit } from "@/lib/analytics";
import { formatDistance, GeoPoint, getDistanceMeters } from "@/lib/geo";
import {
  getCurrentTrip,
  skipTripSetupForSession,
  wasTripSetupSkippedThisSession,
} from "@/lib/tripStorage";
import CurrentTripCard from "@/components/CurrentTripCard";
import StoreMap from "@/components/StoreMap";
import TripSetupSheet from "@/components/TripSetupSheet";

/** 검증된 상품을 하나 이상 보유해 실제 추천을 제공할 수 있는 매장만 홈에 노출한다. */
const availableStoreIds = new Set(
  products
    .filter((product) => product.verificationStatus === "verified")
    .map((product) => product.storeId)
);

const availableStores = stores.filter((store) => availableStoreIds.has(store.id));

type LocationStatus = "idle" | "loading" | "success" | "error";

function getDistanceBucket(distanceMeters: number): string {
  if (distanceMeters < 1_000) return "under_1km";
  if (distanceMeters < 5_000) return "1_to_5km";
  if (distanceMeters < 50_000) return "5_to_50km";
  return "over_50km";
}

function getStoreMapsUrl(store: Store): string {
  const query = encodeURIComponent(
    `${store.nameEn}, ${store.lat},${store.lng}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function StoreListItem({
  store,
  distanceMeters,
  onSelect,
}: {
  store: Store;
  distanceMeters?: number;
  onSelect: () => void;
}) {
  const mapsUrl = getStoreMapsUrl(store);

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors active:bg-primary-50"
        aria-label={`${store.nameKo} 선택`}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-subtle p-1.5">
          <Image
            src={store.image}
            alt=""
            width={42}
            height={42}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-text">{store.nameKo}</p>
            <span className="flex-shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] text-text-tertiary">
              {store.typeLabel}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-text-secondary">{store.address}</p>
          {distanceMeters !== undefined && (
            <p className="mt-1 text-xs font-medium text-primary-600">
              현재 위치에서 {formatDistance(distanceMeters)}
            </p>
          )}
        </div>
        <svg
          className="h-5 w-5 flex-shrink-0 text-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <div className="flex items-center justify-between border-t border-stone-100 px-3 py-2">
        <span className="text-[11px] text-text-tertiary">영업시간은 최신 지도 정보 기준</span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent("store_info_click", {
              store_id: store.id,
              destination: "google_maps",
            })
          }
          className="text-xs font-medium text-primary-600 underline"
        >
          영업시간·길찾기 ↗
        </a>
      </div>
    </article>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripSetupOpen, setTripSetupOpen] = useState(false);

  useEffect(() => {
    markSessionStart();
    trackVisit();
    trackEvent("home_view", { source: "direct" });

    const storedTrip = getCurrentTrip();
    setCurrentTrip(storedTrip);
    if (!storedTrip && !wasTripSetupSkippedThisSession()) {
      setTripSetupOpen(true);
    }
  }, []);

  const storesWithDistance = useMemo(() => {
    const withDistance = availableStores.map((store) => ({
      store,
      distanceMeters: userLocation
        ? getDistanceMeters(userLocation, { lat: store.lat, lng: store.lng })
        : undefined,
    }));

    if (!userLocation) return withDistance;

    return withDistance.sort(
      (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
    );
  }, [userLocation]);

  const handleStoreSelect = (store: Store, source: "map" | "list") => {
    trackEvent("store_select", {
      store_id: store.id,
      store_type: store.type,
      source,
    });
    router.push(`/situation?store=${store.id}`);
  };

  const openTripSetup = () => {
    setEditingTrip(null);
    setTripSetupOpen(true);
  };

  const openTripEdit = () => {
    if (!currentTrip) return;
    setEditingTrip(currentTrip);
    setTripSetupOpen(true);
  };

  const dismissTripSetup = () => {
    if (!editingTrip && !currentTrip) {
      skipTripSetupForSession();
      trackEvent("trip_skip", { source: "home" });
    }
    setTripSetupOpen(false);
    setEditingTrip(null);
  };

  const handleNearbySearch = () => {
    trackEvent("nearby_search_click");

    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      setLocationMessage("이 브라우저에서는 현재 위치를 확인할 수 없어요.");
      trackEvent("nearby_search_error", { reason: "unsupported" });
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("현재 위치를 확인하고 있어요...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nearest = availableStores
          .map((store) => ({
            store,
            distance: getDistanceMeters(nextLocation, {
              lat: store.lat,
              lng: store.lng,
            }),
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        setUserLocation(nextLocation);
        setLocationStatus("success");
        setLocationMessage(
          nearest.distance <= 50_000
            ? `${nearest.store.nameKo}이(가) 가장 가까워요. GPS 직선거리 기준입니다.`
            : "현재 위치와 오사카 매장이 멀리 있어요. 표시된 거리는 참고용입니다."
        );
        trackEvent("nearby_search_result", {
          nearest_store_id: nearest.store.id,
          nearest_distance_bucket: getDistanceBucket(nearest.distance),
        });
      },
      (error) => {
        const reason =
          error.code === error.PERMISSION_DENIED
            ? "permission_denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable";
        const message =
          error.code === error.PERMISSION_DENIED
            ? "위치 권한을 허용하면 가까운 매장을 확인할 수 있어요."
            : "현재 위치를 불러오지 못했어요. 잠시 후 다시 시도해주세요.";

        setLocationStatus("error");
        setLocationMessage(message);
        trackEvent("nearby_search_error", { reason });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
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

      <CurrentTripCard
        trip={currentTrip}
        onSetup={openTripSetup}
        onEdit={openTripEdit}
        onHistory={() => router.push("/my-trip")}
      />

      {/* Map */}
      <section className="mt-6" aria-labelledby="store-heading">
        <h2 id="store-heading" className="sr-only">
          매장 선택
        </h2>

        <StoreMap
          stores={availableStores}
          onStoreSelect={(store) => handleStoreSelect(store, "map")}
          userLocation={userLocation}
        />

        <button
          type="button"
          onClick={handleNearbySearch}
          disabled={locationStatus === "loading"}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition-colors active:bg-primary-100 disabled:opacity-60"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          {locationStatus === "loading"
            ? "현재 위치 확인 중..."
            : userLocation
              ? "현재 위치 기준 가까운 순"
              : "내 주변 매장 찾기"}
        </button>

        {!locationMessage && (
          <p className="mt-2 px-1 text-xs text-text-tertiary">
            위치는 가까운 순 계산과 지도 표시에만 사용하며 여행한끼 서버에 저장하지 않아요.
          </p>
        )}

        {locationMessage && (
          <p
            className={`mt-2 px-1 text-xs ${
              locationStatus === "error" ? "text-red-600" : "text-text-secondary"
            }`}
            role="status"
          >
            {locationMessage}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {storesWithDistance.map(({ store, distanceMeters }) => (
            <StoreListItem
              key={store.id}
              store={store}
              distanceMeters={distanceMeters}
              onSelect={() => handleStoreSelect(store, "list")}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <p className="mt-auto pt-8 text-center text-xs text-text-tertiary">
        team 118
      </p>

      <TripSetupSheet
        open={tripSetupOpen}
        initialTrip={editingTrip}
        onSaved={(trip) => {
          setCurrentTrip(trip);
          setTripSetupOpen(false);
          setEditingTrip(null);
        }}
        onDismiss={dismissTripSetup}
      />
    </div>
  );
}
