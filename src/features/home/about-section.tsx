import { MDXRemote } from "next-mdx-remote/rsc";
import { FadeIn } from "@/components/ui/fade-in";
import { ProfilePortrait } from "@/components/ui/profile-portrait";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import type { Profile } from "@/types/content";

type AboutSectionProps = {
  profile: Pick<
    Profile,
    "name" | "nameEn" | "role" | "tagline" | "image"
  >;
  source: string;
};

export function AboutSection({ profile, source }: AboutSectionProps) {
  return (
    <Section id="about">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          About
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          저는 이런 사람입니다
        </h2>
      </FadeIn>

      <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16">
        <FadeIn>
          <ProfilePortrait
            image={profile.image}
            className="mx-auto max-w-[280px] sm:max-w-[320px] lg:mx-0 lg:max-w-none"
          />
        </FadeIn>

        <FadeIn delayMs={100}>
          <p className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
            {profile.name}
            {profile.nameEn ? (
              <span className="mt-1 block text-base font-normal text-[var(--color-muted-soft)] sm:text-lg">
                {profile.nameEn}
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-base text-[var(--color-muted)]">{profile.role}</p>
          <p className="mt-4 text-lg font-medium tracking-tight text-[var(--color-foreground)]">
            {profile.tagline}
          </p>
          <Prose className="mt-8">
            <MDXRemote source={source} />
          </Prose>
        </FadeIn>
      </div>
    </Section>
  );
}
