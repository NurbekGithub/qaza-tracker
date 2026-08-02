import {
  buildReport,
  demoReport,
  findUserByEmail,
  findUserEvents,
  findUserPref,
  getAdminDb,
  listAllEvents,
  listEmailUsers,
  listUserPrefs,
  type EmailUser,
  type WeeklyReport,
} from "./report";
import { sendEmail } from "./send";
import { renderWeeklyReportEmail } from "./template";

export const DEFAULT_APP_URL = "https://simple-qaza-tracker.vercel.app";

export type RunOptions = {
  onlyEmail?: string;
  dryRun?: boolean;
  appUrl?: string;
  now?: number;
};

export type RunSummary = {
  total: number;
  sent: string[];
  skipped: string[];
  failed: { email: string; error: string }[];
};

async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = Array.from({ length: items.length }) as R[];
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
  return results;
}

function shouldSkip(report: WeeklyReport): boolean {
  return (
    report.totalRemaining === 0 &&
    report.prayersDoneThisWeek === 0 &&
    report.fastsDoneThisWeek === 0
  );
}

export async function reportForEmail(
  email: string,
  appUrl = process.env.APP_URL ?? DEFAULT_APP_URL,
  now = Date.now(),
  localeOverride?: string,
): Promise<{ report: WeeklyReport; demo: boolean }> {
  const db = getAdminDb();
  const user = await findUserByEmail(db, email);
  if (!user) {
    return { report: demoReport(email, now, appUrl, localeOverride), demo: true };
  }
  const pref = await findUserPref(db, user.id);
  const events = await findUserEvents(db, user.id);
  return {
    report: buildReport(email, events, now, appUrl, localeOverride ?? pref?.locale),
    demo: false,
  };
}

export async function runWeeklyReports(options: RunOptions = {}): Promise<RunSummary> {
  const appUrl = options.appUrl ?? process.env.APP_URL ?? DEFAULT_APP_URL;
  const now = Date.now();
  const db = getAdminDb();

  let users = await listEmailUsers(db);
  if (options.onlyEmail) {
    const target = options.onlyEmail.toLowerCase();
    users = users.filter((user) => user.email?.toLowerCase() === target);
  }

  const [events, prefs] =
    users.length > 0 ? await Promise.all([listAllEvents(db), listUserPrefs(db)]) : [[], []];
  const eventsByOwner = new Map<string, typeof events>();
  for (const event of events) {
    const bucket = eventsByOwner.get(event.ownerId);
    if (bucket) bucket.push(event);
    else eventsByOwner.set(event.ownerId, [event]);
  }
  const localeByOwner = new Map(prefs.map((pref) => [pref.ownerId, pref.locale]));

  const summary: RunSummary = { total: users.length, sent: [], skipped: [], failed: [] };

  await mapPool(users, 3, async (user: EmailUser) => {
    const email = user.email;
    if (!email) return;
    try {
      const report = buildReport(
        email,
        eventsByOwner.get(user.id) ?? [],
        now,
        appUrl,
        localeByOwner.get(user.id),
      );
      if (!options.onlyEmail && shouldSkip(report)) {
        summary.skipped.push(email);
        return;
      }
      const payload = renderWeeklyReportEmail(report);
      if (!options.dryRun) {
        await sendEmail(email, payload);
      }
      summary.sent.push(email);
    } catch (error) {
      summary.failed.push({
        email,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return summary;
}
