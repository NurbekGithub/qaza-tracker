import { type TrackableName, trackableName } from "#/lib/prayers";
import { formatTime } from "#/lib/date-utils";

import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "#/instant.schema";

export type PrayerEventEntity = InstaQLEntity<AppSchema, "prayerEvents">;

type EventLogRowProps = {
  event: PrayerEventEntity;
};

export function EventLogRow({ event }: EventLogRowProps) {
  const isSet = event.type === "set";
  const delta = event.delta ?? 0;
  const value = event.value ?? 0;

  const valueText = isSet ? value : delta > 0 ? `+${delta}` : `${delta}`;
  const icon = isSet ? "≡" : delta >= 0 ? "▲" : "▼";
  const color = isSet ? "text-muted-foreground" : delta >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm">
      <span className="font-medium">{trackableName(event.prayer as TrackableName)}</span>
      <div className="flex items-center gap-3">
        <span className="tabular-nums font-semibold">{valueText}</span>
        <span className={`tabular-nums font-semibold ${color}`}>{icon}</span>
        <span className="text-muted-foreground tabular-nums">{formatTime(event.at)}</span>
      </div>
    </div>
  );
}
