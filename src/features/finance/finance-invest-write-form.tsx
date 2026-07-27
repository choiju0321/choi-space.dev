"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinanceInvestWriteDraft } from "@/lib/write/finance-drafts";
import {
  FINANCE_INVEST_ACCOUNT_KIND_LABEL,
  type FinanceInvestAccountKind,
} from "@/types/finance";

type FinanceInvestWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinanceInvestWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

const ACCOUNT_NAME_SUGGESTIONS = [
  "토스증권",
  "키움증권",
  "한국투자증권",
  "IRP",
  "DC",
  "퇴직연금",
  "ISA",
];

export function FinanceInvestWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: FinanceInvestWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [asOf, setAsOf] = useState(
    draft?.asOf ?? new Date().toISOString().slice(0, 10),
  );
  const [accountKind, setAccountKind] = useState<FinanceInvestAccountKind>(
    draft?.accountKind ?? "stock",
  );
  const [accountName, setAccountName] = useState(draft?.accountName ?? "");
  const [institution, setInstitution] = useState(draft?.institution ?? "");
  const [valuation, setValuation] = useState(draft?.valuation ?? "");
  const [costBasis, setCostBasis] = useState(draft?.costBasis ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug] = useState(draft?.slug ?? "");

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
        투자 스냅샷은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/invest" className="underline underline-offset-4">
          Invest에서 로그인
        </a>
      </p>
    );
  }

  if (mode === "existing" && !slug) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        수정할 스냅샷을 찾을 수 없습니다.{" "}
        <a href="/finance/invest" className="underline underline-offset-4">
          Invest로 돌아가기
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "invest");
      body.set("mode", mode);
      body.set("asOf", asOf);
      body.set("accountKind", accountKind);
      body.set("accountName", accountName);
      body.set("institution", institution);
      body.set("valuation", valuation);
      body.set("costBasis", costBasis);
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

      router.push(payload?.href ?? "/finance/invest");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Investments
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 스냅샷" : "스냅샷 수정"}
      </p>
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        월말에 증권·연금 앱 잔고를 그대로 옮기면 됩니다. 매매 장부가 아니라{" "}
        <span className="text-[var(--color-muted)]">그날의 평가액 사진</span>
        입니다.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="invest-asof">
            As of
          </label>
          <input
            id="invest-asof"
            type="date"
            className={fieldClass}
            value={asOf}
            onChange={(event) => setAsOf(event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="invest-kind">
            Kind
          </label>
          <select
            id="invest-kind"
            className={fieldClass}
            value={accountKind}
            onChange={(event) =>
              setAccountKind(event.target.value as FinanceInvestAccountKind)
            }
          >
            {(
              Object.keys(
                FINANCE_INVEST_ACCOUNT_KIND_LABEL,
              ) as FinanceInvestAccountKind[]
            ).map((item) => (
              <option key={item} value={item}>
                {FINANCE_INVEST_ACCOUNT_KIND_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="invest-account">
            Account
          </label>
          <input
            id="invest-account"
            className={fieldClass}
            list="invest-account-list"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            required
            placeholder="토스증권 · IRP"
          />
          <datalist id="invest-account-list">
            {ACCOUNT_NAME_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor="invest-institution">
            Institution
          </label>
          <input
            id="invest-institution"
            className={fieldClass}
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
            placeholder="선택 · 운용사·증권사"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="invest-valuation">
            Valuation
          </label>
          <input
            id="invest-valuation"
            className={fieldClass}
            value={valuation}
            onChange={(event) => setValuation(event.target.value)}
            inputMode="decimal"
            required
            placeholder="12500000"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="invest-cost">
            Cost basis
          </label>
          <input
            id="invest-cost"
            className={fieldClass}
            value={costBasis}
            onChange={(event) => setCostBasis(event.target.value)}
            inputMode="decimal"
            placeholder="선택 · 원금"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="invest-note">
          Note
        </label>
        <textarea
          id="invest-note"
          className={cn(fieldClass, "min-h-[5rem] resize-y")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="#SK하이닉스 비중 메모 등"
        />
      </div>

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
          href="/finance/invest"
          className="text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
        >
          ← Invest
        </a>
      </div>
    </form>
  );
}
