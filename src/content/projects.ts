import type { Project } from "@/types/content";

/**
 * 랜딩에 노출할 대표 경험 / 프로젝트.
 * `featured: true` 인 항목만 Work 섹션에 표시됩니다.
 */
export const projects: Project[] = [
  {
    id: "kb-cambodia-global",
    title: "KB국민카드 캄보디아 글로벌 여신 시스템",
    description:
      "LGCNS에서 글로벌 여신 시스템의 운영 PL로, 지급·심사·배치 구간의 설계·성능 개선·장애 대응 체계를 고도화했습니다. 지급 오류율 감소, 처리시간 단축, 대외 연계 장애 시 정합성 유지에 집중했습니다.",
    year: "2022 —",
    tags: ["LGCNS", "여신", "운영 PL", "성능", "대외연계"],
    featured: true,
  },
  {
    id: "woori-capital",
    title: "우리금융캐피탈 여신 계정계 시스템",
    description:
      "자동차금융·신용·담보대출 전 과정의 개발·운영을 담당했습니다. 신용정보 실시간 집중 전환, 차량 담보 자동화, 법정최고금리 인하 대응 등 규제와 안정성이 맞닿은 개선을 이끌었습니다.",
    year: "2018 — 2022",
    tags: ["우리금융캐피탈", "계정계", "CB 연계", "자동화"],
    featured: true,
  },
  {
    id: "choi-space",
    title: "Choi Space",
    description:
      "나를 소개하는 공개 홈페이지에서 시작해, 장기적으로는 커리어·블로그·개인 도구를 담는 디지털 공간으로 확장하는 개인 플랫폼입니다.",
    year: "2026 —",
    tags: ["Next.js", "TypeScript", "Personal Platform"],
    featured: true,
  },
];
