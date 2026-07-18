import { useEffect, useState } from "react";
import { id } from "@instantdb/react";
import { usePostHog } from "@posthog/react";
import { toast } from "sonner";

import { db, transact } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { FASTING, getPrayer, PRAYERS, trackableName, type TrackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";

const TRACKABLES: TrackableName[] = [...PRAYERS, FASTING];

export function PrayerCountsForm() {
  const user = db.useUser();
  const posthog = usePostHog();
  const { isLoading, data } = db.useQuery({
    prayers: { $: { where: { ownerId: user.id } } },
  });

  // local form values
  // needed before submit client values
  const [values, setValues] = useState<Record<TrackableName, number>>(() =>
    TRACKABLES.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<TrackableName, number>),
  );

  // set default values for form
  // from instantdb server
  // needed to update client values after submit
  useEffect(() => {
    if (!data) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const p of data.prayers) {
        next[p.name as TrackableName] = p.count;
      }
      return next;
    });
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{m["state.loading"]()}</p>;
  }

  function serverCount(p: TrackableName): number {
    return getPrayer(data?.prayers, p)?.count ?? 0;
  }

  function hasPrayerCountChanged(p: TrackableName): boolean {
    return values[p] !== serverCount(p);
  }

  const hasChanges = TRACKABLES.some(hasPrayerCountChanged);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const txs = TRACKABLES.filter(hasPrayerCountChanged).flatMap((p) => {
      const value = values[p];
      posthog.capture("prayer_count_set", { prayer: p, value });
      return [
        db.tx.prayers[getPrayer(data?.prayers, p)?.id ?? id()].update({
          name: p,
          count: value,
          ownerId: user.id,
        }),
        db.tx.prayerEvents[id()].create({
          prayer: p,
          type: "set",
          value,
          at: Date.now(),
          ownerId: user.id,
        }),
      ];
    });
    transact(txs);
    toast.success(m["settings.saved_toast"]());
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {TRACKABLES.map((p) => (
        <div key={p} className="flex items-center justify-between gap-3">
          <label htmlFor={`trackable-${p}`} className="text-base font-medium">
            {trackableName(p)}
          </label>
          <Input
            id={`trackable-${p}`}
            type="number"
            min={0}
            inputMode="numeric"
            className="w-24 text-right tabular-nums"
            value={values[p]}
            onChange={(e) => setValues((v) => ({ ...v, [p]: Number(e.target.value) }))}
          />
        </div>
      ))}
      <Button type="submit" className="mt-2" disabled={!hasChanges}>
        {m["settings.save"]()}
      </Button>
    </form>
  );
}
