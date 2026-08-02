import { init } from "@instantdb/admin";

import { intlLocale, normalizeLocale, type Locale } from "./messages";

export type ReportEvent = {
  id: string;
  prayer: string;
  type: string;
  delta?: number | null;
  value?: number | null;
  at: number;
  ownerId: string;
};

export type EmailUser = {
  id: string;
  email?: string | null;
};

export type UserPref = {
  ownerId: string;
  locale?: string | null;
};

export type CountRow = {
  key: string;
  label: string;
  count: number;
};

export type WeeklyReport = {
  email: string;
  locale: Locale;
  periodLabel: string;
  lastUpdateLabel: string | null;
  prayersDoneThisWeek: number;
  fastsDoneThisWeek: number;
  prayers: CountRow[];
  fasting: CountRow;
  safar: CountRow[];
  totalRemaining: number;
  appUrl: string;
};

const MAIN_PRAYERS = [
  { key: "fajr", label: "prayer.name.fajr" },
  { key: "zukhr", label: "prayer.name.zukhr" },
  { key: "asr", label: "prayer.name.asr" },
  { key: "magrib", label: "prayer.name.magrib" },
  { key: "isha", label: "prayer.name.isha" },
  { key: "wajib", label: "prayer.name.witr" },
] as const;

const SAFAR_ROWS = [
  { key: "safar_fajr", label: "prayer.name.fajr" },
  { key: "safar_zukhr", label: "prayer.name.zukhr" },
  { key: "safar_asr", label: "prayer.name.asr" },
  { key: "safar_magrib", label: "prayer.name.magrib" },
  { key: "safar_isha", label: "prayer.name.isha" },
  { key: "safar_wajib", label: "prayer.name.witr" },
] as const;

const FASTING_KEY = "fasting";
const PAGE_SIZE = 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type AdminDb = ReturnType<typeof init>;

export function getAdminDb(): AdminDb {
  const appId = process.env.INSTANT_APP_ID ?? process.env.VITE_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId) throw new Error("INSTANT_APP_ID (or VITE_INSTANT_APP_ID) is not set");
  if (!adminToken) throw new Error("INSTANT_APP_ADMIN_TOKEN is not set");
  return init({ appId, adminToken });
}

async function queryAll<T>(
  db: AdminDb,
  namespace: string,
  where: Record<string, unknown> | undefined,
  fields: string[],
): Promise<T[]> {
  const rows: T[] = [];
  let offset = 0;
  for (;;) {
    const params = {
      [namespace]: { $: { ...(where ? { where } : {}), limit: PAGE_SIZE, offset, fields } },
    } as unknown as Parameters<AdminDb["query"]>[0];
    const result = (await db.query(params)) as Record<string, T[] | undefined>;
    const page = result[namespace] ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
    offset += PAGE_SIZE;
  }
}

export function listEmailUsers(db: AdminDb): Promise<EmailUser[]> {
  return queryAll<EmailUser>(db, "$users", { email: { $isNull: false } }, ["email"]);
}

export function listUserPrefs(db: AdminDb): Promise<UserPref[]> {
  return queryAll<UserPref>(db, "userPrefs", { locale: { $isNull: false } }, ["ownerId", "locale"]);
}

export function listAllEvents(db: AdminDb): Promise<ReportEvent[]> {
  return queryAll<ReportEvent>(db, "prayerEvents", undefined, [
    "prayer",
    "type",
    "delta",
    "value",
    "at",
    "ownerId",
  ]);
}

export async function findUserByEmail(db: AdminDb, email: string): Promise<EmailUser | null> {
  const users = await queryAll<EmailUser>(db, "$users", { email }, ["email"]);
  return users[0] ?? null;
}

export async function findUserPref(db: AdminDb, ownerId: string): Promise<UserPref | null> {
  const prefs = await queryAll<UserPref>(db, "userPrefs", { ownerId }, ["ownerId", "locale"]);
  return prefs[0] ?? null;
}

export async function findUserEvents(db: AdminDb, ownerId: string): Promise<ReportEvent[]> {
  return queryAll<ReportEvent>(db, "prayerEvents", { ownerId }, [
    "prayer",
    "type",
    "delta",
    "value",
    "at",
    "ownerId",
  ]);
}

function deriveCount(events: ReportEvent[], name: string): number {
  const ordered = events
    .filter((e) => e.prayer === name)
    .sort((a, b) => (a.at !== b.at ? a.at - b.at : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let count = 0;
  for (const event of ordered) {
    count = event.type === "set" ? (event.value ?? 0) : count + (event.delta ?? 0);
  }
  return Math.max(0, count);
}

function doneThisWeek(events: ReportEvent[], names: string[], weekStart: number): number {
  let done = 0;
  for (const event of events) {
    if (event.type === "set" || event.at < weekStart) continue;
    if (!names.includes(event.prayer)) continue;
    const delta = event.delta ?? 0;
    if (delta < 0) done += -delta;
  }
  return done;
}

export function formatPeriodLabel(weekStart: number, weekEnd: number, locale: Locale): string {
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), { month: "short", day: "numeric" });
  return `${fmt.format(new Date(weekStart))} – ${fmt.format(new Date(weekEnd))}`;
}

function lastUpdateLabel(events: ReportEvent[], locale: Locale): string | null {
  let last: number | null = null;
  for (const event of events) {
    if (last === null || event.at > last) last = event.at;
  }
  if (last === null) return null;
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), { month: "short", day: "numeric" });
  return fmt.format(new Date(last));
}

export function buildReport(
  email: string,
  events: ReportEvent[],
  now: number,
  appUrl: string,
  localeInput?: string | null,
): WeeklyReport {
  const locale = normalizeLocale(localeInput);
  const weekStart = now - WEEK_MS;
  const prayers = MAIN_PRAYERS.map(({ key, label }) => ({
    key,
    label,
    count: deriveCount(events, key),
  }));
  const fasting: CountRow = {
    key: FASTING_KEY,
    label: "fasting.name",
    count: deriveCount(events, FASTING_KEY),
  };
  const safar = SAFAR_ROWS.map(({ key, label }) => ({
    key,
    label,
    count: deriveCount(events, key),
  })).filter((row) => row.count > 0);
  const mainKeys = MAIN_PRAYERS.map((p) => p.key);
  const prayersDoneThisWeek = doneThisWeek(
    events,
    [...mainKeys, ...SAFAR_ROWS.map((s) => s.key)],
    weekStart,
  );
  const fastsDoneThisWeek = doneThisWeek(events, [FASTING_KEY], weekStart);
  const totalRemaining =
    prayers.reduce((sum, row) => sum + row.count, 0) +
    fasting.count +
    safar.reduce((sum, row) => sum + row.count, 0);
  return {
    email,
    locale,
    periodLabel: formatPeriodLabel(weekStart, now, locale),
    lastUpdateLabel: lastUpdateLabel(events, locale),
    prayersDoneThisWeek,
    fastsDoneThisWeek,
    prayers,
    fasting,
    safar,
    totalRemaining,
    appUrl,
  };
}

export function demoReport(
  email: string,
  now: number,
  appUrl: string,
  localeInput?: string | null,
): WeeklyReport {
  const locale = normalizeLocale(localeInput);
  const prayers = MAIN_PRAYERS.map(({ key, label }, i) => ({
    key,
    label,
    count: [618, 742, 690, 551, 804, 633][i] ?? 0,
  }));
  const safar = [
    { key: "safar_zukhr", label: "prayer.name.zukhr", count: 12 },
    { key: "safar_asr", label: "prayer.name.asr", count: 9 },
  ];
  return {
    email,
    locale,
    periodLabel: formatPeriodLabel(now - WEEK_MS, now, locale),
    lastUpdateLabel: new Intl.DateTimeFormat(intlLocale(locale), {
      month: "short",
      day: "numeric",
    }).format(new Date(now - 30 * 60 * 60 * 1000)),
    prayersDoneThisWeek: 11,
    fastsDoneThisWeek: 2,
    prayers,
    fasting: { key: FASTING_KEY, label: "fasting.name", count: 23 },
    safar,
    totalRemaining: prayers.reduce((sum, row) => sum + row.count, 0) + 23 + 21,
    appUrl,
  };
}
