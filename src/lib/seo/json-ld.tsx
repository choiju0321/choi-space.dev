import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/** WebSite + Person — 루트 레이아웃용 */
export function SiteJsonLd() {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: base,
        description: SITE_DESCRIPTION,
        inLanguage: "ko-KR",
      },
      {
        "@type": "Person",
        name: "최지웅",
        url: base,
        jobTitle: "Software Engineer",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type ArticleJsonLdProps = {
  title: string;
  description: string;
  path: string;
  publishedOn: string;
  updatedOn?: string;
  tags?: string[];
};

/** 저널 글 상세용 Article */
export function ArticleJsonLd({
  title,
  description,
  path,
  publishedOn,
  updatedOn,
  tags = [],
}: ArticleJsonLdProps) {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedOn,
    ...(updatedOn ? { dateModified: updatedOn } : {}),
    mainEntityOfPage: `${base}${path}`,
    author: {
      "@type": "Person",
      name: "최지웅",
    },
    publisher: {
      "@type": "Person",
      name: "최지웅",
    },
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
