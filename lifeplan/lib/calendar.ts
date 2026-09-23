/** Calendar day used for rollover and “today” lists. Defaults to Pacific time. */

const TZ = process.env.APP_TIMEZONE || "America/Los_Angeles";

/** YYYY-MM-DD for an instant in the app timezone. */
export function calendarYmd(date: Date, timeZone = TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * UTC midnight of today’s calendar date in the app timezone.
 * Matches dates stored as `YYYY-MM-DDT00:00:00.000Z` on Vercel.
 */
export function startOfTodayUtc(): Date {
  return new Date(calendarYmd(new Date()) + "T00:00:00.000Z");
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}
