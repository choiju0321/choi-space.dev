# Database · Story contents

Story = **Life · Growth · Notes** (About/Contact는 정적 페이지로 유지).  
Work / Career / Finance / Personal / Admin은 이 범위 밖.

## 모델

```
contents (공통 게시글)
  ├─ content_reading_details   (1:1, book-review)
  ├─ content_running_details   (1:1, running-log)
  ├─ content_culture_details   (1:1, culture)
  ├─ content_place_details     (1:1, place = food|travel)
  └─ media_assets              (1:N, 사진 경로)
```

저널(Daily / Growth / Notes)은 **detail 없음** — `contents.body`만 사용.

## `contents` 공통 컬럼

| 컬럼 | 설명 |
|------|------|
| id | 안정 키 (기존 JSON id 유지) |
| slug / space / category | URL |
| content_type | `daily` · `growth-note` · `tips` · `book-review` · `place` … |
| title / excerpt / body | 본문·목록 |
| published_on | 목록 정렬용 대표일 (readOn·ranOn·visitedOn·watchedOn도 여기로 투영) |
| tags / featured / cover_* / author / series | 기존 Post 스키마와 동일 |
| status | `published` (나중에 draft) |

Unique: `(space, category, slug)`

## Detail

- **reading:** book_author, read_on, participation, club_season_id, guest_club_name, artifacts(jsonb)
- **running:** kind, ran_on, distance_km, place, event_name, result_time, …
- **culture:** kind, watched_on, watched_at, place, seat, cast, source
- **place:** place(지역), visited_on/until, food kind, map URLs

## 전환

1. `npm run db:push` — 스키마 반영
2. `npm run db:seed` — JSON·리뷰·사진 경로 → DB
3. Story 조회는 Postgres (`src/lib/content/story-repository.ts`)
4. Write는 JSON + DB 이중 기록 (`story-write.ts`)

로컬 접속: `postgresql://choi:choi@localhost:5432/choi_space`
