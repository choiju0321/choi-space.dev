import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal",
  robots: { index: false, follow: false },
};

export default function RecordsHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Personal"
      title="개인 기록"
      summary="건강검진·서류·미디어·듀오 소개팅 프로필처럼 Work·Career·Finance·Life 밖 개인 영역을 둡니다."
      phaseNote="Health · Documents · Media · Dating 연결됨."
      links={[
        { href: "/health", label: "건강검진 →" },
        { href: "/documents", label: "서류 금고 →" },
        { href: "/media", label: "미디어 브라우저 →" },
        { href: "/dating", label: "Dating (Duo) →" },
      ]}
    />
  );
}
