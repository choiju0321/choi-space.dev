# 06 · Motion

## 목적

모션은 **보여주기**가 아니라 **읽기**를 돕는다.  
존재감이 없어야 한다.

## 허용

| 종류 | 용도 |
|------|------|
| Opacity fade | 섹션 등장 (`FadeIn`) |
| 짧은 delay | 목록 순차 (60–80ms 간격, 과하면 안 됨) |
| 1px급 translate | 링크 화살표 hover |

구현: `src/components/ui/fade-in.tsx` — **opacity만**, duration ~500ms

## 금지

- Bounce / spring 과함
- Rotate
- 큰 Scale
- Flash / blink
- 패럴랙스·스크롤 잭
- 자동 재생 영상 배경
- “와우” 마이크로인터랙션 남발

## Reduced motion

`prefers-reduced-motion: reduce` 시 즉시 표시 (이미 FadeIn 처리).  
새 모션 추가 시 동일하게 존중.

## 규칙

1. 한 페이지에 모션 패턴은 **1–2개**면 충분  
2. 모션 때문에 CTA가 늦게 보이면 실패  
3. 새 라이브러리(Framer Motion 등) 도입 시 이 문서를 개정한 뒤
