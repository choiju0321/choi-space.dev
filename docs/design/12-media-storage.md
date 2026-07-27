# 12 · Media Storage

첨부 파일(PDF 등)은 **메뉴 IA와 같은 트리**로 `private/media` 아래에 둔다.  
관리자 업로드/다운로드 UI(`/media`)가 이 경로를 탐색한다.

## 원칙

1. 공개 URL IA ≈ 저장 경로 (`life/reading` → `private/media/life/reading`)
2. 엔트리당 폴더 하나 (`{slug}/`) — 파일이 늘어나도 충돌 없음
3. Git에는 PDF를 올리지 않는다 (README만 커밋)
4. 원본 `D:\개인\...` 은 그대로 두고, 사이트용 사본만 `private/media`에
5. 파일명은 **규칙 이름** (아래 표). 구 `presentation.pdf` / `itinerary.xlsx`는 폴백만

## 파일 네이밍 규칙

| 종류 | 형식 | 예 |
|------|------|-----|
| Reading 발제문 | `YYYYMM_발제문_{도서명}.pdf` | `202203_발제문_연애소설 읽는 노인.pdf` |
| Travel 계획서 | `여행계획표_{지역}_{시작YYYYMMDD}_{종료YYYYMMDD}.xlsx` | `여행계획표_부산_20260410_20260412.xlsx` |
| Travel 당일 | `여행계획표_{지역}_{시작YYYYMMDD}.xlsx` | `여행계획표_곤지암_20240918.xlsx` |

- 헬퍼: [`src/lib/media/naming.ts`](../../src/lib/media/naming.ts)
- Reading/Travel 엔트리 폴더에 올리면 **규칙 이름으로 강제 저장**
- 조회: 정규명 → 구 role명 → 패턴 매칭 → legacy
- 일괄 리네임: `npx tsx scripts/rename-media-to-canonical.ts`

## 트리

```text
private/media/
├── life/
│   ├── reading/
│   │   └── {slug}/
│   │       └── YYYYMM_발제문_{도서명}.pdf
│   ├── running/
│   │   └── {slug}/
│   │       └── certificate.pdf       # 기록지 (규칙 추후)
│   ├── culture/{slug}/...
│   ├── food/{slug}/...
│   └── travel/{slug}/
│       └── 여행계획표_{지역}_{시작}_{종료}.xlsx
├── growth/
│   └── {category}/{slug}/attachment.pdf
├── notes/
│   └── {category}/{slug}/attachment.pdf
├── work/
│   └── {company}/{projectOrSeason}/
│       └── (증거 파일 · 원본명 유지)
├── career/
│   ├── package/{slug}/
│   ├── applications/{slug}/
│   └── language/{slug}/
├── documents/
├── finance/
├── records/
└── health/
```

개념적으로:

```text
Home
└── Life
    └── Reading
        └── {slug}
            └── YYYYMM_발제문_{도서명}.pdf
└── Work
    └── {company}
        ├── projects (진행 내역 · outcomes)
        ├── seasons (평가)
        ├── etc
        └── media/{slug}/attachments…
└── Career
    └── package|applications|language/{entry}
        └── attachments…
```

## API · 코드

| 용도 | 경로 헬퍼 |
|------|-----------|
| 공통 | `src/lib/media/paths.ts` |
| 네이밍 | `src/lib/media/naming.ts` |
| Reading 발제문 | `getReadingPresentationWritePath(slug)` |
| Running 기록지 | `getRunningCertificateMediaPath(slug)` |
| Travel 여행 계획서 | `getTravelItineraryWritePath(slug)` |
| Work 항목 첨부 | `buildWorkEntryMediaPath(company, entry)` · `GET|PUT /api/work/.../files` |
| Career 첨부 | `buildCareerEntryMediaPath(space, entry)` · `GET|PUT /api/career/.../files` |

업로드/다운로드 라우트는 **쓰기·읽기 모두 새 경로**를 사용한다.  
조회 시 legacy (`private/reading/presentations/{slug}.pdf`)가 있으면 한동안 폴백한다.

## 관리자 UI

- 트리 브라우저: Space → Category → Entry → Files (`/media`, 로그인 전용)
- API: `GET /api/media?path=` · `GET|PUT /api/media/file?path=`
- Reading/Travel 엔트리 폴더 업로드 시 규칙 파일명으로 저장

## 마이그레이션

기존 파일이 있다면:

```text
private/reading/presentations/{slug}.pdf
  → private/media/life/reading/{slug}/YYYYMM_발제문_{도서명}.pdf

private/running/certificates/{slug}.pdf
  → private/media/life/running/{slug}/certificate.pdf
```

스크립트:

- `scripts/migrate-media-to-ia.ts` (있을 때)
- `scripts/rename-media-to-canonical.ts` — role명 → 규칙명
