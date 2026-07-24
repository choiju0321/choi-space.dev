import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import type { Profile } from "@/types/content";

type ContactSectionProps = {
  profile: Profile;
};

/** 필요 시 다른 페이지에서 재사용 */
export function ContactSection({ profile }: ContactSectionProps) {
  return (
    <Section id="contact">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Contact
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          함께 이야기해요.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          궁금한 점이나 협업 제안, 가볍게 인사를 나누고 싶다면 언제든 연락해
          주세요.
        </p>
      </FadeIn>
      <FadeIn delayMs={100} className="mt-10">
        <Button href={`mailto:${profile.email}`} size="lg">
          Contact
        </Button>
      </FadeIn>
    </Section>
  );
}
