import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import type { Project } from "@/types/content";

type FeaturedWorkSectionProps = {
  projects: Project[];
};

export function FeaturedWorkSection({ projects }: FeaturedWorkSectionProps) {
  return (
    <Section id="work">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Work
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          대표 경험
        </h2>
        <p className="mt-4 max-w-xl text-base text-[var(--color-muted)]">
          지금까지 쌓아 온 일과, 지금 만들고 있는 공간을 간단히 모았습니다.
        </p>
      </FadeIn>

      <ul className="mt-14 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {projects.map((project, index) => {
          const content = (
            <div className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
              <div className="min-w-0">
                <h3 className="text-xl font-medium tracking-tight text-[var(--color-foreground)] sm:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
                  {project.description}
                </p>
                {project.tags && project.tags.length > 0 ? (
                  <p className="mt-3 text-sm text-[var(--color-muted-soft)]">
                    {project.tags.join(" · ")}
                  </p>
                ) : null}
              </div>
              {project.year ? (
                <span className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
                  {project.year}
                </span>
              ) : null}
            </div>
          );

          return (
            <li key={project.id}>
              <FadeIn delayMs={index * 60}>
                {project.href ? (
                  <a
                    href={project.href}
                    className="block transition-opacity hover:opacity-70"
                    {...(project.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </FadeIn>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
