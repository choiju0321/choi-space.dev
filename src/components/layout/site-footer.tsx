import { Container } from "@/components/ui/container";
import type { Profile } from "@/types/content";

type SiteFooterProps = {
  brandName: Profile["brandName"];
  name: Profile["name"];
};

export function SiteFooter({ brandName, name }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted)]">
          © {year} {brandName} · {name}
        </p>
        <p className="text-sm text-[var(--color-muted-soft)]">
          오래 쓸 수 있는 구조로, 차분하게.
        </p>
      </Container>
    </footer>
  );
}
