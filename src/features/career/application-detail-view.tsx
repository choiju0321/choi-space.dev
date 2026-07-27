"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { ProcessStepRow } from "@/features/career/process-step-row";
import {
  getApplicationCurrentStep,
  getApplicationStatusLabel,
} from "@/content/career/process";
import { buildCareerWriteHref } from "@/lib/write/href";
import type { CareerApplication } from "@/types/career-hub";

type ApplicationDetailViewProps = {
  application: CareerApplication;
};

export function ApplicationDetailView({
  application,
}: ApplicationDetailViewProps) {
  const statusLabel = getApplicationStatusLabel(application);
  const current = getApplicationCurrentStep(application.process);
  const editHref = buildCareerWriteHref({
    kind: "application",
    slug: application.slug,
  });

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Career", href: "/career" },
            { label: "Applications", href: "/career/applications" },
            { label: application.company },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Application
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              {application.company}
            </h1>
            <p className="mt-3 text-base text-[var(--color-muted)]">
              {application.role}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span className="text-[var(--color-foreground)]">
                {statusLabel}
              </span>
              {current && current.status !== "fail" ? (
                <span className="text-[var(--color-muted-soft)]">
                  현재 · {current.title}
                </span>
              ) : null}
              {application.period ? (
                <span className="tabular-nums text-[var(--color-muted-soft)]">
                  {application.period}
                </span>
              ) : null}
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
              {application.summary}
            </p>
          </div>
          <AdminActionLink href={editHref} className="shrink-0">
            Edit
          </AdminActionLink>
        </div>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-14">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Process
        </p>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          채용공고 → 지원서류 → 서류전형 → 면접(n차) → 최종. 단계별 note · date ·
          status는 인라인으로 고칠 수 있습니다.
        </p>
        {application.process.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--color-muted-soft)]">
            프로세스가 아직 없습니다.
          </p>
        ) : (
          <ul className="mt-6 border-b border-[var(--color-border)]/70">
            {application.process.map((step, index) => (
              <ProcessStepRow
                key={step.id}
                applicationSlug={application.slug}
                step={step}
                index={index}
              />
            ))}
          </ul>
        )}
      </FadeIn>

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link
          href="/career/applications"
          className="transition-opacity hover:opacity-70"
        >
          ← Applications
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link href="/career/masters" className="transition-opacity hover:opacity-70">
          Masters
        </Link>
      </p>
    </div>
  );
}
