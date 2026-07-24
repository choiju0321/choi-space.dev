# 04 · Layout

## Whitespace First

여백을 아끼지 않는다.  
화면이 비어 보인다고 **무언가를 채우지 않는다.**

## 구조

```text
Header (얇음, hairline)
Main (섹션들이 border-t로 이어짐)
Footer (짧음)
```

## Section

- 세로 패딩: Home `py-28`–`py-40`, 기타 `py-24`–`py-32`
- `scroll-mt-24`로 스티키 헤더 아래 앵커 여유
- 구분: `border-t border-[var(--color-border)]`
- 한 섹션 = **한 목적 + 한 헤드라인** (+ 짧은 보조 문장)

## Home 레이아웃 (현재 규범)

```text
Hero        → 브랜드 (풀 뷰포트에 가깝게, 하단 정렬)
Manifesto   → 철학 문장만
About       → 사람 (사진 + 짧은 리드)
Archive     → 01/02/03 목차형 경로
Footer
```

이 순서를 깨고 최신 글 그리드·통계·로고 클라우드를 Home에 넣지 않는다.

## Container

`Container`: `max-w-5xl` + 수평 패딩.  
전체 폭 히어로 배경 장식은 쓰지 않는다 (단색·무장식).

## 그리드

- About: 이미지 | 텍스트 (데스크톱 2열), 모바일 1열
- Archive index: 단일 열 리스트 (번호 | 내용 | →)
- 카드 그리드(3열 박스)를 **기본 패턴으로 쓰지 않음**

## 반응형

- 모바일에서 내비 항목을 숨길 수 있음 (Contact/Admin)
- 터치 행(index)은 `py-9` 이상 유지
