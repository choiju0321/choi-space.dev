import type { CareerPostingBrief, CareerPostingSection } from "@/types/career-hub";

export type JobPostingParseResult = {
  posting: CareerPostingBrief;
  /** 채워진 메타 키 */
  filledKeys: (keyof CareerPostingBrief)[];
};

const SECTION_HEADINGS: { match: RegExp; heading: string }[] = [
  { match: /^(담당\s*업무|주요\s*업무|업무\s*내용|Job\s*Description|Responsibilities)/i, heading: "담당업무" },
  { match: /^(자격\s*요건|지원\s*자격|필수\s*자격|Requirements|Qualifications)/i, heading: "자격요건" },
  { match: /^(우대\s*사항|우대\s*조건|Preferred)/i, heading: "우대사항" },
  { match: /^(근무\s*조건|근무\s*환경|처우|복지|Benefits)/i, heading: "근무조건" },
  { match: /^(전형\s*절차|채용\s*절차|채용절차|Process)/i, heading: "전형절차" },
  { match: /^(모집\s*부문|채용\s*분야|포지션|Position)/i, heading: "포지션" },
  { match: /^(근무\s*지|근무지역)/i, heading: "근무지" },
  { match: /^(제출\s*서류|지원\s*방법|How\s*to\s*Apply)/i, heading: "지원방법" },
  { match: /^(회사\s*소개|About\s*(the\s*)?Company)/i, heading: "회사소개" },
  { match: /^(기타\s*사항|유의사항|기타|참고)/i, heading: "기타" },
];

const META_PATTERNS: {
  key: keyof Pick<
    CareerPostingBrief,
    "deadline" | "location" | "employmentType" | "role"
  >;
  match: RegExp;
}[] = [
  {
    key: "deadline",
    match:
      /(?:모집\s*기간|접수\s*기간|마감|채용\s*기간|지원\s*기간)\s*[:：]?\s*(.+)$/i,
  },
  {
    key: "location",
    match: /(?:근무\s*지|근무\s*지역|위치|Location)\s*[:：]?\s*(.+)$/i,
  },
  {
    key: "employmentType",
    match: /(?:고용\s*형태|채용\s*형태|계약\s*형태|Employment)\s*[:：]?\s*(.+)$/i,
  },
  {
    key: "role",
    match: /(?:모집\s*직무|직무|포지션|Position|Role)\s*[:：]?\s*(.+)$/i,
  },
];

const BULLET_LINE = /^[\s]*([•●○◆◇▪▫‣◼◾·‧∙\-–—*＊]|[0-9]+[.)]|[①-⑳])\s+/u;
const LABEL_VALUE = /^([^:]{1,24})\s*[:：]\s*(.+)$/;
const NUMBERED_HEADING = /^(\d{1,2})\s*[.．)]\s*(.+)$/;
const BRACKET_HEADING = /^\[\s*(.+?)\s*\]$/;

function stripDecorators(line: string) {
  return line
    .replace(/^[\s]*[■□▶▷◆◇●○◉◎★☆▪▫‣◼◾]+\s*/u, "")
    .replace(/^#{1,6}\s+/, "")
    .trim();
}

function headingFromKnownTitle(title: string) {
  const cleaned = stripDecorators(title)
    .replace(/^\[\s*/, "")
    .replace(/\s*\]$/, "")
    .trim();
  const found = SECTION_HEADINGS.find((entry) => entry.match.test(cleaned));
  return found?.heading ?? null;
}

function looksLikeHeading(line: string) {
  const cleaned = stripDecorators(line);
  if (!cleaned || cleaned.length > 48) return false;
  if (/[.。]$/.test(cleaned) && !NUMBERED_HEADING.test(cleaned)) return false;

  if (headingFromKnownTitle(cleaned)) return true;

  const numbered = cleaned.match(NUMBERED_HEADING);
  if (numbered?.[2] && headingFromKnownTitle(numbered[2])) return true;

  const bracket = cleaned.match(BRACKET_HEADING);
  if (bracket?.[1] && headingFromKnownTitle(bracket[1])) return true;

  return false;
}

function normalizeHeading(line: string) {
  const cleaned = stripDecorators(line);
  const numbered = cleaned.match(NUMBERED_HEADING);
  if (numbered?.[2]) {
    return headingFromKnownTitle(numbered[2]) ?? numbered[2].trim();
  }
  const bracket = cleaned.match(BRACKET_HEADING);
  if (bracket?.[1]) {
    return headingFromKnownTitle(bracket[1]) ?? bracket[1].trim();
  }
  return headingFromKnownTitle(cleaned) ?? cleaned;
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[.,;]+$/, "")))];
}

/** 본문 한 줄 → 불릿/라벨/문단 정규화 */
function normalizeBodyLine(raw: string): string | null {
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;
  if (/^(지원\s*마감|공유하기|스크랩|목록으로|지원하기)$/i.test(trimmed)) {
    return null;
  }

  const bullet = trimmed.match(BULLET_LINE);
  if (bullet) {
    const content = trimmed.slice(bullet[0].length).trim();
    return content ? `- ${content}` : null;
  }

  const label = trimmed.match(LABEL_VALUE);
  if (label) {
    const key = label[1].trim();
    const value = label[2].trim();
    // 긴 라벨(업무명: 설명)은 불릿 항목으로
    if (key.length > 12) return `- ${key}: ${value}`;
    return `${key}: ${value}`;
  }

  return trimmed;
}

/**
 * 섹션 본문 정렬.
 * - 연속 짧은 줄·업무형 줄은 불릿으로
 * - 빈 줄로 문단 구분
 * - 잡음 줄 제거
 */
export function formatSectionBody(rawLines: string[]): string {
  const normalized = rawLines
    .map(normalizeBodyLine)
    .filter((line): line is string => Boolean(line));

  if (normalized.length === 0) return "";

  const out: string[] = [];
  let i = 0;

  while (i < normalized.length) {
    const line = normalized[i]!;
    const isBullet = line.startsWith("- ");
    const isLabel = LABEL_VALUE.test(line) && !isBullet;

    // 이미 불릿이면 묶음 유지
    if (isBullet) {
      while (i < normalized.length && normalized[i]!.startsWith("- ")) {
        out.push(normalized[i]!);
        i += 1;
      }
      out.push("");
      continue;
    }

    // 짧은 업무형 줄이 2개 이상 연속이면 불릿으로 승격
    const run: string[] = [line];
    let j = i + 1;
    while (j < normalized.length) {
      const next = normalized[j]!;
      if (next.startsWith("- ") || LABEL_VALUE.test(next)) break;
      if (next.length > 90) break;
      run.push(next);
      j += 1;
    }

    const promoteToList =
      run.length >= 2 &&
      run.every((item) => item.length <= 90) &&
      !run.some((item) => /입니다[.。]?$/.test(item) && item.length > 40);

    if (promoteToList && !isLabel) {
      for (const item of run) out.push(`- ${item}`);
      out.push("");
      i = j;
      continue;
    }

    out.push(line);
    if (isLabel) {
      // 라벨 다음에 오는 짧은 줄들을 하위 불릿으로
      const children: string[] = [];
      while (j < normalized.length) {
        const next = normalized[j]!;
        if (next.startsWith("- ") || LABEL_VALUE.test(next)) break;
        if (next.length > 100) break;
        children.push(next);
        j += 1;
      }
      if (children.length >= 1 && children.every((item) => item.length <= 90)) {
        for (const child of children) out.push(`- ${child}`);
        out.push("");
        i = j;
        continue;
      }
    }

    out.push("");
    i += 1;
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanBodyLines(lines: string[]) {
  return formatSectionBody(lines);
}

function pickTitle(lines: string[], role?: string): string | undefined {
  if (role && role.length >= 2 && role.length <= 80) return role;

  for (const raw of lines.slice(0, 16)) {
    let line = stripDecorators(raw);
    if (!line) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (META_PATTERNS.some((entry) => entry.match.test(line))) continue;
    if (looksLikeHeading(line)) continue;
    if (/^(채용\s*공고|공고\s*상세|상세\s*보기|공유하기|스크랩|지원\s*마감)/i.test(line)) {
      continue;
    }
    if (line.length < 4 || line.length > 120) continue;
    line = line
      .replace(/^\[[^\]]*\]\s*/, (match) => match.replace(/[\[\]]/g, "") + " ")
      .replace(/[\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // 태그 뭉치 한 줄은 제목으로 쓰지 않음
    if (/경력\s*\d|정규직|계약직|지원\s*마감/.test(line) && line.length > 40) {
      continue;
    }
    return line;
  }
  return undefined;
}

/**
 * 채용공고 전체 복사 텍스트 → 섹션·메타·불릿 정리.
 * 사이트별 HTML이 아니라, 사용자가 붙여넣은 평문에 맞춤.
 */
export function parseJobPostingPaste(
  rawText: string,
  options?: { url?: string },
): JobPostingParseResult {
  const text = rawText.replace(/\r\n/g, "\n").trim();
  const filledKeys: (keyof CareerPostingBrief)[] = [];

  if (!text) {
    return {
      posting: {
        url: options?.url?.trim() || undefined,
        sections: [],
        sourceText: undefined,
      },
      filledKeys: options?.url?.trim() ? ["url"] : [],
    };
  }

  const urls = extractUrls(text);
  const url = options?.url?.trim() || urls[0];
  if (url) filledKeys.push("url");

  const lines = text.split("\n");
  const sections: CareerPostingSection[] = [];
  const preamble: string[] = [];
  let currentHeading: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentHeading) return;
    const body = cleanBodyLines(buffer);
    if (body) sections.push({ heading: currentHeading, body });
    buffer = [];
  };

  const meta: Partial<
    Pick<CareerPostingBrief, "deadline" | "location" | "employmentType" | "role">
  > = {};

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (currentHeading) buffer.push("");
      else preamble.push("");
      continue;
    }

    for (const entry of META_PATTERNS) {
      const match = stripDecorators(trimmed).match(entry.match);
      if (match?.[1] && !meta[entry.key]) {
        meta[entry.key] = match[1].trim();
        filledKeys.push(entry.key);
      }
    }

    // 라벨형 메타: 소속 / 채용 인원 등
    const labeled = stripDecorators(trimmed).match(LABEL_VALUE);
    if (labeled) {
      const key = labeled[1].replace(/\s+/g, "");
      const value = labeled[2].trim();
      if (/소속|근무/.test(key) && !meta.location && /서울|경기|부산|근무/.test(value)) {
        meta.location = value;
        filledKeys.push("location");
      }
      if (/채용\s*인원|인원|고용/.test(key) && !meta.employmentType && /정규|계약|인턴/.test(value)) {
        const emp = value.match(/정규직|계약직|인턴|프리랜서/)?.[0];
        if (emp) {
          meta.employmentType = emp;
          filledKeys.push("employmentType");
        }
      }
    }

    if (looksLikeHeading(trimmed)) {
      flush();
      currentHeading = normalizeHeading(trimmed);
      continue;
    }

    if (currentHeading) buffer.push(raw);
    else preamble.push(raw);
  }
  flush();

  const title = pickTitle([...preamble, ...lines], meta.role);
  if (title) filledKeys.push("title");

  if (sections.length === 0) {
    const body = cleanBodyLines(lines);
    if (body) sections.push({ heading: "공고 내용", body });
  } else {
    const introLines = preamble.filter((raw) => {
      const line = stripDecorators(raw.trim());
      if (!line) return false;
      if (/^https?:\/\//i.test(line)) return false;
      if (META_PATTERNS.some((entry) => entry.match.test(line))) return false;
      const plain = line.replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();
      if (title && plain === title) return false;
      if (/지원\s*마감|경력\s*\d|정규직.*본사/.test(line) && line.length > 30) {
        return false;
      }
      return true;
    });
    const intro = cleanBodyLines(introLines);
    if (intro && intro.split("\n").filter(Boolean).length >= 1) {
      // 인사말 문단만 요약으로
      const sentences = intro
        .split("\n")
        .map((line) => line.replace(/^-\s+/, "").trim())
        .filter(Boolean);
      if (sentences.some((line) => line.length > 40 || /입니다|모집|지원/.test(line))) {
        sections.unshift({
          heading: "소개",
          body: sentences.filter((line) => !line.startsWith("-") || line.length > 20).join("\n\n"),
        });
      }
    }
  }

  if (sections.length > 0) filledKeys.push("sections");

  const posting: CareerPostingBrief = {
    url,
    title,
    role: meta.role,
    deadline: meta.deadline,
    location: meta.location,
    employmentType: meta.employmentType,
    sections,
    sourceText: text,
  };

  return {
    posting,
    filledKeys: [...new Set(filledKeys)],
  };
}

/** 모달 표시용 — 본문을 문단/리스트 블록으로 */
export type PostingBodyBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "kv"; label: string; value: string };

export function postingBodyToBlocks(body: string): PostingBodyBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: PostingBodyBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "p", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push({ type: "ul", items: [...list] });
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }

    const kv = line.match(LABEL_VALUE);
    if (kv && kv[1].length <= 16) {
      flushList();
      flushParagraph();
      blocks.push({ type: "kv", label: kv[1].trim(), value: kv[2].trim() });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushList();
  flushParagraph();
  return blocks;
}
