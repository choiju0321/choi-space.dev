import {
  getCareerBasics,
  getCareerRecord,
  isDocumentCollection,
} from "@/lib/content/get-career";
import {
  getCareerApplication,
  getCareerLanguageItem,
  getCareerMaster,
} from "@/lib/content/get-career-hub";
import { getCultureEntries, getCultureEntryBySlug } from "@/lib/content/get-culture";
import { getPlaceEntryBySlug } from "@/lib/content/get-place";
import { getPostBySlug } from "@/lib/content/get-posts";
import { getProfile } from "@/lib/content/get-profile";
import {
  getReadingEntries,
  getReadingEntryBySlug,
  getReadingReviewBody,
} from "@/lib/content/get-reading";
import { readingClubs } from "@/content/reading/clubs";
import {
  getRunningEntries,
  getRunningEntryBySlug,
} from "@/lib/content/get-running";
import {
  getWorkCompanyBySlug,
  getWorkEtcItem,
  getWorkProject,
  getWorkSeason,
} from "@/lib/content/get-work";
import { listPhotoPublicPaths, readReviewBody } from "@/lib/content/life-media";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";
import type { CareerWriteKind, FinanceWriteKind, WorkWriteKind } from "@/lib/write/href";
import {
  careerApplicationToDraft,
  careerBasicsToDraft,
  careerCredentialToDraft,
  careerLanguageToDraft,
  careerMasterToDraft,
  CREDENTIAL_COLLECTION_LABEL,
} from "@/lib/write/career-drafts";
import {
  financeClaimToDraft,
  financeInvestToDraft,
  financeLedgerToDraft,
  financeOccasionToDraft,
  financePropertyCaseToDraft,
  financePropertyTaskToDraft,
} from "@/lib/write/finance-drafts";
import {
  workEtcToDraft,
  workProjectToDraft,
  workSeasonToDraft,
} from "@/lib/write/work-drafts";
import type { WriteCategory } from "@/types/place";
import { CareerApplicationWriteForm } from "@/features/career/career-application-write-form";
import { CareerBasicsWriteForm } from "@/features/career/career-basics-write-form";
import { CareerCredentialWriteForm } from "@/features/career/career-credential-write-form";
import { CareerLanguageWriteForm } from "@/features/career/career-language-write-form";
import { CareerMasterWriteForm } from "@/features/career/career-master-write-form";
import { DatingProfileWriteForm } from "@/features/dating/dating-profile-write-form";
import { FinanceClaimWriteForm } from "@/features/finance/finance-claim-write-form";
import { FinanceInvestWriteForm } from "@/features/finance/finance-invest-write-form";
import { FinanceLedgerWriteForm } from "@/features/finance/finance-ledger-write-form";
import { FinanceOccasionWriteForm } from "@/features/finance/finance-occasion-write-form";
import { FinancePropertyCaseWriteForm } from "@/features/finance/finance-property-case-write-form";
import { FinancePropertyTaskWriteForm } from "@/features/finance/finance-property-task-write-form";
import { WorkWriteForm } from "@/features/work/work-write-form";
import { WorkSeasonWriteForm } from "@/features/work/work-season-write-form";
import { WorkEtcWriteForm } from "@/features/work/work-etc-write-form";
import { WriteStudio, type WriteDraft } from "@/features/write/write-studio";
import { Container } from "@/components/ui/container";
import type { Metadata } from "next";
import { getDatingProfile } from "@/lib/content/get-dating";
import {
  getFinanceClaim,
  getFinanceInvestSnapshot,
  getFinanceLedgerEntry,
  getFinanceMedicalLedgerEntries,
  getFinanceOccasion,
  getFinancePropertyCase,
  getFinancePropertyCases,
  getFinancePropertyTask,
} from "@/lib/content/get-finance";
import { datingProfileToDraft } from "@/lib/write/dating-drafts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

const WRITE_CATEGORIES: WriteCategory[] = [
  "reading",
  "running",
  "culture",
  "food",
  "travel",
  "daily",
  "growth",
  "notes",
];

type PageProps = {
  searchParams: Promise<{
    category?: string;
    journalCategory?: string;
    slug?: string;
    mode?: string;
    company?: string;
    kind?: string;
    collection?: string;
    case?: string;
    parent?: string;
    phase?: string;
    tab?: string;
  }>;
};

function asWriteCategory(value?: string): WriteCategory | undefined {
  if (!value) return undefined;
  return WRITE_CATEGORIES.includes(value as WriteCategory)
    ? (value as WriteCategory)
    : undefined;
}

function asWorkKind(value?: string): WorkWriteKind {
  if (value === "season" || value === "etc") return value;
  return "project";
}

function asCareerKind(value?: string): CareerWriteKind {
  if (
    value === "master" ||
    value === "language" ||
    value === "credential" ||
    value === "basics"
  ) {
    return value;
  }
  return "application";
}

function asFinanceKind(value?: string): FinanceWriteKind {
  if (
    value === "ledger" ||
    value === "invest" ||
    value === "claim" ||
    value === "property" ||
    value === "property-task"
  ) {
    return value;
  }
  return "occasion";
}

function asMode(value?: string): "existing" | "new" | undefined {
  if (value === "existing" || value === "new") return value;
  return undefined;
}

async function loadDraft(
  category: WriteCategory,
  slug: string,
  journalCategory?: string,
): Promise<WriteDraft | null> {
  if (category === "daily" || category === "growth" || category === "notes") {
    const space =
      category === "daily" ? "life" : category === "growth" ? "growth" : "notes";
    const postCategory =
      category === "daily" ? "daily" : journalCategory ?? "";
    if (!postCategory) return null;
    const post = getPostBySlug(space, postCategory, slug);
    if (!post) return null;
    return {
      title: post.title,
      excerpt: post.excerpt,
      publishedOn: post.publishedOn,
      tags: post.tags.join(", "),
      body: post.body,
    };
  }

  if (category === "reading") {
    const entry = getReadingEntryBySlug(slug);
    if (!entry) return null;
    const body = await getReadingReviewBody(slug);
    return {
      title: entry.title,
      author: entry.author,
      readOn: entry.readOn,
      excerpt: entry.excerpt,
      body: body ?? undefined,
    };
  }

  if (category === "running") {
    const entry = getRunningEntryBySlug(slug);
    if (!entry) return null;
    const body = await readReviewBody("running", slug);
    return {
      title: entry.title,
      excerpt: entry.excerpt,
      ranOn: entry.ranOn,
      distanceKm: String(entry.distanceKm),
      place: entry.place,
      body: body ?? undefined,
      existingPhotos: listPhotoPublicPaths("running", slug),
    };
  }

  if (category === "culture") {
    const entry = getCultureEntryBySlug(slug);
    if (!entry) return null;
    const body = await readReviewBody("culture", slug);
    return {
      title: entry.title,
      excerpt: entry.excerpt,
      watchedOn: entry.watchedOn,
      watchedAt: entry.watchedAt,
      place: entry.place,
      kind: entry.kind,
      body: body ?? undefined,
      existingPhotos: listPhotoPublicPaths("culture", slug),
    };
  }

  if (category === "food" || category === "travel") {
    const entry = getPlaceEntryBySlug(category, slug);
    if (!entry) return null;
    const body = await readReviewBody(category, slug);
    return {
      title: entry.title,
      excerpt: entry.excerpt,
      place: entry.place,
      visitedOn: entry.visitedOn,
      visitedUntil: entry.visitedUntil,
      kind: entry.kind,
      naverMapUrl: entry.naverMapUrl,
      catchTableUrl: entry.catchTableUrl,
      body: body ?? undefined,
      existingPhotos: listPhotoPublicPaths(category, slug),
    };
  }

  return null;
}

export default async function WritePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const authenticated = await hasWriteSession();
  const configured = isWriteSecretConfigured();

  const isWork = params.category === "work";
  const isCareer = params.category === "career";
  const isFinance = params.category === "finance";
  const isDating = params.category === "dating";
  const workCompanySlug = params.company?.trim() || "";
  const workCompany = isWork
    ? getWorkCompanyBySlug(workCompanySlug)
    : undefined;
  const workKind = asWorkKind(params.kind);
  const workSlug = params.slug?.trim() || undefined;
  const workMode = asMode(params.mode) ?? (workSlug ? "existing" : "new");

  const careerKind = asCareerKind(params.kind);
  const careerSlug = params.slug?.trim() || undefined;
  const careerMode =
    asMode(params.mode) ?? (careerSlug ? "existing" : "new");
  const collectionParam = params.collection?.trim() ?? "";
  const careerCollection = isDocumentCollection(collectionParam)
    ? collectionParam
    : undefined;

  const financeKind = asFinanceKind(params.kind);
  const financeSlug = params.slug?.trim() || undefined;
  const financeMode =
    asMode(params.mode) ?? (financeSlug ? "existing" : "new");
  const financeCaseSlug = params.case?.trim() || undefined;
  const financeParentSlug = params.parent?.trim() || undefined;
  const financePhase = params.phase?.trim() || undefined;
  const financeReturnTab = params.tab?.trim() || undefined;

  const datingSlug = params.slug?.trim() || undefined;
  const datingMode =
    asMode(params.mode) ?? (datingSlug ? "existing" : "new");
  const datingDraft =
    isDating && datingSlug
      ? (() => {
          const item = getDatingProfile(datingSlug);
          return item ? datingProfileToDraft(item) : null;
        })()
      : null;

  const workProjectDraft =
    isWork && workCompany && workKind === "project" && workSlug
      ? (() => {
          const ref = getWorkProject(workCompany.slug, workSlug);
          return ref ? workProjectToDraft(ref.project) : null;
        })()
      : null;
  const workSeasonDraft =
    isWork && workCompany && workKind === "season" && workSlug
      ? (() => {
          const ref = getWorkSeason(workCompany.slug, workSlug);
          return ref ? workSeasonToDraft(ref.season) : null;
        })()
      : null;
  const workEtcDraft =
    isWork && workCompany && workKind === "etc" && workSlug
      ? (() => {
          const ref = getWorkEtcItem(workCompany.slug, workSlug);
          return ref ? workEtcToDraft(ref.item) : null;
        })()
      : null;

  const careerApplicationDraft =
    isCareer && careerKind === "application" && careerSlug
      ? (() => {
          const item = getCareerApplication(careerSlug);
          return item ? careerApplicationToDraft(item) : null;
        })()
      : null;
  const careerMasterDraft =
    isCareer && careerKind === "master" && careerSlug
      ? (() => {
          const item = getCareerMaster(careerSlug);
          return item ? careerMasterToDraft(item) : null;
        })()
      : null;
  const careerLanguageDraft =
    isCareer && careerKind === "language" && careerSlug
      ? (() => {
          const item = getCareerLanguageItem(careerSlug);
          return item ? careerLanguageToDraft(item) : null;
        })()
      : null;
  const careerBasicsDraft =
    isCareer && careerKind === "basics"
      ? careerBasicsToDraft(getCareerBasics(), getProfile())
      : null;
  const careerCredentialDraft =
    isCareer && careerKind === "credential" && careerCollection && careerSlug
      ? (() => {
          const item = getCareerRecord(careerCollection, careerSlug);
          return item
            ? careerCredentialToDraft(careerCollection, item)
            : null;
        })()
      : null;

  const financeOccasionDraft =
    isFinance && financeKind === "occasion" && financeSlug
      ? (() => {
          const item = getFinanceOccasion(financeSlug);
          return item ? financeOccasionToDraft(item) : null;
        })()
      : null;
  const financeLedgerDraft =
    isFinance && financeKind === "ledger" && financeSlug
      ? (() => {
          const item = getFinanceLedgerEntry(financeSlug);
          return item ? financeLedgerToDraft(item) : null;
        })()
      : null;
  const financeInvestDraft =
    isFinance && financeKind === "invest" && financeSlug
      ? (() => {
          const item = getFinanceInvestSnapshot(financeSlug);
          return item ? financeInvestToDraft(item) : null;
        })()
      : null;
  const financeClaimDraft =
    isFinance && financeKind === "claim" && financeSlug
      ? (() => {
          const item = getFinanceClaim(financeSlug);
          return item ? financeClaimToDraft(item) : null;
        })()
      : null;
  const financePropertyCaseDraft =
    isFinance && financeKind === "property" && financeSlug
      ? (() => {
          const item = getFinancePropertyCase(financeSlug);
          return item ? financePropertyCaseToDraft(item) : null;
        })()
      : null;
  const financePropertyTaskDraft =
    isFinance &&
    financeKind === "property-task" &&
    financeSlug &&
    financeCaseSlug
      ? (() => {
          const found = getFinancePropertyTask(financeCaseSlug, financeSlug);
          return found
            ? financePropertyTaskToDraft(found.caseItem.slug, found.task)
            : null;
        })()
      : null;
  const medicalEntries = isFinance ? getFinanceMedicalLedgerEntries() : [];
  const propertyCases = isFinance ? getFinancePropertyCases() : [];

  if (isFinance) {
    const heading =
      financeKind === "ledger"
        ? {
            title: financeMode === "existing" ? "가계부 수정" : "가계부 작성",
            summary:
              "대분류·소분류·메모 태그를 직접 고칩니다. Import 후 분류 보정용입니다.",
          }
        : financeKind === "invest"
          ? {
              title:
                financeMode === "existing"
                  ? "투자 스냅샷 수정"
                  : "투자 스냅샷 작성",
              summary:
                "주식·연금 계좌의 월말 평가액을 남깁니다. 매매 장부가 아니라 잔고 사진입니다.",
            }
          : financeKind === "claim"
            ? {
                title:
                  financeMode === "existing"
                    ? "보험 청구 수정"
                    : "보험 청구 작성",
                summary:
                  "상세 메모·금액 조정이 필요할 때만. 평소는 Insurance 목록에서 미신청/신청/환급만 체크합니다.",
              }
            : financeKind === "property"
              ? {
                  title:
                    financeMode === "existing"
                      ? "부동산 케이스 수정"
                      : "부동산 케이스 작성",
                  summary:
                    "민간임대·청약 당첨 건. 할 일은 케이스 안 + Task로 추가합니다.",
                }
              : financeKind === "property-task"
                ? {
                    title:
                      financeMode === "existing"
                        ? "할 일 수정"
                        : "할 일 작성",
                    summary:
                      "카테고리·WBS 순번·Due date. 일정 구간은 간트에서 저장합니다.",
                  }
                : {
                    title:
                      financeMode === "existing"
                        ? "경조사 수정"
                        : "경조사 작성",
                    summary:
                      "축의·조의 내역을 등록하거나 고칩니다. 엑셀 관리 시트를 대체합니다.",
                  };

    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Write · Finance · {financeKind}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {heading.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            {heading.summary}
          </p>
          {financeKind === "ledger" ? (
            <FinanceLedgerWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financeLedgerDraft}
            />
          ) : financeKind === "invest" ? (
            <FinanceInvestWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financeInvestDraft}
            />
          ) : financeKind === "claim" ? (
            <FinanceClaimWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financeClaimDraft}
              medicalEntries={medicalEntries}
            />
          ) : financeKind === "property" ? (
            <FinancePropertyCaseWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financePropertyCaseDraft}
            />
          ) : financeKind === "property-task" ? (
            <FinancePropertyTaskWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financePropertyTaskDraft}
              cases={propertyCases}
              defaultCaseSlug={financeCaseSlug}
              defaultParentSlug={financeParentSlug}
              defaultPhase={financePhase}
              returnTab={financeReturnTab}
            />
          ) : (
            <FinanceOccasionWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={financeMode}
              draft={financeOccasionDraft}
            />
          )}
        </Container>
      </div>
    );
  }

  if (isDating) {
    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Write · Dating
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {datingMode === "existing" ? "프로필 수정" : "프로필 등록"}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            듀오 소개팅 프로필을 등록하거나 고칩니다. 사진도 함께 올릴 수
            있습니다.
          </p>
          <DatingProfileWriteForm
            authenticated={authenticated}
            configured={configured}
            mode={datingMode}
            draft={datingDraft}
          />
        </Container>
      </div>
    );
  }

  if (isCareer) {
    const headings = {
      application: {
        title: careerMode === "existing" ? "지원 수정" : "지원 작성",
        summary:
          "Applications 건을 등록하거나 고칩니다. 프로세스는 outcome·fail at·rounds로 재생성됩니다.",
      },
      master: {
        title: careerMode === "existing" ? "마스터 수정" : "마스터 작성",
        summary:
          "이력서·포트폴리오 마스터본을 등록합니다. 첨부는 Masters에서 관리합니다.",
      },
      language: {
        title: careerMode === "existing" ? "어학 수정" : "어학 작성",
        summary: "Basics 어학 항목을 등록합니다. 첨부는 Basics에서 관리합니다.",
      },
      basics: {
        title: "기본정보 수정",
        summary: "이름·이메일·생년월일·거주지를 수정합니다.",
      },
      credential: {
        title:
          careerMode === "existing"
            ? `${careerCollection ? CREDENTIAL_COLLECTION_LABEL[careerCollection] : "항목"} 수정`
            : `${careerCollection ? CREDENTIAL_COLLECTION_LABEL[careerCollection] : "항목"} 작성`,
        summary:
          "학력·병역·교육·자격증·수상 항목을 등록하거나 고칩니다. 서류 첨부는 Basics에서 관리합니다.",
      },
    }[careerKind];

    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Write · Career · {careerKind}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {headings.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            {headings.summary}
          </p>

          {careerKind === "master" ? (
            <CareerMasterWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={careerMode}
              draft={careerMasterDraft}
            />
          ) : careerKind === "language" ? (
            <CareerLanguageWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={careerMode}
              draft={careerLanguageDraft}
            />
          ) : careerKind === "basics" ? (
            <CareerBasicsWriteForm
              authenticated={authenticated}
              configured={configured}
              draft={careerBasicsDraft}
            />
          ) : careerKind === "credential" ? (
            careerCollection ? (
              <CareerCredentialWriteForm
                authenticated={authenticated}
                configured={configured}
                mode={careerMode}
                collection={careerCollection}
                draft={careerCredentialDraft}
              />
            ) : (
              <p className="mt-10 text-sm text-[var(--color-muted)]">
                컬렉션(`collection`) 쿼리가 필요합니다. Basics에서 Write를 눌러
                주세요.
              </p>
            )
          ) : (
            <CareerApplicationWriteForm
              authenticated={authenticated}
              configured={configured}
              mode={careerMode}
              draft={careerApplicationDraft}
            />
          )}
        </Container>
      </div>
    );
  }

  if (isWork) {
    const headings = {
      project: {
        title: workMode === "existing" ? "프로젝트 수정" : "프로젝트 작성",
        summary:
          "Work 경험 프로젝트를 등록하거나 고칩니다. 첨부는 회사 페이지에서 관리합니다.",
      },
      season: {
        title: workMode === "existing" ? "Season 수정" : "Season 작성",
        summary:
          "평가·목표 시즌을 등록합니다. 프로젝트 slug로 Projects와 연결합니다.",
      },
      etc: {
        title: workMode === "existing" ? "Etc 수정" : "Etc 작성",
        summary: "세미나·참고·기타 항목을 등록합니다.",
      },
    }[workKind];

    return (
      <div className="pb-24 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Write · Work · {workKind}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {headings.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            {headings.summary}
          </p>

          {!workCompany ? (
            <p className="mt-10 text-sm text-[var(--color-muted)]">
              회사(`company`) 쿼리가 필요합니다. Work에서 Write를 눌러 주세요.
            </p>
          ) : workKind === "season" ? (
            <WorkSeasonWriteForm
              authenticated={authenticated}
              configured={configured}
              companySlug={workCompany.slug}
              companyName={workCompany.name}
              mode={workMode}
              draft={workSeasonDraft}
            />
          ) : workKind === "etc" ? (
            <WorkEtcWriteForm
              authenticated={authenticated}
              configured={configured}
              companySlug={workCompany.slug}
              companyName={workCompany.name}
              mode={workMode}
              draft={workEtcDraft}
            />
          ) : (
            <WorkWriteForm
              authenticated={authenticated}
              configured={configured}
              companySlug={workCompany.slug}
              companyName={workCompany.name}
              mode={workMode}
              draft={workProjectDraft}
            />
          )}
        </Container>
      </div>
    );
  }

  const initialCategory = asWriteCategory(params.category) ?? "culture";
  const initialSlug = params.slug?.trim() || undefined;
  const initialJournalCategory = params.journalCategory?.trim() || undefined;
  let initialMode = asMode(params.mode);

  if (
    initialSlug &&
    (initialCategory === "running" ||
      initialCategory === "culture" ||
      initialCategory === "food" ||
      initialCategory === "travel" ||
      initialCategory === "daily" ||
      initialCategory === "growth" ||
      initialCategory === "notes")
  ) {
    initialMode = initialMode ?? "new";
  }

  const draft = initialSlug
    ? await loadDraft(initialCategory, initialSlug, initialJournalCategory)
    : null;

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Write
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {initialSlug ? "기록 수정" : "기록 작성"}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          Life · Growth · Notes 기록을 남기거나 고칩니다. 비밀번호로
          보호됩니다.
        </p>

        <WriteStudio
          authenticated={authenticated}
          configured={configured}
          initialCategory={initialCategory}
          initialJournalCategory={initialJournalCategory}
          initialSlug={initialSlug}
          initialMode={initialMode}
          draft={draft}
          readingOptions={getReadingEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.readOn}`,
          }))}
          clubOptions={readingClubs.map((club) => ({
            id: club.id,
            label: `${club.name} (${club.periodStart}–${club.periodEnd})`,
          }))}
          runningOptions={getRunningEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.ranOn}`,
          }))}
          cultureOptions={getCultureEntries().map((entry) => ({
            slug: entry.slug,
            label: `${entry.title} · ${entry.watchedOn}`,
          }))}
        />
      </Container>
    </div>
  );
}
