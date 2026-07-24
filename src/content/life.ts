import type { LifeContent } from "@/types/content";
import { getCultureLifeCollection } from "@/lib/content/get-culture";
import { getPlaceLifeCollection } from "@/lib/content/get-place";
import { getReadingLifeCollection } from "@/lib/content/get-reading";
import { getRunningLifeCollection } from "@/lib/content/get-running";

/**
 * Life — 공개 추억 아카이브 (블로그 방향)
 */
function buildLife(): LifeContent {
  return {
    intro:
      "읽고, 달리고, 보고, 먹고, 머무른 순간들을 남겨 둡니다. 목록은 입구이고, 자세한 이야기는 하나씩 글로 쌓아 갈 예정입니다.",
    collections: [
      getReadingLifeCollection(),
      getRunningLifeCollection(),
      getCultureLifeCollection(),
      getPlaceLifeCollection("food"),
      getPlaceLifeCollection("cafe"),
      getPlaceLifeCollection("travel"),
    ],
  };
}

export const life: LifeContent = buildLife();
