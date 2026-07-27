import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getFinanceClaim,
  getFinanceClaimByLedgerSlug,
  getFinanceInvestSnapshot,
  getFinanceLedgerEntries,
  getFinanceLedgerEntry,
  getFinanceOccasion,
  getFinancePropertyCase,
} from "@/lib/content/get-finance";
import {
  assignLedgerSlugs,
  buildLedgerFingerprint,
  mapLedgerType,
  parseBankSaladLedgerBuffer,
} from "@/lib/finance/parse-banksalad-ledger";
import { hasWriteSession } from "@/lib/write/auth";
import { cleanLedgerTitle } from "@/lib/write/finance-drafts";
import {
  mergeFinanceLedgerEntries,
  slugifyPart,
  upsertFinanceClaim,
  upsertFinanceInvestSnapshot,
  upsertFinanceLedgerEntry,
  upsertFinanceOccasion,
  upsertFinancePropertyCase,
} from "@/lib/write/storage";
import type {
  FinanceClaim,
  FinanceClaimStatus,
  FinanceInvestAccountKind,
  FinanceInvestSnapshot,
  FinanceLedgerEntry,
  FinanceLedgerType,
  FinanceOccasion,
  FinanceOccasionKind,
  FinancePropertyCase,
  FinancePropertyCaseStatus,
  FinancePropertyKind,
  FinancePropertyTask,
  FinancePropertyTaskPhase,
  FinancePropertyTaskStatus,
} from "@/types/finance";
import {
  FINANCE_CLAIM_DEFAULT_INSURER,
  FINANCE_LEDGER_TYPE_LABEL,
} from "@/types/finance";

export const dynamic = "force-dynamic";

function asKind(value: string): FinanceOccasionKind {
  return value === "condolence" ? "condolence" : "congratulatory";
}

function asYn(value: string): boolean | undefined {
  const raw = value.trim().toUpperCase();
  if (raw === "Y" || raw === "TRUE" || raw === "1") return true;
  if (raw === "N" || raw === "FALSE" || raw === "0") return false;
  return undefined;
}

function resolveSlug(
  mode: string,
  requestedSlug: string,
  seed: string,
  exists: (slug: string) => boolean,
) {
  let slug = requestedSlug || slugifyPart(seed);
  if (!slug) return { error: "슬러그를 만들 수 없습니다." as const };

  if (mode === "new") {
    if (exists(slug)) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }
  } else if (!exists(slug)) {
    return { error: "수정할 항목을 찾을 수 없습니다." as const };
  }

  return { slug };
}

export async function POST(request: Request) {
  if (!(await hasWriteSession())) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await request.formData();
  const writeKind = String(form.get("kind") ?? "occasion");

  try {
    if (writeKind === "ledger-import") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "엑셀/CSV 파일이 필요합니다." },
          { status: 400 },
        );
      }

      const name = file.name.toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
        return NextResponse.json(
          { error: ".xlsx 또는 .csv 파일만 지원합니다." },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = parseBankSaladLedgerBuffer(buffer, file.name);
      if (parsed.error) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const existing = getFinanceLedgerEntries();
      const existingSlugs = new Set(existing.map((item) => item.slug));
      const stamped = assignLedgerSlugs(parsed.entries, existingSlugs);
      const result = await mergeFinanceLedgerEntries(stamped);

      return NextResponse.json({
        ok: true,
        kind: "ledger-import",
        parsed: parsed.entries.length,
        added: result.added,
        skipped: result.skipped,
        total: result.total,
        href: "/finance/ledger",
      });
    }

    if (writeKind === "ledger") {
      const mode = String(form.get("mode") ?? "existing");
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "내용이 필요합니다." }, { status: 400 });
      }

      const date = String(form.get("date") ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "날짜가 올바르지 않습니다. (YYYY-MM-DD)" },
          { status: 400 },
        );
      }

      const amountRaw = String(form.get("amount") ?? "").trim();
      const amount = Number(amountRaw.replace(/,/g, ""));
      if (!Number.isFinite(amount)) {
        return NextResponse.json({ error: "금액이 올바르지 않습니다." }, { status: 400 });
      }

      const typeRaw = String(form.get("type") ?? "expense").trim();
      const type: FinanceLedgerType =
        typeRaw === "income" ||
        typeRaw === "expense" ||
        typeRaw === "transfer" ||
        typeRaw === "other"
          ? typeRaw
          : mapLedgerType(typeRaw);

      const category = String(form.get("category") ?? "").trim();
      if (!category) {
        return NextResponse.json({ error: "대분류가 필요합니다." }, { status: 400 });
      }

      const subcategory =
        String(form.get("subcategory") ?? "").trim() || undefined;
      const note = String(form.get("note") ?? "").trim() || undefined;
      const time = String(form.get("time") ?? "").trim() || undefined;
      const payment = String(form.get("payment") ?? "").trim() || undefined;
      const requestedSlug = String(form.get("slug") ?? "").trim();
      const fingerprintKeep = String(form.get("fingerprint") ?? "").trim();

      const resolved = resolveSlug(
        mode,
        requestedSlug,
        `${date}-${title}-${Math.abs(Math.round(amount))}`,
        (slug) => Boolean(getFinanceLedgerEntry(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing" ? getFinanceLedgerEntry(resolved.slug) : undefined;

      const fingerprint =
        fingerprintKeep ||
        existing?.fingerprint ||
        buildLedgerFingerprint({
          date,
          time,
          typeLabel: FINANCE_LEDGER_TYPE_LABEL[type],
          amount: Math.round(amount),
          title,
          payment,
        });

      const item: FinanceLedgerEntry = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        fingerprint,
        date,
        time,
        type,
        typeLabel: FINANCE_LEDGER_TYPE_LABEL[type],
        category,
        subcategory,
        title,
        amount: Math.round(amount),
        currency: existing?.currency ?? "KRW",
        payment,
        note,
        source: existing?.source ?? "manual",
        importedAt: existing?.importedAt,
      };

      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([, value]) => value !== undefined),
      ) as FinanceLedgerEntry;

      await upsertFinanceLedgerEntry(cleaned);
      return NextResponse.json({
        ok: true,
        kind: "ledger",
        slug: cleaned.slug,
        href: "/finance/ledger",
      });
    }

    if (writeKind === "invest") {
      const mode = String(form.get("mode") ?? "existing");
      const accountName = String(form.get("accountName") ?? "").trim();
      if (!accountName) {
        return NextResponse.json(
          { error: "계좌명이 필요합니다." },
          { status: 400 },
        );
      }

      const asOf = String(form.get("asOf") ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
        return NextResponse.json(
          { error: "기준일이 올바르지 않습니다. (YYYY-MM-DD)" },
          { status: 400 },
        );
      }

      const accountKindRaw = String(form.get("accountKind") ?? "stock").trim();
      const accountKind: FinanceInvestAccountKind =
        accountKindRaw === "pension" ? "pension" : "stock";

      const valuationRaw = String(form.get("valuation") ?? "").trim();
      const valuation = Number(valuationRaw.replace(/,/g, ""));
      if (!Number.isFinite(valuation) || valuation < 0) {
        return NextResponse.json(
          { error: "평가액이 올바르지 않습니다." },
          { status: 400 },
        );
      }

      const costRaw = String(form.get("costBasis") ?? "").trim();
      let costBasis: number | undefined;
      if (costRaw) {
        const parsed = Number(costRaw.replace(/,/g, ""));
        if (!Number.isFinite(parsed) || parsed < 0) {
          return NextResponse.json(
            { error: "원금이 올바르지 않습니다." },
            { status: 400 },
          );
        }
        costBasis = Math.round(parsed);
      }

      const institution =
        String(form.get("institution") ?? "").trim() || undefined;
      const note = String(form.get("note") ?? "").trim() || undefined;
      const requestedSlug = String(form.get("slug") ?? "").trim();

      const resolved = resolveSlug(
        mode,
        requestedSlug,
        `${asOf}-${accountKind}-${accountName}`,
        (slug) => Boolean(getFinanceInvestSnapshot(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing"
          ? getFinanceInvestSnapshot(resolved.slug)
          : undefined;

      const item: FinanceInvestSnapshot = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        asOf,
        accountKind,
        accountName,
        institution,
        valuation: Math.round(valuation),
        costBasis,
        currency: existing?.currency ?? "KRW",
        positions: existing?.positions,
        note,
      };

      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([, value]) => value !== undefined),
      ) as FinanceInvestSnapshot;

      await upsertFinanceInvestSnapshot(cleaned);
      return NextResponse.json({
        ok: true,
        kind: "invest",
        slug: cleaned.slug,
        href: "/finance/invest",
      });
    }

    if (writeKind === "claim-status") {
      const ledgerSlug = String(form.get("ledgerSlug") ?? "").trim();
      if (!ledgerSlug) {
        return NextResponse.json(
          { error: "ledgerSlug가 필요합니다." },
          { status: 400 },
        );
      }

      const medical = getFinanceLedgerEntry(ledgerSlug);
      if (!medical) {
        return NextResponse.json(
          { error: "연결할 의료 지출을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const statusRaw = String(form.get("status") ?? "planned").trim();
      const status: FinanceClaimStatus =
        statusRaw === "filed" ||
        statusRaw === "paid" ||
        statusRaw === "excluded" ||
        statusRaw === "rejected"
          ? statusRaw
          : "planned";

      const existing = getFinanceClaimByLedgerSlug(ledgerSlug);
      const today = new Date().toISOString().slice(0, 10);

      let claimAmount = existing?.claimAmount ?? Math.abs(medical.amount);
      const paidRaw = String(form.get("paidAmount") ?? "").trim();
      let paidAmount = existing?.paidAmount;
      if (paidRaw) {
        const n = Number(paidRaw.replace(/,/g, ""));
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json(
            { error: "환급액이 올바르지 않습니다." },
            { status: 400 },
          );
        }
        paidAmount = Math.round(n);
      } else if (status === "paid" && paidAmount == null) {
        paidAmount = claimAmount;
      }

      const slug =
        existing?.slug ??
        `${medical.date}-${slugifyPart(medical.title) || "claim"}-${Math.abs(medical.amount)}`.slice(
          0,
          56,
        );

      const item: FinanceClaim = {
        id: existing?.id ?? slug,
        slug: existing?.slug ?? slug,
        insurer: existing?.insurer ?? FINANCE_CLAIM_DEFAULT_INSURER,
        status,
        title: existing?.title ?? cleanLedgerTitle(medical.title),
        careDate: existing?.careDate ?? medical.date,
        filedAt:
          status === "filed" || status === "paid"
            ? (existing?.filedAt ?? today)
            : existing?.filedAt,
        paidAt: status === "paid" ? (existing?.paidAt ?? today) : existing?.paidAt,
        claimAmount,
        paidAmount: status === "paid" ? paidAmount : existing?.paidAmount,
        ledgerSlugs: existing?.ledgerSlugs?.includes(ledgerSlug)
          ? existing.ledgerSlugs
          : [...(existing?.ledgerSlugs ?? []), ledgerSlug],
        note: existing?.note,
      };

      if (status === "planned" || status === "excluded") {
        delete item.filedAt;
        delete item.paidAt;
        delete item.paidAmount;
      }

      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([, value]) => value !== undefined),
      ) as FinanceClaim;

      await upsertFinanceClaim(cleaned);
      revalidatePath("/finance/claims");
      revalidatePath("/finance");
      return NextResponse.json({
        ok: true,
        kind: "claim-status",
        slug: cleaned.slug,
        status: cleaned.status,
        href: "/finance/claims",
      });
    }

    if (writeKind === "claim") {
      const mode = String(form.get("mode") ?? "existing");
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
      }

      const statusRaw = String(form.get("status") ?? "planned").trim();
      const status: FinanceClaimStatus =
        statusRaw === "filed" ||
        statusRaw === "paid" ||
        statusRaw === "excluded" ||
        statusRaw === "rejected"
          ? statusRaw
          : "planned";

      const insurer =
        String(form.get("insurer") ?? "").trim() ||
        FINANCE_CLAIM_DEFAULT_INSURER;

      const careDateRaw = String(form.get("careDate") ?? "").trim();
      const careDate = careDateRaw || undefined;
      if (careDate && !/^\d{4}-\d{2}-\d{2}$/.test(careDate)) {
        return NextResponse.json(
          { error: "진료일이 올바르지 않습니다." },
          { status: 400 },
        );
      }

      const filedAtRaw = String(form.get("filedAt") ?? "").trim();
      const filedAt = filedAtRaw || undefined;
      const paidAtRaw = String(form.get("paidAt") ?? "").trim();
      const paidAt = paidAtRaw || undefined;

      function parseMoney(raw: string, label: string) {
        if (!raw.trim()) return { value: undefined as number | undefined };
        const n = Number(raw.replace(/,/g, ""));
        if (!Number.isFinite(n) || n < 0) {
          return { error: `${label}이(가) 올바르지 않습니다.` as const };
        }
        return { value: Math.round(n) };
      }

      const claimParsed = parseMoney(
        String(form.get("claimAmount") ?? ""),
        "청구액",
      );
      if ("error" in claimParsed && claimParsed.error) {
        return NextResponse.json({ error: claimParsed.error }, { status: 400 });
      }
      const paidParsed = parseMoney(
        String(form.get("paidAmount") ?? ""),
        "환급액",
      );
      if ("error" in paidParsed && paidParsed.error) {
        return NextResponse.json({ error: paidParsed.error }, { status: 400 });
      }

      const note = String(form.get("note") ?? "").trim() || undefined;
      const ledgerSlugs = String(form.get("ledgerSlugs") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const requestedSlug = String(form.get("slug") ?? "").trim();

      const resolved = resolveSlug(
        mode,
        requestedSlug,
        `${careDate ?? "undated"}-${title}`,
        (slug) => Boolean(getFinanceClaim(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing" ? getFinanceClaim(resolved.slug) : undefined;

      const item: FinanceClaim = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        insurer,
        status,
        title,
        careDate,
        filedAt,
        paidAt,
        claimAmount: claimParsed.value,
        paidAmount: paidParsed.value,
        ledgerSlugs: ledgerSlugs.length > 0 ? ledgerSlugs : undefined,
        note,
      };

      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([, value]) => value !== undefined),
      ) as FinanceClaim;

      await upsertFinanceClaim(cleaned);
      revalidatePath("/finance/claims");
      revalidatePath("/finance");
      return NextResponse.json({
        ok: true,
        kind: "claim",
        slug: cleaned.slug,
        href: "/finance/claims",
      });
    }

    if (writeKind === "property") {
      const mode = String(form.get("mode") ?? "existing");
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
      }

      const kindRaw = String(form.get("propertyKind") ?? "private-rental").trim();
      const propertyKind: FinancePropertyKind =
        kindRaw === "subscription" ||
        kindRaw === "purchase" ||
        kindRaw === "other"
          ? kindRaw
          : "private-rental";

      const statusRaw = String(form.get("status") ?? "active").trim();
      const status: FinancePropertyCaseStatus =
        statusRaw === "paused" || statusRaw === "done" ? statusRaw : "active";

      const wonAt = String(form.get("wonAt") ?? "").trim() || undefined;
      const moveInAt = String(form.get("moveInAt") ?? "").trim() || undefined;
      const location = String(form.get("location") ?? "").trim() || undefined;
      const note = String(form.get("note") ?? "").trim() || undefined;

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const resolved = resolveSlug(
        mode,
        requestedSlug,
        `${propertyKind}-${title}`,
        (slug) => Boolean(getFinancePropertyCase(slug)),
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existing =
        mode === "existing" ? getFinancePropertyCase(resolved.slug) : undefined;

      const item: FinancePropertyCase = {
        id: existing?.id ?? resolved.slug,
        slug: resolved.slug,
        title,
        kind: propertyKind,
        status,
        wonAt,
        moveInAt,
        location,
        note,
        tasks: existing?.tasks ?? [],
      };

      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([, value]) => value !== undefined),
      ) as FinancePropertyCase;

      await upsertFinancePropertyCase(cleaned);
      revalidatePath("/finance/property");
      revalidatePath("/finance");
      return NextResponse.json({
        ok: true,
        kind: "property",
        slug: cleaned.slug,
        href: "/finance/property",
      });
    }

    if (writeKind === "property-task" || writeKind === "property-task-status" || writeKind === "property-task-dates") {
      const caseSlug = String(form.get("caseSlug") ?? "").trim();
      if (!caseSlug) {
        return NextResponse.json(
          { error: "caseSlug가 필요합니다." },
          { status: 400 },
        );
      }

      const caseItem = getFinancePropertyCase(caseSlug);
      if (!caseItem) {
        return NextResponse.json(
          { error: "케이스를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      if (writeKind === "property-task-status") {
        const taskSlug = String(form.get("taskSlug") ?? "").trim();
        if (!taskSlug) {
          return NextResponse.json(
            { error: "taskSlug가 필요합니다." },
            { status: 400 },
          );
        }

        const statusRaw = String(form.get("status") ?? "todo").trim();
        const status: FinancePropertyTaskStatus =
          statusRaw === "doing" || statusRaw === "done" ? statusRaw : "todo";
        const today = new Date().toISOString().slice(0, 10);

        const tasks = caseItem.tasks.map((task) => {
          if (task.slug !== taskSlug) return task;
          const next: FinancePropertyTask = {
            ...task,
            status,
            doneAt: status === "done" ? (task.doneAt ?? today) : undefined,
          };
          if (status !== "done") delete next.doneAt;
          return Object.fromEntries(
            Object.entries(next).filter(([, value]) => value !== undefined),
          ) as FinancePropertyTask;
        });

        if (!tasks.some((task) => task.slug === taskSlug)) {
          return NextResponse.json(
            { error: "할 일을 찾을 수 없습니다." },
            { status: 404 },
          );
        }

        await upsertFinancePropertyCase({ ...caseItem, tasks });
        revalidatePath("/finance/property");
        revalidatePath("/finance");
        return NextResponse.json({
          ok: true,
          kind: "property-task-status",
          caseSlug,
          taskSlug,
          status,
          href: "/finance/property",
        });
      }

      if (writeKind === "property-task-dates") {
        const taskSlug = String(form.get("taskSlug") ?? "").trim();
        if (!taskSlug) {
          return NextResponse.json(
            { error: "taskSlug가 필요합니다." },
            { status: 400 },
          );
        }

        const clear = String(form.get("clear") ?? "") === "1";
        let startDate = String(form.get("startDate") ?? "").trim() || undefined;
        let endDate = String(form.get("endDate") ?? "").trim() || undefined;

        if (!clear) {
          if (!startDate && !endDate) {
            return NextResponse.json(
              { error: "시작일 또는 종료일이 필요합니다." },
              { status: 400 },
            );
          }
          startDate = startDate ?? endDate;
          endDate = endDate ?? startDate;
          if (startDate! > endDate!) {
            const swap = startDate;
            startDate = endDate;
            endDate = swap;
          }
        }

        const tasks = caseItem.tasks.map((task) => {
          if (task.slug !== taskSlug) return task;
          if (clear) {
            const next: FinancePropertyTask = { ...task };
            delete next.startDate;
            delete next.endDate;
            delete next.dueDate;
            return next;
          }
          return {
            ...task,
            startDate,
            endDate,
            dueDate: endDate,
          };
        });

        if (!tasks.some((task) => task.slug === taskSlug)) {
          return NextResponse.json(
            { error: "할 일을 찾을 수 없습니다." },
            { status: 404 },
          );
        }

        await upsertFinancePropertyCase({ ...caseItem, tasks });
        revalidatePath("/finance/property");
        revalidatePath("/finance");
        return NextResponse.json({
          ok: true,
          kind: "property-task-dates",
          caseSlug,
          taskSlug,
          startDate: clear ? null : startDate,
          endDate: clear ? null : endDate,
          href: "/finance/property",
        });
      }

      const mode = String(form.get("mode") ?? "existing");
      const title = String(form.get("title") ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
      }

      const phaseRaw = String(form.get("phase") ?? "booking").trim();
      const phase: FinancePropertyTaskPhase =
        phaseRaw === "purchase" ||
        phaseRaw === "checkout" ||
        phaseRaw === "move-day" ||
        phaseRaw === "install" ||
        phaseRaw === "admin" ||
        phaseRaw === "wrapup"
          ? phaseRaw
          : "booking";

      const statusRaw = String(form.get("status") ?? "todo").trim();
      const status: FinancePropertyTaskStatus =
        statusRaw === "doing" || statusRaw === "done" ? statusRaw : "todo";

      const dueDate = String(form.get("dueDate") ?? "").trim() || undefined;
      const note = String(form.get("note") ?? "").trim() || undefined;
      const sortOrderRaw = String(form.get("sortOrder") ?? "").trim();
      // start/end는 간트에서만. Write의 dueDate가 간트 구간을 덮지 않음.
      const startDateExplicit = String(form.get("startDate") ?? "").trim();
      const endDateExplicit = String(form.get("endDate") ?? "").trim();
      const today = new Date().toISOString().slice(0, 10);

      const requestedSlug = String(form.get("slug") ?? "").trim();
      const existsTask = (slug: string) =>
        caseItem.tasks.some((task) => task.slug === slug);
      const resolved = resolveSlug(
        mode,
        requestedSlug,
        `${dueDate ?? "task"}-${title}`,
        existsTask,
      );
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }

      const existingTask =
        mode === "existing"
          ? caseItem.tasks.find((task) => task.slug === resolved.slug)
          : undefined;

      let sortOrder = existingTask?.sortOrder;
      if (sortOrderRaw) {
        const n = Number(sortOrderRaw);
        if (!Number.isFinite(n) || n < 1) {
          return NextResponse.json(
            { error: "WBS 순번(Index)이 올바르지 않습니다." },
            { status: 400 },
          );
        }
        sortOrder = Math.round(n);
      } else if (sortOrder == null) {
        const samePhase = caseItem.tasks.filter(
          (task) => task.phase === phase && task.slug !== resolved.slug,
        );
        sortOrder =
          samePhase.reduce(
            (acc, task) => Math.max(acc, task.sortOrder ?? 0),
            0,
          ) + 1;
      }

      const task: FinancePropertyTask = {
        id: existingTask?.id ?? resolved.slug,
        slug: resolved.slug,
        title,
        phase,
        status,
        window: existingTask?.window,
        windowOrder: existingTask?.windowOrder,
        startDate: startDateExplicit
          ? startDateExplicit
          : existingTask?.startDate,
        endDate: endDateExplicit ? endDateExplicit : existingTask?.endDate,
        dueDate: dueDate ?? existingTask?.dueDate,
        doneAt:
          status === "done"
            ? (existingTask?.doneAt ?? today)
            : undefined,
        note,
        sortOrder,
      };

      const cleanedTask = Object.fromEntries(
        Object.entries(task).filter(([, value]) => value !== undefined),
      ) as FinancePropertyTask;

      const tasks =
        mode === "existing" && existingTask
          ? caseItem.tasks.map((item) =>
              item.slug === cleanedTask.slug ? cleanedTask : item,
            )
          : [...caseItem.tasks, cleanedTask];

      await upsertFinancePropertyCase({ ...caseItem, tasks });
      revalidatePath("/finance/property");
      revalidatePath("/finance");
      return NextResponse.json({
        ok: true,
        kind: "property-task",
        caseSlug,
        slug: cleanedTask.slug,
        href: "/finance/property",
      });
    }

    if (writeKind !== "occasion") {
      return NextResponse.json({ error: "지원하지 않는 kind입니다." }, { status: 400 });
    }

    const mode = String(form.get("mode") ?? "existing");
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "이름이 필요합니다." }, { status: 400 });
    }

    const occasionKind = asKind(String(form.get("occasionKind") ?? ""));
    const eventType =
      String(form.get("eventType") ?? "").trim() ||
      (occasionKind === "condolence" ? "장례식" : "결혼식");
    const relation = String(form.get("relation") ?? "").trim() || undefined;
    const dateUnknown = String(form.get("dateUnknown") ?? "") === "1";
    const dateRaw = String(form.get("date") ?? "").trim();
    const date = dateUnknown ? undefined : dateRaw || undefined;

    const amountRaw = String(form.get("amount") ?? "").trim();
    let amount: number | undefined;
    if (amountRaw) {
      const parsed = Number(amountRaw.replace(/,/g, ""));
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: "금액이 올바르지 않습니다." }, { status: 400 });
      }
      amount = Math.round(parsed);
    }

    const invited = asYn(String(form.get("invited") ?? ""));
    const attended = asYn(String(form.get("attended") ?? ""));
    const note = String(form.get("note") ?? "").trim() || undefined;

    const requestedSlug = String(form.get("slug") ?? "").trim();
    const slugSeed = [
      date ?? (dateUnknown ? "undated" : "undated"),
      name,
      relation,
    ]
      .filter(Boolean)
      .join("-");

    const resolved = resolveSlug(mode, requestedSlug, slugSeed, (slug) =>
      Boolean(getFinanceOccasion(slug)),
    );
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const existing =
      mode === "existing" ? getFinanceOccasion(resolved.slug) : undefined;

    const item: FinanceOccasion = {
      id: existing?.id ?? resolved.slug,
      slug: resolved.slug,
      kind: occasionKind,
      eventType,
      relation: occasionKind === "condolence" ? relation : undefined,
      date,
      dateUnknown: dateUnknown || undefined,
      name,
      amount,
      invited: occasionKind === "congratulatory" ? invited : undefined,
      attended: occasionKind === "congratulatory" ? attended : undefined,
      note,
    };

    const cleaned = Object.fromEntries(
      Object.entries(item).filter(([, value]) => value !== undefined),
    ) as FinanceOccasion;

    await upsertFinanceOccasion(cleaned);
    return NextResponse.json({
      ok: true,
      kind: "occasion",
      slug: cleaned.slug,
      href: "/finance/occasions",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
