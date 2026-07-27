import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { attachDocumentsToRecords, findDeclaredDocument } from "@/lib/documents/resolve";
import type {
  CareerBasics,
  CareerContent,
  CareerContentWithStatus,
  CareerRecord,
  DocumentSlot,
} from "@/types/content";
import type { DocumentCollection } from "@/content/document-forms";

export function careerCredentialsPath() {
  return path.join(process.cwd(), "src/content/career/credentials.json");
}

const EMPTY_CAREER: CareerContent = {
  basics: { birthDate: "", location: "" },
  education: [],
  military: [],
  training: [],
  certifications: [],
  awards: [],
};

function readCredentials(): CareerContent {
  const filePath = careerCredentialsPath();
  if (!existsSync(filePath)) return EMPTY_CAREER;
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as CareerContent;
    return {
      basics: raw.basics ?? EMPTY_CAREER.basics,
      education: raw.education ?? [],
      military: raw.military ?? [],
      training: raw.training ?? [],
      certifications: raw.certifications ?? [],
      awards: raw.awards ?? [],
    };
  } catch {
    return EMPTY_CAREER;
  }
}

export function getCareer(): CareerContent {
  return readCredentials();
}

export function getCareerBasics(): CareerBasics {
  return readCredentials().basics;
}

export function getCareerRecords(
  collection: DocumentCollection,
): CareerRecord[] {
  return readCredentials()[collection];
}

export function getCareerRecord(
  collection: DocumentCollection,
  id: string,
): CareerRecord | undefined {
  return getCareerRecords(collection).find((item) => item.id === id);
}

/** Career payload with document availability for every menu section. */
export function getCareerWithDocumentStatus(): CareerContentWithStatus {
  const career = readCredentials();
  return {
    basics: career.basics,
    education: attachDocumentsToRecords("education", career.education),
    military: attachDocumentsToRecords("military", career.military),
    training: attachDocumentsToRecords("training", career.training),
    certifications: attachDocumentsToRecords(
      "certifications",
      career.certifications,
    ),
    awards: attachDocumentsToRecords("awards", career.awards),
  };
}

export function findCareerDocument(fileName: string): DocumentSlot | undefined {
  const career = readCredentials();
  return findDeclaredDocument(
    {
      education: career.education,
      military: career.military,
      training: career.training,
      certifications: career.certifications,
      awards: career.awards,
    },
    fileName,
  );
}

export const CAREER_CREDENTIAL_COLLECTIONS: DocumentCollection[] = [
  "education",
  "military",
  "training",
  "certifications",
  "awards",
];

export function isDocumentCollection(
  value: string,
): value is DocumentCollection {
  return CAREER_CREDENTIAL_COLLECTIONS.includes(value as DocumentCollection);
}
