import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LifeNavMenu } from "@/components/layout/life-nav-menu";
import { SiteAuthActions } from "@/components/layout/site-auth-actions";
import type { Profile } from "@/types/content";

type NavItem = { href: string; label: string };

/** 공개 소개·블로그 메뉴 (나중에 바꿔도 됨) */
const publicNavBeforeLife: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
];

const publicNavAfterLife: NavItem[] = [
  { href: "/growth", label: "Growth" },
  { href: "/notes", label: "Notes" },
  { href: "/#contact", label: "Contact" },
];

/** 관리자 전용 — 공개 메뉴 뒤에 붙음 */
const adminNav: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/career", label: "Career" },
  { href: "/documents", label: "Documents" },
  { href: "/finance", label: "Finance" },
  { href: "/records", label: "Records" },
  { href: "/write", label: "Write" },
];

function NavLink({ href, label }: NavItem) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center text-sm whitespace-nowrap text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
    >
      {label}
    </Link>
  );
}

type SiteHeaderProps = {
  brandName: Profile["brandName"];
  authenticated: boolean;
};

export function SiteHeader({ brandName, authenticated }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/60 bg-[var(--color-background)]/80 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity hover:opacity-70"
        >
          {brandName}
        </Link>
        <nav aria-label="Primary" className="min-w-0 flex-1 overflow-visible">
          <ul className="flex items-center justify-end gap-5 overflow-visible sm:gap-7">
            {publicNavBeforeLife.map((item) => (
              <li key={item.href} className="shrink-0">
                <NavLink {...item} />
              </li>
            ))}
            <LifeNavMenu />
            {publicNavAfterLife.map((item) => (
              <li key={item.href} className="shrink-0">
                <NavLink {...item} />
              </li>
            ))}
            {authenticated
              ? adminNav.map((item) => (
                  <li key={item.href} className="shrink-0">
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
    </header>
  );
}
