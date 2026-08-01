import { useEffect, useMemo, useState } from "react";
import { id } from "@instantdb/react";
import { usePostHog } from "@posthog/react";
import { toast } from "sonner";

import { db, transact } from "#/lib/db";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { QazaCalcDialog } from "#/components/qaza-calc-dialog";
import { type QazaCalcResult } from "#/components/qaza-result-step";
import { deriveCounts } from "#/lib/prayer-events";
import { FASTING, PRAYERS, TRACKABLES, trackableName, type TrackableName } from "#/lib/prayers";
import { m } from "#/paraglide/messages";

export function PrayerCountsForm() {
  const user = db.useUser();
  const posthog = usePostHog();
  const { isLoading, data } = db.useQuery({
    prayerEvents: { $: { where: { ownerId: user.id } } },
  });

  const [calcOpen, setCalcOpen] = useState(false);

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
    setValues(deriveCounts(data.prayerEvents));
  }, [data]);

  const counts = useMemo(() => deriveCounts(data?.prayerEvents ?? []), [data?.prayerEvents]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{m["state.loading"]()}</p>;
  }

  function hasPrayerCountChanged(p: TrackableName): boolean {
    return values[p] !== counts[p];
  }

  const hasChanges = TRACKABLES.some(hasPrayerCountChanged);

  function handleCalcApply(result: QazaCalcResult) {
    setValues((prev) => {
      const next = { ...prev };
      for (const p of PRAYERS) {
        next[p] = result.prayerCount;
      }
      if (result.fastingCount != null) {
        next[FASTING] = result.fastingCount;
      }
      return next;
    });
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const txs = TRACKABLES.filter(hasPrayerCountChanged).map((p) => {
      const value = values[p];
      posthog.capture("prayer_count_set", { prayer: p, value });
      return db.tx.prayerEvents[id()].create({
        prayer: p,
        type: "set",
        value,
        at: Date.now(),
        ownerId: user.id,
      });
    });
    transact(txs);
    toast.success(m["settings.saved_toast"]());
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {m["settings.prayer_counts"]()}
        </h2>
        <Button type="button" variant="outline" onClick={() => setCalcOpen(true)}>
          {m["qaza.calc_cta"]()}
        </Button>
      </div>
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
        <QazaCalcDialog open={calcOpen} onOpenChange={setCalcOpen} onApply={handleCalcApply} />
      </form>
    </>
  );
}
