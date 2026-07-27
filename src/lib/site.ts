/**
 * Public site origin for sitemap · RSS · canonical · OG.
 * Override with NEXT_PUBLIC_SITE_URL in production.
 */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://choi-space.dev";
}

export const SITE_NAME = "Choi Space";
export const SITE_DESCRIPTION =
  "소개는 한 페이지지만, 기록은 한 사람을 보여줍니다. 최지웅의 개인 아카이브 Choi Space.";
