"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinanceOccasionWriteDraft } from "@/lib/write/finance-drafts";
import type { FinanceOccasionKind } from "@/types/finance";
import { FINANCE_OCCASION_KIND_LABEL } from "@/types/finance";

type FinanceOccasionWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinanceOccasionWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function FinanceOccasionWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: FinanceOccasionWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<FinanceOccasionKind>(
    draft?.kind ?? "congratulatory",
  );
  const [eventType, setEventType] = useState(
    draft?.eventType ?? (draft?.kind === "condolence" ? "장례식" : "결혼식"),
  );
  const [relation, setRelation] = useState(draft?.relation ?? "");
  const [date, setDate] = useState(draft?.date ?? "");
  const [dateUnknown, setDateUnknown] = useState(draft?.dateUnknown ?? false);
  const [name, setName] = useState(draft?.name ?? "");
  const [amount, setAmount] = useState(draft?.amount ?? "");
  const [invited, setInvited] = useState(draft?.invited ?? "");
  const [attended, setAttended] = useState(draft?.attended ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug, setSlug] = useState(draft?.slug ?? "");

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
        경조사 작성은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/occasions" className="underline underline-offset-4">
          Occasions에서 로그인
        </a>
      </p>
    );
  }

  function onKindChange(next: FinanceOccasionKind) {
    setKind(next);
    if (!draft?.eventType) {
      setEventType(next === "condolence" ? "장례식" : "결혼식");
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "occasion");
      body.set("mode", mode);
      body.set("occasionKind", kind);
      body.set("eventType", eventType);
      body.set("relation", relation);
      body.set("date", date);
      body.set("dateUnknown", dateUnknown ? "1" : "0");
      body.set("name", name);
      body.set("amount", amount);
      body.set("invited", invited);
      body.set("attended", attended);
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

      router.push(payload?.href ?? "/finance/occasions");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Life Events
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 경조사" : "경조사 수정"}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="occ-kind">
            Kind
          </label>
          <select
            id="occ-kind"
            className={fieldClass}
            value={kind}
            onChange={(event) =>
              onKindChange(event.target.value as FinanceOccasionKind)
            }
          >
            {(Object.keys(FINANCE_OCCASION_KIND_LABEL) as FinanceOccasionKind[]).map(
              (item) => (
                <option key={item} value={item}>
                  {FINANCE_OCCASION_KIND_LABEL[item]}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="occ-event">
            Event type
          </label>
          <input
            id="occ-event"
            className={fieldClass}
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            required
            placeholder="결혼식 / 장례식"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="occ-name">
            Name
          </label>
          <input
            id="occ-name"
            className={fieldClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="상대 이름"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="occ-amount">
            Amount
          </label>
          <input
            id="occ-amount"
            className={fieldClass}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="numeric"
            placeholder="100000"
          />
        </div>
      </div>

      {kind === "condolence" ? (
        <div>
          <label className={labelClass} htmlFor="occ-relation">
            Relation
          </label>
          <p className="mt-1 text-xs text-[var(--color-muted-soft)]">
            부친 · 모친 · 빙모 · 조부 등
          </p>
          <input
            id="occ-relation"
            className={fieldClass}
            value={relation}
            onChange={(event) => setRelation(event.target.value)}
            placeholder="부친"
          />
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="occ-date">
            Date
          </label>
          <input
            id="occ-date"
            className={fieldClass}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={dateUnknown}
            placeholder="2026-03-04"
          />
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={dateUnknown}
              onChange={(event) => setDateUnknown(event.target.checked)}
            />
            일자 미정
          </label>
        </div>
        <div>
          <label className={labelClass} htmlFor="occ-slug">
            Slug
          </label>
          <input
            id="occ-slug"
            className={fieldClass}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={mode === "existing"}
            placeholder="비우면 날짜-이름에서 생성"
          />
        </div>
      </div>

      {kind === "congratulatory" ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="occ-invited">
              청첩장모임
            </label>
            <select
              id="occ-invited"
              className={fieldClass}
              value={invited}
              onChange={(event) => setInvited(event.target.value)}
            >
              <option value="">미정</option>
              <option value="Y">있음</option>
              <option value="N">없음</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="occ-attended">
              참석
            </label>
            <select
              id="occ-attended"
              className={fieldClass}
              value={attended}
              onChange={(event) => setAttended(event.target.value)}
            >
              <option value="">미정</option>
              <option value="Y">참석</option>
              <option value="N">미참석</option>
            </select>
          </div>
        </div>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="occ-note">
          Note
        </label>
        <textarea
          id="occ-note"
          className={cn(fieldClass, "min-h-20")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="선택 메모"
        />
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
          href="/finance/occasions"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
