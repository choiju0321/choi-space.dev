import { existsSync } from "node:fs";
import {
  buildDocumentFileName,
  getDocumentForm,
  type DocumentCollection,
  type DocumentFormId,
} from "@/content/document-forms";
import { getDocumentPath } from "@/lib/documents/paths";
import type {
  CareerRecord,
  CareerRecordWithDocuments,
  DocumentSlot,
} from "@/types/content";

export function resolveDocumentSlots(
  collection: DocumentCollection,
  recordId: string,
  formId: DocumentFormId,
): DocumentSlot[] {
  const form = getDocumentForm(formId);

  return form.documents.map((item) => ({
    id: item.id,
    label: item.label,
    required: item.required,
    fileName: buildDocumentFileName(collection, recordId, item.id),
  }));
}

export function withDocumentAvailability(
  documents: DocumentSlot[],
): CareerRecordWithDocuments["documents"] {
  return documents.map((document) => ({
    ...document,
    available: existsSync(getDocumentPath(document.fileName)),
  }));
}

export function attachDocumentsToRecord(
  collection: DocumentCollection,
  record: CareerRecord,
): CareerRecordWithDocuments {
  if (!record.documentFormId) {
    return {
      ...record,
      documents: [],
    };
  }

  const form = getDocumentForm(record.documentFormId);
  const documents = resolveDocumentSlots(
    collection,
    record.id,
    record.documentFormId,
  );

  return {
    ...record,
    documentFormName: form.name,
    documents: withDocumentAvailability(documents),
  };
}

export function attachDocumentsToRecords(
  collection: DocumentCollection,
  records: CareerRecord[],
): CareerRecordWithDocuments[] {
  return records.map((record) => attachDocumentsToRecord(collection, record));
}

/** Validate that a fileName belongs to a declared form slot. */
export function findDeclaredDocument(
  collections: Partial<Record<DocumentCollection, CareerRecord[]>>,
  fileName: string,
): DocumentSlot | undefined {
  for (const [collection, records] of Object.entries(collections) as Array<
    [DocumentCollection, CareerRecord[]]
  >) {
    for (const record of records) {
      if (!record.documentFormId) continue;
      const slots = resolveDocumentSlots(
        collection,
        record.id,
        record.documentFormId,
      );
      const match = slots.find((slot) => slot.fileName === fileName);
      if (match) return match;
    }
  }

  return undefined;
}
