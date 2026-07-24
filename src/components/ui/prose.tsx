import { cn } from "@/lib/utils/cn";

type ProseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9",
        "[&_a]:text-[var(--color-foreground)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-[var(--color-accent)]",
        "[&_p]:mt-6 [&_p:first-child]:mt-0",
        "[&_strong]:font-medium [&_strong]:text-[var(--color-foreground)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
