# 실제 상품 이미지 확보 체크리스트

확인 기준일: **2026-08-17**
대상: `src/data/products.ts`에서 `verificationStatus: "verified"`인 상품 17개 레코드 / **고유 SKU 14개**

이 문서는 “어느 이미지를 가져와야 하는가”를 상품별로 지정한다. 현재 표의 14개 이미지는 모두 `public/images/products/`에 추가되어 데이터와 연결됐다. 기존 일반 음식 이미지는 `public/images/products_bck/`에 보존돼 있다. 각 행의 **공식 이미지 후보**가 현재 공식 상품 페이지에 연결된 대표 이미지다. Seven 상품 3개는 두 지점에 중복 등록되어 있으므로 이미지 파일 하나를 두 레코드가 공유하면 된다.

> **사용 권한 주의:** 아래 이미지는 상품 식별을 위해 공식 사이트에서 확인한 후보이며, 공개되어 있다는 이유만으로 재배포 허가가 보장되지는 않는다. 공개 배포 전 각 사이트 이용 조건 또는 사용 허가를 확인한다. 권리 확인 전에는 `rights: "pending_review"`를 유지하고, 가능하면 직접 촬영한 사진(`team_photo`)으로 교체한다.

## 저장 규칙

- 저장 폴더: `public/images/products/`
- 확장자는 아래 표에 지정한 형식을 그대로 유지한다.
- 이미지에 일본어 상품명·포장·용기가 있으면 **잘라내지 않는다**.
- 앱에서는 `object-contain`으로 표시하므로 억지로 정사각형 크롭하지 않는다.
- 다운로드 후 해당 상품의 `image`와 `images[0].src`를 `/images/products/<파일명>`으로 바꾼다.
- 포장 정면 식별 사진은 `package_front`, 포장이 없는 도시락·핫스낵 공식 참고 이미지는 `product_reference`로 구분한다.

## Lawson — 6개

| 완료 | 사용 Product ID | 상품명 | 공식 상품 페이지 | 공식 이미지 후보 | 저장 파일명 | 가져올 이미지 기준 |
|---|---|---|---|---|---|---|
| [x] | `lawson_001` | 오니기리 벤토 / `おにぎり弁当` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1527647_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l795705_1.png) | `lawson_001.png` | 투명 용기 전체와 오니기리·반찬 구성이 모두 보이는 이미지. 공식 이미지는 외부 라벨이 잘 보이지 않으므로 현장에서는 라벨 포함 정면 사진 추가 권장. |
| [x] | `lawson_002` | 오카즈동! 갈릭 타르타르 치킨카츠 벤토 / `おかズドン！ガーリックタルタルチキンカツ弁当` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1529831_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l813207.png) | `lawson_002.png` | 검은 직사각 용기, 나폴리탄과 갈릭 타르타르 치킨카츠가 함께 보이는 이미지. 포장 라벨은 현장 사진으로 보완. |
| [x] | `lawson_003` | 참치마요 손말이 오니기리 / `手巻おにぎり シーチキン®マヨネーズ` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1507601_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l787518.png) | `lawson_003.png` | Lawson 파란색 삼각 포장, `シーチキン®マヨネーズ` 라벨, 단면 예시가 함께 보이는 이미지. **패키지 식별에 적합.** |
| [x] | `lawson_004` | 숙성 기슈 난코우메 손말이 오니기리 / `手巻おにぎり 熟成紀州南高梅` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1528789_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l812940.png) | `lawson_004.png` | Lawson 파란색 삼각 포장, `熟成 紀州南高梅` 라벨, 매실 단면이 함께 보이는 이미지. **패키지 식별에 적합.** |
| [x] | `lawson_t_003` | 옥수수밥 벤토 / `とうもろこしごはん弁当` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1530352_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l813208.png) | `lawson_t_003.png` | 투명 직사각 용기에 옥수수밥과 반찬이 함께 보이는 이미지. 라벨 없는 조리 용기 사진이므로 현장 라벨 사진 추가 권장. |
| [x] | `lawson_t_004` | 새우와 채소 튀김덮밥 / `海老と野菜の天丼` | [상품 페이지](https://www.lawson.co.jp/recommend/original/detail/1529411_1996.html) | [공식 이미지](https://www.lawson.co.jp/recommend/original/detail/img/l802316.png) | `lawson_t_004.png` | 검은 타원 용기와 새우·채소 튀김 구성이 모두 보이는 이미지. 외부 상품명 라벨은 현장 사진으로 보완. |

## 7-Eleven — 고유 SKU 4개, Product 레코드 7개

| 완료 | 사용 Product ID | 상품명 | 공식 상품 페이지 | 공식 이미지 후보 | 저장 파일명 | 가져올 이미지 기준 |
|---|---|---|---|---|---|---|
| [x] | `seven_001`, `seven_u_002` | 파소금 그릴 치킨 벤토 / `ねぎ塩グリルチキン弁当` | [상품 페이지](https://www.sej.co.jp/products/a/item/044017/) | [공식 이미지](https://img-afd.7api-01.dp1.sej.co.jp/item-image/044017/58D9BA568DB56B81941838505184577E.jpg) | `seven_001.jpg` | 검은 도시락 용기 전체와 흰밥·파소금 치킨이 보이는 이미지. 두 Product ID가 같은 파일을 사용한다. 가능하면 라벨 포함 현장 사진 추가. |
| [x] | `seven_002`, `seven_u_003` | 온천계란 닭소보로 덮밥(찰보리밥) / `温玉とりそぼろ丼（もち麦ごはん）` | [상품 페이지](https://www.sej.co.jp/products/a/item/044049/) | [공식 이미지](https://img-afd.7api-01.dp1.sej.co.jp/item-image/044049/0C695590F288F73F6B430DA6ED7EE04D.jpg) | `seven_002.jpg` | 찰보리밥 용기와 온천계란·닭소보로 용기가 위아래로 보이는 공식 이미지. 두 Product ID가 같은 파일을 사용한다. |
| [x] | `seven_003` | 갓 명란 마요네즈 손말이 오니기리 / `手巻おにぎり 高菜明太マヨネーズ` | [상품 페이지](https://www.sej.co.jp/products/a/item/044009/) | [공식 이미지](https://img-afd.7api-01.dp1.sej.co.jp/item-image/044009/879AB48F2AA0CF7322A662AD7FBB25D0.jpg) | `seven_003.jpg` | 7-Eleven 로고, `高菜明太マヨネーズ`, 208엔(세전) 라벨이 읽히는 삼각 포장 정면. **패키지 식별에 적합.** |
| [x] | `seven_004`, `seven_u_004` | 숙성 기슈 난코우메 손말이 오니기리 / `手巻おにぎり 熟成仕立て紀州南高梅` | [상품 페이지](https://www.sej.co.jp/products/a/item/043836/) | [공식 이미지](https://img-afd.7api-01.dp1.sej.co.jp/item-image/043836/699EB926DD5C6D6FF04714A9B074AF50.jpg) | `seven_004.jpg` | 7-Eleven 로고와 붉은 매실 라벨이 읽히는 삼각 포장 정면. 두 Product ID가 같은 파일을 사용한다. **패키지 식별에 적합.** |

## FamilyMart — 4개

| 완료 | 사용 Product ID | 상품명 | 공식 상품 페이지 | 공식 이미지 후보 | 저장 파일명 | 가져올 이미지 기준 |
|---|---|---|---|---|---|---|
| [x] | `fm_001` | 패밀치킨 / `ファミチキ` | [상품 페이지](https://www.family.co.jp/goods/friedfoods/0253116.html) | [공식 이미지](https://www.family.co.jp/content/dam/family/goods/0253116.jpg) | `fm_001.jpg` | `FAMICHIKI` 봉투와 치킨이 함께 보이는 이미지. **카운터 상품 식별에 가장 적합한 공식 이미지.** |
| [x] | `fm_002` | 패밀치킨 레드 / `ファミチキ（レッド）` | [상품 페이지](https://www.family.co.jp/goods/friedfoods/0250924.html) | [공식 이미지](https://www.family.co.jp/content/dam/family/goods/0250924.jpg) | `fm_002.jpg` | 붉은 시즈닝이 입혀진 사각 치킨 이미지. 공식 이미지에 상품 봉투가 없으므로 현장 메뉴판 또는 상품명 라벨 사진 추가 권장. |
| [x] | `fm_003` | 새우카츠(타르타르 소스 포함) / `えびカツ（タルタルソース入り）` | [상품 페이지](https://www.family.co.jp/goods/friedfoods/0251365.html) | [공식 이미지](https://www.family.co.jp/content/dam/family/goods/0251365.jpg) | `fm_003.jpg` | 분홍색 새우살과 타르타르 속이 보이는 절단면 이미지. 포장이 없으므로 카운터 진열명 또는 메뉴판 사진 추가 권장. |
| [x] | `fm_004` | 아메리칸 도그 / `アメリカンドッグ` | [상품 페이지](https://www.family.co.jp/goods/friedfoods/0251174.html) | [공식 이미지](https://www.family.co.jp/content/dam/family/goods/0251174.jpg) | `fm_004.jpg` | 막대가 달린 아메리칸 도그 전체가 보이는 이미지. 제품 포장이 없으므로 카운터 진열명 사진 추가 권장. |

## 지금은 이미지를 가져오면 안 되는 항목

아래 상품들은 `needs_review`라 실제 오사카 지점 판매 또는 정확한 SKU가 확인되지 않았다. 체크리스트 완료 전까지 이미지를 구하지 않고 앱에서도 추천하지 않는다.

- LIFE: `life_001`, `life_002`, `life_t_001`, `life_t_002`, `life_s_001`, `life_s_002`
- 오사카 판매 제외 또는 지역 불일치: `lawson_t_001`, `lawson_t_002`, `seven_u_001`

LIFE는 실제 점포에서 다음을 한 번에 기록해야 한다.

1. 포장 정면 사진
2. 일본어 상품명 라벨
3. 세금 포함 가격
4. 촬영 지점과 날짜
5. 가능하면 JAN 코드

이 정보가 확보된 다음에만 구체적인 상품명으로 바꾸고 `store_observed` 및 `verified`로 승격한다.

## 파일을 받은 다음 코드에 반영하는 예시

```ts
image: "/images/products/lawson_003.png",
images: [
  {
    kind: "package_front",
    src: "/images/products/lawson_003.png",
    sourceUrl:
      "https://www.lawson.co.jp/recommend/original/detail/img/l787518.png",
    // 공식 이미지 재사용 허가가 확인된 경우에만 cleared_official로 변경
    rights: "pending_review",
  },
],
```

공식 이미지 대신 직접 촬영한 사진을 사용하면 `sourceUrl: "team_photo"`, `rights: "team_photo"`로 기록한다.
