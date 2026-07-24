import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { HealthCheckupDetail } from "@/features/health/health-checkup-detail";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import {
  getHealthCheckupBySlug,
  getHealthCheckups,
  hasHealthPrivateDocument,
} from "@/lib/content/get-health";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getHealthCheckups().map((checkup) => ({ slug: checkup.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const checkup = getHealthCheckupBySlug(slug);
  if (!checkup) return { title: "Health", robots: { index: false, follow: false } };

  return {
    title: `${checkup.checkedOn} · Health`,
    robots: { index: false, follow: false },
  };
}

export default async function HealthCheckupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const checkup = getHealthCheckupBySlug(slug);
  if (!checkup) notFound();

  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  if (!authenticated) {
    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Health
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            건강검진
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            이 기록은 비밀번호로 보호됩니다.
          </p>
          <HealthSessionGate configured={configured} />
        </Container>
      </div>
    );
  }

  const synced = Object.fromEntries(
    checkup.documents.map((document) => [
      document.privateFileName,
      hasHealthPrivateDocument(document),
    ]),
  );

  return <HealthCheckupDetail checkup={checkup} synced={synced} />;
}
