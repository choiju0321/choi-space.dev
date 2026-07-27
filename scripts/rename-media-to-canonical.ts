/**
 * presentation.pdf / itinerary.xlsx → 규칙 파일명으로 리네임
 *
 * Usage: npx tsx scripts/rename-media-to-canonical.ts
 */

import { existsSync, renameSync, unlinkSync } from "node:fs";
import path from "node:path";
import { readingEntries } from "../src/content/reading/entries";
import { buildReadingPresentationFileName } from "../src/lib/media/naming";
import { buildTravelItineraryFileName } from "../src/lib/media/naming";
import { getMediaEntryDir } from "../src/lib/media/paths";

type TravelEntry = {
  slug: string;
  place: string;
  visitedOn: string;
  visitedUntil?: string;
};

function loadTravelEntries(): TravelEntry[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const raw = require("../src/content/travel/entries.json") as TravelEntry[];
  return raw;
}

function renameInDir(dir: string, fromName: string, toName: string) {
  const from = path.join(dir, fromName);
  const to = path.join(dir, toName);
  if (!existsSync(from)) {
    if (existsSync(to)) {
      console.log(`skip (already): ${toName}`);
      return;
    }
    console.log(`missing: ${from}`);
    return;
  }
  if (from === to) {
    console.log(`ok: ${toName}`);
    return;
  }
  if (existsSync(to)) {
    unlinkSync(from);
    console.log(`removed old, kept: ${toName}`);
    return;
  }
  renameSync(from, to);
  console.log(`renamed: ${fromName} → ${toName}`);
}

function main() {
  console.log("— Reading presentations —");
  for (const entry of readingEntries) {
    const dir = getMediaEntryDir({
      space: "life",
      category: "reading",
      slug: entry.slug,
    });
    const canonical = buildReadingPresentationFileName(entry);
    renameInDir(dir, "presentation.pdf", canonical);
  }

  console.log("— Travel itineraries —");
  for (const entry of loadTravelEntries()) {
    const dir = getMediaEntryDir({
      space: "life",
      category: "travel",
      slug: entry.slug,
    });
    const canonical = buildTravelItineraryFileName(entry);
    renameInDir(dir, "itinerary.xlsx", canonical);
  }

  console.log("Done.");
}

main();
