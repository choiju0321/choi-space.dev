# Choi Space

Personal web home for Choi — starting as a calm introduction page, designed to grow into a private digital platform over time.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

## Scripts

```bash
npm run dev    # local development
npm run build  # production build
npm run start  # serve production build
npm run lint   # ESLint
```

## Project structure

```text
src/
  app/
    (public)/     # Public marketing / introduction surface
    (platform)/   # Reserved for future private platform (no routes yet)
  components/
    ui/           # Reusable primitives (Button, Container, Section, …)
    layout/       # Site shell (header, footer)
  features/
    home/         # Landing page sections
  content/        # Typed content + MDX prose
  lib/
    content/      # Content repositories (swap to DB/API later without rewriting UI)
  types/          # Shared domain types
```

### Design principles

- Pages assemble features; features receive data from repositories.
- UI does not import content files directly.
- Public vs platform route groups keep future auth boundaries clear.

## Editing content (Phase 1)

프로필·문구·사진은 UI 코드가 아니라 content 파일에서 수정합니다. 자세한 안내는 [`src/content/README.md`](src/content/README.md)를 보세요.

| What | Where |
|------|--------|
| 이름, 소개, 이메일, 사진 경로 | [`src/content/profile.ts`](src/content/profile.ts) |
| 연혁 (학력·자격·수상) | [`src/content/career.ts`](src/content/career.ts) |
| 대표 경험 / 프로젝트 | [`src/content/projects.ts`](src/content/projects.ts) |
| About 본문 | [`src/content/mdx/about.mdx`](src/content/mdx/about.mdx) |
| 프로필 사진 파일 | [`public/images/profile/portrait.jpg`](public/images/profile/portrait.jpg) |

## Roadmap (not in this phase)

- Authentication
- PostgreSQL + Prisma
- Private dashboard modules (career, blog, files, AI, …)

Keep `(platform)` empty until those land — do not mix public marketing into that group.
