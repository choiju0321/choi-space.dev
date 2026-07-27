import { cn } from "@/lib/utils/cn";
import { FadeIn } from "@/components/ui/fade-in";

type DetailSectionProps = {
  label: string;
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  /** 라벨 → 본문 간격 (기본 mt-2) */
  contentClassName?: string;
};

/** Reading 상세 등 — Title / Review / Date / Attachment 공통 여백·타이포 */
export function DetailSection({
  label,
  children,
  delayMs = 0,
  className,
  contentClassName,
}: DetailSectionProps) {
  return (
    <FadeIn delayMs={delayMs} className={cn("mt-5", className)}>
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        {label}
      </p>
      <div className={cn("mt-2", contentClassName)}>{children}</div>
    </FadeIn>
  );
}

export const detailSectionBodyClassName =
  "text-base leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9";
