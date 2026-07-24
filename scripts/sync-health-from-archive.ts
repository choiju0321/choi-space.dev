/**
 * Sync health checkup PDFs from D:\개인 archive into private/health/checkups.
 *
 * Usage: npx tsx scripts/sync-health-from-archive.ts
 */
import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { readFileSync } from "node:fs";
import type { HealthArchive } from "../src/types/health";

const ARCHIVE_ROOT = "D:\\개인";
const CHECKUPS_JSON = path.join(
  process.cwd(),
  "src/content/health/checkups.json",
);
const PRIVATE_DIR = path.join(process.cwd(), "private/health/checkups");

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const archive = JSON.parse(
    readFileSync(CHECKUPS_JSON, "utf8"),
  ) as HealthArchive;

  await mkdir(PRIVATE_DIR, { recursive: true });

  let copied = 0;
  let missing = 0;

  for (const checkup of archive.checkups) {
    for (const document of checkup.documents) {
      const src = path.join(ARCHIVE_ROOT, document.sourcePath);
      const dest = path.join(PRIVATE_DIR, document.privateFileName);

      if (!(await exists(src))) {
        console.log(`MISSING ${src}`);
        missing += 1;
        continue;
      }

      await copyFile(src, dest);
      console.log(`OK ${checkup.slug} → ${document.privateFileName}`);
      copied += 1;
    }
  }

  console.log(`\nDone. copied=${copied} missing=${missing}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
