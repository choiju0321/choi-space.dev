import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CareerOverviewView } from "@/features/career/career-hub-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { getCareerWithDocumentStatus } from "@/lib/content/get-career";
import { getCareerHub } from "@/lib/content/get-career-hub";
import { getProfile } from "@/lib/content/get-profile";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career",
  robots: { index: false, follow: false },
};

export default async function CareerOverviewPage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();
  const profile = getProfile();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        {authenticated ? (
          <CareerOverviewView
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
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
              관리자 로그인 후 이용할 수 있습니다.
            </p>
            <HealthSessionGate configured={configured} />
          </>
        )}
      </Container>
    </div>
  );
}
