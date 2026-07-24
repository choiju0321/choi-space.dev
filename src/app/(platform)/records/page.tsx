import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기타 기록",
  robots: { index: false, follow: false },
};

export default function RecordsHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Records"
      title="기타 기록"
      summary="건강검진·결정사 프로필·보험·헌혈처럼 Life·일·금융이 아닌 개인 기록을 둡니다."
      phaseNote="Phase 5. Health는 먼저 연결해 두었습니다."
      links={[{ href: "/health", label: "건강검진 →" }]}
    />
  );
}
