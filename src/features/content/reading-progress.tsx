"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ReadingProgressProps = {
  className?: string;
};

/** 상단 hairline — 존재감 최소 */
export function ReadingProgress({ className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const article = document.querySelector("[data-reading-root]");
      if (!article) {
        setProgress(0);
        return;
      }

      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(100);
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress((scrolled / total) * 100);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-14 z-[60] h-px bg-transparent sm:top-[3.75rem]",
        className,
      )}
      aria-hidden
    >
      <div
        className="h-full origin-left bg-[var(--color-foreground)] transition-[width] duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
