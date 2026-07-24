# Choi Space — 방향성 · 로드맵 · 할 일

마지막 정리: **2026-07-25**  
제품 목표: Premium Personal Archive → Public Personal OS  
원칙: **Never redesign. Always evolve.** (`docs/design/`)

---

## 1. 이 사이트가 뭔가

**Choi Space = 최지웅의 기록 운영 공간**

| 방문 유형 | 경험 |
|-----------|------|
| **일반** | Home 브랜드 + Life / Growth / Notes 기록 |
| **이직/채용** | (예정) 공고별 Career 공개 패키지 |
| **관리자(나)** | 전부 + Write · 서류 · Finance · Records |

---

## 2. Golden Rules

1. Home·브랜드를 다시 디자인하지 않는다. **확장(Evolve)** 한다.
2. 새 컴포넌트 전에 기존 것을 재사용한다.
3. 모든 페이지는 같은 디자이너가 만든 것처럼.
4. Consistency > creativity. 모든 픽셀에 이유.
5. 페이지 모음이 아니라 **하나의 Product**를 만든다.

---

## 3. 공개 IA (확정)

```text
Home · About · Life · Growth · Notes · Contact
```

| Life | Growth | Notes |
|------|--------|-------|
| Daily · Reading · Running · Culture · Food · Travel | Development · AI · Finance · English · Productivity | Finance · Real Estate · Productivity · Tips · Archive |

설정: [`src/content/nav.ts`](../src/content/nav.ts)  
디자인 헌법: [`docs/design/`](./design/)

---

## 4. CURRENT STATUS (완료)

### 브랜드 · 홈 · 시스템

| 항목 | 상태 | 위치 |
|------|------|------|
| Brand Identity · Slogan | ✅ | `docs/design/01-brand.md`, Home |
| Home (Hero → Manifesto → About → Archive → Footer) | ✅ | `src/features/home/` — **재디자인 금지** |
| Design System · Cursor Rules | ✅ | `docs/design/`, `.cursor/rules/` |
| IA · Navigation · Auth 분기 | ✅ | `src/content/nav.ts`, SiteHeader |
| Design tokens · Typography · Motion | ✅ | `globals.css`, FadeIn |

### Content System (목록·크롬 통일)

| 항목 | 상태 | 위치 |
|------|------|------|
| Life / Growth / Notes Overview | ✅ | Featured · Latest · Category filter · Browse |
| Category Page Template | ✅ | Daily와 동일 패턴 |
| Post Card · Tag · Pagination · Empty | ✅ | `src/features/content/` |
| Reading Progress · TOC · Share · Related | ✅ | 저널형 Post Detail |
| Life 아카이브 → Content System 어댑터 | ✅ | Reading · Running · Culture · Food · Travel (+ Cafe) |
| Culture 포스터 / Place 커버 | ✅ | 목록·상세 옆 이미지 |
| 발제문·기록지 Attachment UI | ✅ | `archive-file-attachment.tsx` |
| Growth / Notes 카테고리 허브 | ✅ | Empty State (본인 글 대기) |
| 샘플 시드 글 | ✅ 삭제 | `posts.ts`는 빈 배열 — 본인 글만 추가 |

### Life 도메인 데이터 (기존 완성분 유지)

| 타입 | 데이터 | 목록 UI | 상세 크롬 |
|------|--------|---------|-----------|
| Reading | ✅ entries | ✅ CategoryTemplate | ✅ ArchiveDetail + 발제문 |
| Running | ✅ entries | ✅ | ✅ + 기록지 |
| Culture | ✅ entries | ✅ + poster | ✅ |
| Food / Travel | ✅ entries | ✅ + cover | ✅ |
| Daily | 구조만 | ✅ Empty | Post Detail 대기 |

### 관리자 (부분)

| 항목 | 상태 |
|------|------|
| Write 세션 · Login | ✅ |
| Health 시드 · 목록 | ✅ (AI 해석은 자리만) |
| Work / Documents / Finance 허브 | placeholder |
| Career 일부 | 있음 |

---

## 5. NEXT TODO — Phase 1 Foundation

**지금 초점:** 페이지를 더 늘리는 것이 아니라,  
**세부 게시글이 어떤 템플릿으로 작성·노출될지** 콘텐츠 설계.

> ChatGPT 로드맵의 “Post Detail / Content Types” =  
> **타입별 상세 템플릿·메타·본문 블록을 디자인·스키마로 고정**하는 작업.

### 5.1 Content Architecture ⭐⭐⭐⭐⭐ (다음 1순위)

공통 Post 스키마를 **제품 수준으로** 확정한다.

```text
Post
- title, slug, description / excerpt
- coverImage, ogImage
- space (life|growth|notes), category, contentType
- tags, series?
- author, publishedOn, updatedOn?
- readingTime?
- body (blocks)
- related / prev·next
- seo (title, description, canonical)
```

- [ ] `src/types/post.ts` 확장 + 문서화 (`docs/design/09` 또는 `10-content-architecture.md`)
- [ ] Life 도메인(Reading 등) ↔ 공통 Post 필드 **매핑 표**
- [ ] Growth / Notes는 이 스키마만으로 작성

### 5.2 Content Types + 타입별 상세 템플릿 ⭐⭐⭐⭐⭐ (다음 핵심)

**공통 셸은 하나** (Progress · Breadcrumb · TOC · Body · Share · Related).  
**타입별 슬롯**만 다르다 (표지·메타·첨부·갤러리).

| Space | Type | 상세에서 보여줄 것 (설계 대상) | 상태 |
|-------|------|-------------------------------|------|
| Life | Book Review (Reading) | 책 메타 · 발제문 PDF · 독후감 | 🟡 크롬 있음 → 템플릿 문서화·블록 정리 |
| Life | Running Log | 거리·기록·기록지 PDF · 사진 · 후기 | 🟡 동일 |
| Life | Culture | 포스터 · 좌석·캐스팅 · 사진 · 후기 | 🟡 동일 |
| Life | Food / Travel | 장소 · 커버 · 갤러리 · 후기 | 🟡 동일 |
| Life | Daily | 짧은 저널 · (선택) 사진 | ⬜ 템플릿 확정 후 작성 |
| Growth | Development / AI / … | Hero · 본문 · Quote · Code · Callout | ⬜ |
| Notes | Guide / Tips / … | 정보형 본문 · Checklist? · Reference | ⬜ |

할 일:

- [ ] **타입별 Detail Template 스펙** 작성 (와이어가 아니라 디자인 언어 + 필드 목록)
  - Hero / Cover / Meta row / Attachment / Gallery / Review body / Prev·Next
- [ ] 본문 블록 컴포넌트: Quote · Code · Callout · Gallery (필요분만, 디자인 시스템 확장)
- [ ] Reading 하나를 **레퍼런스 상세**로 완성 (템플릿의 정본)
- [ ] 같은 셸로 Running · Culture · Food 정렬
- [ ] Daily / Growth / Notes 빈 템플릿 + 작성 가이드

### 5.3 Component Library 정리 ⭐⭐⭐⭐

이미 있는 것과 부족한 것을 목록화한다. **새로 만들기 전에 재사용.**

- [ ] `docs/design/05-components.md`에 Content System 컴포넌트 현황 표 갱신
- [ ] Breadcrumb 공통화 (중복 제거)
- [ ] Gallery · Quote · Callout · Code Block (상세 템플릿에 필요할 때만)
- [ ] Loading State (텍스트/얇은 pulse만)

### 5.4 Search (설계만 → 이후 구현) ⭐⭐⭐⭐

- [ ] Search / Tag / Category / Series 요구사항 초안
- [ ] 구현은 콘텐츠가 쌓인 뒤

### 5.5 SEO ⭐⭐⭐⭐

- [ ] Sitemap · Robots · RSS
- [ ] OG / Twitter Card · Structured Data · Canonical

### 5.6 About · Contact 독립 페이지 ⭐⭐⭐⭐

- [ ] `/about` — Story · Timeline · Values · FAQ 등 (Home Modal과 역할 분리)
- [ ] `/contact` — Email · Github · LinkedIn

### 5.7 Write · Documents (운영)

- [ ] Write에 Growth / Notes / Daily 작성 플로우
- [ ] Documents 서류 금고

---

## 6. 이후 Phase (요약)

| Phase | 이름 | 목표 |
|-------|------|------|
| **2 Professional** | Career · Work · Projects · Portfolio | 이직·전문 공개 |
| **3 Personal OS** | Private Dashboard · Finance · Goals · KG | 관리자 OS |
| **Future** | Newsletter · Analytics · AI Search/Summary · Dark Mode | 콘텐츠 축적 후 |

상세 운영 축(Work CRUD, Finance 원장 등)은 콘텐츠 플랫폼 Foundation 이후에 이어간다.

---

## 7. 하지 않는 것 (당분간)

- Home 재디자인 · 새 색/폰트/카드 문법
- 공개 홈에 Health · Finance 원장 노출
- PDF 비밀번호를 코드에 저장
- 의료·금융 “단정 자문” UI
- 샘플/더미 글을 본인 기록처럼 올리기

---

## 8. 바로 다음 한 줄

> **Content Architecture 확정 → 타입별 Post Detail 템플릿 디자인·스키마 → Reading을 정본으로 구현 → 나머지 Life/Growth/Notes에 동일 셸 적용.**

관련: [`README.md`](../README.md) · [`docs/design/09-content-system.md`](./design/09-content-system.md)
