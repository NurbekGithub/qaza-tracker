import type { AppSchema } from "#/instant.schema";
import type { InstaQLEntity } from "@instantdb/react";

import { m } from "#/paraglide/messages";

export const PRAYERS = ["fajr", "zukhr", "asr", "magrib", "isha", "wajib"] as const;

export type PrayerName = (typeof PRAYERS)[number];
export type PrayerEntity = InstaQLEntity<AppSchema, "prayers">;

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

export function getPrayer(prayers: PrayerEntity[] | undefined, p: PrayerName) {
  return (prayers ?? []).find((r) => r.name === p);
}
