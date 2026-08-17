# DESIGN.md – 여행한끼 디자인 시스템

## 1. Design Principles

| 원칙 | 설명 |
|------|------|
| **Mobile First** | 360px~430px 모바일 화면이 기본. 데스크탑은 max-width 430px로 센터링 |
| **음식이 주인공** | UI 색은 절제하고, 상품 이미지와 패키지 컬러가 돋보이게 |
| **한 화면에 하나의 행동** | 매 단계에서 사용자가 해야 할 것은 하나뿐 |
| **한국어 친근함** | CTA, 레이블, 설명 모두 자연스러운 한국어. 영어 브랜딩 지양 |
| **빠른 스캔** | 카드 정보는 3초 안에 핵심이 파악되게 구성 |

---

## 2. Color System

### Primary – Warm Orange

여행·음식·발견의 활기를 표현하되, UI 전체에 과도하게 사용하지 않는다.

| Token | Hex | 용도 |
|-------|-----|------|
| `primary-50` | `#FFF8F0` | Background tint |
| `primary-100` | `#FFEDD5` | Border, subtle highlight |
| `primary-200` | `#FED7AA` | Secondary border |
| `primary-300` | `#FDBA74` | Hover state |
| `primary-400` | `#FB923C` | Sub-accent |
| `primary-500` | `#F97316` | **Primary CTA, tags** |
| `primary-600` | `#EA580C` | Active/pressed state, price |
| `primary-700` | `#C2410C` | Dark accent (text) |

### Surface

| Token | Hex | 용도 |
|-------|-----|------|
| `surface` | `#FFFFFF` | Card, main background |
| `surface-muted` | `#FAFAF9` | Page background (outer) |
| `surface-subtle` | `#F5F5F4` | Section background, input |

### Text

| Token | Hex | 용도 |
|-------|-----|------|
| `text` | `#1C1917` | 제목, 본문 |
| `text-secondary` | `#57534E` | 부제목, 설명 |
| `text-tertiary` | `#A8A29E` | 보조 정보, 일본어 원문 |

---

## 3. Typography

**Font:** Pretendard Variable (CDN)

| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| Page title (h1) | 20–24px (`text-xl`~`text-2xl`) | Bold (700) | 1.3 |
| Section title (h2) | 18px (`text-lg`) | Bold (700) | 1.4 |
| Card title | 14px (`text-sm`) | Semibold (600) | 1.4 |
| Body | 14px (`text-sm`) | Regular (400) | 1.6 |
| Caption / Japanese | 12px (`text-xs`) | Regular (400) | 1.5 |
| CTA button | 18px (`text-lg`) | Semibold (600) | 1 |

---

## 4. Spacing

8px 기반 스케일: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

| Context | Value |
|---------|-------|
| Page horizontal padding | 20px (`px-5`) |
| Card internal padding | 16px (`p-4`) |
| Card gap (list) | 12px (`gap-3`) |
| Section gap | 24–32px (`mt-6`~`mt-8`) |
| Bottom CTA padding-bottom | 24px (`pb-6`) |

---

## 5. Components

### Button – Primary

```
rounded-2xl bg-primary-500 px-6 py-4 text-lg font-semibold text-white
active:scale-[0.98] active:bg-primary-600
```

터치 타깃: 최소 48px 높이 확보.

### Button – Secondary

```
rounded-2xl border-2 border-primary-200 bg-white px-6 py-4 text-lg font-semibold text-primary-600
```

### Card

```
rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5
active:scale-[0.98] active:shadow-md
```

### Chip (Tag / Filter)

```
inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium
active: bg-primary-500 text-white
inactive: bg-surface-subtle text-text-secondary ring-1 ring-black/5
```

### Situation Card

```
rounded-2xl border-2 p-4 text-center
selected: border-primary-500 bg-primary-50
unselected: border-transparent bg-surface-subtle
```

---

## 6. Image Treatment

- **상품 이미지**: 1:1 비율(aspect-square), rounded-xl, object-cover
- **Hero 이미지**: full-width, 224px height, gradient overlay to white
- **Placeholder**: 중앙 아이콘 + "이미지 준비중" 텍스트
- 이미지가 없거나 로드 실패 시 placeholder.svg로 자동 대체

---

## 7. Interaction & Motion

| Action | Effect |
|--------|--------|
| 카드/버튼 탭 | `scale(0.98)` + subtle shadow 변화 (150ms) |
| 페이지 전환 | Next.js client-side navigation (instant) |
| 필터 토글 | height auto-expand (CSS transition) |

과도한 애니메이션은 사용하지 않는다. 모바일 네트워크 환경을 고려.

---

## 8. Layout Rules

- 최대 너비: 430px (max-w-mobile) → 데스크탑에서도 모바일 비율 유지
- 배경: surface-muted(회색) 위에 white 카드 영역
- Bottom CTA: fixed position, blur backdrop, border-top
- 스크롤 가능한 영역과 고정 영역(header/footer) 구분

---

## 9. Accessibility

- 터치 타깃: 최소 44×44px
- `<button>` 시맨틱 태그 사용 (div onClick 지양)
- 이미지에 의미 있는 `alt` 텍스트
- color contrast: text on white 최소 4.5:1
- `aria-label`, `aria-pressed` 활용
- keyboard focus 지원 (Next.js default focus ring)

---

## 10. Responsive Breakpoints

| Viewport | Behavior |
|----------|----------|
| 0–430px | 풀 너비, 기본 UI |
| 431px+ | max-width: 430px 센터링, 양옆 surface-muted 배경 노출 |

Desktop-specific 레이아웃은 만들지 않는다. 모바일 경험이 그대로 데스크탑에서도 보인다.

---

## 11. Empty & Error States

- 결과 없음: 이모지 + 안내 문구 + CTA
- 이미지 없음: placeholder.svg 자동 대체
- Analytics 미연결: 사용자에게 에러 노출 없음, 콘솔 로그만
- 네트워크 에러: 최소한의 안내 (서비스 특성상 static 데이터이므로 드물게 발생)
