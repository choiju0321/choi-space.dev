import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import type { Profile } from "@/types/content";

type ContactSectionProps = {
  profile: Profile;
};

export function ContactSection({ profile }: ContactSectionProps) {
  return (
    <Section id="contact">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Contact
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          연락처
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          관심 있는 이야기나 협업이 있다면 이메일로 편하게 남겨 주세요.
        </p>
      </FadeIn>

      <FadeIn
        delayMs={100}
        className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8"
      >
        <Button href={`mailto:${profile.email}`} size="lg">
          {profile.email}
        </Button>
        {profile.socialLinks.length > 0 ? (
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {profile.socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-muted)] underline-offset-4 transition-colors hover:text-[var(--color-foreground)] hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </FadeIn>

      {profile.location ? (
        <FadeIn delayMs={160}>
          <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
            {profile.location}
          </p>
        </FadeIn>
      ) : null}
    </Section>
  );
}
