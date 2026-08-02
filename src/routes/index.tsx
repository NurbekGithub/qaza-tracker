import { createFileRoute, Link } from "@tanstack/react-router";
import { usePostHog } from "@posthog/react";
import { id } from "@instantdb/react";
import { useMemo, useState } from "react";

import { db, transact } from "#/lib/db";
import { formatDate } from "#/lib/date-utils";
import { deriveCounts, isDoneToday } from "#/lib/prayer-events";
import { FASTING, PRAYERS, SAFAR_PRAYERS, TRACKABLES, type TrackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { Layout } from "#/components/layout";
import { PrayerDialog } from "#/components/prayer-dialog";
import { HomeTabs } from "#/components/home-tabs";
import { HomeTabsNav } from "#/components/home-tabs-nav";
import { Tabs } from "#/components/ui/tabs";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const user = db.useUser();
  const posthog = usePostHog();
  const { isLoading, data } = db.useQuery({
    prayerEvents: { $: { where: { ownerId: user.id } } },
  });
  const [selected, setSelected] = useState<TrackableName | null>(null);
  const [tab, setTab] = useState("counts");

  const today = formatDate();
  const events = useMemo(() => data?.prayerEvents ?? [], [data?.prayerEvents]);
  const counts = useMemo(() => deriveCounts(events), [events]);
  const doneToday = useMemo(
    () =>
      Object.fromEntries(TRACKABLES.map((p) => [p, isDoneToday(events, p, today)])) as Record<
        TrackableName,
        boolean
      >,
    [events, today],
  );

  function prayerInfo(p: TrackableName) {
    return {
      name: p,
      count: counts[p],
      isDoneToday: doneToday[p],
    };
  }

  function increase(p: TrackableName) {
    posthog.capture("prayer_count_increased", {
      prayer: p,
      new_count: counts[p] + 1,
    });
    transact([
      db.tx.prayerEvents[id()].create({
        prayer: p,
        type: "adjust",
        delta: 1,
        at: Date.now(),
        ownerId: user.id,
      }),
    ]);
  }

  function decrease(p: TrackableName) {
    if (counts[p] <= 0) return;
    posthog.capture("prayer_count_decreased", {
      prayer: p,
      new_count: counts[p] - 1,
    });
    transact([
      db.tx.prayerEvents[id()].create({
        prayer: p,
        type: "adjust",
        delta: -1,
        at: Date.now(),
        ownerId: user.id,
      }),
    ]);
  }

  function openDialog(p: TrackableName) {
    setSelected(p);
    posthog.capture("prayer_dialog_opened", { prayer: p });
  }

  const hasNoRows = !isLoading && events.length === 0;
  const prayerRows = PRAYERS.map((p) => prayerInfo(p));
  const fastingRow = prayerInfo(FASTING);
  const safarRows = SAFAR_PRAYERS.map((p) => prayerInfo(p));

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <Layout title="Qaza tracker" showSettings footer={<HomeTabsNav />}>
        {hasNoRows && tab !== "feedback" && (
          <p className="mb-3 text-sm text-muted-foreground">
            <Link to="/settings" className="underline underline-offset-4 hover:text-foreground">
              {m["home.set_counts_cta"]()}
            </Link>
          </p>
        )}

        <HomeTabs
          isLoading={isLoading}
          prayers={prayerRows}
          safar={safarRows}
          fasting={fastingRow}
          events={events}
          onTrackableClick={openDialog}
        />

        <PrayerDialog
          prayer={selected}
          count={selected ? counts[selected] : 0}
          open={selected !== null}
          onOpenChange={(open) => !open && setSelected(null)}
          onIncrease={increase}
          onDecrease={decrease}
        />
      </Layout>
    </Tabs>
  );
}
