# Life — 추억 아카이브 (블로그 방향)

Life는 “목록”이 아니라 **추억을 남기는 입구**입니다.

## 컬렉션

| id | 한글 | 용도 |
|----|------|------|
| `reading` | 독서 | 트레바리·독후감 |
| `running` | 러닝 | 마라톤·러닝 |
| `culture` | 문화 | 뮤지컬·전시·공연 |
| `food` | 맛집·카페 | 식사/카페 + 사진 + 지도·예약 URL |
| `travel` | 여행 | 후기·사진 + 여행 계획서(Excel 첨부) |

## 항목 필드 (`LifeMemory`)

- `title` / `place` / `date` / `excerpt` — 목록에 노출
- `slug` — 이후 상세 URL용
- `coverImage` / `bodyPath` — 사진·본문 (상세 페이지 때 연결)

데이터는 [`life.ts`](./life.ts) 에서 수정합니다.

## 다음 확장

1. `/life/[collection]/[slug]` 상세 게시글
2. MDX 본문 + 사진 갤러리
3. 여행 엑셀 → 항목 자동 반영 (선택)
