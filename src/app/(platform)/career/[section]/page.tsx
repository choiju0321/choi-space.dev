import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CareerSectionView } from "@/features/career/career-hub-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import {
  CAREER_SECTIONS,
  isCareerSectionId,
} from "@/content/career/sections";
import { getCareerWithDocumentStatus } from "@/lib/content/get-career";
import { getCareerHub } from "@/lib/content/get-career-hub";
import { getProfile } from "@/lib/content/get-profile";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type CareerSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateStaticParams() {
  return CAREER_SECTIONS.map((section) => ({ section: section.id }));
}

export async function generateMetadata({
  params,
}: CareerSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const meta = CAREER_SECTIONS.find((item) => item.id === section);
  return {
    title: meta ? `Career · ${meta.label}` : "Career",
    robots: { index: false, follow: false },
  };
}

export default async function CareerSectionPage({
  params,
}: CareerSectionPageProps) {
  const { section } = await params;
  if (!isCareerSectionId(section)) notFound();

  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();
  const profile = getProfile();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        {authenticated ? (
          <CareerSectionView
            section={section}
            hub={getCareerHub()}
            credentials={getCareerWithDocumentStatus()}
            profile={{ name: profile.name, email: profile.email }}
          />
        ) : (
          <>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Career
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Career
            </h1>
            <HealthSessionGate configured={configured} />
          </>
        )}
      </Container>
    </div>
  );
}
