import type { Metadata } from "next";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { LIFE_NAV } from "@/content/nav";
import { getPosts, paginatePosts } from "@/lib/content/get-posts";
import { buildWriteHref } from "@/lib/write/href";

export const metadata: Metadata = {
  title: "Daily · Life",
  description: "일상과 짧은 기록.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function LifeDailyPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const all = await getPosts({ space: "life", category: "daily" });
  const paged = paginatePosts(all, page);

  return (
    <CategoryPageTemplate
      section={LIFE_NAV}
      categoryLabel="Daily"
      categoryHref="/life/daily"
      summary="하루의 짧은 기록과 일상 메모를 모읍니다."
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
      writeHref={buildWriteHref({ category: "daily" })}
    />
  );
}
