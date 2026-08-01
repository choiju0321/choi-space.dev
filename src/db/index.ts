import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

let cached: DB | null = null;

/**
 * 지연 초기화 — import 시점이 아니라 **실제 DB 사용 시점**에만 연결/검증한다.
 * 그래서 DB를 쓰지 않는 화면(Finance·이사 등 JSON 기반)은 DATABASE_URL 없이도 동작한다.
 * Node 런타임 전용. Edge에서는 쓰지 마세요.
 */
function getDb(): DB {
  if (cached) return cached;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL이 없습니다. `.env.local`을 확인하거나 `cp .env.example .env.local` 하세요.",
    );
  }
  const client = postgres(connectionString, { max: 10 });
  cached = drizzle(client, { schema });
  return cached;
}

/** 기존 `db` export 유지 — 첫 접근 때 lazy 연결 */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DB;
