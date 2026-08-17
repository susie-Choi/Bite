"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("app_error", {
      error_digest: error.digest || "unknown",
      route: window.location.pathname,
    });
  }, [error]);

  const handleRetry = () => {
    trackEvent("error_retry", {
      error_digest: error.digest || "unknown",
      route: window.location.pathname,
    });
    reset();
  };

  return (
    <div className="page-container flex flex-col items-center justify-center pt-20 text-center">
      <span className="text-5xl">😵</span>
      <h1 className="mt-6 text-xl font-bold text-text">
        문제가 발생했어요
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={handleRetry}
        className="btn-primary mt-8 !w-auto !px-8"
      >
        다시 시도하기
      </button>
    </div>
  );
}
