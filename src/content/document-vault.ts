/**
 * Documents 서류 금고 — Career 양식과 별도.
 * 자주 제출하는 생활·재직 서류를 모아 둔다.
 */

export type VaultDocumentItem = {
  id: string;
  label: string;
  /** private/documents/{fileName} */
  fileName: string;
  required?: boolean;
};

export type VaultDocumentGroup = {
  id: string;
  label: string;
  description: string;
  items: VaultDocumentItem[];
};

export const documentVaultGroups: VaultDocumentGroup[] = [
  {
    id: "civil",
    label: "행정",
    description: "관공서·은행 제출용",
    items: [
      {
        id: "resident-copy",
        label: "주민등록등본",
        fileName: "vault-resident-copy.pdf",
        required: true,
      },
      {
        id: "resident-abstract",
        label: "주민등록초본",
        fileName: "vault-resident-abstract.pdf",
        required: true,
      },
      {
        id: "family-relation",
        label: "가족관계증명서",
        fileName: "vault-family-relation.pdf",
      },
    ],
  },
  {
    id: "employment",
    label: "재직",
    description: "회사·이직·대출 제출용",
    items: [
      {
        id: "employment-cert",
        label: "재직증명서",
        fileName: "vault-employment-cert.pdf",
        required: true,
      },
      {
        id: "career-cert",
        label: "경력증명서",
        fileName: "vault-career-cert.pdf",
      },
    ],
  },
  {
    id: "finance",
    label: "금융",
    description: "대출·카드 등 제출용",
    items: [
      {
        id: "income-cert",
        label: "소득금액증명",
        fileName: "vault-income-cert.pdf",
      },
      {
        id: "bankbook",
        label: "통장사본",
        fileName: "vault-bankbook.pdf",
      },
    ],
  },
];

export function getAllVaultDocuments(): VaultDocumentItem[] {
  return documentVaultGroups.flatMap((group) => group.items);
}

export function findVaultDocument(
  fileName: string,
): VaultDocumentItem | undefined {
  return getAllVaultDocuments().find((item) => item.fileName === fileName);
}
