import type { FinancePropertyListing } from "../../types/finance";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Telegram Bot API sendMessage. 성공하면 true */
export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      console.warn(
        "[telegram] HTTP",
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[telegram] 전송 실패:", (error as Error).message);
    return false;
  }
}

/** 새 공고 하나를 텔레그램 메시지(HTML)로 포맷 */
export function formatListingMessage(listing: FinancePropertyListing): string {
  const lines: string[] = [
    `🏠 <b>새 청약 공고</b> · ${escapeHtml(listing.sourceLabel)}`,
    `<b>${escapeHtml(listing.title)}</b>`,
  ];
  if (listing.kind) lines.push(`유형: ${escapeHtml(listing.kind)}`);
  const where = [listing.region, listing.address].filter(Boolean).join(" · ");
  if (where) lines.push(`위치: ${escapeHtml(where)}`);
  if (listing.applyStart || listing.applyEnd) {
    lines.push(`접수: ${listing.applyStart ?? "?"} ~ ${listing.applyEnd ?? "?"}`);
  }
  if (listing.noticeDate) lines.push(`공고일: ${listing.noticeDate}`);
  if (listing.url) lines.push(listing.url);
  return lines.join("\n");
}
