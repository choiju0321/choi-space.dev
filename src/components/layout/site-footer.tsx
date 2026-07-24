import { Container } from "@/components/ui/container";
import { homeContent } from "@/content/home";
import type { Profile } from "@/types/content";

type SiteFooterProps = {
  brandName: Profile["brandName"];
};

export function SiteFooter({ brandName }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const { footer } = homeContent;

  return (
    <footer className="border-t border-[var(--color-border)] py-16 sm:py-20">
      <Container className="max-w-2xl">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[-0.02em] text-[var(--color-foreground)]">
          {brandName}
        </p>
        <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
          {footer.tagline}
        </p>
        <p className="mt-10 text-[0.7rem] tracking-wide text-[var(--color-muted-soft)]">
          © {year} {brandName}
        </p>
      </Container>
    </footer>
  );
}
