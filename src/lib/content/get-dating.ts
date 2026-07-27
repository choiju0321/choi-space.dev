import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DatingProfile } from "@/types/dating";

export function datingProfilesPath() {
  return path.join(process.cwd(), "src/content/personal/dating-profiles.json");
}

function readJsonArrayFile<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function getDatingProfiles(): DatingProfile[] {
  return readJsonArrayFile<DatingProfile>(datingProfilesPath());
}

export function getDatingProfile(slug: string): DatingProfile | undefined {
  return getDatingProfiles().find((item) => item.slug === slug);
}
