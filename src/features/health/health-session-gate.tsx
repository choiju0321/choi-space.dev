"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type HealthSessionGateProps = {
  configured: boolean;
};

const inputClass = cn(
  "h-11 w-full rounded-md px-4 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

export function HealthSessionGate({ configured }: HealthSessionGateProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/write/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setError(payload?.error ?? "로그인에 실패했습니다.");
        return;
      }
      setPassword("");
      router.refresh();
    });
  }

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        `.env.local`에 `LIFE_WRITE_SECRET`을 설정한 뒤 서버를 다시 실행하세요.
      </p>
    );
  }

  return (
    <form onSubmit={onLogin} className="mt-10 max-w-sm space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          접근 비밀번호
        </span>
        <div className="mt-2">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </div>
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-11 rounded-md px-5 text-sm font-medium",
          "bg-[var(--color-foreground)] text-[var(--color-background)]",
          "disabled:opacity-60",
        )}
      >
        {pending ? "확인 중…" : "열기"}
      </button>
      <p className="text-xs text-[var(--color-muted)]">
        `/write`와 같은 `LIFE_WRITE_SECRET` 세션을 사용합니다.
      </p>
    </form>
  );
}
