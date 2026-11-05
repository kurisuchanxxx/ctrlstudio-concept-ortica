import type { PartialDate } from './types';

/** 20 August 2026, August 2025 or 2025, depending on precision. */
export function formatPartialDate(date: PartialDate, locale = 'en-GB'): string {
  const opts: Intl.DateTimeFormatOptions =
    date.precision === 'day'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : date.precision === 'month'
        ? { month: 'long', year: 'numeric' }
        : { year: 'numeric' };
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(date.start);
}

/** 30–60 min, or 45 min when min and max match. */
export function formatDuration(d: { min: number; max: number }): string {
  return d.min === d.max ? `${d.min} min` : `${d.min}–${d.max} min`;
}
