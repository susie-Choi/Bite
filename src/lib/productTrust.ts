import { AvailabilityScope, Product, VerificationStatus } from "@/types";

/** 판매 범위를 사용자에게 보여줄 배지 텍스트로 변환한다. */
export function getAvailabilityLabel(scope: AvailabilityScope): string {
  switch (scope) {
    case "chain_catalog":
      return "체인 공식 판매 확인";
    case "regional":
      return "간사이 지역 판매 확인";
    case "store_observed":
      return "이 지점에서 확인됨";
    default:
      return "판매 여부 미확인";
  }
}

/** 판매 범위별 배지 색상 톤 (Tailwind 클래스). */
export function getAvailabilityTone(scope: AvailabilityScope): string {
  switch (scope) {
    case "store_observed":
      return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "regional":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "chain_catalog":
    default:
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  }
}

/** 검증 상태를 사용자에게 보여줄 배지 텍스트로 변환한다. */
export function getVerificationLabel(status: VerificationStatus): string {
  switch (status) {
    case "verified":
      return "출처 확인됨";
    case "needs_review":
      return "확인 중";
    case "retired":
      return "판매 종료 가능성";
    default:
      return "확인 필요";
  }
}

/** 상품 이미지가 아직 실제 패키지 사진이 아닌지 여부. */
export function hasPlaceholderImageOnly(product: Product): boolean {
  return product.images.every((img) => img.kind === "placeholder");
}
