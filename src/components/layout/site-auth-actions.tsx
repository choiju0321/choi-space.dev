"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type SiteAuthActionsProps = {
  authenticated: boolean;
};

export function SiteAuthActions({ authenticated }: SiteAuthActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!authenticated) {
    return (
      <Link
        href="/write"
        className="inline-flex h-8 items-center text-[0.8125rem] tracking-wide text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
      >
        Login
      </Link>
    );
  }

  function onLogout() {
    startTransition(async () => {
      await fetch("/api/write/logout", { method: "POST" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="inline-flex h-8 items-center text-[0.8125rem] tracking-wide text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)] disabled:opacity-60"
    >
      {pending ? "…" : "Logout"}
    </button>
  );
}
