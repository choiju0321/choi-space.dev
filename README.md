# Choi Space

최지웅의 **기록 운영** 공간. 일반에게는 Life 블로그, 관리자에게는 일·커리어·서류·금융·기타 축이 열린다.

저장소: [github.com/choiju0321/choi-space.dev](https://github.com/choiju0321/choi-space.dev)  
방향성 · 로드맵 · 할 일: [`docs/DIRECTION.md`](docs/DIRECTION.md)

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- 콘텐츠는 파일 기반 (`src/content`, JSON/TS/MDX). DB는 아직 없음

## 시작하기

```bash
npm install
cp .env.example .env.local   # LIFE_WRITE_SECRET 설정
npm run dev
```

| URL | 설명 |
|-----|------|
| `/` | 공개 홈 — 일반은 Life 중심, 로그인 시 Career 등 관리 섹션 |
| `/life/...` | Life 블로그 아카이브 |
| `/write` | 로그인 · 기록 작성 (`LIFE_WRITE_SECRET`) |
| `/work` · `/career` · `/documents` · `/finance` · `/records` | 관리자 축 허브 (로드맵 Phase별 구현) |
| `/health` | 건강검진 (기타 기록 하위, 세션 필요) |

## 권한 · 메뉴

| 상태 | 헤더 메뉴 |
|------|-----------|
| **일반** | Home · About · Life ▾ · Growth · Notes · Contact · Login |
| **관리자** | (위) + Work · Career · Documents · Finance · Records · Write · Logout |

Life 하위: Overview · Reading · Running · Culture · Food · Cafe · Travel  
공개 콘텐츠 축: **Life**(경험) · **Growth**(성장) · **Notes**(정보글). 자세한 IA·할 일 순서는 [`docs/DIRECTION.md`](docs/DIRECTION.md).

- `/write`·플랫폼·`/health`는 같은 세션 쿠키.
- 원본 PDF는 `private/` + gitignore.

## 구현된 기능 요약

### 홈 · Career

- Hero / About / Career / Life / Featured work / Contact
- Career: 학력·자격·수상·경력 + **병역** (육군 기갑 · 전차조종수)
- 서류는 `private/documents/` + `/api/documents/...` (학력 PDF, 병역증명서 등)

### Life

| 도메인 | 내용 |
|--------|------|
| **Reading** | 트레바리/개인 독서, 클럽·놀러가기·개인 필터, 독후감·발제 PDF |
| **Running** | 대회/일상, 기록지 PDF 슬롯 |
| **Culture** | 뮤지컬 관람 (포도알 기반), 포스터·캐스트·좌석 |
| **Food / Cafe / Travel** | 장소 아카이브 + 후기·사진 |

개인 아카이브 루트는 `D:\개인`을 기준으로 sync 스크립트가 맞춥니다.

### Write (`/write`)

- 카테고리: 독서 · 러닝 · 문화 · 맛집 · 카페 · 여행
- 후기(md) · 사진 · 일부 도메인은 신규 엔트리 JSON 추가
- API: `/api/write`, `/api/write/login|logout|session`

### Health (`/health`) — 비공개

- 연도별 KMI 검진 메타 (`src/content/health/checkups.json`)
- 목록 · 상세 · 이상소견(`findings`) · 참고용 요약(`aiSummary`)
- PDF 사본: `private/health/checkups/` (`npm run sync:health`)
- PDF 비밀번호는 저장하지 않음 (`passwordHint`만)
- **AI 자동 해석 버튼은 아직 비활성** (나중에 연결 예정). 현재 소견은 PDF를 보고 시드해 둔 상태

## 콘텐츠 수정 위치

UI가 아니라 content 파일을 고칩니다. 상세는 [`src/content/README.md`](src/content/README.md).

| 무엇 | 어디 |
|------|------|
| 프로필 · 연락처 | `src/content/profile.ts` |
| Career · 병역 · 서류 매핑 | `src/content/career.ts`, `document-forms.ts` |
| Reading | `src/content/reading/` |
| Running | `src/content/running/` |
| Culture | `src/content/culture/entries.json` |
| Food / Cafe / Travel | `src/content/{food,cafe,travel}/entries.json` |
| Health | `src/content/health/checkups.json` |
| About 본문 | `src/content/mdx/about.mdx` |
| 프로필·포스터 이미지 | `public/images/` |

## private / sync

```text
private/
  documents/              # Career 서류 PDF (gitignore)
  reading/presentations/  # 발제 PDF
  running/certificates/   # 대회 기록지
  health/checkups/        # 검진 PDF 사본
```

```bash
npx tsx scripts/sync-reading-from-archive.ts   # 독후감·발제
npm run sync:health                              # 건강검진 PDF
```

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run sync:health
```

## 설계 원칙

- Pages → features → `lib/content` 저장소. UI가 content 파일을 직접 import하지 않음
- 공개 마케팅과 비공개 플랫폼 라우트 그룹을 분리
- 건강·병역 등 민감 원본은 공개 홈에 올리지 않음

## 다음으로 (미구현)

- Health 「이 검진 해석」 자동 파이프라인 (스캔 PDF·암호 PDF 처리 포함)
- 인증을 세션 비밀번호 이상으로 확장
- PostgreSQL + Prisma
- 공개 홈에 Health 노출하지 않음 (의도적)

Keep sensitive PDFs and `.env.local` out of git.
