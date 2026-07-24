import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { HealthCheckupList } from "@/features/health/health-checkup-list";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { getHealthListItems } from "@/lib/content/get-health";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health",
  robots: { index: false, follow: false },
};

export default async function HealthArchivePage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Health
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          건강검진
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          연도별 검진 메타와 서류입니다. 공개 홈에는 올리지 않으며, 작성
          비밀번호로만 열 수 있습니다.
        </p>

        {authenticated ? (
          <div className="mt-10">
            <HealthCheckupList items={getHealthListItems()} />
          </div>
        ) : (
          <HealthSessionGate configured={configured} />
        )}
      </Container>
    </div>
  );
}
