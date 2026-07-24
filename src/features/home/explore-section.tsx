import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import { homeContent } from "@/content/home";

/**
 * 목차처럼 읽히는 세 갈래 길.
 * 카드/박스/그림자 없이 타이포와 구분선만.
 */
export function ExploreSection() {
  const { index } = homeContent;

  return (
    <Section
      id="explore"
      className="border-t border-[var(--color-border)] !py-28 sm:!py-36"
    >
      <FadeIn>
        <p className="text-[0.7rem] tracking-[0.2em] text-[var(--color-muted-soft)] uppercase">
          {index.eyebrow}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-4xl">
          {index.title}
        </h2>
      </FadeIn>

      <ul className="mt-16 border-t border-[var(--color-border)]">
        {index.items.map((item, i) => (
          <li key={item.id}>
            <FadeIn delayMs={i * 60}>
              <Link
                href={item.href}
                className="group grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-6 border-b border-[var(--color-border)] py-9 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-10 sm:py-11"
              >
                <span className="pt-1 font-[family-name:var(--font-display)] text-sm tabular-nums text-[var(--color-muted-soft)]">
                  {item.number}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.7rem] tracking-[0.18em] text-[var(--color-muted-soft)] uppercase">
                    {item.label}
                  </span>
                  <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] transition-opacity group-hover:opacity-55 sm:text-3xl">
                    {item.title}
                  </span>
                  <span className="mt-3 block text-sm leading-7 text-[var(--color-muted)]">
                    {item.body}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="hidden pt-8 text-sm text-[var(--color-muted-soft)] transition-transform duration-300 group-hover:translate-x-1 sm:block"
                >
                  →
                </span>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
