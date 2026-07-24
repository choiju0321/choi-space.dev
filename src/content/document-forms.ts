/**
 * 서류 양식 레지스트리
 *
 * 관리자 페이지(예정)에서 CRUD 할 대상입니다.
 * 지금은 파일로 관리하고, 나중에는 DB/관리자 UI로 교체하면 됩니다.
 *
 * 사용 흐름:
 * 1. 양식 정의 (예: university = 성적증명서 + 졸업증명서)
 * 2. 메뉴 항목(학력/자격증 등)에 documentFormId 연결
 * 3. 첨부파일 팝업이 해당 양식의 서류 목록을 보여 줌
 */

export type DocumentFormItem = {
  id: string;
  label: string;
  /** 기본값: true */
  required?: boolean;
};

export type DocumentForm = {
  id: string;
  name: string;
  description?: string;
  documents: DocumentFormItem[];
};

/**
 * 재사용 가능한 서류 양식.
 * 새 양식이 필요하면 여기에 추가하거나, 향후 관리자에서 등록합니다.
 */
export const documentForms = {
  highschool: {
    id: "highschool",
    name: "고등학교 학력 서류",
    description: "고등학교 관련 제출 서류",
    documents: [
      { id: "student-record", label: "생활기록부", required: true },
    ],
  },
  university: {
    id: "university",
    name: "대학교 학력 서류",
    description: "대학교 관련 제출 서류",
    documents: [
      { id: "transcript", label: "성적증명서", required: true },
      { id: "diploma", label: "졸업증명서", required: true },
    ],
  },
  certification: {
    id: "certification",
    name: "자격증 서류",
    description: "자격증 원본/사본 제출 서류",
    documents: [
      { id: "certificate", label: "자격증", required: true },
    ],
  },
  training: {
    id: "training",
    name: "교육 수료 서류",
    description: "교육·과정 수료 관련 제출 서류",
    documents: [
      { id: "completion", label: "수료증", required: true },
    ],
  },
  award: {
    id: "award",
    name: "수상 서류",
    description: "수상 관련 제출 서류",
    documents: [
      { id: "certificate", label: "상장", required: true },
    ],
  },
  military: {
    id: "military",
    name: "병역 서류",
    description: "병역 관련 제출 서류",
    documents: [
      { id: "discharge", label: "병역증명서 / 전역증", required: true },
    ],
  },
} as const satisfies Record<string, DocumentForm>;

export type DocumentFormId = keyof typeof documentForms;

/** Career 메뉴(섹션) — 항목에 서류 양식을 붙일 수 있는 단위 */
export type DocumentCollection =
  | "education"
  | "military"
  | "training"
  | "certifications"
  | "awards";

export function getDocumentForm(formId: DocumentFormId): DocumentForm {
  return documentForms[formId];
}

/**
 * 저장 파일명 규칙:
 * `{collection}-{recordId}-{documentId}.pdf`
 * 예: education-hongik-transcript.pdf, certifications-sqld-certificate.pdf
 */
export function buildDocumentFileName(
  collection: DocumentCollection,
  recordId: string,
  documentId: string,
) {
  return `${collection}-${recordId}-${documentId}.pdf`;
}
