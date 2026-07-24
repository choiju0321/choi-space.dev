"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import {
  getHealthDocumentKindLabel,
  getHealthFindingFlagLabel,
} from "@/lib/health/labels";
import type { HealthCheckup, HealthDocument } from "@/types/health";

type SyncedMap = Record<string, boolean>;

type HealthCheckupDetailProps = {
  checkup: HealthCheckup;
  synced: SyncedMap;
};

export function HealthCheckupDetail({
  checkup,
  synced,
}: HealthCheckupDetailProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const displayDate = checkup.checkedOn.replaceAll("-", ".");
  const placeLine = [checkup.provider, checkup.place]
    .filter(Boolean)
    .join(" · ");

  const notable = checkup.findings.filter(
    (finding) => finding.flag === "abnormal" || finding.flag === "followup",
  );

  function onLogout() {
    startTransition(async () => {
      await fetch("/api/write/logout", { method: "POST" });
      router.push("/health");
      router.refresh();
    });
  }

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/health" className="transition-opacity hover:opacity-70">
            Health
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {displayDate}
        </p>

        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Checkup
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              {checkup.packageName ?? "건강검진"}
            </h1>
            <p className="mt-3 text-base text-[var(--color-muted)]">
              {displayDate}
              <span className="mx-2 text-[var(--color-muted-soft)]">·</span>
              {placeLine}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={pending}
            className="text-sm text-[var(--color-muted)] underline-offset-4 hover:underline disabled:opacity-60"
          >
            잠금
          </button>
        </header>

        {checkup.passwordHint ? (
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            암호 PDF — 힌트: {checkup.passwordHint} (비밀번호는 저장하지
            않습니다)
          </p>
        ) : null}

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            원본 서류
          </h2>
          <ul className="mt-4 space-y-3">
            {checkup.documents.map((document) => (
              <DocumentRow
                key={document.id}
                slug={checkup.slug}
                document={document}
                available={Boolean(synced[document.privateFileName])}
              />
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            이상소견 · 요약
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            `findings`는 PDF 종합소견·결과통보서에서 채웠습니다. 참고용이며 의료
            자문이 아닙니다.
          </p>

          {checkup.panels.length > 0 ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              검사 영역: {checkup.panels.join(" · ")}
            </p>
          ) : null}

          {checkup.findings.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--color-muted)]">
              등록된 소견이 없습니다.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-[var(--color-border)]/70">
              {checkup.findings.map((finding) => (
                <li key={finding.id} className="py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium text-[var(--color-foreground)]">
                      {finding.name}
                    </span>
                    <span className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
                      {getHealthFindingFlagLabel(finding.flag)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {[
                      finding.value
                        ? `${finding.value}${finding.unit ? ` ${finding.unit}` : ""}`
                        : null,
                      finding.panel,
                      finding.note,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {notable.length > 0 ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              이상·추적 {notable.length}건 (참고용 · 의료 자문 아님)
            </p>
          ) : null}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            AI 해석
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            PDF에서 추출한 종합소견을 바탕으로 참고용으로 정리했습니다. 의료
            자문이 아니며, 스캔본은 텍스트 추출이 제한될 수 있습니다.
          </p>

          {checkup.aiSummary ? (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--color-foreground)]">
              {checkup.aiSummary}
            </p>
          ) : (
            <p className="mt-6 text-sm text-[var(--color-muted)]">
              아직 AI 요약이 없습니다.
            </p>
          )}

          <button
            type="button"
            disabled
            title="다음 이슈에서 연결 예정"
            className={cn(
              "mt-6 h-11 rounded-md px-5 text-sm font-medium",
              "bg-[var(--color-foreground)]/20 text-[var(--color-muted)]",
              "cursor-not-allowed",
            )}
          >
            이 검진 해석 (준비 중)
          </button>
        </section>
      </div>
    </div>
  );
}

function DocumentRow({
  slug,
  document,
  available,
}: {
  slug: string;
  document: HealthDocument;
  available: boolean;
}) {
  const label = getHealthDocumentKindLabel(document.kind);

  if (!available) {
    return (
      <li className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[var(--color-foreground)]">{label}</span>
        <span className="text-[var(--color-muted)]">
          미동기화 — `npm run sync:health`
        </span>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[var(--color-foreground)]">{label}</span>
      <a
        href={`/api/health/documents/${encodeURIComponent(slug)}/${encodeURIComponent(document.privateFileName)}`}
        className="text-[var(--color-accent)] underline-offset-4 hover:underline"
      >
        다운로드
      </a>
    </li>
  );
}
