"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { PERSONAL_NAV } from "@/content/nav";
import {
  datingPhotoSrc,
  datingProfileHeadline,
  datingProfileTitle,
} from "@/lib/dating/labels";
import { buildDatingWriteHref } from "@/lib/write/href";
import { cn } from "@/lib/utils/cn";
import {
  DATING_PLATFORM_LABEL,
  DATING_STATUS_LABEL,
  DATING_STATUS_ORDER,
  type DatingProfile,
  type DatingProfileStatus,
} from "@/types/dating";

type DatingProfilesViewProps = {
  items: DatingProfile[];
};

type StatusFilter = "all" | DatingProfileStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "전체" },
  ...DATING_STATUS_ORDER.map((id) => ({
    id,
    label: DATING_STATUS_LABEL[id],
  })),
];

const STATUS_ACTIONS: DatingProfileStatus[] = [
  "interested",
  "meeting",
  "passed",
  "archived",
];

const actionButtonClass =
  "h-8 border border-[var(--color-border)] px-2.5 text-[0.75rem] tracking-wide text-[var(--color-muted)] transition-colors hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)] disabled:opacity-40";

const inputClass =
  "mt-1.5 w-full border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-foreground)]";

const labelClass =
  "text-[0.7rem] font-medium tracking-[0.12em] text-[var(--color-muted-soft)] uppercase";

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
      <dt className={labelClass}>{label}</dt>
      <dd className="text-sm leading-6 whitespace-pre-wrap text-[var(--color-foreground)]">
        {value}
      </dd>
    </div>
  );
}

function PhotoStrip({ photos, title }: { photos: string[]; title: string }) {
  if (photos.length === 0) return null;
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {photos.map((photo, index) => (
        <li key={photo} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={datingPhotoSrc(photo)}
            alt={`${title} 사진 ${index + 1}`}
            className="h-44 w-32 object-cover bg-[var(--color-border)]/40 sm:h-52 sm:w-36"
          />
        </li>
      ))}
    </ul>
  );
}

function ProfileModal({
  item,
  busy,
  onClose,
  onStatus,
  onSaveContact,
}: {
  item: DatingProfile;
  busy: boolean;
  onClose: () => void;
  onStatus: (status: DatingProfileStatus) => void;
  onSaveContact: (contact: {
    contactName: string;
    contactPhone: string;
  }) => void;
}) {
  const title = datingProfileTitle(item);
  const headline = datingProfileHeadline(item);
  const platform = DATING_PLATFORM_LABEL[item.platform];
  const [contactName, setContactName] = useState(item.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(item.contactPhone ?? "");

  useEffect(() => {
    setContactName(item.contactName ?? "");
    setContactPhone(item.contactPhone ?? "");
  }, [item.slug, item.contactName, item.contactPhone]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const showContact =
    item.status === "meeting" || Boolean(item.contactName || item.contactPhone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-foreground)]/30 p-0 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dating-profile-title"
        className={cn(
          "flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden",
          "border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg",
          "sm:max-h-[88vh]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)]/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {platform}
              {item.metAt ? (
                <>
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                  {item.metAt}
                </>
              ) : null}
              <span className="mx-2 text-[var(--color-border)]">·</span>
              {DATING_STATUS_LABEL[item.status]}
            </p>
            <h2
              id="dating-profile-title"
              className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)]"
            >
              {title}
            </h2>
            {headline ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">{headline}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
          >
            닫기
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-6 flex justify-end">
            <AdminActionLink
              href={buildDatingWriteHref({ slug: item.slug })}
              className="h-8 px-2.5 text-[0.75rem]"
            >
              Edit
            </AdminActionLink>
          </div>
          <section className="mb-8">
            <h3 className={labelClass}>상태</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_ACTIONS.map((status) => {
                const selected = item.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={busy || selected}
                    className={cn(
                      actionButtonClass,
                      selected &&
                        "border-[var(--color-foreground)] text-[var(--color-foreground)]",
                    )}
                    onClick={() => onStatus(status)}
                  >
                    {DATING_STATUS_LABEL[status]}
                  </button>
                );
              })}
            </div>
          </section>

          {showContact ? (
            <section className="mb-8 border border-[var(--color-border)]/70 p-4">
              <h3 className={labelClass}>만남 연락처</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                만남이 이어지면 공개되는 이름·휴대폰을 적어 둡니다.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>이름</span>
                  <input
                    className={inputClass}
                    value={contactName}
                    disabled={busy}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="실명"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>휴대폰</span>
                  <input
                    className={inputClass}
                    value={contactPhone}
                    disabled={busy}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="010-0000-0000"
                    inputMode="tel"
                    autoComplete="off"
                  />
                </label>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={busy}
                  className={actionButtonClass}
                  onClick={() =>
                    onSaveContact({
                      contactName: contactName.trim(),
                      contactPhone: contactPhone.trim(),
                    })
                  }
                >
                  연락처 저장
                </button>
              </div>
            </section>
          ) : null}

          {item.photos.length > 0 ? (
            <div className="mb-6">
              <PhotoStrip photos={item.photos} title={title} />
            </div>
          ) : (
            <p className="mb-6 text-sm text-[var(--color-muted-soft)]">
              등록된 사진이 없습니다.
            </p>
          )}

          <dl className="space-y-3">
            <FieldRow label="회원번호" value={item.memberId} />
            <FieldRow label="성별" value={item.gender} />
            <FieldRow label="출생" value={item.birthYearLabel} />
            <FieldRow label="성씨" value={item.surname} />
            <FieldRow label="거주지" value={item.residence} />
            <FieldRow label="종교" value={item.religion} />
            <FieldRow label="키" value={item.height} />
            <FieldRow label="취미" value={item.hobby} />
          </dl>

          {item.education.length > 0 ? (
            <section className="mt-8">
              <h3 className={labelClass}>학력</h3>
              <ul className="mt-3 space-y-2">
                {item.education.map((row) => (
                  <li
                    key={`${row.level}-${row.detail}`}
                    className="text-sm leading-6"
                  >
                    <span className="text-[var(--color-muted)]">{row.level}</span>
                    {row.detail ? (
                      <>
                        <span className="mx-2 text-[var(--color-border)]">·</span>
                        <span className="text-[var(--color-foreground)]">
                          {row.detail}
                        </span>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {item.jobs.length > 0 ? (
            <section className="mt-8">
              <h3 className={labelClass}>직장</h3>
              <ul className="mt-3 space-y-3">
                {item.jobs.map((job, index) => (
                  <li
                    key={`${job.company}-${index}`}
                    className="text-sm leading-6"
                  >
                    <p className="text-[var(--color-foreground)]">
                      {job.company ?? "—"}
                      {job.role === "previous" ? (
                        <span className="ml-2 text-[var(--color-muted-soft)]">
                          전직
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[var(--color-muted)]">
                      {[job.department, job.title, job.field, job.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {Object.keys(item.family).length > 0 ? (
            <section className="mt-8">
              <h3 className={labelClass}>가족</h3>
              <dl className="mt-3 space-y-2">
                {Object.entries(item.family).map(([key, value]) => (
                  <FieldRow key={key} label={key} value={value} />
                ))}
              </dl>
            </section>
          ) : null}

          {item.intro ? (
            <section className="mt-8">
              <h3 className={labelClass}>자기소개</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-foreground)]">
                {item.intro}
              </p>
            </section>
          ) : null}

          {item.idealType ? (
            <section className="mt-8">
              <h3 className={labelClass}>희망상대</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-foreground)]">
                {item.idealType}
              </p>
            </section>
          ) : null}

          {item.managerNote ? (
            <section className="mt-8 pb-2">
              <h3 className={labelClass}>매니저 리뷰</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-foreground)]">
                {item.managerNote}
              </p>
              {item.managerName || item.managerPhone ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  매니저{" "}
                  {[item.managerName, item.managerPhone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  item,
  onOpen,
}: {
  item: DatingProfile;
  onOpen: () => void;
}) {
  const title = datingProfileTitle(item);
  const headline = datingProfileHeadline(item);
  const platform = DATING_PLATFORM_LABEL[item.platform];
  const cover = item.photos[0];
  const hasContact = Boolean(item.contactName || item.contactPhone);

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-4 text-left transition-opacity hover:opacity-80"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={datingPhotoSrc(cover)}
            alt=""
            className="h-16 w-12 shrink-0 object-cover bg-[var(--color-border)]/40"
          />
        ) : (
          <div className="flex h-16 w-12 shrink-0 items-center justify-center bg-[var(--color-border)]/30 text-[0.65rem] text-[var(--color-muted-soft)]">
            No
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {platform}
            {item.metAt ? (
              <>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                {item.metAt}
              </>
            ) : null}
            <span className="mx-2 text-[var(--color-border)]">·</span>
            {DATING_STATUS_LABEL[item.status]}
            {item.photos.length > 1 ? (
              <>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                사진 {item.photos.length}
              </>
            ) : null}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {title}
          </h3>
          {hasContact ? (
            <p className="mt-2 text-sm text-[var(--color-foreground)]">
              {[item.contactName, item.contactPhone].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {headline ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">{headline}</p>
          ) : null}
          {item.managerNote ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-muted-soft)]">
              {item.managerNote}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 pt-1 text-sm text-[var(--color-muted)]">
          열기
        </span>
      </button>
    </li>
  );
}

export function DatingProfilesView({ items }: DatingProfilesViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(items);
  const [statusTab, setStatusTab] = useState<StatusFilter>("all");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const filtered = useMemo(() => {
    if (statusTab === "all") return rows;
    return rows.filter((item) => item.status === statusTab);
  }, [rows, statusTab]);

  const active = useMemo(
    () => rows.find((item) => item.slug === activeSlug) ?? null,
    [rows, activeSlug],
  );

  const byMonth = useMemo(() => {
    const map = new Map<string, DatingProfile[]>();
    for (const item of filtered) {
      const key = item.metAt?.slice(0, 7) ?? "unknown";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function patchRow(slug: string, patch: Partial<DatingProfile>) {
    setRows((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, ...patch } : item)),
    );
  }

  async function postDating(body: FormData) {
    const res = await fetch("/api/write/dating", { method: "POST", body });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error ?? "저장에 실패했습니다.");
    }
  }

  function onStatus(slug: string, status: DatingProfileStatus) {
    const prev = rows.find((item) => item.slug === slug);
    if (!prev || prev.status === status) return;
    patchRow(slug, { status });
    startTransition(async () => {
      try {
        const body = new FormData();
        body.set("kind", "status");
        body.set("slug", slug);
        body.set("status", status);
        await postDating(body);
        router.refresh();
      } catch {
        patchRow(slug, { status: prev.status });
      }
    });
  }

  function onSaveContact(
    slug: string,
    contact: { contactName: string; contactPhone: string },
  ) {
    const prev = rows.find((item) => item.slug === slug);
    if (!prev) return;
    const nextStatus: DatingProfileStatus =
      contact.contactName || contact.contactPhone ? "meeting" : prev.status;
    patchRow(slug, {
      contactName: contact.contactName || null,
      contactPhone: contact.contactPhone || null,
      status: nextStatus,
    });
    startTransition(async () => {
      try {
        const body = new FormData();
        body.set("kind", "contact");
        body.set("slug", slug);
        body.set("contactName", contact.contactName);
        body.set("contactPhone", contact.contactPhone);
        body.set("status", nextStatus);
        await postDating(body);
        router.refresh();
      } catch {
        patchRow(slug, {
          contactName: prev.contactName,
          contactPhone: prev.contactPhone,
          status: prev.status,
        });
      }
    });
  }

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: PERSONAL_NAV.label, href: PERSONAL_NAV.overviewHref },
            { label: "Dating" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Personal
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Dating
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              듀오(Duo) 프로필 카드입니다. 상태를 바꾸고, 만남이 이어진 경우
              이름·휴대폰을 남겨 둡니다.
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
              {rows.length}건
            </p>
          </div>
          <AdminContentToolbar className="pb-0">
            <AdminActionLink href={buildDatingWriteHref()}>Write</AdminActionLink>
          </AdminContentToolbar>
        </div>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-10">
        <div
          role="tablist"
          aria-label="프로필 상태"
          className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
        >
          {STATUS_TABS.map((tab) => {
            const selected = tab.id === statusTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setStatusTab(tab.id)}
                className={cn(
                  "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                  selected
                    ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--color-muted-soft)]">
            해당 상태의 프로필이 없습니다.
          </p>
        ) : (
          <div className="mt-2">
            {byMonth.map(([month, monthRows]) => (
              <section key={month} className="mt-10">
                <h2 className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  {month === "unknown" ? "일자 미정" : month.replace("-", ".")}
                  <span className="ml-2 text-[var(--color-border)]">·</span>
                  <span className="ml-2">{monthRows.length}</span>
                </h2>
                <ul>
                  {monthRows.map((item) => (
                    <ProfileRow
                      key={item.slug}
                      item={item}
                      onOpen={() => setActiveSlug(item.slug)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </FadeIn>

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link href="/records" className="transition-opacity hover:opacity-70">
          ← Personal
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link href="/documents" className="transition-opacity hover:opacity-70">
          Documents
        </Link>
      </p>

      {active ? (
        <ProfileModal
          item={active}
          busy={pending}
          onClose={() => setActiveSlug(null)}
          onStatus={(status) => onStatus(active.slug, status)}
          onSaveContact={(contact) => onSaveContact(active.slug, contact)}
        />
      ) : null}
    </div>
  );
}
