import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ApplicationDetailView } from "@/features/career/application-detail-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import {
  getCareerApplication,
  getCareerApplications,
} from "@/lib/content/get-career-hub";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type ApplicationDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCareerApplications().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const application = getCareerApplication(slug);
  return {
    title: application
      ? `Career · ${application.company}`
      : "Career · Application",
    robots: { index: false, follow: false },
  };
}

export default async function CareerApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { slug } = await params;
  const application = getCareerApplication(slug);
  if (!application) notFound();

  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        {authenticated ? (
          <ApplicationDetailView application={application} />
        ) : (
          <>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Career
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              {application.company}
            </h1>
            <HealthSessionGate configured={configured} />
          </>
        )}
      </Container>
    </div>
  );
}
