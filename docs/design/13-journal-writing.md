# 13 · Journal Writing (Daily / Growth / Notes)

저널 글은 Life 아카이브(Reading·Food…)와 달리 **공통 Post 스키마**만 쓴다.  
샘플·시드 글은 넣지 않는다. 본인이 쓴 글만 `src/content/posts/entries.json`에 둔다.

상세 UI: `post-detail.tsx` · 슬롯 표는 [11-detail-templates.md](./11-detail-templates.md)

---

## 어디에 쓰나

| Space | Category 예 | 톤 | contentType |
|-------|-------------|-----|-------------|
| Life · Daily | `daily` | 짧은 하루 기록 | `daily` |
| Growth | `development` · `ai` · `finance` · `english` · `productivity` | 배우는 과정·메모 | `growth-note` |
| Notes | `finance` · `real-estate` · `productivity` · `tips` · `archive` | 정보·팁·보관 | `guide` / `tips` / `archive` |

작성은 `/write` → Daily / Growth / Notes.

---

## 필드 (필수)

| 필드 | 규칙 |
|------|------|
| `title` | 한 줄. 과장·클릭베이트 금지 |
| `excerpt` | 목록용 1문장. 본문 복붙 금지에 가깝게 요약 |
| `publishedOn` | `YYYY-MM-DD` |
| `body` | Markdown. `##` / `###` · 목록 · `**굵게**` |
| `tags` | 0–5개. 없어도 됨 |
| `category` | 내비에 있는 segment만 |

선택: `featured`, `coverImage`, `series`, `seo`

---

## 본문 가이드

### Daily
- 짧게. 문단 2–6개면 충분
- TOC 없이도 읽히게
- “오늘 한 일 / 느낀 한 줄”이 기본

### Growth
- 문제 → 시도 → 결과 순이 읽기 좋음
- 헤딩 2개 이상이면 TOC가 자동으로 붙음
- Quote / Code / Callout은 **필요할 때만** (아직 미구현이면 일반 문단·코드 펜스로 대체)

### Notes
- 정보형: 정의 → 포인트 → 예시
- Tips: 체크리스트·짧은 절차
- Archive: 보관용 메모. 완성도보다 찾기 쉬운 제목

---

## 하지 말 것

- 가짜 샘플 글
- Home 카피를 본문에 복붙
- 카드·이모지·해시태그 남발
- Reading / Culture 상세 레이아웃을 저널에 이식

톤은 [07-writing-style.md](./07-writing-style.md)와 같게: 짧고 담백하게.

---

## 저장 위치

```text
src/content/posts/entries.json   ← 실글 배열
src/content/posts/index.ts       ← 헬퍼 · re-export
```

첫 글은 `/write`에서 남기거나 `entries.json`에 Post 객체를 직접 추가한다.
