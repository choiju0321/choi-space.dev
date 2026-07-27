import type {
  CareerApplication,
  CareerApplicationOutcome,
  CareerProcessStep,
  CareerProcessStepStatus,
} from "@/types/career-hub";
import { CAREER_OUTCOME_LABEL } from "@/types/career-hub";

function step(
  partial: Omit<CareerProcessStep, "attachments"> & { attachments?: boolean },
): CareerProcessStep {
  return { attachments: true, ...partial };
}

/** 불합격 지점 — 서류전형 | n차 면접 */
export type ApplicationFailAt = "screening" | number;

export type BuildApplicationProcessOptions = {
  interviewRounds?: number;
  prefix?: string;
  /**
   * outcome=fail 일 때 탈락 단계.
   * - "screening": 서류 불합격 (이후 면접 없음)
   * - 숫자: 해당 회차 면접 불합격 (이전 단계는 합격)
   */
  failAt?: ApplicationFailAt;
};

/**
 * outcome 기준 기본 파이프라인.
 * 채용공고 → 지원서류 → 서류전형 → (면접 n차…) → 최종
 */
export function buildApplicationProcess(
  outcome: CareerApplicationOutcome,
  options?: BuildApplicationProcessOptions,
): CareerProcessStep[] {
  const prefix = options?.prefix ?? "step";
  const failAt: ApplicationFailAt = options?.failAt ?? "screening";
  const failRound = typeof failAt === "number" ? failAt : null;
  const defaultRounds =
    outcome === "fail" && failRound != null
      ? failRound
      : outcome === "preparing"
        ? 0
        : 2;
  const rounds = options?.interviewRounds ?? defaultRounds;

  const process: CareerProcessStep[] = [
    step({
      id: `${prefix}-posting`,
      slug: "posting",
      kind: "posting",
      title: "채용공고",
      status: outcome === "preparing" ? "in_progress" : "done",
      note: "JD·공고 PDF/캡처",
    }),
    step({
      id: `${prefix}-materials`,
      slug: "materials",
      kind: "materials",
      title: "지원 서류",
      status:
        outcome === "preparing"
          ? "pending"
          : outcome === "submitted"
            ? "done"
            : "done",
      note: "이력서 · 포트폴리오 · 기타 제출본",
    }),
  ];

  let screeningStatus: CareerProcessStepStatus = "pending";
  if (outcome === "preparing") screeningStatus = "pending";
  else if (outcome === "submitted") screeningStatus = "in_progress";
  else if (outcome === "fail" && failAt === "screening") screeningStatus = "fail";
  else if (outcome === "withdrawn") screeningStatus = "skipped";
  else screeningStatus = "pass";

  process.push(
    step({
      id: `${prefix}-screening`,
      slug: "screening",
      kind: "screening",
      title: "서류전형",
      status: screeningStatus,
      note: "서류 합격/불합격 — 면접 탈락과 구분",
    }),
  );

  // 서류 불합격이면 면접·최종을 만들지 않음
  if (screeningStatus === "fail") {
    return process;
  }

  if (screeningStatus === "pending" || screeningStatus === "in_progress") {
    return process;
  }

  for (let round = 1; round <= rounds; round += 1) {
    let status: CareerProcessStepStatus = "pending";

    if (outcome === "offer" || outcome === "pass") {
      status = "pass";
    } else if (outcome === "fail" && failRound != null) {
      if (round < failRound) status = "pass";
      else if (round === failRound) status = "fail";
      else status = "skipped";
    } else if (outcome === "withdrawn") {
      status = "skipped";
    }

    process.push(
      step({
        id: `${prefix}-interview-${round}`,
        slug: `interview-${round}`,
        kind: "interview",
        title: `${round}차 면접`,
        round,
        status,
        note: "질문·피드백 · 발표자료",
      }),
    );

    if (status === "fail") {
      return process;
    }
  }

  if (outcome === "offer" || (rounds > 0 && outcome !== "fail")) {
    process.push(
      step({
        id: `${prefix}-offer`,
        slug: "offer",
        kind: "offer",
        title: "최종",
        status:
          outcome === "offer"
            ? "pass"
            : outcome === "withdrawn"
              ? "skipped"
              : "pending",
        note: "오퍼 · 연봉 · 입사 일정",
      }),
    );
  }

  if (outcome === "withdrawn") {
    return process.map((item) =>
      item.status === "pending" ? { ...item, status: "skipped" as const } : item,
    );
  }

  return process;
}

/** 프로세스에서 불합격 단계 */
export function getApplicationFailureStep(process: CareerProcessStep[]) {
  return process.find((item) => item.status === "fail") ?? null;
}

/** 리스트·배지에 쓸 현재 단계 */
export function getApplicationCurrentStep(process: CareerProcessStep[]) {
  if (process.length === 0) return null;
  const failed = getApplicationFailureStep(process);
  if (failed) return failed;
  const inProgress = process.find((item) => item.status === "in_progress");
  if (inProgress) return inProgress;
  const next = process.find((item) => item.status === "pending");
  if (next) return next;
  return process[process.length - 1] ?? null;
}

/**
 * 표시용 상태 문구.
 * 서류 불합격 ≠ 면접 탈락 — 프로세스 단계 기준으로 구분.
 */
export function getApplicationStatusLabel(application: CareerApplication) {
  const failed = getApplicationFailureStep(application.process);
  if (failed) {
    if (failed.kind === "screening") return "서류 불합격";
    if (failed.kind === "interview") {
      return failed.round != null
        ? `${failed.round}차 면접 불합격`
        : `${failed.title} 불합격`;
    }
    return `${failed.title} 불합격`;
  }

  const current = getApplicationCurrentStep(application.process);
  if (application.outcome === "offer") return CAREER_OUTCOME_LABEL.offer;
  if (current?.status === "in_progress") return `${current.title} 진행`;
  if (current?.status === "pending") return `${current.title} 대기`;
  return CAREER_OUTCOME_LABEL[application.outcome];
}
