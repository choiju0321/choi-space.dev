import { SiteShell } from "@/components/layout/site-shell";
import { getProfile } from "@/lib/content";
import { hasWriteSession } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = getProfile();
  const authenticated = await hasWriteSession();

  return (
    <SiteShell profile={profile} authenticated={authenticated}>
      {children}
    </SiteShell>
  );
}
