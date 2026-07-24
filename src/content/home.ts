/**
 * Home — 브랜드 경험용 카피
 * Hero = 브랜드, Manifesto = 철학, About = 사람, Index = 세 갈래 길
 */
export const homeContent = {
  hero: {
    brand: "Choi Space",
    line: "오늘의 기록이 내일의 나를 만듭니다.",
    continueLabel: "계속 읽기",
    continueHref: "#manifesto",
  },
  manifesto: {
    lines: ["소개는 한 페이지지만,", "기록은 한 사람을 보여줍니다."],
  },
  aboutCard: {
    eyebrow: "About",
    roleLine: "Financial systems engineer",
    lead: "기술을 배우는 것만큼, 기록하는 과정을 믿습니다.",
    cta: "Profile",
  },
  aboutModal: {
    eyebrow: "Profile",
    title: "최지웅",
    description: "Ji-ung Choi",
    profile: [
      "금융 시스템 엔지니어 · LGCNS 선임",
      "문제를 기능이 아니라 구조로 바라봅니다.",
    ],
    timeline: [
      {
        period: "2019 —",
        label: "LGCNS",
        detail: "금융 여신 시스템 개발·운영",
      },
      {
        period: "Now",
        label: "Choi Space",
        detail: "독서 · 러닝 · 문화 · 성장 · 노트를 쌓는 중",
      },
    ],
    values: [
      "결과보다 과정, 완성보다 성장",
      "장애는 복구에서 끝내지 않고 원인과 구조를 묻는다",
      "소개보다 기록이 한 사람을 더 잘 설명한다",
    ],
    hobbies: ["Reading", "Running", "Culture", "Travel"],
    skills: [
      "Financial Systems",
      "Backend / Data",
      "Performance & Reliability",
      "AI tooling",
    ],
    contactNote: "궁금한 점이나 인사는 이메일로 편하게 남겨 주세요.",
  },
  index: {
    eyebrow: "Archive",
    title: "어디로 가볼까요",
    items: [
      {
        id: "life",
        number: "01",
        label: "Life",
        title: "삶을 기록합니다",
        href: "/life",
        body: "책, 러닝, 여행, 문화, 일상",
      },
      {
        id: "growth",
        number: "02",
        label: "Growth",
        title: "성장을 기록합니다",
        href: "/growth",
        body: "개발, AI, 금융, 영어, 공부",
      },
      {
        id: "notes",
        number: "03",
        label: "Notes",
        title: "정보를 정리합니다",
        href: "/notes",
        body: "생활, 생산성, 부동산, 금융, 노하우",
      },
    ],
  },
  footer: {
    tagline:
      "기록은 과거를 남기는 일이 아니라, 미래의 나를 만드는 과정이라고 믿습니다.",
  },
} as const;
