"use client";

import { Trip } from "@/types";

interface CurrentTripCardProps {
  trip: Trip | null;
  onSetup: () => void;
  onEdit: () => void;
  onHistory: () => void;
}

function formatTripDates(startDate: string, endDate: string): string {
  const format = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };
  return `${format(startDate)} ~ ${format(endDate)}`;
}

export default function CurrentTripCard({
  trip,
  onSetup,
  onEdit,
  onHistory,
}: CurrentTripCardProps) {
  if (!trip) {
    return (
      <section className="mt-5 rounded-2xl border border-dashed border-primary-300 bg-primary-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🧳
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-text">이번 여행을 기록해보세요</h2>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              장소와 일정을 등록하면 고른 한 끼를 여행별로 모아볼 수 있어요.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSetup}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-primary-500 text-sm font-semibold text-white"
        >
          여행 정보 등록하기
        </button>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary-600">현재 여행</p>
          <h2 className="mt-1 text-base font-bold text-text">{trip.destinationName}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            {formatTripDates(trip.startDate, trip.endDate)}
          </p>
        </div>
        <span className="text-2xl" aria-hidden="true">✈️</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 items-center justify-center rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-700"
        >
          일정 수정
        </button>
        <button
          type="button"
          onClick={onHistory}
          className="flex h-11 items-center justify-center rounded-xl bg-primary-500 text-sm font-semibold text-white"
        >
          지난 선택 보기
        </button>
      </div>
    </section>
  );
}
