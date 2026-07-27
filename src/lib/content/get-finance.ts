import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  FinanceClaim,
  FinanceInvestSnapshot,
  FinanceLedgerEntry,
  FinanceOccasion,
  FinancePropertyCase,
} from "@/types/finance";

export function financeOccasionsPath() {
  return path.join(process.cwd(), "src/content/finance/occasions.json");
}

export function financeLedgerPath() {
  return path.join(process.cwd(), "src/content/finance/ledger.json");
}

export function financeInvestSnapshotsPath() {
  return path.join(process.cwd(), "src/content/finance/invest-snapshots.json");
}

export function financeClaimsPath() {
  return path.join(process.cwd(), "src/content/finance/claims.json");
}

export function financePropertyCasesPath() {
  return path.join(process.cwd(), "src/content/finance/property-cases.json");
}

function readJsonArrayFile<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function getFinanceOccasions(): FinanceOccasion[] {
  return readJsonArrayFile<FinanceOccasion>(financeOccasionsPath());
}

export function getFinanceOccasion(
  slug: string,
): FinanceOccasion | undefined {
  return getFinanceOccasions().find((item) => item.slug === slug);
}

export function getFinanceLedgerEntries(): FinanceLedgerEntry[] {
  return readJsonArrayFile<FinanceLedgerEntry>(financeLedgerPath());
}

export function getFinanceLedgerEntry(
  slug: string,
): FinanceLedgerEntry | undefined {
  return getFinanceLedgerEntries().find((item) => item.slug === slug);
}

export function getFinanceInvestSnapshots(): FinanceInvestSnapshot[] {
  return readJsonArrayFile<FinanceInvestSnapshot>(financeInvestSnapshotsPath());
}

export function getFinanceInvestSnapshot(
  slug: string,
): FinanceInvestSnapshot | undefined {
  return getFinanceInvestSnapshots().find((item) => item.slug === slug);
}

export function getFinanceClaims(): FinanceClaim[] {
  return readJsonArrayFile<FinanceClaim>(financeClaimsPath());
}

export function getFinanceClaim(slug: string): FinanceClaim | undefined {
  return getFinanceClaims().find((item) => item.slug === slug);
}

export function getFinanceClaimByLedgerSlug(
  ledgerSlug: string,
): FinanceClaim | undefined {
  return getFinanceClaims().find((item) =>
    item.ledgerSlugs?.includes(ledgerSlug),
  );
}

/** Claims에 연결하기 좋은 의료·관련 지출 */
export function getFinanceMedicalLedgerEntries(): FinanceLedgerEntry[] {
  return getFinanceLedgerEntries().filter(
    (item) =>
      item.type === "expense" &&
      (item.category === "의료" ||
        item.subcategory === "병원" ||
        item.subcategory === "약국"),
  );
}

export function getFinancePropertyCases(): FinancePropertyCase[] {
  return readJsonArrayFile<FinancePropertyCase>(financePropertyCasesPath());
}

export function getFinancePropertyCase(
  slug: string,
): FinancePropertyCase | undefined {
  return getFinancePropertyCases().find((item) => item.slug === slug);
}

export function getFinancePropertyTask(
  caseSlug: string,
  taskSlug: string,
): { caseItem: FinancePropertyCase; task: FinancePropertyCase["tasks"][number] } | undefined {
  const caseItem = getFinancePropertyCase(caseSlug);
  if (!caseItem) return undefined;
  const task = caseItem.tasks.find((item) => item.slug === taskSlug);
  if (!task) return undefined;
  return { caseItem, task };
}
