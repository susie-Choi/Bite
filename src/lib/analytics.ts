import { AnalyticsEvent, AnalyticsParams } from "@/types";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Google Tag Manager의 dataLayer로 분석 이벤트를 전송합니다.
 * - GTM이 로드되지 않았거나 차단되어도 에러를 발생시키지 않습니다.
 * - 개발 환경에서는 콘솔에도 이벤트를 출력합니다.
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  params: AnalyticsParams = {}
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  // 개발 환경 디버깅
  if (process.env.NODE_ENV === "development") {
    console.info(
      `%c[analytics] ${eventName}`,
      "color: #F97316; font-weight: bold;",
      params
    );
  }
}

/**
 * 페이지 진입 시간을 기록하고, 나중에 경과 시간(ms)을 계산합니다.
 */
let sessionStartTime: number | null = null;

export function markSessionStart() {
  sessionStartTime = Date.now();
}

export function getDecisionTimeMs(): number | undefined {
  if (sessionStartTime === null) return undefined;
  return Date.now() - sessionStartTime;
}

const VISIT_STORAGE_KEY = "travel_meal_visit";
const SESSION_VISIT_KEY = "travel_meal_visit_tracked";

interface StoredVisit {
  count: number;
  lastVisitedAt: number;
}

/**
 * 로그인 없이 브라우저 단위 재방문 여부를 측정한다.
 * 같은 탭 세션에서 홈으로 여러 번 돌아와도 방문 수를 중복 증가시키지 않는다.
 */
export function trackVisit() {
  if (typeof window === "undefined") return;

  try {
    if (window.sessionStorage.getItem(SESSION_VISIT_KEY)) return;

    const now = Date.now();
    const storedValue = window.localStorage.getItem(VISIT_STORAGE_KEY);
    const previous = storedValue
      ? (JSON.parse(storedValue) as StoredVisit)
      : null;
    const visitCount = (previous?.count ?? 0) + 1;
    const daysSinceLastVisit = previous
      ? Math.floor((now - previous.lastVisitedAt) / 86_400_000)
      : 0;

    trackEvent("visit_start", {
      returning_user: visitCount > 1,
      visit_count: visitCount,
      days_since_last_visit: daysSinceLastVisit,
      storage_available: true,
    });

    window.localStorage.setItem(
      VISIT_STORAGE_KEY,
      JSON.stringify({ count: visitCount, lastVisitedAt: now })
    );
    window.sessionStorage.setItem(SESSION_VISIT_KEY, "true");
  } catch {
    trackEvent("visit_start", {
      returning_user: false,
      visit_count: 1,
      storage_available: false,
    });
  }
}
