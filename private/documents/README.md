# Private documents

메뉴 항목(학력/자격증 등)에 연결된 서류 파일을 둡니다.
`public/`이 아니라 API(`/api/documents/...`)로만 접근합니다.

## 학력 서류 매핑 (아카이브 → 사이트)

원본: `D:\개인\04_Personal\03. Education\`

| 사이트 파일명 | 원본 |
|---------------|------|
| `education-highschool-student-record.pdf` | `1. 양지고(고등학교)/고교생활기록부.pdf` |
| `education-hongik-transcript.pdf` | `2. 홍익대(대학교)/홍익대학교_성적증명서.pdf` |
| `education-hongik-diploma.pdf` | `2. 홍익대(대학교)/홍익대학교_졸업증명서(개명후).pdf` |

## 파일명 규칙

`{collection}-{recordId}-{documentId}.pdf`

## 업로드

Career → 첨부파일 팝업, 또는 이 폴더에 규칙에 맞는 PDF 복사.
업로드 API는 기본적으로 development에서만 허용됩니다.
