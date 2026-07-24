import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { NOTES_NAV } from "@/content/nav";
import { getPosts, paginatePosts } from "@/lib/content/get-posts";

const SUMMARIES: Record<string, string> = {
  finance: "금융·투자 정보를 정리합니다.",
  "real-estate": "부동산·청약·계약 정보를 모아 둡니다.",
  productivity: "생산성 팁과 방법을 정리합니다.",
  tips: "짧은 팁과 메모를 남깁니다.",
  archive: "분류 전 기록을 보관합니다.",
};

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export function generateStaticParams() {
  return NOTES_NAV.items.map((item) => ({
    category: item.href.replace("/notes/", ""),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const item = NOTES_NAV.items.find(
    (entry) => entry.href === `/notes/${category}`,
  );
  if (!item) return { title: "Notes" };
  return {
    title: `${item.label} · Notes`,
    description: SUMMARIES[category],
  };
}

export default async function NotesCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const item = NOTES_NAV.items.find(
    (entry) => entry.href === `/notes/${category}`,
  );
  if (!item) notFound();

  const page = Number(pageParam ?? "1") || 1;
  const all = getPosts({ space: "notes", category });
  const paged = paginatePosts(all, page);

  return (
    <CategoryPageTemplate
      section={NOTES_NAV}
      categoryLabel={item.label}
      categoryHref={item.href}
      summary={SUMMARIES[category] ?? `${item.label} 글을 모읍니다.`}
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
    />
  );
}
