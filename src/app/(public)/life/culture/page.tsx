import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CultureArchiveExplorer } from "@/features/culture/culture-archive-explorer";
import { getCultureListItems } from "@/lib/content/get-culture";

export const metadata: Metadata = {
  title: "Culture",
  description: "뮤지컬과 공연 관람 기록을 모읍니다.",
};

export default function CultureArchivePage() {
  const items = getCultureListItems();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/#life" className="transition-opacity hover:opacity-70">
            Life
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          Culture
        </p>

        <header className="mt-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Culture
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            문화 기록
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            포도알 티켓북을 바탕으로 관람 기록을 모아 둡니다. 후기는 상세에서
            하나씩 채울 수 있습니다.
          </p>
        </header>

        <div className="mt-10">
          <CultureArchiveExplorer items={items} />
        </div>
      </Container>
    </div>
  );
}
