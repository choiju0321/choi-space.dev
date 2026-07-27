import type { ReactNode } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";

type ArchiveDetailHeaderProps = {
  categoryLabel: string;
  categoryHref: string;
  title: string;
  excerpt?: string;
  /** body = 본문 톤, lead = 작가/모임 아래 여백 + 본문 톤(독후감 한 줄) */
  excerptTone?: "body" | "lead";
  /** LIFE · READING 아래 보조 메타 (저자 등) */
  supporting?: string;
  publishedOn?: string;
  /** 없으면 헤더에 날짜를 두지 않음 (본문 아래로 내릴 때) */
  displayDate?: string;
  /** 로그인 시 수정 등 */
  actions?: ReactNode;
  children?: ReactNode;
};

/** Post Detail과 같은 브레드크럼·타이포. 도메인 본문은 children으로. */
export function ArchiveDetailHeader({
  categoryLabel,
  categoryHref,
  title,
  excerpt,
  excerptTone = "body",
  supporting,
  publishedOn,
  displayDate,
  actions,
  children,
}: ArchiveDetailHeaderProps) {
  return (
    <FadeIn>
      <ContentBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Life", href: "/life" },
          { label: categoryLabel, href: categoryHref },
        ]}
      />

      <header className="mt-10 max-w-[var(--measure)]">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Life
          <span className="mx-2">·</span>
          {categoryLabel}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        {supporting ? (
          <p className="mt-4 text-base text-[var(--color-muted)]">{supporting}</p>
        ) : null}
        {excerpt ? (
          <p
            className={
              excerptTone === "lead"
                ? "mt-10 text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8"
                : "mt-4 text-base leading-7 text-[var(--color-muted)] sm:text-lg"
            }
          >
            {excerpt}
          </p>
        ) : null}
        {displayDate ? (
          <p className="mt-6 text-sm tabular-nums text-[var(--color-muted-soft)]">
            {publishedOn ? (
              <time dateTime={publishedOn}>{displayDate}</time>
            ) : (
              displayDate
            )}
          </p>
        ) : null}
        {children}
        {actions ? (
          <div className="mt-8 flex justify-end gap-3 border-b border-[var(--color-border)]/70 pb-4">
            {actions}
          </div>
        ) : null}
      </header>
    </FadeIn>
  );
}
