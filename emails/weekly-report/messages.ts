export type Locale = "en" | "kk";

const catalogs: Record<Locale, Record<string, string>> = {
  en: {
    "prayer.name.fajr": "Fajr",
    "prayer.name.zukhr": "Zuhr",
    "prayer.name.asr": "Asr",
    "prayer.name.magrib": "Maghrib",
    "prayer.name.isha": "Isha",
    "prayer.name.witr": "Witr",
    "fasting.name": "Fasting",
    "safar.badge": "safar",
    "report.subject": "Your weekly qaza report · {period}",
    "report.preheader":
      "You completed {prayers} prayers and {fasts} fasts this week. {total} qaza remaining.",
    "report.heading": "Your weekly qaza report",
    "report.last_update": "Last update: {date}",
    "report.stat.prayers_done": "Prayers done",
    "report.stat.fasts_done": "Fasts done",
    "report.section.prayers": "Remaining prayers",
    "report.section.fasting": "Remaining fasting",
    "report.section.safar": "Safar prayers",
    "report.total": "Total remaining",
    "report.cta": "Open Qaza Tracker",
    "report.footer": "You receive this email because you created an account at {app}.",
    "report.text.this_week": "This week: {prayers} prayers and {fasts} fasts completed.",
    "report.text.open": "Open the app: {url}",
  },
  kk: {
    "prayer.name.fajr": "Таң",
    "prayer.name.zukhr": "Бесін",
    "prayer.name.asr": "Екінті",
    "prayer.name.magrib": "Ақшам",
    "prayer.name.isha": "Құптан",
    "prayer.name.witr": "Үтір",
    "fasting.name": "Ораза",
    "safar.badge": "сапар",
    "report.subject": "Апталық қаза есебіңіз · {period}",
    "report.preheader":
      "Осы аптада {prayers} намаз және {fasts} ораза төледіңіз. Қалған қаза: {total}.",
    "report.heading": "Апталық қаза есебіңіз",
    "report.last_update": "Соңғы жаңарту: {date}",
    "report.stat.prayers_done": "Төленген намаз",
    "report.stat.fasts_done": "Төленген ораза",
    "report.section.prayers": "Қалған намаздар",
    "report.section.fasting": "Қалған ораза",
    "report.section.safar": "Сапар намаздары",
    "report.total": "Барлығы қалған",
    "report.cta": "Qaza Tracker ашу",
    "report.footer": "Сіз {app} қосымшасында тіркелгендіктен осы хатты алудасыз.",
    "report.text.this_week": "Осы аптада: {prayers} намаз және {fasts} ораза төленді.",
    "report.text.open": "Қосымшаны ашу: {url}",
  },
};

export function normalizeLocale(locale: string | null | undefined): Locale {
  return locale === "kk" ? "kk" : "en";
}

export function intlLocale(locale: Locale): string {
  return locale === "kk" ? "kk-KZ" : "en-US";
}

export function t(
  locale: Locale,
  key: string,
  params: Record<string, string | number> = {},
): string {
  const template = catalogs[locale][key] ?? catalogs.en[key] ?? key;
  let result = template;
  for (const [name, value] of Object.entries(params)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}
