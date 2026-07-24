import type { Metadata } from "next";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { LIFE_NAV } from "@/content/nav";
import {
  getReadingPostsAsList,
  paginateArchivePosts,
} from "@/lib/content/archive-as-posts";

export const metadata: Metadata = {
  title: "Reading · Life",
  description: "책과 독후감 기록.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ReadingArchivePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const paged = paginateArchivePosts(getReadingPostsAsList(), page);

  return (
    <CategoryPageTemplate
      section={LIFE_NAV}
      categoryLabel="Reading"
      categoryHref="/life/reading"
      summary="읽은 책과 독후감을 기록합니다."
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
    />
  );
}
