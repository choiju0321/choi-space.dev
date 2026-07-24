import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  findHealthDocument,
  getHealthPrivateDocumentPath,
} from "@/lib/content/get-health";
import { hasWriteSession } from "@/lib/write/auth";

type RouteContext = {
  params: Promise<{ slug: string; fileName: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { slug, fileName } = await context.params;
  const decodedSlug = decodeURIComponent(slug);
  const decodedFile = decodeURIComponent(fileName);
  const document = findHealthDocument(decodedSlug, decodedFile);

  if (!document) {
    return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const bytes = await readFile(getHealthPrivateDocumentPath(document));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "동기화된 파일이 없습니다. npm run sync:health 를 실행하세요." },
      { status: 404 },
    );
  }
}
