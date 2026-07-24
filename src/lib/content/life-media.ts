import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { WriteCategory } from "@/types/place";

const REVIEW_EXTS = [".md", ".txt"] as const;

export function getReviewsDir(category: WriteCategory) {
  return path.join(process.cwd(), "src/content", category, "reviews");
}

export function getReviewFileCandidates(category: WriteCategory, slug: string) {
  const dir = getReviewsDir(category);
  return REVIEW_EXTS.map((ext) => path.join(dir, `${slug}${ext}`));
}

export function resolveReviewPath(category: WriteCategory, slug: string) {
  for (const candidate of getReviewFileCandidates(category, slug)) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function hasReview(category: WriteCategory, slug: string) {
  return Boolean(resolveReviewPath(category, slug));
}

export async function readReviewBody(
  category: WriteCategory,
  slug: string,
): Promise<string | null> {
  const filePath = resolveReviewPath(category, slug);
  if (!filePath) return null;
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

/** 저장은 항상 .md */
export function getReviewWritePath(category: WriteCategory, slug: string) {
  return path.join(getReviewsDir(category), `${slug}.md`);
}

export function getPhotosDir(category: WriteCategory, slug: string) {
  return path.join(process.cwd(), "public/images", category, slug);
}

export function listPhotoPublicPaths(
  category: WriteCategory,
  slug: string,
): string[] {
  const dir = getPhotosDir(category, slug);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .sort()
    .map((name) => `/images/${category}/${slug}/${name}`);
}
