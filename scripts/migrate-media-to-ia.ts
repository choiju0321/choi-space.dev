import { mkdirSync, existsSync, renameSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * legacy PDF → private/media/life/... IA 트리로 이동
 *
 * npx tsx scripts/migrate-media-to-ia.ts
 */

const root = process.cwd();

function moveReading() {
  const legacyDir = path.join(root, "private/reading/presentations");
  if (!existsSync(legacyDir)) {
    console.log("skip reading: no legacy dir");
    return;
  }

  for (const name of readdirSync(legacyDir)) {
    if (!name.toLowerCase().endsWith(".pdf")) continue;
    const slug = name.replace(/\.pdf$/i, "");
    const from = path.join(legacyDir, name);
    const toDir = path.join(root, "private/media/life/reading", slug);
    const to = path.join(toDir, "presentation.pdf");
    mkdirSync(toDir, { recursive: true });
    if (existsSync(to)) {
      console.log("exists, skip", slug);
      continue;
    }
    renameSync(from, to);
    console.log("moved reading", slug);
  }
}

function moveRunning() {
  const legacyDir = path.join(root, "private/running/certificates");
  if (!existsSync(legacyDir)) {
    console.log("skip running: no legacy dir");
    return;
  }

  for (const name of readdirSync(legacyDir)) {
    if (!name.toLowerCase().endsWith(".pdf")) continue;
    const slug = name.replace(/\.pdf$/i, "");
    const from = path.join(legacyDir, name);
    const toDir = path.join(root, "private/media/life/running", slug);
    const to = path.join(toDir, "certificate.pdf");
    mkdirSync(toDir, { recursive: true });
    if (existsSync(to)) {
      console.log("exists, skip", slug);
      continue;
    }
    renameSync(from, to);
    console.log("moved running", slug);
  }
}

moveReading();
moveRunning();
console.log("done");
