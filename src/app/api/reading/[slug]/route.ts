import { NextResponse } from "next/server";
import {
  getReadingContextLabel,
  getReadingEntryBySlug,
  getReadingReviewBody,
  hasReadingPresentation,
  hasReadingReview,
} from "@/lib/content/get-reading";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const entry = getReadingEntryBySlug(slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  const reviewBody = await getReadingReviewBody(slug);

  return NextResponse.json({
    slug: entry.slug,
    title: entry.title,
    author: entry.author,
    readOn: entry.readOn,
    excerpt: entry.excerpt,
    clubName: getReadingContextLabel(entry),
    tags: entry.tags,
    reviewBody,
    hasReview: hasReadingReview(slug) || Boolean(reviewBody),
    hasPresentation: hasReadingPresentation(slug),
  });
}
