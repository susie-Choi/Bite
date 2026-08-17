import {
  ChoiceHistory,
  SituationId,
  StoreId,
  Trip,
  TripInput,
} from "@/types";

const TRIPS_STORAGE_KEY = "travel_meal_trips_v1";
const CURRENT_TRIP_STORAGE_KEY = "travel_meal_current_trip_v1";
const CHOICE_HISTORY_STORAGE_KEY = "travel_meal_choice_history_v1";
const SETUP_SKIPPED_SESSION_KEY = "travel_meal_trip_setup_skipped";
export const TRIP_STORAGE_EVENT = "travel-meal:trip-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readArray<T>(key: string): T[] {
  if (!isBrowser()) return [];

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(TRIP_STORAGE_EVENT));
}

function createId(prefix: string): string {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${randomId}`;
}

export function getTrips(): Trip[] {
  return readArray<Trip>(TRIPS_STORAGE_KEY).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getCurrentTrip(): Trip | null {
  if (!isBrowser()) return null;

  try {
    const currentTripId = window.localStorage.getItem(CURRENT_TRIP_STORAGE_KEY);
    if (!currentTripId) return null;
    return getTrips().find((trip) => trip.id === currentTripId) ?? null;
  } catch {
    return null;
  }
}

export function saveTrip(input: TripInput): Trip {
  if (!isBrowser()) {
    throw new Error("여행 정보는 브라우저에서만 저장할 수 있습니다.");
  }

  const now = new Date().toISOString();
  const trips = getTrips();
  const existing = input.id
    ? trips.find((trip) => trip.id === input.id)
    : undefined;
  const trip: Trip = {
    id: existing?.id ?? createId("trip"),
    destinationId: input.destinationId,
    destinationName: input.destinationName,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextTrips = existing
    ? trips.map((item) => (item.id === trip.id ? trip : item))
    : [trip, ...trips];

  window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(nextTrips));
  window.localStorage.setItem(CURRENT_TRIP_STORAGE_KEY, trip.id);
  window.dispatchEvent(new Event(TRIP_STORAGE_EVENT));
  return trip;
}

export function setCurrentTrip(tripId: string): Trip | null {
  if (!isBrowser()) return null;
  const trip = getTrips().find((item) => item.id === tripId) ?? null;
  if (!trip) return null;

  window.localStorage.setItem(CURRENT_TRIP_STORAGE_KEY, trip.id);
  window.dispatchEvent(new Event(TRIP_STORAGE_EVENT));
  return trip;
}

export function getChoiceHistory(tripId?: string): ChoiceHistory[] {
  return readArray<ChoiceHistory>(CHOICE_HISTORY_STORAGE_KEY)
    .filter((choice) => !tripId || choice.tripId === tripId)
    .sort((a, b) => b.selectedAt.localeCompare(a.selectedAt));
}

export function recordChoiceForCurrentTrip(input: {
  productId: string;
  storeId: StoreId;
  situationId: SituationId;
}): ChoiceHistory | null {
  const currentTrip = getCurrentTrip();
  if (!currentTrip) return null;

  try {
    const history = getChoiceHistory();
    const choice: ChoiceHistory = {
      id: createId("choice"),
      tripId: currentTrip.id,
      productId: input.productId,
      storeId: input.storeId,
      situationId: input.situationId,
      selectedAt: new Date().toISOString(),
    };
    writeArray(CHOICE_HISTORY_STORAGE_KEY, [choice, ...history]);
    return choice;
  } catch {
    return null;
  }
}

export function wasTripSetupSkippedThisSession(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.sessionStorage.getItem(SETUP_SKIPPED_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function skipTripSetupForSession(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(SETUP_SKIPPED_SESSION_KEY, "true");
  } catch {
    // 저장소를 사용할 수 없어도 사용자는 계속 탐색할 수 있다.
  }
}
