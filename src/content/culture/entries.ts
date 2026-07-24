import cultureEntriesJson from "@/content/culture/entries.json";
import type { CultureEntry } from "@/types/culture";

/** JSON 단일 소스 (작성 API가 append 가능) */
export const cultureEntries = cultureEntriesJson as CultureEntry[];
