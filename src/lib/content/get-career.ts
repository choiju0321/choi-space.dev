import { career } from "@/content/career";
import { attachDocumentsToRecords, findDeclaredDocument } from "@/lib/documents/resolve";
import type { CareerContent, CareerContentWithStatus, DocumentSlot } from "@/types/content";

export function getCareer(): CareerContent {
  return career;
}

/** Career payload with document availability for every menu section. */
export function getCareerWithDocumentStatus(): CareerContentWithStatus {
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
