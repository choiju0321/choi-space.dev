/**
 * 뱅크샐러드 가계부 엑셀/CSV 파서
 * 시트: 「가계부 내역」
 * 컬럼: 날짜 · 시간 · 타입 · 대분류 · 소분류 · 내용 · 금액 · 화폐 · 결제수단 · 메모
 */

import * as XLSX from "xlsx";
import type { FinanceLedgerEntry, FinanceLedgerType } from "@/types/finance";

function slugifyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type RawRow = Record<string, unknown>;

function cell(row: RawRow, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  // fuzzy: normalize spaces
  const normalized = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.replace(/\s+/g, ""), v]),
  );
  for (const key of keys) {
    const compact = key.replace(/\s+/g, "");
    if (normalized[compact] != null && String(normalized[compact]).trim() !== "") {
      return String(normalized[compact]).trim();
    }
  }
  return "";
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, "").replace(/원/g, "").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // Excel serial number as string
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (serial > 20000 && serial < 80000) {
      const parsed = XLSX.SSF.parse_date_code(serial);
      if (parsed) {
        const y = parsed.y;
        const m = String(parsed.m).padStart(2, "0");
        const d = String(parsed.d).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
  }
  // YYYY-MM-DD / YYYY.MM.DD / YYYY/MM/DD
  const iso = raw.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }
  // M/D/YY · M/D/YYYY (시트→문자열 변환 시 흔함)
  const mdY = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (mdY) {
    let year = Number(mdY[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    return `${year}-${mdY[1].padStart(2, "0")}-${mdY[2].padStart(2, "0")}`;
  }
  return null;
}

function parseTime(raw: string): string | undefined {
  if (!raw) return undefined;
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (serial > 0 && serial < 1) {
      const parsed = XLSX.SSF.parse_date_code(serial);
      if (parsed) {
        return `${String(parsed.H).padStart(2, "0")}:${String(parsed.M).padStart(2, "0")}`;
      }
    }
  }
  const m = raw.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
  return raw.slice(0, 8) || undefined;
}

export function mapLedgerType(label: string): FinanceLedgerType {
  const t = label.trim();
  if (t.includes("수입") || t.includes("소득") || /income/i.test(t)) {
    return "income";
  }
  if (t.includes("이체") || /transfer/i.test(t)) return "transfer";
  if (t.includes("지출") || t.includes("소비") || /expense|spend/i.test(t)) {
    return "expense";
  }
  return "other";
}

export function buildLedgerFingerprint(parts: {
  date: string;
  time?: string;
  typeLabel?: string;
  amount: number;
  title: string;
  payment?: string;
}) {
  return [
    parts.date,
    parts.time ?? "",
    parts.typeLabel ?? "",
    String(parts.amount),
    parts.title,
    parts.payment ?? "",
  ].join("|");
}

function sheetToRows(sheet: XLSX.WorkSheet): RawRow[] {
  return XLSX.utils.sheet_to_json<RawRow>(sheet, {
    defval: "",
    raw: false,
  });
}

function pickLedgerSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  const preferred = workbook.SheetNames.find(
    (name) => name.includes("가계부") || /ledger|transaction/i.test(name),
  );
  if (preferred) return workbook.Sheets[preferred];
  // fallback: first sheet with 날짜 + 금액 headers
  for (const name of workbook.SheetNames) {
    const rows = sheetToRows(workbook.Sheets[name]);
    if (rows.length === 0) continue;
    const keys = Object.keys(rows[0]).join(" ");
    if (keys.includes("날짜") && (keys.includes("금액") || keys.includes("내용"))) {
      return workbook.Sheets[name];
    }
  }
  return workbook.Sheets[workbook.SheetNames[0]] ?? null;
}

export function parseBankSaladLedgerBuffer(
  buffer: ArrayBuffer | Buffer,
  fileName: string,
): { entries: Omit<FinanceLedgerEntry, "id" | "slug" | "importedAt">[]; error?: string } {
  let workbook: XLSX.WorkBook;
  try {
    if (fileName.toLowerCase().endsWith(".csv")) {
      const text = Buffer.from(buffer as ArrayBuffer).toString("utf8");
      workbook = XLSX.read(text, { type: "string" });
    } else {
      workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    }
  } catch {
    return {
      entries: [],
      error:
        "파일을 읽을 수 없습니다. 비밀번호로 잠긴 엑셀이면 암호를 해제한 뒤 다시 저장하거나 CSV로 저장해 주세요.",
    };
  }

  const sheet = pickLedgerSheet(workbook);
  if (!sheet) {
    return { entries: [], error: "시트를 찾을 수 없습니다." };
  }

  const rows = sheetToRows(sheet);
  if (rows.length === 0) {
    return { entries: [], error: "가계부 내역이 비어 있습니다." };
  }

  const entries: Omit<FinanceLedgerEntry, "id" | "slug" | "importedAt">[] = [];

  for (const row of rows) {
    const dateRaw = cell(row, "날짜", "일자", "date", "Date");
    const date = parseDate(dateRaw);
    if (!date) continue;

    const title = cell(row, "내용", "거래처", "거래처명", "title", "content");
    const amount = parseAmount(cell(row, "금액", "amount", "Amount"));
    if (amount == null) continue;

    const typeLabel = cell(row, "타입", "유형", "구분", "type");
    const type = mapLedgerType(typeLabel || "지출");
    const time = parseTime(cell(row, "시간", "시각", "time"));
    const category = cell(row, "대분류", "카테고리", "category") || undefined;
    const subcategory = cell(row, "소분류", "세부", "subcategory") || undefined;
    const payment = cell(row, "결제수단", "결제", "payment") || undefined;
    const currency = cell(row, "화폐", "통화", "currency") || undefined;
    const note = cell(row, "메모", "비고", "note") || undefined;

    const fingerprint = buildLedgerFingerprint({
      date,
      time,
      typeLabel: typeLabel || type,
      amount,
      title: title || "(제목 없음)",
      payment,
    });

    entries.push({
      fingerprint,
      date,
      time,
      type,
      typeLabel: typeLabel || undefined,
      category,
      subcategory,
      title: title || "(제목 없음)",
      amount,
      currency,
      payment,
      note,
      source: "banksalad",
    });
  }

  if (entries.length === 0) {
    return {
      entries: [],
      error:
        "가계부 행을 파싱하지 못했습니다. 「가계부 내역」 시트와 날짜·금액·내용 컬럼을 확인해 주세요.",
    };
  }

  return { entries };
}

export function assignLedgerSlugs(
  entries: Omit<FinanceLedgerEntry, "id" | "slug" | "importedAt">[],
  existingSlugs: Set<string>,
): FinanceLedgerEntry[] {
  const stamp = new Date().toISOString();
  const used = new Set(existingSlugs);
  return entries.map((entry) => {
    const base =
      `${entry.date}-${slugifyPart(entry.title) || "entry"}-${Math.abs(entry.amount)}`.slice(
        0,
        56,
      );
    let slug = base;
    let n = 1;
    while (used.has(slug)) {
      n += 1;
      slug = `${base}-${n}`;
    }
    used.add(slug);
    return {
      ...entry,
      id: slug,
      slug,
      importedAt: stamp,
    };
  });
}
