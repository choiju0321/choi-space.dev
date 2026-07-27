import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { NextResponse } from "next/server";
import {
  getPlaceEntryBySlug,
  getTravelItineraryPath,
  getTravelItineraryWritePath,
  hasTravelItinerary,
} from "@/lib/content/get-place";
import { buildTravelItineraryFileName } from "@/lib/media/naming";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function isUploadAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.TRAVEL_UPLOAD_ENABLED === "true"
  );
}

function isXlsx(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === XLSX_MIME ||
    file.type === "application/vnd.ms-excel" ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xls")
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const entry = getPlaceEntryBySlug("travel", slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!hasTravelItinerary(slug)) {
    return NextResponse.json({ error: "여행 계획서가 없습니다." }, { status: 404 });
  }

  try {
    const filePath = getTravelItineraryPath(slug);
    const bytes = await readFile(filePath);
    const fileName =
      basename(filePath) === "itinerary.xlsx"
        ? buildTravelItineraryFileName(entry)
        : basename(filePath);

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": XLSX_MIME,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "여행 계획서를 읽을 수 없습니다." }, { status: 404 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isUploadAllowed()) {
    return NextResponse.json(
      {
        error:
          "여행 계획서 업로드는 개발 환경이거나 TRAVEL_UPLOAD_ENABLED=true 일 때만 가능합니다.",
      },
      { status: 403 },
    );
  }

  const { slug } = await context.params;
  const entry = getPlaceEntryBySlug("travel", slug);

  if (!entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (!isXlsx(file)) {
    return NextResponse.json(
      { error: "Excel(.xlsx) 파일만 업로드할 수 있습니다." },
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

  const target = getTravelItineraryWritePath(slug);
  await mkdir(dirname(target), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(target, buffer);

  const oldRole = join(dirname(target), "itinerary.xlsx");
  if (oldRole !== target && existsSync(oldRole)) {
    await unlink(oldRole);
  }

  return NextResponse.json({
    ok: true,
    slug,
    title: entry.title,
    path: `private/media/life/travel/${slug}/${basename(target)}`,
  });
}
