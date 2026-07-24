import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { homeContent } from "@/content/home";

/** 철학 한 호흡 — 장식 없이 문장만 */
export function BrandStorySection() {
  const { manifesto } = homeContent;

  return (
    <section
      id="manifesto"
      aria-label="Manifesto"
      className="scroll-mt-24 border-t border-[var(--color-border)] py-28 sm:py-40"
    >
      <Container>
        <FadeIn>
          <p className="mx-auto max-w-[18em] text-center font-[family-name:var(--font-display)] text-[clamp(1.6rem,4.2vw,2.75rem)] leading-[1.35] font-semibold tracking-[-0.02em] text-[var(--color-foreground)]">
            {manifesto.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </FadeIn>
      </Container>
    </section>
  );
}
