import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type PostTagProps = {
  label: string;
  href?: string;
  className?: string;
};

/** Tag는 알약이 아니라 middot·텍스트 메타 */
export function PostTag({ label, href, className }: PostTagProps) {
  const classNames = cn(
    "text-sm text-[var(--color-muted-soft)] transition-opacity hover:opacity-70",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {label}
      </Link>
    );
  }

  return <span className={classNames}>{label}</span>;
}

type PostTagListProps = {
  tags: string[];
  space?: string;
  className?: string;
};

export function PostTagList({ tags, space, className }: PostTagListProps) {
  if (!tags.length) return null;

  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {tags.map((tag, index) => (
        <span key={tag} className="inline-flex items-center gap-x-2">
          {index > 0 ? (
            <span className="text-[var(--color-muted-soft)]" aria-hidden>
              ·
            </span>
          ) : null}
          <PostTag
            label={tag}
            href={space ? `/${space}?tag=${encodeURIComponent(tag)}` : undefined}
          />
        </span>
      ))}
    </p>
  );
}
