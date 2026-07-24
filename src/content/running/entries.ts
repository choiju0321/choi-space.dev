import type { RunningEntry } from "@/types/running";

const ROOT = "04_Personal/07. Activity/러닝";

function certificate(
  id: string,
  fileName: string,
): RunningEntry["artifacts"][number] {
  return {
    id,
    kind: "certificate",
    fileName,
    sourcePath: `${ROOT}/${fileName}`,
  };
}

/**
 * 러닝 기록 (대회 우선)
 * kind: race = 대회, session = 일상/런데이 (추후)
 */
export const runningEntries: RunningEntry[] = [
  {
    id: "legoland-run-2026",
    slug: "2026-05-16-legoland-run",
    kind: "race",
    title: "레고랜드 런",
    eventName: "2026 레고랜드 런",
    ranOn: "2026-05-16",
    distanceKm: 5,
    place: "강원 춘천 레고랜드(중도)",
    excerpt: "춘천 중도 호수길을 달린 5km 펀런.",
    tags: ["대회", "5km", "강원"],
    artifacts: [],
  },
  {
    id: "power-of-positive-marathon-2025",
    slug: "2025-06-15-power-of-positive",
    kind: "race",
    title: "긍정의 힘 마라톤",
    eventName: "제2회 긍정의힘 마라톤",
    ranOn: "2025-06-15",
    distanceKm: 10,
    place: "서울 여의도공원",
    excerpt: "여의도에서 달린 10km. 기록지는 나중에 첨부할 예정.",
    tags: ["대회", "10km", "서울"],
    artifacts: [
      certificate("c1", "20250615_기록지_긍정의힘마라톤_10km.pdf"),
    ],
  },
];
