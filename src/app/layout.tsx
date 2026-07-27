import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { SiteJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} · 최지웅`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
  openGraph: {
    title: `${SITE_NAME} · 최지웅`,
    description:
      "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다.",
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} · 최지웅`,
    description:
      "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}
