import type {
  CareerApplication,
  CareerApplicationOutcome,
  CareerProcessStep,
  CareerProcessStepKind,
  CareerProcessStepStatus,
} from "@/types/career-hub";
import { CAREER_OUTCOME_LABEL } from "@/types/career-hub";

/** 서류전형·면접·최종 — 합격/불합격으로 닫는 단계 */
export function isResultProcessStepKind(kind: CareerProcessStepKind) {
  return kind === "screening" || kind === "interview" || kind === "offer";
}

/** 채용공고·지원서류 등 — 완료로 닫는 단계 */
export function isCompletionProcessStepKind(kind: CareerProcessStepKind) {
  return !isResultProcessStepKind(kind);
}

/**
 * 편집 UI·API에서 고를 수 있는 상태.
 * `skipped`는 불합격 cascade 전용 — 수동 선택하지 않음.
 */
export function allowedStatusesForProcessStepKind(
  kind: CareerProcessStepKind,
): CareerProcessStepStatus[] {
  if (isResultProcessStepKind(kind)) {
    return ["pending", "in_progress", "pass", "fail"];
  }
  return ["pending", "in_progress", "done"];
}

/** 현재 상태에서 바로 누를 수 있는 다음 액션 */
export function statusActionsForProcessStep(
  kind: CareerProcessStepKind,
  status: CareerProcessStepStatus,
): { status: CareerProcessStepStatus; label: string }[] {
  if (status === "pending") {
    return [{ status: "in_progress", label: "진행" }];
  }

  if (status === "in_progress") {
    if (isResultProcessStepKind(kind)) {
      return [
        { status: "pass", label: "합격" },
        { status: "fail", label: "불합격" },
      ];
    }
    return [{ status: "done", label: "완료" }];
  }

  if (status === "done" || status === "pass" || status === "fail") {
    return [{ status: "in_progress", label: "진행으로" }];
  }

  return [];
}

export function isProcessStepVisible(step: CareerProcessStep) {
  return step.status !== "skipped";
}

export function getVisibleProcessSteps(process: CareerProcessStep[]) {
  return process.filter(isProcessStepVisible);
}

/**
 * 단계 상태 저장 시 파이프라인 cascade.
 * - done/pass → 다음 pending을 in_progress, 뒤쪽 skipped는 pending으로 복구
 * - fail → 이후 단계를 모두 skipped (데이터는 유지, UI에서 숨김)
 * - pending/in_progress로 되돌리면 뒤쪽 skipped만 pending 복구
 */
export function applyProcessStepStatusChange(
  process: CareerProcessStep[],
  stepIndex: number,
  newStatus: CareerProcessStepStatus,
): CareerProcessStep[] {
  if (stepIndex < 0 || stepIndex >= process.length) return process;

  const next = process.map((step, index) =>
    index === stepIndex ? { ...step, status: newStatus } : { ...step },
  );

  if (newStatus === "fail") {
    for (let i = stepIndex + 1; i < next.length; i += 1) {
      next[i] = { ...next[i], status: "skipped" };
    }
    return next;
  }

  if (newStatus === "done" || newStatus === "pass") {
    for (let i = stepIndex + 1; i < next.length; i += 1) {
      if (next[i].status === "skipped") {
        next[i] = { ...next[i], status: "pending" };
      }
    }
    const following = next[stepIndex + 1];
    if (following?.status === "pending") {
      next[stepIndex + 1] = { ...following, status: "in_progress" };
    }
    return next;
  }

  if (newStatus === "pending" || newStatus === "in_progress") {
    for (let i = stepIndex + 1; i < next.length; i += 1) {
      if (next[i].status === "skipped") {
        next[i] = { ...next[i], status: "pending" };
      }
    }
    return next;
  }

  return next;
}

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
 * 기본 파이프라인 생성.
 * 진행은 단계 Edit + cascade로 쌓고, 생성 시에는 항상
 * 채용공고=진행 · 나머지=대기.
 * outcome은 단계 수(면접 회차) 힌트에만 쓰고 상태에는 반영하지 않음.
 */
export function buildApplicationProcess(
  _outcome: CareerApplicationOutcome,
  options?: BuildApplicationProcessOptions,
): CareerProcessStep[] {
  const prefix = options?.prefix ?? "step";
  const failAt: ApplicationFailAt = options?.failAt ?? "screening";
  const failRound = typeof failAt === "number" ? failAt : null;
  const rounds = Math.max(
    0,
    options?.interviewRounds ?? (failRound != null ? failRound : 2),
  );

  const process: CareerProcessStep[] = [
    step({
      id: `${prefix}-posting`,
      slug: "posting",
      kind: "posting",
      title: "채용공고",
      status: "in_progress",
      note: "JD·공고 PDF/캡처",
    }),
    step({
      id: `${prefix}-materials`,
      slug: "materials",
      kind: "materials",
      title: "지원 서류",
      status: "pending",
      note: "이력서 · 포트폴리오 · 기타 제출본",
    }),
    step({
      id: `${prefix}-screening`,
      slug: "screening",
      kind: "screening",
      title: "서류전형",
      status: "pending",
      note: "서류 합격/불합격 — 면접 탈락과 구분",
    }),
  ];

  for (let round = 1; round <= rounds; round += 1) {
    process.push(
      step({
        id: `${prefix}-interview-${round}`,
        slug: `interview-${round}`,
        kind: "interview",
        title: `${round}차 면접`,
        round,
        status: "pending",
        note: "질문·피드백 · 발표자료",
      }),
    );
  }

  process.push(
    step({
      id: `${prefix}-offer`,
      slug: "offer",
      kind: "offer",
      title: "최종",
      status: "pending",
      note: "오퍼 · 연봉 · 입사 일정",
    }),
  );

  return process;
}

/** 프로세스에서 불합격 단계 */
export function getApplicationFailureStep(process: CareerProcessStep[]) {
  return process.find((item) => item.status === "fail") ?? null;
}

/** 리스트·배지에 쓸 현재 단계 (`skipped` 제외) */
export function getApplicationCurrentStep(process: CareerProcessStep[]) {
  const visible = getVisibleProcessSteps(process);
  if (visible.length === 0) return null;
  const failed = getApplicationFailureStep(visible);
  if (failed) return failed;
  const inProgress = visible.find((item) => item.status === "in_progress");
  if (inProgress) return inProgress;
  const next = visible.find((item) => item.status === "pending");
  if (next) return next;
  return visible[visible.length - 1] ?? null;
}

/**
 * 표시용 상태 문구.
 * 프로세스 단계 진행을 outcome보다 우선한다.
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
  if (current?.status === "in_progress") return `${current.title} 진행`;
  if (current?.status === "pending") return `${current.title} 대기`;
  return CAREER_OUTCOME_LABEL[application.outcome];
}
