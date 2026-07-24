import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { homeContent } from "@/content/home";

/**
 * 첫 화면: 브랜드가 주인공.
 * 버튼 두 개짜리 랜딩 템플릿을 쓰지 않는다.
 */
export function HeroSection() {
  const { hero } = homeContent;

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:pb-20 sm:pt-32">
      <Container>
        <FadeIn>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,5.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-[var(--color-foreground)]">
            {hero.brand}
          </h1>
        </FadeIn>
        <FadeIn delayMs={120}>
          <p className="mt-8 max-w-[22rem] text-[1.05rem] leading-8 text-[var(--color-muted)] sm:max-w-md sm:text-lg sm:leading-9">
            {hero.line}
          </p>
        </FadeIn>
        <FadeIn delayMs={220}>
          <a
            href={hero.continueHref}
            className="mt-12 inline-flex items-center gap-2 text-sm tracking-wide text-[var(--color-foreground)] underline-offset-[6px] transition-opacity hover:opacity-55"
          >
            {hero.continueLabel}
            <span aria-hidden className="translate-y-px text-[0.7rem]">
              ↓
            </span>
          </a>
        </FadeIn>
      </Container>
    </section>
  );
}
