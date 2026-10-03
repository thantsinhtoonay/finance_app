import type { RecurringFrequency } from "./types";

/**
 * Next occurrence strictly after `from` (ISO `YYYY-MM-DD`), pure UTC math.
 * Month/year steps clamp to the target month's last day: Jan 31 monthly →
 * Feb 28/29 (never Mar 3), Feb 29 yearly → Feb 28 in common years.
 */
export function nextRecurringDate(
  from: string,
  frequency: RecurringFrequency,
): string {
  const [y, m, d] = from.split("-").map(Number);
  if (!y || !m || !d) return from;
  const pad = (n: number) => String(n).padStart(2, "0");

  switch (frequency) {
    case "weekly":
    case "biweekly": {
      const add = frequency === "weekly" ? 7 : 14;
      const dt = new Date(Date.UTC(y, m - 1, d + add));
      return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    }
    case "monthly": {
      // m is 1-based: last day of the NEXT month is day 0 of month index m+1.
      const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const day = Math.min(d, lastDay);
      const dt = new Date(Date.UTC(y, m, day));
      return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    }
    case "yearly": {
      if (m === 2 && d === 29) {
        const lastFeb = new Date(Date.UTC(y + 1, 2, 0)).getUTCDate();
        if (lastFeb < 29) return `${y + 1}-02-${pad(lastFeb)}`;
      }
      return `${y + 1}-${pad(m)}-${pad(d)}`;
    }
  }
}

/**
 * Dates to materialize for a series anchored at `from`: every occurrence
 * strictly after `from` up to and including `until` (typically today).
 * Bounded so a malformed date can never loop forever.
 */
export function dueOccurrences(
  from: string,
  frequency: RecurringFrequency,
  until: string,
): string[] {
  const out: string[] = [];
  let next = nextRecurringDate(from, frequency);
  while (next <= until && next > from && out.length < 1000) {
    out.push(next);
    next = nextRecurringDate(next, frequency);
  }
  return out;
}
