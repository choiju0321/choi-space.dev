import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/features/content/category-page-template";
import { LIFE_NAV } from "@/content/nav";
import {
  getPlacePostsAsList,
  paginateArchivePosts,
} from "@/lib/content/archive-as-posts";
import { buildWriteHref } from "@/lib/write/href";
import type { PlaceDomain } from "@/types/place";

const DOMAIN_META: Record<PlaceDomain, { label: string; summary: string }> = {
  food: {
    label: "Food",
    summary: "맛집과 카페를 사진·위치와 함께 남깁니다.",
  },
  travel: {
    label: "Travel",
    summary: "여행의 장면들을 기록합니다.",
  },
};

type PageProps = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ page?: string }>;
};

function asDomain(value: string): PlaceDomain | null {
  if (value === "food" || value === "travel") return value;
  return null;
}

export function generateStaticParams() {
  return [{ domain: "food" }, { domain: "travel" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw } = await params;
  const domain = asDomain(raw);
  if (!domain) return { title: "Life" };
  return {
    title: `${DOMAIN_META[domain].label} · Life`,
    description: DOMAIN_META[domain].summary,
  };
}

export default async function PlaceArchivePage({
  params,
  searchParams,
}: PageProps) {
  const { domain: raw } = await params;
  const { page: pageParam } = await searchParams;
  const domain = asDomain(raw);
  if (!domain) notFound();

  const meta = DOMAIN_META[domain];
  const page = Number(pageParam ?? "1") || 1;
  const paged = paginateArchivePosts(await getPlacePostsAsList(domain), page);

  return (
    <CategoryPageTemplate
      section={LIFE_NAV}
      categoryLabel={meta.label}
      categoryHref={`/life/${domain}`}
      summary={meta.summary}
      posts={paged.items}
      page={paged.page}
      totalPages={paged.totalPages}
      writeHref={buildWriteHref({ category: domain })}
    />
  );
}
