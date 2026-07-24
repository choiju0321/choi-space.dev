import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import type { Profile } from "@/types/content";

type HeroSectionProps = {
  profile: Pick<Profile, "brandName" | "siteHeadline" | "siteSummary">;
};

/**
 * 첫 화면은 한 덩어리: 브랜드 · 공간 소개 · About / 기록 보기 CTA
 */
export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-glow),transparent_60%),linear-gradient(180deg,var(--color-background)_0%,var(--color-surface)_100%)]"
      />
      <Container className="flex min-h-[min(100svh,900px)] flex-col justify-center py-28 sm:py-36">
        <FadeIn>
          <p className="font-[family-name:var(--font-display)] text-sm font-medium tracking-[0.18em] text-[var(--color-accent)] uppercase">
            {profile.brandName}
          </p>
        </FadeIn>
        <FadeIn delayMs={80}>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-[1.15] font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            {profile.siteHeadline}
          </h1>
        </FadeIn>
        <FadeIn delayMs={160}>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg sm:leading-8">
            {profile.siteSummary}
          </p>
        </FadeIn>
        <FadeIn delayMs={240}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#about" size="lg">
              About
            </Button>
            <Button href="#life" variant="secondary" size="lg">
              Life
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
