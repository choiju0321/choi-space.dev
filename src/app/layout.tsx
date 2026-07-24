import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Choi Space · 최지웅",
    template: "%s · Choi Space",
  },
  description:
    "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다. 최지웅의 개인 아카이브 Choi Space.",
  openGraph: {
    title: "Choi Space · 최지웅",
    description:
      "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Choi Space",
  },
  twitter: {
    card: "summary",
    title: "Choi Space · 최지웅",
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
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
