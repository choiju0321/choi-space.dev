import { NextResponse } from "next/server";
import { getCultureEntryBySlug } from "@/lib/content/get-culture";
import { getReadingEntryBySlug } from "@/lib/content/get-reading";
import { getRunningEntryBySlug } from "@/lib/content/get-running";
import { getPlaceEntryBySlug } from "@/lib/content/get-place";
import { hasWriteSession } from "@/lib/write/auth";
import {
  buildDatedSlug,
  savePhotos,
  saveReviewMarkdown,
  upsertCultureEntry,
  upsertPlaceEntry,
  upsertRunningSession,
} from "@/lib/write/storage";
import type { CultureEntry, CultureKind } from "@/types/culture";
import type { RunningEntry } from "@/types/running";
import type { PlaceDomain, PlaceEntry, WriteCategory } from "@/types/place";

const CATEGORIES: WriteCategory[] = [
  "reading",
  "running",
  "culture",
  "food",
  "cafe",
  "travel",
];

function isCategory(value: string): value is WriteCategory {
  return (CATEGORIES as string[]).includes(value);
}

function isPlaceDomain(value: WriteCategory): value is PlaceDomain {
  return value === "food" || value === "cafe" || value === "travel";
}

export async function POST(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await request.formData();
  const categoryRaw = String(form.get("category") ?? "");
  if (!isCategory(categoryRaw)) {
    return NextResponse.json({ error: "카테고리가 올바르지 않습니다." }, { status: 400 });
  }
  const category = categoryRaw;

  const body = String(form.get("body") ?? "").trim();
  const mode = String(form.get("mode") ?? "existing");
  const photos = form
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  try {
    if (category === "reading") {
      const slug = String(form.get("slug") ?? "").trim();
      if (!slug || !getReadingEntryBySlug(slug)) {
        return NextResponse.json(
          { error: "독서 기록을 선택하세요." },
          { status: 400 },
        );
      }
      if (!body) {
        return NextResponse.json(
          { error: "독후감 본문이 필요합니다." },
          { status: 400 },
        );
      }
      await saveReviewMarkdown("reading", slug, body);
      return NextResponse.json({
        ok: true,
        slug,
        href: `/life/reading/${slug}`,
      });
    }

    if (category === "running") {
      if (mode === "new") {
        const ranOn = String(form.get("ranOn") ?? "").trim();
        const title = String(form.get("title") ?? "").trim() || "러닝";
        const distanceKm = Number(form.get("distanceKm") ?? 0);
        const place = String(form.get("place") ?? "").trim() || undefined;
        const excerpt =
          String(form.get("excerpt") ?? "").trim() ||
          body.slice(0, 80) ||
          "일상 러닝 기록.";

        if (!ranOn || !Number.isFinite(distanceKm) || distanceKm <= 0) {
          return NextResponse.json(
            { error: "날짜와 거리를 입력하세요." },
            { status: 400 },
          );
        }

        const slug = buildDatedSlug(ranOn, title);
        const entry: RunningEntry = {
          id: `session-${slug}`,
          slug,
          kind: "session",
          title,
          ranOn,
          distanceKm,
          place,
          excerpt,
          tags: ["일상", `${distanceKm}km`],
          source: "manual",
          artifacts: [],
        };
        await upsertRunningSession(entry);
        if (body) await saveReviewMarkdown("running", slug, body);
        await savePhotos("running", slug, photos);
        return NextResponse.json({
          ok: true,
          slug,
          href: `/life/running/${slug}`,
        });
      }

      const slug = String(form.get("slug") ?? "").trim();
      if (!slug || !getRunningEntryBySlug(slug)) {
        return NextResponse.json(
          { error: "러닝 기록을 선택하세요." },
          { status: 400 },
        );
      }
      if (body) await saveReviewMarkdown("running", slug, body);
      await savePhotos("running", slug, photos);
      return NextResponse.json({
        ok: true,
        slug,
        href: `/life/running/${slug}`,
      });
    }

    if (category === "culture") {
      if (mode === "new") {
        const title = String(form.get("title") ?? "").trim();
        const watchedOn = String(form.get("watchedOn") ?? "").trim();
        const watchedAt = String(form.get("watchedAt") ?? "").trim() || undefined;
        const place = String(form.get("place") ?? "").trim();
        const kind = (String(form.get("kind") ?? "musical") ||
          "musical") as CultureKind;
        const excerpt =
          String(form.get("excerpt") ?? "").trim() ||
          body.slice(0, 80) ||
          `${title} 관람 기록.`;

        if (!title || !watchedOn || !place) {
          return NextResponse.json(
            { error: "작품명, 날짜, 장소를 입력하세요." },
            { status: 400 },
          );
        }

        const slug = buildDatedSlug(watchedOn, title);
        const entry: CultureEntry = {
          id: `culture-${slug}`,
          slug,
          kind,
          title,
          watchedOn,
          watchedAt,
          place,
          excerpt,
          tags: [kind === "musical" ? "뮤지컬" : kind],
          source: "manual",
        };
        await upsertCultureEntry(entry);
        if (body) await saveReviewMarkdown("culture", slug, body);
        await savePhotos("culture", slug, photos);
        return NextResponse.json({
          ok: true,
          slug,
          href: `/life/culture/${slug}`,
        });
      }

      const slug = String(form.get("slug") ?? "").trim();
      if (!slug || !getCultureEntryBySlug(slug)) {
        return NextResponse.json(
          { error: "관람 기록을 선택하세요." },
          { status: 400 },
        );
      }
      if (body) await saveReviewMarkdown("culture", slug, body);
      await savePhotos("culture", slug, photos);
      return NextResponse.json({
        ok: true,
        slug,
        href: `/life/culture/${slug}`,
      });
    }

    if (isPlaceDomain(category)) {
      const title = String(form.get("title") ?? "").trim();
      const place = String(form.get("place") ?? "").trim();
      const visitedOn = String(form.get("visitedOn") ?? "").trim();
      const visitedUntil =
        String(form.get("visitedUntil") ?? "").trim() || undefined;
      const excerpt =
        String(form.get("excerpt") ?? "").trim() ||
        body.slice(0, 80) ||
        `${title} 기록.`;

      if (!title || !place || !visitedOn) {
        return NextResponse.json(
          { error: "제목, 장소, 날짜를 입력하세요." },
          { status: 400 },
        );
      }

      let slug = String(form.get("slug") ?? "").trim();
      if (!slug) slug = buildDatedSlug(visitedOn, title);

      const existing = getPlaceEntryBySlug(category, slug);
      const entry: PlaceEntry = {
        id: existing?.id ?? `${category}-${slug}`,
        slug,
        title,
        place,
        visitedOn,
        visitedUntil,
        excerpt,
        tags: existing?.tags ?? [
          category === "food" ? "맛집" : category === "cafe" ? "카페" : "여행",
        ],
      };

      await upsertPlaceEntry(category, entry);
      if (body) await saveReviewMarkdown(category, slug, body);
      await savePhotos(category, slug, photos);
      return NextResponse.json({
        ok: true,
        slug,
        href: `/life/${category}/${slug}`,
      });
    }

    return NextResponse.json({ error: "지원하지 않는 카테고리입니다." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
