"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  AttachmentEmpty,
  AttachmentFileRow,
  AttachmentHeader,
  AttachmentList,
  formatAttachmentExt,
} from "@/features/content/attachment-chrome";
import { cn } from "@/lib/utils/cn";

type MediaFile = {
  name: string;
  path: string;
  sizeLabel: string;
  href: string;
};

type MediaFolderAttachmentsProps = {
  /** 예: `/api/work/lgcns/globot-2026/files` */
  apiPath: string;
  emptyHint?: string;
  className?: string;
};

/** 폴더형 다중 첨부 — 펼칠 때 목록 로드, 로컬/D: 파일 업로드 */
export function MediaFolderAttachments({
  apiPath,
  emptyHint = "아직 첨부된 파일이 없습니다. 원본에서 필요한 파일만 골라 첨부하세요.",
  className,
}: MediaFolderAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoadError(null);
      try {
        const response = await fetch(apiPath);
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (!cancelled) {
            setLoadError(payload?.error ?? "첨부를 불러오지 못했습니다.");
            setLoaded(true);
          }
          return;
        }
        const payload = (await response.json()) as { files: MediaFile[] };
        if (!cancelled) {
          setFiles(payload.files ?? []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setLoadError("첨부를 불러오지 못했습니다.");
          setLoaded(true);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [apiPath, open]);

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    // FileList는 live — value를 비우면 참조도 비워지므로 먼저 복사
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;

    setUploadError(null);
    if (!open) setOpen(true);

    startTransition(async () => {
      const next = [...files];

      try {
        for (const file of selected) {
          const body = new FormData();
          body.append("file", file);

          const response = await fetch(apiPath, { method: "PUT", body });
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            setUploadError(
              payload?.error ?? `"${file.name}" 업로드에 실패했습니다.`,
            );
            setFiles(next);
            return;
          }

          const payload = (await response.json()) as {
            fileName: string;
            path: string;
            href: string;
          };

          const existing = next.findIndex(
            (item) => item.name === payload.fileName,
          );
          const row: MediaFile = {
            name: payload.fileName,
            path: payload.path,
            sizeLabel: "",
            href: payload.href,
          };
          if (existing >= 0) next[existing] = row;
          else next.push(row);
        }

        const refresh = await fetch(apiPath);
        if (refresh.ok) {
          const payload = (await refresh.json()) as { files: MediaFile[] };
          setFiles(payload.files ?? next);
          setLoaded(true);
        } else {
          setFiles(next);
          setLoaded(true);
        }
      } catch {
        setUploadError("업로드 중 네트워크 오류가 발생했습니다.");
        setFiles(next);
        setLoaded(true);
      }
    });
  }

  return (
    <div className={cn("mt-4", className)}>
      <AttachmentHeader
        open={open}
        onToggle={() => setOpen((value) => !value)}
        count={loaded ? files.length : null}
        uploadLabel="파일 첨부"
        uploadPending={pending}
        onUploadClick={() => inputRef.current?.click()}
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={onUploadChange}
      />

      {open ? (
        <div className="mt-3">
          {!loaded && !loadError ? (
            <p className="text-sm text-[var(--color-muted-soft)]">불러오는 중…</p>
          ) : null}

          {loadError ? (
            <p className="text-sm text-red-700" role="alert">
              {loadError}
            </p>
          ) : null}

          {loaded && !loadError && files.length === 0 ? (
            <AttachmentEmpty hint={emptyHint} />
          ) : null}

          {files.length > 0 ? (
            <AttachmentList>
              {files.map((file) => (
                <AttachmentFileRow
                  key={file.path}
                  title={file.name}
                  meta={[
                    formatAttachmentExt(file.name),
                    file.sizeLabel || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  href={file.href}
                />
              ))}
            </AttachmentList>
          ) : null}

          {uploadError ? (
            <p className="mt-2 text-xs text-red-700" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
