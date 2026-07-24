import { life } from "@/content/life";
import type { LifeContent } from "@/types/content";

/** Life 는 reading 모듈을 포함해 빌드된 스냅샷을 반환합니다. */
export function getLife(): LifeContent {
  return life;
}
