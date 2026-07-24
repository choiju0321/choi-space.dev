import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Profile } from "@/types/content";

type SiteShellProps = {
  children: React.ReactNode;
  profile: Pick<Profile, "brandName" | "name">;
  authenticated: boolean;
};

export function SiteShell({
  children,
  profile,
  authenticated,
}: SiteShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader brandName={profile.brandName} authenticated={authenticated} />
      <main className="flex-1">{children}</main>
      <SiteFooter brandName={profile.brandName} />
    </div>
  );
}
