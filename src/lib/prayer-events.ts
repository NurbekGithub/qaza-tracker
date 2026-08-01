import { format } from "date-fns";

import { formatDate } from "#/lib/date-utils";
import { TRACKABLES, type TrackableName } from "#/lib/prayers";

export type PrayerEvent = {
  id: string;
  prayer: string;
  type: string;
  delta?: number | null;
  value?: number | null;
  at: number;
};

function compareEvents(a: PrayerEvent, b: PrayerEvent): number {
  if (a.at !== b.at) return a.at - b.at;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function deriveCount(events: PrayerEvent[], name: TrackableName): number {
  const ordered = events.filter((e) => e.prayer === name).sort(compareEvents);
  let count = 0;
  for (const event of ordered) {
    count = event.type === "set" ? (event.value ?? 0) : count + (event.delta ?? 0);
  }
  return Math.max(0, count);
}

export function deriveCounts(events: PrayerEvent[]): Record<TrackableName, number> {
  return Object.fromEntries(TRACKABLES.map((name) => [name, deriveCount(events, name)])) as Record<
    TrackableName,
    number
  >;
}

export function isDoneToday(
  events: PrayerEvent[],
  name: TrackableName,
  today = formatDate(),
): boolean {
  const latest = events
    .filter((e) => e.prayer === name && e.type !== "set" && format(e.at, "yyyy-MM-dd") === today)
    .sort(compareEvents)
    .at(-1);
  return latest !== undefined && (latest.delta ?? 0) < 0;
}
