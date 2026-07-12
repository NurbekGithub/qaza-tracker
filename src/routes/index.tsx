import { createFileRoute, Link } from "@tanstack/react-router";
import { usePostHog } from "@posthog/react";
import { id } from "@instantdb/react";
import { useState } from "react";

import { db, transact } from "#/lib/db";
import { formatDate } from "#/lib/date-utils";
import { PRAYERS, type PrayerName, getPrayer } from "#/lib/prayers";
import { m } from "#/paraglide/messages";
import { Layout } from "#/components/layout";
import { PrayerDialog } from "#/components/prayer-dialog";
import { HomeTabs } from "#/components/home-tabs";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const user = db.useUser();
  const posthog = usePostHog();
  const { isLoading, data } = db.useQuery({
    prayers: { $: { where: { ownerId: user.id } } },
    prayerEvents: { $: { where: { ownerId: user.id } } },
  });
  const [selected, setSelected] = useState<PrayerName | null>(null);

  const today = formatDate();

  function prayerInfo(p: PrayerName) {
    const prayer = getPrayer(data?.prayers, p);
    return {
      name: prayer?.name,
      count: prayer?.count ?? 0,
      isDoneToday: prayer?.doneDate === today,
    };
  }

  function increase(p: PrayerName) {
    const newCount = prayerInfo(p).count + 1;
    posthog.capture("prayer_count_increased", {
      prayer: p,
      new_count: newCount,
    });
    transact([
      db.tx.prayers[getPrayer(data?.prayers, p)?.id ?? id()].update({
        name: p,
        count: newCount,
        ownerId: user.id,
      }),
      db.tx.prayerEvents[id()].create({
        prayer: p,
        type: "adjust",
        delta: 1,
        at: Date.now(),
        ownerId: user.id,
      }),
    ]);
  }

  function decrease(p: PrayerName) {
    const { count } = prayerInfo(p);
    if (count <= 0) return;
    const newCount = count - 1;
    posthog.capture("prayer_count_decreased", {
      prayer: p,
      new_count: newCount,
    });
    transact([
      db.tx.prayers[getPrayer(data?.prayers, p)?.id ?? id()].update({
        name: p,
        count: newCount,
        doneDate: today,
        ownerId: user.id,
      }),
      db.tx.prayerEvents[id()].create({
        prayer: p,
        type: "adjust",
        delta: -1,
        at: Date.now(),
        ownerId: user.id,
      }),
    ]);
  }

  function openDialog(p: PrayerName) {
    setSelected(p);
    posthog.capture("prayer_dialog_opened", { prayer: p });
  }

  const hasNoRows = !isLoading && (data?.prayers ?? []).length === 0;
  const prayerRows = PRAYERS.map(
    (p) => prayerInfo(p) as { name: PrayerName; count: number; isDoneToday: boolean },
  );
  const events = data?.prayerEvents ?? [];

  return (
    <Layout title={m["app.title"]()} showSettings>
      {hasNoRows && (
        <p className="mb-3 text-sm text-muted-foreground">
          <Link to="/settings" className="underline underline-offset-4 hover:text-foreground">
            {m["home.set_counts_cta"]()}
          </Link>
        </p>
      )}

      <HomeTabs
        isLoading={isLoading}
        prayers={prayerRows}
        events={events}
        onPrayerClick={openDialog}
      />

      <PrayerDialog
        prayer={selected}
        count={selected ? (prayerInfo(selected)?.count ?? 0) : 0}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        onIncrease={increase}
        onDecrease={decrease}
      />
    </Layout>
  );
}
