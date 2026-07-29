import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPostDetailModel } from "@/features/content/build-post-detail";
import { PostDetail } from "@/features/content/post-detail";
import { GROWTH_NAV } from "@/content/nav";
import { loadPosts, postHref } from "@/content/posts";
import { getPostBySlug } from "@/lib/content/get-posts";
import { ArticleJsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await loadPosts())
    .filter((post) => post.space === "growth")
    .map((post) => ({ category: post.category, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = await getPostBySlug("growth", category, slug);
  if (!post) return { title: "Growth" };
  return buildPublicMetadata({
    title: post.title,
    description: post.excerpt,
    path: postHref(post),
    type: "article",
    publishedOn: post.publishedOn,
    updatedOn: post.updatedOn,
    ogImage: post.coverImage ?? post.seo?.ogImage,
  });
}

export default async function GrowthPostPage({ params }: PageProps) {
  const { category, slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = await getPostBySlug("growth", category, slug);
  if (!post) notFound();

  const model = await buildPostDetailModel(post, GROWTH_NAV);
  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        path={postHref(post)}
        publishedOn={post.publishedOn}
        updatedOn={post.updatedOn}
        tags={post.tags}
      />
      <PostDetail {...model} />
    </>
  );
}
