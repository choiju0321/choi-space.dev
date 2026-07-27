# 10 · Content Architecture

공통 데이터 구조. **UI를 다시 그리지 않고**, 스키마와 매핑을 고정한다.

## Lock (비주얼 정본)

다음 상세는 **레퍼런스**다. 스키마·공통 셸을 맞출 때 **이 화면의 감각을 깨지 않는다.**

| 레퍼런스 | 경로 | 잠근 것 |
|----------|------|---------|
| **Reading Detail** | `/life/reading/[slug]` · `reading-detail.tsx` | 헤더 타이포 · 발제문 Attachment · Review 본문 |
| **Culture Detail** | `/life/culture/[slug]` · `culture-detail.tsx` | 포스터 옆 배치 · 메타 행 · Photos · Review |

허용: 공용 컴포넌트 추출, 필드 추가, prev/next·SEO 등 **기능 확장**.  
금지: 여백·타이포·배치를 “더 예쁘게” 바꾸려는 재디자인.

---

## 공통 Post (제품 스키마)

구현: `src/types/post.ts`  
저널형 글(Growth / Notes / Daily)은 이 스키마로만 작성한다.  
Life 특수 도메인(Reading 등)은 **도메인 타입을 유지**하고, 목록·연관 글에서는 PostListItem으로 투영한다.

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | ✅ | 안정적 식별자 |
| `slug` | ✅ | URL 세그먼트 |
| `space` | ✅ | `life` \| `growth` \| `notes` |
| `category` | ✅ | URL 카테고리 (`reading`, `development`, `tips` …) |
| `contentType` | ✅* | 상세 템플릿 키 (`book-review` 등). *저널 Post는 필수 |
| `title` | ✅ | 디스플레이 제목 |
| `excerpt` | ✅ | 한 줄 요약 (목록·OG 기본) |
| `publishedOn` | ✅ | `YYYY-MM-DD` |
| `tags` | ✅ | 문자열 배열 (알약 UI 금지, middot) |
| `body` | ✅* | 마크다운/블록 본문. *아카이브 후기는 파일로 둘 수 있음 |
| `coverImage` | | 포스터·대표 사진 public path |
| `coverAspect` | | `portrait` \| `landscape` |
| `featured` | | Overview Featured 후보 |
| `author` | | 기본 사이트 오너; Reading은 책 저자와 별개 |
| `updatedOn` | | 선택 |
| `series` | | 선택 (시리즈 slug) |
| `readingTimeMinutes` | | 선택, 생성 가능 |
| `seo` | | `title` · `description` · `ogImage` · `canonical` |

URL 규칙:

- 저널: `/{space}/{category}/{slug}`
- Life 아카이브: `/life/{domain}/{slug}` (기존 유지)

---

## ContentType

| contentType | space | category(예) | 상세 템플릿 |
|-------------|-------|--------------|-------------|
| `book-review` | life | reading | Reading Detail (**lock**) |
| `running-log` | life | running | Running Detail (Reading 셸 정렬) |
| `culture` | life | culture | Culture Detail (**lock**) |
| `place` | life | food (맛집·카페) / travel | Food: DetailSection · Travel: Culture 커버 문법 |
| `daily` | life | daily | Journal Detail (`post-detail` + 선택 갤러리) |
| `growth-note` | growth | development, ai, … | Journal Detail + Code/Callout |
| `guide` | notes | finance, real-estate, … | Journal Detail (정보형) |
| `tips` | notes | tips | Journal Detail (짧음) |
| `archive` | notes | archive | Journal Detail (보관) |
| `reference` | notes | — | Journal Detail (참고 링크 위주) |

---

## Life 도메인 ↔ Post 매핑

목록·Overview는 `archive-as-posts.ts`가 PostListItem으로 맞춘다.

### Reading → book-review

| Post / 목록 | ReadingEntry |
|-------------|---------------|
| title | title |
| slug | slug |
| excerpt | excerpt |
| publishedOn | readOn |
| tags | tags |
| supporting (상세) | author · contextLabel |
| attachment | presentation PDF |
| body | review 파일 본문 |

### Culture → culture

| Post / 목록 | CultureEntry |
|-------------|---------------|
| title | title |
| coverImage | posterImage |
| coverAspect | portrait |
| publishedOn | watchedOn |
| excerpt | excerpt |
| supporting | kind · place · seat |
| cast | cast[] |
| gallery | photos |
| body | review 파일 본문 |

### Running / Food / Travel

Running = distance · result · certificate (Attachment 문법 = Reading).  
Food/Travel = place · landscape cover · gallery (Place Detail).

---

## Growth / Notes

`src/content/posts.ts` + `get-posts.ts`만 사용.  
시드 샘플 글은 넣지 않는다. 본인 글만.

본문 블록(이후 확장, 필요할 때만):

- paragraph / heading (TOC)
- quote
- code
- callout
- gallery

---

## 다음 구현 순서

1. 이 문서 · `11-detail-templates.md`를 스펙으로 유지  
2. Reading / Culture **시각 변경 없이** 타입·문서만 보강  
3. Running / Place를 같은 셸 필드명으로 정렬 (이미 근접)  
4. Daily / Growth / Notes는 `post-detail.tsx` 정본 + 작성 가이드  
5. Quote · Code · Callout은 Growth 첫 실글이 필요할 때 추가
