import { existsSync } from "node:fs";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureEntry } from "@/types/culture";
import type { PlaceDomain, PlaceEntry, WriteCategory } from "@/types/place";
import type { ContentSpace, Post } from "@/types/post";
import type { ReadingEntry } from "@/types/reading";
import type { RunningEntry } from "@/types/running";
import {
  getReadingPresentationPath,
  getReadingReviewPath,
  readingWriteEntriesPath,
} from "@/lib/content/get-reading";
import {
  getPhotosDir,
  getReviewFileCandidates,
  getReviewsDir,
} from "@/lib/content/life-media";

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(filePath: string, data: T[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function removePath(target: string) {
  if (!existsSync(target)) return;
  await rm(target, { recursive: true, force: true });
}

async function removeReviewFiles(category: WriteCategory, slug: string) {
  for (const candidate of getReviewFileCandidates(category, slug)) {
    if (existsSync(candidate)) await unlink(candidate);
  }
  if (category === "reading") {
    const txt = getReadingReviewPath(slug);
    if (existsSync(txt)) await unlink(txt);
    const md = path.join(getReviewsDir("reading"), `${slug}.md`);
    if (existsSync(md)) await unlink(md);
  }
}

async function removePhotos(category: WriteCategory, slug: string) {
  await removePath(getPhotosDir(category, slug));
}

function postsPath() {
  return path.join(process.cwd(), "src/content/posts/entries.json");
}

function culturePath() {
  return path.join(process.cwd(), "src/content/culture/entries.json");
}

function runningSessionsPath() {
  return path.join(process.cwd(), "src/content/running/sessions.json");
}

function placePath(domain: PlaceDomain) {
  return path.join(process.cwd(), "src/content", domain, "entries.json");
}

export async function deletePost(
  space: ContentSpace,
  category: string,
  slug: string,
): Promise<boolean> {
  const list = await readJsonArray<Post>(postsPath());
  const next = list.filter(
    (item) =>
      !(
        item.space === space &&
        item.category === category &&
        item.slug === slug
      ),
  );
  if (next.length === list.length) return false;
  await writeJsonArray(postsPath(), next);
  return true;
}

export async function deleteReadingEntry(slug: string): Promise<boolean> {
  const filePath = readingWriteEntriesPath();
  const list = await readJsonArray<ReadingEntry>(filePath);
  const next = list.filter((item) => item.slug !== slug);
  if (next.length === list.length) return false;
  await writeJsonArray(filePath, next);
  await removeReviewFiles("reading", slug);
  const presentation = getReadingPresentationPath(slug);
  if (presentation && existsSync(presentation)) {
    await unlink(presentation);
  }
  return true;
}

export async function deleteCultureEntry(slug: string): Promise<boolean> {
  const list = await readJsonArray<CultureEntry>(culturePath());
  const next = list.filter((item) => item.slug !== slug);
  if (next.length === list.length) return false;
  await writeJsonArray(culturePath(), next);
  await removeReviewFiles("culture", slug);
  await removePhotos("culture", slug);
  return true;
}

export async function deleteRunningSession(slug: string): Promise<boolean> {
  const list = await readJsonArray<RunningEntry>(runningSessionsPath());
  const next = list.filter((item) => item.slug !== slug);
  if (next.length === list.length) return false;
  await writeJsonArray(runningSessionsPath(), next);
  await removeReviewFiles("running", slug);
  await removePhotos("running", slug);
  return true;
}

export async function deletePlaceEntry(
  domain: PlaceDomain,
  slug: string,
): Promise<boolean> {
  const list = await readJsonArray<PlaceEntry>(placePath(domain));
  const next = list.filter((item) => item.slug !== slug);
  if (next.length === list.length) return false;
  await writeJsonArray(placePath(domain), next);
  await removeReviewFiles(domain, slug);
  await removePhotos(domain, slug);
  return true;
}
