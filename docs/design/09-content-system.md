# 09 · Content System

Life / Growth / Notes가 **같은 읽기 시스템**을 쓴다.  
블로그 크롬이 아니라 **Apple Journal**에 가까운 기록 경험.

## 원칙

1. Home은 건드리지 않는다. Content System은 Home 언어를 **확장**한다.
2. 글이 주인공. UI는 뒤로.
3. 카드·알약·그림자·다채로운 CTA 금지.
4. 컴포넌트는 `src/features/content/`에 모은다. 공간마다 복제하지 않는다.

## 데이터

| 항목 | 위치 |
|------|------|
| 타입 · contentType | `src/types/post.ts` |
| 스키마 문서 | [10-content-architecture.md](./10-content-architecture.md) |
| 상세 템플릿 | [11-detail-templates.md](./11-detail-templates.md) |
| 시드/본문 | `src/content/posts/entries.json` (본인 글만) |
| 조회 | `src/lib/content/get-posts.ts` |

**Reading / Culture 상세는 비주얼 lock.** 재디자인하지 않는다.

URL: `/{space}/{category}/{slug}`  
예: `/life/daily/morning-page`, `/growth/ai/small-prompts`

> **Life 아카이브**  
> Reading / Running / Culture / Food / Travel  
> 데이터는 기존 도메인 소스 유지.  
> 목록·상세 크롬은 Content System과 동일 (`CategoryPageTemplate`, `ArchiveDetailHeader`).  
> 어댑터: `src/lib/content/archive-as-posts.ts`  
> Culture = portrait 포스터, Food/Travel = landscape 커버

> **Growth / Notes**  
> `CategoryPageTemplate` + Post Detail (`/{space}/{category}/{slug}`)  
> 글이 없으면 Empty State.

## 템플릿

| 템플릿 | 컴포넌트 | 용도 |
|--------|----------|------|
| Post Detail | `post-detail.tsx` | 모든 공간의 글 상세 |
| Category | `category-page-template.tsx` | 카테고리 목록 + pagination |
| Space Overview | `space-overview.tsx` | Featured · Latest · Category filter |

## 구성 요소

| # | 컴포넌트 | 파일 | 노트 |
|---|----------|------|------|
| 1 | Post Detail | `post-detail.tsx` | Progress + TOC + Body + Share + Related |
| 2 | Category Page | `category-page-template.tsx` | Empty / list / page |
| 3 | Post Card | `post-card.tsx` | list · featured (박스 카드 아님) |
| 4 | Tag | `post-tag.tsx` | middot 텍스트, 알약 금지 |
| 5 | TOC | `post-toc.tsx` | 본문 위 짧은 목차 |
| 6 | Related | `related-posts.tsx` | 같은 공간 우선 |
| 7 | Pagination | `pagination.tsx` | `?page=` |
| 8 | Empty | `empty-state.tsx` | 한 줄 muted |
| 9 | Share | `share.tsx` | 링크 복사 · X |
| 10 | Reading Progress | `reading-progress.tsx` | 상단 1px |
| 11 | Breadcrumb | `content-breadcrumb.tsx` | Home / Space / Category |
| 12 | Archive Header | `archive-detail-header.tsx` | Life 상세 공통 |
| 13 | Detail Section | `detail-section.tsx` | Title/Review/… 여백 |
| 14 | File Attachment | `archive-file-attachment.tsx` | PDF · Excel |

## Overview UX

- **Featured** 1건 (있을 때만)
- **Latest** 소량 (탐색 느낌, 피드 덤프 금지)
- **Category filter** = middot 텍스트 필터 (칩 뭉치 금지)
- **Browse** = 카테고리 행 링크

## Self Review 기준

브랜드 · 타이포 · 여백 · 레이아웃 · 인터랙션 · 읽기 · 프리미엄  
각 90점 미만이면 제출 전 수정.
