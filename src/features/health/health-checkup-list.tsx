import Link from "next/link";
import type { HealthListItem } from "@/lib/content/get-health";

type HealthCheckupListProps = {
  items: HealthListItem[];
};

export function HealthCheckupList({ items }: HealthCheckupListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        등록된 검진이 없습니다. `src/content/health/checkups.json`에 메타를
        추가하세요.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]/70">
      {items.map((item) => {
        const placeLine = [item.provider, item.place].filter(Boolean).join(" · ");
        const findingLabel =
          item.notableFindingCount > 0
            ? `이상·추적 ${item.notableFindingCount}`
            : "이상소견 없음";

        return (
          <li key={item.id}>
            <Link
              href={`/health/${item.slug}`}
              className="group flex flex-col gap-1 py-5 transition-opacity hover:opacity-80 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <div>
                <p className="text-sm text-[var(--color-muted)]">
                  {item.displayDate}
                  <span className="mx-2 text-[var(--color-muted-soft)]">·</span>
                  {placeLine}
                </p>
                <p className="mt-1 text-lg font-medium tracking-tight text-[var(--color-foreground)]">
                  {item.packageName ?? "건강검진"}
                  {item.hasPasswordHint ? (
                    <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
                      암호 PDF
                    </span>
                  ) : null}
                </p>
              </div>
              <p className="shrink-0 text-sm text-[var(--color-muted)]">
                {findingLabel}
                <span className="mx-2 text-[var(--color-muted-soft)]">·</span>
                서류 {item.syncedDocumentCount}/{item.documentCount}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
