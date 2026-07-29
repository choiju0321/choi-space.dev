import { NextResponse } from "next/server";
import { getPlaceEntryBySlug } from "@/lib/content/get-place";
import { getReadingEntryBySlug } from "@/lib/content/get-reading";
import {
  guessContentType,
  readMediaFile,
  writeMediaFile,
} from "@/lib/media/browser";
import {
  buildReadingPresentationFileName,
  buildTravelItineraryFileName,
} from "@/lib/media/naming";
import { hasWriteSession } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

/** Reading/Travel 엔트리 폴더면 규칙 파일명으로 강제 */
async function resolveUploadFileName(directory: string, originalName: string) {
  const parts = directory.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts[0] === "life" && parts[1] === "reading" && parts[2] && parts.length === 3) {
    const entry = await getReadingEntryBySlug(parts[2]);
    if (entry) return buildReadingPresentationFileName(entry);
  }
  if (parts[0] === "life" && parts[1] === "travel" && parts[2] && parts.length === 3) {
    const entry = await getPlaceEntryBySlug("travel", parts[2]);
    if (entry) return buildTravelItineraryFileName(entry);
  }
  return originalName;
}

/** GET /api/media/file?path=life/reading/slug/... */
export async function GET(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const relative = searchParams.get("path") ?? "";
  if (!relative) {
    return NextResponse.json({ error: "경로가 필요합니다." }, { status: 400 });
  }

  const file = await readMediaFile(relative);
  if (!file) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": guessContentType(file.fileName),
      "Content-Disposition": `${
        guessContentType(file.fileName).startsWith("image/")
          ? "inline"
          : "attachment"
      }; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

/**
 * PUT /api/media/file?path=life/reading/slug
 * FormData: file
 * Reading/Travel 엔트리 폴더는 규칙 파일명으로 저장
 */
export async function PUT(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const directory = searchParams.get("path") ?? "";

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  const preferredName = String(form.get("fileName") ?? "").trim();
  const fileName = await resolveUploadFileName(
    directory,
    preferredName || file.name,
  );

  try {
    const savedPath = await writeMediaFile(
      directory,
      fileName,
      Buffer.from(await file.arrayBuffer()),
    );
    return NextResponse.json({ ok: true, path: savedPath, fileName });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업로드에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
