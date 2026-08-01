import { m } from "#/paraglide/messages";

export const PRAYERS = ["fajr", "zukhr", "asr", "magrib", "isha", "wajib"] as const;
export const FASTING = "fasting";

export type PrayerName = (typeof PRAYERS)[number];
export type FastingName = typeof FASTING;
export type TrackableName = PrayerName | FastingName;

export const TRACKABLES: TrackableName[] = [...PRAYERS, FASTING];

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
  return t === FASTING ? m["fasting.name"]() : prayerName(t);
}
