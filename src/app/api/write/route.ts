import { NextResponse } from "next/server";
import { getCultureEntryBySlug } from "@/lib/content/get-culture";
import { getPostBySlug } from "@/lib/content/get-posts";
import { getReadingEntryBySlug } from "@/lib/content/get-reading";
import { getRunningEntryBySlug } from "@/lib/content/get-running";
import { getPlaceEntryBySlug } from "@/lib/content/get-place";
import { hasWriteSession } from "@/lib/write/auth";
import {
  allocateUniqueSlug,
  buildSafeDatedSlug,
  normalizeMarkdownBody,
  publicContentHref,
  sanitizePublicSlug,
} from "@/lib/write/entry-guards";
import {
  savePhotos,
  saveReviewMarkdown,
  upsertCultureEntry,
  upsertPlaceEntry,
  upsertPost,
  upsertReadingEntry,
  upsertRunningSession,
} from "@/lib/write/storage";
import { readingClubs } from "@/content/reading/clubs";
import type { CultureEntry, CultureKind } from "@/types/culture";
import type { RunningEntry } from "@/types/running";
import type {
  ReadingEntry,
  ReadingParticipation,
} from "@/types/reading";
import type { PlaceDomain, PlaceEntry, WriteCategory } from "@/types/place";
import type { ContentSpace, Post } from "@/types/post";
import { contentTypeForCategory } from "@/types/post";
import { GROWTH_NAV, NOTES_NAV } from "@/content/nav";

const CATEGORIES: WriteCategory[] = [
  "reading",
  "running",
  "culture",
  "food",
  "travel",
  "daily",
  "growth",
  "notes",
];

function isCategory(value: string): value is WriteCategory {
  return (CATEGORIES as string[]).includes(value);
}

function isPlaceDomain(value: WriteCategory): value is PlaceDomain {
  return value === "food" || value === "travel";
}

function isJournal(value: WriteCategory): value is "daily" | "growth" | "notes" {
  return value === "daily" || value === "growth" || value === "notes";
}

function journalSpace(value: "daily" | "growth" | "notes"): ContentSpace {
  if (value === "daily") return "life";
  return value;
}

function allowedJournalCategories(space: ContentSpace): string[] {
  if (space === "life") return ["daily"];
  if (space === "growth") {
    return GROWTH_NAV.items.map((item) => item.href.split("/").pop()!);
  }
  return NOTES_NAV.items.map((item) => item.href.split("/").pop()!);
}

/** 신규: ASCII+유니크. 수정: 기존 slug 유지(파일·링크 깨짐 방지) */
function resolveCreateSlug(
  requested: string,
  fallbackDated: string,
  exists: (slug: string) => boolean,
): string {
  const base = requested.trim()
    ? sanitizePublicSlug(requested)
    : sanitizePublicSlug(fallbackDated);
  return allocateUniqueSlug(base, exists);
}

function resolveUpdateSlug(requested: string): string {
  return requested.trim();
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

  const body = normalizeMarkdownBody(String(form.get("body") ?? ""));
  const mode = String(form.get("mode") ?? "existing");
  const photos = form
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  try {
    if (category === "reading") {
      if (mode === "new") {
        const title = String(form.get("title") ?? "").trim();
        const author = String(form.get("author") ?? "").trim();
        const readOn = String(form.get("readOn") ?? "").trim();
        const excerpt =
          String(form.get("excerpt") ?? "").trim() ||
          (title ? `'${title}'을 읽고` : "");
        const participationRaw = String(form.get("participation") ?? "personal").trim();
        const participation = (
          ["personal", "member", "guest"].includes(participationRaw)
            ? participationRaw
            : "personal"
        ) as ReadingParticipation;
        const clubSeasonId = String(form.get("clubSeasonId") ?? "").trim() || undefined;
        const guestClubName =
          String(form.get("guestClubName") ?? "").trim() || undefined;
        const tagsRaw = String(form.get("tags") ?? "").trim();
        const tags = tagsRaw
          ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
          : participation === "member"
            ? ["트레바리", "독후감"]
            : ["독후감"];

        if (!title || !author || !readOn) {
          return NextResponse.json(
            { error: "책 제목, 저자, 읽은 날을 입력하세요." },
            { status: 400 },
          );
        }
        if (!body) {
          return NextResponse.json(
            { error: "독후감 본문이 필요합니다." },
            { status: 400 },
          );
        }
        if (participation === "member") {
          if (!clubSeasonId || !readingClubs.some((club) => club.id === clubSeasonId)) {
            return NextResponse.json(
              { error: "클럽 시즌을 선택하세요." },
              { status: 400 },
            );
          }
        }

        const slug = resolveCreateSlug(
          String(form.get("slug") ?? ""),
          buildSafeDatedSlug(readOn, `${title} ${author}`),
          (candidate) => Boolean(getReadingEntryBySlug(candidate)),
        );

        const entry: ReadingEntry = {
          id: `reading-${slug}`,
          slug,
          title,
          author,
          readOn,
          participation,
          clubSeasonId: participation === "member" ? clubSeasonId : undefined,
          guestClubName: participation === "guest" ? guestClubName : undefined,
          excerpt,
          tags,
          artifacts: [],
        };
        await upsertReadingEntry(entry);
        await saveReviewMarkdown("reading", slug, body);
        return NextResponse.json({
          ok: true,
          slug,
          href: publicContentHref(["life", "reading", slug]),
        });
      }

      const slug = resolveUpdateSlug(String(form.get("slug") ?? ""));
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
        href: publicContentHref(["life", "reading", slug]),
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

        const slug = resolveCreateSlug(
          String(form.get("slug") ?? ""),
          buildSafeDatedSlug(ranOn, title),
          (candidate) => Boolean(getRunningEntryBySlug(candidate)),
        );
        const existing = getRunningEntryBySlug(slug);
        const entry: RunningEntry = {
          id: existing?.id ?? `session-${slug}`,
          slug,
          kind: "session",
          title,
          ranOn,
          distanceKm,
          place,
          excerpt,
          tags: existing?.tags ?? ["일상", `${distanceKm}km`],
          source: existing?.source ?? "manual",
          artifacts: existing?.artifacts ?? [],
        };
        await upsertRunningSession(entry);
        if (body) await saveReviewMarkdown("running", slug, body);
        await savePhotos("running", slug, photos);
        return NextResponse.json({
          ok: true,
          slug,
          href: publicContentHref(["life", "running", slug]),
        });
      }

      const slug = resolveUpdateSlug(String(form.get("slug") ?? ""));
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
        href: publicContentHref(["life", "running", slug]),
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

        const slug = resolveCreateSlug(
          String(form.get("slug") ?? ""),
          buildSafeDatedSlug(watchedOn, title),
          (candidate) => Boolean(getCultureEntryBySlug(candidate)),
        );
        const existing = getCultureEntryBySlug(slug);
        const entry: CultureEntry = {
          id: existing?.id ?? `culture-${slug}`,
          slug,
          kind,
          title,
          watchedOn,
          watchedAt,
          place,
          excerpt,
          tags: existing?.tags ?? [kind === "musical" ? "뮤지컬" : kind],
          source: existing?.source ?? "manual",
        };
        await upsertCultureEntry(entry);
        if (body) await saveReviewMarkdown("culture", slug, body);
        await savePhotos("culture", slug, photos);
        return NextResponse.json({
          ok: true,
          slug,
          href: publicContentHref(["life", "culture", slug]),
        });
      }

      const slug = resolveUpdateSlug(String(form.get("slug") ?? ""));
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
        href: publicContentHref(["life", "culture", slug]),
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
      const kindRaw = String(form.get("kind") ?? "").trim();
      const kind =
        category === "food"
          ? kindRaw === "cafe"
            ? ("cafe" as const)
            : ("restaurant" as const)
          : undefined;
      const naverMapUrl =
        String(form.get("naverMapUrl") ?? "").trim() || undefined;
      const catchTableUrl =
        String(form.get("catchTableUrl") ?? "").trim() || undefined;

      if (!title || !place || !visitedOn) {
        return NextResponse.json(
          { error: "제목, 장소, 날짜를 입력하세요." },
          { status: 400 },
        );
      }

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const slug =
        requestedSlug && getPlaceEntryBySlug(category, requestedSlug)
          ? resolveUpdateSlug(requestedSlug)
          : resolveCreateSlug(
              requestedSlug,
              buildSafeDatedSlug(visitedOn, title),
              (candidate) => Boolean(getPlaceEntryBySlug(category, candidate)),
            );

      const existing = getPlaceEntryBySlug(category, slug);
      const defaultTag =
        category === "food"
          ? kind === "cafe"
            ? "카페"
            : "맛집"
          : "여행";
      const entry: PlaceEntry = {
        id: existing?.id ?? `${category}-${slug}`,
        slug,
        title,
        place,
        visitedOn,
        visitedUntil,
        excerpt,
        tags: existing?.tags ?? [defaultTag],
        kind: kind ?? existing?.kind,
        naverMapUrl: naverMapUrl ?? existing?.naverMapUrl,
        catchTableUrl: catchTableUrl ?? existing?.catchTableUrl,
      };

      await upsertPlaceEntry(category, entry);
      if (body) await saveReviewMarkdown(category, slug, body);
      await savePhotos(category, slug, photos);
      return NextResponse.json({
        ok: true,
        slug,
        href: publicContentHref(["life", category, slug]),
      });
    }

    if (isJournal(category)) {
      const space = journalSpace(category);
      const title = String(form.get("title") ?? "").trim();
      const publishedOn = String(form.get("publishedOn") ?? "").trim();
      const journalCategory =
        category === "daily"
          ? "daily"
          : String(form.get("journalCategory") ?? "").trim();
      const excerpt =
        String(form.get("excerpt") ?? "").trim() ||
        body.slice(0, 100) ||
        title;
      const tagsRaw = String(form.get("tags") ?? "").trim();
      const tags = tagsRaw
        ? tagsRaw
            .split(/[,，]/)
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];

      if (!title || !publishedOn || !body) {
        return NextResponse.json(
          { error: "제목, 날짜, 본문을 입력하세요." },
          { status: 400 },
        );
      }

      if (!allowedJournalCategories(space).includes(journalCategory)) {
        return NextResponse.json(
          { error: "카테고리를 선택하세요." },
          { status: 400 },
        );
      }

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const slug =
        requestedSlug && getPostBySlug(space, journalCategory, requestedSlug)
          ? resolveUpdateSlug(requestedSlug)
          : resolveCreateSlug(
              requestedSlug,
              buildSafeDatedSlug(publishedOn, title),
              (candidate) =>
                Boolean(getPostBySlug(space, journalCategory, candidate)),
            );

      const post: Post = {
        id: `${space}-${journalCategory}-${slug}`,
        slug,
        space,
        category: journalCategory,
        contentType: contentTypeForCategory(space, journalCategory),
        title,
        excerpt,
        publishedOn,
        tags,
        body,
      };

      await upsertPost(post);
      return NextResponse.json({
        ok: true,
        slug,
        href: publicContentHref([space, journalCategory, slug]),
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

export async function DELETE(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: {
    category?: string;
    slug?: string;
    journalCategory?: string;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "요청이 올바르지 않습니다." }, { status: 400 });
  }

  const categoryRaw = String(payload.category ?? "");
  const slug = String(payload.slug ?? "").trim();
  if (!isCategory(categoryRaw) || !slug) {
    return NextResponse.json(
      { error: "카테고리와 slug가 필요합니다." },
      { status: 400 },
    );
  }
  const category = categoryRaw;

  try {
    const {
      deleteCultureEntry,
      deletePlaceEntry,
      deletePost,
      deleteReadingEntry,
      deleteRunningSession,
    } = await import("@/lib/write/delete-entry");

    if (category === "reading") {
      const ok = await deleteReadingEntry(slug);
      if (!ok) {
        return NextResponse.json(
          {
            error:
              "Write로 만든 독서 기록만 삭제할 수 있습니다. (시드 글은 코드에서 제거)",
          },
          { status: 404 },
        );
      }
      return NextResponse.json({
        ok: true,
        href: "/life/reading",
      });
    }

    if (category === "running") {
      const ok = await deleteRunningSession(slug);
      if (!ok) {
        return NextResponse.json(
          {
            error:
              "직접 추가한 러닝 세션만 삭제할 수 있습니다. (대회 시드는 코드에서 제거)",
          },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, href: "/life/running" });
    }

    if (category === "culture") {
      const ok = await deleteCultureEntry(slug);
      if (!ok) {
        return NextResponse.json(
          { error: "관람 기록을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, href: "/life/culture" });
    }

    if (isPlaceDomain(category)) {
      const ok = await deletePlaceEntry(category, slug);
      if (!ok) {
        return NextResponse.json(
          { error: "장소 기록을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json({
        ok: true,
        href: `/life/${category}`,
      });
    }

    if (isJournal(category)) {
      const space = journalSpace(category);
      const journalCategory =
        category === "daily"
          ? "daily"
          : String(payload.journalCategory ?? "").trim();
      if (!allowedJournalCategories(space).includes(journalCategory)) {
        return NextResponse.json(
          { error: "카테고리를 확인하세요." },
          { status: 400 },
        );
      }
      const ok = await deletePost(space, journalCategory, slug);
      if (!ok) {
        return NextResponse.json(
          { error: "글을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json({
        ok: true,
        href: `/${space}/${journalCategory}`,
      });
    }

    return NextResponse.json({ error: "지원하지 않는 카테고리입니다." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
