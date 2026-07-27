import type { Metadata } from "next";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { LIFE_NAV } from "@/content/nav";
import {
  getRunningPostsAsList,
  paginateArchivePosts,
} from "@/lib/content/archive-as-posts";
import { buildWriteHref } from "@/lib/write/href";

export const metadata: Metadata = {
  title: "Running · Life",
  description: "마라톤과 러닝 기록.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function RunningArchivePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const paged = paginateArchivePosts(getRunningPostsAsList(), page);

  return (
    <CategoryPageTemplate
      section={LIFE_NAV}
      categoryLabel="Running"
      categoryHref="/life/running"
      summary="대회 완주와 일상 러닝을 기록합니다."
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
      writeHref={buildWriteHref({ category: "running" })}
    />
  );
}
