import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ReadingArchiveExplorer } from "@/features/reading/reading-archive-explorer";
import { getReadingListItems } from "@/lib/content/get-reading";

export const metadata: Metadata = {
  title: "Reading",
  description: "트레바리와 개인 독서 기록을 검색하고 독후감을 읽습니다.",
};

export default function ReadingArchivePage() {
  const items = getReadingListItems();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/#life" className="transition-opacity hover:opacity-70">
            Life
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          Reading
        </p>

        <header className="mt-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Reading
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            독서 기록
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            책 제목, 저자, 클럽명으로 찾아보고, 항목을 누르면 독후감을 읽을 수
            있습니다. 발제문은 상세에서 등록·다운로드할 수 있습니다.
          </p>
        </header>

        <div className="mt-10">
          <ReadingArchiveExplorer items={items} />
        </div>
      </Container>
    </div>
  );
}
