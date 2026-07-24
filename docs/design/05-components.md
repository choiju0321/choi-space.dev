# 05 · Components

구현 위치: `src/components/ui`, `src/components/layout`, `src/features/home`

## 공통

- 템플릿 컴포넌트 느낌(두꺼운 카드, 알약 태그 뭉치, 그라데이션 버튼) 금지
- Hover는 **opacity / underline / 미세 translate(1–2px)** 정도
- Focus: 은은한 ring, 과장된 outline 금지

---

## Navbar

- 로고(디스플레이) = Home
- 순서: **About · Life · Growth · Notes · Contact · Login**
- 얇은 높이, 하단 hairline
- 드롭다운: 그림자 없이 border + paper 배경
- Home 텍스트 링크 중복 금지

## Hero

- **브랜드명이 주인공** (작은 eyebrow만 두고 헤드라인을 본문처럼 쓰지 말 것 — 현재는 Choi Space가 H1)
- 지원 문장 1줄
- CTA는 텍스트(“계속 읽기”)가 기본. 큰 primary/secondary 버튼 쌍은 Home에서 지양

## Button

- Primary: 잉크 채움 (드물게)
- Secondary: 밑줄형
- Home·에디토리얼 면에서는 `<a>`/`<button>` 텍스트 링크 우선

## Card / Post Card

- “카드”라는 이름이라도 **박스 UI를 기본으로 쓰지 않음**
- Post 목록: 제목 · 메타 · 구분선. 썸네일 격자는 필요할 때만, 그림자 없이
- Featured: 더 큰 디스플레이 타이포 + excerpt + 읽기 →
- Empty: 한 줄 muted 문장. 일러스트·이모지 금지

구현: `src/features/content/` — 상세는 [09-content-system.md](./09-content-system.md)

## Section Header

- 선택적 eyebrow (uppercase, tracking, muted-soft)
- 디스플레이 H2
- 짧은 보조 문장 0–1개

## Footer

- 브랜드명 + 한 줄 태그라인 + ©
- 링크 덩어리·소셜 아이콘 줄 지양

## Modal (Profile sheet)

- About 상세용. 랜딩을 떠나지 않음
- 블록: Profile / Timeline / Values / Hobbies / Skills / Contact
- 헤더 eyebrow + 제목 + 닫기. 본문은 스크롤

## Timeline

- 기간(muted, tabular) + 라벨 + 한 줄 설명
- 세로 라인 장식·점 장식은 최소화 (없어도 됨)

## Profile Card (Home About)

- 사진 + 이름 + roleLine + lead + Profile 링크
- 태그 알약 나열 금지 (roleLine 한 줄로)

## Tag / Badge

- 가능하면 쓰지 않음
- 필요 시 텍스트·middot 구분 (`·`)만

## Archive Index Row (Home 01/02/03)

- 번호 · 라벨 · 제목 · 한 줄 설명 · →
- 행 전체가 링크. hover 시 제목 opacity↓, 화살표 미세 이동

## Empty / Loading

- Empty: 짧은 문장만 (`곧 글을 채울 예정입니다.` 톤)
- Loading: 스피너 파티 금지. 텍스트 또는 아주 옅은 pulse

## Hover 상태

허용: opacity, underline, `translate-x-1`  
금지: bounce, rotate, scale-up 과함, glow, color flash
