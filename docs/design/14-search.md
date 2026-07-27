# 14 · Search (요구사항 초안)

콘텐츠가 쌓인 뒤 구현한다. 지금은 **범위·UX만** 고정한다.

## 목표

Life / Growth / Notes 공개 기록에서 **제목·요약·태그**로 빠르게 찾기.  
관리자 전용(Work·Health·Documents)은 검색 대상이 **아님**.

## 진입점

| 위치 | 동작 |
|------|------|
| Reading 목록 | 기존 “검색” 톤 유지 · 확장 시 동일 문법 |
| Growth / Notes Overview | 선택: 상단 얇은 검색 필드 |
| 전역 (`/search`) | Phase 후반 — 결과가 충분할 때 |

UI: 알약·필터 칩 뭉치 금지. **텍스트 필드 + middot 필터**만.

## 필터 축

1. **Query** — 제목 · excerpt · tags (본문 full-text는 나중)
2. **Space** — Life / Growth / Notes (또는 All)
3. **Category** — 해당 Space 내비 항목
4. **Tag** — 글에 달린 태그 (있을 때만)
5. **Series** — `Post.series`가 쓰이기 시작하면 (예약)

날짜 범위·정렬(최신/관련도)은 2차.

## 결과

- Post Card / Archive list와 **같은 행 문법**
- Empty: `검색 결과가 없습니다.` 한 줄
- URL: `/search?q=&space=&category=&tag=` (공유 가능)

## 데이터

| 소스 | 포함 |
|------|------|
| `posts/entries.json` | Daily · Growth · Notes |
| Reading / Running / Culture / Food / Travel 어댑터 | Life 아카이브 |

인덱싱: 초기에는 **빌드/요청 시 메모리 필터**. 글이 수백 건 넘으면 별도 인덱스 검토.

## 하지 않음 (당분간)

- AI 검색 · 시맨틱 검색
- 관리자 문서/건강 기록 검색
- 자동완성 드롭다운 과다 UI

## 구현 순서 (나중)

1. `getSearchablePosts()` 어댑터 통합
2. Reading 목록 검색을 공통 훅/컴포넌트로 승격
3. `/search` 페이지
4. (선택) Series · 본문 검색
