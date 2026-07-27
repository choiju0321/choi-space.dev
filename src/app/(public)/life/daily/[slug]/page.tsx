import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPostDetailModel } from "@/features/content/build-post-detail";
import { PostDetail } from "@/features/content/post-detail";
import { LIFE_NAV } from "@/content/nav";
import { postHref } from "@/content/posts";
import { getPostBySlug } from "@/lib/content/get-posts";
import { ArticleJsonLd } from "@/lib/seo/json-ld";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = getPostBySlug("life", "daily", slug);
  if (!post) return { title: "Daily · Life" };
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

export default async function LifeDailyPostPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = getPostBySlug("life", "daily", slug);
  if (!post) notFound();

  const model = buildPostDetailModel(post, LIFE_NAV);
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
