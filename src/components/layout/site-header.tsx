import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { SiteAuthActions } from "@/components/layout/site-auth-actions";
import {
  ADMIN_NAV,
  GROWTH_NAV,
  LIFE_NAV,
  NOTES_NAV,
  PHASE1_TOP_NAV,
} from "@/content/nav";
import type { Profile } from "@/types/content";

function NavLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex h-8 items-center text-[0.8125rem] tracking-wide whitespace-nowrap text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]";

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

type SiteHeaderProps = {
  brandName: Profile["brandName"];
  authenticated: boolean;
};

/**
 * 로고가 Home. 메뉴는 공간(Life/Growth/Notes) + About + Contact.
 * 크롬을 줄여 콘텐츠가 보이게.
 */
export function SiteHeader({ brandName, authenticated }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-background)]/85 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-6 sm:h-[3.75rem]">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--color-foreground)] transition-opacity hover:opacity-50"
        >
          {brandName}
        </Link>
        <nav aria-label="Primary" className="min-w-0 flex-1 overflow-visible">
          <ul className="flex items-center justify-end gap-5 overflow-visible sm:gap-6">
            <li className="shrink-0">
              <NavLink {...PHASE1_TOP_NAV.about} />
            </li>
            <NavDropdown section={LIFE_NAV} />
            <NavDropdown section={GROWTH_NAV} />
            <NavDropdown section={NOTES_NAV} />
            <li className="hidden shrink-0 sm:list-item">
              <NavLink {...PHASE1_TOP_NAV.contact} />
            </li>
            {authenticated
              ? ADMIN_NAV.map((item) => (
                  <li key={item.href} className="hidden shrink-0 lg:list-item">
                    <NavLink {...item} />
                  </li>
                ))
              : null}
            <li className="shrink-0">
              <SiteAuthActions authenticated={authenticated} />
            </li>
          </ul>
        </nav>
      </Container>
      <div className="h-px w-full bg-[var(--color-border)]" />
    </header>
  );
}
