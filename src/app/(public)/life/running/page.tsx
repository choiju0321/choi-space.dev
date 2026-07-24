import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { RunningArchiveExplorer } from "@/features/running/running-archive-explorer";
import { getRunningListItems } from "@/lib/content/get-running";

export const metadata: Metadata = {
  title: "Running",
  description: "마라톤 대회와 일상 러닝 기록을 모읍니다.",
};

export default function RunningArchivePage() {
  const items = getRunningListItems();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/#life" className="transition-opacity hover:opacity-70">
            Life
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          Running
        </p>

        <header className="mt-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Running
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            러닝 기록
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            대회 완주와 일상 러닝을 모아 둡니다. 기록지·후기는 상세에서 하나씩
            채울 수 있습니다.
          </p>
        </header>

        <div className="mt-10">
          <RunningArchiveExplorer items={items} />
        </div>
      </Container>
    </div>
  );
}
