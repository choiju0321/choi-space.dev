import type { Metadata } from "next";
import { SpaceOverview } from "@/features/content/space-overview";
import { LIFE_NAV } from "@/content/nav";
import { getAllLifeArchivePosts } from "@/lib/content/archive-as-posts";
import { getLatestPosts } from "@/lib/content/get-posts";
import type { PostListItem } from "@/types/post";

export const metadata: Metadata = {
  title: "Life",
  description: "책, 러닝, 문화, 일상 등 삶의 경험을 기록합니다.",
};

async function mergeLifeLatest(limit = 6): Promise<PostListItem[]> {
  const [journal, archives] = await Promise.all([
    getLatestPosts("life", limit),
    getAllLifeArchivePosts(),
  ]);

  return [...journal, ...archives]
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
    .slice(0, limit);
}

export default async function LifeOverviewPage() {
  const latest = await mergeLifeLatest(6);

  return (
    <SpaceOverview
      section={LIFE_NAV}
      title="Life"
      summary="책, 러닝, 여행, 문화, 일상. 지나가는 하루를 의미 있는 기록으로 남깁니다."
      latest={latest}
      exploreHint="경험을 천천히 열어 보세요."
    />
  );
}
