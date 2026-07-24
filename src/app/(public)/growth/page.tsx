import type { Metadata } from "next";
import { SpaceOverview } from "@/features/content/space-overview";
import { GROWTH_NAV } from "@/content/nav";
import {
  getFeaturedPosts,
  getLatestPosts,
} from "@/lib/content/get-posts";

export const metadata: Metadata = {
  title: "Growth",
  description: "자기계발·학습·회고 글을 모아 둡니다.",
};

export default function GrowthOverviewPage() {
  const featured = getFeaturedPosts("growth", 1)[0] ?? null;
  const latest = getLatestPosts("growth", 6).filter(
    (post) => post.id !== featured?.id,
  );

  return (
    <SpaceOverview
      section={GROWTH_NAV}
      title="Growth"
      summary="배운 것을 기록합니다. 개발, AI, 금융, 영어, 생산성."
      featured={featured}
      latest={latest}
      exploreHint="배움의 결을 따라가 보세요."
    />
  );
}
