"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { GROWTH_NAV, NOTES_NAV } from "@/content/nav";
import type { WriteCategory } from "@/types/place";

type Option = { slug: string; label: string };

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
  naverMapUrl?: string;
  catchTableUrl?: string;
  tags?: string;
  body?: string;
  watchedAt?: string;
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

  const editingSlug = initialSlug?.trim() || "";
  const isEditing = Boolean(editingSlug);
  const formKey = `${category}:${editingSlug}:${mode}:${draft?.publishedOn ?? ""}`;

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
            <Field label="제목">
              <input
                name="title"
                className={inputClass}
                required
                defaultValue={draft?.title}
              />
            </Field>
            {category === "food" ? (
              <Field label="종류">
                <select
                  name="kind"
                  className={inputClass}
                  defaultValue={draft?.kind ?? "restaurant"}
                >
                  <option value="restaurant">맛집</option>
                  <option value="cafe">카페</option>
                </select>
              </Field>
            ) : (
              <Field label="장소">
                <input
                  name="place"
                  className={inputClass}
                  required
                  defaultValue={draft?.place}
                />
              </Field>
            )}
            {category === "food" ? (
              <Field label="장소">
                <input
                  name="place"
                  className={inputClass}
                  placeholder="성수동"
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
            ) : (
              <div />
            )}
            {category === "food" ? (
              <>
                <div className="sm:col-span-2">
                  <Field label="네이버 지도 URL (선택)">
                    <input
                      name="naverMapUrl"
                      type="url"
                      className={inputClass}
                      placeholder="https://naver.me/… 또는 map.naver.com/…"
                      defaultValue={draft?.naverMapUrl}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="캐치테이블 URL (선택)">
                    <input
                      name="catchTableUrl"
                      type="url"
                      className={inputClass}
                      placeholder="https://app.catchtable.co.kr/…"
                      defaultValue={draft?.catchTableUrl}
                    />
                  </Field>
                </div>
              </>
            ) : null}
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

        {supportsPhotos ? (
          <Field label="사진">
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-[var(--color-muted)]"
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
