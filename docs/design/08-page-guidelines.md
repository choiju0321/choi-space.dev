# 08 · Page Guidelines

## 역할 분리

| 페이지 | 하는 일 | 하지 않는 일 |
|--------|---------|--------------|
| **Home** | 브랜드 · 사람 · 세 갈래 안내 | 최신 글 많이  consum / 긴 스크롤 랜딩 |
| **About** | Home 섹션 + Profile sheet | 별도 화려한 About 마이크로사이트 |
| **Life** | 경험 아카이브 | Growth/Notes 글을 섞어 넣기 |
| **Growth** | 배움·성장 글 | 자산 관리 UI |
| **Notes** | 정보·칼럼 | Finance 관리자 원장과 혼동되는 UX |
| **Write / Admin** | 작성·운영 | 공개 홈 톤을 깨는 대시보드 장식 |

## Home

1. Hero → Manifesto → About → Archive index → Footer  
2. 스크롤은 짧게. “언제 끝나지?”가 나오면 실패한 것  
3. CTA: 계속 읽기 / Profile / 01·02·03 경로 — **자연스럽게**

## Overview (`/life`, `/growth`, `/notes`)

- `SpaceOverview`: Featured · Latest · Category filter · Browse
- Growth/Notes/Life **같은 overview 패턴**
- Life Overview는 `/#` 홈 앵커로 보내지 않음 → `/life`

## 카테고리 · Post Detail

- 템플릿: `CategoryPageTemplate`, `PostDetail` (`docs/design/09-content-system.md`)
- 브레드크럼: `Home / Life / Daily`
- 상세: measure 안 본문, Reading Progress, TOC, Share, Related
- 특수 Life 아카이브(Reading 등)는 기존 explorer 유지 + 저널 Post는 Content System

## 새 페이지 체크리스트

작업 전:

- [ ] `docs/design/` 관련 문서 읽음  
- [ ] 기존 토큰·Container·FadeIn·타입 재사용  
- [ ] Home에 콘텐츠 소비 UI를 추가하지 않음  

작업 후 Self Review (각 100점, **90 미만이면 수정 후 제출**):

1. 브랜드 일관성  
2. 타이포그래피  
3. 여백  
4. 색감  
5. 인터랙션  
6. 가독성  
7. 첫인상  
8. 프리미엄 느낌  
9. 디자인 완성도  

## Evolve vs Redesign

| Evolve (허용) | Redesign (금지에 가깝음) |
|---------------|-------------------------|
| 같은 토큰으로 새 섹션 추가 | 새 색·새 폰트·새 카드 문법 |
| Index 행에 필드 하나 추가 | Home을 다시 카드 랜딩으로 |
| 카피 다듬기 | 슬로건 변경 |
| 빈 상태 문구 | 일러스트·파티클 배경 |
