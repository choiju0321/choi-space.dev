"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type ShareProps = {
  title: string;
  className?: string;
};

export function Share({ title, className }: ShareProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function shareOnX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]",
        className,
      )}
    >
      <span className="text-[var(--color-muted-soft)]">공유</span>
      <button
        type="button"
        onClick={copyLink}
        className="transition-opacity hover:opacity-70"
      >
        {copied ? "링크 복사됨" : "링크 복사"}
      </button>
      <button
        type="button"
        onClick={shareOnX}
        className="transition-opacity hover:opacity-70"
      >
        X
      </button>
    </div>
  );
}
