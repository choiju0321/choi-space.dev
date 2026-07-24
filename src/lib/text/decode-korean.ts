import iconv from "iconv-lite";

/**
 * Decode Korean text files that may be UTF-8 or Windows CP949 (EUC-KR family).
 * Personal archive .txt files are often saved as CP949 on Windows Notepad.
 */
export function decodeKoreanTextBuffer(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3).toString("utf8");
  }

  const asUtf8 = buffer.toString("utf8");
  if (!asUtf8.includes("\uFFFD") && !looksLikeBrokenKorean(asUtf8)) {
    return asUtf8;
  }

  return iconv.decode(buffer, "cp949");
}

function looksLikeBrokenKorean(text: string): boolean {
  // Common mojibake when CP949 bytes are read as Latin-1/UTF-8
  const sample = text.slice(0, 200);
  const hangul = (sample.match(/[가-힣]/g) ?? []).length;
  const replacement = (sample.match(/\uFFFD/g) ?? []).length;
  const weird = (sample.match(/[ÃÂìíèé]/g) ?? []).length;

  if (replacement > 0) return true;
  if (hangul >= 4) return false;
  if (weird >= 2 && hangul === 0) return true;

  // Pure binary-looking Korean CP949 often becomes many high-bit chars with almost no Hangul
  const high = (sample.match(/[^\x00-\x7F]/g) ?? []).length;
  return high > 10 && hangul === 0;
}
