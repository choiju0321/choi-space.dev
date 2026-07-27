export type CareerSectionId = "basics" | "applications" | "masters";

export const CAREER_SECTIONS: {
  id: CareerSectionId;
  label: string;
  href: string;
  summary: string;
}[] = [
  {
    id: "basics",
    label: "Basics",
    href: "/career/basics",
    summary: "인적사항 · 어학 · 학력 · 자격",
  },
  {
    id: "applications",
    label: "Applications",
    href: "/career/applications",
    summary: "시즌별 지원 건 · 공고→서류→면접 프로세스",
  },
  {
    id: "masters",
    label: "Masters",
    href: "/career/masters",
    summary: "기본 이력서 · 포트폴리오",
  },
];

export function isCareerSectionId(value: string): value is CareerSectionId {
  return CAREER_SECTIONS.some((section) => section.id === value);
}
