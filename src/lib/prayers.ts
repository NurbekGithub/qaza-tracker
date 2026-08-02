import { m } from "#/paraglide/messages";

export const PRAYERS = ["fajr", "zukhr", "asr", "magrib", "isha", "wajib"] as const;
export const FASTING = "fasting";

export type PrayerName = (typeof PRAYERS)[number];
export type FastingName = typeof FASTING;

export const SAFAR_PRAYERS = [
  "safar_fajr",
  "safar_zukhr",
  "safar_asr",
  "safar_magrib",
  "safar_isha",
  "safar_wajib",
] as const;

export type SafarPrayerName = (typeof SAFAR_PRAYERS)[number];
export type TrackableName = PrayerName | FastingName | SafarPrayerName;

export const TRACKABLES: TrackableName[] = [...PRAYERS, FASTING, ...SAFAR_PRAYERS];
export const MAIN_TRACKABLES: TrackableName[] = [...PRAYERS, FASTING];

const SAFAR_TO_BASE: Record<SafarPrayerName, PrayerName> = {
  safar_fajr: "fajr",
  safar_zukhr: "zukhr",
  safar_asr: "asr",
  safar_magrib: "magrib",
  safar_isha: "isha",
  safar_wajib: "wajib",
};

export function isSafarName(t: TrackableName): t is SafarPrayerName {
  return (SAFAR_PRAYERS as readonly string[]).includes(t);
}

const PRAYER_NAME_KEYS = {
  fajr: "prayer.name.fajr",
  zukhr: "prayer.name.zukhr",
  asr: "prayer.name.asr",
  magrib: "prayer.name.magrib",
  isha: "prayer.name.isha",
  wajib: "prayer.name.witr",
} as const;

export function prayerName(p: PrayerName): string {
  return m[PRAYER_NAME_KEYS[p]]();
}

export function trackableName(t: TrackableName): string {
  if (t === FASTING) return m["fasting.name"]();
  if (isSafarName(t)) return `${prayerName(SAFAR_TO_BASE[t])} (${m["safar.badge"]()})`;
  return prayerName(t);
}
