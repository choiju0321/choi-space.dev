"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { NavLinkItem, NavMenu, NavTreeItem, NavTreeMenu } from "@/content/nav";

type Align = "left" | "right";

type SharedProps = {
  align?: Align;
  className?: string;
};

function useNavMenuOpen() {
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

  return { open, setOpen, rootRef, menuId };
}

function Chevron({
  open,
  direction = "down",
}: {
  open?: boolean;
  direction?: "down" | "left" | "right";
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn(
        "size-2.5 shrink-0 opacity-60 transition-transform duration-150",
        direction === "down" && open && "rotate-180",
        direction === "left" && "rotate-90",
        direction === "right" && "-rotate-90",
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
  );
}

function DropdownTrigger({
  label,
  open,
  menuId,
  onToggle,
}: {
  label: string;
  open: boolean;
  menuId: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1 text-[0.8125rem] tracking-wide whitespace-nowrap",
        "text-[var(--color-muted)] transition-colors",
        open
          ? "text-[var(--color-foreground)]"
          : "hover:text-[var(--color-foreground)]",
      )}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      onClick={onToggle}
    >
      {label}
      <Chevron open={open} direction="down" />
    </button>
  );
}

function MenuPanel({
  menuId,
  align,
  className,
  children,
}: {
  menuId: string;
  align: Align;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={menuId}
      role="menu"
      className={cn(
        "absolute top-full z-50 pt-1",
        align === "right" ? "right-0" : "left-0",
        className,
      )}
    >
      <ul
        className={cn(
          "min-w-[11rem] overflow-visible py-2",
          "border border-[var(--color-border)]",
          "bg-[var(--color-background)]",
        )}
      >
        {children}
      </ul>
    </div>
  );
}

function MenuLink({
  href,
  label,
  emphasis,
  onNavigate,
}: {
  href: string;
  label: string;
  emphasis?: boolean;
  onNavigate: () => void;
}) {
  return (
    <li role="none">
      <Link
        role="menuitem"
        href={href}
        className={cn(
          "block px-3.5 py-2 transition-colors hover:bg-[var(--color-surface)]",
          emphasis
            ? "text-[0.8125rem] text-[var(--color-foreground)]"
            : "text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
        onClick={onNavigate}
      >
        {label}
      </Link>
    </li>
  );
}

function MenuSeparator() {
  return (
    <li
      role="separator"
      className="my-1.5 border-t border-[var(--color-border)]/70"
    />
  );
}

/** 1depth 항목 + 옆 플라이아웃 세부 메뉴 */
function TreeMenuItem({
  item,
  flyoutSide,
  onNavigate,
}: {
  item: NavTreeItem;
  /** 세부 메뉴가 열리는 쪽 — Story는 보통 왼쪽(화면 안쪽) */
  flyoutSide: "left" | "right";
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const submenuId = useId();
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    return (
      <MenuLink
        href={item.href}
        label={item.label}
        emphasis
        onNavigate={onNavigate}
      />
    );
  }

  const children = item.children as NavLinkItem[];

  return (
    <li
      role="none"
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 transition-colors",
          open
            ? "bg-[var(--color-surface)] text-[var(--color-foreground)]"
            : "text-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
        )}
      >
        <Link
          role="menuitem"
          href={item.href}
          className="min-w-0 flex-1 text-[0.8125rem]"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={submenuId}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
        <button
          type="button"
          className="inline-flex size-5 items-center justify-center text-[var(--color-muted)]"
          aria-label={`${item.label} 세부 메뉴`}
          aria-expanded={open}
          aria-controls={submenuId}
          onClick={(event) => {
            event.preventDefault();
            setOpen((value) => !value);
          }}
        >
          <Chevron direction={flyoutSide === "left" ? "left" : "right"} />
        </button>
      </div>

      {open ? (
        <ul
          id={submenuId}
          role="menu"
          className={cn(
            "absolute top-0 z-[60] min-w-[11rem] py-2",
            "border border-[var(--color-border)] bg-[var(--color-background)]",
            flyoutSide === "left"
              ? "right-full mr-1"
              : "left-full ml-1",
          )}
        >
          {item.showOverview !== false ? (
            <>
              <MenuLink
                href={item.href}
                label="Overview"
                emphasis
                onNavigate={onNavigate}
              />
              <MenuSeparator />
            </>
          ) : null}
          {children.map((child) => (
            <MenuLink
              key={child.href}
              href={child.href}
              label={child.label}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

type NavDropdownProps = SharedProps & {
  section: NavMenu;
};

export function NavDropdown({
  section,
  align = "right",
  className,
}: NavDropdownProps) {
  const { open, setOpen, rootRef, menuId } = useNavMenuOpen();

  return (
    <li
      ref={rootRef}
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownTrigger
        label={section.label}
        open={open}
        menuId={menuId}
        onToggle={() => setOpen((value) => !value)}
      />

      {open ? (
        <MenuPanel menuId={menuId} align={align}>
          {section.overviewHref ? (
            <>
              <MenuLink
                href={section.overviewHref}
                label="Overview"
                emphasis
                onNavigate={() => setOpen(false)}
              />
              <MenuSeparator />
            </>
          ) : null}
          {section.items.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              label={item.label}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </MenuPanel>
      ) : null}
    </li>
  );
}

type NavGroupedDropdownProps = SharedProps & {
  menu: NavTreeMenu;
  /** 하위 플라이아웃 방향. 기본은 오른쪽(세부 메뉴) */
  flyoutSide?: "left" | "right";
};

/** Story / Work처럼 1depth + 세부 플라이아웃 */
export function NavGroupedDropdown({
  menu,
  align = "right",
  flyoutSide = "right",
  className,
}: NavGroupedDropdownProps) {
  const { open, setOpen, rootRef, menuId } = useNavMenuOpen();

  return (
    <li
      ref={rootRef}
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownTrigger
        label={menu.label}
        open={open}
        menuId={menuId}
        onToggle={() => setOpen((value) => !value)}
      />

      {open ? (
        <MenuPanel menuId={menuId} align={align}>
          {menu.overviewHref ? (
            <>
              <MenuLink
                href={menu.overviewHref}
                label={menu.overviewLabel ?? "Overview"}
                emphasis
                onNavigate={() => setOpen(false)}
              />
              <MenuSeparator />
            </>
          ) : null}
          {menu.items.map((item) => (
            <TreeMenuItem
              key={`${item.label}:${item.href}`}
              item={item}
              flyoutSide={flyoutSide}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </MenuPanel>
      ) : null}
    </li>
  );
}
