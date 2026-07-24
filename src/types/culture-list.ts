import type { CultureKind } from "@/types/culture";

export type CultureListItem = {
  id: string;
  slug: string;
  title: string;
  kind: CultureKind;
  kindLabel: string;
  watchedOn: string;
  displayDate: string;
  place: string;
  seat: string | null;
  castLabel: string | null;
  excerpt: string;
  tags: string[];
  hasReview: boolean;
  posterImage: string | null;
};
