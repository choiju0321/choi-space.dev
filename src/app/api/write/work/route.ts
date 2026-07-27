import { NextResponse } from "next/server";
import {
  getWorkCompanyBySlug,
  getWorkEtcItem,
  getWorkProject,
  getWorkSeason,
} from "@/lib/content/get-work";
import { hasWriteSession } from "@/lib/write/auth";
import {
  slugifyPart,
  upsertWorkEtcItem,
  upsertWorkProject,
  upsertWorkSeason,
} from "@/lib/write/storage";
import type {
  WorkEtcItem,
  WorkProject,
  WorkProjectMilestone,
  WorkSeason,
} from "@/types/work";

export const dynamic = "force-dynamic";

type WorkWriteKind = "project" | "season" | "etc";

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** progress: `기간 | 제목 | 메모` 한 줄씩 */
function parseProgress(raw: string): WorkProjectMilestone[] {
  return lines(raw).map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    return {
      period: parts[0] || "",
      title: parts[1] || parts[0] || "",
      note: parts[2] || undefined,
    };
  });
}

function asKind(value: string): WorkWriteKind {
  if (value === "season" || value === "etc") return value;
  return "project";
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
  const companySlug = String(form.get("company") ?? "").trim();
  const mode = String(form.get("mode") ?? "existing");
  const kind = asKind(String(form.get("kind") ?? "project"));
  const company = getWorkCompanyBySlug(companySlug);
  if (!company) {
    return NextResponse.json({ error: "회사를 찾을 수 없습니다." }, { status: 404 });
  }

  const title = String(form.get("title") ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
  }

  const requestedSlug = String(form.get("slug") ?? "").trim();
  const href = `/work/${encodeURIComponent(companySlug)}`;

  try {
    if (kind === "season") {
      const resolved = resolveSlug(mode, requestedSlug, title, (slug) =>
        Boolean(getWorkSeason(companySlug, slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing"
          ? getWorkSeason(companySlug, resolved.slug)?.season
          : undefined;
      const period = String(form.get("period") ?? "").trim();
      const focus = String(form.get("focus") ?? "").trim();
      if (!period) {
        return NextResponse.json({ error: "기간이 필요합니다." }, { status: 400 });
      }
      if (!focus) {
        return NextResponse.json({ error: "포커스가 필요합니다." }, { status: 400 });
      }

      const projectSlugs = lines(String(form.get("projectSlugs") ?? ""));
      const season: WorkSeason = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        title,
        period,
        focus,
        projectSlugs: projectSlugs.length > 0 ? projectSlugs : undefined,
        attachments: existing?.attachments,
      };

      await upsertWorkSeason(companySlug, season);
      return NextResponse.json({
        ok: true,
        company: companySlug,
        kind,
        slug: season.slug,
        href,
      });
    }

    if (kind === "etc") {
      const resolved = resolveSlug(mode, requestedSlug, title, (slug) =>
        Boolean(getWorkEtcItem(companySlug, slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing"
          ? getWorkEtcItem(companySlug, resolved.slug)?.item
          : undefined;
      const summary = String(form.get("summary") ?? "").trim();
      if (!summary) {
        return NextResponse.json({ error: "요약이 필요합니다." }, { status: 400 });
      }

      const period = String(form.get("period") ?? "").trim() || undefined;
      const item: WorkEtcItem = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        title,
        period,
        summary,
        attachments: existing?.attachments,
      };

      await upsertWorkEtcItem(companySlug, item);
      return NextResponse.json({
        ok: true,
        company: companySlug,
        kind,
        slug: item.slug,
        href,
      });
    }

    const resolved = resolveSlug(mode, requestedSlug, title, (slug) =>
      Boolean(getWorkProject(companySlug, slug)),
    );
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const existing =
      mode === "existing"
        ? getWorkProject(companySlug, resolved.slug)?.project
        : undefined;

    const period = String(form.get("period") ?? "").trim() || undefined;
    const role = String(form.get("role") ?? "").trim() || undefined;
    const summary = String(form.get("summary") ?? "").trim();
    if (!summary) {
      return NextResponse.json({ error: "요약이 필요합니다." }, { status: 400 });
    }

    const progress = parseProgress(String(form.get("progress") ?? ""));
    const outcomes = lines(String(form.get("outcomes") ?? ""));
    const competencies = lines(String(form.get("competencies") ?? ""));
    const sourceNotes = lines(String(form.get("sourceNotes") ?? ""));
    const seasonRefs = lines(String(form.get("seasonRefs") ?? ""));

    const project: WorkProject = {
      id: existing?.id ?? resolved.slug,
      slug: resolved.slug,
      title,
      period,
      role,
      summary,
      progress,
      outcomes,
      competencies: competencies.length > 0 ? competencies : undefined,
      seasonRefs: seasonRefs.length > 0 ? seasonRefs : undefined,
      sourceNotes: sourceNotes.length > 0 ? sourceNotes : undefined,
      attachments: existing?.attachments,
    };

    await upsertWorkProject(companySlug, project);
    return NextResponse.json({
      ok: true,
      company: companySlug,
      kind: "project",
      slug: project.slug,
      href,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
