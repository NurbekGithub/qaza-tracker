import { type PrayerName, prayerName } from "#/lib/prayers";
import { formatTime } from "#/lib/date-utils";

import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "#/instant.schema";

export type PrayerEventEntity = InstaQLEntity<AppSchema, "prayerEvents">;

type EventLogRowProps = {
  event: PrayerEventEntity;
};

export function EventLogRow({ event }: EventLogRowProps) {
  const delta = event.delta ?? 0;
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
  const deltaColor = delta >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm">
      <span className="font-medium">{prayerName(event.prayer as PrayerName)}</span>
      <div className="flex items-center gap-3">
        <span className="tabular-nums font-semibold">{deltaText}</span>
        <span className={`tabular-nums font-semibold ${deltaColor}`}>{delta >= 0 ? "▲" : "▼"}</span>
        <span className="text-muted-foreground tabular-nums">{formatTime(event.at)}</span>
      </div>
    </div>
  );
}
