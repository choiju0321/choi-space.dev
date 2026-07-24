import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import type { PostListItem } from "@/types/post";

type RelatedPostsProps = {
  posts: PostListItem[];
};

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <FadeIn>
      <section className="border-t border-[var(--color-border)]/70 pt-12">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Related
        </p>
        <ul className="mt-6 divide-y divide-[var(--color-border)]/70 border-b border-[var(--color-border)]/70">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={post.href}
                className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity group-hover:opacity-70">
                  {post.title}
                </span>
                <span className="text-sm text-[var(--color-muted-soft)]">
                  {post.categoryLabel}
                  <span className="mx-2">·</span>
                  <time dateTime={post.publishedOn}>{post.displayDate}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </FadeIn>
  );
}
