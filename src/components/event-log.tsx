import dayjs from "dayjs";

import { EventLogDay } from "#/components/event-log-day";
import type { PrayerEventEntity } from "#/components/event-log-row";

type EventLogProps = {
  events: PrayerEventEntity[];
};

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No events yet. Adjust a prayer count to start logging.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => b.at - a.at);

  const groups = new Map<string, PrayerEventEntity[]>();
  for (const event of sorted) {
    const dateKey = dayjs(event.at).format("YYYY-MM-DD");
    const list = groups.get(dateKey);
    if (list) {
      list.push(event);
    } else {
      groups.set(dateKey, [event]);
    }
  }

  return (
    <div className="flex flex-col">
      {[...groups.entries()].map(([dateKey, dayEvents]) => {
        const dateMs = dayjs(dateKey).valueOf();
        return <EventLogDay key={dateKey} dateMs={dateMs} events={dayEvents} />;
      })}
    </div>
  );
}
