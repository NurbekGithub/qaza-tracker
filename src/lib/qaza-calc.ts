import { differenceInCalendarDays, format } from "date-fns";

export type HijriDate = { year: number; month: number; day: number };

export type MissedRamadan = { hijriYear: number; startDate: string; days: number };

export type PrayerQazaResult = {
  totalDays: number;
  menstruationAdjustment: number;
  finalDays: number;
};

export type FastingQazaResult = { ramadans: MissedRamadan[]; totalDays: number };

export const PUBERTY_LUNAR_YEARS = 15;

const DAY_MS = 86_400_000; // 1000 * 60 * 60 * 24 = 86_400_000
const DAYS_PER_LUNAR_MONTH = 29.53;
const HIJRI_EPOCH_UTC = Date.UTC(622, 6, 19);
const MEAN_HIJRI_YEAR_DAYS = 354.367;
const RAMADAN_MONTH = 9;

const hijriFormat = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  timeZone: "UTC",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

function toUtcMs(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function localDateFromUtcMs(ms: number): Date {
  const d = new Date(ms);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function gregorianToHijriUtc(ms: number): HijriDate {
  const parts = hijriFormat.formatToParts(ms);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function gregorianToHijri(date: Date): HijriDate {
  return gregorianToHijriUtc(toUtcMs(date));
}

function hijriToGregorianExact(year: number, month: number, day: number): Date | null {
  const approxDays =
    (year - 1) * MEAN_HIJRI_YEAR_DAYS + (month - 1) * DAYS_PER_LUNAR_MONTH + (day - 1);
  const approx = HIJRI_EPOCH_UTC + Math.round(approxDays) * DAY_MS;
  for (let offset = 0; offset <= 20; offset++) {
    const candidates =
      offset === 0 ? [approx] : [approx + offset * DAY_MS, approx - offset * DAY_MS];
    for (const ms of candidates) {
      const h = gregorianToHijriUtc(ms);
      if (h.year === year && h.month === month && h.day === day) {
        return localDateFromUtcMs(ms);
      }
    }
  }
  return null;
}

export function hijriToGregorian(year: number, month: number, day: number): Date {
  for (let d = day; d >= 1; d--) {
    const date = hijriToGregorianExact(year, month, d);
    if (date) return date;
  }
  throw new RangeError(`Invalid Hijri date: ${year}-${month}-${day}`);
}

export function pubertyDate(birthDate: Date): Date {
  const h = gregorianToHijri(birthDate);
  return hijriToGregorian(h.year + PUBERTY_LUNAR_YEARS, h.month, h.day);
}

export function ramadanStart(hijriYear: number): Date {
  return hijriToGregorian(hijriYear, RAMADAN_MONTH, 1);
}

export function ramadanLength(hijriYear: number): number {
  return differenceInCalendarDays(
    hijriToGregorian(hijriYear, RAMADAN_MONTH + 1, 1),
    ramadanStart(hijriYear),
  );
}

export function ramadanStartsInGregorianYear(
  year: number,
): { hijriYear: number; startDate: Date }[] {
  const midYear = gregorianToHijri(new Date(year, 5, 1));
  const matches: { hijriYear: number; startDate: Date }[] = [];
  for (const hijriYear of [midYear.year - 1, midYear.year, midYear.year + 1]) {
    const startDate = ramadanStart(hijriYear);
    if (startDate.getFullYear() === year) {
      matches.push({ hijriYear, startDate });
    }
  }
  return matches;
}

export function ramadanStartInGregorianYear(
  year: number,
): { hijriYear: number; startDate: Date } | null {
  return ramadanStartsInGregorianYear(year)[0] ?? null;
}

export function computePrayerQaza(args: {
  pubertyDate: Date;
  prayerStartDate: Date;
  menstruationDaysPerMonth?: number | null;
}): PrayerQazaResult {
  const totalDays = Math.max(0, differenceInCalendarDays(args.prayerStartDate, args.pubertyDate));
  let menstruationAdjustment = 0;
  if (args.menstruationDaysPerMonth != null) {
    const months = totalDays / DAYS_PER_LUNAR_MONTH;
    menstruationAdjustment = Math.round(months * args.menstruationDaysPerMonth);
  }
  return {
    totalDays,
    menstruationAdjustment,
    finalDays: Math.max(0, totalDays - menstruationAdjustment),
  };
}

export function computeFastingQaza(args: {
  pubertyDate: Date;
  fastingStartDate: Date;
}): FastingQazaResult {
  const puberty = gregorianToHijri(args.pubertyDate);
  const matches = ramadanStartsInGregorianYear(args.fastingStartDate.getFullYear());
  const started = matches.filter((r) => r.startDate <= args.fastingStartDate).at(-1) ?? matches[0];
  const startYear = started?.hijriYear ?? gregorianToHijri(args.fastingStartDate).year;
  const firstYear = puberty.month > RAMADAN_MONTH ? puberty.year + 1 : puberty.year;
  const ramadans: MissedRamadan[] = [];
  for (let year = firstYear; year < startYear; year++) {
    const length = ramadanLength(year);
    const days =
      year === puberty.year && puberty.month === RAMADAN_MONTH
        ? Math.max(0, length - puberty.day + 1)
        : length;
    if (days > 0) {
      ramadans.push({
        hijriYear: year,
        startDate: format(ramadanStart(year), "yyyy-MM-dd"),
        days,
      });
    }
  }
  return { ramadans, totalDays: ramadans.reduce((sum, r) => sum + r.days, 0) };
}
