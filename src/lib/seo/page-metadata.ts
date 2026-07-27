import type { Metadata } from "next";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

type BuildPublicMetadataOptions = {
  title?: string;
  description?: string;
  /** Absolute path starting with /, e.g. /life/reading */
  path?: string;
  type?: "website" | "article";
  publishedOn?: string;
  updatedOn?: string;
  ogImage?: string;
};

/** Canonical · OG · Twitter 공통 */
export function buildPublicMetadata(
  options: BuildPublicMetadataOptions = {},
): Metadata {
  const base = getSiteUrl();
  const path = options.path ?? "/";
  const url = `${base}${path === "/" ? "" : path}`;
  const title = options.title;
  const description = options.description ?? SITE_DESCRIPTION;
  const ogImage = options.ogImage
    ? options.ogImage.startsWith("http")
      ? options.ogImage
      : `${base}${options.ogImage}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · 최지웅`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: options.type ?? "website",
      ...(options.publishedOn
        ? { publishedTime: options.publishedOn }
        : {}),
      ...(options.updatedOn ? { modifiedTime: options.updatedOn } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · 최지웅`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
