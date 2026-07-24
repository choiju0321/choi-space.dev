import type { CultureListItem } from "@/types/culture-list";
import type { PlaceDomain, PlaceListItem } from "@/types/place";
import type { PostListItem } from "@/types/post";
import type { ReadingListItem } from "@/types/reading-list";
import type { RunningListItem } from "@/types/running-list";
import { getCultureListItems } from "@/lib/content/get-culture";
import { getPlaceListItems } from "@/lib/content/get-place";
import { getReadingListItems } from "@/lib/content/get-reading";
import { getRunningListItems } from "@/lib/content/get-running";
import { paginatePosts } from "@/lib/content/get-posts";

function byNewest(a: PostListItem, b: PostListItem) {
  return b.publishedOn.localeCompare(a.publishedOn);
}

const PLACE_LABEL: Record<PlaceDomain, string> = {
  food: "Food",
  cafe: "Cafe",
  travel: "Travel",
};

export function readingToPostListItem(item: ReadingListItem): PostListItem {
  const meta = [item.author, item.clubName].filter(Boolean).join(" · ");
  return {
    id: item.id,
    slug: item.slug,
    space: "life",
    category: "reading",
    categoryLabel: "Reading",
    title: item.title,
    excerpt: item.excerpt || meta,
    publishedOn: item.readOn,
    displayDate: item.displayDate,
    tags: item.tags,
    featured: false,
    href: `/life/reading/${item.slug}`,
  };
}

export function runningToPostListItem(item: RunningListItem): PostListItem {
  const meta = [item.kindLabel, item.distanceLabel, item.place]
    .filter(Boolean)
    .join(" · ");
  return {
    id: item.id,
    slug: item.slug,
    space: "life",
    category: "running",
    categoryLabel: "Running",
    title: item.title,
    excerpt: item.excerpt || meta,
    publishedOn: item.ranOn,
    displayDate: item.displayDate,
    tags: item.tags,
    featured: false,
    href: `/life/running/${item.slug}`,
  };
}

export function cultureToPostListItem(item: CultureListItem): PostListItem {
  const meta = [item.kindLabel, item.place].filter(Boolean).join(" · ");
  return {
    id: item.id,
    slug: item.slug,
    space: "life",
    category: "culture",
    categoryLabel: "Culture",
    title: item.title,
    excerpt: item.excerpt || meta,
    publishedOn: item.watchedOn,
    displayDate: item.displayDate.split(" ")[0] ?? item.displayDate,
    tags: item.tags,
    featured: false,
    href: `/life/culture/${item.slug}`,
    coverImage: item.posterImage,
    coverAspect: "portrait",
  };
}

export function placeToPostListItem(
  domain: PlaceDomain,
  item: PlaceListItem,
): PostListItem {
  return {
    id: item.id,
    slug: item.slug,
    space: "life",
    category: domain,
    categoryLabel: PLACE_LABEL[domain],
    title: item.title,
    excerpt: item.excerpt || item.place,
    publishedOn: item.visitedOn,
    displayDate: item.displayDate,
    tags: item.tags,
    featured: false,
    href: `/life/${domain}/${item.slug}`,
    coverImage: item.coverImage,
    coverAspect: "landscape",
  };
}

export function getReadingPostsAsList() {
  return getReadingListItems().map(readingToPostListItem).sort(byNewest);
}

export function getRunningPostsAsList() {
  return getRunningListItems().map(runningToPostListItem).sort(byNewest);
}

export function getCulturePostsAsList() {
  return getCultureListItems().map(cultureToPostListItem).sort(byNewest);
}

export function getPlacePostsAsList(domain: PlaceDomain) {
  return getPlaceListItems(domain)
    .map((item) => placeToPostListItem(domain, item))
    .sort(byNewest);
}

/** Life Overview Latest용 — 공개 메뉴 아카이브 전부 */
export function getAllLifeArchivePosts() {
  return [
    ...getReadingPostsAsList(),
    ...getRunningPostsAsList(),
    ...getCulturePostsAsList(),
    ...getPlacePostsAsList("food"),
    ...getPlacePostsAsList("travel"),
  ].sort(byNewest);
}

export function paginateArchivePosts(
  items: PostListItem[],
  page: number,
  pageSize = 8,
) {
  return paginatePosts(items, page, pageSize);
}
