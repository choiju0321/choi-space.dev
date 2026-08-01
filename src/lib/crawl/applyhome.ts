import type { FinancePropertyListing } from "../../types/finance";

/**
 * 청약홈(한국부동산원) 분양정보 오픈 API — 공공데이터포털 서비스.
 * odcloud 형식: https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/<operation>
 * data.go.kr 에서 발급한 서비스 키(serviceKey)가 필요하다.
 */
const ODCLOUD_BASE =
  "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

/**
 * 끌어올 오퍼레이션 — **추첨(로또청약)만**:
 * - getRemndrLttotPblancDetail: APT 무순위/잔여세대 (줍줍 · 취소후재공급)
 * - getOptnLttotPblancDetail:   임의공급
 * (일반 순위청약 APT·오피스텔은 제외. 필요하면 여기에 op를 추가한다.)
 */
const ENDPOINTS: { op: string; kindFallback: string }[] = [
  { op: "getRemndrLttotPblancDetail", kindFallback: "무순위/잔여" },
  { op: "getOptnLttotPblancDetail", kindFallback: "임의공급" },
];

export type ApplyhomeOptions = {
  serviceKey: string;
  perPage?: number;
  /** SUBSCRPT_AREA_CODE_NM 에 포함되면 통과 (예: ["서울","경기"]). 비우면 전체 */
  regions?: string[];
  /** RCRIT_PBLANC_DE(모집공고일) 이 값 이상만 (YYYY-MM-DD) */
  sinceNoticeDate?: string;
};

function pick(
  row: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return undefined;
}

/** "20260815" · "2026-08-15" → "2026-08-15" */
function toIsoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return raw;
}

async function fetchOperation(
  op: string,
  opts: ApplyhomeOptions,
): Promise<Record<string, unknown>[]> {
  // serviceKey 는 이미 인코딩된 키를 그대로 붙인다 (data.go.kr "Encoding" 키 권장)
  const url =
    `${ODCLOUD_BASE}/${op}` +
    `?page=1&perPage=${opts.perPage ?? 100}&serviceKey=${opts.serviceKey}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as { data?: unknown };
  return Array.isArray(json.data)
    ? (json.data as Record<string, unknown>[])
    : [];
}

function mapRow(
  row: Record<string, unknown>,
  kindFallback: string,
): FinancePropertyListing | null {
  const manageNo = pick(row, ["HOUSE_MANAGE_NO", "PBLANC_NO"]);
  const title = pick(row, ["HOUSE_NM", "BSNS_MBY_NM", "PBLANC_NM"]);
  if (!manageNo || !title) return null;

  const totalSupplyRaw = pick(row, ["TOT_SUPLY_HSHLDCO"]);
  const totalSupply = totalSupplyRaw
    ? Number(totalSupplyRaw.replace(/[^0-9]/g, "")) || undefined
    : undefined;

  return {
    id: `applyhome:${manageNo}`,
    source: "applyhome",
    sourceLabel: "청약홈",
    title,
    kind:
      pick(row, ["HOUSE_SECD_NM", "HOUSE_DTL_SECD_NM", "RENT_SECD_NM"]) ??
      kindFallback,
    region: pick(row, ["SUBSCRPT_AREA_CODE_NM"]),
    address: pick(row, ["HSSPLY_ADRES"]),
    noticeDate: toIsoDate(pick(row, ["RCRIT_PBLANC_DE"])),
    applyStart: toIsoDate(
      pick(row, [
        "SUBSCRPT_RCEPT_BGNDE",
        "RCEPT_BGNDE",
        "GNRL_RNK1_CRSPAREA_RCPTDE",
      ]),
    ),
    applyEnd: toIsoDate(pick(row, ["SUBSCRPT_RCEPT_ENDDE", "RCEPT_ENDDE"])),
    totalSupply,
    url: pick(row, ["PBLANC_URL", "HMPG_ADRES"]),
    firstSeenAt: "", // store.mergeListings 에서 신규에 한해 부여
  };
}

export async function fetchApplyhomeListings(
  opts: ApplyhomeOptions,
): Promise<FinancePropertyListing[]> {
  const out: FinancePropertyListing[] = [];
  const seen = new Set<string>();

  for (const ep of ENDPOINTS) {
    let rows: Record<string, unknown>[] = [];
    try {
      rows = await fetchOperation(ep.op, opts);
    } catch (error) {
      console.warn(`[applyhome] ${ep.op} 실패:`, (error as Error).message);
      continue;
    }
    for (const row of rows) {
      const listing = mapRow(row, ep.kindFallback);
      if (!listing || seen.has(listing.id)) continue;
      if (
        opts.regions?.length &&
        listing.region &&
        !opts.regions.some((r) => listing.region!.includes(r))
      ) {
        continue;
      }
      if (
        opts.sinceNoticeDate &&
        listing.noticeDate &&
        listing.noticeDate < opts.sinceNoticeDate
      ) {
        continue;
      }
      seen.add(listing.id);
      out.push(listing);
    }
  }
  return out;
}
