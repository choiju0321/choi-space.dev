import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { Profile } from "@/types/content";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#career", label: "Career" },
  { href: "#life", label: "Life" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
] as const;

type SiteHeaderProps = {
  brandName: Profile["brandName"];
};

export function SiteHeader({ brandName }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/60 bg-[var(--color-background)]/80 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity hover:opacity-70"
        >
          {brandName}
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-6 sm:gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
