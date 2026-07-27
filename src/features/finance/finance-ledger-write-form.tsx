"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinanceLedgerWriteDraft } from "@/lib/write/finance-drafts";
import {
  FINANCE_LEDGER_TYPE_LABEL,
  type FinanceLedgerType,
} from "@/types/finance";

type FinanceLedgerWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinanceLedgerWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

/** 가이드 대분류 — datalist 제안 */
const CATEGORY_SUGGESTIONS = [
  "식비",
  "카페",
  "편의점",
  "생필품",
  "교통비",
  "주거",
  "통신비",
  "의료",
  "쇼핑",
  "여가",
  "자기개발",
  "데이트",
  "여행",
  "기부/후원",
  "보험",
  "기타",
  "급여",
  "용돈",
  "금융수입",
  "기타수입",
  "내계좌이체",
  "카드대금",
  "저축",
  "투자",
  "현금인출",
  "이체",
];

const SUBCATEGORY_HINTS =
  "식자재 · 생활용품 · 웹소설 · 게임 · 구독 · AI구독 · 배달 · 점심 · 저녁";

export function FinanceLedgerWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: FinanceLedgerWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [type, setType] = useState<FinanceLedgerType>(draft?.type ?? "expense");
  const [category, setCategory] = useState(draft?.category ?? "");
  const [subcategory, setSubcategory] = useState(draft?.subcategory ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [amount, setAmount] = useState(draft?.amount ?? "");
  const [date, setDate] = useState(draft?.date ?? "");
  const [time, setTime] = useState(draft?.time ?? "");
  const [payment, setPayment] = useState(draft?.payment ?? "");
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
        가계부 수정은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/ledger" className="underline underline-offset-4">
          Ledger에서 로그인
        </a>
      </p>
    );
  }

  if (mode === "existing" && !slug) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        수정할 항목을 찾을 수 없습니다.{" "}
        <a href="/finance/ledger" className="underline underline-offset-4">
          Ledger로 돌아가기
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "ledger");
      body.set("mode", mode);
      body.set("title", title);
      body.set("type", type);
      body.set("category", category);
      body.set("subcategory", subcategory);
      body.set("note", note);
      body.set("amount", amount);
      body.set("date", date);
      body.set("time", time);
      body.set("payment", payment);
      if (slug.trim()) body.set("slug", slug.trim());
      if (draft?.fingerprint) body.set("fingerprint", draft.fingerprint);

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

      router.push(payload?.href ?? "/finance/ledger");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Transactions
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 내역" : "내역 수정"}
      </p>
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        대분류·소분류·메모(#태그)만 고쳐도 됩니다. 식사·커피는{" "}
        <span className="text-[var(--color-muted)]">#혼자</span> /{" "}
        <span className="text-[var(--color-muted)]">#같이</span>, 생필품은 소분류{" "}
        <span className="text-[var(--color-muted)]">식자재</span> ·{" "}
        <span className="text-[var(--color-muted)]">생활용품</span>.
      </p>

      <div>
        <label className={labelClass} htmlFor="ledger-title">
          Title
        </label>
        <input
          id="ledger-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ledger-type">
            Type
          </label>
          <select
            id="ledger-type"
            className={fieldClass}
            value={type}
            onChange={(event) =>
              setType(event.target.value as FinanceLedgerType)
            }
          >
            {(Object.keys(FINANCE_LEDGER_TYPE_LABEL) as FinanceLedgerType[]).map(
              (item) => (
                <option key={item} value={item}>
                  {FINANCE_LEDGER_TYPE_LABEL[item]}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ledger-amount">
            Amount
          </label>
          <input
            id="ledger-amount"
            className={fieldClass}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            required
            placeholder="-24000"
          />
          <p className="mt-1.5 text-sm text-[var(--color-muted-soft)]">
            지출은 음수, 수입은 양수로 두는 편입니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ledger-category">
            Category
          </label>
          <input
            id="ledger-category"
            className={fieldClass}
            list="ledger-category-list"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
          <datalist id="ledger-category-list">
            {CATEGORY_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor="ledger-subcategory">
            Subcategory
          </label>
          <input
            id="ledger-subcategory"
            className={fieldClass}
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
            placeholder={SUBCATEGORY_HINTS}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="ledger-note">
          Note / Tags
        </label>
        <textarea
          id="ledger-note"
          className={cn(fieldClass, "min-h-[5.5rem] resize-y")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="#혼자 #아아 또는 #같이 #김대준"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ledger-date">
            Date
          </label>
          <input
            id="ledger-date"
            type="date"
            className={fieldClass}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ledger-time">
            Time
          </label>
          <input
            id="ledger-time"
            className={fieldClass}
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder="12:30"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ledger-payment">
            Payment
          </label>
          <input
            id="ledger-payment"
            className={fieldClass}
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
          />
        </div>
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
          href="/finance/ledger"
          className="text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
        >
          ← Ledger
        </a>
      </div>
    </form>
  );
}
