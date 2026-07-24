import { SiteShell } from "@/components/layout/site-shell";
import { getProfile } from "@/lib/content";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = getProfile();

  return <SiteShell profile={profile}>{children}</SiteShell>;
}
