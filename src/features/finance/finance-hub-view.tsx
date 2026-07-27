import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { FINANCE_NAV } from "@/content/nav";
import {
  FINANCE_SECTIONS,
  type FinanceSectionId,
} from "@/content/finance/sections";
import {
  getFinanceClaims,
  getFinanceInvestSnapshots,
  getFinanceLedgerEntries,
  getFinanceMedicalLedgerEntries,
  getFinanceOccasions,
  getFinancePropertyCases,
} from "@/lib/content/get-finance";
import {
  buildClaimListRows,
  countPropertyOpenTasks,
  formatWon,
  latestInvestMonth,
  sumInvestValuation,
  investMonthKey,
} from "@/lib/write/finance-drafts";

const FINANCE_HIGHLIGHT =
  "관리자 전용 원장 · 가계·경조사·투자·청구·부동산. Growth/Notes Finance 글과 분리.";

function FinanceFooterLinks() {
  return (
    <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
      <Link href="/documents" className="transition-opacity hover:opacity-70">
        Documents
      </Link>
      <span className="mx-3 text-[var(--color-border)]">·</span>
      <Link href="/career" className="transition-opacity hover:opacity-70">
        Career
      </Link>
      <span className="mx-3 text-[var(--color-border)]">·</span>
      <Link href="/work" className="transition-opacity hover:opacity-70">
        Work
      </Link>
    </p>
  );
}

function sectionHint(
  id: FinanceSectionId,
  occasionCount: number,
  occasionTotal: number,
  ledgerCount: number,
  investHint: string | null,
  claimsOpen: number,
  propertyOpen: number,
) {
  if (id === "occasions") {
    return `${occasionCount}건 · ${formatWon(occasionTotal)}`;
  }
  if (id === "ledger") {
    return ledgerCount > 0 ? `${ledgerCount}건` : null;
  }
  if (id === "invest") {
    return investHint;
  }
  if (id === "claims") {
    return claimsOpen > 0 ? `미신청 ${claimsOpen}건` : null;
  }
  if (id === "property") {
    return propertyOpen > 0 ? `남은일 ${propertyOpen}` : null;
  }
  return null;
}

/** Finance Dashboard — 섹션 허브 */
export function FinanceOverviewView() {
  const occasions = getFinanceOccasions();
  const ledger = getFinanceLedgerEntries();
  const invest = getFinanceInvestSnapshots();
  const claims = getFinanceClaims();
  const occasionTotal = occasions.reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  );
  const investMonth = latestInvestMonth(invest);
  const investHint = investMonth
    ? (() => {
        const monthItems = invest.filter(
          (item) => investMonthKey(item.asOf) === investMonth,
        );
        return `${investMonth.replace("-", ".")} · ${formatWon(sumInvestValuation(monthItems))}`;
      })()
    : null;
  const claimsOpen = buildClaimListRows(
    getFinanceMedicalLedgerEntries(),
    claims,
  ).filter((row) => row.status === "planned").length;
  const propertyOpen = getFinancePropertyCases().reduce(
    (sum, item) => sum + countPropertyOpenTasks(item),
    0,
  );

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Finance" }]}
        />
        <p className="mt-6 text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Finance
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
          자산·소비·경조사·투자·청구·부동산을 한곳에서 봅니다. 공개 Growth/Notes
          Finance 글과는 분리된 관리자 원장입니다.
        </p>
        <p className="mt-6 border-l border-[var(--color-foreground)] pl-4 text-sm leading-7 text-[var(--color-foreground)]">
          {FINANCE_HIGHLIGHT}
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-14">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Dashboard
        </p>
        <ul className="mt-4 divide-y divide-[var(--color-border)]/70 border-b border-[var(--color-border)]/70">
          {FINANCE_SECTIONS.map((section) => {
            const hint = sectionHint(
              section.id,
              occasions.length,
              occasionTotal,
              ledger.length,
              investHint,
              claimsOpen,
              propertyOpen,
            );
            return (
              <li key={section.id}>
                <Link
                  href={section.href}
                  className="group flex items-baseline justify-between gap-6 py-5"
                >
                  <div className="min-w-0">
                    <p className="text-base text-[var(--color-foreground)] transition-opacity group-hover:opacity-70">
                      {section.label}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted-soft)]">
                      {section.summary}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
                    {hint ?? (
                      <span
                        aria-hidden
                        className="inline-block transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </FadeIn>

      <FinanceFooterLinks />
    </div>
  );
}

type FinanceSectionViewProps = {
  section: FinanceSectionId;
};

/** Finance 하위 섹션 — Empty 셸 (Occasions 제외) */
export function FinanceSectionView({ section }: FinanceSectionViewProps) {
  const meta = FINANCE_SECTIONS.find((item) => item.id === section)!;

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: meta.label },
          ]}
        />
        <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Finance
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {meta.label}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          {meta.summary}
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-10">
        <p className="text-sm text-[var(--color-muted-soft)]">
          아직 항목이 없습니다. Write는 다음 단계에서 붙입니다.
        </p>
      </FadeIn>

      <FinanceFooterLinks />
    </div>
  );
}
