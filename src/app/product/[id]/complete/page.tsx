"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
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
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState("");

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

  const handleNpsSubmit = (score: number) => {
    if (npsScore !== null) return;

    const segment = score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
    setNpsScore(score);
    trackEvent("nps_submit", {
      score,
      segment,
      product_id: productId,
      store_id: storeId,
    });
  };

  const copyShareUrl = async (url: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    if (!product) return;

    const url = `${window.location.origin}/product/${product.id}?store=${storeId}&situation=${situationId}&rank=0&source=share`;
    const shareData = {
      title: `여행한끼 추천 · ${product.nameKo}`,
      text: `일본에서 ${product.nameKo} 어때요? 여행한끼에서 상품 정보를 확인해보세요.`,
      url,
    };

    trackEvent("share_click", {
      product_id: product.id,
      native_share_available: typeof navigator.share === "function",
    });

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        setShareMessage("공유했어요!");
        trackEvent("share_complete", {
          product_id: product.id,
          method: "native",
          success: true,
        });
        return;
      }

      await copyShareUrl(url);
      setShareMessage("상품 링크를 복사했어요.");
      trackEvent("share_complete", {
        product_id: product.id,
        method: "clipboard",
        success: true,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareMessage("");
        return;
      }

      setShareMessage("공유하지 못했어요. 잠시 후 다시 시도해주세요.");
      trackEvent("share_complete", {
        product_id: product.id,
        method: "unknown",
        success: false,
      });
    }
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
    <div className="page-container flex flex-col items-center pb-10 pt-16 text-center">
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

          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-text-tertiary">
              이 기능에 대해 어떻게 생각하세요?
            </p>
            <div className="flex gap-2">
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() => trackEvent("stock_feedback", { value: "want" })}
              >
                생기면 꼭 쓸래요
              </button>
              <button
                className="chip chip-inactive flex-1 justify-center"
                onClick={() => trackEvent("stock_feedback", { value: "enough" })}
              >
                추천만으로 충분해요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPS */}
      <section className="mt-6 w-full rounded-2xl border border-stone-200 p-5" aria-labelledby="nps-heading">
        <h2 id="nps-heading" className="text-sm font-semibold text-text">
          여행한끼를 지인에게 추천할 가능성은?
        </h2>
        {npsScore === null ? (
          <>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {Array.from({ length: 11 }, (_, score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleNpsSubmit(score)}
                  className="flex h-11 items-center justify-center rounded-lg bg-surface-subtle text-xs font-semibold text-text transition-colors active:bg-primary-100"
                  aria-label={`추천 의향 ${score}점`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-text-tertiary">
              <span>0 전혀 추천 안 함</span>
              <span>10 매우 추천</span>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-primary-700">
            {npsScore}점으로 응답해주셔서 감사합니다.
          </p>
        )}
      </section>

      {/* Share */}
      <div className="mt-4 w-full">
        <button type="button" onClick={handleShare} className="btn-secondary">
          이 상품 친구에게 공유하기
        </button>
        {shareMessage && (
          <p className="mt-2 text-xs text-text-secondary" role="status">
            {shareMessage}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex w-full flex-col gap-3">
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
