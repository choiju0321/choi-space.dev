import { workCompanyShells } from "@/content/work/companies";
import type { NavLinkItem, NavTreeMenu } from "@/content/nav";

/**
 * Work 내비 — Current / Previous / Side → 회사
 * 셸만 사용 (projects.json / fs 없음 → 헤더에서 안전)
 */
export function getWorkNav(): NavTreeMenu {
  const toLinks = (
    shells: typeof workCompanyShells,
  ): NavLinkItem[] =>
    shells.map((company) => ({
      href: `/work/${company.slug}`,
      label: company.name,
    }));

  const current = workCompanyShells.filter(
    (company) => company.kind === "employer" && company.current,
  );
  const previous = workCompanyShells.filter(
    (company) => company.kind === "employer" && !company.current,
  );
  const side = workCompanyShells.filter((company) => company.kind === "side");

  return {
    id: "work",
    label: "Work",
    overviewHref: "/work",
    items: [
      {
        href: "/work",
        label: "Current",
        showOverview: false,
        children: toLinks(current),
      },
      {
        href: "/work",
        label: "Previous",
        showOverview: false,
        children: toLinks(previous),
      },
      {
        href: "/work",
        label: "Side",
        showOverview: false,
        children: toLinks(side),
      },
    ],
  };
}
