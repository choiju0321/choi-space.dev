import type { Profile } from "@/types/content";

/**
 * 공개 콘텐츠 — Hero(사이트 소개) / About(나) / Contact를 여기서 수정하세요.
 *
 * 사진 교체:
 * 1. `public/images/profile/portrait.jpg` 파일을 새 사진으로 덮어쓰기
 * 2. 필요하면 아래 `image.width` / `image.height` 를 실제 비율에 맞게 조정
 */
export const profile: Profile = {
  brandName: "Choi Space",

  // Hero — 이 홈페이지(공간)를 소개
  siteHeadline: "나를 담아 두는 디지털 공간",
  siteSummary:
    "Choi Space는 이력서 대신, 내가 어떤 사람인지와 어떤 일을 해왔는지를 차분히 보여주는 개인 홈페이지입니다. 지금은 소개에서 시작하지만, 앞으로는 나만의 플랫폼으로 계속 확장해 나갈 예정입니다.",

  // About — 나에 대한 소개
  name: "최지웅",
  nameEn: "Ji-ung Choi",
  role: "금융 시스템 엔지니어 · LGCNS 선임",
  tagline: "문제를 기능이 아니라 구조로 바라봅니다.",

  email: "choiry0321@gmail.com",
  location: "서울",
  image: {
    src: "/images/profile/portrait.jpg",
    alt: "최지웅 프로필 사진",
    width: 400,
    height: 573,
  },
  socialLinks: [
    // TODO: 실제 프로필 URL로 교체하세요. 없으면 비워 두어도 됩니다.
    // { label: "GitHub", href: "https://github.com/your-id" },
    // { label: "LinkedIn", href: "https://linkedin.com/in/your-id" },
  ],
};
