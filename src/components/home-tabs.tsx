import type { TrackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { TabsContent } from "#/components/ui/tabs";
import { PrayerButton } from "#/components/prayer-button";
import { EventLog } from "#/components/event-log";
import type { PrayerEventEntity } from "#/components/event-log-row";

type TrackableInfo = {
  name: TrackableName;
  count: number;
  isDoneToday: boolean;
};

type HomeTabsProps = {
  isLoading: boolean;
  prayers: TrackableInfo[];
  fasting: TrackableInfo;
  events: PrayerEventEntity[];
  onTrackableClick: (name: TrackableName) => void;
};

export function HomeTabs({ isLoading, prayers, fasting, events, onTrackableClick }: HomeTabsProps) {
  return (
    <div className="flex flex-col gap-3">
      <TabsContent value="counts">
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {m["home.prayers_title"]()}
            </h2>
            <div className="flex flex-col gap-3">
              {prayers.map((p) => {
                if (isLoading) {
                  return <div key={p.name} className="h-10 w-full rounded-md bg-muted"></div>;
                }
                return (
                  <PrayerButton
                    key={p.name}
                    prayer={p.name}
                    count={p.count}
                    isDoneToday={p.isDoneToday}
                    onClick={onTrackableClick}
                  />
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {m["home.fasting_title"]()}
            </h2>
            {isLoading ? (
              <div className="h-10 w-full rounded-md bg-muted"></div>
            ) : (
              <PrayerButton
                prayer={fasting.name}
                count={fasting.count}
                isDoneToday={fasting.isDoneToday}
                onClick={onTrackableClick}
              />
            )}
          </section>
        </div>
      </TabsContent>

      <TabsContent value="log">
        <EventLog events={events} />
      </TabsContent>
    </div>
  );
}
