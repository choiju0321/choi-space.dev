import { mkdir, readFile, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { findCareerDocument } from "@/lib/content/get-career";
import { DOCUMENTS_DIR, getDocumentPath } from "@/lib/documents/paths";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

function isUploadAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.CAREER_DOCS_UPLOAD_ENABLED === "true"
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { fileName } = await context.params;
  const decoded = decodeURIComponent(fileName);
  const document = findCareerDocument(decoded);

  if (!document) {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const bytes = await readFile(getDocumentPath(document.fileName));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "아직 업로드된 파일이 없습니다." },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isUploadAllowed()) {
    return NextResponse.json(
      {
        error:
          "업로드는 개발 환경이거나 CAREER_DOCS_UPLOAD_ENABLED=true 일 때만 가능합니다. 관리자/로그인 이후 정식 업로드로 교체될 예정입니다.",
      },
      { status: 403 },
    );
  }

  const { fileName } = await context.params;
  const decoded = decodeURIComponent(fileName);
  const document = findCareerDocument(decoded);

  if (!document) {
    return NextResponse.json({ error: "허용되지 않은 문서입니다." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "PDF 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "파일 크기는 15MB 이하여야 합니다." },
      { status: 400 },
    );
  }

  await mkdir(DOCUMENTS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(getDocumentPath(document.fileName), buffer);

  return NextResponse.json({
    ok: true,
    fileName: document.fileName,
    label: document.label,
  });
}
