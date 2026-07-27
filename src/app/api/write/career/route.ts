import { NextResponse } from "next/server";
import {
  getCareerRecord,
  isDocumentCollection,
} from "@/lib/content/get-career";
import {
  getCareerApplication,
  getCareerLanguageItem,
  getCareerMaster,
} from "@/lib/content/get-career-hub";
import { hasWriteSession } from "@/lib/write/auth";
import {
  parseFailAt,
  rebuildApplicationProcess,
} from "@/lib/write/career-drafts";
import {
  slugifyPart,
  updateProfileContact,
  upsertCareerApplication,
  upsertCareerBasics,
  upsertCareerCredential,
  upsertCareerLanguage,
  upsertCareerMaster,
} from "@/lib/write/storage";
import type {
  CareerApplication,
  CareerApplicationOutcome,
  CareerLanguageItem,
  CareerPackageItem,
  CareerProcessStepStatus,
} from "@/types/career-hub";
import type { CareerRecord } from "@/types/content";
import type { DocumentFormId } from "@/content/document-forms";
import { documentForms } from "@/content/document-forms";

export const dynamic = "force-dynamic";

type CareerWriteKind =
  | "application"
  | "master"
  | "language"
  | "process-step"
  | "credential"
  | "basics";

const OUTCOMES: CareerApplicationOutcome[] = [
  "offer",
  "pass",
  "fail",
  "submitted",
  "preparing",
  "withdrawn",
];

const STEP_STATUSES: CareerProcessStepStatus[] = [
  "pending",
  "in_progress",
  "done",
  "pass",
  "fail",
  "skipped",
];

function asKind(value: string): CareerWriteKind {
  if (
    value === "master" ||
    value === "language" ||
    value === "process-step" ||
    value === "credential" ||
    value === "basics"
  ) {
    return value;
  }
  return "application";
}

function asOutcome(value: string): CareerApplicationOutcome | null {
  return OUTCOMES.includes(value as CareerApplicationOutcome)
    ? (value as CareerApplicationOutcome)
    : null;
}

function asStepStatus(value: string): CareerProcessStepStatus | null {
  return STEP_STATUSES.includes(value as CareerProcessStepStatus)
    ? (value as CareerProcessStepStatus)
    : null;
}

function asDocumentFormId(value: string): DocumentFormId | undefined {
  if (!value) return undefined;
  return value in documentForms ? (value as DocumentFormId) : undefined;
}

function resolveSlug(
  mode: string,
  requestedSlug: string,
  title: string,
  exists: (slug: string) => boolean,
) {
  let slug = requestedSlug || slugifyPart(title);
  if (!slug) return { error: "슬러그를 만들 수 없습니다." as const };

  if (mode === "new") {
    if (exists(slug)) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }
  } else if (!exists(slug)) {
    return { error: "수정할 항목을 찾을 수 없습니다." as const };
  }

  return { slug };
}

export async function POST(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await request.formData();
  const mode = String(form.get("mode") ?? "existing");
  const kind = asKind(String(form.get("kind") ?? "application"));

  try {
    if (kind === "basics") {
      const name = String(form.get("name") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const birthDate = String(form.get("birthDate") ?? "").trim();
      const location = String(form.get("location") ?? "").trim();
      if (!name || !email || !birthDate || !location) {
        return NextResponse.json(
          { error: "이름·이메일·생년월일·거주지가 필요합니다." },
          { status: 400 },
        );
      }

      await upsertCareerBasics({ birthDate, location });
      await updateProfileContact({ name, email, location });
      return NextResponse.json({
        ok: true,
        kind,
        href: "/career/basics",
      });
    }

    if (kind === "credential") {
      const collectionRaw = String(form.get("collection") ?? "").trim();
      if (!isDocumentCollection(collectionRaw)) {
        return NextResponse.json(
          { error: "컬렉션이 올바르지 않습니다." },
          { status: 400 },
        );
      }

      const title = String(form.get("title") ?? "").trim();
      const organization = String(form.get("organization") ?? "").trim();
      const period = String(form.get("period") ?? "").trim();
      if (!title || !organization || !period) {
        return NextResponse.json(
          { error: "제목·기관·기간이 필요합니다." },
          { status: 400 },
        );
      }

      const requestedId = String(form.get("id") ?? "").trim();
      const resolved = resolveSlug(mode, requestedId, title, (id) =>
        Boolean(getCareerRecord(collectionRaw, id)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing"
          ? getCareerRecord(collectionRaw, resolved.slug)
          : undefined;
      const description =
        String(form.get("description") ?? "").trim() || undefined;
      const formIdRaw = String(form.get("documentFormId") ?? "").trim();
      let documentFormId: DocumentFormId | undefined;
      if (formIdRaw) {
        const parsed = asDocumentFormId(formIdRaw);
        if (!parsed) {
          return NextResponse.json(
            { error: "서류 양식이 올바르지 않습니다." },
            { status: 400 },
          );
        }
        documentFormId = parsed;
      }

      const record: CareerRecord = {
        id: existing?.id ?? resolved.slug,
        title,
        organization,
        period,
        description,
        documentFormId,
      };

      await upsertCareerCredential(collectionRaw, record);
      return NextResponse.json({
        ok: true,
        kind,
        collection: collectionRaw,
        slug: record.id,
        href: "/career/basics",
      });
    }

    if (kind === "process-step") {
      const applicationSlug = String(form.get("application") ?? "").trim();
      const stepSlug = String(form.get("step") ?? "").trim();
      const application = getCareerApplication(applicationSlug);
      if (!application) {
        return NextResponse.json(
          { error: "지원 건을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const stepIndex = application.process.findIndex(
        (item) => item.slug === stepSlug,
      );
      if (stepIndex < 0) {
        return NextResponse.json(
          { error: "프로세스 단계를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const note = String(form.get("note") ?? "").trim() || undefined;
      const date = String(form.get("date") ?? "").trim() || undefined;
      const statusRaw = String(form.get("status") ?? "").trim();
      const status = statusRaw
        ? asStepStatus(statusRaw)
        : application.process[stepIndex].status;
      if (!status) {
        return NextResponse.json(
          { error: "단계 상태가 올바르지 않습니다." },
          { status: 400 },
        );
      }

      const process = application.process.map((step, index) =>
        index === stepIndex
          ? {
              ...step,
              note,
              date,
              status,
            }
          : step,
      );

      const next: CareerApplication = { ...application, process };
      await upsertCareerApplication(next);
      return NextResponse.json({
        ok: true,
        kind,
        slug: application.slug,
        step: stepSlug,
        href: `/career/applications/${encodeURIComponent(application.slug)}`,
      });
    }

    if (kind === "language") {
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
      }

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const resolved = resolveSlug(mode, requestedSlug, title, (slug) =>
        Boolean(getCareerLanguageItem(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing"
          ? getCareerLanguageItem(resolved.slug)
          : undefined;
      const summary = String(form.get("summary") ?? "").trim();
      if (!summary) {
        return NextResponse.json({ error: "요약이 필요합니다." }, { status: 400 });
      }

      const period = String(form.get("period") ?? "").trim() || undefined;
      const score = String(form.get("score") ?? "").trim() || undefined;
      const item: CareerLanguageItem = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        title,
        period,
        score,
        summary,
        attachments: existing?.attachments,
      };

      await upsertCareerLanguage(item);
      return NextResponse.json({
        ok: true,
        kind,
        slug: item.slug,
        href: "/career/basics",
      });
    }

    if (kind === "master") {
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
      }

      const masterKindRaw = String(form.get("masterKind") ?? "resume").trim();
      const masterKind =
        masterKindRaw === "portfolio" ? "portfolio" : "resume";

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const resolved = resolveSlug(mode, requestedSlug, title, (slug) =>
        Boolean(getCareerMaster(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing" ? getCareerMaster(resolved.slug) : undefined;
      const summary = String(form.get("summary") ?? "").trim();
      if (!summary) {
        return NextResponse.json({ error: "요약이 필요합니다." }, { status: 400 });
      }

      const period = String(form.get("period") ?? "").trim() || undefined;
      const item: CareerPackageItem = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        kind: masterKind,
        title,
        period,
        summary,
        attachments: existing?.attachments,
      };

      await upsertCareerMaster(item);
      return NextResponse.json({
        ok: true,
        kind,
        slug: item.slug,
        href: "/career/masters",
      });
    }

    const company = String(form.get("company") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();
    if (!company) {
      return NextResponse.json({ error: "회사명이 필요합니다." }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "직무가 필요합니다." }, { status: 400 });
    }

    const outcomeRaw = String(form.get("outcome") ?? "preparing").trim();
    const outcome = asOutcome(outcomeRaw);
    if (!outcome) {
      return NextResponse.json({ error: "결과가 올바르지 않습니다." }, { status: 400 });
    }

    const summary = String(form.get("summary") ?? "").trim();
    if (!summary) {
      return NextResponse.json({ error: "요약이 필요합니다." }, { status: 400 });
    }

    const season =
      String(form.get("season") ?? "").trim() ||
      String(form.get("period") ?? "").trim().slice(0, 4) ||
      String(new Date().getFullYear());

    const requestedSlug = String(form.get("slug") ?? "").trim();
    const slugSeed = requestedSlug || `${company}-${season}`;
    const resolved = resolveSlug(mode, requestedSlug, slugSeed, (slug) =>
      Boolean(getCareerApplication(slug)),
    );
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const existing =
      mode === "existing"
        ? getCareerApplication(resolved.slug)
        : undefined;

    const period = String(form.get("period") ?? "").trim() || undefined;
    const failAt = parseFailAt(String(form.get("failAt") ?? "screening"));
    const roundsRaw = String(form.get("interviewRounds") ?? "").trim();
    const interviewRounds = roundsRaw
      ? Math.max(0, Number.parseInt(roundsRaw, 10) || 0)
      : outcome === "fail" && typeof failAt === "number"
        ? failAt
        : outcome === "preparing"
          ? 0
          : 2;

    const process = rebuildApplicationProcess(outcome, {
      prefix: resolved.slug,
      failAt,
      interviewRounds,
      previous: existing?.process,
    });

    const application: CareerApplication = {
      id: existing?.id ?? resolved.slug,
      slug: resolved.slug,
      company,
      role,
      outcome,
      season,
      period,
      summary,
      process,
      attachments: existing?.attachments,
    };

    await upsertCareerApplication(application);
    return NextResponse.json({
      ok: true,
      kind: "application",
      slug: application.slug,
      href: `/career/applications/${encodeURIComponent(application.slug)}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
