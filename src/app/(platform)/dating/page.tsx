import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { DatingProfilesView } from "@/features/dating/dating-profiles-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { getDatingProfiles } from "@/lib/content/get-dating";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal · Dating",
  robots: { index: false, follow: false },
};

export default async function DatingProfilesPage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        {authenticated ? (
          <DatingProfilesView items={getDatingProfiles()} />
        ) : (
          <>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Personal
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Dating
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
