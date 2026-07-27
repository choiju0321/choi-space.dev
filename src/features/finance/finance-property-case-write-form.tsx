"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinancePropertyCaseWriteDraft } from "@/lib/write/finance-drafts";
import {
  FINANCE_PROPERTY_CASE_STATUS_LABEL,
  FINANCE_PROPERTY_KIND_LABEL,
  type FinancePropertyCaseStatus,
  type FinancePropertyKind,
} from "@/types/finance";

type FinancePropertyCaseWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinancePropertyCaseWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function FinancePropertyCaseWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: FinancePropertyCaseWriteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [kind, setKind] = useState<FinancePropertyKind>(
    draft?.kind ?? "private-rental",
  );
  const [status, setStatus] = useState<FinancePropertyCaseStatus>(
    draft?.status ?? "active",
  );
  const [wonAt, setWonAt] = useState(draft?.wonAt ?? "");
  const [moveInAt, setMoveInAt] = useState(draft?.moveInAt ?? "");
  const [location, setLocation] = useState(draft?.location ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug] = useState(draft?.slug ?? "");

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Write secret이 설정되지 않았습니다.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Property는 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/property" className="underline underline-offset-4">
          Property에서 로그인
        </a>
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body = new FormData();
      body.set("kind", "property");
      body.set("mode", mode);
      body.set("title", title);
      body.set("propertyKind", kind);
      body.set("status", status);
      body.set("wonAt", wonAt);
      body.set("moveInAt", moveInAt);
      body.set("location", location);
      body.set("note", note);
      if (slug.trim()) body.set("slug", slug.trim());

      const response = await fetch("/api/write/finance", {
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

      router.push(payload?.href ?? "/finance/property");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Real Estate
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 케이스" : "케이스 수정"}
      </p>
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        민간임대·청약 당첨 건 단위입니다. 할 일은 케이스 안에서 + Task로
        추가합니다.
      </p>

      <div>
        <label className={labelClass} htmlFor="property-title">
          Title
        </label>
        <input
          id="property-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="민간임대 · ○○단지"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="property-kind">
            Kind
          </label>
          <select
            id="property-kind"
            className={fieldClass}
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as FinancePropertyKind)
            }
          >
            {(Object.keys(FINANCE_PROPERTY_KIND_LABEL) as FinancePropertyKind[]).map(
              (item) => (
                <option key={item} value={item}>
                  {FINANCE_PROPERTY_KIND_LABEL[item]}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="property-status">
            Status
          </label>
          <select
            id="property-status"
            className={fieldClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as FinancePropertyCaseStatus)
            }
          >
            {(
              Object.keys(
                FINANCE_PROPERTY_CASE_STATUS_LABEL,
              ) as FinancePropertyCaseStatus[]
            ).map((item) => (
              <option key={item} value={item}>
                {FINANCE_PROPERTY_CASE_STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="property-won">
            Won at
          </label>
          <input
            id="property-won"
            type="date"
            className={fieldClass}
            value={wonAt}
            onChange={(event) => setWonAt(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="property-movein">
            Move-in
          </label>
          <input
            id="property-movein"
            type="date"
            className={fieldClass}
            value={moveInAt}
            onChange={(event) => setMoveInAt(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="property-location">
          Location
        </label>
        <input
          id="property-location"
          className={fieldClass}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="단지·지역"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="property-note">
          Note
        </label>
        <textarea
          id="property-note"
          className={cn(fieldClass, "min-h-[4.5rem] resize-y")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-muted)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex h-10 items-center px-4 text-sm tracking-wide",
          "border border-[var(--color-foreground)] text-[var(--color-foreground)]",
          "transition-opacity hover:opacity-70 disabled:opacity-40",
        )}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
