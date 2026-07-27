import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { GROWTH_NAV } from "@/content/nav";
import { getPosts, paginatePosts } from "@/lib/content/get-posts";
import { buildWriteHref } from "@/lib/write/href";

const SUMMARIES: Record<string, string> = {
  development: "개발과 엔지니어링에서 배운 것을 기록합니다.",
  ai: "AI 도구와 워크플로 실험을 남깁니다.",
  finance: "금융·투자를 배우며 정리합니다.",
  english: "영어 학습과 연습을 기록합니다.",
  productivity: "일의 방식과 습관을 남깁니다.",
};

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export function generateStaticParams() {
  return GROWTH_NAV.items.map((item) => ({
    category: item.href.replace("/growth/", ""),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const item = GROWTH_NAV.items.find(
    (entry) => entry.href === `/growth/${category}`,
  );
  if (!item) return { title: "Growth" };
  return {
    title: `${item.label} · Growth`,
    description: SUMMARIES[category],
  };
}

export default async function GrowthCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const item = GROWTH_NAV.items.find(
    (entry) => entry.href === `/growth/${category}`,
  );
  if (!item) notFound();

  const page = Number(pageParam ?? "1") || 1;
  const all = getPosts({ space: "growth", category });
  const paged = paginatePosts(all, page);

  return (
    <CategoryPageTemplate
      section={GROWTH_NAV}
      categoryLabel={item.label}
      categoryHref={item.href}
      summary={SUMMARIES[category] ?? `${item.label} 글을 모읍니다.`}
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
      writeHref={buildWriteHref({
        category: "growth",
        journalCategory: category,
      })}
    />
  );
}
