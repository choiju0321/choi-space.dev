import Link from "next/link";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ProfilePortrait } from "@/components/ui/profile-portrait";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import {
  DetailSection,
} from "@/features/content/detail-section";
import { aboutPage } from "@/content/about";
import type { ProfileImage } from "@/types/content";

/** 섹션 간 · Reading DetailSection과 동일 */
const sectionGapClassName = "mt-10";
/** 라벨 → 본문 */
const labelToBodyClassName = "mt-1";
/** 본문 안 단락·항목 간격 */
const bodyStackClassName = "space-y-4";
/** Timeline 서브와 동일한 본문 크기 */
const aboutBodyClassName =
  "text-base leading-7 text-[var(--color-muted)]";

type AboutPageViewProps = {
  image: ProfileImage;
  email: string;
};

export function AboutPageView({ image, email }: AboutPageViewProps) {
  const content = aboutPage;

  return (
    <article className="pb-28 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <FadeIn>
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "About" },
            ]}
          />

          <header className="mt-10 max-w-[var(--measure)]">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl sm:leading-tight">
              {content.title}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-muted-soft)]">
              {content.titleEn}
            </p>
            <p className={`mt-6 ${aboutBodyClassName}`}>
              {content.lead}
            </p>
          </header>
        </FadeIn>

        <FadeIn delayMs={40} className={sectionGapClassName}>
          <div className="grid gap-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-10">
            <ProfilePortrait
              image={image}
              className="mx-auto w-full max-w-[10rem] sm:mx-0 sm:max-w-none"
            />
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                {content.story.label}
              </p>
              <div
                className={`${labelToBodyClassName} max-w-[var(--measure)] ${bodyStackClassName}`}
              >
                {content.story.paragraphs.map((paragraph) => (
                  <p key={paragraph} className={aboutBodyClassName}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <DetailSection
          label={content.values.label}
          delayMs={60}
          className={sectionGapClassName}
          contentClassName={labelToBodyClassName}
        >
          <ul className={`max-w-[var(--measure)] ${aboutBodyClassName}`}>
            {content.values.items.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection
          label={content.hobbies.label}
          delayMs={80}
          className={sectionGapClassName}
          contentClassName={labelToBodyClassName}
        >
          <p className={aboutBodyClassName}>
            {content.hobbies.items.join(" · ")}
          </p>
        </DetailSection>

        <DetailSection
          label={content.timeline.label}
          delayMs={100}
          className={sectionGapClassName}
          contentClassName={labelToBodyClassName}
        >
          <ul className={bodyStackClassName}>
            {content.timeline.items.map((item) => (
              <li
                key={`${item.period}-${item.label}`}
                className="flex gap-4 sm:gap-6"
              >
                <p className="w-[5.5rem] shrink-0 pt-1 text-[0.7rem] tabular-nums tracking-wide text-[var(--color-muted-soft)] uppercase sm:w-28">
                  {item.period}
                </p>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                    {item.label}
                  </p>
                  <p className={`mt-1 ${aboutBodyClassName}`}>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection
          label={content.skills.label}
          delayMs={120}
          className={sectionGapClassName}
          contentClassName={labelToBodyClassName}
        >
          <p className={aboutBodyClassName}>
            {content.skills.items.join(" · ")}
          </p>
        </DetailSection>

        <DetailSection
          label={content.faq.label}
          delayMs={140}
          className={sectionGapClassName}
          contentClassName={labelToBodyClassName}
        >
          <ul className="max-w-[var(--measure)] space-y-10">
            {content.faq.items.map((item) => (
              <li key={item.q} className={bodyStackClassName}>
                <p className={aboutBodyClassName}>
                  <span>Q. </span>
                  {item.q}
                </p>
                <p className={aboutBodyClassName}>
                  <span>A. </span>
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </DetailSection>

        <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
          <Link
            href="/contact"
            className="transition-opacity hover:opacity-70"
          >
            Contact →
          </Link>
          <span className="mx-3 text-[var(--color-border)]">·</span>
          <a
            href={`mailto:${email}`}
            className="transition-opacity hover:opacity-70"
          >
            {email}
          </a>
        </p>
      </Container>
    </article>
  );
}
