/** Signup progression order — used for step numbers */
export const SIGNUP_FUNNEL_LOGICAL_ORDER = [
  'Documents Submitted',
  'Email Verified',
  'Submitted for KYC',
  'KYC Approved',
] as const;

/** Y-axis order on charts (top → bottom) */
export const SIGNUP_FUNNEL_CHART_ORDER = [...SIGNUP_FUNNEL_LOGICAL_ORDER] as const;

function stageLabel(item: { stage?: string; step?: string }): string | undefined {
  return item.stage ?? item.step;
}

export function orderStagesForChart<T extends { stage?: string; step?: string }>(stages: T[]): T[] {
  return SIGNUP_FUNNEL_CHART_ORDER.map((name) =>
    stages.find((s) => stageLabel(s) === name),
  ).filter((s): s is T => s != null);
}

export function signupStepNumber(stageName: string): number {
  const idx = SIGNUP_FUNNEL_LOGICAL_ORDER.indexOf(
    stageName as (typeof SIGNUP_FUNNEL_LOGICAL_ORDER)[number],
  );
  return idx >= 0 ? idx + 1 : 0;
}

export function isSubmittedForKycStage(stageName: string): boolean {
  return stageName === 'Submitted for KYC';
}
