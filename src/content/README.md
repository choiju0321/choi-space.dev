# 프로필·콘텐츠 수정 가이드

공개 홈페이지의 문구와 사진은 **코드의 UI가 아니라 content 파일**에서 바꿉니다.

페이지 흐름은 이렇게 나뉩니다.

1. **Hero** — Choi Space(이 홈페이지) 소개
2. **About** — 내가 누구인지 (사진 + 소개)
3. **Career** — 연혁 (기본정보 / 학력 / 교육 / 자격증 / 수상)
4. **Life** — 추억·기록 (독서 / 러닝 / 문화 / 맛집 / 카페 / 여행)
5. **Work** — 대표 경험
6. **Contact** — 연락처

## 한 곳에서 고치기

| 수정 항목 | 파일 |
|-----------|------|
| 사이트 소개(Hero), 이름·직함·사진(About), 이메일 | [`profile.ts`](./profile.ts) |
| 연혁 (기본정보·학력·교육·자격·수상) | [`career.ts`](./career.ts) |
| Career 허브 (패키지·지원·어학) | [`career/hub.ts`](./career/hub.ts) |
| Work 회사 셸 (Seasons·Etc) | [`work/companies.ts`](./work/companies.ts) |
| Work 프로젝트 (Write로 수정) | [`work/{company}/projects.json`](./work/) |
| 추억·기록 (독서·러닝·문화·맛집·카페·여행) | [`life.ts`](./life.ts) |
| Work 섹션 경험 / 프로젝트 | [`projects.ts`](./projects.ts) |
| About 본문 (긴 소개) | [`mdx/about.mdx`](./mdx/about.mdx) |

`profile.ts` 안에서:

- `siteHeadline` / `siteSummary` → Hero(홈페이지 소개)
- `name` / `role` / `tagline` / `image` → About(나)

## 서류 시스템 (양식 → 메뉴 연결)

원하시는 구조는 이렇습니다.

1. **서류 양식 등록** (지금은 파일, 나중엔 관리자 페이지)  
   [`document-forms.ts`](./document-forms.ts)  
   - 고등학교 양식 → 생활기록부  
   - 대학교 양식 → 성적증명서, 졸업증명서  
   - 자격증 양식 → 자격증  

2. **메뉴 항목에 양식 연결** ([`career.ts`](./career.ts))  
   - 학력 항목 → `documentFormId: "university"`  
   - 자격증 항목 → `documentFormId: "certification"`  

3. **첨부파일 팝업**  
   - 연결된 양식의 서류 목록을 보여 주고 업로드/다운로드

파일명: `{collection}-{recordId}-{documentId}.pdf`  
예: `education-hongik-transcript.pdf`, `certifications-sqld-certificate.pdf`

업로드는 기본적으로 로컬 개발에서만 허용하고, 관리자/로그인 이후 인증 뒤로 옮깁니다.

## 사진 교체

1. 원하는 사진을 `public/images/profile/portrait.jpg` 로 저장합니다. (같은 파일명으로 덮어쓰기)
2. 비율이 크게 다르면 `profile.ts` 의 `image.width` / `image.height` 를 맞춰 주세요.
3. 다른 파일명을 쓰려면 `image.src` 도 함께 변경합니다.

권장: 세로형 초상, 해상도 800px 이상, JPG/WebP.

## 소셜 링크

`profile.socialLinks` 배열에 추가합니다. 비어 있으면 Contact 섹션에 링크가 표시되지 않습니다.

```ts
socialLinks: [
  { label: "GitHub", href: "https://github.com/your-id" },
],
```

## 공개하지 않는 정보

상세 주소·전화번호는 기본 프로필에 넣지 않았습니다. 필요하면 `Profile` 타입의 `phone` 필드를 채운 뒤 Contact UI에 연결하면 됩니다.
