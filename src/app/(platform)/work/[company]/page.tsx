import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { WorkCompanyView } from "@/features/work/work-company-view";
import {
  getWorkCompanies,
  getWorkCompanyBySlug,
} from "@/lib/content/get-work";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ company: string }>;
};

export function generateStaticParams() {
  return getWorkCompanies().map((company) => ({ company: company.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { company: slug } = await params;
  const company = getWorkCompanyBySlug(slug);
  if (!company) return { title: "Work" };
  return {
    title: `${company.name} · Work`,
    robots: { index: false, follow: false },
  };
}

export default async function WorkCompanyPage({ params }: PageProps) {
  const { company: slug } = await params;
  const company = getWorkCompanyBySlug(slug);
  if (!company) notFound();

  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <Container className="max-w-3xl">
      {authenticated ? (
        <WorkCompanyView company={company} />
      ) : (
        <div className="pb-24 pt-10 sm:pt-14">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Work
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {company.name}
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            관리자 로그인 후 이용할 수 있습니다.
          </p>
          <HealthSessionGate configured={configured} />
        </div>
      )}
    </Container>
  );
}
