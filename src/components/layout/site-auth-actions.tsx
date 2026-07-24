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
        className="inline-flex h-9 items-center text-sm font-medium text-[var(--color-accent)] transition-opacity hover:opacity-70"
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
      className="inline-flex h-9 items-center text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)] disabled:opacity-60"
    >
      {pending ? "…" : "Logout"}
    </button>
  );
}
