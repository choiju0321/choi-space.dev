import type { Metadata } from "next";
import { Noto_Sans_KR, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Choi Space · 최지웅",
    template: "%s · Choi Space",
  },
  description:
    "최지웅의 개인 공간 Choi Space. 금융 시스템 엔지니어로서의 경험과 가치관을 소개합니다.",
  openGraph: {
    title: "Choi Space · 최지웅",
    description:
      "문제를 구조로 바라보는 금융 시스템 엔지니어, 최지웅을 소개합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Choi Space",
  },
  twitter: {
    card: "summary",
    title: "Choi Space · 최지웅",
    description:
      "문제를 구조로 바라보는 금융 시스템 엔지니어, 최지웅을 소개합니다.",
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
      className={`${sora.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
