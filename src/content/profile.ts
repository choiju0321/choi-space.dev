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

  siteHeadline: "오늘의 기록이 내일의 나를 만듭니다.",
  siteSummary:
    "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다.",

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
