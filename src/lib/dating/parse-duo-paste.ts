import type { DatingProfileWriteDraft } from "@/lib/write/dating-drafts";

export type DuoPasteParseResult = {
  draft: Partial<DatingProfileWriteDraft>;
  /** 값이 채워진 draft 키 */
  filledKeys: (keyof DatingProfileWriteDraft)[];
};

type SectionMap = Record<string, string>;

const SECTION_ALIASES: { match: RegExp; key: string }[] = [
  { match: /^학력/, key: "education" },
  { match: /^직장/, key: "job" },
  { match: /^가족/, key: "family" },
  { match: /^키/, key: "height" },
  { match: /^종교/, key: "religion" },
  { match: /^취미/, key: "hobby" },
  { match: /^자기\s*소개/, key: "intro" },
  { match: /^희망상대/, key: "idealType" },
  { match: /^매칭매니저|^매니저/, key: "managerNote" },
];

function normalizeStarLine(line: string): string {
  return line.replace(/^[★☆＊*]\s*/, "").trim();
}

function splitSections(text: string): { preamble: string; sections: SectionMap } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections: SectionMap = {};
  let preamble: string[] = [];
  let currentKey: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentKey) return;
    sections[currentKey] = buffer.join("\n").trim();
    buffer = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const starred = /^[★☆＊*]/.test(line.trim());
    if (starred) {
      const title = normalizeStarLine(line.trim());
      const alias = SECTION_ALIASES.find((entry) => entry.match.test(title));
      if (alias) {
        flush();
        currentKey = alias.key;
        // 제목만 있는 줄(★ 학력사항) vs 값이 붙은 줄(★ 키는 155cm입니다.)
        const rest = title
          .replace(alias.match, "")
          .replace(/^는\s*/, "")
          .replace(/^은\s*/, "")
          .trim();
        const titleNoise =
          /^(사항|근무사항|정보|스타일|파워리뷰|리뷰)\s*/.test(rest) &&
          !/\d/.test(rest) &&
          rest.length < 20;
        buffer = rest && !titleNoise ? [rest] : [];
        continue;
      }
    }

    if (currentKey) buffer.push(line);
    else preamble.push(line);
  }
  flush();

  return { preamble: preamble.join("\n").trim(), sections };
}

function pickMemberId(preamble: string): string | undefined {
  const match = preamble.match(/(\d{7,})\s*님의\s*PROFILE/i);
  return match?.[1];
}

function pickIntroBasics(preamble: string): Partial<DatingProfileWriteDraft> {
  const out: Partial<DatingProfileWriteDraft> = {};

  const surname =
    preamble.match(/([\uac00-\ud7a3]{1,4})씨성을?\s*가진/)?.[1] ??
    preamble.match(/성씨[는:\s]*([\uac00-\ud7a3]{1,4})/)?.[1];
  if (surname) out.surname = surname;

  const birthActual = preamble.match(/실제\s*[:：]?\s*(\d{4})\s*년생/);
  const birthShort = preamble.match(/(\d{2,4})\s*년생/);
  if (birthActual?.[1]) {
    out.birthYearLabel = `${birthActual[1]}년생`;
  } else if (birthShort?.[1]) {
    const raw = birthShort[1];
    const year =
      raw.length === 2 ? (Number(raw) >= 50 ? `19${raw}` : `20${raw}`) : raw;
    out.birthYearLabel = `${year}년생`;
  }

  if (/여성/.test(preamble)) out.gender = "여성";
  else if (/남성/.test(preamble)) out.gender = "남성";

  const residence =
    preamble.match(/현재\s+(.+?)에\s*살고/)?.[1]?.trim() ??
    preamble.match(/거주지[는:\s]*(.+)/)?.[1]?.trim();
  if (residence) out.residence = residence.replace(/\.$/, "");

  return out;
}

function parseEducation(body: string): Partial<DatingProfileWriteDraft> {
  const out: Partial<DatingProfileWriteDraft> = {};
  const lines = body
    .split("\n")
    .map((line) => line.replace(/^[\s\-–—·]+/, "").trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/고등|고등학교/.test(line) && !out.highSchool) {
      out.highSchool = line;
    } else if (/대학|대학교|전공/.test(line) && !/대학원/.test(line) && !out.university) {
      out.university = line;
    } else if (/대학원/.test(line) && !out.graduate) {
      out.graduate = line;
    }
  }
  return out;
}

function parseJob(body: string): Partial<DatingProfileWriteDraft> {
  const out: Partial<DatingProfileWriteDraft> = {};
  const compact = body.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

  const company =
    compact.match(/현직\s*[:：]?\s*(.+?)(?=\s*\(|$)/)?.[1]?.trim() ??
    compact.match(/-\s*현직\s*[:：]?\s*(.+?)(?=\s*\(|$)/)?.[1]?.trim();
  if (company) out.company = company.replace(/\s+$/, "");

  const paren = compact.match(/\(([^)]*)\)/);
  if (paren?.[1]) {
    const inside = paren[1];
    const department = inside.match(/부서\s*[:：]?\s*([^/]*)/)?.[1]?.trim();
    const title = inside.match(/직위\s*[:：]?\s*([^/]*)/)?.[1]?.trim();
    const field = inside.match(/담당업무\s*[:：]?\s*([^/]*)/)?.[1]?.trim();
    const location = inside.match(/소재지\s*[:：]?\s*([^/]*)/)?.[1]?.trim();
    if (department) out.department = department;
    if (title) out.title = title;
    if (field) out.field = field;
    if (location) out.location = location;
  }

  return out;
}

function parseFamily(body: string): Partial<DatingProfileWriteDraft> {
  const out: Partial<DatingProfileWriteDraft> = {};
  const others: string[] = [];
  const lines = body
    .split("\n")
    .map((line) => line.replace(/^[\s\-–—·]+/, "").trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(
      /^(부|모|아버지|어머니|오빠|형|동생|여동생|남동생|언니|누나|조부|조모)\s*[:：]\s*(.+)$/,
    );
    if (!match) {
      others.push(line);
      continue;
    }
    const relation = match[1];
    const detail = match[2].trim();
    if (relation === "부" || relation === "아버지") out.familyFather = detail;
    else if (relation === "모" || relation === "어머니") out.familyMother = detail;
    else others.push(`${relation}: ${detail}`);
  }

  if (others.length) out.familyOther = others.join("\n");
  return out;
}

function parseHeight(body: string): string | undefined {
  const match = body.match(/(\d{2,3})\s*cm/i);
  if (match) return `${match[1]}cm`;
  const cleaned = body.replace(/입니다\.?$/, "").trim();
  return cleaned || undefined;
}

function parseReligion(body: string): string | undefined {
  const match = body.match(/종교는?\s*(.+?)(?:입니다|$)/);
  const value = (match?.[1] ?? body).replace(/입니다\.?$/, "").trim();
  return value || undefined;
}

function parseHobby(body: string): string | undefined {
  const match = body.match(/취미는?\s*(.+?)(?:입니다|$)/);
  const value = (match?.[1] ?? body).replace(/입니다\.?$/, "").trim();
  return value || undefined;
}

function collectFilled(
  draft: Partial<DatingProfileWriteDraft>,
): (keyof DatingProfileWriteDraft)[] {
  return (Object.keys(draft) as (keyof DatingProfileWriteDraft)[]).filter(
    (key) => {
      const value = draft[key];
      return typeof value === "string" ? value.trim() !== "" : value != null;
    },
  );
}

/**
 * 듀오 "님의 PROFILE" + ★ 섹션 붙여넣기 → Write 폼 draft 일부.
 * metAt / photos / contact / status / note 는 채우지 않는다.
 */
export function parseDuoProfilePaste(text: string): DuoPasteParseResult {
  const draft: Partial<DatingProfileWriteDraft> = {};
  const raw = text.trim();
  if (!raw) return { draft, filledKeys: [] };

  const { preamble, sections } = splitSections(raw);

  const memberId = pickMemberId(preamble);
  if (memberId) draft.memberId = memberId;
  Object.assign(draft, pickIntroBasics(preamble));

  if (sections.education) Object.assign(draft, parseEducation(sections.education));
  if (sections.job) Object.assign(draft, parseJob(sections.job));
  if (sections.family) Object.assign(draft, parseFamily(sections.family));

  if (sections.height) {
    const height = parseHeight(sections.height);
    if (height) draft.height = height;
  }
  if (sections.religion) {
    const religion = parseReligion(sections.religion);
    if (religion) draft.religion = religion;
  }
  if (sections.hobby) {
    const hobby = parseHobby(sections.hobby);
    if (hobby) draft.hobby = hobby;
  }
  if (sections.intro?.trim()) draft.intro = sections.intro.trim();
  if (sections.idealType?.trim()) draft.idealType = sections.idealType.trim();
  if (sections.managerNote?.trim()) {
    draft.managerNote = sections.managerNote.trim();
  }

  return { draft, filledKeys: collectFilled(draft) };
}
