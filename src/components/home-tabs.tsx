import type { PrayerName } from "#/lib/prayers";
import { TabsContent } from "#/components/ui/tabs";
import { PrayerButton } from "#/components/prayer-button";
import { EventLog } from "#/components/event-log";
import type { PrayerEventEntity } from "#/components/event-log-row";

type PrayerInfo = {
  name: PrayerName;
  count: number;
  isDoneToday: boolean;
};

type HomeTabsProps = {
  isLoading: boolean;
  prayers: PrayerInfo[];
  events: PrayerEventEntity[];
  onPrayerClick: (prayer: PrayerName) => void;
};

export function HomeTabs({ isLoading, prayers, events, onPrayerClick }: HomeTabsProps) {
  return (
    <div className="flex flex-col gap-3">
      <TabsContent value="counts">
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
                onClick={onPrayerClick}
              />
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="log">
        <EventLog events={events} />
      </TabsContent>
    </div>
  );
}
