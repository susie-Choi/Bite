"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TripSetupSheet from "@/components/TripSetupSheet";
import { products } from "@/data/products";
import { situations } from "@/data/situations";
import { stores } from "@/data/stores";
import { trackEvent } from "@/lib/analytics";
import {
  getChoiceHistory,
  getCurrentTrip,
  getTrips,
  setCurrentTrip,
} from "@/lib/tripStorage";
import { ChoiceHistory, Trip } from "@/types";

function formatTripPeriod(trip: Trip): string {
  const format = (value: string, includeYear: boolean) => {
    const date = new Date(`${value}T00:00:00`);
    return `${includeYear ? `${date.getFullYear()}.` : ""}${date.getMonth() + 1}.${date.getDate()}`;
  };
  return `${format(trip.startDate, true)} ~ ${format(trip.endDate, false)}`;
}

function formatSelectedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MyTripPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [choices, setChoices] = useState<ChoiceHistory[]>([]);
  const [currentTrip, setCurrentTripState] = useState<Trip | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadTrips = () => {
    const nextTrips = getTrips();
    const nextChoices = getChoiceHistory();
    setTrips(nextTrips);
    setChoices(nextChoices);
    setCurrentTripState(getCurrentTrip());
    setLoaded(true);
    return { tripCount: nextTrips.length, choiceCount: nextChoices.length };
  };

  useEffect(() => {
    const counts = loadTrips();
    trackEvent("trip_history_view", {
      trip_count: counts.tripCount,
      choice_count: counts.choiceCount,
    });
  }, []);

  const choicesByTrip = useMemo(() => {
    const grouped = new Map<string, ChoiceHistory[]>();
    choices.forEach((choice) => {
      grouped.set(choice.tripId, [...(grouped.get(choice.tripId) ?? []), choice]);
    });
    return grouped;
  }, [choices]);

  const handleUseTrip = (trip: Trip) => {
    const selected = setCurrentTrip(trip.id);
    if (selected) setCurrentTripState(selected);
  };

  const handleProductClick = (choice: ChoiceHistory) => {
    trackEvent("trip_history_product_click", {
      product_id: choice.productId,
      store_id: choice.storeId,
      situation_id: choice.situationId,
    });
    router.push(
      `/product/${choice.productId}?store=${choice.storeId}&situation=${choice.situationId}&rank=0&source=trip_history`
    );
  };

  return (
    <div className="page-container pb-12 pt-4">
      <header className="flex items-center justify-between gap-3 py-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-11 items-center gap-1 text-sm font-medium text-text-secondary"
        >
          <span aria-hidden="true">‹</span> 홈
        </button>
        <button
          type="button"
          onClick={() => setSetupOpen(true)}
          className="flex h-11 items-center rounded-xl bg-primary-50 px-3 text-sm font-semibold text-primary-700"
        >
          + 새 여행
        </button>
      </header>

      <div className="mt-3">
        <p className="text-xs font-semibold text-primary-600">MY TRIP</p>
        <h1 className="mt-1 text-2xl font-bold text-text">내 여행 한 끼</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          여행 일정별로 선택한 상품을 다시 확인해보세요.
        </p>
      </div>

      {!loaded ? (
        <p className="mt-10 text-center text-sm text-text-tertiary">여행 기록을 불러오는 중...</p>
      ) : trips.length === 0 ? (
        <section className="mt-8 rounded-2xl bg-surface-subtle p-6 text-center">
          <span className="text-4xl" aria-hidden="true">🧳</span>
          <h2 className="mt-3 font-bold text-text">아직 등록한 여행이 없어요</h2>
          <p className="mt-1 text-sm text-text-secondary">
            여행 정보를 등록하고 선택한 한 끼를 기록해보세요.
          </p>
          <button type="button" onClick={() => setSetupOpen(true)} className="btn-primary mt-5">
            첫 여행 등록하기
          </button>
        </section>
      ) : (
        <div className="mt-6 space-y-5">
          {trips.map((trip) => {
            const tripChoices = choicesByTrip.get(trip.id) ?? [];
            const isCurrent = currentTrip?.id === trip.id;

            return (
              <section
                key={trip.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  isCurrent ? "border-primary-200" : "border-stone-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-text">{trip.destinationName}</h2>
                        {isCurrent && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                            현재 여행
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{formatTripPeriod(trip)}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        선택한 한 끼 {tripChoices.length}개
                      </p>
                    </div>
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleUseTrip(trip)}
                        className="flex h-10 items-center rounded-xl border border-primary-200 px-3 text-xs font-semibold text-primary-700"
                      >
                        현재 여행으로
                      </button>
                    )}
                  </div>
                </div>

                {tripChoices.length === 0 ? (
                  <div className="border-t border-stone-100 bg-surface-subtle px-4 py-5 text-center">
                    <p className="text-sm text-text-tertiary">아직 선택한 상품이 없어요.</p>
                    {isCurrent && (
                      <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="mt-2 text-sm font-semibold text-primary-600 underline"
                      >
                        한 끼 고르러 가기
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-stone-100">
                    {tripChoices.map((choice) => {
                      const product = products.find((item) => item.id === choice.productId);
                      const store = stores.find((item) => item.id === choice.storeId);
                      const situation = situations.find((item) => item.id === choice.situationId);
                      if (!product) return null;

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => handleProductClick(choice)}
                          className="flex w-full items-center gap-3 border-b border-stone-100 p-4 text-left last:border-b-0 active:bg-surface-subtle"
                        >
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text">{product.nameKo}</p>
                            <p className="mt-0.5 truncate text-xs text-text-secondary">
                              {store?.nameKo ?? "매장 정보 없음"} · {situation?.label ?? "상황 정보 없음"}
                            </p>
                            <p className="mt-1 text-[11px] text-text-tertiary">
                              {formatSelectedAt(choice.selectedAt)}
                            </p>
                          </div>
                          <span className="text-text-tertiary" aria-hidden="true">›</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-7 rounded-xl bg-surface-subtle px-4 py-3 text-center text-[11px] leading-relaxed text-text-tertiary">
        여행 정보와 선택 내역은 현재 브라우저에만 저장됩니다. 브라우저 데이터를 삭제하면 내역도 삭제될 수 있어요.
      </p>

      <TripSetupSheet
        open={setupOpen}
        onSaved={() => {
          setSetupOpen(false);
          loadTrips();
        }}
        onDismiss={() => setSetupOpen(false)}
      />
    </div>
  );
}
