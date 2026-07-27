# 독서 기록 작성 가이드

새 책을 읽고 독후감·발제문을 남기는 흐름입니다.

## 1. 메타데이터 등록

[`entries.ts`](./entries.ts) 에 항목 추가:

```ts
{
  id: "unique-id",
  slug: "2026-07-01-book-title", // URL에 사용
  title: "책 제목",
  author: "저자",
  readOn: "2026-07-01",
  clubSeasonId: "moon-joeunpul-2026", // 개인 독서면 생략
  excerpt: "'책 제목'을 읽고",
  tags: ["트레바리", "독후감"],
  artifacts: [
    // sourcePath 는 개인 아카이브 원본 위치 (동기화용)
  ],
}
```

## 2. 독후감 본문

`reviews/{slug}.txt` 파일을 작성합니다.

예: `reviews/2026-07-01-book-title.txt`

Life 목록에서 클릭하면 이 내용이 상세 페이지에 보입니다.

## 3. 발제문 (선택)

`private/media/life/reading/{slug}/presentation.pdf` 에 PDF를 둡니다.

(구경로 `private/reading/presentations/{slug}.pdf` 도 한동안 읽기 폴백)

상세 페이지에서 **발제문 다운로드**로 제공됩니다.

## 4. 아카이브에서 한번에 가져오기

개인 폴더 규칙에 맞게 파일을 둔 뒤:

```bash
npx tsx scripts/sync-reading-from-archive.ts
```

`artifacts[].sourcePath` 기준으로 독후감/발제문을 프로젝트로 복사합니다.

## URL / UI

1. Life 홈 → 최근 독서 미리보기 + **전체 기록 · 검색**
2. `/life/reading` → 검색/필터 후 목록
3. `/life/reading/{slug}` → 독후감 + 발제문 등록/다운로드

## 새 책 작성 흐름

1. `entries.ts` 에 메타 추가  
2. `reviews/{slug}.txt` 에 독후감 작성  
3. 팝업에서 발제문 PDF 등록 (또는 `private/media/life/reading/{slug}/presentation.pdf`)
