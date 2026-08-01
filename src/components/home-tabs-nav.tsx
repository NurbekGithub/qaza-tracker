import { ClipboardList, ListChecks, MessageSquare } from "lucide-react";

import { m } from "#/paraglide/messages";
import { TabsList, TabsTrigger } from "#/components/ui/tabs";

export function HomeTabsNav() {
  return (
    <TabsList className="flex h-full! w-full justify-around gap-2 rounded-none bg-transparent p-1.5 text-lg">
      <TabsTrigger
        value="counts"
        className="flex-2 gap-2 rounded-lg py-2.5 data-active:bg-white data-active:text-primary data-active:shadow-lg"
      >
        <ListChecks className="size-6" />
        {m["tab.counts"]()}
      </TabsTrigger>
      <TabsTrigger
        value="log"
        className="flex-2 gap-2 rounded-lg py-2.5 data-active:bg-white data-active:text-primary data-active:shadow-lg"
      >
        <ClipboardList className="size-6" />
        {m["tab.log"]()}
      </TabsTrigger>
      <TabsTrigger
        value="feedback"
        aria-label={m["tab.feedback"]()}
        className="flex-1 gap-2 rounded-lg py-2.5 data-active:bg-white data-active:text-primary data-active:shadow-lg"
      >
        <MessageSquare className="size-6" />
      </TabsTrigger>
    </TabsList>
  );
}
