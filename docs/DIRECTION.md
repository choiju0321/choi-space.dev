# Choi Space — 방향성 · 로드맵 · 할 일

마지막 정리 기준: 공개 소개 홈 + 블로그형 콘텐츠, 관리자만 운영 축.  
IA는 나중에 바꿔도 된다.

---

## 1. 이 사이트가 뭔가

**Choi Space = 최지웅의 기록 운영 공간**

| 방문 유형 | 경험 |
|-----------|------|
| **일반** | “나를 소개하는 홈” + 블로그형 글·Life 아카이브 |
| **이직/채용** | (예정) 공고별로 고른 **커리어 공개 패키지**만 |
| **관리자(나)** | 전부 + 등록·작성·첨부 |

첫 화면(Home): **공간이 뭔지** 소개 → **About**(나) / **Life**(기록)로 연결.

---

## 2. 방향성 (원칙)

1. **공개는 블로그·소개**, 민감 원장(금융·서류·업무·검진)은 관리자.
2. **일(Work) ≠ 커리어(Career)**  
   - Work = 회사 업무·평가 원장  
   - Career = 이직용으로 골라 내보내는 레이어
3. **Notes(글) ≠ Finance(내 자산)**  
   - Notes = 청약·정보 **포스팅**  
   - Finance = 잔고·투자·부동산 **관리**
4. 원본 파일은 `D:\개인` / `private/`가 진실, git에는 메타·공개분만.
5. UI → features → `lib/content` 패턴 유지.

---

## 3. 공개 메뉴 (현재 고정안)

**Home · About · Life · Growth · Notes · Contact** · Login

| 메뉴 | 역할 | 상태 |
|------|------|------|
| **Home** | 공간 소개 (Hero) | 있음 |
| **About** | 자기소개 | 있음 (`/#about`) |
| **Life** | 경험 아카이브 + 후기 | 아카이브 있음, 후기 글 모델 보강 예정 |
| **Growth** | 자기계발·학습·회고 글 | 허브만 |
| **Notes** | 정보·칼럼·청약·팁 글 | 허브만 |
| **Contact** | 연락 | 있음 (`/#contact`) |

Life 하위: Overview · Reading · Running · Culture · Food · Cafe · Travel

관리자 추가 메뉴: **Work · Career · Documents · Finance · Records · Write**

---

## 4. 큰 축 한눈에

```text
[공개]
  Home / About / Contact
  Life (경험·후기)
  Growth (성장 글)
  Notes (정보 글)

[관리자]
  Work ──가공──▶ Career (이직 공개 패키지)
  Documents (서류 금고)
  Finance (자산·투자·부동산)
  Records (검진·결정사·보험·헌혈…)
  Write (작성 스튜디오)
```

---

## 5. 로드맵 (Phase)

| Phase | 이름 | 목표 |
|-------|------|------|
| **0** | 기반 | 홈·메뉴 IA·Life 아카이브·세션·Health 시드 — **상당 부분 완료** |
| **1** | 공개 블로그 + Documents | Growth/Notes/Life **글**, 서류 금고 |
| **2** | Work | 회사별 업무·평가 로그 (엑셀 대체) |
| **3** | Career 패키지 | 공고별 공개 세트, 이직 방문자 뷰 |
| **4** | Finance | 자산·소비·경조사·투자·부동산·대출·청약(계약) |
| **5** | Records 고도화 | Health AI 해석, 결정사, 보험, 헌혈 주기 |

---

## 6. 할 일 순서 (우선순위)

위에서부터 하는 것을 권장한다. 체크는 진행하며 갱신.

### 지금 다음 (Phase 1 앞단)

1. [ ] **포스트(글) 공통 모델**  
   - Growth / Notes / (Life 후기)에 쓸 `title, slug, date, body, tags, category`
2. [ ] **Growth 글 목록·상세** (`/growth`, `/growth/[slug]`)
3. [ ] **Notes 글 목록·상세** (`/notes`, `/notes/[slug]`)
4. [ ] **Home에 최근 글** 미리보기 (Hero → About → 최근 글 → Life)
5. [ ] **Write에 Growth / Notes 작성** 카테고리 추가
6. [ ] **Documents 서류 금고**  
   - 등본·초본·재직증명 등 업로드·목록·다운로드 (관리자)

### 그다음 (Phase 2–3)

7. [ ] **Work** — 회사·평가 시즌·업무 항목 CRUD  
8. [ ] **Career 공개 패키지** — 공고별 노출 on/off, 선택적 업무 상세  
9. [ ] 이직용 **공유 링크/권한** (관리자와 분리)

### 이후 (Phase 4–5)

10. [ ] **Finance** — 자산 요약 → 소비/경조사 → 투자 → 부동산  
11. [ ] **Records** — 결정사·보험·헌혈  
12. [ ] **Health AI 해석** (버튼 활성화, 스캔 PDF 처리)

### 언제든 (품질)

- [ ] About / Contact를 필요 시 독립 페이지 (`/about`, `/contact`)
- [ ] 모바일 메뉴(햄버거) — 항목이 많아지면
- [ ] 배포(Vercel 등) + `LIFE_WRITE_SECRET` 운영 설정

---

## 7. 이미 된 것 (Phase 0 요약)

- 공개 홈 Hero · About · Life · Contact
- Life: Reading / Running / Culture / Food / Cafe / Travel
- Write 세션(`LIFE_WRITE_SECRET`), 게스트/관리자 **메뉴 분기**
- Career 프로필·일부 서류, 병역, Health 메타·findings 시드
- 관리자 허브 placeholder: Work / Career / Documents / Finance / Records
- Growth / Notes 허브 페이지(목록은 미연결)
- 문서: `README.md`, 이 파일

---

## 8. 하지 않는 것 (당분간)

- 공개 홈에 Health · Finance · 서류 원장 노출
- PDF 비밀번호를 코드/환경변수에 저장
- 의료·금융을 “단정 진단/자문” UI로 보이게 하기

---

관련: [`README.md`](README.md) (실행·구조 요약)
