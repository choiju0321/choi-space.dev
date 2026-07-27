import type { DatingProfile } from "@/types/dating";

export type DatingProfileWriteDraft = {
  slug: string;
  metAt: string;
  memberId: string;
  gender: string;
  birthYearLabel: string;
  surname: string;
  residence: string;
  religion: string;
  height: string;
  hobby: string;
  highSchool: string;
  university: string;
  graduate: string;
  company: string;
  department: string;
  title: string;
  field: string;
  location: string;
  familyFather: string;
  familyMother: string;
  familyOther: string;
  intro: string;
  idealType: string;
  managerNote: string;
  contactName: string;
  contactPhone: string;
  status: DatingProfile["status"];
  note: string;
  photos: string[];
};

export function datingProfileToDraft(
  item: DatingProfile,
): DatingProfileWriteDraft {
  const edu = Object.fromEntries(
    item.education.map((row) => [row.level, row.detail ?? ""]),
  );
  const job =
    item.jobs.find((row) => row.role !== "previous") ?? item.jobs[0] ?? null;
  const otherFamily = Object.entries(item.family)
    .filter(([key]) => key !== "부" && key !== "모")
    .map(([key, value]) => `${key}: ${value ?? ""}`)
    .join("\n");

  return {
    slug: item.slug,
    metAt: item.metAt ?? "",
    memberId: item.memberId ?? "",
    gender: item.gender ?? "여성",
    birthYearLabel: item.birthYearLabel ?? "",
    surname: item.surname ?? "",
    residence: item.residence ?? "",
    religion: item.religion ?? "",
    height: item.height ?? "",
    hobby: item.hobby ?? "",
    highSchool: edu["고등학교"] ?? "",
    university: edu["대학교"] ?? "",
    graduate: edu["대학원"] ?? "",
    company: job?.company ?? "",
    department: job?.department ?? "",
    title: job?.title ?? "",
    field: job?.field ?? "",
    location: job?.location ?? "",
    familyFather: item.family["부"] ?? "",
    familyMother: item.family["모"] ?? "",
    familyOther: otherFamily,
    intro: item.intro ?? "",
    idealType: item.idealType ?? "",
    managerNote: item.managerNote ?? "",
    contactName: item.contactName ?? "",
    contactPhone: item.contactPhone ?? "",
    status: item.status,
    note: item.note ?? "",
    photos: item.photos ?? [],
  };
}
