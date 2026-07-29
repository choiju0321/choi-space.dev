import type { Metadata } from "next";
import { SpaceOverview } from "@/features/content/space-overview";
import { NOTES_NAV } from "@/content/nav";
import { getLatestPosts } from "@/lib/content/get-posts";

export const metadata: Metadata = {
  title: "Notes",
  description: "정보·칼럼·청약·팁 정리 글을 모아 둡니다.",
};

export default async function NotesOverviewPage() {
  const latest = await getLatestPosts("notes", 6);

  return (
    <SpaceOverview
      section={NOTES_NAV}
      title="Notes"
      summary="정보를 정리하는 공간입니다. 금융, 부동산, 생산성, 팁, 아카이브."
      latest={latest}
      exploreHint="필요한 기록만 골라 읽으세요."
    />
  );
}
