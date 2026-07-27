/**
 * Ledger category normalize — 2026-04+ 태그 기준 정리
 * Run: npx tsx scripts/normalize-ledger-taxonomy.mts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { FinanceLedgerEntry } from "../src/types/finance";

const filePath = path.join(process.cwd(), "src/content/finance/ledger.json");

function noteText(entry: FinanceLedgerEntry) {
  return `${entry.note ?? ""} ${entry.title}`.toLowerCase();
}

function hasTag(entry: FinanceLedgerEntry, ...needles: string[]) {
  const hay = noteText(entry);
  return needles.some((n) => hay.includes(n.toLowerCase()));
}

function setCat(
  entry: FinanceLedgerEntry,
  category: string,
  subcategory?: string,
) {
  entry.category = category;
  if (subcategory) entry.subcategory = subcategory;
  else delete entry.subcategory;
}

function normalize(entry: FinanceLedgerEntry): string[] {
  const changes: string[] = [];
  const before = `${entry.category}>${entry.subcategory ?? ""}`;

  // Drop empty subcategory noise
  if (entry.subcategory === "미분류") {
    delete entry.subcategory;
    changes.push("drop-미분류");
  }

  // Experimental / one-off categories
  if (entry.category === "생활비-고정") {
    setCat(entry, "통신비");
  } else if (entry.category === "생활비-변동") {
    setCat(entry, "식비", "베이커리");
  } else if (entry.category === "재테크") {
    setCat(entry, "기타", "행정");
  } else if (entry.category === "여가활동") {
    entry.category = "여가";
  }

  // 자기개발 혼동: 영화 vs 도서 vs 웹소설
  if (entry.category === "자기개발") {
    if (hasTag(entry, "교보", "도서", "싯타르따", "백의그림자", "단순한진심", "이방인")) {
      setCat(entry, "자기개발", "도서");
    } else if (
      hasTag(entry, "시네마", "영화", "구름사람들", "gv", "고태경") ||
      /시네마/i.test(entry.title)
    ) {
      setCat(entry, "여가", "영화");
    } else if (
      hasTag(
        entry,
        "네이버시리즈",
        "노벨피아",
        "노펠피아",
        "카카오페이지",
        "네이버웹툰",
        "쿠키",
      )
    ) {
      setCat(entry, "여가", "웹소설");
    }
  }

  // AI / 생산성 구독 → 자기개발 (웹소설 앱 제외)
  if (
    (hasTag(entry, "커서", "cursor", "챗지피티", "chatgpt") ||
      /cursor/i.test(entry.title)) &&
    !hasTag(entry, "노벨피아", "노펠피아", "네이버시리즈", "카카오페이지")
  ) {
    setCat(entry, "자기개발", "AI구독");
  }

  // 여가: 웹소설 · 게임 · 구독
  if (entry.category === "여가" || entry.category === "여가활동") {
    entry.category = "여가";
    if (
      hasTag(
        entry,
        "네이버시리즈",
        "노벨피아",
        "노펠피아",
        "카카오페이지",
        "네이버웹툰",
      ) ||
      entry.subcategory === "웹툰" ||
      entry.subcategory === "웹소설"
    ) {
      setCat(entry, "여가", "웹소설");
    } else if (
      hasTag(entry, "클래시로얄", "클래시", "환생한마법사", "66666") ||
      entry.subcategory === "게임"
    ) {
      setCat(entry, "여가", "게임");
    } else if (
      entry.subcategory === "구독료" ||
      entry.subcategory === "구독" ||
      (hasTag(entry, "구독료") &&
        !hasTag(entry, "네이버시리즈", "노벨피아", "노펠피아", "카카오페이지"))
    ) {
      setCat(entry, "여가", "구독");
    } else if (entry.subcategory === "문화활동" || entry.subcategory === "문화") {
      if (hasTag(entry, "클래시", "게임", "환생")) setCat(entry, "여가", "게임");
      else setCat(entry, "여가", "문화");
    }
  }

  // 현금/이체 쪽 웹소설도 동일
  if (hasTag(entry, "네이버시리즈", "노벨피아", "노펠피아", "카카오페이지")) {
    if (entry.type === "expense" || entry.type === "transfer") {
      setCat(entry, "여가", "웹소설");
      if (entry.type === "transfer") {
        // keep transfer type; category for browse
      }
    }
  }

  // 식비에 생필품이 들어간 경우
  if (entry.category === "식비" && hasTag(entry, "멀티탭")) {
    setCat(entry, "생필품");
  }

  // 「현금」바구니 해체 — 메모·제목 기준
  if (entry.category === "현금") {
    if (hasTag(entry, "월세")) setCat(entry, "주거", "월세");
    else if (hasTag(entry, "현금인출", "atm", "지갑") || /atm/i.test(entry.title)) {
      setCat(entry, "현금인출");
    } else if (hasTag(entry, "네이버시리즈", "쿠키", "웹툰", "카카오페이지", "노벨피아", "노펠피아")) {
      setCat(entry, "여가", "웹소설");
    } else if (hasTag(entry, "수수료") && hasTag(entry, "철도", "서울역", "전주")) {
      setCat(entry, "교통비", "수수료");
    } else if (hasTag(entry, "등기", "계약")) {
      setCat(entry, "주거", "행정");
    } else if (hasTag(entry, "마사지")) {
      setCat(entry, "여가", "케어");
    } else if (hasTag(entry, "당근", "용달", "책상", "의자")) {
      setCat(entry, "쇼핑", "중고");
    } else {
      setCat(entry, "이체", "개인");
    }
  }

  // 「이체」중 목적이 분명한 것
  if (entry.category === "이체") {
    if (hasTag(entry, "월세")) setCat(entry, "주거", "월세");
    else if (hasTag(entry, "여행", "숙소", "스테이")) setCat(entry, "여행", "숙소");
    else if (hasTag(entry, "용돈") && entry.amount < 0) setCat(entry, "이체", "용돈");
  }

  // 저축 속 중고 판매(입금)
  if (
    entry.category === "저축" &&
    entry.amount > 0 &&
    hasTag(entry, "번개장터")
  ) {
    entry.type = "income";
    entry.typeLabel = "수입";
    setCat(entry, "기타수입", "중고");
  }

  // 내계좌이체: 증권·청약 소분류
  if (entry.category === "내계좌이체") {
    if (hasTag(entry, "증권", "하이닉스", "투자") || /증권/i.test(entry.title)) {
      setCat(entry, "투자", "증권");
    } else if (hasTag(entry, "주택청약", "청약")) {
      setCat(entry, "저축", "청약");
    } else if (hasTag(entry, "약국", "병원", "통증")) {
      setCat(entry, "의료", "환급");
    }
  }

  // 투자: 통장 이자
  if (entry.category === "투자" && /이자/.test(entry.title)) {
    setCat(entry, "투자", "이자");
  }

  // 주거 소분류
  if (entry.category === "주거") {
    if (hasTag(entry, "월세") || /월세/.test(entry.title)) setCat(entry, "주거", "월세");
    else if (hasTag(entry, "가스") || /예스코|가스/.test(entry.title)) {
      setCat(entry, "주거", "가스비");
    } else if (hasTag(entry, "수도")) setCat(entry, "주거", "수도세");
    else if (/전기/.test(entry.title)) setCat(entry, "주거", "전기요금");
    else if (hasTag(entry, "계약금", "관리비")) {
      /* keep existing subcategory if set */
      if (!entry.subcategory && hasTag(entry, "계약금")) setCat(entry, "주거", "계약금");
    } else if (/이자 자동이체|대출/.test(entry.title)) {
      setCat(entry, "주거", "대출이자");
    }
  }

  // 카드대금·급여는 그대로
  if (entry.category === "미분류") {
    setCat(entry, "내계좌이체");
  }

  const after = `${entry.category}>${entry.subcategory ?? ""}`;
  if (before !== after) changes.push(`${before}→${after}`);
  return changes;
}

const data = JSON.parse(readFileSync(filePath, "utf8")) as FinanceLedgerEntry[];
const changeLog: Record<string, number> = {};
let touched = 0;

for (const entry of data) {
  const changes = normalize(entry);
  if (changes.length > 0) {
    touched += 1;
    for (const c of changes) {
      changeLog[c] = (changeLog[c] ?? 0) + 1;
    }
  }
}

// strip undefined fields for clean JSON
const cleaned = data.map((entry) => {
  const next: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (v !== undefined) next[k] = v;
  }
  return next;
});

writeFileSync(filePath, `${JSON.stringify(cleaned, null, 2)}\n`, "utf8");

const byCat: Record<string, number> = {};
for (const e of data) {
  const c = e.category ?? "(없음)";
  byCat[c] = (byCat[c] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      touched,
      total: data.length,
      byCat: Object.entries(byCat).sort((a, b) => b[1] - a[1]),
      topChanges: Object.entries(changeLog)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 40),
    },
    null,
    2,
  ),
);
