/**
 * Sync travel plan Excel from D:\개인\04_Personal\08. Travel
 * → private/media/life/travel/{slug}/itinerary.xlsx
 *
 * Usage: npx tsx scripts/sync-travel-from-archive.ts
 */
import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getTravelItineraryMediaPath } from "../src/lib/media/paths";

const ARCHIVE_DIR = path.join("D:\\개인", "04_Personal", "08. Travel");

/** 개인 아카이브 파일명 → 사이트 slug */
const MAP: { fileName: string; slug: string }[] = [
  {
    fileName: "여행계획_부산_20260410_20260412_v0.1.xlsx",
    slug: "busan-2026-04",
  },
  {
    fileName: "여행계획_충북 단양_20241012_20241013_v0.1.xlsx",
    slug: "danyang-2024-10",
  },
  {
    fileName: "여행계획_곤지암_20240918_v0.1.xlsx",
    slug: "gonjiam-2024-09",
  },
];

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  let copied = 0;
  let missing = 0;

  for (const item of MAP) {
    const src = path.join(ARCHIVE_DIR, item.fileName);
    if (!(await exists(src))) {
      console.log(`MISSING ${src}`);
      missing += 1;
      continue;
    }

    const dest = getTravelItineraryMediaPath(item.slug);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(src, dest);
    console.log(`OK itinerary → life/travel/${item.slug}/itinerary.xlsx`);
    copied += 1;
  }

  console.log(`\nDone. copied=${copied} missing=${missing}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
