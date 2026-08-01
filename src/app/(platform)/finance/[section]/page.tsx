import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FinanceClaimsView } from "@/features/finance/finance-claims-view";
import { FinanceInvestView } from "@/features/finance/finance-invest-view";
import { FinanceLedgerView } from "@/features/finance/finance-ledger-view";
import { FinanceOccasionsView } from "@/features/finance/finance-occasions-view";
import { FinancePropertyView } from "@/features/finance/finance-property-view";
import { FinanceListingsView } from "@/features/finance/finance-listings-view";
import { FinanceSectionView } from "@/features/finance/finance-hub-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import {
  FINANCE_SECTIONS,
  isFinanceSectionId,
} from "@/content/finance/sections";
import {
  getFinanceClaims,
  getFinanceInvestSnapshots,
  getFinanceLedgerEntries,
  getFinanceMedicalLedgerEntries,
  getFinanceOccasions,
  getFinancePropertyCases,
  getFinancePropertyListings,
} from "@/lib/content/get-finance";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type FinanceSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateStaticParams() {
  return FINANCE_SECTIONS.map((section) => ({ section: section.id }));
}

export async function generateMetadata({
  params,
}: FinanceSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const meta = FINANCE_SECTIONS.find((item) => item.id === section);
  return {
    title: meta ? `Finance · ${meta.label}` : "Finance",
    robots: { index: false, follow: false },
  };
}

export default async function FinanceSectionPage({
  params,
}: FinanceSectionPageProps) {
  const { section } = await params;
  if (!isFinanceSectionId(section)) notFound();

  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container
        className={
          section === "ledger" ||
          section === "claims" ||
          section === "property" ||
          section === "listings"
            ? "max-w-4xl"
            : "max-w-3xl"
        }
      >
        {authenticated ? (
          section === "occasions" ? (
            <FinanceOccasionsView items={getFinanceOccasions()} />
          ) : section === "ledger" ? (
            <FinanceLedgerView items={getFinanceLedgerEntries()} />
          ) : section === "invest" ? (
            <FinanceInvestView items={getFinanceInvestSnapshots()} />
          ) : section === "claims" ? (
            <FinanceClaimsView
              claims={getFinanceClaims()}
              medicalEntries={getFinanceMedicalLedgerEntries()}
            />
          ) : section === "property" ? (
            <Suspense fallback={null}>
              <FinancePropertyView cases={getFinancePropertyCases()} />
            </Suspense>
          ) : section === "listings" ? (
            <FinanceListingsView listings={getFinancePropertyListings()} />
          ) : (
            <FinanceSectionView section={section} />
          )
        ) : (
          <>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Finance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Finance
            </h1>
            <HealthSessionGate configured={configured} />
          </>
        )}
      </Container>
    </div>
  );
}
