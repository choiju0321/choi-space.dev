import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { WriteStudio } from "@/features/write/write-studio";
import { getCultureEntries } from "@/lib/content/get-culture";
import { getReadingEntries } from "@/lib/content/get-reading";
import { getRunningEntries } from "@/lib/content/get-running";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

export default async function WritePage() {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Write
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          기록 작성
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          Life 카테고리를 고르고, 후기와 사진을 남깁니다. 이 페이지는
          비밀번호로 보호됩니다.
        </p>

        <WriteStudio
          authenticated={authenticated}
          configured={configured}
          readingOptions={getReadingEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.readOn}`,
          }))}
          runningOptions={getRunningEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.ranOn}`,
          }))}
          cultureOptions={getCultureEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.watchedOn}`,
          }))}
        />
      </Container>
    </div>
  );
}
