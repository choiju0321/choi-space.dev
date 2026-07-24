import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "일",
  robots: { index: false, follow: false },
};

export default function WorkHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Work"
      title="일"
      summary="회사별 업무·평가 시즌 기록의 원장입니다. 엑셀로 관리하던 ‘내가 한 일’을 여기로 옮깁니다."
      phaseNote="Phase 2에서 본격 구현 예정입니다."
    />
  );
}
