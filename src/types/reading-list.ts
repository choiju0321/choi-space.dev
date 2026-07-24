export type ReadingListItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  readOn: string;
  displayDate: string;
  clubName: string | null;
  excerpt: string;
  tags: string[];
  hasReview: boolean;
  hasPresentation: boolean;
  /** member 클럽 | guest 놀러가기 | personal 개인 */
  scope: "club" | "guest" | "personal";
};
