import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { DocumentVaultView } from "@/features/documents/document-vault-view";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { getVaultGroupsWithStatus } from "@/lib/documents/vault";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default async function DocumentsHubPage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();
  const groups = getVaultGroupsWithStatus();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Documents
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          서류 금고
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          등본·초본·재직증명서처럼 자주 제출하는 서류를 모아 두고 내려받습니다.
          Career 학력·자격 서류는 Career 메뉴의 첨부파일에서 관리합니다.
        </p>

        {authenticated ? (
          <DocumentVaultView groups={groups} />
        ) : (
          <HealthSessionGate configured={configured} />
        )}
      </Container>
    </div>
  );
}
