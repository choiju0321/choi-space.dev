import { mkdir, unlink, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildPropertyWbsTree,
  flattenPropertyWbs,
} from "@/lib/write/finance-drafts";
import { resolvePropertyCategories } from "@/types/finance";
import type { DocumentCollection } from "@/content/document-forms";
import type { CultureEntry } from "@/types/culture";
import type { RunningEntry } from "@/types/running";
import type { PlaceDomain, PlaceEntry, WriteCategory } from "@/types/place";
import type { Post } from "@/types/post";
import type {
  CareerApplication,
  CareerLanguageItem,
  CareerPackageItem,
} from "@/types/career-hub";
import type {
  CareerBasics,
  CareerContent,
  CareerRecord,
  Profile,
} from "@/types/content";
import type {
  FinanceClaim,
  FinanceInvestSnapshot,
  FinanceLedgerEntry,
  FinanceOccasion,
  FinancePropertyCase,
} from "@/types/finance";
import type { WorkEtcItem, WorkProject, WorkSeason } from "@/types/work";
import {
  careerCredentialsPath,
  getCareer,
} from "@/lib/content/get-career";
import {
  careerApplicationsPath,
  careerLanguagePath,
  careerMastersPath,
} from "@/lib/content/get-career-hub";
import {
  financeClaimsPath,
  financeInvestSnapshotsPath,
  financeLedgerPath,
  financeOccasionsPath,
  financePropertyCasesPath,
} from "@/lib/content/get-finance";
import { datingProfilesPath } from "@/lib/content/get-dating";
import { readingWriteEntriesPath } from "@/lib/content/get-reading";
import { getProfile, profilePath } from "@/lib/content/get-profile";
import type { DatingProfile } from "@/types/dating";
import type { ReadingEntry } from "@/types/reading";
import {
  workEtcPath,
  workProjectsPath,
  workSeasonsPath,
} from "@/lib/content/get-work";
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

/** `###제목` → `### 제목` — 공개 글 본문 파서 무한 루프 방지 */
export function normalizeMarkdownBody(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/^(#{1,6})(?=[^\s#])/gm, "$1 ")
    .trim();
}

export async function saveReviewMarkdown(
  category: WriteCategory,
  slug: string,
  body: string,
) {
  await mkdir(getReviewsDir(category), { recursive: true });
  const normalized = normalizeMarkdownBody(body);
  await writeFile(
    getReviewWritePath(category, slug),
    normalized + "\n",
    "utf8",
  );
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

export function filterSafePhotoPublicPaths(
  category: WriteCategory,
  slug: string,
  publicPaths: string[],
) {
  const prefix = `/images/${category}/${slug}/`;
  return publicPaths.filter(
    (value) =>
      value.startsWith(prefix) &&
      !value.includes("..") &&
      /\/[^/]+\.(jpe?g|png|webp|gif)$/i.test(value),
  );
}

export async function deletePhotosByPublicPaths(
  category: WriteCategory,
  slug: string,
  publicPaths: string[],
) {
  const safe = filterSafePhotoPublicPaths(category, slug, publicPaths);
  for (const publicPath of safe) {
    const filePath = path.join(getPhotosDir(category, slug), path.basename(publicPath));
    await unlink(filePath).catch(() => undefined);
  }
}

export async function applyPhotoChanges(
  category: WriteCategory,
  slug: string,
  options: { removePublicPaths?: string[]; newFiles?: File[] },
) {
  await deletePhotosByPublicPaths(
    category,
    slug,
    options.removePublicPaths ?? [],
  );
  if (options.newFiles?.length) {
    await savePhotos(category, slug, options.newFiles);
  }
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

function postsEntriesPath() {
  return path.join(process.cwd(), "src/content/posts/entries.json");
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

export async function upsertReadingEntry(entry: ReadingEntry) {
  const filePath = readingWriteEntriesPath();
  const list = await readJsonArray<ReadingEntry>(filePath);
  const index = list.findIndex((item) => item.slug === entry.slug);
  if (index >= 0) list[index] = entry;
  else list.unshift(entry);
  list.sort((a, b) => b.readOn.localeCompare(a.readOn));
  await writeJsonArray(filePath, list);
}

export async function upsertPost(entry: Post) {
  const list = await readJsonArray<Post>(postsEntriesPath());
  const normalized: Post = {
    ...entry,
    body: normalizeMarkdownBody(entry.body),
  };
  const index = list.findIndex(
    (item) =>
      item.space === normalized.space &&
      item.category === normalized.category &&
      item.slug === normalized.slug,
  );
  if (index >= 0) list[index] = { ...list[index], ...normalized };
  else list.unshift(normalized);
  await writeJsonArray(postsEntriesPath(), list);
}

export async function upsertWorkProject(
  companySlug: string,
  project: WorkProject,
) {
  const filePath = workProjectsPath(companySlug);
  const list = await readJsonArray<WorkProject>(filePath);
  const index = list.findIndex((item) => item.slug === project.slug);
  if (index >= 0) list[index] = project;
  else list.unshift(project);
  await writeJsonArray(filePath, list);
}

export async function upsertWorkSeason(
  companySlug: string,
  season: WorkSeason,
) {
  const filePath = workSeasonsPath(companySlug);
  const list = await readJsonArray<WorkSeason>(filePath);
  const index = list.findIndex((item) => item.slug === season.slug);
  if (index >= 0) list[index] = season;
  else list.unshift(season);
  await writeJsonArray(filePath, list);
}

export async function upsertWorkEtcItem(
  companySlug: string,
  item: WorkEtcItem,
) {
  const filePath = workEtcPath(companySlug);
  const list = await readJsonArray<WorkEtcItem>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  await writeJsonArray(filePath, list);
}

export async function upsertCareerApplication(application: CareerApplication) {
  const filePath = careerApplicationsPath();
  const list = await readJsonArray<CareerApplication>(filePath);
  const index = list.findIndex((item) => item.slug === application.slug);
  if (index >= 0) list[index] = application;
  else list.unshift(application);
  await writeJsonArray(filePath, list);
}

export async function upsertCareerMaster(item: CareerPackageItem) {
  const filePath = careerMastersPath();
  const list = await readJsonArray<CareerPackageItem>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  await writeJsonArray(filePath, list);
}

export async function upsertCareerLanguage(item: CareerLanguageItem) {
  const filePath = careerLanguagePath();
  const list = await readJsonArray<CareerLanguageItem>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  await writeJsonArray(filePath, list);
}

async function writeCareerContent(career: CareerContent) {
  const filePath = careerCredentialsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(career, null, 2)}\n`, "utf8");
}

export async function upsertCareerBasics(basics: CareerBasics) {
  const career = getCareer();
  await writeCareerContent({ ...career, basics });
}

export async function upsertCareerCredential(
  collection: DocumentCollection,
  record: CareerRecord,
) {
  const career = getCareer();
  const list = [...career[collection]];
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) list[index] = record;
  else list.unshift(record);
  await writeCareerContent({ ...career, [collection]: list });
}

export async function updateProfileContact(fields: {
  name: string;
  email: string;
  location: string;
}) {
  const current = getProfile();
  const next: Profile = {
    ...current,
    name: fields.name,
    email: fields.email,
    location: fields.location,
  };
  const filePath = profilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export async function upsertFinanceOccasion(item: FinanceOccasion) {
  const filePath = financeOccasionsPath();
  const list = await readJsonArray<FinanceOccasion>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  list.sort((a, b) => {
    const da = a.date ?? "0000-00-00";
    const db = b.date ?? "0000-00-00";
    return db.localeCompare(da);
  });
  await writeJsonArray(filePath, list);
}

export async function upsertFinanceLedgerEntry(item: FinanceLedgerEntry) {
  const filePath = financeLedgerPath();
  const list = await readJsonArray<FinanceLedgerEntry>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  list.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
  await writeJsonArray(filePath, list);
}

export async function upsertFinanceInvestSnapshot(item: FinanceInvestSnapshot) {
  const filePath = financeInvestSnapshotsPath();
  const list = await readJsonArray<FinanceInvestSnapshot>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  list.sort((a, b) => {
    const byDate = b.asOf.localeCompare(a.asOf);
    if (byDate !== 0) return byDate;
    return a.accountName.localeCompare(b.accountName, "ko");
  });
  await writeJsonArray(filePath, list);
}

export async function upsertFinanceClaim(item: FinanceClaim) {
  const filePath = financeClaimsPath();
  const list = await readJsonArray<FinanceClaim>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  list.sort((a, b) => {
    const da = a.careDate ?? a.filedAt ?? "0000-00-00";
    const db = b.careDate ?? b.filedAt ?? "0000-00-00";
    return db.localeCompare(da);
  });
  await writeJsonArray(filePath, list);
}

export async function upsertFinancePropertyCase(item: FinancePropertyCase) {
  const filePath = financePropertyCasesPath();
  const list = await readJsonArray<FinancePropertyCase>(filePath);
  // WBS 트리 순서(부모 바로 다음에 자식)로 저장 — JSON diff 최소화·가독성
  const cleaned: FinancePropertyCase = {
    ...item,
    tasks: flattenPropertyWbs(
      buildPropertyWbsTree(item.tasks ?? [], resolvePropertyCategories(item)),
    ).map((node) => node.task),
  };
  const index = list.findIndex((entry) => entry.slug === cleaned.slug);
  if (index >= 0) list[index] = cleaned;
  else list.unshift(cleaned);
  list.sort((a, b) => {
    if (a.status !== b.status) {
      const order = { active: 0, paused: 1, done: 2 } as const;
      return order[a.status] - order[b.status];
    }
    const da = a.wonAt ?? a.moveInAt ?? "0000-00-00";
    const db = b.wonAt ?? b.moveInAt ?? "0000-00-00";
    return db.localeCompare(da);
  });
  await writeJsonArray(filePath, list);
}

export async function upsertDatingProfile(item: DatingProfile) {
  const filePath = datingProfilesPath();
  const list = await readJsonArray<DatingProfile>(filePath);
  const index = list.findIndex((entry) => entry.slug === item.slug);
  if (index >= 0) list[index] = item;
  else list.unshift(item);
  list.sort((a, b) => {
    const da = a.metAt ?? "0000-00-00";
    const db = b.metAt ?? "0000-00-00";
    const byDate = db.localeCompare(da);
    if (byDate !== 0) return byDate;
    return (b.batchIndex ?? 0) - (a.batchIndex ?? 0);
  });
  await writeJsonArray(filePath, list);
}

/** 뱅크샐러드 import — fingerprint 중복은 스킵, 신규만 추가 */
export async function mergeFinanceLedgerEntries(incoming: FinanceLedgerEntry[]) {
  const filePath = financeLedgerPath();
  const existing = await readJsonArray<FinanceLedgerEntry>(filePath);
  const fingerprints = new Set(existing.map((item) => item.fingerprint));
  const added: FinanceLedgerEntry[] = [];

  for (const item of incoming) {
    if (fingerprints.has(item.fingerprint)) continue;
    fingerprints.add(item.fingerprint);
    added.push(item);
  }

  const next = [...added, ...existing];
  next.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
  await writeJsonArray(filePath, next);
  return {
    added: added.length,
    skipped: incoming.length - added.length,
    total: next.length,
  };
}

export function slugifyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    // 공개 URL용 — 한글·특수문자 제외 (Next 동적 라우트 404 방지)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildDatedSlug(date: string, title: string) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
    ? date.trim()
    : "1970-01-01";
  const base = slugifyPart(title) || "entry";
  return `${safeDate}-${base}`;
}
