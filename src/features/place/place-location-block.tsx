import { cn } from "@/lib/utils/cn";

type PlaceLink = {
  href: string;
  label: string;
  hint: string;
  kind: "naver" | "catch";
};

type PlaceLocationBlockProps = {
  place: string;
  naverMapUrl?: string;
  catchTableUrl?: string;
};

/** Location 본문 — 장소명 + 외부 연결 (URL 원문 노출 없음) */
export function PlaceLocationBlock({
  place,
  naverMapUrl,
  catchTableUrl,
}: PlaceLocationBlockProps) {
  const links: PlaceLink[] = [
    naverMapUrl
      ? {
          href: naverMapUrl,
          label: "네이버 지도",
          hint: "지도에서 위치 보기",
          kind: "naver" as const,
        }
      : null,
    catchTableUrl
      ? {
          href: catchTableUrl,
          label: "캐치테이블",
          hint: "예약·매장 페이지 열기",
          kind: "catch" as const,
        }
      : null,
  ].filter(Boolean) as PlaceLink[];

  return (
    <div>
      <p className={cn("text-base leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9")}>
        {place}
      </p>

      {links.length > 0 ? (
        <ul className="mt-5 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)]/50">
          {links.map((link) => (
            <li key={link.kind}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 sm:px-5",
                  "transition-colors duration-200",
                  "hover:bg-[var(--color-surface-muted)]/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/20 focus-visible:ring-inset",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center",
                    "border border-[var(--color-border)] bg-[var(--color-background)]",
                    "text-[var(--color-foreground)]",
                    "transition-transform duration-200 group-hover:scale-[1.03]",
                  )}
                  aria-hidden
                >
                  {link.kind === "naver" ? <MapPinGlyph /> : <ReserveGlyph />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--color-muted-soft)]">
                    {link.hint}
                  </span>
                </span>

                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 text-sm text-[var(--color-muted)]",
                    "transition-all duration-200",
                    "group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]",
                  )}
                >
                  <span className="hidden sm:inline">열기</span>
                  <ArrowOutGlyph />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MapPinGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ReserveGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7.5h14v11.25A1.75 1.75 0 0 1 17.25 20.5H6.75A1.75 1.75 0 0 1 5 18.75V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 7.5V5.75A1.75 1.75 0 0 1 9.75 4h4.5A1.75 1.75 0 0 1 16 5.75V7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowOutGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17 17 7M10 7h7v7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
