import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { ProfilePortrait } from "@/components/ui/profile-portrait";
import { Section } from "@/components/ui/section";
import { homeContent } from "@/content/home";
import type { Profile } from "@/types/content";

type AboutCardSectionProps = {
  profile: Pick<Profile, "name" | "nameEn" | "image">;
};

/** Home About — 미리보기. 자세한 이야기는 /about */
export function AboutCardSection({ profile }: AboutCardSectionProps) {
  const { aboutCard } = homeContent;

  return (
    <Section
      id="about"
      className="border-t border-[var(--color-border)] !py-28 sm:!py-36"
    >
      <FadeIn>
        <div className="grid items-end gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-24">
          <ProfilePortrait
            image={profile.image}
            priority
            className="mx-auto w-full max-w-[18rem] lg:mx-0 lg:max-w-none"
          />

          <div className="pb-1">
            <p className="text-[0.7rem] tracking-[0.2em] text-[var(--color-muted-soft)] uppercase">
              {aboutCard.eyebrow}
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl leading-none font-semibold tracking-[-0.03em] text-[var(--color-foreground)] sm:text-5xl">
              {profile.name}
            </h2>
            {profile.nameEn ? (
              <p className="mt-3 text-sm text-[var(--color-muted-soft)]">
                {profile.nameEn}
              </p>
            ) : null}
            <p className="mt-8 text-sm tracking-wide text-[var(--color-muted)]">
              {aboutCard.roleLine}
            </p>
            <p className="mt-6 max-w-[28rem] text-[1.05rem] leading-8 text-[var(--color-muted)]">
              {aboutCard.lead}
            </p>
            <Link
              href="/about"
              className="mt-10 inline-block text-sm tracking-wide text-[var(--color-foreground)] underline decoration-[var(--color-border)] underline-offset-[7px] transition-[decoration-color,opacity] hover:decoration-[var(--color-foreground)]"
            >
              {aboutCard.cta}
            </Link>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
