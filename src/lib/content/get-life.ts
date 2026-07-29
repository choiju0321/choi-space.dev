import { buildLife } from "@/content/life";
import type { LifeContent } from "@/types/content";

/** Life 컬렉션을 Postgres에서 조립해 반환합니다. */
export async function getLife(): Promise<LifeContent> {
  return buildLife();
}
