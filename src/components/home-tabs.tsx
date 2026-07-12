import { ClipboardList, ListChecks } from "lucide-react";

import type { PrayerName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
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
    <Tabs defaultValue="counts" className="flex-col">
      <div className="flex flex-col gap-3 pb-20">
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

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background h-12">
        <TabsList className="mx-auto flex h-full! w-full max-w-2xl justify-around gap-2 rounded-none bg-transparent p-1.5 text-lg">
          <TabsTrigger
            value="counts"
            className="gap-2 rounded-lg py-2.5 data-active:bg-white data-active:text-primary data-active:shadow-lg"
          >
            <ListChecks className="size-6" />
            {m["tab.counts"]()}
          </TabsTrigger>
          <TabsTrigger
            value="log"
            className="gap-2 rounded-lg py-2.5 data-active:bg-white data-active:text-primary data-active:shadow-lg"
          >
            <ClipboardList className="size-6" />
            {m["tab.log"]()}
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
