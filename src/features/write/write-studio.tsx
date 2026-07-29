"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { GROWTH_NAV, NOTES_NAV } from "@/content/nav";
import type { WriteCategory } from "@/types/place";

type Option = { slug: string; label: string };

type FoodStopDraft = {
  id: string;
  title: string;
  kind: "restaurant" | "cafe";
  placeUrl: string;
  rating: string;
  note: string;
  photos: File[];
  existingPhotos: string[];
  removedExistingPhotos: string[];
};

export type WriteDraft = {
  title?: string;
  author?: string;
  excerpt?: string;
  publishedOn?: string;
  readOn?: string;
  ranOn?: string;
  watchedOn?: string;
  visitedOn?: string;
  visitedUntil?: string;
  distanceKm?: string;
  place?: string;
  kind?: string;
  placeUrl?: string;
  naverMapUrl?: string;
  catchTableUrl?: string;
  tags?: string;
  body?: string;
  watchedAt?: string;
  existingPhotos?: string[];
};

type ClubOption = { id: string; label: string };

type WriteStudioProps = {
  authenticated: boolean;
  configured: boolean;
  readingOptions: Option[];
  runningOptions: Option[];
  cultureOptions: Option[];
  clubOptions?: ClubOption[];
  initialCategory?: WriteCategory;
  initialJournalCategory?: string;
  initialSlug?: string;
  initialMode?: "existing" | "new";
  draft?: WriteDraft | null;
};

const CATEGORIES: { id: WriteCategory; label: string }[] = [
  { id: "reading", label: "독서" },
  { id: "running", label: "러닝" },
  { id: "culture", label: "문화" },
  { id: "food", label: "맛집·카페" },
  { id: "travel", label: "여행" },
  { id: "daily", label: "Daily" },
  { id: "growth", label: "Growth" },
  { id: "notes", label: "Notes" },
];

const GROWTH_CATEGORIES = GROWTH_NAV.items.map((item) => ({
  id: item.href.split("/").pop()!,
  label: item.label,
}));

const NOTES_CATEGORIES = NOTES_NAV.items.map((item) => ({
  id: item.href.split("/").pop()!,
  label: item.label,
}));

function isJournal(category: WriteCategory) {
  return category === "daily" || category === "growth" || category === "notes";
}

function defaultModeFor(
  category: WriteCategory,
  hasSlug: boolean,
  requested?: "existing" | "new",
): "existing" | "new" {
  if (requested) return requested;
  if (hasSlug) return "existing";
  if (
    category === "food" ||
    category === "travel" ||
    isJournal(category)
  ) {
    return "new";
  }
  return "existing";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-foreground)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = cn(
  "h-11 w-full rounded-md px-4 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const areaClass = cn(
  "min-h-40 w-full rounded-md px-4 py-3 text-sm leading-7",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

function makeStopId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newFoodStop(): FoodStopDraft {
  return {
    id: makeStopId(),
    title: "",
    kind: "restaurant",
    placeUrl: "",
    rating: "",
    note: "",
    photos: [],
    existingPhotos: [],
    removedExistingPhotos: [],
  };
}

function openNaverMapSearch(query: string) {
  const q = query.trim();
  const href = q
    ? `https://map.naver.com/p/search/${encodeURIComponent(q)}`
    : "https://map.naver.com/p/";
  window.open(href, "_blank", "noopener,noreferrer");
}

function foodStopFromDraft(d: WriteDraft): FoodStopDraft {
  const body = d.body ?? "";
  const ratingMatch = /^평점:\s*([\d.]+)\s*\/\s*5/m.exec(body);
  let note = body;
  if (ratingMatch) {
    note = body.replace(/^평점:\s*[\d.]+\s*\/\s*5\s*\n?\n?/, "").trim();
  }
  return {
    id: makeStopId(),
    title: d.title ?? "",
    kind: d.kind === "cafe" ? "cafe" : "restaurant",
    placeUrl: d.naverMapUrl ?? d.catchTableUrl ?? d.placeUrl ?? "",
    rating: ratingMatch?.[1] ?? "",
    note,
    photos: [],
    existingPhotos: d.existingPhotos ?? [],
    removedExistingPhotos: [],
  };
}

function foodReviewBody(stop: FoodStopDraft) {
  const reviewParts = [
    stop.rating.trim() ? `평점: ${stop.rating.trim()} / 5` : "",
    stop.note.trim(),
  ].filter(Boolean);
  return reviewParts.join("\n\n");
}

function photoFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergePhotoFiles(prev: File[], incoming: File[]) {
  const keys = new Set(prev.map(photoFileKey));
  const added = incoming.filter((file) => !keys.has(photoFileKey(file)));
  return [...prev, ...added];
}

function appendFoodStopToFormData(
  stopData: FormData,
  stop: FoodStopDraft,
  opts: { place: string; visitedOn: string },
) {
  stopData.set("title", stop.title.trim());
  stopData.set("excerpt", stop.title.trim());
  stopData.set("kind", stop.kind);
  stopData.set("place", opts.place);
  stopData.set("visitedOn", opts.visitedOn);
  if (stop.placeUrl.trim()) {
    stopData.set("placeUrl", stop.placeUrl.trim());
  }
  const review = foodReviewBody(stop);
  if (review) stopData.set("body", review);
  for (const file of stop.photos) {
    stopData.append("photos", file);
  }
  for (const path of stop.removedExistingPhotos) {
    stopData.append("removePhotos", path);
  }
}

function FoodPhotoPicker({
  files,
  onChange,
  existingPhotos,
  removedExistingPhotos,
  onRemovedExistingChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  existingPhotos: string[];
  removedExistingPhotos: string[];
  onRemovedExistingChange: (paths: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleExisting = existingPhotos.filter(
    (path) => !removedExistingPhotos.includes(path),
  );

  function markExistingRemoved(path: string) {
    onRemovedExistingChange(
      removedExistingPhotos.includes(path)
        ? removedExistingPhotos
        : [...removedExistingPhotos, path],
    );
  }

  return (
    <div className="space-y-3">
      {visibleExisting.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-muted)]">
            등록된 사진 {visibleExisting.length}장
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleExisting.map((path) => (
              <li
                key={path}
                className="overflow-hidden rounded-md ring-1 ring-[var(--color-border)]"
              >
                <div className="relative aspect-[4/3] bg-[var(--color-surface-muted)]">
                  <Image
                    src={path}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 160px"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => markExistingRemoved(path)}
                  className="w-full py-2 text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
          {removedExistingPhotos.length > 0 ? (
            <p className="text-xs text-[var(--color-muted)]">
              삭제 예정 {removedExistingPhotos.length}장 · 저장하면 파일에서 제거됩니다.
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const incoming = Array.from(event.target.files ?? []);
            if (incoming.length) {
              onChange(mergePhotoFiles(files, incoming));
            }
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center rounded-md px-3 text-xs ring-1 ring-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          사진 추가
        </button>
        {files.length > 0 ? (
          <>
            <span className="text-xs text-[var(--color-muted)]">
              {files.length}장 선택됨
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
            >
              전체 삭제
            </button>
          </>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">
            여러 번 눌러 사진을 더 추가할 수 있습니다.
          </span>
        )}
      </div>
      {files.length > 0 ? (
        <ul className="space-y-1 text-xs text-[var(--color-muted)]">
          {files.map((file) => (
            <li key={photoFileKey(file)} className="flex items-center gap-2">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(files.filter((f) => photoFileKey(f) !== photoFileKey(file)))
                }
                className="shrink-0 underline-offset-4 hover:underline"
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      </div>
    </div>
  );
}

function FoodVenueFields({
  stop,
  onChange,
  onPasteUrl,
  showHeading,
  heading,
  onRemove,
}: {
  stop: FoodStopDraft;
  onChange: (patch: Partial<FoodStopDraft>) => void;
  onPasteUrl: () => void;
  showHeading?: boolean;
  heading?: string;
  onRemove?: () => void;
}) {
  function readRegion() {
    return (
      document.querySelector<HTMLInputElement>('input[name="place"]')?.value ??
      ""
    );
  }

  return (
    <div className="rounded-md border border-[var(--color-border)] p-4">
      {showHeading ? (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {heading}
          </p>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
            >
              삭제
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="매장명">
          <input
            className={inputClass}
            placeholder="예: 더해봄카페"
            value={stop.title}
            onChange={(event) => onChange({ title: event.target.value })}
            required={!showHeading}
          />
        </Field>
        <Field label="종류">
          <select
            className={inputClass}
            value={stop.kind}
            onChange={(event) =>
              onChange({
                kind: event.target.value as "restaurant" | "cafe",
              })
            }
          >
            <option value="restaurant">맛집</option>
            <option value="cafe">카페</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="장소 URL (네이버지도/캐치테이블)">
            <div className="space-y-2">
              <input
                type="url"
                className={inputClass}
                placeholder="https://map.naver.com/... 또는 https://app.catchtable.co.kr/..."
                value={stop.placeUrl}
                onChange={(event) => onChange({ placeUrl: event.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openNaverMapSearch(`${readRegion()} ${stop.title}`.trim())
                  }
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs ring-1 ring-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
                >
                  지도 열기
                </button>
                <button
                  type="button"
                  onClick={onPasteUrl}
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs ring-1 ring-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
                >
                  URL 붙여넣기
                </button>
              </div>
            </div>
          </Field>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 rounded-md border border-[var(--color-border)] px-3 py-2">
          <span className="text-sm text-[var(--color-muted)]">평점</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = Number(stop.rating || 0);
              const active = currentRating >= star;
              return (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star}점`}
                  onClick={() => onChange({ rating: String(star) })}
                  className={cn(
                    "text-xl leading-none transition-colors",
                    active
                      ? "text-amber-500"
                      : "text-[var(--color-border)] hover:text-amber-400",
                  )}
                >
                  ★
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onChange({ rating: "" })}
            className="text-xs text-[var(--color-muted)] underline-offset-4 hover:underline"
          >
            지우기
          </button>
        </div>
        <div className="sm:col-span-2">
          <Field label="후기">
            <textarea
              className={areaClass}
              placeholder="이 장소 후기"
              value={stop.note}
              onChange={(event) => onChange({ note: event.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="사진">
            <FoodPhotoPicker
              files={stop.photos}
              onChange={(photos) => onChange({ photos })}
              existingPhotos={stop.existingPhotos}
              removedExistingPhotos={stop.removedExistingPhotos}
              onRemovedExistingChange={(removedExistingPhotos) =>
                onChange({ removedExistingPhotos })
              }
            />
          </Field>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        목록 한 줄 요약에는 매장명이 들어갑니다.
      </p>
    </div>
  );
}

export function WriteStudio({
  authenticated: initialAuth,
  configured,
  readingOptions,
  runningOptions,
  cultureOptions,
  clubOptions = [],
  initialCategory = "culture",
  initialJournalCategory,
  initialSlug,
  initialMode,
  draft,
}: WriteStudioProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuth);
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<WriteCategory>(initialCategory);
  const [mode, setMode] = useState<"existing" | "new">(
    defaultModeFor(initialCategory, Boolean(initialSlug), initialMode),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [foodBatchMode, setFoodBatchMode] = useState(false);
  const [foodStops, setFoodStops] = useState<FoodStopDraft[]>([newFoodStop()]);
  const [foodSingleStop, setFoodSingleStop] = useState<FoodStopDraft>(() =>
    initialCategory === "food" && draft ? foodStopFromDraft(draft) : newFoodStop(),
  );
  const [entryNewPhotos, setEntryNewPhotos] = useState<File[]>([]);
  const [removedExistingPhotos, setRemovedExistingPhotos] = useState<string[]>(
    [],
  );
  const existingPhotos = draft?.existingPhotos ?? [];

  const editingSlug = initialSlug?.trim() || "";
  const isEditing = Boolean(editingSlug);
  const formKey = `${category}:${editingSlug}:${mode}:${draft?.publishedOn ?? ""}`;

  useEffect(() => {
    setEntryNewPhotos([]);
    setRemovedExistingPhotos([]);
  }, [formKey]);

  useEffect(() => {
    if (category !== "food") return;
    if (draft && isEditing) {
      setFoodSingleStop(foodStopFromDraft(draft));
    } else if (!isEditing && !foodBatchMode) {
      setFoodSingleStop(newFoodStop());
    }
  }, [formKey, category, draft, isEditing, foodBatchMode]);

  const supportsPhotos =
    category === "culture" ||
    category === "running" ||
    category === "food" ||
    category === "travel";

  const supportsNew =
    category === "reading" ||
    category === "running" ||
    category === "culture" ||
    category === "food" ||
    category === "travel" ||
    isJournal(category);

  const existingOptions = useMemo(() => {
    if (category === "reading") return readingOptions;
    if (category === "running") return runningOptions;
    if (category === "culture") return cultureOptions;
    return [];
  }, [category, cultureOptions, readingOptions, runningOptions]);

  async function pasteUrlToFoodStop(stopId: string) {
    try {
      const text = await navigator.clipboard.readText();
      const next = text.trim();
      if (!next) return;
      setFoodStops((prev) =>
        prev.map((item) => (item.id === stopId ? { ...item, placeUrl: next } : item)),
      );
      setMessage("클립보드 URL을 입력했습니다.");
    } catch {
      setError("클립보드 접근이 차단되었습니다. URL을 직접 붙여넣어 주세요.");
    }
  }

  async function pasteUrlToFoodSingle() {
    try {
      const text = await navigator.clipboard.readText();
      const next = text.trim();
      if (!next) return;
      setFoodSingleStop((prev) => ({ ...prev, placeUrl: next }));
      setMessage("클립보드 URL을 입력했습니다.");
    } catch {
      setError("클립보드 접근이 차단되었습니다. URL을 직접 붙여넣어 주세요.");
    }
  }

  function onLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/write/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setError(payload?.error ?? "로그인에 실패했습니다.");
        return;
      }
      setAuthenticated(true);
      setPassword("");
      router.refresh();
    });
  }

  function onLogout() {
    startTransition(async () => {
      await fetch("/api/write/logout", { method: "POST" });
      setAuthenticated(false);
      router.refresh();
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("category", category);
    if (supportsNew) data.set("mode", mode);
    else data.set("mode", "existing");

    if (editingSlug && !data.get("slug")) {
      data.set("slug", editingSlug);
    }

    startTransition(async () => {
      if (category === "food" && mode === "new" && foodBatchMode) {
        const place = String(data.get("place") ?? "").trim();
        const visitedOn = String(data.get("visitedOn") ?? "").trim();
        if (!place || !visitedOn) {
          setError("장소와 날짜를 입력하세요.");
          return;
        }

        const validStops = foodStops.filter((stop) => stop.title.trim());
        if (!validStops.length) {
          setError("최소 1개 장소명을 입력하세요.");
          return;
        }

        let successCount = 0;
        for (let i = 0; i < validStops.length; i += 1) {
          const stop = validStops[i];
          const stopData = new FormData();
          stopData.set("category", "food");
          stopData.set("mode", "new");
          appendFoodStopToFormData(stopData, stop, { place, visitedOn });

          const response = await fetch("/api/write", {
            method: "POST",
            body: stopData,
          });
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (!response.ok) {
            setError(
              `${i + 1}번째 장소 저장 실패: ${payload?.error ?? "오류가 발생했습니다."}`,
            );
            return;
          }
          successCount += 1;
        }

        setMessage(`${successCount}곳 저장했습니다.`);
        setFoodStops([newFoodStop()]);
        router.push("/life/food");
        router.refresh();
        return;
      }

      if (category === "food" && !foodBatchMode) {
        const place = String(data.get("place") ?? "").trim();
        const visitedOn = String(data.get("visitedOn") ?? "").trim();
        if (!place || !visitedOn) {
          setError("지역과 날짜를 입력하세요.");
          return;
        }
        if (!foodSingleStop.title.trim()) {
          setError("매장명을 입력하세요.");
          return;
        }

        const stopData = new FormData();
        stopData.set("category", "food");
        stopData.set("mode", isEditing ? "existing" : "new");
        if (isEditing) stopData.set("slug", editingSlug);
        appendFoodStopToFormData(stopData, foodSingleStop, {
          place,
          visitedOn,
        });

        const response = await fetch("/api/write", {
          method: "POST",
          body: stopData,
        });
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          href?: string;
        } | null;

        if (!response.ok) {
          setError(payload?.error ?? "저장에 실패했습니다.");
          return;
        }

        setMessage("저장했습니다.");
        if (payload?.href) {
          router.push(payload.href);
          router.refresh();
          return;
        }
        setFoodSingleStop(newFoodStop());
        router.refresh();
        return;
      }

      for (const path of removedExistingPhotos) {
        data.append("removePhotos", path);
      }
      for (const file of entryNewPhotos) {
        data.append("photos", file);
      }

      const response = await fetch("/api/write", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      setMessage("저장했습니다.");
      if (payload?.href) {
        router.push(payload.href);
        router.refresh();
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        `.env.local`에 `LIFE_WRITE_SECRET`을 설정한 뒤 서버를 다시 실행하세요.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <form onSubmit={onLogin} className="mt-10 max-w-sm space-y-4">
        <Field label="작성 비밀번호">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm text-[var(--color-background)] bg-[var(--color-foreground)] disabled:opacity-60"
        >
          {pending ? "확인 중…" : "입장"}
        </button>
      </form>
    );
  }

  const journalDefault =
    initialJournalCategory ||
    (category === "growth"
      ? GROWTH_CATEGORIES[0]?.id
      : category === "notes"
        ? NOTES_CATEGORIES[0]?.id
        : undefined);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isEditing}
              onClick={() => {
                setCategory(item.id);
                setMode(
                  defaultModeFor(item.id, false, undefined),
                );
                setError(null);
                setMessage(null);
              }}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors",
                category === item.id
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
                isEditing && "disabled:opacity-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          로그아웃
        </button>
      </div>

      {isEditing ? (
        <p className="mt-6 text-sm text-[var(--color-muted)]">
          수정 중 · <span className="tabular-nums">{editingSlug}</span>
        </p>
      ) : null}

      <form key={formKey} onSubmit={onSubmit} className="mt-8 space-y-6">
        {editingSlug ? (
          <input type="hidden" name="slug" value={editingSlug} />
        ) : null}

        {supportsNew &&
        (category === "reading" ||
          category === "running" ||
          category === "culture") &&
        !isEditing ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm",
                mode === "existing"
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "ring-1 ring-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              기존 기록에 추가
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm",
                mode === "new"
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                  : "ring-1 ring-[var(--color-border)] text-[var(--color-muted)]",
              )}
            >
              새 기록
            </button>
          </div>
        ) : null}

        {(category === "reading" ||
          category === "running" ||
          category === "culture") &&
        mode === "existing" &&
        !isEditing ? (
          <Field label="기록 선택">
            <select
              name="slug"
              className={inputClass}
              required
              defaultValue={editingSlug || undefined}
            >
              <option value="">선택하세요</option>
              {existingOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {category === "reading" && mode === "new" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="책 제목">
              <input
                name="title"
                className={inputClass}
                required
                placeholder="연애소설 읽는 노인"
                defaultValue={draft?.title}
              />
            </Field>
            <Field label="저자">
              <input
                name="author"
                className={inputClass}
                required
                placeholder="루이스 세풀베다"
                defaultValue={draft?.author}
              />
            </Field>
            <Field label="읽은 날">
              <input
                name="readOn"
                type="date"
                className={inputClass}
                required
                defaultValue={draft?.readOn}
              />
            </Field>
            <Field label="참여">
              <select
                name="participation"
                className={inputClass}
                defaultValue="personal"
              >
                <option value="personal">개인 독서</option>
                <option value="member">클럽 (트레바리)</option>
                <option value="guest">놀러가기</option>
              </select>
            </Field>
            <Field label="클럽 시즌 (클럽일 때)">
              <select name="clubSeasonId" className={inputClass} defaultValue="">
                <option value="">선택 안 함</option>
                {clubOptions.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="놀러가기 클럽명">
              <input
                name="guestClubName"
                className={inputClass}
                placeholder="방문한 모임 이름"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input
                  name="excerpt"
                  className={inputClass}
                  placeholder="목록에 보일 한 문장"
                  defaultValue={draft?.excerpt}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="태그 (선택, 쉼표 구분)">
                <input
                  name="tags"
                  className={inputClass}
                  placeholder="트레바리, 독후감"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {category === "running" && mode === "new" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="제목">
              <input
                name="title"
                className={inputClass}
                placeholder="한강 러닝"
                defaultValue={draft?.title}
              />
            </Field>
            <Field label="날짜">
              <input
                name="ranOn"
                type="date"
                className={inputClass}
                required
                defaultValue={draft?.ranOn}
              />
            </Field>
            <Field label="거리 (km)">
              <input
                name="distanceKm"
                type="number"
                step="0.1"
                min="0.1"
                className={inputClass}
                required
                defaultValue={draft?.distanceKm}
              />
            </Field>
            <Field label="장소">
              <input
                name="place"
                className={inputClass}
                placeholder="여의도"
                defaultValue={draft?.place}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input
                  name="excerpt"
                  className={inputClass}
                  defaultValue={draft?.excerpt}
                />
              </Field>
            </div>
          </div>
        ) : null}

        {category === "culture" && mode === "new" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="작품명">
              <input
                name="title"
                className={inputClass}
                required
                defaultValue={draft?.title}
              />
            </Field>
            <Field label="종류">
              <select
                name="kind"
                className={inputClass}
                defaultValue={draft?.kind ?? "musical"}
              >
                <option value="musical">뮤지컬</option>
                <option value="play">연극</option>
                <option value="exhibition">전시</option>
                <option value="concert">공연</option>
              </select>
            </Field>
            <Field label="날짜">
              <input
                name="watchedOn"
                type="date"
                className={inputClass}
                required
                defaultValue={draft?.watchedOn}
              />
            </Field>
            <Field label="시간">
              <input
                name="watchedAt"
                type="time"
                className={inputClass}
                defaultValue={draft?.watchedAt}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="장소">
                <input
                  name="place"
                  className={inputClass}
                  required
                  defaultValue={draft?.place}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input
                  name="excerpt"
                  className={inputClass}
                  defaultValue={draft?.excerpt}
                />
              </Field>
            </div>
          </div>
        ) : null}

        {(category === "food" || category === "travel") && (
          <div className="grid gap-4 sm:grid-cols-2">
            {category === "food" && !isEditing ? (
              <div className="sm:col-span-2">
                <div className="rounded-md border border-[var(--color-border)] p-4">
                  <p className="text-sm text-[var(--color-foreground)]">
                    코스 일괄 등록
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    한 번에 여러 장소를 저장합니다. 장소마다 매장명·URL·평점·후기·사진을 넣을 수 있습니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFoodBatchMode((prev) => !prev);
                      setError(null);
                      setMessage(null);
                    }}
                    className={cn(
                      "mt-3 inline-flex h-8 items-center rounded-md px-3 text-sm ring-1 ring-[var(--color-border)]",
                      foodBatchMode
                        ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                        : "text-[var(--color-muted)]",
                    )}
                  >
                    {foodBatchMode ? "일괄 모드 사용 중" : "일괄 모드 켜기"}
                  </button>
                </div>
              </div>
            ) : null}
            {category === "travel" ? (
              <Field label="제목">
                <input
                  name="title"
                  className={inputClass}
                  required
                  defaultValue={draft?.title}
                />
              </Field>
            ) : null}
            {category === "travel" ? (
              <Field label="장소">
                <input
                  name="place"
                  className={inputClass}
                  required
                  defaultValue={draft?.place}
                />
              </Field>
            ) : null}
            {category === "food" ? (
              <Field label="지역 (공통)">
                <input
                  name="place"
                  className={inputClass}
                  placeholder="서순라길"
                  required
                  defaultValue={draft?.place}
                />
              </Field>
            ) : null}
            <Field label="날짜">
              <input
                name="visitedOn"
                type="date"
                className={inputClass}
                required
                defaultValue={draft?.visitedOn}
              />
            </Field>
            {category === "travel" ? (
              <Field label="종료일 (선택)">
                <input
                  name="visitedUntil"
                  type="date"
                  className={inputClass}
                  defaultValue={draft?.visitedUntil}
                />
              </Field>
            ) : category === "food" ? (
              <div />
            ) : null}
            {category === "travel" ? (
              <div className="sm:col-span-2">
                <Field label="한 줄 요약">
                  <input
                    name="excerpt"
                    className={inputClass}
                    defaultValue={draft?.excerpt}
                  />
                </Field>
              </div>
            ) : null}

            {category === "food" && foodBatchMode ? (
              <div className="sm:col-span-2 space-y-4">
                {foodStops.map((stop, index) => (
                  <FoodVenueFields
                    key={stop.id}
                    stop={stop}
                    showHeading
                    heading={`장소 ${index + 1}`}
                    onRemove={
                      foodStops.length > 1
                        ? () =>
                            setFoodStops((prev) =>
                              prev.filter((item) => item.id !== stop.id),
                            )
                        : undefined
                    }
                    onChange={(patch) =>
                      setFoodStops((prev) =>
                        prev.map((item) =>
                          item.id === stop.id ? { ...item, ...patch } : item,
                        ),
                      )
                    }
                    onPasteUrl={() => pasteUrlToFoodStop(stop.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFoodStops((prev) => [...prev, newFoodStop()])}
                  className="inline-flex h-9 items-center rounded-md px-3 text-sm ring-1 ring-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
                >
                  장소 추가
                </button>
              </div>
            ) : null}

            {category === "food" && !foodBatchMode ? (
              <div className="sm:col-span-2">
                <FoodVenueFields
                  stop={foodSingleStop}
                  onChange={(patch) =>
                    setFoodSingleStop((prev) => ({ ...prev, ...patch }))
                  }
                  onPasteUrl={pasteUrlToFoodSingle}
                />
              </div>
            ) : null}
          </div>
        )}

        {isJournal(category) ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="제목">
              <input
                name="title"
                className={inputClass}
                required
                defaultValue={draft?.title}
              />
            </Field>
            {category === "growth" ? (
              <Field label="카테고리">
                <select
                  name="journalCategory"
                  className={inputClass}
                  defaultValue={journalDefault}
                  required
                  disabled={isEditing}
                >
                  {GROWTH_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {isEditing && journalDefault ? (
                  <input
                    type="hidden"
                    name="journalCategory"
                    value={journalDefault}
                  />
                ) : null}
              </Field>
            ) : null}
            {category === "notes" ? (
              <Field label="카테고리">
                <select
                  name="journalCategory"
                  className={inputClass}
                  defaultValue={journalDefault}
                  required
                  disabled={isEditing}
                >
                  {NOTES_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {isEditing && journalDefault ? (
                  <input
                    type="hidden"
                    name="journalCategory"
                    value={journalDefault}
                  />
                ) : null}
              </Field>
            ) : null}
            {category === "daily" ? <div /> : null}
            <Field label="날짜">
              <input
                name="publishedOn"
                type="date"
                className={inputClass}
                required
                defaultValue={draft?.publishedOn}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="한 줄 요약">
                <input
                  name="excerpt"
                  className={inputClass}
                  placeholder="목록에 보일 한 문장"
                  defaultValue={draft?.excerpt}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="태그 (선택, 쉼표 구분)">
                <input
                  name="tags"
                  className={inputClass}
                  placeholder="Next.js, 메모"
                  defaultValue={draft?.tags}
                />
              </Field>
            </div>
          </div>
        ) : null}

        {!(category === "food") ? (
          <Field
            label={
              category === "reading"
                ? "독후감"
                : isJournal(category)
                  ? "본문 (Markdown)"
                  : "후기"
            }
          >
            <textarea
              name="body"
              className={areaClass}
              placeholder={
                isJournal(category)
                  ? "## 제목\n\n본문을 적어 주세요. ## / ### 헤딩을 쓰면 목차가 생깁니다."
                  : "오늘 남기고 싶은 이야기를 적어 주세요."
              }
              required={category === "reading" || isJournal(category)}
              defaultValue={draft?.body}
            />
          </Field>
        ) : null}

        {supportsPhotos && category !== "food" ? (
          <Field label="사진">
            <FoodPhotoPicker
              files={entryNewPhotos}
              onChange={setEntryNewPhotos}
              existingPhotos={existingPhotos}
              removedExistingPhotos={removedExistingPhotos}
              onRemovedExistingChange={setRemovedExistingPhotos}
            />
          </Field>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--color-muted)]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm text-[var(--color-background)] bg-[var(--color-foreground)] disabled:opacity-60"
        >
          {pending ? "저장 중…" : isEditing ? "수정 저장" : "저장"}
        </button>
      </form>
    </div>
  );
}
