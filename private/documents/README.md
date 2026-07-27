# Private documents

`public/`이 아니라 API(`/api/documents/...`)로만 접근합니다.

## 1. Career 연결 서류

학력·자격증 등 Career 항목에 연결된 PDF.

파일명 규칙: `{collection}-{recordId}-{documentId}.pdf`

예: `education-hongik-transcript.pdf`

## 2. 서류 금고 (Documents vault)

자주 쓰는 생활·재직 서류. 카탈로그: `src/content/document-vault.ts`

| 파일명 | 용도 |
|--------|------|
| `vault-resident-copy.pdf` | 주민등록등본 |
| `vault-resident-abstract.pdf` | 주민등록초본 |
| `vault-family-relation.pdf` | 가족관계증명서 |
| `vault-employment-cert.pdf` | 재직증명서 |
| `vault-career-cert.pdf` | 경력증명서 |
| `vault-income-cert.pdf` | 소득금액증명 |
| `vault-bankbook.pdf` | 통장사본 |

관리 UI: `/documents` (작성 비밀번호 로그인)

## 업로드

- Career → 첨부파일 팝업
- Documents → 서류 금고 목록
- 또는 이 폴더에 규칙에 맞는 PDF 복사

업로드 API는 기본적으로 development에서만 허용됩니다.  
금고(vault) 다운로드·업로드는 로그인 세션이 필요합니다.
