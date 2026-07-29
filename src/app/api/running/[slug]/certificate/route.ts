import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { NextResponse } from "next/server";
import {
  getRunningCertificatePath,
  getRunningCertificateWritePath,
  getRunningEntryBySlug,
  hasRunningCertificate,
} from "@/lib/content/get-running";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function isUploadAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.RUNNING_UPLOAD_ENABLED === "true"
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const entry = await getRunningEntryBySlug(slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!hasRunningCertificate(slug)) {
    return NextResponse.json({ error: "기록지가 없습니다." }, { status: 404 });
  }

  try {
    const bytes = await readFile(getRunningCertificatePath(slug));
    const fileName = `${entry.title}-기록지.pdf`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "기록지를 읽을 수 없습니다." }, { status: 404 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isUploadAllowed()) {
    return NextResponse.json(
      {
        error:
          "기록지 업로드는 개발 환경이거나 RUNNING_UPLOAD_ENABLED=true 일 때만 가능합니다.",
      },
      { status: 403 },
    );
  }

  const { slug } = await context.params;
  const entry = await getRunningEntryBySlug(slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
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

  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "파일 크기는 20MB 이하여야 합니다." },
      { status: 400 },
    );
  }

  const target = getRunningCertificateWritePath(slug);
  await mkdir(dirname(target), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target, buffer);

  return NextResponse.json({
    ok: true,
    slug,
    title: entry.title,
    path: `private/media/life/running/${slug}/certificate.pdf`,
  });
}
