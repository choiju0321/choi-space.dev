"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MediaFolderAttachments } from "@/features/content/media-folder-attachments";
import { cn } from "@/lib/utils/cn";
import { cleanLedgerTitle, formatWon } from "@/lib/write/finance-drafts";
import type { FinanceClaimWriteDraft } from "@/lib/write/finance-drafts";
import {
  FINANCE_CLAIM_DEFAULT_INSURER,
  FINANCE_CLAIM_STATUS_LABEL,
  type FinanceClaimStatus,
  type FinanceLedgerEntry,
} from "@/types/finance";

type FinanceClaimWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinanceClaimWriteDraft | null;
  medicalEntries: FinanceLedgerEntry[];
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function FinanceClaimWriteForm({
  authenticated,
  configured,
  mode,
  draft,
  medicalEntries,
}: FinanceClaimWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [insurer, setInsurer] = useState(
    draft?.insurer ?? FINANCE_CLAIM_DEFAULT_INSURER,
  );
  const [status, setStatus] = useState<FinanceClaimStatus>(
    draft?.status ?? "planned",
  );
  const [careDate, setCareDate] = useState(draft?.careDate ?? "");
  const [filedAt, setFiledAt] = useState(draft?.filedAt ?? "");
  const [paidAt, setPaidAt] = useState(draft?.paidAt ?? "");
  const [claimAmount, setClaimAmount] = useState(draft?.claimAmount ?? "");
  const [paidAmount, setPaidAmount] = useState(draft?.paidAmount ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [ledgerSlugs, setLedgerSlugs] = useState<string[]>(
    draft?.ledgerSlugs ?? [],
  );
  const [slug] = useState(draft?.slug ?? "");

  const linkedSum = useMemo(() => {
    return medicalEntries
      .filter((item) => ledgerSlugs.includes(item.slug))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }, [medicalEntries, ledgerSlugs]);

  function toggleLedger(slugValue: string) {
    setLedgerSlugs((prev) => {
      if (prev.includes(slugValue)) {
        return prev.filter((s) => s !== slugValue);
      }
      const next = [...prev, slugValue];
      const entry = medicalEntries.find((item) => item.slug === slugValue);
      if (entry && !title.trim()) {
        setTitle(cleanLedgerTitle(entry.title));
      }
      if (entry?.date && !careDate) {
        setCareDate(entry.date);
      }
      if (!claimAmount && linkedSum === 0 && entry) {
        setClaimAmount(String(Math.abs(entry.amount)));
      }
      return next;
    });
  }

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
        보험 청구는 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/claims" className="underline underline-offset-4">
          Claims에서 로그인
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "claim");
      body.set("mode", mode);
      body.set("title", title);
      body.set("insurer", insurer);
      body.set("status", status);
      body.set("careDate", careDate);
      body.set("filedAt", filedAt);
      body.set("paidAt", paidAt);
      body.set("claimAmount", claimAmount);
      body.set("paidAmount", paidAmount);
      body.set("note", note);
      body.set("ledgerSlugs", ledgerSlugs.join(","));
      if (slug.trim()) body.set("slug", slug.trim());

      const response = await fetch("/api/write/finance", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
        slug?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push(payload?.href ?? "/finance/claims");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Insurance
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 청구" : "청구 수정"}
      </p>
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        평소에는 Claims 목록에서 상태만 체크하면 됩니다. 여기 Write는 메모·금액
        조정이 필요할 때만 쓰면 됩니다. 사진·서류는 KB 앱에만 둬도 됩니다.
      </p>

      <div>
        <label className={labelClass} htmlFor="claim-title">
          Title
        </label>
        <input
          id="claim-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="피부과 · 사마귀 제거"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="claim-insurer">
            Insurer
          </label>
          <input
            id="claim-insurer"
            className={fieldClass}
            value={insurer}
            onChange={(event) => setInsurer(event.target.value)}
            list="claim-insurer-list"
          />
          <datalist id="claim-insurer-list">
            <option value={FINANCE_CLAIM_DEFAULT_INSURER} />
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor="claim-status">
            Status
          </label>
          <select
            id="claim-status"
            className={fieldClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as FinanceClaimStatus)
            }
          >
            {(Object.keys(FINANCE_CLAIM_STATUS_LABEL) as FinanceClaimStatus[]).map(
              (item) => (
                <option key={item} value={item}>
                  {FINANCE_CLAIM_STATUS_LABEL[item]}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="claim-care">
            Care date
          </label>
          <input
            id="claim-care"
            type="date"
            className={fieldClass}
            value={careDate}
            onChange={(event) => setCareDate(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="claim-filed">
            Filed at
          </label>
          <input
            id="claim-filed"
            type="date"
            className={fieldClass}
            value={filedAt}
            onChange={(event) => setFiledAt(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="claim-paid">
            Paid at
          </label>
          <input
            id="claim-paid"
            type="date"
            className={fieldClass}
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="claim-amount">
            Claim amount
          </label>
          <input
            id="claim-amount"
            className={fieldClass}
            value={claimAmount}
            onChange={(event) => setClaimAmount(event.target.value)}
            inputMode="decimal"
            placeholder="15100"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="claim-paid-amount">
            Paid amount
          </label>
          <input
            id="claim-paid-amount"
            className={fieldClass}
            value={paidAmount}
            onChange={(event) => setPaidAmount(event.target.value)}
            inputMode="decimal"
            placeholder="환급 후 입력"
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Medical expenses</p>
        <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
          Ledger 의료 지출에서 가져옵니다. 선택 합계{" "}
          <span className="tabular-nums text-[var(--color-muted)]">
            {formatWon(linkedSum)}
          </span>
        </p>
        {medicalEntries.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted-soft)]">
            연결할 의료 지출이 없습니다.
          </p>
        ) : (
          <ul className="mt-3 max-h-64 overflow-y-auto border-y border-[var(--color-border)]/70">
            {medicalEntries.slice(0, 80).map((item) => {
              const checked = ledgerSlugs.includes(item.slug);
              return (
                <li key={item.slug}>
                  <label className="flex cursor-pointer items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLedger(item.slug)}
                        className="translate-y-0.5"
                      />
                      <span className="min-w-0">
                        <span className="text-[var(--color-foreground)]">
                          {cleanLedgerTitle(item.title)}
                        </span>
                        <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                          {item.date}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--color-muted)]">
                      {formatWon(Math.abs(item.amount))}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="claim-note">
          Note
        </label>
        <textarea
          id="claim-note"
          className={cn(fieldClass, "min-h-[4.5rem] resize-y")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="#피부과 #사마귀"
        />
      </div>

      {mode === "existing" && slug ? (
        <div>
          <p className={labelClass}>Attachments</p>
          <div className="mt-3">
            <MediaFolderAttachments
              apiPath={`/api/finance/claims/${encodeURIComponent(slug)}/files`}
              emptyHint="선택. 보통은 KB 앱에만 두면 됩니다."
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted-soft)]">
          첨부는 저장(Save) 후 Edit에서 올릴 수 있습니다.
        </p>
      )}

      {error ? (
        <p className="text-sm text-[var(--color-muted)]">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-10 items-center px-4 text-[0.8125rem] tracking-wide",
            "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
            "text-[var(--color-background)] transition-opacity",
            "hover:opacity-80 disabled:opacity-50",
          )}
        >
          {pending ? "저장 중…" : "Save"}
        </button>
        <a
          href="/finance/claims"
          className="text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
        >
          ← Claims
        </a>
      </div>
    </form>
  );
}
