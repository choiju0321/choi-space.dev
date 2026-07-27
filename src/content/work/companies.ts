import type { WorkCompany } from "@/types/work";

/**
 * Work 회사 셸 — projects / seasons / etc 는
 * src/content/work/{slug}/{projects|seasons|etc}.json
 */

export type WorkCompanyShell = Omit<
  WorkCompany,
  "projects" | "seasons" | "etc"
>;

export const workCompanyShells: WorkCompanyShell[] = [
  {
    id: "lgcns",
    slug: "lgcns",
    name: "LGCNS",
    kind: "employer",
    periodLabel: "2022.09 —",
    role: "KB국민카드 캄보디아 글로벌 시스템 운영 PL · KBC운영혁신팀 선임",
    summary:
      "글로벌 여신 시스템 개선·기술 검증·트랜잭션 성능을 중심으로 운영 PL 경험을 쌓습니다. 대표 프로젝트는 포트폴리오 v0.9 기준.",
    archiveFolder: "20220905_LGCNS",
    current: true,
    highlight: "지급 안정화 · 성능 최적화 · iFL 리스 · ABA 장애 대응",
  },
  {
    id: "woori-capital",
    slug: "woori-capital",
    name: "우리금융캐피탈",
    kind: "employer",
    periodLabel: "2018.05 — 2022.08",
    role: "IT개발팀 매니저 · 캐피탈 여신 계정계 개발·운영",
    summary:
      "자동차금융·신용·담보대출 계정계와 CB 연계를 중심으로 한 개발·운영. 대표 프로젝트는 포트폴리오 v0.9 기준.",
    archiveFolder: "20180305_우리금융캐피탈",
    highlight: "CB 실시간 집중 · 담보 자동화 · 트래픽 · 법정최고금리",
  },
  {
    id: "law-firm-site",
    slug: "law-firm-homepage",
    name: "로펌 홈페이지",
    kind: "side",
    periodLabel: "2026.03 —",
    role: "사이드 · 제작",
    summary: "사이드 프로젝트로 UI·구조화 경험을 쌓음. 설치파일은 올리지 않음.",
    archiveFolder: "20260313_로펌 홈페이지 만들기",
    highlight: "UI polish · 디자인 시스템",
  },
];
