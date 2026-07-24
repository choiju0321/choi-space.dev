"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export const LIFE_SUBNAV = [
  { href: "/life/reading", label: "Reading" },
  { href: "/life/running", label: "Running" },
  { href: "/life/culture", label: "Culture" },
  { href: "/life/food", label: "Food" },
  { href: "/life/cafe", label: "Cafe" },
  { href: "/life/travel", label: "Travel" },
] as const;

type LifeNavMenuProps = {
  className?: string;
};

export function LifeNavMenu({ className }: LifeNavMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li
      ref={rootRef}
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 text-sm whitespace-nowrap",
          "text-[var(--color-muted)] transition-colors",
          open
            ? "text-[var(--color-foreground)]"
            : "hover:text-[var(--color-foreground)]",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Life
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "size-2.5 opacity-60 transition-transform duration-150",
            open && "rotate-180",
          )}
        >
          <path
            d="M2.5 4.5 L6 8 L9.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-50 pt-1"
        >
          <ul
            className={cn(
              "min-w-[11rem] overflow-hidden rounded-lg py-1.5",
              "border border-[var(--color-border)]",
              "bg-[var(--color-background)]",
              "shadow-[0_8px_24px_rgba(20,23,28,0.08)]",
            )}
          >
            <li role="none">
              <Link
                role="menuitem"
                href="/#life"
                className="block px-3.5 py-2 text-sm text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface)]"
                onClick={() => setOpen(false)}
              >
                Overview
              </Link>
            </li>
            <li
              role="separator"
              className="my-1.5 border-t border-[var(--color-border)]/70"
            />
            {LIFE_SUBNAV.map((item) => (
              <li key={item.href} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  className="block px-3.5 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
