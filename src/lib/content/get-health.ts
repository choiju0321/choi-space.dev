import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  HealthArchive,
  HealthCheckup,
  HealthDocument,
} from "@/types/health";

export {
  getHealthDocumentKindLabel,
  getHealthFindingFlagLabel,
} from "@/lib/health/labels";

export const HEALTH_CHECKUPS_DIR = path.join(
  process.cwd(),
  "private/health/checkups",
);

const CHECKUPS_JSON = path.join(
  process.cwd(),
  "src/content/health/checkups.json",
);

function loadArchive(): HealthArchive {
  try {
    if (!existsSync(CHECKUPS_JSON)) return { checkups: [] };
    return JSON.parse(readFileSync(CHECKUPS_JSON, "utf8")) as HealthArchive;
  } catch {
    return { checkups: [] };
  }
}

export function getHealthCheckups(): HealthCheckup[] {
  return [...loadArchive().checkups].sort((a, b) =>
    b.checkedOn.localeCompare(a.checkedOn),
  );
}

export function getHealthCheckupBySlug(
  slug: string,
): HealthCheckup | undefined {
  return getHealthCheckups().find((checkup) => checkup.slug === slug);
}

export function countNotableFindings(checkup: HealthCheckup) {
  return checkup.findings.filter(
    (finding) => finding.flag === "abnormal" || finding.flag === "followup",
  ).length;
}

export function getHealthPrivateDocumentPath(document: HealthDocument) {
  return path.join(HEALTH_CHECKUPS_DIR, document.privateFileName);
}

export function hasHealthPrivateDocument(document: HealthDocument) {
  return existsSync(getHealthPrivateDocumentPath(document));
}

export function findHealthDocument(
  slug: string,
  privateFileName: string,
): HealthDocument | undefined {
  const checkup = getHealthCheckupBySlug(slug);
  if (!checkup) return undefined;
  return checkup.documents.find(
    (document) => document.privateFileName === privateFileName,
  );
}

export type HealthListItem = {
  id: string;
  slug: string;
  checkedOn: string;
  displayDate: string;
  year: string;
  provider: string;
  place: string | null;
  packageName: string | null;
  notableFindingCount: number;
  documentCount: number;
  syncedDocumentCount: number;
  hasPasswordHint: boolean;
};

export function toHealthListItem(checkup: HealthCheckup): HealthListItem {
  const syncedDocumentCount = checkup.documents.filter((document) =>
    hasHealthPrivateDocument(document),
  ).length;

  return {
    id: checkup.id,
    slug: checkup.slug,
    checkedOn: checkup.checkedOn,
    displayDate: checkup.checkedOn.replaceAll("-", "."),
    year: checkup.checkedOn.slice(0, 4),
    provider: checkup.provider,
    place: checkup.place ?? null,
    packageName: checkup.packageName ?? null,
    notableFindingCount: countNotableFindings(checkup),
    documentCount: checkup.documents.length,
    syncedDocumentCount,
    hasPasswordHint: Boolean(checkup.passwordHint),
  };
}

export function getHealthListItems(): HealthListItem[] {
  return getHealthCheckups().map(toHealthListItem);
}
