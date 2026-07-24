import type { ReadingClubSeason } from "@/types/reading";

const ROOT = "04_Personal/07. Activity/트레바리";

/**
 * 트레바리 클럽 시즌
 * 폴더 규칙: [YYYYMM-YYYYMM] 클럽명
 */
export const readingClubs: ReadingClubSeason[] = [
  {
    id: "moon-thin-deep-2022",
    name: "문-얇고깊은책",
    program: "트레바리",
    periodStart: "2022-03",
    periodEnd: "2022-06",
    folderName: "[202203-202206] 문-얇고깊은책",
    sourcePath: `${ROOT}/[202203-202206] 문-얇고깊은책`,
  },
  {
    id: "borderless-routine-2024",
    name: "무경계-루틴",
    program: "트레바리",
    periodStart: "2024-01",
    periodEnd: "2024-04",
    folderName: "[202401-202404] 무경계-루틴",
    sourcePath: `${ROOT}/[202401-202404] 무경계-루틴`,
  },
  {
    id: "moon-gaze-2024",
    name: "문-시선",
    program: "트레바리",
    periodStart: "2024-10",
    periodEnd: "2025-01",
    folderName: "[202410-202501] 문-시선",
    sourcePath: `${ROOT}/[202410-202501] 문-시선`,
  },
  {
    id: "moon-together-2025a",
    name: "문-함께봄",
    program: "트레바리",
    periodStart: "2025-03",
    periodEnd: "2025-06",
    folderName: "[202503-202506] 문-함께봄",
    sourcePath: `${ROOT}/[202503-202506] 문-함께봄`,
  },
  {
    id: "moon-together-2025b",
    name: "문-함께봄",
    program: "트레바리",
    periodStart: "2025-08",
    periodEnd: "2025-11",
    folderName: "[202508-202511] 문-함께봄",
    sourcePath: `${ROOT}/[202508-202511] 문-함께봄`,
  },
  {
    id: "moon-joeunpul-2026",
    name: "문-조은풀",
    program: "트레바리",
    periodStart: "2026-03",
    periodEnd: "2026-06",
    folderName: "[202603-202606] 문-조은풀",
    sourcePath: `${ROOT}/[202603-202606] 문-조은풀`,
  },
];
