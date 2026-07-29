import {
  boolean,
  date,
  doublePrecision,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Story spaces only — Life / Growth / Notes */
export const contentSpaceEnum = pgEnum("content_space", [
  "life",
  "growth",
  "notes",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "published",
  "draft",
  "archived",
]);

/**
 * Story 공통 게시글.
 * Daily / Growth / Notes = body만.
 * Reading / Running / Culture / Place = detail 1:1.
 */
export const contents = pgTable(
  "contents",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    space: contentSpaceEnum("space").notNull(),
    category: text("category").notNull(),
    contentType: text("content_type").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    publishedOn: date("published_on").notNull(),
    updatedOn: date("updated_on"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    coverImage: text("cover_image"),
    coverAspect: text("cover_aspect"),
    author: text("author"),
    series: text("series"),
    status: contentStatusEnum("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contents_space_category_slug_uidx").on(
      table.space,
      table.category,
      table.slug,
    ),
    index("contents_published_on_idx").on(table.publishedOn),
    index("contents_type_idx").on(table.contentType),
  ],
);

export const contentReadingDetails = pgTable("content_reading_details", {
  contentId: text("content_id")
    .primaryKey()
    .references(() => contents.id, { onDelete: "cascade" }),
  bookAuthor: text("book_author").notNull(),
  readOn: text("read_on").notNull(),
  participation: text("participation").notNull().default("personal"),
  clubSeasonId: text("club_season_id"),
  guestClubName: text("guest_club_name"),
  artifacts: jsonb("artifacts").$type<unknown[]>().notNull().default([]),
});

export const contentRunningDetails = pgTable("content_running_details", {
  contentId: text("content_id")
    .primaryKey()
    .references(() => contents.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  ranOn: date("ran_on").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  place: text("place"),
  eventName: text("event_name"),
  resultTime: text("result_time"),
  bibNumber: text("bib_number"),
  source: text("source"),
  artifacts: jsonb("artifacts").$type<unknown[]>().notNull().default([]),
});

export const contentCultureDetails = pgTable("content_culture_details", {
  contentId: text("content_id")
    .primaryKey()
    .references(() => contents.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  watchedOn: date("watched_on").notNull(),
  watchedAt: text("watched_at"),
  place: text("place").notNull(),
  seat: text("seat"),
  cast: jsonb("cast").$type<string[]>().notNull().default([]),
  source: text("source"),
});

export const contentPlaceDetails = pgTable("content_place_details", {
  contentId: text("content_id")
    .primaryKey()
    .references(() => contents.id, { onDelete: "cascade" }),
  place: text("place").notNull(),
  visitedOn: date("visited_on").notNull(),
  visitedUntil: date("visited_until"),
  kind: text("kind"),
  naverMapUrl: text("naver_map_url"),
  catchTableUrl: text("catch_table_url"),
});

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    contentId: text("content_id")
      .notNull()
      .references(() => contents.id, { onDelete: "cascade" }),
    publicPath: text("public_path").notNull(),
    sortOrder: text("sort_order").notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("media_assets_content_idx").on(table.contentId),
    uniqueIndex("media_assets_public_path_uidx").on(table.publicPath),
  ],
);

export type ContentRow = typeof contents.$inferSelect;
export type ContentReadingDetailRow = typeof contentReadingDetails.$inferSelect;
export type ContentRunningDetailRow = typeof contentRunningDetails.$inferSelect;
export type ContentCultureDetailRow = typeof contentCultureDetails.$inferSelect;
export type ContentPlaceDetailRow = typeof contentPlaceDetails.$inferSelect;
export type MediaAssetRow = typeof mediaAssets.$inferSelect;
