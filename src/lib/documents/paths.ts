import path from "node:path";

/** Private uploaded documents — not served as static public files. */
export const DOCUMENTS_DIR = path.join(process.cwd(), "private/documents");

export function getDocumentPath(fileName: string) {
  return path.join(DOCUMENTS_DIR, fileName);
}
