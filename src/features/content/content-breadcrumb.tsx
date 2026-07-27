import Link from "next/link";
import { Fragment } from "react";

export type ContentBreadcrumbItem = {
  label: string;
  /** 없으면 현재 위치(링크 아님) */
  href?: string;
};

type ContentBreadcrumbProps = {
  items: ContentBreadcrumbItem[];
};

/** Home / Space / Category — Content System 공통 브레드크럼 */
export function ContentBreadcrumb({ items }: ContentBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <p className="text-sm text-[var(--color-muted)]">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 ? (
            <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </Fragment>
      ))}
    </p>
  );
}
