import Link from "next/link";
import { Container } from "@/components/ui/container";
import { HealthSessionGate } from "@/features/health/health-session-gate";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

type PlatformHubProps = {
  eyebrow: string;
  title: string;
  summary: string;
  phaseNote: string;
  links?: { href: string; label: string }[];
};

export async function PlatformHubPage({
  eyebrow,
  title,
  summary,
  phaseNote,
  links = [],
}: PlatformHubProps) {
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  if (!authenticated) {
    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-[var(--color-muted)]">
            관리자 로그인 후 이용할 수 있습니다.
          </p>
          <HealthSessionGate configured={configured} />
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {summary}
        </p>
        <p className="mt-6 text-sm text-[var(--color-muted-soft)]">{phaseNote}</p>
        {links.length > 0 ? (
          <ul className="mt-10 divide-y divide-[var(--color-border)]/70">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex py-4 text-base text-[var(--color-foreground)] transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </div>
  );
}
