import { NextResponse } from "next/server";
import { mkdir } from "node:fs/promises";
import { getFinanceClaim } from "@/lib/content/get-finance";
import {
  formatBytes,
  isSafeUploadFileName,
  listMediaDirectory,
  resolveSafeMediaPath,
  writeMediaFile,
} from "@/lib/media/browser";
import {
  buildFinanceClaimMediaPath,
  sanitizeFinanceClaimAttachmentFileName,
} from "@/lib/media/finance-paths";
import { hasWriteSession } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { slug } = await context.params;
  if (!getFinanceClaim(slug)) {
    return NextResponse.json({ error: "청구 건을 찾을 수 없습니다." }, { status: 404 });
  }

  const directory = buildFinanceClaimMediaPath(slug);
  const absolute = resolveSafeMediaPath(directory);
  if (!absolute) {
    return NextResponse.json({ error: "경로가 올바르지 않습니다." }, { status: 400 });
  }

  await mkdir(absolute, { recursive: true });

  const listing = await listMediaDirectory(directory);
  const files = (listing?.entries ?? [])
    .filter((item) => item.type === "file")
    .map((item) => ({
      name: item.name,
      path: item.path,
      size: item.size ?? 0,
      sizeLabel: formatBytes(item.size ?? 0),
      mtime: item.mtime ?? null,
      href: `/api/media/file?path=${encodeURIComponent(item.path)}`,
    }));

  return NextResponse.json({ directory, files });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { slug } = await context.params;
  if (!getFinanceClaim(slug)) {
    return NextResponse.json({ error: "청구 건을 찾을 수 없습니다." }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  const preferred = String(form.get("fileName") ?? "").trim();
  let fileName = sanitizeFinanceClaimAttachmentFileName(preferred || file.name);

  if (!isSafeUploadFileName(fileName)) {
    const ext = fileName.includes(".")
      ? fileName.slice(fileName.lastIndexOf("."))
      : ".bin";
    const stem = fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-가-힣]+/gu, "_")
      .slice(0, 80);
    fileName = `${stem || "attachment"}${ext.replace(/[^A-Za-z0-9.]/g, "")}`;
    if (!isSafeUploadFileName(fileName)) {
      return NextResponse.json(
        { error: "파일 이름을 사용할 수 없습니다. 이름을 단순화해 주세요." },
        { status: 400 },
      );
    }
  }

  const directory = buildFinanceClaimMediaPath(slug);

  try {
    const savedPath = await writeMediaFile(
      directory,
      fileName,
      Buffer.from(await file.arrayBuffer()),
    );
    return NextResponse.json({
      ok: true,
      path: savedPath,
      fileName,
      href: `/api/media/file?path=${encodeURIComponent(savedPath)}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업로드에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
