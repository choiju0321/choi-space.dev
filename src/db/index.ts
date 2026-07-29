import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL이 없습니다. `.env.local`을 확인하거나 `cp .env.example .env.local` 하세요.",
  );
}

/** Node 런타임 전용. Edge에서는 쓰지 마세요. */
const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
