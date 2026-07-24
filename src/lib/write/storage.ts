import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import type { CultureEntry } from "@/types/culture";
import type { RunningEntry } from "@/types/running";
import type { PlaceDomain, PlaceEntry, WriteCategory } from "@/types/place";
import {
  getPhotosDir,
  getReviewWritePath,
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

export async function saveReviewMarkdown(
  category: WriteCategory,
  slug: string,
  body: string,
) {
  await mkdir(getReviewsDir(category), { recursive: true });
  await writeFile(getReviewWritePath(category, slug), body.trim() + "\n", "utf8");
}

export async function savePhotos(
  category: WriteCategory,
  slug: string,
  files: File[],
) {
  if (files.length === 0) return [] as string[];

  const dir = getPhotosDir(category, slug);
  await mkdir(dir, { recursive: true });

  const saved: string[] = [];
  const stamp = Date.now();

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const fileName = `${stamp}-${String(index + 1).padStart(2, "0")}.${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, fileName), buffer);
    saved.push(`/images/${category}/${slug}/${fileName}`);
  }

  return saved;
}

function cultureEntriesPath() {
  return path.join(process.cwd(), "src/content/culture/entries.json");
}

function placeEntriesPath(domain: PlaceDomain) {
  return path.join(process.cwd(), "src/content", domain, "entries.json");
}

function runningSessionsPath() {
  return path.join(process.cwd(), "src/content/running/sessions.json");
}

export async function upsertCultureEntry(entry: CultureEntry) {
  const list = await readJsonArray<CultureEntry>(cultureEntriesPath());
  const index = list.findIndex((item) => item.slug === entry.slug);
  if (index >= 0) list[index] = entry;
  else list.unshift(entry);
  await writeJsonArray(cultureEntriesPath(), list);
}

export async function upsertPlaceEntry(domain: PlaceDomain, entry: PlaceEntry) {
  const list = await readJsonArray<PlaceEntry>(placeEntriesPath(domain));
  const index = list.findIndex((item) => item.slug === entry.slug);
  if (index >= 0) list[index] = entry;
  else list.unshift(entry);
  await writeJsonArray(placeEntriesPath(domain), list);
}

export async function upsertRunningSession(entry: RunningEntry) {
  const list = await readJsonArray<RunningEntry>(runningSessionsPath());
  const index = list.findIndex((item) => item.slug === entry.slug);
  if (index >= 0) list[index] = entry;
  else list.unshift(entry);
  await writeJsonArray(runningSessionsPath(), list);
}

export function slugifyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildDatedSlug(date: string, title: string) {
  const base = slugifyPart(title) || "entry";
  return `${date}-${base}`;
}
