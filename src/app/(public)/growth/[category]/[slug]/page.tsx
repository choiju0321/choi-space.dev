import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPostDetailModel } from "@/features/content/build-post-detail";
import { PostDetail } from "@/features/content/post-detail";
import { GROWTH_NAV } from "@/content/nav";
import { posts } from "@/content/posts";
import { getPostBySlug } from "@/lib/content/get-posts";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export function generateStaticParams() {
  return posts
    .filter((post) => post.space === "growth")
    .map((post) => ({ category: post.category, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPostBySlug("growth", category, slug);
  if (!post) return { title: "Growth" };
  return {
    title: `${post.title} · Growth`,
    description: post.excerpt,
  };
}

export default async function GrowthPostPage({ params }: PageProps) {
  const { category, slug } = await params;
  const post = getPostBySlug("growth", category, slug);
  if (!post) notFound();

  const model = buildPostDetailModel(post, GROWTH_NAV);
  return <PostDetail {...model} />;
}
