import type { ReadingEntry } from "@/types/reading";

const ROOT = "04_Personal/07. Activity/트레바리";

function review(
  id: string,
  fileName: string,
  folder?: string,
): ReadingEntry["artifacts"][number] {
  const sourcePath = folder ? `${ROOT}/${folder}/${fileName}` : `${ROOT}/${fileName}`;
  return { id, kind: "review", fileName, sourcePath };
}

function presentation(
  id: string,
  fileName: string,
  folder?: string,
): ReadingEntry["artifacts"][number] {
  const sourcePath = folder ? `${ROOT}/${folder}/${fileName}` : `${ROOT}/${fileName}`;
  return { id, kind: "presentation", fileName, sourcePath };
}

const C2022 = "[202203-202206] 문-얇고깊은책";
const C2024R = "[202401-202404] 무경계-루틴";
const C2024G = "[202410-202501] 문-시선";
const C2025A = "[202503-202506] 문-함께봄";
const C2025B = "[202508-202511] 문-함께봄";
const C2026 = "[202603-202606] 문-조은풀";

/**
 * 독서 기록 (독후감/발제문 매칭 완료)
 * clubSeasonId 없음 = 개인 독서
 */
export const readingEntries: ReadingEntry[] = [
  // —— 문-얇고깊은책 (2022) ——
  {
    id: "sepúlveda-old-man-love-novel",
    slug: "2022-03-17-old-man-who-read-love-stories",
    title: "연애소설 읽는 노인",
    author: "루이스 세풀베다",
    readOn: "2022-03-17",
    clubSeasonId: "moon-thin-deep-2022",
    excerpt: "트레바리 문-얇고깊은책 시즌의 첫 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20220317_독후감_연애소설 읽는 노인_루이스 세풀베다.txt", C2022),
      presentation("p1", "202203_발제문_연애소설 읽는 노인.pdf", C2022),
    ],
  },
  {
    id: "kim-jinyoung-morning-piano",
    slug: "2022-04-14-morning-piano",
    title: "아침의 피아노",
    author: "김진영",
    readOn: "2022-04-14",
    clubSeasonId: "moon-thin-deep-2022",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20220414_독후감_아침의 피아노_김진영.txt", C2022),
      presentation("p1", "202204_발제문_아침의 피아노.pdf", C2022),
    ],
  },
  {
    id: "shakespeare-hamlet",
    slug: "2022-05-20-hamlet",
    title: "햄릿",
    author: "셰익스피어",
    readOn: "2022-05-20",
    clubSeasonId: "moon-thin-deep-2022",
    excerpt: "고전을 클럽에서 함께 읽은 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20220520_독후감_햄릿-셰익스피어.txt", C2022),
      presentation("p1", "202205_발제문_햄릿.pdf", C2022),
    ],
  },
  {
    id: "kwon-yeoseon-goodbye-drunkard",
    slug: "2022-06-06-goodbye-drunkard",
    title: "안녕 주정뱅이",
    author: "권여선",
    readOn: "2022-06-06",
    clubSeasonId: "moon-thin-deep-2022",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20220606_독후감_안녕 주정뱅이_권여선.txt", C2022),
    ],
  },
  {
    id: "bieri-liberal-education",
    slug: "2022-06-17-bieri-liberal-education",
    title: "페터 비에리의 교양 수업",
    author: "페터 비에리",
    readOn: "2022-06-17",
    clubSeasonId: "moon-thin-deep-2022",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20220617_독후감_페터 비에리의 교양 수업_페터 비에리.txt", C2022),
      presentation("p1", "202206_발제문_페터 비에리의 교양 수업.pdf", C2022),
    ],
  },

  // —— 무경계-루틴 (2024) ——
  {
    id: "frankl-mans-search",
    slug: "2024-01-28-mans-search-for-meaning",
    title: "죽음의 수용소에서",
    author: "빅터 프랭클",
    readOn: "2024-01-28",
    clubSeasonId: "borderless-routine-2024",
    excerpt: "루틴 클럽에서 읽은 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20240128_독후감_죽음의 수용소에서_빅터 프랭클.txt", C2024R),
      presentation("p1", "202402_발제문_죽음의 수용소에서.pdf", C2024R),
    ],
  },
  {
    id: "lembke-dopamine-nation",
    slug: "2024-02-17-dopamine-nation",
    title: "도파민네이션",
    author: "에나 렘키",
    readOn: "2024-02-17",
    clubSeasonId: "borderless-routine-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20240217_독후감_도파민네이션_에나 렘키.txt", C2024R),
      presentation("p1", "202403_발제문_도파미네이션.pdf", C2024R),
    ],
  },
  {
    id: "pink-power-of-regret",
    slug: "2024-03-31-power-of-regret",
    title: "후회의 재발견",
    author: "다니엘 핑크",
    readOn: "2024-03-31",
    clubSeasonId: "borderless-routine-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20240331_독후감_후회의 재발견_다니엘 핑크.txt", C2024R),
      presentation("p1", "202404_발제문_후회의 재발견.pdf", C2024R),
    ],
  },
  {
    id: "vazquez-stoic-life",
    slug: "2024-04-30-stoic-invitation",
    title: "스토아적 삶의 권유",
    author: "마르코스 바르케스",
    readOn: "2024-04-30",
    clubSeasonId: "borderless-routine-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20240430_독후감_스토아적 삶의 권유_마르코스 바르케스.txt", C2024R),
      presentation("p1", "202405_발제문_스토아적 삶의 권유.pdf", C2024R),
    ],
  },

  // —— 문-시선 (2024–2025) ——
  {
    id: "kim-aeran-one-of-two-lies",
    slug: "2024-10-04-one-of-two-is-a-lie",
    title: "이중 하나는 거짓말",
    author: "김애란",
    readOn: "2024-10-04",
    clubSeasonId: "moon-gaze-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20241004_독후감_이중 하나는 거짓말_김애란.txt", C2024G),
      presentation("p1", "202410_발제문_이중 하나는 거짓말.pdf", C2024G),
    ],
  },
  {
    id: "chance-does-not-pass",
    slug: "2024-10-31-chance-does-not-pass-by",
    title: "우연은 비켜가지 않는다",
    author: "미상",
    readOn: "2024-10-31",
    clubSeasonId: "moon-gaze-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록. (저자명 파일에 없음 — 보완 예정)",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20241031_독후감_우연은 비켜가지 않는다_.txt", C2024G),
      presentation("p1", "202411_발제문_우연은 비켜가지 않는다.pdf", C2024G),
    ],
  },
  {
    id: "greenhouse-repair-report",
    slug: "2024-12-08-greenhouse-repair-report",
    title: "대온실 수리 보고서",
    author: "미상",
    readOn: "2024-12-08",
    clubSeasonId: "moon-gaze-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록. (저자명 파일에 없음 — 보완 예정)",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20241208_독후감_대온실 수리 보고서_.txt", C2024G),
      presentation("p1", "202412_발제문_대온실 수리 보고서.pdf", C2024G),
    ],
  },
  {
    id: "unconscious-designs-me",
    slug: "2024-12-15-how-unconscious-designs-me",
    title: "무의식은 어떻게 나를 설계하는가",
    author: "미상",
    readOn: "2024-12-15",
    clubSeasonId: "moon-gaze-2024",
    excerpt: "독후감으로 남긴 기록. (저자명 파일에 없음 — 보완 예정)",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20241215_독후감_무의식은 어떻게 나를 설계하는가_.txt", C2024G),
    ],
  },
  {
    id: "flaubert-madame-bovary",
    slug: "2025-01-07-madame-bovary",
    title: "마담 보바리",
    author: "귀스타브 플로베르",
    readOn: "2025-01-07",
    clubSeasonId: "moon-gaze-2024",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20250107_독후감_마담 보바리_.txt", C2024G),
      presentation("p1", "202501_발제문_마담 보바리.pdf", C2024G),
    ],
  },

  // —— 문-함께봄 (2025 상반기) ——
  {
    id: "porter-the-disappeared",
    slug: "2025-03-13-things-that-disappeared",
    title: "사라진 것들",
    author: "앤드루 포터",
    readOn: "2025-03-13",
    clubSeasonId: "moon-together-2025a",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20250313_독후감_사라진 것들_앤드루 포터.txt", C2025A),
      presentation("p1", "202503_발제문_사라진 것들.pdf", C2025A),
    ],
  },
  {
    id: "kim-choyeop-if-we-cannot-go-at-light-speed",
    slug: "2025-04-23-if-we-cannot-go-at-light-speed",
    title: "우리가 빛의 속도로 갈 수 없다면",
    author: "김초엽",
    readOn: "2025-04-23",
    clubSeasonId: "moon-together-2025a",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20250423_독후감_우리가 빛의 속도로 갈 수 없다면_김초엽.txt", C2025A),
    ],
  },
  {
    id: "read-like-flowing-river",
    slug: "2025-05-16-like-a-flowing-river",
    title: "흐르는 강물처럼",
    author: "셸리 리드",
    readOn: "2025-05-16",
    clubSeasonId: "moon-together-2025a",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20250516_독후감_흐르는 강물처럼_셸리 리드.txt", C2025A),
    ],
  },
  {
    id: "howard-valley-of-time",
    slug: "2025-06-21-valley-of-time",
    title: "시간의 계곡",
    author: "스콧 알렉산더 하워드",
    readOn: "2025-06-21",
    clubSeasonId: "moon-together-2025a",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20250621_독후감_시간의 계곡_스콧 알렉산더 하워드.txt", C2025A),
    ],
  },

  // —— 문-함께봄 (2025 하반기) ——
  {
    id: "chi-zijian-right-of-arluguna",
    slug: "2025-08-20-right-side-of-arluguna-river",
    title: "어얼구나강의 오른쪽",
    author: "츠쯔젠",
    readOn: "2025-08-20",
    clubSeasonId: "moon-together-2025b",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20250820_독후감_어얼구나강의 오른쪽_츠쯔젠.txt", C2025B),
    ],
  },
  {
    id: "sherriff-september-full-moon",
    slug: "2025-09-24-full-moon-of-september",
    title: "구월의 보름",
    author: "R. C. 셰리프",
    readOn: "2025-09-24",
    clubSeasonId: "moon-together-2025b",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20250924_독후감_구월의 보름_R. C. 셰리프.txt", C2025B),
    ],
  },
  {
    id: "fosse-morning-and-evening",
    slug: "2025-10-15-morning-and-evening",
    title: "아침 그리고 저녁",
    author: "욘 포세",
    readOn: "2025-10-15",
    clubSeasonId: "moon-together-2025b",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20251015_독후감_아침 그리고 저녁_욘 포세.txt", C2025B),
    ],
  },
  {
    id: "baek-sehee-want-to-die-but-tteokbokki",
    slug: "2025-10-21-want-to-die-but-want-tteokbokki",
    title: "죽고 싶지만 떡볶이는 먹고 싶어",
    author: "백세희",
    readOn: "2025-10-21",
    clubSeasonId: "moon-together-2025b",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20251021_독후감_죽고 싶지만 떡볶이는 먹고 싶어_백세희.txt", C2025B),
    ],
  },
  {
    id: "moon-misoon-how-we-passed-winter",
    slug: "2025-11-20-how-we-passed-through-winter",
    title: "우리가 겨울을 지나온 방식",
    author: "문미순",
    readOn: "2025-11-20",
    clubSeasonId: "moon-together-2025b",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [
      review("r1", "20251120_독후감_우리가 겨울을 지나온 방식_문미순.txt", C2025B),
    ],
  },

  // —— 문-조은풀 (2026) ——
  {
    id: "sagan-like-brahms",
    slug: "2026-03-10-do-you-like-brahms",
    title: "브람스를 좋아하세요",
    author: "프랑수아즈 사강",
    readOn: "2026-03-10",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260310_독후감_브람스를 좋아하세요_프랑수아즈 사강.txt"),
      presentation("p1", "202603_발제문_브람스를 좋아하세요....pdf", C2026),
    ],
  },
  {
    id: "oh-eun-dadokim",
    slug: "2026-04-07-dadokim",
    title: "다독임",
    author: "오은",
    readOn: "2026-04-07",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "독후감으로 남긴 기록.",
    tags: ["트레바리", "독후감"],
    artifacts: [review("r1", "20260407_독후감_다독임_오은.txt")],
  },
  {
    id: "ishiguro-klara-and-sun",
    slug: "2026-04-08-klara-and-the-sun",
    title: "클라라와 태양",
    author: "가즈오 이시구로",
    readOn: "2026-04-08",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260408_독후감_클라라와 태양_가즈오 이시구로.txt"),
      presentation("p1", "202604_발제문_클라라와 태양.pdf", C2026),
    ],
  },
  {
    id: "jo-haejin-simple-sincerity",
    slug: "2026-05-17-simple-sincerity",
    title: "단순한 진심",
    author: "조해진",
    readOn: "2026-05-17",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260517_독후감_단순한 진심_조해진.txt"),
      presentation("p1", "202605_발제문_단순한 진심.pdf", C2026),
    ],
  },
  {
    id: "jang-daegun-gv-villain",
    slug: "2026-06-20-gv-villain-go-taekyung",
    title: "GV 빌런 고태경",
    author: "장대건",
    readOn: "2026-06-20",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "독후감과 발제문을 함께 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260620_독후감_GV 빌런 고태경_장대건.txt"),
      presentation("p1", "202606_발제문_GV 빌런 고태경.pdf", C2026),
    ],
  },
  {
    id: "nemirovsky-jezebel",
    slug: "2026-06-30-jezebel",
    title: "제자벨",
    author: "이렌 네미롭스키",
    readOn: "2026-06-30",
    clubSeasonId: "moon-joeunpul-2026",
    excerpt: "문-조은풀에서 읽고, 독후감·발제문을 남긴 기록.",
    tags: ["트레바리", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260630_독후감_제자벨_이렌 네미롭스키.txt"),
      presentation("p1", "202607_발제문_제자벨.pdf", C2026),
    ],
  },

  // —— 개인 독서 (클럽 미소속) ——
  {
    id: "ahn-heeyeon-house-of-words",
    slug: "2026-01-29-house-of-words",
    title: "단어의 집",
    author: "안희연",
    readOn: "2026-01-29",
    excerpt: "개인적으로 읽고 남긴 독후감.",
    tags: ["개인", "독후감"],
    artifacts: [review("r1", "20260129_독후감_단어의 집_안희연.txt")],
  },
  {
    id: "camus-the-stranger",
    slug: "2026-06-15-the-stranger",
    title: "이방인",
    author: "알베르 카뮈",
    readOn: "2026-06-15",
    excerpt: "개인적으로 읽고 남긴 독후감.",
    tags: ["개인", "독후감"],
    artifacts: [review("r1", "20260615_독후감_이방인_알베르 카뮈.txt")],
  },
  {
    id: "hesse-siddhartha",
    slug: "2026-06-30-siddhartha",
    title: "싯다르타",
    author: "헤르만 헤세",
    readOn: "2026-06-30",
    participation: "guest",
    guestClubName: "인사이트 드로잉",
    excerpt: "다른 클럽 놀러가기로 읽고, 독후감·발제문을 남긴 기록.",
    tags: ["트레바리", "놀러가기", "독후감", "발제문"],
    artifacts: [
      review("r1", "20260630_독후감_싯다르타_헤르만 헤세.txt"),
      presentation("p1", "202607_발제문_싯다르타_인사이트 드로잉.pdf"),
    ],
  },
];
