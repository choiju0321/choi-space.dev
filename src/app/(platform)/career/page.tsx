import type { Metadata } from "next";
import { PlatformHubPage } from "@/features/platform/platform-hub-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "커리어",
  robots: { index: false, follow: false },
};

export default function CareerHubPage() {
  return (
    <PlatformHubPage
      eyebrow="Career"
      title="커리어"
      summary="이직용 프로필과 공고·포지션별 공개 패키지를 관리합니다. ‘일’에서 골라 밖으로 내보내는 레이어입니다."
      phaseNote="Phase 3에서 공개 패키지를 붙입니다. 홈 Career 섹션 데이터는 여기서 재구성될 예정입니다."
      links={[{ href: "/#career", label: "현재 홈 Career 섹션 보기" }]}
    />
  );
}
