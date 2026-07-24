# 03 · Typography

타이포그래피가 디자인이다. 레이아웃보다 먼저 정한다.

## 폰트 (코드)

| 역할 | 패밀리 | 변수 |
|------|--------|------|
| Display | **Noto Serif KR** | `--font-display` |
| Body | **Noto Sans KR** | `--font-body` |

정의: `src/app/layout.tsx`  
Inter / Roboto / Arial / 기본 시스템만 쓰는 “템플릿 산세리프 랜딩” 금지.

### Weight

- Body: **400** 기본, 강조만 **500**
- Display: **600** 위주, 필요 시 700
- **Bold 남용 금지.** 계층은 크기·여백으로.

## 계층

| 레벨 | 용도 | 감각 |
|------|------|------|
| **Brand / H1** | Home 브랜드명 | `clamp`로 과감하게 큼, tracking 살짝 타이트 |
| **Manifesto** | 철학 문장 | 디스플레이, 중앙 또는 숨 쉬는 폭 |
| **Section H2** | 섹션 제목 | 디스플레이 3xl–4xl |
| **Index title** | Life/Growth/Notes 행 제목 | 디스플레이 2xl–3xl |
| **Body** | 설명 | sans 1rem–1.05rem, leading 7–9 |
| **Meta / Eyebrow** | ABOUT, 01, 캡션 | 0.7rem, tracking wide, muted-soft, uppercase |

## 읽기

- Line-height: 본문 **1.7–1.9** 감각 (`leading-7`–`leading-9`)
- Measure: 긴 문단은 **약 38rem (`--measure`)** 안쪽
- 한 화면에 문단을 많이 넣지 않는다. Home은 특히 짧게.

## 규칙

1. Headline은 **과감하게**, Body는 **편안하게**  
2. 장식으로 폰트를 바꾸지 않는다 (세 번째 폰트 추가 금지, 예외는 문서 개정 후)  
3. 그라디언트 텍스트 / 외곽선 글자 금지  
4. 한국어·영문 혼용 시 내비 라벨은 영어(제품 IA), 본문 설명은 한국어 담백체
