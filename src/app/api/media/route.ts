import { NextResponse } from "next/server";
import { listMediaDirectory } from "@/lib/media/browser";
import { hasWriteSession } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

/** GET /api/media?path=life/reading — 디렉터리 목록 */
export async function GET(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const relative = searchParams.get("path") ?? "";
  const listing = await listMediaDirectory(relative);

  if (!listing) {
    return NextResponse.json(
      { error: "폴더를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json(listing);
}
