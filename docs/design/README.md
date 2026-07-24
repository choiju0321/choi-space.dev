# Choi Space Design

**헌법.** 새 페이지·컴포넌트를 만들기 전에 이 폴더를 읽는다.

| 문서 | 내용 |
|------|------|
| [01-brand.md](./01-brand.md) | 브랜드 철학·키워드·슬로건 |
| [02-design-system.md](./02-design-system.md) | 색·간격·그리드·토큰 |
| [03-typography.md](./03-typography.md) | 타이포 계층 |
| [04-layout.md](./04-layout.md) | 여백·섹션·컨테이너 |
| [05-components.md](./05-components.md) | 컴포넌트 철학 |
| [06-motion.md](./06-motion.md) | 모션 |
| [07-writing-style.md](./07-writing-style.md) | 카피 톤 |
| [08-page-guidelines.md](./08-page-guidelines.md) | 페이지별 UX |
| [09-content-system.md](./09-content-system.md) | Post·Category·공용 읽기 컴포넌트 |

## Golden Rule

> Never redesign Choi Space. Always **evolve** Choi Space.  
> Every page should feel like it was designed by the **same designer**.  
> Consistency > creativity. Every pixel needs a reason.

## Source of truth (코드)

문서는 언어를 설명하고, **실제 값은 코드**에 있다.

- 색·토큰: `src/app/globals.css`
- 폰트: `src/app/layout.tsx` (Noto Serif KR / Noto Sans KR)
- Home 카피: `src/content/home.ts`
- 내비 IA: `src/content/nav.ts`

문서와 코드가 다르면 **코드를 고치거나 문서를 고친다.** 둘 다 어중간하게 두지 않는다.
