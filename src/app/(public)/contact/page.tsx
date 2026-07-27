import type { Metadata } from "next";
import { ContactPageView } from "@/features/about/contact-page-view";
import { getProfile } from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "Contact",
  description: "최지웅에게 이메일·GitHub·LinkedIn으로 연락하기.",
  path: "/contact",
});

export default function ContactPage() {
  const profile = getProfile();

  return (
    <ContactPageView
      email={profile.email}
      socialLinks={profile.socialLinks}
    />
  );
}
