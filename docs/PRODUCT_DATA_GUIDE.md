# 상품 데이터 신뢰도 가이드

이 문서는 `src/data/products.ts`를 실제 상품 기반으로 유지·확장하는 방법을 설명한다.
목적은 "일본어를 몰라도 진열대의 실제 상품을 알아보고 고를 수 있게 한다"이므로,
검증되지 않은 정보를 사실처럼 표시하지 않는 것이 최우선 원칙이다.

## 1. 핵심 필드 의미

| 필드 | 의미 |
|---|---|
| `verificationStatus` | `verified`만 추천에 노출된다. `needs_review`는 사람 검수 전 후보다. |
| `availabilityScope` | `chain_catalog`(체인 공식 등재) / `regional`(지역 판매 공식 명시) / `store_observed`(팀이 지점에서 실제 확인) |
| `sourceUrl` | 상품명·가격을 확인한 공식 URL. 블로그·리뷰 사이트는 보조 자료로만 사용하고 `sourceUrl`에는 넣지 않는다. |
| `verifiedAt` | 위 출처를 확인한 날짜. 가격 개정이 잦으므로 3개월 이상 지난 항목은 재확인한다. |
| `images[].rights` | `team_photo`(직접 촬영) / `cleared_official`(사용 허가 확인됨) / `pending_review`(아직 확인 안 됨). `pending_review` 상태에서는 실제 패키지 사진을 절대 넣지 않는다. |
| `tasteBasis` | `team_tasting`(직접 시식) / `official_description`(공식 설명 번역·요약) / `review_research`(리뷰 조사). 출처 없는 주관적 묘사를 금지한다. |

## 2. 현재 상태 (2026-08-17 기준)

- Lawson, 7-Eleven, FamilyMart: 각 체인 공식 사이트에서 확인한 실재 SKU 8개씩 등록. `verificationStatus: "verified"`.
- LIFE: 지점별 전단 상품이라 공식 사이트에 개별 SKU 페이지가 없음. PB 브랜드(BIO-RAL) 및 대표 카테고리 수준만 등록했고 `verificationStatus: "needs_review"`로 표시. **추천에는 노출되지 않는다.**
- 모든 상품의 이미지는 `images: [{ kind: "placeholder", rights: "pending_review" }]` 상태다. 실제 패키지 사진은 아직 한 장도 없다.
- `lawson_t_001`, `lawson_t_002`, `seven_u_001`은 공식 사이트에 "간사이/오사카에서는 취급하지 않음" 또는 "홋카이도 판매"로 명시되어 있어 오사카 지점 판매 여부가 불확실하므로 `needs_review`로 낮췄다.

## 3. 새 상품을 추가하는 절차

1. **공식 출처에서 상품명·가격 확인**
   - Lawson: `lawson.co.jp/recommend/original/...`
   - 7-Eleven: `sej.co.jp/products/a/...`
   - FamilyMart: `family.co.jp/goods/...`
   - LIFE: 공식 사이트에 개별 SKU가 없으므로 지점 현장 확인이 필요하다.
2. **판매 범위 확인** — 페이지에 "발売地域" 또는 "取り扱いのない場合"가 있는지 반드시 읽고 `availabilityScope`를 정확히 기록한다. 오사카(간사이)가 제외 지역에 포함되면 `needs_review`로 두고 추천에 노출하지 않는다.
3. **사람 검수** — 다음을 확인하지 못하면 `verificationStatus`를 `verified`로 올리지 않는다.
   - 오사카/간사이 판매 여부
   - 정확한 일본어 정식 명칭 (줄임말·별칭 금지)
   - 세금 포함 가격 여부
4. **이미지 확보**
   - 최우선: 팀이 직접 매장에서 촬영 (`kind: "package_front"`, `rights: "team_photo"`)
   - 차선: 체인/제조사 공식 이미지 — 반드시 재사용 가능 여부를 확인한 뒤 `rights: "cleared_official"`로 표기하고 실제 확인한 링크를 `sourceUrl`에 남긴다.
   - 확인 전에는 `placeholder` + `pending_review` 상태를 유지한다. 일반 음식 사진, 검색 결과 이미지, 다른 상품 사진을 대신 넣지 않는다.
5. **맛 정보 근거 표기** — 직접 시식하면 `team_tasting`, 공식 설명을 요약하면 `official_description`, 여러 리뷰를 조사했으면 `review_research`로 `tasteBasis`를 남긴다.

## 4. 다음 단계 (지점 현장 검증)

이 브랜치는 "체인이 공식적으로 판매한다고 밝힌 SKU"까지만 다룬다. 다음 단계는 실제 지점 방문으로:

1. LIFE 난바점·텐노지점·신세카이점에서 실제 진열 상품과 가격을 촬영·기록하고 `store_observed`로 승격한다.
2. Lawson·7-Eleven·FamilyMart 각 지점에서 `needs_review` 상품(지역 제한 있는 것들)의 실제 취급 여부를 확인한다.
3. 확인된 상품은 패키지 정면 사진(`package_front`)과 진열대 사진(`shelf`)을 최소 1장씩 추가한다.

이 작업이 끝나기 전까지 앱은 "체인이 일반적으로 취급하는 상품"을 안내하는 수준이며,
"이 지점에 반드시 있다"고 사용자에게 표현해서는 안 된다.
