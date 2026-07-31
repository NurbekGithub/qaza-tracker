import { format, parseISO } from "date-fns";

import { m } from "#/paraglide/messages";
import { EventLogDay } from "#/components/event-log-day";
import type { PrayerEventEntity } from "#/components/event-log-row";

type EventLogProps = {
  events: PrayerEventEntity[];
};

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{m["log.empty"]()}</p>;
  }

  const sorted = [...events].sort((a, b) => b.at - a.at);

  const groups = new Map<string, PrayerEventEntity[]>();
  for (const event of sorted) {
    const dateKey = format(event.at, "yyyy-MM-dd");
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
        const dateMs = parseISO(dateKey).getTime();
        return <EventLogDay key={dateKey} dateMs={dateMs} events={dayEvents} />;
      })}
    </div>
  );
}
