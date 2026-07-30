/**
 * 청약/분양 공고 크롤링 → JSON 적재 → 텔레그램 알림.
 *
 * 수동 실행: npm run crawl:subscriptions
 * (순수 함수 + env 기반이라 나중에 Windows 작업 스케줄러 / GitHub Actions 에
 *  그대로 얹어 자동 실행할 수 있다.)
 *
 * 필요한 환경변수 (.env.local):
 *   APPLYHOME_SERVICE_KEY   data.go.kr 청약홈 분양정보 API 서비스 키 (Encoding 키 권장)
 *   TELEGRAM_BOT_TOKEN      텔레그램 봇 토큰 (BotFather)
 *   TELEGRAM_CHAT_ID        알림 받을 chat id
 *   CRAWL_REGIONS           (선택) 지역 필터, 콤마 구분. 예: "서울,경기"
 *   CRAWL_SINCE_NOTICE_DATE (선택) 이 날짜 이후 공고만. 예: "2026-01-01"
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fetchApplyhomeListings } from "../src/lib/crawl/applyhome";
import { fetchPrivateRentalListings } from "../src/lib/crawl/private-rental";
import {
  loadListings,
  markNotified,
  mergeListings,
  saveListings,
} from "../src/lib/crawl/store";
import {
  formatListingMessage,
  sendTelegramMessage,
} from "../src/lib/crawl/telegram";
import type { FinancePropertyListing } from "../src/types/finance";

/** 한국시간(KST) 기준 오늘 날짜 YYYY-MM-DD */
function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 독립 실행이라 .env.local 을 직접 읽어 process.env 에 채운다 (이미 있으면 유지) */
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const listingsPath = path.join(
    process.cwd(),
    "src/content/finance/property-listings.json",
  );
  const serviceKey = process.env.APPLYHOME_SERVICE_KEY?.trim();
  const tgToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChat = process.env.TELEGRAM_CHAT_ID?.trim();
  const regions = (process.env.CRAWL_REGIONS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // 기본값: 오늘(KST) 이후 공고만. CRAWL_SINCE_NOTICE_DATE 로 덮어쓸 수 있음.
  const sinceNoticeDate =
    process.env.CRAWL_SINCE_NOTICE_DATE?.trim() || kstToday();

  const nowIso = new Date().toISOString();
  const existing = loadListings(listingsPath);
  const incoming: FinancePropertyListing[] = [];

  if (serviceKey) {
    console.log(
      `· 청약홈 오픈 API 수집… (추첨: 무순위/잔여·임의공급 · 공고일 ${sinceNoticeDate} 이후` +
        `${regions.length ? ` · 지역 ${regions.join(",")}` : ""})`,
    );
    incoming.push(
      ...(await fetchApplyhomeListings({
        serviceKey,
        perPage: 100,
        regions: regions.length ? regions : undefined,
        sinceNoticeDate,
      })),
    );
  } else {
    console.warn("· APPLYHOME_SERVICE_KEY 없음 → 청약홈 건너뜀");
  }

  console.log("· 민간임대 사이트 수집…");
  incoming.push(...(await fetchPrivateRentalListings()));

  const { merged, added } = mergeListings(existing, incoming, nowIso);
  saveListings(listingsPath, merged);
  console.log(
    `· 수집 ${incoming.length}건 · 신규 ${added.length}건 · 총 ${merged.length}건`,
  );

  const toNotify = added.filter((item) => !item.notifiedAt);
  if (toNotify.length && tgToken && tgChat) {
    const notified: string[] = [];
    for (const listing of toNotify) {
      const ok = await sendTelegramMessage(
        tgToken,
        tgChat,
        formatListingMessage(listing),
      );
      if (ok) notified.push(listing.id);
    }
    if (notified.length) {
      saveListings(listingsPath, markNotified(merged, notified, nowIso));
      console.log(`· 텔레그램 알림 ${notified.length}건 전송`);
    }
  } else if (toNotify.length) {
    console.warn(
      `· 신규 ${toNotify.length}건 있으나 TELEGRAM_BOT_TOKEN/CHAT_ID 미설정 → 알림 생략`,
    );
  }

  console.log("완료.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
