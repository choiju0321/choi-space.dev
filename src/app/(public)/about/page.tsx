import type { Metadata } from "next";
import { AboutPageView } from "@/features/about/about-page-view";
import { getProfile } from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "About",
  description:
    "최지웅 — 금융 시스템 엔지니어. Choi Space에 남기는 기록과 이야기.",
  path: "/about",
});

export default function AboutPage() {
  const profile = getProfile();

  return (
    <AboutPageView image={profile.image} email={profile.email} />
  );
}
