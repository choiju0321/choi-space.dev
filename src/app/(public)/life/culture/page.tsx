import type { Metadata } from "next";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { LIFE_NAV } from "@/content/nav";
import {
  getCulturePostsAsList,
  paginateArchivePosts,
} from "@/lib/content/archive-as-posts";

export const metadata: Metadata = {
  title: "Culture · Life",
  description: "뮤지컬·공연 관람 기록.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CultureArchivePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const paged = paginateArchivePosts(getCulturePostsAsList(), page);

  return (
    <CategoryPageTemplate
      section={LIFE_NAV}
      categoryLabel="Culture"
      categoryHref="/life/culture"
      summary="공연과 관람의 기록을 남깁니다."
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
    />
  );
}
