/** Length of the home-trial / returns window, in days. */
export const TRIAL_DAYS = 14;

/** When the trial window for an order that started at `since` closes. */
export function trialDeadline(since: Date): Date {
  return new Date(since.getTime() + TRIAL_DAYS * 86400_000);
}

export function withinTrial(since: Date, now: Date = new Date()): boolean {
  return now < trialDeadline(since);
}
