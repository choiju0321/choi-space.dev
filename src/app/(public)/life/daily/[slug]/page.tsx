import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPostDetailModel } from "@/features/content/build-post-detail";
import { PostDetail } from "@/features/content/post-detail";
import { LIFE_NAV } from "@/content/nav";
import { posts } from "@/content/posts";
import { getPostBySlug } from "@/lib/content/get-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts
    .filter((post) => post.space === "life" && post.category === "daily")
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug("life", "daily", slug);
  if (!post) return { title: "Daily · Life" };
  return {
    title: `${post.title} · Life`,
    description: post.excerpt,
  };
}

export default async function LifeDailyPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug("life", "daily", slug);
  if (!post) notFound();

  const model = buildPostDetailModel(post, LIFE_NAV);
  return <PostDetail {...model} />;
}
