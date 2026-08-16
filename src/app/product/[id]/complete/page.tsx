"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import { trackEvent } from "@/lib/analytics";
import { getProductById } from "@/lib/recommendation";
import { StoreId, SituationId } from "@/types";

function CompleteContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const storeId = (searchParams.get("store") || "life_namba") as StoreId;
  const situationId = (searchParams.get("situation") || "hearty_meal") as SituationId;

  const product = getProductById(productId);
  const [stockClicked, setStockClicked] = useState(false);
  const [showFakeDoor, setShowFakeDoor] = useState(false);

  useEffect(() => {
    trackEvent("choice_complete_view", {
      product_id: productId,
      store_id: storeId,
      situation_id: situationId,
    });
  }, [productId, storeId, situationId]);

  const handleStockCheck = () => {
    trackEvent("stock_check_click", {
      product_id: productId,
      store_id: storeId,
    });
    setStockClicked(true);
    setShowFakeDoor(true);

    trackEvent("stock_fake_door_view", {
      product_id: productId,
    });
  };

  if (!product) {
    return (
      <div className="page-container flex flex-col items-center justify-center pt-20 text-center">
        <span className="text-4xl">😢</span>
        <p className="mt-4 font-semibold text-text">상품을 찾을 수 없어요.</p>
        <button
          onClick={() => router.push("/")}
          className="btn-secondary mt-6 !w-auto"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col items-center pt-16 text-center">
      {/* Success */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <span className="text-4xl">✓</span>
      </div>

      <h1 className="mt-6 text-xl font-bold text-text">선택 완료!</h1>
      <p className="mt-2 text-sm text-text-secondary">
        <span className="font-semibold text-text">{product.nameKo}</span>
        를 선택하셨어요.
      </p>
      <p className="mt-1 text-xs text-text-tertiary">
        매장에서 이 상품을 찾아보세요.
      </p>

      {/* Stock Fake Door */}
      {!showFakeDoor ? (
        <div className="mt-10 w-full rounded-2xl bg-surface-subtle p-6">
          <p className="text-sm font-medium text-text">
            현재 이 매장에 재고가 있는지<br />확인해볼까요?
          </p>
          <button
            onClick={handleStockCheck}
            disabled={stockClicked}
            className="btn-primary mt-4"
          >
            재고 확인하기
          </button>
        </div>
      ) : (
        <div className="mt-10 w-full rounded-2xl border-2 border-primary-100 bg-primary-50 p-6">
          <p className="text-2xl">🚀</p>
          <p className="mt-3 text-sm font-semibold text-text">
            실시간 매장 재고 확인 기능을 준비하고 있습니다.
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            이 기능이 필요하시다면, 여러분의 클릭이 개발 우선순위를 높여줍니다!
          </p>

          {/* Optional quick feedback */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-text-tertiary">
              이 기능에 대해 어떻게 생각하세요?
            </p>
            <div className="flex gap-2">
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() =>
                  trackEvent("stock_feedback", { value: "want" })
                }
              >
                생기면 꼭 쓸래요
              </button>
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() =>
                  trackEvent("stock_feedback", { value: "enough" })
                }
              >
                추천만으로 충분해요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 flex w-full flex-col gap-3">
        <button
          onClick={() => router.push(`/recommendations?store=${storeId}&situation=${situationId}`)}
          className="btn-secondary"
        >
          다른 상품 더 보기
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium text-text-tertiary"
        >
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="page-container flex items-center justify-center pt-20">
          <p className="text-text-tertiary">로딩 중...</p>
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
