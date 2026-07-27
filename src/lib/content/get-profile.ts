import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Profile } from "@/types/content";

export function profilePath() {
  return path.join(process.cwd(), "src/content/profile.json");
}

const FALLBACK_PROFILE: Profile = {
  brandName: "Choi Space",
  siteHeadline: "",
  siteSummary: "",
  name: "",
  role: "",
  tagline: "",
  email: "",
  image: {
    src: "/images/profile/portrait.jpg",
    alt: "프로필 사진",
    width: 400,
    height: 573,
  },
  socialLinks: [],
};

export function getProfile(): Profile {
  if (!existsSync(profilePath())) return FALLBACK_PROFILE;
  try {
    return JSON.parse(readFileSync(profilePath(), "utf8")) as Profile;
  } catch {
    return FALLBACK_PROFILE;
  }
}
