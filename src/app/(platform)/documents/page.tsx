import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default function DocumentsHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Documents"
      title="서류 금고"
      summary="등본·초본·재직증명서처럼 자주 제출하는 서류를 모아 두고 내려받습니다."
      phaseNote="Phase 1에서 업로드·목록·다운로드를 구현합니다."
    />
  );
}
