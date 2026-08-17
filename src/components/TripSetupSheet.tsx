"use client";

import { FormEvent, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { saveTrip } from "@/lib/tripStorage";
import { Trip } from "@/types";

interface TripSetupSheetProps {
  open: boolean;
  initialTrip?: Trip | null;
  onSaved: (trip: Trip) => void;
  onDismiss: () => void;
}

function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDates(): { startDate: string; endDate: string } {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return { startDate: toLocalDateInput(start), endDate: toLocalDateInput(end) };
}

export default function TripSetupSheet({
  open,
  initialTrip = null,
  onSaved,
  onDismiss,
}: TripSetupSheetProps) {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const nextDates = initialTrip
      ? { startDate: initialTrip.startDate, endDate: initialTrip.endDate }
      : getDefaultDates();
    setStartDate(nextDates.startDate);
    setEndDate(nextDates.endDate);
    setError("");
    trackEvent("trip_setup_view", {
      mode: initialTrip ? "edit" : "create",
      destination_id: initialTrip?.destinationId ?? "osaka_namba",
    });
  }, [open, initialTrip]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      setError("여행 시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    if (endDate < startDate) {
      setError("여행 종료일은 시작일보다 빠를 수 없어요.");
      return;
    }

    try {
      const trip = saveTrip({
        id: initialTrip?.id,
        destinationId: "osaka_namba",
        destinationName: "오사카 · 난바",
        startDate,
        endDate,
      });
      trackEvent(initialTrip ? "trip_edit" : "trip_create", {
        destination_id: trip.destinationId,
        trip_duration_days:
          Math.floor(
            (new Date(`${endDate}T00:00:00`).getTime() -
              new Date(`${startDate}T00:00:00`).getTime()) /
              86_400_000
          ) + 1,
      });
      onSaved(trip);
    } catch {
      setError("여행 정보를 저장하지 못했어요. 브라우저 저장 설정을 확인해주세요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-setup-title"
        className="w-full max-w-mobile rounded-t-3xl bg-white px-5 pb-7 pt-5 shadow-xl sm:rounded-3xl"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-stone-300 sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary-600">내 여행 시작하기</p>
            <h2 id="trip-setup-title" className="mt-1 text-xl font-bold text-text">
              이번 여행 정보를 알려주세요
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              선택한 한 끼를 여행 일정별로 모아볼 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xl text-text-secondary"
            aria-label="여행 정보 입력 닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-text">여행 장소</span>
            <select
              value="osaka_namba"
              disabled
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-surface-subtle px-3 text-sm text-text disabled:opacity-100"
            >
              <option value="osaka_namba">오사카 · 난바</option>
            </select>
            <span className="mt-1.5 block text-xs text-text-tertiary">
              현재 검증된 상품을 제공하는 지역이에요.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-text">시작일</span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">종료일</span>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-text"
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary">
            {initialTrip ? "여행 정보 저장하기" : "여행 시작하기"}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-11 w-full items-center justify-center text-sm font-medium text-text-tertiary"
          >
            {initialTrip ? "취소" : "나중에 입력하기"}
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-text-tertiary">
          여행 정보와 선택 내역은 이 기기에만 저장되며 GPS 좌표는 저장하지 않아요.
        </p>
      </section>
    </div>
  );
}
