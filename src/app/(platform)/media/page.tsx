import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { MediaBrowser } from "@/features/media/media-browser";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function MediaBrowserPage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Media
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          미디어 브라우저
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          기록에 붙는 PDF·엑셀 등 첨부를 `private/media` 트리에서 보고
          올리고 내려받습니다. Reading·Travel 엔트리 폴더에 올리면
          규칙 파일명으로 자동 저장됩니다.
        </p>

        {authenticated ? (
          <MediaBrowser />
        ) : (
          <HealthSessionGate configured={configured} />
        )}
      </Container>
    </div>
  );
}
