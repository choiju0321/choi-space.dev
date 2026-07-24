# 02 · Design System

코드 기준: `src/app/globals.css`, `src/components/ui/*`

## Color Philosophy

**모노크롬 페이퍼.** Accent는 “포인트 컬러”가 아니라 **잉크(거의 검정)** 다.

| Token | 값 (현재) | 용도 |
|-------|-----------|------|
| `--background` | `#fafaf8` | 페이지 바탕 |
| `--foreground` | `#121212` | 본문·헤드라인·주요 CTA |
| `--surface` | `#f3f3f0` | 얕은 면 구분 (드물게) |
| `--surface-muted` | `#ebebe7` | 이미지 플레이스홀더 등 |
| `--muted` | `#5a5a5a` | 보조 문장 |
| `--muted-soft` | `#8c8c8c` | 캡션·eyebrow·메타 |
| `--border` | `#e4e4e0` | hairline 구분 |
| `--accent` | `#121212` | = foreground. 컬러 액센트 남용 금지 |
| `--glow` | `transparent` | 그라데이션/글로우 기본 없음 |

### 규칙

- 화려한 gradient 금지 (특히 hero 배경 글로우)
- 퍼플·테라코타·네온 금지
- 색으로 계층을 만들지 말고 **크기·여백·명도로** 계층을 만든다
- Selection은 잉크 14% mix (이미 구현)

### Dark Mode

당분간 **라이트만**.  
다크를 넣을 때는 동일 토큰을 반전하지 말고, “밤의 종이”로 별도 팔레트를 설계한 뒤 이 문서에 추가한다. 임시 `prefers-color-scheme` 반전 금지.

## Spacing

기준 리듬: **4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64…**

| 용도 | 대략 |
|------|------|
| 인라인 갭 | 8–12px (`gap-2`–`gap-3`) |
| 문단 간격 | 16–24px |
| 섹션 세로 | `py-28`–`py-40` (Home), 일반 페이지 `py-24`–`py-32` |
| 컨테이너 패딩 | `px-6 sm:px-8 lg:px-10` |

**빈 공간은 낭비이 아니라 디자인이다.** 비어 보인다고 채우지 않는다.

## Grid & Container

- 기본 컨테이너: `Container` → `max-w-5xl` + 수평 패딩
- 읽기 폭: `--measure: 38rem` (긴 본문은 이보다 넓게 늘리지 않음)
- Home index·아카이브 목록은 full container 폭 허용
- 12컬럼 강제 그리드는 쓰지 않음. **2열(About), 목록(Index)** 정도만

## Border Radius

- **거의 없음.** `rounded-sm` 이하.
- 큰 카드 radius·알약(pill) 남용 금지
- 모달: 기존 `Modal`의 라운드는 유지하되 새로 키우지 않음

## Shadows

- **기본 없음.** 그림자로 띄우지 않는다.
- 드롭다운·모달은 hairline border + 배경만. 무거운 shadow 추가 금지

## Icons

- 이모지 장식 금지 (메뉴·카드)
- 필요 시 가는 라인 아이콘만, 크기는 텍스트에 종속
- 아이콘 줄로 기능을 나열하지 않음

## Buttons (시스템 관점)

| 종류 | 표현 |
|------|------|
| Primary | 잉크 채움 → 밝은 글자 (드물게) |
| Secondary / Text | 밑줄·투명. 테두리 박스 버튼은 최후 수단 |
| Home CTA | 텍스트 링크 우선 |

자세한 컴포넌트: [05-components.md](./05-components.md)

## Cards

**카드처럼 보이면 안 된다.**

- 무거운 border / shadow / 큰 radius 금지
- 목록·경로는 **구분선 + 타이포** (Home Archive index 패턴)
- 상호작용이 필요할 때만 hover로 opacity·underline

## Sections

- 섹션 구분은 주로 **상단 hairline** (`border-t`)
- 배경면(`surface`)은 거의 쓰지 않음. 쓰면 아주 옅게
- 섹션마다 eyebrow(선택) + title + 짧은 본문

## Responsive

- 모바일 먼저: 한 열, 넉넉한 세로 리듬
- 내비: 항목이 많으면 관리자 메뉴는 `lg`에서만 (이미 적용)
- 터치 타깃은 줄이되, 링크 행(index)은 충분한 `py`

## 컴포넌트 원칙

1. UI보다 **콘텐츠**가 먼저 보인다  
2. 새 컴포넌트 추가 전에 기존 `ui/` · `layout/` 재사용  
3. “있어 보이는” 효과보다 **일관된 조용함**  
4. props로 스타일 분기 폭증 금지 → 토큰·유틸 클래스
