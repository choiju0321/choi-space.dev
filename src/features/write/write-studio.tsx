"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { WriteCategory } from "@/types/place";

type Option = { slug: string; label: string };

type WriteStudioProps = {
  authenticated: boolean;
  configured: boolean;
  readingOptions: Option[];
  runningOptions: Option[];
  cultureOptions: Option[];
};

const CATEGORIES: { id: WriteCategory; label: string }[] = [
  { id: "reading", label: "독서" },
  { id: "running", label: "러닝" },
  { id: "culture", label: "문화" },
  { id: "food", label: "맛집" },
  { id: "cafe", label: "카페" },
  { id: "travel", label: "여행" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-foreground)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = cn(
  "h-11 w-full rounded-md px-4 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const areaClass = cn(
  "min-h-40 w-full rounded-md px-4 py-3 text-sm leading-7",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

export function WriteStudio({
  authenticated: initialAuth,
  configured,
  readingOptions,
  runningOptions,
  cultureOptions,
}: WriteStudioProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuth);
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<WriteCategory>("culture");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const supportsPhotos =
    category === "culture" ||
    category === "running" ||
    category === "food" ||
    category === "cafe" ||
    category === "travel";

  const supportsNew =
    category === "running" ||
    category === "culture" ||
    category === "food" ||
    category === "cafe" ||
    category === "travel";

  const existingOptions = useMemo(() => {
    if (category === "reading") return readingOptions;
    if (category === "running") return runningOptions;
    if (category === "culture") return cultureOptions;
    return [];
  }, [category, cultureOptions, readingOptions, runningOptions]);

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
      setAuthenticated(true);
      setPassword("");
      router.refresh();
    });
  }

  function onLogout() {
    startTransition(async () => {
      await fetch("/api/write/logout", { method: "POST" });
      setAuthenticated(false);
      router.refresh();
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("category", category);
    if (supportsNew) data.set("mode", mode);
    else data.set("mode", "existing");

    startTransition(async () => {
      const response = await fetch("/api/write", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      setMessage("저장했습니다.");
      form.reset();
      if (payload?.href) {
        router.refresh();
      }
    });
  }

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        `.env.local`에 `LIFE_WRITE_SECRET`을 설정한 뒤 서버를 다시 실행하세요.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <form onSubmit={onLogin} className="mt-10 max-w-sm space-y-4">
        <Field label="작성 비밀번호">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm text-[var(--color-background)] bg-[var(--color-foreground)] disabled:opacity-60"
        >
          {pending ? "확인 중…" : "입장"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategory(item.id);
                setMode(
                  item.id === "food" ||
                    item.id === "cafe" ||
                    item.id === "travel"
                    ? "new"
                    : "existing",
                );
                setError(null);
                setMessage(null);
              }}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors",
                category === item.id
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          로그아웃
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {supportsNew &&
        (category === "running" || category === "culture") ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm",
                mode === "existing"
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "ring-1 ring-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              기존 기록에 추가
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm",
                mode === "new"
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "ring-1 ring-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              새 기록
            </button>
          </div>
        ) : null}

        {category === "reading" ||
        ((category === "running" || category === "culture") &&
          mode === "existing") ? (
          <Field label="기록 선택">
            <select name="slug" className={inputClass} required>
              <option value="">선택하세요</option>
              {existingOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {category === "running" && mode === "new" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="제목">
              <input name="title" className={inputClass} placeholder="한강 러닝" />
            </Field>
            <Field label="날짜">
              <input name="ranOn" type="date" className={inputClass} required />
            </Field>
            <Field label="거리 (km)">
              <input
                name="distanceKm"
                type="number"
                step="0.1"
                min="0.1"
                className={inputClass}
                required
              />
            </Field>
            <Field label="장소">
              <input name="place" className={inputClass} placeholder="여의도" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input name="excerpt" className={inputClass} />
              </Field>
            </div>
          </div>
        ) : null}

        {category === "culture" && mode === "new" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="작품명">
              <input name="title" className={inputClass} required />
            </Field>
            <Field label="종류">
              <select name="kind" className={inputClass} defaultValue="musical">
                <option value="musical">뮤지컬</option>
                <option value="play">연극</option>
                <option value="exhibition">전시</option>
                <option value="concert">공연</option>
              </select>
            </Field>
            <Field label="날짜">
              <input
                name="watchedOn"
                type="date"
                className={inputClass}
                required
              />
            </Field>
            <Field label="시간">
              <input name="watchedAt" type="time" className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="장소">
                <input name="place" className={inputClass} required />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input name="excerpt" className={inputClass} />
              </Field>
            </div>
          </div>
        ) : null}

        {(category === "food" ||
          category === "cafe" ||
          category === "travel") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="제목">
              <input name="title" className={inputClass} required />
            </Field>
            <Field label="장소">
              <input name="place" className={inputClass} required />
            </Field>
            <Field label="날짜">
              <input
                name="visitedOn"
                type="date"
                className={inputClass}
                required
              />
            </Field>
            {category === "travel" ? (
              <Field label="종료일 (선택)">
                <input name="visitedUntil" type="date" className={inputClass} />
              </Field>
            ) : (
              <div />
            )}
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input name="excerpt" className={inputClass} />
              </Field>
            </div>
          </div>
        )}

        <Field
          label={
            category === "reading"
              ? "독후감"
              : category === "running"
                ? "후기"
                : "후기"
          }
        >
          <textarea
            name="body"
            className={areaClass}
            placeholder="오늘 남기고 싶은 이야기를 적어 주세요."
            required={category === "reading"}
          />
        </Field>

        {supportsPhotos ? (
          <Field label="사진">
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-[var(--color-muted)]"
            />
          </Field>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--color-muted)]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm text-[var(--color-background)] bg-[var(--color-foreground)] disabled:opacity-60"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </form>
    </div>
  );
}
