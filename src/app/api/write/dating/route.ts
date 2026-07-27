import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getDatingProfile,
  getDatingProfiles,
} from "@/lib/content/get-dating";
import { writeMediaFile } from "@/lib/media/browser";
import { hasWriteSession } from "@/lib/write/auth";
import { slugifyPart, upsertDatingProfile } from "@/lib/write/storage";
import {
  DATING_STATUS_ORDER,
  type DatingEducation,
  type DatingJob,
  type DatingProfile,
  type DatingProfileStatus,
} from "@/types/dating";

export const dynamic = "force-dynamic";

function isDatingStatus(value: string): value is DatingProfileStatus {
  return (DATING_STATUS_ORDER as string[]).includes(value);
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function nullable(form: FormData, key: string) {
  const value = text(form, key);
  return value || null;
}

function parseBirthYear(label: string | null) {
  if (!label) return null;
  const match = label.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function parseHeightCm(height: string | null) {
  if (!height) return null;
  const match = height.match(/(\d{2,3})/);
  return match ? Number(match[1]) : null;
}

function buildEducation(form: FormData): DatingEducation[] {
  const rows: DatingEducation[] = [];
  const highSchool = nullable(form, "highSchool");
  const university = nullable(form, "university");
  const graduate = nullable(form, "graduate");
  if (highSchool) rows.push({ level: "고등학교", detail: highSchool });
  if (university) rows.push({ level: "대학교", detail: university });
  if (graduate) rows.push({ level: "대학원", detail: graduate });
  return rows;
}

function buildJobs(form: FormData): DatingJob[] {
  const company = nullable(form, "company");
  if (!company) return [];
  return [
    {
      company,
      role: "current",
      department: nullable(form, "department"),
      title: nullable(form, "title"),
      field: nullable(form, "field"),
      location: nullable(form, "location"),
    },
  ];
}

function buildFamily(form: FormData): Record<string, string | null> {
  const family: Record<string, string | null> = {};
  const father = nullable(form, "familyFather");
  const mother = nullable(form, "familyMother");
  if (father) family["부"] = father;
  if (mother) family["모"] = mother;

  const other = text(form, "familyOther");
  if (other) {
    for (const line of other.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const split = trimmed.indexOf(":");
      if (split === -1) {
        family[trimmed] = trimmed;
        continue;
      }
      const key = trimmed.slice(0, split).trim();
      const value = trimmed.slice(split + 1).trim();
      if (key) family[key] = value || null;
    }
  }
  return family;
}

function resolveUniqueSlug(preferred: string, excludeSlug?: string) {
  const existing = new Set(
    getDatingProfiles()
      .filter((item) => item.slug !== excludeSlug)
      .map((item) => item.slug),
  );
  if (!existing.has(preferred)) return preferred;
  let index = 2;
  while (existing.has(`${preferred}-${index}`)) index += 1;
  return `${preferred}-${index}`;
}

function photoExtension(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return ".jpg";
  if (name.endsWith(".webp")) return ".webp";
  if (name.endsWith(".gif")) return ".gif";
  return ".png";
}

async function savePhotos(slug: string, files: File[], startIndex: number) {
  const photos: string[] = [];
  let index = startIndex;
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    index += 1;
    const fileName = `${String(index).padStart(2, "0")}${photoExtension(file)}`;
    const relative = await writeMediaFile(
      `personal/dating/${slug}`,
      fileName,
      Buffer.from(await file.arrayBuffer()),
    );
    photos.push(relative);
  }
  return photos;
}

export async function POST(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await request.formData();
  const writeKind = text(form, "kind") || "profile";

  if (writeKind === "profile") {
    const mode = text(form, "mode") === "existing" ? "existing" : "new";
    const metAt = text(form, "metAt");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(metAt)) {
      return NextResponse.json(
        { error: "받은 날짜가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const memberId = nullable(form, "memberId");
    const statusRaw = text(form, "status") || "new";
    if (!isDatingStatus(statusRaw)) {
      return NextResponse.json({ error: "상태가 올바르지 않습니다." }, { status: 400 });
    }

    const requestedSlug = text(form, "slug");
    let existing: DatingProfile | undefined;
    if (mode === "existing") {
      if (!requestedSlug) {
        return NextResponse.json({ error: "slug가 필요합니다." }, { status: 400 });
      }
      existing = getDatingProfile(requestedSlug);
      if (!existing) {
        return NextResponse.json(
          { error: "프로필을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
    }

    const baseSlug =
      requestedSlug ||
      `${metAt}-${memberId || slugifyPart(text(form, "surname")) || "profile"}`;
    const slug =
      mode === "existing" && existing
        ? existing.slug
        : resolveUniqueSlug(baseSlug);

    const birthYearLabel = nullable(form, "birthYearLabel");
    const height = nullable(form, "height");
    const contactName = nullable(form, "contactName");
    const contactPhone = nullable(form, "contactPhone");
    const status: DatingProfileStatus =
      statusRaw === "new" && (contactName || contactPhone)
        ? "meeting"
        : statusRaw === "new"
          ? "new"
          : statusRaw;

    const incomingFiles = form
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    const previousPhotos = existing?.photos ?? [];
    const addedPhotos = await savePhotos(
      slug,
      incomingFiles,
      previousPhotos.length,
    );

    const item: DatingProfile = {
      id: slug,
      slug,
      sourceSheet: existing?.sourceSheet,
      platform: "duo",
      metAt,
      batchIndex: existing?.batchIndex ?? null,
      memberId,
      gender: nullable(form, "gender"),
      birthYear: parseBirthYear(birthYearLabel),
      birthYearLabel,
      surname: nullable(form, "surname"),
      residence: nullable(form, "residence"),
      religion: nullable(form, "religion"),
      height,
      heightCm: parseHeightCm(height),
      hobby: nullable(form, "hobby"),
      education: buildEducation(form),
      jobs: buildJobs(form),
      family: buildFamily(form),
      intro: nullable(form, "intro"),
      idealType: nullable(form, "idealType"),
      managerNote: nullable(form, "managerNote"),
      managerName: existing?.managerName ?? null,
      managerPhone: existing?.managerPhone ?? null,
      contactName,
      contactPhone,
      photos: [...previousPhotos, ...addedPhotos],
      status:
        contactName || contactPhone
          ? status === "passed" || status === "archived"
            ? status
            : "meeting"
          : status,
      note: nullable(form, "note"),
    };

    await upsertDatingProfile(item);
    revalidatePath("/dating");
    revalidatePath("/records");
    return NextResponse.json({
      ok: true,
      kind: "profile",
      slug,
      href: "/dating",
    });
  }

  const slug = text(form, "slug");
  if (!slug) {
    return NextResponse.json({ error: "slug가 필요합니다." }, { status: 400 });
  }

  const existing = getDatingProfile(slug);
  if (!existing) {
    return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 });
  }

  if (writeKind === "status") {
    const statusRaw = text(form, "status");
    if (!isDatingStatus(statusRaw)) {
      return NextResponse.json({ error: "상태가 올바르지 않습니다." }, { status: 400 });
    }
    await upsertDatingProfile({ ...existing, status: statusRaw });
    revalidatePath("/dating");
    revalidatePath("/records");
    return NextResponse.json({ ok: true, kind: "status", slug, status: statusRaw });
  }

  if (writeKind === "contact") {
    const contactName = nullable(form, "contactName");
    const contactPhone = nullable(form, "contactPhone");
    const nextStatusRaw = text(form, "status");
    const status =
      nextStatusRaw && isDatingStatus(nextStatusRaw)
        ? nextStatusRaw
        : contactName || contactPhone
          ? ("meeting" as const)
          : existing.status;

    await upsertDatingProfile({
      ...existing,
      contactName,
      contactPhone,
      status,
    });
    revalidatePath("/dating");
    revalidatePath("/records");
    return NextResponse.json({
      ok: true,
      kind: "contact",
      slug,
      contactName,
      contactPhone,
      status,
    });
  }

  return NextResponse.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
}
