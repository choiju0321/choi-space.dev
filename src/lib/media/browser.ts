/**
 * 관리자 미디어 브라우저 — private/media 트리 탐색
 * 경로 traversal 방지. 세션 검사는 API/페이지에서.
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { MEDIA_ROOT } from "@/lib/media/paths";

export type MediaBrowserEntry = {
  name: string;
  type: "dir" | "file";
  /** MEDIA_ROOT 기준 상대 경로 (`/` 구분) */
  path: string;
  size?: number;
  mtime?: string;
};

export type MediaBrowserListing = {
  path: string;
  parent: string | null;
  entries: MediaBrowserEntry[];
};

function toPosixRelative(absolute: string) {
  const root = path.resolve(MEDIA_ROOT);
  const rel = path.relative(root, absolute);
  return rel.split(path.sep).join("/");
}

/** `life/reading/slug` 형태 → MEDIA_ROOT 아래 절대경로. 불법이면 null */
export function resolveSafeMediaPath(relativePath = ""): string | null {
  const cleaned = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (cleaned.includes("\0") || cleaned.split("/").some((part) => part === "..")) {
    return null;
  }

  const root = path.resolve(MEDIA_ROOT);
  const absolute =
    cleaned.length === 0
      ? root
      : path.resolve(root, ...cleaned.split("/").filter(Boolean));

  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    return null;
  }

  return absolute;
}

export function isSafeUploadFileName(name: string) {
  if (!name || name.length > 180) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  // 한글·공백·규칙 접두어(발제문_, 여행계획표_)·업무 원본명 허용
  return /^[\w.\- ()가-힣_·+~\[\]【】（）]+\.[A-Za-z0-9]+$/u.test(name);
}

export async function ensureMediaRoot() {
  await mkdir(MEDIA_ROOT, { recursive: true });
}

export async function listMediaDirectory(
  relativePath = "",
): Promise<MediaBrowserListing | null> {
  await ensureMediaRoot();
  const absolute = resolveSafeMediaPath(relativePath);
  if (!absolute || !existsSync(absolute)) return null;

  const info = await stat(absolute);
  if (!info.isDirectory()) return null;

  const current = toPosixRelative(absolute);
  const parent =
    current === ""
      ? null
      : current.includes("/")
        ? current.slice(0, current.lastIndexOf("/"))
        : "";

  const names = await readdir(absolute);
  const entries: MediaBrowserEntry[] = [];

  for (const name of names) {
    if (name.startsWith(".")) continue;
    const childAbs = path.join(absolute, name);
    const childStat = await stat(childAbs);
    const childPath = toPosixRelative(childAbs);

    if (childStat.isDirectory()) {
      entries.push({ name, type: "dir", path: childPath });
      continue;
    }

    if (childStat.isFile()) {
      entries.push({
        name,
        type: "file",
        path: childPath,
        size: childStat.size,
        mtime: childStat.mtime.toISOString(),
      });
    }
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name, "ko");
  });

  return {
    path: current,
    parent,
    entries,
  };
}

export async function readMediaFile(relativePath: string) {
  const absolute = resolveSafeMediaPath(relativePath);
  if (!absolute || !existsSync(absolute)) return null;
  const info = await stat(absolute);
  if (!info.isFile()) return null;
  const bytes = await readFile(absolute);
  return {
    bytes,
    fileName: path.basename(absolute),
    size: info.size,
  };
}

export async function writeMediaFile(
  directoryRelative: string,
  fileName: string,
  data: Buffer,
) {
  if (!isSafeUploadFileName(fileName)) {
    throw new Error("파일 이름이 올바르지 않습니다.");
  }

  const dirAbs = resolveSafeMediaPath(directoryRelative);
  if (!dirAbs) throw new Error("경로가 올바르지 않습니다.");

  await mkdir(dirAbs, { recursive: true });
  const target = path.join(dirAbs, fileName);
  const resolvedTarget = path.resolve(target);
  const root = path.resolve(MEDIA_ROOT);
  if (!resolvedTarget.startsWith(root + path.sep)) {
    throw new Error("경로가 올바르지 않습니다.");
  }

  await writeFile(resolvedTarget, data);
  return toPosixRelative(resolvedTarget);
}

export function guessContentType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "md":
      return "text/markdown; charset=utf-8";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "zip":
      return "application/zip";
    case "txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
