import Link from "next/link";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { contactPage } from "@/content/about";
import type { SocialLink } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type ContactPageViewProps = {
  email: string;
  socialLinks: SocialLink[];
};

export function ContactPageView({ email, socialLinks }: ContactPageViewProps) {
  const content = contactPage;
  const links = [
    { label: "Email", href: `mailto:${email}`, hint: email },
    ...socialLinks.map((link) => ({
      label: link.label,
      href: link.href,
      hint: link.href.replace(/^https?:\/\//, ""),
    })),
  ];

  return (
    <article className="pb-28 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <FadeIn>
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Contact" },
            ]}
          />

          <header className="mt-10 max-w-[var(--measure)]">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl sm:leading-tight">
              {content.title}
            </h1>
            <p className="mt-6 text-base leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9">
              {content.lead}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-soft)]">
              {content.note}
            </p>
          </header>
        </FadeIn>

        <FadeIn delayMs={60} className="mt-12">
          <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)]/50">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-3.5 sm:px-5",
                    "transition-colors duration-200",
                    "hover:bg-[var(--color-surface-muted)]/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/20 focus-visible:ring-inset",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-[var(--color-muted-soft)]">
                      {link.hint}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 text-sm text-[var(--color-muted)]",
                      "transition-all duration-200",
                      "group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]",
                    )}
                  >
                    <span className="hidden sm:inline">열기</span>
                    <span aria-hidden>↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeIn>

        <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
          <Link href="/about" className="transition-opacity hover:opacity-70">
            ← About
          </Link>
        </p>
      </Container>
    </article>
  );
}
