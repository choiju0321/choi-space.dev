import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "금융",
  robots: { index: false, follow: false },
};

export default function FinanceHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Finance"
      title="금융"
      summary="자산·소비·경조사·투자·부동산·대출·청약을 한곳에서 봅니다. 관리자 전용입니다."
      phaseNote="Phase 4에서 구현합니다."
    />
  );
}
