"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { CareerBasicsWriteDraft } from "@/lib/write/career-drafts";

type CareerBasicsWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  draft?: CareerBasicsWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function CareerBasicsWriteForm({
  authenticated,
  configured,
  draft,
}: CareerBasicsWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(draft?.name ?? "");
  const [email, setEmail] = useState(draft?.email ?? "");
  const [birthDate, setBirthDate] = useState(draft?.birthDate ?? "");
  const [location, setLocation] = useState(draft?.location ?? "");

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        WRITE_SECRET이 설정되지 않았습니다.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Profile 수정은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/career" className="underline underline-offset-4">
          Career에서 로그인
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "basics");
      body.set("mode", "existing");
      body.set("name", name);
      body.set("email", email);
      body.set("birthDate", birthDate);
      body.set("location", location);

      const response = await fetch("/api/write/career", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push(payload?.href ?? "/career/basics");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Basics · Profile
        <span className="mx-2 text-[var(--color-border)]">·</span>
        기본정보 수정
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="basics-name">
            Name
          </label>
          <input
            id="basics-name"
            className={fieldClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="basics-email">
            Email
          </label>
          <input
            id="basics-email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="basics-birth">
            Birth date
          </label>
          <input
            id="basics-birth"
            className={fieldClass}
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
            placeholder="1991.03.21"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="basics-location">
            Location
          </label>
          <input
            id="basics-location"
            className={fieldClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            placeholder="서울"
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-10 px-5 text-sm tracking-wide",
            "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
            "text-[var(--color-background)] transition-opacity",
            "hover:opacity-80 disabled:opacity-50",
          )}
        >
          {pending ? "저장 중…" : "저장"}
        </button>
        <a
          href="/career/basics"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
