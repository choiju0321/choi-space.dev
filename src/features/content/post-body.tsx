import type { BodyBlock } from "@/lib/content/get-posts";
import { cn } from "@/lib/utils/cn";

type PostBodyProps = {
  blocks: BodyBlock[];
  className?: string;
};

export function PostBody({ blocks, className }: PostBodyProps) {
  return (
    <div
      className={cn(
        "max-w-[var(--measure)] text-[1.05rem] leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9",
        "[&_strong]:font-medium [&_strong]:text-[var(--color-foreground)]",
        className,
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={`${block.id}-${index}`}
              id={block.id}
              className="mt-14 scroll-mt-28 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)] first:mt-0 sm:text-3xl"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3
              key={`${block.id}-${index}`}
              id={block.id}
              className="mt-10 scroll-mt-28 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "p") {
          return (
            <p
              key={`p-${index}`}
              className="mt-6 first:mt-0"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        }

        if (block.type === "ol") {
          return (
            <ol
              key={`ol-${index}`}
              className="mt-6 list-decimal space-y-2 pl-5 text-[var(--color-muted)]"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </ol>
          );
        }

        return (
          <ul
            key={`ul-${index}`}
            className="mt-6 list-disc space-y-2 pl-5 text-[var(--color-muted)]"
          >
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ul>
        );
      })}
    </div>
  );
}
