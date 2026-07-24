# Education documents (private)

학력 증명서·생활기록부 등 민감 문서를 두는 폴더입니다.
웹 정적 공개 경로(`public/`)가 아니라 API를 통해서만 내려받습니다.

## 파일 이름 규칙

`{학력id}-{서류id}.pdf`

양식은 `src/content/document-forms.ts`, 학력은 `src/content/career.ts`의 `documentFormId`로 연결됩니다.

예시:

- `highschool-student-record.pdf`
- `hongik-transcript.pdf`
- `hongik-diploma.pdf`

## 업로드 방법

1. Career 섹션 → 첨부파일 → 팝업에서 업로드 (로컬 `npm run dev` 권장)
2. 또는 이 폴더에 위 규칙의 PDF를 직접 복사

운영 배포에서 누구나 올리지 못하도록, 업로드는 기본적으로 **development** 에서만 허용됩니다.
