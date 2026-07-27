import { existsSync } from "node:fs";
import {
  documentVaultGroups,
  findVaultDocument,
  type VaultDocumentGroup,
} from "@/content/document-vault";
import { getDocumentPath } from "@/lib/documents/paths";
import type { DocumentSlotStatus } from "@/types/content";

export function vaultItemToSlot(
  item: {
    id: string;
    label: string;
    fileName: string;
    required?: boolean;
  },
): DocumentSlotStatus {
  return {
    id: item.id,
    label: item.label,
    fileName: item.fileName,
    required: item.required !== false,
    available: existsSync(getDocumentPath(item.fileName)),
  };
}

export function getVaultGroupsWithStatus(): (VaultDocumentGroup & {
  documents: DocumentSlotStatus[];
})[] {
  return documentVaultGroups.map((group) => ({
    ...group,
    documents: group.items.map(vaultItemToSlot),
  }));
}

export function findManagedDocument(fileName: string): {
  fileName: string;
  label: string;
} | null {
  const vault = findVaultDocument(fileName);
  if (vault) return { fileName: vault.fileName, label: vault.label };
  return null;
}
