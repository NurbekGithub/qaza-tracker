import { formatDateLabel } from "#/lib/date-utils";
import { EventLogRow, type PrayerEventEntity } from "#/components/event-log-row";

type EventLogDayProps = {
  dateMs: number;
  events: PrayerEventEntity[];
};

export function EventLogDay({ dateMs, events }: EventLogDayProps) {
  return (
    <section className="mt-4 first:mt-0">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-center text-sm font-medium text-primary">{formatDateLabel(dateMs)}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {events.map((event) => (
          <EventLogRow key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
