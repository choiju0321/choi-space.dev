"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  parseJobPostingPaste,
  postingBodyToBlocks,
} from "@/lib/career/parse-job-posting-paste";
import { cn } from "@/lib/utils/cn";
import type { CareerPostingBrief, CareerProcessStepStatus } from "@/types/career-hub";

const fieldClass = cn(
  "mt-1.5 w-full rounded-md px-2.5 py-2 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

type ProcessPostingPanelProps = {
  applicationSlug: string;
  stepSlug: string;
  status: CareerProcessStepStatus;
  company?: string;
  note?: string;
  date?: string;
  posting?: CareerPostingBrief;
};

export function ProcessPostingPanel({
  applicationSlug,
  stepSlug,
  status,
  company,
  note,
  date,
  posting,
}: ProcessPostingPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openEditor, setOpenEditor] = useState(!posting);
  const [openViewer, setOpenViewer] = useState(false);
  const [url, setUrl] = useState(posting?.url ?? "");
  const [pasteText, setPasteText] = useState(posting?.sourceText ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSave() {
    setError(null);
    setMessage(null);

    const trimmedPaste = pasteText.trim();
    const trimmedUrl = url.trim();
    if (!trimmedPaste && !trimmedUrl) {
      setError("URL 또는 공고 본문을 입력해 주세요.");
      return;
    }

    const { posting: parsed, filledKeys } = parseJobPostingPaste(trimmedPaste, {
      url: trimmedUrl || undefined,
    });

    if (!trimmedPaste && trimmedUrl) {
      parsed.url = trimmedUrl;
      parsed.sections = posting?.sections ?? [];
      parsed.title = posting?.title;
      parsed.sourceText = posting?.sourceText;
    }

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "process-step");
      body.set("application", applicationSlug);
      body.set("step", stepSlug);
      body.set("note", note ?? parsed.title ?? "");
      body.set("date", date ?? "");
      body.set("status", status);
      body.set("posting", JSON.stringify(parsed));

      const response = await fetch("/api/write/career", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      setMessage(
        filledKeys.length > 0
          ? `정리 완료 · ${filledKeys.length}개 항목`
          : "저장했습니다.",
      );
      setOpenEditor(false);
      router.refresh();
    });
  }

  const teaserMeta = posting
    ? [
        posting.role,
        posting.employmentType,
        posting.location,
        posting.deadline,
      ].filter(Boolean)
    : [];

  return (
    <div className="mt-5 space-y-5">
      {posting && !openEditor ? (
        <div className="border-y border-[var(--color-border)]/70 py-5">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            Job posting
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {posting.title ?? "정리된 채용공고"}
          </p>
          {teaserMeta.length > 0 ? (
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {teaserMeta.join(" · ")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
              {posting.sections.length}개 섹션 정리됨
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => setOpenViewer(true)}
              className="text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              공고 보기
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl(posting.url ?? "");
                setPasteText(posting.sourceText ?? "");
                setMessage(null);
                setError(null);
                setOpenEditor(true);
              }}
              className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              다시 정리
            </button>
            {posting.url ? (
              <a
                href={posting.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                원문 링크
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {openEditor ? (
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor={`posting-url-${stepSlug}`}>
              공고 URL
            </label>
            <input
              id={`posting-url-${stepSlug}`}
              className={fieldClass}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              inputMode="url"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`posting-paste-${stepSlug}`}>
              공고 본문 붙여넣기
            </label>
            <textarea
              id={`posting-paste-${stepSlug}`}
              className={cn(
                fieldClass,
                "min-h-40 font-[family-name:var(--font-body)]",
              )}
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder={
                "채용공고 페이지에서 본문을 복사해 붙여넣으세요.\n담당업무 · 자격요건 · 우대사항 제목이 있으면 섹션으로 나눕니다."
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={onSave}
              className={cn(
                "h-9 px-4 text-[0.8125rem] tracking-wide",
                "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
                "text-[var(--color-background)] transition-opacity",
                "hover:opacity-80 disabled:opacity-50",
              )}
            >
              {pending ? "정리 중…" : "정리해서 저장"}
            </button>
            {posting ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setOpenEditor(false);
                  setError(null);
                }}
                className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                취소
              </button>
            ) : null}
            {message ? (
              <p className="text-sm text-[var(--color-muted)]">{message}</p>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : !posting ? (
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setPasteText("");
            setMessage(null);
            setError(null);
            setOpenEditor(true);
          }}
          className="text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          공고 붙여넣기
        </button>
      ) : null}

      {posting ? (
        <Modal
          open={openViewer}
          onClose={() => setOpenViewer(false)}
          eyebrow="채용공고"
          title={company ? `${company}` : "정리된 공고"}
          description="붙여넣기한 원문을 섹션으로 정리한 보기입니다."
          className="max-w-2xl"
        >
          <JobPostingDocument posting={posting} company={company} />
        </Modal>
      ) : null}
    </div>
  );
}

function JobPostingDocument({
  posting,
  company,
}: {
  posting: CareerPostingBrief;
  company?: string;
}) {
  const facts = [
    { label: "회사", value: company },
    { label: "직무", value: posting.role },
    { label: "고용형태", value: posting.employmentType },
    { label: "근무지", value: posting.location },
    { label: "모집기간", value: posting.deadline },
  ].filter((item) => Boolean(item.value));

  return (
    <article className="pb-2">
      <div className="border-b border-[var(--color-border)]/80 pb-8">
        <p className="text-[0.7rem] font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Open role
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
          {posting.title ?? "채용공고"}
        </h3>
        {company ? (
          <p className="mt-3 text-base text-[var(--color-muted)]">{company}</p>
        ) : null}

        {facts.length > 0 ? (
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-[var(--color-foreground)]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="divide-y divide-[var(--color-border)]/70">
        {posting.sections.map((section) => (
          <section
            key={`${section.heading}-${section.body.slice(0, 24)}`}
            className="py-8"
          >
            <h4 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)]">
              {section.heading}
            </h4>
            <div className="mt-4 space-y-4">
              {postingBodyToBlocks(section.body).map((block, index) => {
                if (block.type === "ul") {
                  return (
                    <ul
                      key={`ul-${index}`}
                      className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-muted)]"
                    >
                      {block.items.map((item) => (
                        <li key={item} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === "kv") {
                  return (
                    <p
                      key={`kv-${index}`}
                      className="text-sm leading-7 text-[var(--color-muted)]"
                    >
                      <span className="text-[var(--color-foreground)]">
                        {block.label}
                      </span>
                      <span className="text-[var(--color-muted-soft)]"> · </span>
                      {block.value}
                    </p>
                  );
                }
                return (
                  <p
                    key={`p-${index}`}
                    className="text-sm leading-7 text-[var(--color-muted)]"
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {posting.url ? (
        <div className="border-t border-[var(--color-border)]/80 pt-6">
          <a
            href={posting.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            원문 채용공고 열기 →
          </a>
        </div>
      ) : null}
    </article>
  );
}
