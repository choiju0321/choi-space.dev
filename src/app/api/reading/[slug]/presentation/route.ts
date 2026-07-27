import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { NextResponse } from "next/server";
import {
  getReadingEntryBySlug,
  getReadingPresentationPath,
  getReadingPresentationWritePath,
  hasReadingPresentation,
} from "@/lib/content/get-reading";
import { buildReadingPresentationFileName } from "@/lib/media/naming";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function isUploadAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.READING_UPLOAD_ENABLED === "true"
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const entry = getReadingEntryBySlug(slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!hasReadingPresentation(slug)) {
    return NextResponse.json({ error: "발제문이 없습니다." }, { status: 404 });
  }

  try {
    const filePath = getReadingPresentationPath(slug);
    const bytes = await readFile(filePath);
    const fileName =
      basename(filePath) === "presentation.pdf"
        ? buildReadingPresentationFileName(entry)
        : basename(filePath);

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "발제문을 읽을 수 없습니다." }, { status: 404 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isUploadAllowed()) {
    return NextResponse.json(
      {
        error:
          "발제문 업로드는 개발 환경이거나 READING_UPLOAD_ENABLED=true 일 때만 가능합니다.",
      },
      { status: 403 },
    );
  }

  const { slug } = await context.params;
  const entry = getReadingEntryBySlug(slug);

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

  const target = getReadingPresentationWritePath(slug);
  await mkdir(dirname(target), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target, buffer);

  const oldRole = join(dirname(target), "presentation.pdf");
  if (oldRole !== target && existsSync(oldRole)) {
    await unlink(oldRole);
  }

  return NextResponse.json({
    ok: true,
    slug,
    title: entry.title,
    path: `private/media/life/reading/${slug}/${basename(target)}`,
  });
}
