import { AnalyticsEvent, AnalyticsParams } from "@/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * GA4 이벤트를 전송합니다.
 * - GA ID가 없거나 gtag가 로드되지 않아도 에러를 발생시키지 않습니다.
 * - 개발 환경에서는 콘솔에 이벤트를 출력합니다.
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  params: AnalyticsParams = {}
) {
  if (typeof window === "undefined") return;

  // GA4 전송
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

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

/**
 * GA4 Measurement ID
 */
export function getGAMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined;
}
