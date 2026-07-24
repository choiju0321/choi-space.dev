/**
 * Sync reading artifacts from D:\개인 archive into the project.
 *
 * - 독후감 → src/content/reading/reviews/{slug}.txt  (UTF-8 로 변환 저장)
 * - 발제문 → private/reading/presentations/{slug}.pdf
 *
 * Usage: npx tsx scripts/sync-reading-from-archive.ts
 */
import { mkdir, copyFile, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { readingEntries } from "../src/content/reading/entries";
import { decodeKoreanTextBuffer } from "../src/lib/text/decode-korean";

const ARCHIVE_ROOT = "D:\\개인";
const REVIEWS_DIR = path.join(process.cwd(), "src/content/reading/reviews");
const PRESENTATIONS_DIR = path.join(
  process.cwd(),
  "private/reading/presentations",
);

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(REVIEWS_DIR, { recursive: true });
  await mkdir(PRESENTATIONS_DIR, { recursive: true });

  let copied = 0;
  let missing = 0;

  for (const entry of readingEntries) {
    for (const artifact of entry.artifacts) {
      const src = path.join(ARCHIVE_ROOT, artifact.sourcePath);
      if (!(await exists(src))) {
        console.log(`MISSING ${src}`);
        missing += 1;
        continue;
      }

      if (artifact.kind === "review") {
        const dest = path.join(REVIEWS_DIR, `${entry.slug}.txt`);
        const buffer = await readFile(src);
        const text = decodeKoreanTextBuffer(buffer);
        await writeFile(dest, text, "utf8");
        console.log(`OK review(utf8) → ${entry.slug}.txt`);
        copied += 1;
      }

      if (artifact.kind === "presentation") {
        const dest = path.join(PRESENTATIONS_DIR, `${entry.slug}.pdf`);
        await copyFile(src, dest);
        console.log(`OK presentation → ${entry.slug}.pdf`);
        copied += 1;
      }
    }
  }

  console.log(`\nDone. copied=${copied} missing=${missing}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
