/**
 * /about 페이지 카피.
 * Home Profile sheet와 같은 사람·톤을 쓰되, 페이지에서만 Story · FAQ를 확장한다.
 */
export const aboutPage = {
  eyebrow: "About",
  title: "최지웅",
  titleEn: "Ji-ung Choi",
  lead: "기술을 배우는 것만큼, 기록하는 과정을 믿습니다.",
  story: {
    label: "Story",
    paragraphs: [
      "소개 한 줄보다 쌓인 기록이 한 사람을 더 잘 설명한다고 믿어, Choi Space에 독서·러닝·문화·성장·노트를 남기고 있습니다.",
      "결과보다 과정, 완성보다 성장을 택합니다. 장애는 복구에서 끝내지 않고 원인과 다음 구조를 묻습니다.",
    ],
  },
  timeline: {
    label: "Timeline",
    items: [
      {
        period: "2018.05 — 2022.09",
        label: "우리금융캐피탈",
        detail: "캐피탈 여신 시스템 개발",
      },
      {
        period: "2022.09 —",
        label: "LGCNS",
        detail: "KB국민카드 캄보디아 글로벌 시스템 운영 PL · 재직 중",
      },
    ],
  },
  values: {
    label: "Values",
    items: [
      "결과보다 과정, 완성보다 성장",
      "장애는 복구에서 끝내지 않고 원인과 구조를 묻는다",
      "소개보다 기록이 한 사람을 더 잘 설명한다",
    ],
  },
  hobbies: {
    label: "Hobbies",
    items: ["Reading", "Running", "Culture", "Travel"],
  },
  skills: {
    label: "Skills",
    items: [
      "Financial Systems",
      "Backend / Data",
      "Performance & Reliability",
      "AI tooling",
    ],
  },
  faq: {
    label: "FAQ",
    items: [
      {
        q: "Choi Space는 무엇인가요?",
        a: "최지웅의 개인 아카이브입니다. 삶을 남기는 Life, 배움을 남기는 Growth, 정보를 정리하는 Notes로 나뉩니다.",
      },
      {
        q: "왜 공개하나요?",
        a: "완벽한 포트폴리오보다, 과정이 보이는 기록이 더 정직하다고 생각합니다. 필요한 사람만 천천히 읽으면 됩니다.",
      },
      {
        q: "연락은 어떻게 하나요?",
        a: "이메일로 편하게 남겨 주세요. Contact 페이지에 메일과 소셜 링크가 있습니다.",
      },
    ],
  },
} as const;

export const contactPage = {
  eyebrow: "Contact",
  title: "연락하기",
  lead: "궁금한 점이나 인사는 부담 없이 남겨 주세요.",
  note: "업무·협업·가벼운 인사 모두 환영합니다. 보통 며칠 안에 답합니다.",
} as const;
