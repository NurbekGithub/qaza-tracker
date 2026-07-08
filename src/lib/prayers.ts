import type { AppSchema } from "#/instant.schema";
import type { InstaQLEntity } from "@instantdb/react";

export const PRAYERS = ["fajr", "zukhr", "asr", "magrib", "isha", "wajib"] as const;

export type PrayerName = (typeof PRAYERS)[number];
export type PrayerEntity = InstaQLEntity<AppSchema, "prayers">;

export function getPrayer(prayers: PrayerEntity[] | undefined, p: PrayerName) {
  return (prayers ?? []).find((r) => r.name === p);
}
