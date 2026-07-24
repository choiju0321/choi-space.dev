import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { PostTagList } from "@/features/content/post-tag";
import type { PostListItem } from "@/types/post";
import { cn } from "@/lib/utils/cn";

type PostCardProps = {
  post: PostListItem;
  /** featured: 더 큰 타이포, list: 구분선 행 */
  variant?: "list" | "featured";
  showTags?: boolean;
  delayMs?: number;
  className?: string;
};

function CoverThumb({
  src,
  alt,
  size = "sm",
  aspect = "portrait",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md";
  aspect?: "portrait" | "landscape";
}) {
  const isLandscape = aspect === "landscape";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[var(--color-surface-muted)]",
        isLandscape
          ? size === "sm"
            ? "aspect-[4/3] w-20 sm:w-24"
            : "aspect-[4/3] w-28 sm:w-32"
          : size === "sm"
            ? "aspect-[2/3] w-14 sm:w-16"
            : "aspect-[2/3] w-20 sm:w-24",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export function PostCard({
  post,
  variant = "list",
  showTags = false,
  delayMs = 0,
  className,
}: PostCardProps) {
  const cover = post.coverImage;
  const aspect = post.coverAspect ?? "portrait";

  if (variant === "featured") {
    return (
      <FadeIn delayMs={delayMs} className={className}>
        <Link
          href={post.href}
          className="group flex gap-6 border-t border-[var(--color-border)]/70 pt-8 sm:gap-8"
        >
          {cover ? (
            <CoverThumb src={cover} alt="" size="md" aspect={aspect} />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Featured
              <span className="mx-2 text-[var(--color-border)]">·</span>
              {post.categoryLabel}
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity group-hover:opacity-70 sm:text-4xl">
              {post.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              {post.excerpt}
            </p>
            <p className="mt-6 text-sm text-[var(--color-muted-soft)]">
              <time dateTime={post.publishedOn}>{post.displayDate}</time>
              <span className="ml-4 inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                읽기
                <span aria-hidden>→</span>
              </span>
            </p>
            {showTags ? (
              <PostTagList
                tags={post.tags}
                space={post.space}
                className="mt-4"
              />
            ) : null}
          </div>
        </Link>
      </FadeIn>
    );
  }

  return (
    <FadeIn delayMs={delayMs} className={className}>
      <Link
        href={post.href}
        className="group flex gap-4 border-t border-[var(--color-border)]/70 py-6 sm:gap-6"
      >
        {cover ? (
          <CoverThumb src={cover} alt="" size="sm" aspect={aspect} />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <p className="text-[0.7rem] tracking-[0.12em] text-[var(--color-muted-soft)] uppercase">
              {post.categoryLabel}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity group-hover:opacity-70 sm:text-2xl">
              {post.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
              {post.excerpt}
            </p>
            {showTags ? (
              <PostTagList
                tags={post.tags}
                space={post.space}
                className="mt-3"
              />
            ) : null}
          </div>
          <time
            dateTime={post.publishedOn}
            className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]"
          >
            {post.displayDate}
          </time>
        </div>
      </Link>
    </FadeIn>
  );
}

type PostCardListProps = {
  posts: PostListItem[];
  showTags?: boolean;
  className?: string;
};

export function PostCardList({
  posts,
  showTags = false,
  className,
}: PostCardListProps) {
  return (
    <div className={cn("border-b border-[var(--color-border)]/70", className)}>
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          showTags={showTags}
          delayMs={Math.min(index * 60, 240)}
        />
      ))}
    </div>
  );
}
