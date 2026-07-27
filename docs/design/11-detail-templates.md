# 11 · Detail Templates

타입별 **상세 페이지 슬롯**.  
공통 셸은 하나, 타입별 슬롯만 채운다.

## 공통 셸 (모든 상세)

순서 고정:

1. Reading Progress (1px, 헤더 아래)  
2. Breadcrumb — `Home / {Space} / {Category}`  
3. Eyebrow — `{SPACE} · {CATEGORY}`  
4. Title (display)  
5. Supporting / Excerpt / Date  
6. **타입 슬롯** (아래)  
7. Body / Review  
8. (선택) Share · Related · Prev/Next  
9. Back link — `← {Category}`

구현 앵커:

- 저널: `post-detail.tsx`
- Life 아카이브 헤더: `archive-detail-header.tsx`
- PDF: `archive-file-attachment.tsx`

---

## LOCK — Reading (`book-review`)

**정본.** 레이아웃·Attachment·Review 톤을 바꾸지 않는다.

| 슬롯 | 내용 |
|------|------|
| Supporting | `저자 · 트레바리 · 클럽명` |
| Title | eyebrow `Title` + `'도서명'을 읽고` |
| Review | eyebrow `Review` + 독후감 |
| Date | eyebrow `Date` + readOn |
| Attachment | eyebrow `Attachment` + 발제문 PDF |
| 공통 | `DetailSection` — 라벨·본문 톤 동일, 섹션 `mt-5` / 라벨↓`mt-2` |
| Cover | 없음 (책 표지 추가는 별도 승인 후) |

코드: `src/features/reading/reading-detail.tsx`

---

## LOCK — Culture (`culture`)

**정본.** 포스터 옆 텍스트 배치를 바꾸지 않는다.

| 슬롯 | 내용 |
|------|------|
| Cover | portrait 포스터 (왼쪽) |
| Supporting | kind · place · seat |
| Excerpt | 한 줄 |
| Date | watchedOn (+ time) |
| Meta | 캐스팅 |
| Gallery | Photos |
| Body | 후기 |

코드: `src/features/culture/culture-detail.tsx`

---

## Align — Running (`running-log`)

Reading 셸과 동일. Attachment 라벨만 `기록지`. Photos 슬롯만 추가.

| 슬롯 | 내용 |
|------|------|
| Supporting | kind · distance · place · event |
| Title | eyebrow `Title` + `'대회명'을 달리고` |
| Photos | (있을 때만) 갤러리 |
| Review | eyebrow `Review` + 후기 |
| Date | eyebrow `Date` + ranOn (+ 기록·배번) |
| Attachment | eyebrow `Attachment` + 기록지 PDF (있을 때만) |
| 공통 | `DetailSection` — Reading과 동일 여백 |

코드: `src/features/running/running-detail.tsx`

---

## Align — Food (`place` · food)

맛집·카페 통합. Cafe 단독 라우트 없음 (`/life/cafe` → `/life/food`).

| 슬롯 | 내용 |
|------|------|
| Supporting | kind(맛집\|카페) · place |
| Title | `'상호'에서` |
| Review | 후기 |
| Photos | 음식·공간 사진 (작성 시 파일 첨부) |
| Location | 장소명 + (URL 있을 때) 네이버 지도 / 캐치테이블 연결 행 |
| Date | visitedOn |
| 공통 | `DetailSection` — Reading과 동일 여백 |

필드: `kind`, `naverMapUrl`, `catchTableUrl`  
코드: `src/features/place/place-detail.tsx` (food 분기)

---

## Align — Travel (`place` · travel)

Culture의 **커버 옆 헤더** 문법 + landscape. Food와 달리 Title/Location 슬롯 없음.

| 슬롯 | 내용 |
|------|------|
| Cover | 첫 사진 (4:3, 헤더 옆) |
| Supporting | place |
| Excerpt · Date | 헤더 안 (Culture와 동일) |
| Photos | 나머지 사진 (`DetailSection`) |
| Review | 후기 (`DetailSection`) |
| Attachment | 여행 계획서 Excel (`itinerary.xlsx`) |

코드: `src/features/place/place-detail.tsx` (travel 분기)  
동기화: `npx tsx scripts/sync-travel-from-archive.ts`

---

## Journal — Daily / Growth / Notes

`post-detail.tsx` 사용.

| 슬롯 | Daily | Growth | Notes |
|------|-------|--------|-------|
| Cover | 선택 | 선택 | 선택 |
| TOC | 헤딩 ≥2 | 권장 | 권장 |
| Body | 짧은 저널 | + Code/Callout 가능 | 정보형·Tips |
| Share / Related | 있음 | 있음 | 있음 |
| Attachment | 없음 | 없음 | 없음 |

작성 규칙: 샘플 글 금지. `src/content/posts/entries.json`에 본인 글만.  
가이드: [13-journal-writing.md](./13-journal-writing.md) · 작성: `/write`

---

## Prev / Next · Related (이후)

스펙만 예약. 구현 시 Reading/Culture 비주얼을 밀어내지 않게, Body **아래**에 얇은 리스트로만.
