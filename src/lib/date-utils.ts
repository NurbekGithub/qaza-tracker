import { enUS, kk } from "date-fns/locale";
import { format, parseISO, subDays, type Locale } from "date-fns";

import { getLocale } from "#/paraglide/runtime";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  kk,
};

export function getDateFnsLocale(): Locale {
  return DATE_FNS_LOCALES[getLocale()] ?? enUS;
}

export function formatDateLong(date: Date): string {
  return format(date, "PPP", { locale: getDateFnsLocale() });
}

export function formatDate(date?: string): string {
  return format(date ? parseISO(date) : new Date(), "yyyy-MM-dd");
}

export function formatTime(ms: number): string {
  return format(ms, "HH:mm");
}

export function formatDateLabel(ms: number): string {
  const iso = format(ms, "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (iso === today) return `Today (${iso})`;
  if (iso === yesterday) return `Yesterday (${iso})`;
  return iso;
}
